// ============================================================
// Modelo: Reservas + DetallesReserva
// Tablas SQL: dbo.Reservas, dbo.DetallesReserva
// ============================================================

const { getConnection, sql } = require('../config/db');

async function getAll() {
  const pool = await getConnection();
  const result = await pool.request().query(`
    SELECT r.*, h.nombre AS huesped_nombre, h.apellido AS huesped_apellido,
           h.documento_identidad
    FROM Reservas r
    INNER JOIN Huespedes h ON r.id_huesped = h.id_huesped
    ORDER BY r.id_reserva DESC
  `);
  return result.recordset;
}

async function getById(id) {
  const pool = await getConnection();
  const reservaResult = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      SELECT r.*, h.nombre AS huesped_nombre, h.apellido AS huesped_apellido,
             h.documento_identidad, h.email, h.telefono
      FROM Reservas r
      INNER JOIN Huespedes h ON r.id_huesped = h.id_huesped
      WHERE r.id_reserva = @id
    `);
  if (!reservaResult.recordset[0]) return null;

  const detallesResult = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      SELECT dr.*, hab.numero_habitacion, t.nombre AS tipo_nombre, t.precio_por_noche
      FROM DetallesReserva dr
      INNER JOIN Habitaciones hab ON dr.id_habitacion = hab.id_habitacion
      INNER JOIN TiposHabitacion t ON hab.id_tipo = t.id_tipo
      WHERE dr.id_reserva = @id
    `);

  return { ...reservaResult.recordset[0], detalles: detallesResult.recordset };
}

async function getByHuesped(idHuesped) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('idHuesped', sql.Int, idHuesped)
    .query(`
      SELECT r.*, h.nombre AS huesped_nombre, h.apellido AS huesped_apellido
      FROM Reservas r
      INNER JOIN Huespedes h ON r.id_huesped = h.id_huesped
      WHERE r.id_huesped = @idHuesped
      ORDER BY r.id_reserva DESC
    `);
  return result.recordset;
}

async function create(data) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id_huesped', sql.Int, data.id_huesped)
    .input('fecha_entrada', sql.Date, data.fecha_entrada)
    .input('fecha_salida', sql.Date, data.fecha_salida)
    .input('estado', sql.VarChar(20), data.estado || 'Confirmada')
    .input('notas', sql.NVarChar(500), data.notas || null)
    .input('total', sql.Decimal(12, 2), data.total || 0)
    .query(`
      INSERT INTO Reservas (id_huesped, fecha_entrada, fecha_salida, estado, notas, total)
      OUTPUT INSERTED.*
      VALUES (@id_huesped, @fecha_entrada, @fecha_salida, @estado, @notas, @total)
    `);
  return result.recordset[0];
}

async function createWithDetails(reservaData, detalles) {
  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin();
    const reservaResult = await new sql.Request(transaction)
      .input('id_huesped', sql.Int, reservaData.id_huesped)
      .input('fecha_entrada', sql.Date, reservaData.fecha_entrada)
      .input('fecha_salida', sql.Date, reservaData.fecha_salida)
      .input('estado', sql.VarChar(20), reservaData.estado || 'Confirmada')
      .input('notas', sql.NVarChar(500), reservaData.notas || null)
      .input('total', sql.Decimal(12, 2), reservaData.total || 0)
      .query(`
        INSERT INTO Reservas (id_huesped, fecha_entrada, fecha_salida, estado, notas, total)
        OUTPUT INSERTED.*
        VALUES (@id_huesped, @fecha_entrada, @fecha_salida, @estado, @notas, @total)
      `);
    const reserva = reservaResult.recordset[0];

    const detallesInsertados = [];
    for (const det of detalles) {
      const detResult = await new sql.Request(transaction)
        .input('id_reserva', sql.Int, reserva.id_reserva)
        .input('id_habitacion', sql.Int, det.id_habitacion)
        .input('precio_noche', sql.Decimal(10, 2), det.precio_noche)
        .input('subtotal', sql.Decimal(12, 2), det.subtotal || det.precio_noche)
        .query(`
          INSERT INTO DetallesReserva (id_reserva, id_habitacion, precio_noche, subtotal)
          OUTPUT INSERTED.*
          VALUES (@id_reserva, @id_habitacion, @precio_noche, @subtotal)
        `);
      detallesInsertados.push(detResult.recordset[0]);
    }

    await transaction.commit();
    return { ...reserva, detalles: detallesInsertados };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function update(id, data) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('id_huesped', sql.Int, data.id_huesped)
    .input('fecha_entrada', sql.Date, data.fecha_entrada)
    .input('fecha_salida', sql.Date, data.fecha_salida)
    .input('estado', sql.VarChar(20), data.estado)
    .input('notas', sql.NVarChar(500), data.notas || null)
    .input('total', sql.Decimal(12, 2), data.total || 0)
    .query(`
      UPDATE Reservas SET
        id_huesped = @id_huesped, fecha_entrada = @fecha_entrada,
        fecha_salida = @fecha_salida, estado = @estado, notas = @notas, total = @total
      WHERE id_reserva = @id;
      SELECT * FROM Reservas WHERE id_reserva = @id;
    `);
  return result.recordset[0];
}

async function updateEstado(id, estado) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('estado', sql.VarChar(20), estado)
    .query(`
      UPDATE Reservas SET estado = @estado WHERE id_reserva = @id;
      SELECT * FROM Reservas WHERE id_reserva = @id;
    `);
  return result.recordset[0];
}

async function cancel(id) {
  return await updateEstado(id, 'Cancelada');
}

module.exports = {
  getAll, getById, getByHuesped, create, createWithDetails,
  update, updateEstado, cancel,
};
