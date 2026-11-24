-- ============================================================
-- HOTEL GRAND OASIS - Script de creación de base de datos
-- SQL Server 2022
-- ============================================================

-- Crear la base de datos
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'HotelGrandOasis')
BEGIN
    CREATE DATABASE HotelGrandOasis;
END
GO

USE HotelGrandOasis;
GO

PRINT '✅ Base de datos HotelGrandOasis lista.';
PRINT 'Las tablas se crearán en los siguientes scripts.';
GO
