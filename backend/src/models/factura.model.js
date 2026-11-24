// ============================================================
// Modelo: Facturas  -  Tabla: dbo.Facturas
// ============================================================
const { getConnection, sql } = require('../config/db');

async function getAll() {
  const pool = await getConnection();
  const result = await pool.request().query(`
    SELECT f.*, h.nombre AS huesped_nombre, h.apellido AS huesped_apellido
    FROM Facturas f
    INNER JOIN Reservas r ON f.id_reserva = r.id_reserva
    INNER JOIN Huespedes h ON r.id_huesped = h.id_huesped
    ORDER BY f.fecha_factura DESC
  `);
  return result.recordset;
}

async function getById(id) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      SELECT f.*, h.nombre AS huesped_nombre, h.apellido AS huesped_apellido,
             r.fecha_entrada, r.fecha_salida
      FROM Facturas f
      INNER JOIN Reservas r ON f.id_reserva = r.id_reserva
      INNER JOIN Huespedes h ON r.id_huesped = h.id_huesped
      WHERE f.id_factura = @id
    `);
  return result.recordset[0];
}

async function getByReserva(idReserva) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('idReserva', sql.Int, idReserva)
    .query('SELECT * FROM Facturas WHERE id_reserva = @idReserva');
  return result.recordset;
}

async function generate(idReserva) {
  const pool = await getConnection();

  // Calcular subtotal de habitaciones
  const habResult = await pool.request()
    .input('idReserva', sql.Int, idReserva)
    .query(`
      SELECT ISNULL(SUM(dr.subtotal), 0) AS subtotal_habitaciones
      FROM DetallesReserva dr WHERE dr.id_reserva = @idReserva
    `);
  const subtotalHab = habResult.recordset[0].subtotal_habitaciones;

  // Calcular subtotal de consumos
  const conResult = await pool.request()
    .input('idReserva', sql.Int, idReserva)
    .query(`
      SELECT ISNULL(SUM(c.subtotal), 0) AS subtotal_consumos
      FROM Consumos c WHERE c.id_reserva = @idReserva
    `);
  const subtotalCon = conResult.recordset[0].subtotal_consumos;

  const subtotal = Number(subtotalHab) + Number(subtotalCon);
  const impuestos = subtotal * 0.18; // ITBIS 18%
  const total = subtotal + impuestos;

  // Generar número de factura
  const countResult = await pool.request().query(
    'SELECT COUNT(*) AS total FROM Facturas'
  );
  const numero = `FAC-${String(countResult.recordset[0].total + 1).padStart(6, '0')}`;

  const result = await pool.request()
    .input('id_reserva', sql.Int, idReserva)
    .input('numero_factura', sql.VarChar(20), numero)
    .input('subtotal', sql.Decimal(12, 2), subtotal)
    .input('impuestos', sql.Decimal(12, 2), impuestos)
    .input('total', sql.Decimal(12, 2), total)
    .input('metodo_pago', sql.NVarChar(30), 'Efectivo')
    .query(`
      INSERT INTO Facturas (id_reserva, numero_factura, subtotal, impuestos, total, metodo_pago)
      OUTPUT INSERTED.*
      VALUES (@id_reserva, @numero_factura, @subtotal, @impuestos, @total, @metodo_pago)
    `);
  return result.recordset[0];
}

async function updateEstado(id, estado) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('estado', sql.VarChar(20), estado)
    .query(`
      UPDATE Facturas SET estado = @estado WHERE id_factura = @id;
      SELECT * FROM Facturas WHERE id_factura = @id;
    `);
  return result.recordset[0];
}

module.exports = { getAll, getById, getByReserva, generate, updateEstado };
