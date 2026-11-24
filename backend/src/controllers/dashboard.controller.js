// Controlador: Dashboard
const { getConnection } = require('../config/db');

const getData = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT
        (SELECT COUNT(*) FROM Habitaciones) AS total_habitaciones,
        (SELECT COUNT(*) FROM Habitaciones WHERE estado = 'Ocupada') AS habitaciones_ocupadas,
        (SELECT COUNT(*) FROM Habitaciones WHERE estado = 'Disponible') AS habitaciones_disponibles,
        (SELECT COUNT(*) FROM Reservas WHERE estado IN ('Confirmada','CheckIn')) AS reservas_activas,
        (SELECT COUNT(*) FROM CheckIns WHERE CAST(fecha_checkin AS DATE) = CAST(GETDATE() AS DATE)) AS checkins_hoy,
        (SELECT ISNULL(SUM(total), 0) FROM Facturas
         WHERE MONTH(fecha_factura) = MONTH(GETDATE())
         AND YEAR(fecha_factura) = YEAR(GETDATE())
         AND estado = 'Pagada') AS ingresos_mes
    `);
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error dashboard:', error.message);
    res.json({
      total_habitaciones: 0, habitaciones_ocupadas: 0,
      habitaciones_disponibles: 0, reservas_activas: 0,
      checkins_hoy: 0, ingresos_mes: 0
    });
  }
};

module.exports = { getData };
