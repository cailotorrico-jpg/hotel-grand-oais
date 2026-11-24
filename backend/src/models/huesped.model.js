// ============================================================
// Modelo: Huespedes
// Tabla SQL: dbo.Huespedes
// Columnas: id_huesped, nombre, apellido, documento_identidad,
//           tipo_documento, telefono, email, direccion, pais,
//           fecha_registro, estado
// ============================================================

const { getConnection, sql } = require('../config/db');

async function getAll() {
  const pool = await getConnection();
  const result = await pool.request().query(
    'SELECT * FROM Huespedes ORDER BY id_huesped DESC'
  );
  return result.recordset;
}

async function getById(id) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query('SELECT * FROM Huespedes WHERE id_huesped = @id');
  return result.recordset[0];
}

async function create(data) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('nombre', sql.NVarChar(100), data.nombre)
    .input('apellido', sql.NVarChar(100), data.apellido)
    .input('documento_identidad', sql.VarChar(30), data.documento_identidad)
    .input('tipo_documento', sql.VarChar(20), data.tipo_documento || 'Cédula')
    .input('telefono', sql.VarChar(20), data.telefono || null)
    .input('email', sql.VarChar(150), data.email || null)
    .input('direccion', sql.NVarChar(300), data.direccion || null)
    .input('pais', sql.NVarChar(80), data.pais || null)
    .query(`
      INSERT INTO Huespedes (nombre, apellido, documento_identidad, tipo_documento,
        telefono, email, direccion, pais)
      OUTPUT INSERTED.*
      VALUES (@nombre, @apellido, @documento_identidad, @tipo_documento,
        @telefono, @email, @direccion, @pais)
    `);
  return result.recordset[0];
}

async function update(id, data) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('nombre', sql.NVarChar(100), data.nombre)
    .input('apellido', sql.NVarChar(100), data.apellido)
    .input('documento_identidad', sql.VarChar(30), data.documento_identidad)
    .input('tipo_documento', sql.VarChar(20), data.tipo_documento)
    .input('telefono', sql.VarChar(20), data.telefono || null)
    .input('email', sql.VarChar(150), data.email || null)
    .input('direccion', sql.NVarChar(300), data.direccion || null)
    .input('pais', sql.NVarChar(80), data.pais || null)
    .query(`
      UPDATE Huespedes SET
        nombre = @nombre, apellido = @apellido,
        documento_identidad = @documento_identidad, tipo_documento = @tipo_documento,
        telefono = @telefono, email = @email, direccion = @direccion, pais = @pais
      WHERE id_huesped = @id;
      SELECT * FROM Huespedes WHERE id_huesped = @id;
    `);
  return result.recordset[0];
}

async function remove(id) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query('DELETE FROM Huespedes WHERE id_huesped = @id');
  return result.rowsAffected[0];
}

async function search(term) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('term', sql.VarChar(100), `%${term}%`)
    .query(`
      SELECT * FROM Huespedes
      WHERE nombre LIKE @term
        OR apellido LIKE @term
        OR documento_identidad LIKE @term
        OR email LIKE @term
      ORDER BY id_huesped DESC
    `);
  return result.recordset;
}

module.exports = { getAll, getById, create, update, delete: remove, search };
