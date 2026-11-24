// ============================================================
// Modelo: Bitacora  -  Tabla: dbo.Bitacora
// ============================================================
const { getConnection, sql } = require('../config/db');

async function getAll(filters) {
  const pool = await getConnection();
  let query = 'SELECT * FROM Bitacora WHERE 1=1';
  const request = pool.request();

  if (filters && filters.tabla) {
    query += ' AND tabla_afectada = @tabla';
    request.input('tabla', sql.VarChar(80), filters.tabla);
  }
  if (filters && filters.accion) {
    query += ' AND accion = @accion';
    request.input('accion', sql.VarChar(10), filters.accion);
  }
  query += ' ORDER BY fecha DESC';

  const result = await request.query(query);
  return result.recordset;
}

async function getByTabla(tabla) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('tabla', sql.VarChar(80), tabla)
    .query('SELECT * FROM Bitacora WHERE tabla_afectada = @tabla ORDER BY fecha DESC');
  return result.recordset;
}

async function create(data) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('tabla_afectada', sql.VarChar(80), data.tabla_afectada)
    .input('accion', sql.VarChar(10), data.accion)
    .input('id_referencia', sql.Int, data.id_referencia || null)
    .input('descripcion', sql.NVarChar(1000), data.descripcion || null)
    .input('usuario', sql.NVarChar(100), data.usuario || 'Sistema')
    .query(`
      INSERT INTO Bitacora (tabla_afectada, accion, id_referencia, descripcion, usuario)
      OUTPUT INSERTED.*
      VALUES (@tabla_afectada, @accion, @id_referencia, @descripcion, @usuario)
    `);
  return result.recordset[0];
}

module.exports = { getAll, getByTabla, create };
