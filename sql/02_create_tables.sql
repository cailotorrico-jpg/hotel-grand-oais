-- ============================================================
-- HOTEL GRAND OASIS - Creación de Tablas
-- SQL Server 2022
-- Archivo: 02_create_tables.sql
-- Descripción: Crea todas las tablas del sistema de gestión
--              hotelera con constraints, FK e índices.
-- ============================================================

USE HotelGrandOasis;
GO

-- ============================================================
-- 1. TABLA: Huespedes - Registro de huéspedes
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.Huespedes') AND type = 'U')
BEGIN
    CREATE TABLE dbo.Huespedes (
        id_huesped          INT IDENTITY(1,1)   NOT NULL,
        nombre              NVARCHAR(100)       NOT NULL,
        apellido            NVARCHAR(100)       NOT NULL,
        documento_identidad VARCHAR(30)         NOT NULL,
        tipo_documento      VARCHAR(20)         NOT NULL,
        telefono            VARCHAR(20)         NULL,
        email               VARCHAR(150)        NULL,
        direccion           NVARCHAR(300)       NULL,
        pais                NVARCHAR(80)        NULL,
        fecha_registro      DATETIME            NOT NULL DEFAULT GETDATE(),
        estado              VARCHAR(20)         NOT NULL DEFAULT 'Activo',

        -- Llave primaria
        CONSTRAINT PK_Huespedes PRIMARY KEY CLUSTERED (id_huesped),

        -- Documento único
        CONSTRAINT UQ_Huespedes_Documento UNIQUE (documento_identidad),

        -- Validar tipo de documento
        CONSTRAINT CK_Huespedes_TipoDocumento
            CHECK (tipo_documento IN ('Cédula', 'Pasaporte', 'RNC')),

        -- Validar estado
        CONSTRAINT CK_Huespedes_Estado
            CHECK (estado IN ('Activo', 'Inactivo'))
    );

    PRINT '✅ Tabla Huespedes creada correctamente.';
END
GO

-- Índices para Huespedes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Huespedes_Nombre_Apellido' AND object_id = OBJECT_ID('dbo.Huespedes'))
    CREATE NONCLUSTERED INDEX IX_Huespedes_Nombre_Apellido ON dbo.Huespedes (apellido, nombre);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Huespedes_Email' AND object_id = OBJECT_ID('dbo.Huespedes'))
    CREATE NONCLUSTERED INDEX IX_Huespedes_Email ON dbo.Huespedes (email) WHERE email IS NOT NULL;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Huespedes_Estado' AND object_id = OBJECT_ID('dbo.Huespedes'))
    CREATE NONCLUSTERED INDEX IX_Huespedes_Estado ON dbo.Huespedes (estado);
GO

-- ============================================================
-- 2. TABLA: TiposHabitacion - Tipos de habitación
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.TiposHabitacion') AND type = 'U')
BEGIN
    CREATE TABLE dbo.TiposHabitacion (
        id_tipo             INT IDENTITY(1,1)   NOT NULL,
        nombre              NVARCHAR(80)        NOT NULL,
        descripcion         NVARCHAR(500)       NULL,
        precio_por_noche    DECIMAL(10,2)       NOT NULL,
        capacidad_maxima    INT                 NOT NULL,
        estado              VARCHAR(20)         NOT NULL DEFAULT 'Activo',

        CONSTRAINT PK_TiposHabitacion PRIMARY KEY CLUSTERED (id_tipo),

        CONSTRAINT UQ_TiposHabitacion_Nombre UNIQUE (nombre),

        CONSTRAINT CK_TiposHabitacion_Precio
            CHECK (precio_por_noche > 0),

        CONSTRAINT CK_TiposHabitacion_Capacidad
            CHECK (capacidad_maxima > 0),

        CONSTRAINT CK_TiposHabitacion_Estado
            CHECK (estado IN ('Activo', 'Inactivo'))
    );

    PRINT '✅ Tabla TiposHabitacion creada correctamente.';
END
GO

