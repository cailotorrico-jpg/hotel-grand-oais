// ============================================================
// Modelo: ServiciosAdicionales  -  Tabla: dbo.ServiciosAdicionales
// ============================================================
const { getConnection, sql } = require('../config/db');

async function getAll() {
  const pool = await getConnection();
  const result = await pool.request().query(
    'SELECT * FROM ServiciosAdicionales ORDER BY categoria, nombre'
  );
  return result.recordset;
}

async function getById(id) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query('SELECT * FROM ServiciosAdicionales WHERE id_servicio = @id');
  return result.recordset[0];
}

async function getByCategoria(categoria) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('categoria', sql.VarChar(30), categoria)
    .query('SELECT * FROM ServiciosAdicionales WHERE categoria = @categoria ORDER BY nombre');
  return result.recordset;
}

async function create(data) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('nombre', sql.NVarChar(100), data.nombre)
    .input('descripcion', sql.NVarChar(500), data.descripcion || null)
    .input('precio', sql.Decimal(10, 2), data.precio)
    .input('categoria', sql.VarChar(30), data.categoria)
    .input('estado', sql.VarChar(20), data.estado || 'Activo')
    .query(`
      INSERT INTO ServiciosAdicionales (nombre, descripcion, precio, categoria, estado)
      OUTPUT INSERTED.*
      VALUES (@nombre, @descripcion, @precio, @categoria, @estado)
    `);
  return result.recordset[0];
}

async function update(id, data) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('nombre', sql.NVarChar(100), data.nombre)
    .input('descripcion', sql.NVarChar(500), data.descripcion || null)
    .input('precio', sql.Decimal(10, 2), data.precio)
    .input('categoria', sql.VarChar(30), data.categoria)
    .input('estado', sql.VarChar(20), data.estado || 'Activo')
    .query(`
      UPDATE ServiciosAdicionales SET
        nombre = @nombre, descripcion = @descripcion,
        precio = @precio, categoria = @categoria, estado = @estado
      WHERE id_servicio = @id;
      SELECT * FROM ServiciosAdicionales WHERE id_servicio = @id;
    `);
  return result.recordset[0];
}

async function remove(id) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query('DELETE FROM ServiciosAdicionales WHERE id_servicio = @id');
  return result.rowsAffected[0];
}

module.exports = { getAll, getById, getByCategoria, create, update, delete: remove };
