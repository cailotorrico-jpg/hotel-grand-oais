// ============================================================
// Modelo: Consumos  -  Tabla: dbo.Consumos
// ============================================================
const { getConnection, sql } = require('../config/db');

async function getAll() {
  const pool = await getConnection();
  const result = await pool.request().query(`
    SELECT c.*, s.nombre AS servicio_nombre, s.categoria,
           h.nombre AS huesped_nombre, h.apellido AS huesped_apellido
    FROM Consumos c
    INNER JOIN ServiciosAdicionales s ON c.id_servicio = s.id_servicio
    INNER JOIN Reservas r ON c.id_reserva = r.id_reserva
    INNER JOIN Huespedes h ON r.id_huesped = h.id_huesped
    ORDER BY c.fecha_consumo DESC
  `);
  return result.recordset;
}

async function getByReserva(idReserva) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('idReserva', sql.Int, idReserva)
    .query(`
      SELECT c.*, s.nombre AS servicio_nombre, s.categoria
      FROM Consumos c
      INNER JOIN ServiciosAdicionales s ON c.id_servicio = s.id_servicio
      WHERE c.id_reserva = @idReserva
      ORDER BY c.fecha_consumo DESC
    `);
  return result.recordset;
}

async function create(data) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id_reserva', sql.Int, data.id_reserva)
    .input('id_servicio', sql.Int, data.id_servicio)
    .input('cantidad', sql.Int, data.cantidad || 1)
    .input('precio_unitario', sql.Decimal(10, 2), data.precio_unitario)
    .input('subtotal', sql.Decimal(12, 2), data.subtotal || (data.precio_unitario * (data.cantidad || 1)))
    .input('notas', sql.NVarChar(500), data.notas || null)
    .query(`
      INSERT INTO Consumos (id_reserva, id_servicio, cantidad, precio_unitario, subtotal, notas)
      OUTPUT INSERTED.*
      VALUES (@id_reserva, @id_servicio, @cantidad, @precio_unitario, @subtotal, @notas)
    `);
  return result.recordset[0];
}

async function remove(id) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query('DELETE FROM Consumos WHERE id_consumo = @id');
  return result.rowsAffected[0];
}

module.exports = { getAll, getByReserva, create, delete: remove };