-- ============================================================
-- 3. TABLA: Habitaciones - Habitaciones del hotel
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.Habitaciones') AND type = 'U')
BEGIN
    CREATE TABLE dbo.Habitaciones (
        id_habitacion       INT IDENTITY(1,1)   NOT NULL,
        numero_habitacion   VARCHAR(10)         NOT NULL,
        id_tipo             INT                 NOT NULL,
        piso                INT                 NOT NULL,
        estado              VARCHAR(20)         NOT NULL DEFAULT 'Disponible',
        notas               NVARCHAR(500)       NULL,

        CONSTRAINT PK_Habitaciones PRIMARY KEY CLUSTERED (id_habitacion),

        CONSTRAINT UQ_Habitaciones_Numero UNIQUE (numero_habitacion),

        CONSTRAINT FK_Habitaciones_TipoHabitacion
            FOREIGN KEY (id_tipo) REFERENCES dbo.TiposHabitacion (id_tipo),

        CONSTRAINT CK_Habitaciones_Estado
            CHECK (estado IN ('Disponible', 'Ocupada', 'Mantenimiento', 'Limpieza')),

        CONSTRAINT CK_Habitaciones_Piso
            CHECK (piso > 0)
    );

    PRINT '✅ Tabla Habitaciones creada correctamente.';
END
GO

-- Índices para Habitaciones
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Habitaciones_TipoHabitacion' AND object_id = OBJECT_ID('dbo.Habitaciones'))
    CREATE NONCLUSTERED INDEX IX_Habitaciones_TipoHabitacion ON dbo.Habitaciones (id_tipo);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Habitaciones_Estado' AND object_id = OBJECT_ID('dbo.Habitaciones'))
    CREATE NONCLUSTERED INDEX IX_Habitaciones_Estado ON dbo.Habitaciones (estado);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Habitaciones_Piso' AND object_id = OBJECT_ID('dbo.Habitaciones'))
    CREATE NONCLUSTERED INDEX IX_Habitaciones_Piso ON dbo.Habitaciones (piso);
GO

-- ============================================================
-- 4. TABLA: Reservas - Reservaciones (Maestro)
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.Reservas') AND type = 'U')
BEGIN
    CREATE TABLE dbo.Reservas (
        id_reserva          INT IDENTITY(1,1)   NOT NULL,
        id_huesped          INT                 NOT NULL,
        fecha_reserva       DATETIME            NOT NULL DEFAULT GETDATE(),
        fecha_entrada       DATE                NOT NULL,
        fecha_salida        DATE                NOT NULL,
        estado              VARCHAR(20)         NOT NULL DEFAULT 'Confirmada',
        notas               NVARCHAR(500)       NULL,
        total               DECIMAL(12,2)       NOT NULL DEFAULT 0,

        CONSTRAINT PK_Reservas PRIMARY KEY CLUSTERED (id_reserva),

        CONSTRAINT FK_Reservas_Huesped
            FOREIGN KEY (id_huesped) REFERENCES dbo.Huespedes (id_huesped),

        CONSTRAINT CK_Reservas_Estado
            CHECK (estado IN ('Pendiente', 'Confirmada', 'CheckIn', 'CheckOut', 'Cancelada')),

        CONSTRAINT CK_Reservas_Fechas
            CHECK (fecha_salida > fecha_entrada),

        CONSTRAINT CK_Reservas_Total
            CHECK (total >= 0)
    );

    PRINT '✅ Tabla Reservas creada correctamente.';
END
GO

-- Índices para Reservas
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Reservas_Huesped' AND object_id = OBJECT_ID('dbo.Reservas'))
    CREATE NONCLUSTERED INDEX IX_Reservas_Huesped ON dbo.Reservas (id_huesped);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Reservas_FechaEntrada' AND object_id = OBJECT_ID('dbo.Reservas'))
    CREATE NONCLUSTERED INDEX IX_Reservas_FechaEntrada ON dbo.Reservas (fecha_entrada);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Reservas_FechaSalida' AND object_id = OBJECT_ID('dbo.Reservas'))
    CREATE NONCLUSTERED INDEX IX_Reservas_FechaSalida ON dbo.Reservas (fecha_salida);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Reservas_Estado' AND object_id = OBJECT_ID('dbo.Reservas'))
    CREATE NONCLUSTERED INDEX IX_Reservas_Estado ON dbo.Reservas (estado);
GO

