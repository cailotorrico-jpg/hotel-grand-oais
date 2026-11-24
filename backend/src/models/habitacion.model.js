// ============================================================
// Modelo: Habitaciones
// Tabla SQL: dbo.Habitaciones
// Columnas: id_habitacion, numero_habitacion, id_tipo, piso,
//           estado, notas
// ============================================================

const { getConnection, sql } = require('../config/db');

async function getAll() {
  const pool = await getConnection();
  const result = await pool.request().query(`
    SELECT h.*, t.nombre AS tipo_nombre, t.precio_por_noche, t.capacidad_maxima
    FROM Habitaciones h
    INNER JOIN TiposHabitacion t ON h.id_tipo = t.id_tipo
    ORDER BY h.numero_habitacion
  `);
  return result.recordset;
}

async function getById(id) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      SELECT h.*, t.nombre AS tipo_nombre, t.precio_por_noche, t.capacidad_maxima
      FROM Habitaciones h
      INNER JOIN TiposHabitacion t ON h.id_tipo = t.id_tipo
      WHERE h.id_habitacion = @id
    `);
  return result.recordset[0];
}

async function getByEstado(estado) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('estado', sql.VarChar(20), estado)
    .query(`
      SELECT h.*, t.nombre AS tipo_nombre, t.precio_por_noche, t.capacidad_maxima
      FROM Habitaciones h
      INNER JOIN TiposHabitacion t ON h.id_tipo = t.id_tipo
      WHERE h.estado = @estado
      ORDER BY h.numero_habitacion
    `);
  return result.recordset;
}

async function create(data) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('numero_habitacion', sql.VarChar(10), data.numero_habitacion)
    .input('id_tipo', sql.Int, data.id_tipo)
    .input('piso', sql.Int, data.piso)
    .input('estado', sql.VarChar(20), data.estado || 'Disponible')
    .input('notas', sql.NVarChar(500), data.notas || null)
    .query(`
      INSERT INTO Habitaciones (numero_habitacion, id_tipo, piso, estado, notas)
      OUTPUT INSERTED.*
      VALUES (@numero_habitacion, @id_tipo, @piso, @estado, @notas)
    `);
  return result.recordset[0];
}

async function update(id, data) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('numero_habitacion', sql.VarChar(10), data.numero_habitacion)
    .input('id_tipo', sql.Int, data.id_tipo)
    .input('piso', sql.Int, data.piso)
    .input('estado', sql.VarChar(20), data.estado)
    .input('notas', sql.NVarChar(500), data.notas || null)
    .query(`
      UPDATE Habitaciones SET
        numero_habitacion = @numero_habitacion, id_tipo = @id_tipo,
        piso = @piso, estado = @estado, notas = @notas
      WHERE id_habitacion = @id;
      SELECT h.*, t.nombre AS tipo_nombre, t.precio_por_noche, t.capacidad_maxima
      FROM Habitaciones h
      INNER JOIN TiposHabitacion t ON h.id_tipo = t.id_tipo
      WHERE h.id_habitacion = @id;
    `);
  return result.recordset[0];
}

async function updateEstado(id, estado) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('estado', sql.VarChar(20), estado)
    .query(`
      UPDATE Habitaciones SET estado = @estado WHERE id_habitacion = @id;
      SELECT * FROM Habitaciones WHERE id_habitacion = @id;
    `);
  return result.recordset[0];
}

async function remove(id) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query('DELETE FROM Habitaciones WHERE id_habitacion = @id');
  return result.rowsAffected[0];
}

module.exports = { getAll, getById, getByEstado, create, update, updateEstado, delete: remove };
