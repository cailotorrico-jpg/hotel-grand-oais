// ============================================================
// Modelo: CheckOuts  -  Tabla: dbo.CheckOuts
// ============================================================
const { getConnection, sql } = require('../config/db');

async function getAll() {
  const pool = await getConnection();
  const result = await pool.request().query(`
    SELECT co.*, r.fecha_entrada, r.fecha_salida,
           h.nombre AS huesped_nombre, h.apellido AS huesped_apellido,
           f.numero_factura, f.total AS total_factura
    FROM CheckOuts co
    INNER JOIN Reservas r ON co.id_reserva = r.id_reserva
    INNER JOIN Huespedes h ON r.id_huesped = h.id_huesped
    LEFT JOIN Facturas f ON co.id_factura = f.id_factura
    ORDER BY co.fecha_checkout DESC
  `);
  return result.recordset;
}

async function getById(id) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      SELECT co.*, r.fecha_entrada, r.fecha_salida,
             h.nombre AS huesped_nombre, h.apellido AS huesped_apellido,
             f.numero_factura, f.total AS total_factura
      FROM CheckOuts co
      INNER JOIN Reservas r ON co.id_reserva = r.id_reserva
      INNER JOIN Huespedes h ON r.id_huesped = h.id_huesped
      LEFT JOIN Facturas f ON co.id_factura = f.id_factura
      WHERE co.id_checkout = @id
    `);
  return result.recordset[0];
}

async function create(data) {
  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin();
    const result = await new sql.Request(transaction)
      .input('id_reserva', sql.Int, data.id_reserva)
      .input('id_factura', sql.Int, data.id_factura)
      .input('observaciones', sql.NVarChar(500), data.observaciones || null)
      .input('usuario_registro', sql.NVarChar(100), data.usuario_registro || 'Sistema')
      .query(`
        INSERT INTO CheckOuts (id_reserva, id_factura, observaciones, usuario_registro)
        OUTPUT INSERTED.*
        VALUES (@id_reserva, @id_factura, @observaciones, @usuario_registro)
      `);
    // Actualizar estado de reserva
    await new sql.Request(transaction)
      .input('id_reserva', sql.Int, data.id_reserva)
      .query("UPDATE Reservas SET estado = 'CheckOut' WHERE id_reserva = @id_reserva");
    // Liberar habitaciones
    await new sql.Request(transaction)
      .input('id_reserva', sql.Int, data.id_reserva)
      .query(`
        UPDATE Habitaciones SET estado = 'Limpieza'
        WHERE id_habitacion IN (
          SELECT id_habitacion FROM DetallesReserva WHERE id_reserva = @id_reserva
        )
      `);
    await transaction.commit();
    return result.recordset[0];
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function getByReserva(idReserva) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('idReserva', sql.Int, idReserva)
    .query('SELECT * FROM CheckOuts WHERE id_reserva = @idReserva');
  return result.recordset[0];
}

async function getReservasCheckedIn() {
  const pool = await getConnection();
  const result = await pool.request().query(`
    SELECT r.*, h.nombre AS huesped_nombre, h.apellido AS huesped_apellido,
           h.documento_identidad
    FROM Reservas r
    INNER JOIN Huespedes h ON r.id_huesped = h.id_huesped
    WHERE r.estado = 'CheckIn'
    ORDER BY r.fecha_entrada
  `);
  return result.recordset;
}

module.exports = { getAll, getById, create, getByReserva, getReservasCheckedIn };