-- ============================================================
-- 5. TABLA: DetallesReserva - Detalle de reservaciones (Detalle)
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.DetallesReserva') AND type = 'U')
BEGIN
    CREATE TABLE dbo.DetallesReserva (
        id_detalle          INT IDENTITY(1,1)   NOT NULL,
        id_reserva          INT                 NOT NULL,
        id_habitacion       INT                 NOT NULL,
        precio_noche        DECIMAL(10,2)       NOT NULL,
        subtotal            DECIMAL(12,2)       NOT NULL,

        CONSTRAINT PK_DetallesReserva PRIMARY KEY CLUSTERED (id_detalle),

        CONSTRAINT FK_DetallesReserva_Reserva
            FOREIGN KEY (id_reserva) REFERENCES dbo.Reservas (id_reserva),

        CONSTRAINT FK_DetallesReserva_Habitacion
            FOREIGN KEY (id_habitacion) REFERENCES dbo.Habitaciones (id_habitacion),

        CONSTRAINT CK_DetallesReserva_PrecioNoche
            CHECK (precio_noche > 0),

        CONSTRAINT CK_DetallesReserva_Subtotal
            CHECK (subtotal >= 0)
    );

    PRINT '✅ Tabla DetallesReserva creada correctamente.';
END
GO

-- Índices para DetallesReserva
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_DetallesReserva_Reserva' AND object_id = OBJECT_ID('dbo.DetallesReserva'))
    CREATE NONCLUSTERED INDEX IX_DetallesReserva_Reserva ON dbo.DetallesReserva (id_reserva);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_DetallesReserva_Habitacion' AND object_id = OBJECT_ID('dbo.DetallesReserva'))
    CREATE NONCLUSTERED INDEX IX_DetallesReserva_Habitacion ON dbo.DetallesReserva (id_habitacion);
GO

-- ============================================================
-- 6. TABLA: CheckIns - Registros de entrada
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.CheckIns') AND type = 'U')
BEGIN
    CREATE TABLE dbo.CheckIns (
        id_checkin          INT IDENTITY(1,1)   NOT NULL,
        id_reserva          INT                 NOT NULL,
        fecha_checkin       DATETIME            NOT NULL DEFAULT GETDATE(),
        observaciones       NVARCHAR(500)       NULL,
        usuario_registro    NVARCHAR(100)       NULL,

        CONSTRAINT PK_CheckIns PRIMARY KEY CLUSTERED (id_checkin),

        CONSTRAINT FK_CheckIns_Reserva
            FOREIGN KEY (id_reserva) REFERENCES dbo.Reservas (id_reserva)
    );

    PRINT '✅ Tabla CheckIns creada correctamente.';
END
GO

-- Índices para CheckIns
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_CheckIns_Reserva' AND object_id = OBJECT_ID('dbo.CheckIns'))
    CREATE NONCLUSTERED INDEX IX_CheckIns_Reserva ON dbo.CheckIns (id_reserva);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_CheckIns_Fecha' AND object_id = OBJECT_ID('dbo.CheckIns'))
    CREATE NONCLUSTERED INDEX IX_CheckIns_Fecha ON dbo.CheckIns (fecha_checkin);
GO

-- ============================================================
-- 7. TABLA: ServiciosAdicionales - Catálogo de servicios
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.ServiciosAdicionales') AND type = 'U')
BEGIN
    CREATE TABLE dbo.ServiciosAdicionales (
        id_servicio         INT IDENTITY(1,1)   NOT NULL,
        nombre              NVARCHAR(100)       NOT NULL,
        descripcion         NVARCHAR(500)       NULL,
        precio              DECIMAL(10,2)       NOT NULL,
        categoria           VARCHAR(30)         NOT NULL,
        estado              VARCHAR(20)         NOT NULL DEFAULT 'Activo',

        CONSTRAINT PK_ServiciosAdicionales PRIMARY KEY CLUSTERED (id_servicio),

        CONSTRAINT CK_ServiciosAdicionales_Precio
            CHECK (precio >= 0),

        CONSTRAINT CK_ServiciosAdicionales_Categoria
            CHECK (categoria IN ('Spa', 'Restaurante', 'Lavandería', 'Minibar', 'Transporte', 'Otros')),

        CONSTRAINT CK_ServiciosAdicionales_Estado
            CHECK (estado IN ('Activo', 'Inactivo'))
    );

    PRINT '✅ Tabla ServiciosAdicionales creada correctamente.';
END
GO

