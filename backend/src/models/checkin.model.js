// ============================================================
// Modelo: CheckIns  -  Tabla: dbo.CheckIns
// ============================================================
const { getConnection, sql } = require('../config/db');

async function getAll() {
  const pool = await getConnection();
  const result = await pool.request().query(`
    SELECT ci.*, r.fecha_entrada, r.fecha_salida, r.estado AS estado_reserva,
           h.nombre AS huesped_nombre, h.apellido AS huesped_apellido
    FROM CheckIns ci
    INNER JOIN Reservas r ON ci.id_reserva = r.id_reserva
    INNER JOIN Huespedes h ON r.id_huesped = h.id_huesped
    ORDER BY ci.fecha_checkin DESC
  `);
  return result.recordset;
}

async function getById(id) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      SELECT ci.*, r.fecha_entrada, r.fecha_salida,
             h.nombre AS huesped_nombre, h.apellido AS huesped_apellido
      FROM CheckIns ci
      INNER JOIN Reservas r ON ci.id_reserva = r.id_reserva
      INNER JOIN Huespedes h ON r.id_huesped = h.id_huesped
      WHERE ci.id_checkin = @id
    `);
  return result.recordset[0];
}

async function create(data) {
  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin();
    // Insertar check-in
    const result = await new sql.Request(transaction)
      .input('id_reserva', sql.Int, data.id_reserva)
      .input('observaciones', sql.NVarChar(500), data.observaciones || null)
      .input('usuario_registro', sql.NVarChar(100), data.usuario_registro || 'Sistema')
      .query(`
        INSERT INTO CheckIns (id_reserva, observaciones, usuario_registro)
        OUTPUT INSERTED.*
        VALUES (@id_reserva, @observaciones, @usuario_registro)
      `);
    // Actualizar estado de reserva a CheckIn
    await new sql.Request(transaction)
      .input('id_reserva', sql.Int, data.id_reserva)
      .query("UPDATE Reservas SET estado = 'CheckIn' WHERE id_reserva = @id_reserva");
    // Actualizar habitaciones a Ocupada
    await new sql.Request(transaction)
      .input('id_reserva', sql.Int, data.id_reserva)
      .query(`
        UPDATE Habitaciones SET estado = 'Ocupada'
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
    .query('SELECT * FROM CheckIns WHERE id_reserva = @idReserva');
  return result.recordset[0];
}

async function getReservasConfirmadas() {
  const pool = await getConnection();
  const result = await pool.request().query(`
    SELECT r.*, h.nombre AS huesped_nombre, h.apellido AS huesped_apellido,
           h.documento_identidad
    FROM Reservas r
    INNER JOIN Huespedes h ON r.id_huesped = h.id_huesped
    WHERE r.estado = 'Confirmada'
    ORDER BY r.fecha_entrada
  `);
  return result.recordset;
}

module.exports = { getAll, getById, create, getByReserva, getReservasConfirmadas };
