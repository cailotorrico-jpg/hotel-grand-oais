
require('dotenv').config();

const sql = require('mssql/msnodesqlv8');

// Configuración de Hotel Grand Oasis
const servidor = process.env.DB_SERVER || 'LAPTOP-O4IERP15';
const baseDatos = process.env.DB_DATABASE || 'HotelGrandOasis';

// Utilizar el controlador ODBC de la prueba exitosa
const dbConfig = {
  server: servidor,
  database: baseDatos,

  connectionString:
    `Driver={ODBC Driver 18 for SQL Server};` +
    `Server=${servidor};` +
    `Database=${baseDatos};` +
    `Trusted_Connection=Yes;` +
    `Encrypt=No;` +
    `TrustServerCertificate=Yes;`,

  options: {
    trustedConnection: true,
    encrypt: false,
    trustServerCertificate: true
  },

  connectionTimeout: 15000,
  requestTimeout: 30000
};

let pool = null;

async function getConnection() {
  try {
    if (pool && pool.connected) {
      return pool;
    }

    pool = await new sql.ConnectionPool(dbConfig).connect();

    console.log('✅ CONEXIÓN EXITOSA A SQL SERVER');
    console.log('✅ Servidor:', servidor);
    console.log('✅ Base de datos:', baseDatos);

    return pool;

  } catch (error) {
    pool = null;

    console.error('❌ ERROR DE CONEXIÓN SQL SERVER');
    console.dir(error, { depth: 10 });

    throw error;
  }
}

module.exports = { getConnection, sql };