-- Índices para ServiciosAdicionales
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ServiciosAdicionales_Categoria' AND object_id = OBJECT_ID('dbo.ServiciosAdicionales'))
    CREATE NONCLUSTERED INDEX IX_ServiciosAdicionales_Categoria ON dbo.ServiciosAdicionales (categoria);
GO

-- ============================================================
-- 8. TABLA: Consumos - Registro de consumos de huéspedes
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.Consumos') AND type = 'U')
BEGIN
    CREATE TABLE dbo.Consumos (
        id_consumo          INT IDENTITY(1,1)   NOT NULL,
        id_reserva          INT                 NOT NULL,
        id_servicio         INT                 NOT NULL,
        cantidad            INT                 NOT NULL DEFAULT 1,
        precio_unitario     DECIMAL(10,2)       NOT NULL,
        subtotal            DECIMAL(12,2)       NOT NULL,
        fecha_consumo       DATETIME            NOT NULL DEFAULT GETDATE(),
        notas               NVARCHAR(500)       NULL,

        CONSTRAINT PK_Consumos PRIMARY KEY CLUSTERED (id_consumo),

        CONSTRAINT FK_Consumos_Reserva
            FOREIGN KEY (id_reserva) REFERENCES dbo.Reservas (id_reserva),

        CONSTRAINT FK_Consumos_Servicio
            FOREIGN KEY (id_servicio) REFERENCES dbo.ServiciosAdicionales (id_servicio),

        CONSTRAINT CK_Consumos_Cantidad
            CHECK (cantidad > 0),

        CONSTRAINT CK_Consumos_PrecioUnitario
            CHECK (precio_unitario >= 0),

        CONSTRAINT CK_Consumos_Subtotal
            CHECK (subtotal >= 0)
    );

    PRINT '✅ Tabla Consumos creada correctamente.';
END
GO

-- Índices para Consumos
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Consumos_Reserva' AND object_id = OBJECT_ID('dbo.Consumos'))
    CREATE NONCLUSTERED INDEX IX_Consumos_Reserva ON dbo.Consumos (id_reserva);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Consumos_Servicio' AND object_id = OBJECT_ID('dbo.Consumos'))
    CREATE NONCLUSTERED INDEX IX_Consumos_Servicio ON dbo.Consumos (id_servicio);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Consumos_FechaConsumo' AND object_id = OBJECT_ID('dbo.Consumos'))
    CREATE NONCLUSTERED INDEX IX_Consumos_FechaConsumo ON dbo.Consumos (fecha_consumo);
GO

-- ============================================================
-- 9. TABLA: Facturas - Facturación
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.Facturas') AND type = 'U')
BEGIN
    CREATE TABLE dbo.Facturas (
        id_factura          INT IDENTITY(1,1)   NOT NULL,
        id_reserva          INT                 NOT NULL,
        numero_factura      VARCHAR(20)         NOT NULL,
        fecha_factura       DATETIME            NOT NULL DEFAULT GETDATE(),
        subtotal            DECIMAL(12,2)       NOT NULL,
        impuestos           DECIMAL(12,2)       NOT NULL,
        total               DECIMAL(12,2)       NOT NULL,
        metodo_pago         NVARCHAR(30)        NOT NULL,
        estado              VARCHAR(20)         NOT NULL DEFAULT 'Pendiente',
        notas               NVARCHAR(500)       NULL,

        CONSTRAINT PK_Facturas PRIMARY KEY CLUSTERED (id_factura),

        CONSTRAINT UQ_Facturas_NumeroFactura UNIQUE (numero_factura),

        CONSTRAINT FK_Facturas_Reserva
            FOREIGN KEY (id_reserva) REFERENCES dbo.Reservas (id_reserva),

        CONSTRAINT CK_Facturas_MetodoPago
            CHECK (metodo_pago IN ('Efectivo', 'Tarjeta Crédito', 'Tarjeta Débito', 'Transferencia')),

        CONSTRAINT CK_Facturas_Estado
            CHECK (estado IN ('Pendiente', 'Pagada', 'Anulada')),

        CONSTRAINT CK_Facturas_Subtotal
            CHECK (subtotal >= 0),

        CONSTRAINT CK_Facturas_Total
            CHECK (total >= 0)
    );

    PRINT '✅ Tabla Facturas creada correctamente.';
END
GO

