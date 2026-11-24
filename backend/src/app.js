const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba
app.get('/api', (req, res) => {
  res.json({
    message: 'API Hotel Grand Oasis funcionando correctamente',
    version: '1.0.0',
  });
});

// ============================================================
// Registro de rutas de cada módulo
// ============================================================
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/huespedes', require('./routes/huespedes.routes'));
app.use('/api/tipos-habitacion', require('./routes/tiposHabitacion.routes'));
app.use('/api/habitaciones', require('./routes/habitaciones.routes'));
app.use('/api/reservas', require('./routes/reservas.routes'));
app.use('/api/checkins', require('./routes/checkins.routes'));
app.use('/api/servicios', require('./routes/servicios.routes'));
app.use('/api/consumos', require('./routes/consumos.routes'));
app.use('/api/facturas', require('./routes/facturas.routes'));
app.use('/api/checkouts', require('./routes/checkouts.routes'));
app.use('/api/bitacora', require('./routes/bitacora.routes'));

// ============================================================
// Laboratorio JOIN - consultas de ejemplo
// ============================================================
app.get('/api/laboratorio/joins', async (req, res) => {
  const { getConnection } = require('./config/db');
  try {
    const pool = await getConnection();
    const { tipo } = req.query; // inner, left, right, full

    let query = '';
    switch (tipo) {
      case 'left':
        query = `SELECT h.nombre, h.apellido, r.id_reserva, r.fecha_entrada, r.estado
                 FROM Huespedes h LEFT JOIN Reservas r ON h.id_huesped = r.id_huesped
                 ORDER BY h.id_huesped`;
        break;
      case 'right':
        query = `SELECT h.nombre, h.apellido, r.id_reserva, r.fecha_entrada, r.estado
                 FROM Huespedes h RIGHT JOIN Reservas r ON h.id_huesped = r.id_huesped
                 ORDER BY r.id_reserva`;
        break;
      case 'full':
        query = `SELECT h.nombre, h.apellido, r.id_reserva, r.fecha_entrada, r.estado
                 FROM Huespedes h FULL OUTER JOIN Reservas r ON h.id_huesped = r.id_huesped
                 ORDER BY h.id_huesped`;
        break;
      case 'cross':
        query = `SELECT TOP 20 h.nombre, h.apellido, t.nombre AS tipo_habitacion, t.precio_por_noche
                 FROM Huespedes h CROSS JOIN TiposHabitacion t`;
        break;
      case 'subquery':
        query = `SELECT h.nombre, h.apellido, h.documento_identidad,
                   (SELECT COUNT(*) FROM Reservas r WHERE r.id_huesped = h.id_huesped) AS total_reservas,
                   (SELECT MAX(r2.fecha_entrada) FROM Reservas r2 WHERE r2.id_huesped = h.id_huesped) AS ultima_reserva
                 FROM Huespedes h ORDER BY h.id_huesped`;
        break;
      default: // inner
        query = `SELECT r.id_reserva, h.nombre, h.apellido, hab.numero_habitacion,
                        t.nombre AS tipo_habitacion, r.fecha_entrada, r.fecha_salida, r.estado, r.total
                 FROM Reservas r
                 INNER JOIN Huespedes h ON r.id_huesped = h.id_huesped
                 INNER JOIN DetallesReserva dr ON r.id_reserva = dr.id_reserva
                 INNER JOIN Habitaciones hab ON dr.id_habitacion = hab.id_habitacion
                 INNER JOIN TiposHabitacion t ON hab.id_tipo = t.id_tipo
                 ORDER BY r.id_reserva DESC`;
    }
    const result = await pool.request().query(query);
    res.json({ tipo: tipo || 'inner', query, data: result.recordset });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// Laboratorio Transacciones - COMMIT y ROLLBACK
// ============================================================
app.post('/api/laboratorio/transacciones', async (req, res) => {
  const { getConnection, sql } = require('./config/db');
  try {
    const pool = await getConnection();
    const { accion } = req.body; // commit o rollback

    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // Insertar un huésped de prueba
      const insertResult = await new sql.Request(transaction)
        .query(`
          INSERT INTO Huespedes (nombre, apellido, documento_identidad, tipo_documento, pais)
          OUTPUT INSERTED.*
          VALUES ('PRUEBA_TRANSACCION', 'LABORATORIO', 'LAB-' + CONVERT(VARCHAR, GETDATE(), 112) + RIGHT(CONVERT(VARCHAR, GETDATE(), 114), 6), 'Cédula', 'Laboratorio')
        `);

      const huesped = insertResult.recordset[0];

      if (accion === 'rollback') {
        await transaction.rollback();
        return res.json({
          accion: 'ROLLBACK',
          mensaje: 'Transacción revertida. El huésped de prueba NO fue guardado.',
          huesped_temporal: huesped,
          guardado: false,
        });
      } else {
        await transaction.commit();
        // Limpiar el registro de prueba
        await pool.request()
          .input('id', sql.Int, huesped.id_huesped)
          .query('DELETE FROM Huespedes WHERE id_huesped = @id');
        return res.json({
          accion: 'COMMIT',
          mensaje: 'Transacción confirmada exitosamente. Registro creado y luego eliminado (limpieza).',
          huesped_temporal: huesped,
          guardado: true,
        });
      }
    } catch (innerError) {
      await transaction.rollback();
      throw innerError;
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error('Error global:', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
