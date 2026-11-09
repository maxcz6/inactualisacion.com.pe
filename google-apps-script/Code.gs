const SHEETS = {
  eventos: ["id", "codigo_base", "nombre", "descripcion", "fecha_inicio", "fecha_fin", "created_at"],
  participantes: ["id", "evento_id", "dni", "nombre", "condicion", "codigo", "verificado", "created_at"],
  perfiles: ["id", "email", "nombre", "rol", "activo", "created_at", "updated_at"],
  credenciales: ["id", "email", "password_hash", "password_salt", "created_at", "updated_at"],
  logs: ["id", "usuario_email", "accion", "detalle", "created_at"],
};

function setupSheets() {
  const spreadsheet = getSpreadsheet_();
  Object.keys(SHEETS).forEach(function (name) {
    getSheet_(spreadsheet, name);
  });
}

function doPost(event) {
  try {
    const body = JSON.parse(event.postData.contents);
    const configuredSecret = PropertiesService.getScriptProperties().getProperty("API_SECRET");
    if (!configuredSecret || body.secret !== configuredSecret) {
      throw new Error("No autorizado");
    }

    setupSheets();
    const result = dispatch_(body);
    return jsonOutput_({ success: true, data: result });
  } catch (error) {
    return jsonOutput_({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

function dispatch_(request) {
  const table = request.table;
  if (!Object.prototype.hasOwnProperty.call(SHEETS, table)) {
    throw new Error("Tabla no permitida");
  }

  switch (request.action) {
    case "list":
      return list_(table, request);
    case "insert":
      return insert_(table, request.data);
    case "insertMany":
      return insertMany_(table, request.data);
    case "update":
      return update_(table, request.where, request.data);
    case "delete":
      return delete_(table, request.where);
    case "deleteMany":
      return deleteMany_(table, request.ids);
    default:
      throw new Error("Acción no permitida");
  }
}

function list_(table, request) {
  const rows = readRows_(table);
  const filters = request.filters || {};
  const contains = request.contains || {};
  const filtered = rows.filter(function (row) {
    return Object.keys(filters).every(function (key) {
      return String(row[key] ?? "") === String(filters[key] ?? "");
    }) && Object.keys(contains).every(function (key) {
      return String(row[key] ?? "").toLowerCase().includes(String(contains[key]).toLowerCase());
    });
  });

  if (request.orderBy) {
    const key = request.orderBy;
    const direction = request.descending ? -1 : 1;
    filtered.sort(function (a, b) {
      return String(a[key] ?? "").localeCompare(String(b[key] ?? "")) * direction;
    });
  }

  const offset = Math.max(0, Number(request.offset) || 0);
  const limit = request.limit == null ? filtered.length : Math.max(0, Number(request.limit));
  return { rows: filtered.slice(offset, offset + limit), total: filtered.length };
}

function insert_(table, data) {
  return insertMany_(table, [data])[0];
}

function insertMany_(table, data) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Se requiere al menos un registro");
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const rows = readRows_(table);
    const header = SHEETS[table];
    const eventIds = table === "participantes"
      ? new Set(readRows_("eventos").map(function (row) { return String(row.id); }))
      : null;
    const values = data.map(function (input) {
      const now = new Date().toISOString();
      const row = Object.assign({}, input);
      if (!row.id) row.id = Utilities.getUuid();
      if (!row.created_at && header.includes("created_at")) row.created_at = now;
      if (header.includes("updated_at") && !row.updated_at) row.updated_at = now;
      if (table === "participantes" && row.verificado == null) row.verificado = false;
      if (eventIds && row.evento_id && !eventIds.has(String(row.evento_id))) {
        throw new Error("El evento asociado no existe");
      }
      assertUnique_(table, row, rows);
      rows.push(row);
      return header.map(function (key) { return row[key] == null ? "" : row[key]; });
    });

    const sheet = getSpreadsheet_().getSheetByName(table);
    sheet.getRange(sheet.getLastRow() + 1, 1, values.length, header.length)
      .setValues(values.map(function (row) { return row.map(safeCellValue_); }));
    return data.map(function (_, index) { return rows[rows.length - data.length + index]; });
  } finally {
    lock.releaseLock();
  }
}

function update_(table, where, data) {
  if (!where || !where.id || !data || typeof data !== "object") {
    throw new Error("Se requiere id y datos para actualizar");
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const sheet = getSpreadsheet_().getSheetByName(table);
    const rows = readRows_(table);
    const index = rows.findIndex(function (row) { return String(row.id) === String(where.id); });
    if (index < 0) return null;

    const updated = Object.assign({}, rows[index], data, { id: rows[index].id });
    if (SHEETS[table].includes("updated_at")) updated.updated_at = new Date().toISOString();
    if (
      table === "participantes" &&
      updated.evento_id &&
      !readRows_("eventos").some(function (row) { return String(row.id) === String(updated.evento_id); })
    ) {
      throw new Error("El evento asociado no existe");
    }
    assertUnique_(table, updated, rows, String(rows[index].id));
    sheet.getRange(index + 2, 1, 1, SHEETS[table].length)
      .setValues([SHEETS[table].map(function (key) { return safeCellValue_(updated[key] == null ? "" : updated[key]); })]);
    return updated;
  } finally {
    lock.releaseLock();
  }
}

function delete_(table, where) {
  if (!where || !where.id) throw new Error("Se requiere id para eliminar");
  return deleteMany_(table, [where.id]);
}

function deleteMany_(table, ids) {
  if (!Array.isArray(ids)) throw new Error("Se requiere una lista de ids");
  const wanted = new Set(ids.map(String));
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const sheet = getSpreadsheet_().getSheetByName(table);
    const rows = readRows_(table);
    if (
      table === "eventos" &&
      readRows_("participantes").some(function (row) { return wanted.has(String(row.evento_id)); })
    ) {
      throw new Error("No se puede eliminar un evento que tiene participantes asociados");
    }
    const indexes = [];
    rows.forEach(function (row, index) {
      if (wanted.has(String(row.id))) indexes.push(index + 2);
    });
    indexes.sort(function (a, b) { return b - a; }).forEach(function (rowIndex) {
      sheet.deleteRow(rowIndex);
    });
    return { deleted: indexes.length };
  } finally {
    lock.releaseLock();
  }
}

function assertUnique_(table, candidate, rows, ignoredId) {
  const uniqueFields = {
    eventos: ["codigo_base"],
    participantes: ["codigo"],
    perfiles: ["email"],
    credenciales: ["email"],
  }[table] || [];
  uniqueFields.forEach(function (field) {
    if (candidate[field] == null || candidate[field] === "") return;
    const duplicate = rows.some(function (row) {
      return String(row.id) !== String(ignoredId || "") &&
        String(row[field]).toLowerCase() === String(candidate[field]).toLowerCase();
    });
    if (duplicate) throw new Error("El valor de " + field + " ya está registrado");
  });
}

function readRows_(table) {
  const sheet = getSpreadsheet_().getSheetByName(table);
  const values = sheet.getDataRange().getValues();
  const header = SHEETS[table];
  return values.slice(1).filter(function (valuesRow) {
    return valuesRow.some(function (value) { return value !== ""; });
  }).map(function (valuesRow) {
    const row = {};
    header.forEach(function (key, index) {
      const value = valuesRow[index];
      row[key] = value instanceof Date
        ? (key.indexOf("fecha_") === 0
          ? Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd")
          : value.toISOString())
        : value;
    });
    return row;
  });
}

function getSheet_(spreadsheet, name) {
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = spreadsheet.insertSheet(name);
  const header = SHEETS[name];
  const current = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), header.length)).getValues()[0];
  const hasHeader = current.some(function (value) { return value !== ""; });
  if (!hasHeader) {
    sheet.getRange(1, 1, 1, header.length).setValues([header]);
    sheet.setFrozenRows(1);
  } else if (
    current.length !== header.length ||
    header.some(function (value, index) { return current[index] !== value; })
  ) {
    throw new Error("Encabezados incorrectos en la pestaña " + name);
  }
  return sheet;
}

function getSpreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (!id) throw new Error("Falta configurar SPREADSHEET_ID en propiedades del script");
  return SpreadsheetApp.openById(id);
}

function safeCellValue_(value) {
  if (typeof value === "string" && /^[=+\-@\t\r]/.test(value)) return "'" + value;
  return value;
}

function jsonOutput_(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