-- Índices para Facturas
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Facturas_Reserva' AND object_id = OBJECT_ID('dbo.Facturas'))
    CREATE NONCLUSTERED INDEX IX_Facturas_Reserva ON dbo.Facturas (id_reserva);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Facturas_FechaFactura' AND object_id = OBJECT_ID('dbo.Facturas'))
    CREATE NONCLUSTERED INDEX IX_Facturas_FechaFactura ON dbo.Facturas (fecha_factura);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Facturas_Estado' AND object_id = OBJECT_ID('dbo.Facturas'))
    CREATE NONCLUSTERED INDEX IX_Facturas_Estado ON dbo.Facturas (estado);
GO

-- ============================================================
-- 10. TABLA: CheckOuts - Registros de salida
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.CheckOuts') AND type = 'U')
BEGIN
    CREATE TABLE dbo.CheckOuts (
        id_checkout         INT IDENTITY(1,1)   NOT NULL,
        id_reserva          INT                 NOT NULL,
        id_factura          INT                 NOT NULL,
        fecha_checkout      DATETIME            NOT NULL DEFAULT GETDATE(),
        observaciones       NVARCHAR(500)       NULL,
        usuario_registro    NVARCHAR(100)       NULL,

        CONSTRAINT PK_CheckOuts PRIMARY KEY CLUSTERED (id_checkout),

        CONSTRAINT FK_CheckOuts_Reserva
            FOREIGN KEY (id_reserva) REFERENCES dbo.Reservas (id_reserva),

        CONSTRAINT FK_CheckOuts_Factura
            FOREIGN KEY (id_factura) REFERENCES dbo.Facturas (id_factura)
    );

    PRINT '✅ Tabla CheckOuts creada correctamente.';
END
GO

-- Índices para CheckOuts
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_CheckOuts_Reserva' AND object_id = OBJECT_ID('dbo.CheckOuts'))
    CREATE NONCLUSTERED INDEX IX_CheckOuts_Reserva ON dbo.CheckOuts (id_reserva);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_CheckOuts_Factura' AND object_id = OBJECT_ID('dbo.CheckOuts'))
    CREATE NONCLUSTERED INDEX IX_CheckOuts_Factura ON dbo.CheckOuts (id_factura);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_CheckOuts_Fecha' AND object_id = OBJECT_ID('dbo.CheckOuts'))
    CREATE NONCLUSTERED INDEX IX_CheckOuts_Fecha ON dbo.CheckOuts (fecha_checkout);
GO

-- ============================================================
-- 11. TABLA: Bitacora - Registro de auditoría
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.Bitacora') AND type = 'U')
BEGIN
    CREATE TABLE dbo.Bitacora (
        id_registro         INT IDENTITY(1,1)   NOT NULL,
        tabla_afectada      VARCHAR(80)         NOT NULL,
        accion              VARCHAR(10)         NOT NULL,
        id_referencia       INT                 NULL,
        descripcion         NVARCHAR(1000)      NULL,
        usuario             NVARCHAR(100)       NULL,
        fecha               DATETIME            NOT NULL DEFAULT GETDATE(),

        CONSTRAINT PK_Bitacora PRIMARY KEY CLUSTERED (id_registro),

        CONSTRAINT CK_Bitacora_Accion
            CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE'))
    );

    PRINT '✅ Tabla Bitacora creada correctamente.';
END
GO

-- Índices para Bitacora
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Bitacora_TablaAfectada' AND object_id = OBJECT_ID('dbo.Bitacora'))
    CREATE NONCLUSTERED INDEX IX_Bitacora_TablaAfectada ON dbo.Bitacora (tabla_afectada);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Bitacora_Fecha' AND object_id = OBJECT_ID('dbo.Bitacora'))
    CREATE NONCLUSTERED INDEX IX_Bitacora_Fecha ON dbo.Bitacora (fecha);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Bitacora_Accion' AND object_id = OBJECT_ID('dbo.Bitacora'))
    CREATE NONCLUSTERED INDEX IX_Bitacora_Accion ON dbo.Bitacora (accion);
GO

-- ============================================================
PRINT '========================================================';
PRINT '✅ TODAS LAS TABLAS CREADAS EXITOSAMENTE';
PRINT '   Hotel Grand Oasis - Sistema de Gestión Hotelera';
PRINT '========================================================';
GO
