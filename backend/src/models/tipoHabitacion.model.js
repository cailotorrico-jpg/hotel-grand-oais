// ============================================================
// Modelo: TiposHabitacion
// Tabla SQL: dbo.TiposHabitacion
// Columnas: id_tipo, nombre, descripcion, precio_por_noche,
//           capacidad_maxima, estado
// ============================================================

const { getConnection, sql } = require('../config/db');

async function getAll() {
  const pool = await getConnection();
  const result = await pool.request().query(
    'SELECT * FROM TiposHabitacion ORDER BY id_tipo'
  );
  return result.recordset;
}

async function getById(id) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query('SELECT * FROM TiposHabitacion WHERE id_tipo = @id');
  return result.recordset[0];
}

async function create(data) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('nombre', sql.NVarChar(80), data.nombre)
    .input('descripcion', sql.NVarChar(500), data.descripcion || null)
    .input('precio_por_noche', sql.Decimal(10, 2), data.precio_por_noche)
    .input('capacidad_maxima', sql.Int, data.capacidad_maxima)
    .input('estado', sql.VarChar(20), data.estado || 'Activo')
    .query(`
      INSERT INTO TiposHabitacion (nombre, descripcion, precio_por_noche, capacidad_maxima, estado)
      OUTPUT INSERTED.*
      VALUES (@nombre, @descripcion, @precio_por_noche, @capacidad_maxima, @estado)
    `);
  return result.recordset[0];
}

async function update(id, data) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('nombre', sql.NVarChar(80), data.nombre)
    .input('descripcion', sql.NVarChar(500), data.descripcion || null)
    .input('precio_por_noche', sql.Decimal(10, 2), data.precio_por_noche)
    .input('capacidad_maxima', sql.Int, data.capacidad_maxima)
    .input('estado', sql.VarChar(20), data.estado || 'Activo')
    .query(`
      UPDATE TiposHabitacion SET
        nombre = @nombre, descripcion = @descripcion,
        precio_por_noche = @precio_por_noche, capacidad_maxima = @capacidad_maxima,
        estado = @estado
      WHERE id_tipo = @id;
      SELECT * FROM TiposHabitacion WHERE id_tipo = @id;
    `);
  return result.recordset[0];
}

async function remove(id) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query('DELETE FROM TiposHabitacion WHERE id_tipo = @id');
  return result.rowsAffected[0];
}

module.exports = { getAll, getById, create, update, delete: remove };
