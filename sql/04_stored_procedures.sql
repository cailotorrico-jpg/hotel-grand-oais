-- ============================================================
-- HOTEL GRAND OASIS - Procedimientos Almacenados
-- SQL Server 2022
-- Archivo: 04_stored_procedures.sql
-- Descripción: Procedimientos almacenados para las operaciones
--              principales del sistema de gestión hotelera.
-- ============================================================

USE HotelGrandOasis;
GO

-- ============================================================
-- 1. sp_RegistrarBitacora - Registrar acciones en la bitácora
-- ============================================================
IF OBJECT_ID('dbo.sp_RegistrarBitacora', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_RegistrarBitacora;
GO

CREATE PROCEDURE dbo.sp_RegistrarBitacora
    @tabla_afectada     VARCHAR(80),
    @accion             VARCHAR(10),
    @id_referencia      INT             = NULL,
    @descripcion        NVARCHAR(1000)  = NULL,
    @usuario            NVARCHAR(100)   = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Usar SYSTEM_USER si no se proporciona usuario
    IF @usuario IS NULL
        SET @usuario = SYSTEM_USER;

    INSERT INTO dbo.Bitacora (tabla_afectada, accion, id_referencia, descripcion, usuario)
    VALUES (@tabla_afectada, @accion, @id_referencia, @descripcion, @usuario);
END;
GO

PRINT '✅ Procedimiento sp_RegistrarBitacora creado.';
GO

-- ============================================================
-- 2. sp_CrearReserva - Crear una reserva con sus detalles
-- ============================================================
IF OBJECT_ID('dbo.sp_CrearReserva', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_CrearReserva;
GO

CREATE PROCEDURE dbo.sp_CrearReserva
    @id_huesped         INT,
    @fecha_entrada      DATE,
    @fecha_salida       DATE,
    @habitaciones       NVARCHAR(MAX),   -- Lista de id_habitacion separados por coma: '1,5,10'
    @notas              NVARCHAR(500)    = NULL,
    @usuario            NVARCHAR(100)    = NULL,
    @id_reserva_out     INT              = NULL OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @id_reserva     INT;
    DECLARE @total          DECIMAL(12,2) = 0;
    DECLARE @noches         INT;
    DECLARE @id_hab         INT;
    DECLARE @precio_noche   DECIMAL(10,2);
    DECLARE @subtotal_hab   DECIMAL(12,2);

    -- Validaciones
    IF NOT EXISTS (SELECT 1 FROM dbo.Huespedes WHERE id_huesped = @id_huesped AND estado = 'Activo')
    BEGIN
        RAISERROR('Error: El huésped no existe o está inactivo.', 16, 1);
        RETURN;
    END

    IF @fecha_salida <= @fecha_entrada
    BEGIN
        RAISERROR('Error: La fecha de salida debe ser posterior a la fecha de entrada.', 16, 1);
        RETURN;
    END

    -- Calcular número de noches
    SET @noches = DATEDIFF(DAY, @fecha_entrada, @fecha_salida);

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Crear la reserva maestro
        INSERT INTO dbo.Reservas (id_huesped, fecha_entrada, fecha_salida, estado, notas, total)
        VALUES (@id_huesped, @fecha_entrada, @fecha_salida, 'Confirmada', @notas, 0);

        SET @id_reserva = SCOPE_IDENTITY();

        -- Procesar cada habitación de la lista
        -- Usar tabla temporal para parsear la lista de habitaciones
        DECLARE @HabitacionesTemp TABLE (id_habitacion INT);

        INSERT INTO @HabitacionesTemp (id_habitacion)
        SELECT CAST(value AS INT)
        FROM STRING_SPLIT(@habitaciones, ',')
        WHERE LTRIM(RTRIM(value)) <> '';

        -- Validar que todas las habitaciones existan y estén disponibles
        IF EXISTS (
            SELECT 1 FROM @HabitacionesTemp ht
            LEFT JOIN dbo.Habitaciones h ON ht.id_habitacion = h.id_habitacion
            WHERE h.id_habitacion IS NULL OR h.estado <> 'Disponible'
        )
        BEGIN
            RAISERROR('Error: Una o más habitaciones no existen o no están disponibles.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Insertar detalles de reserva para cada habitación
        DECLARE hab_cursor CURSOR LOCAL FAST_FORWARD FOR
            SELECT ht.id_habitacion
            FROM @HabitacionesTemp ht;

        OPEN hab_cursor;
        FETCH NEXT FROM hab_cursor INTO @id_hab;

        WHILE @@FETCH_STATUS = 0
        BEGIN
            -- Obtener precio por noche del tipo de habitación
            SELECT @precio_noche = th.precio_por_noche
            FROM dbo.Habitaciones h
            INNER JOIN dbo.TiposHabitacion th ON h.id_tipo = th.id_tipo
            WHERE h.id_habitacion = @id_hab;

            SET @subtotal_hab = @precio_noche * @noches;
            SET @total = @total + @subtotal_hab;

            -- Insertar detalle
            INSERT INTO dbo.DetallesReserva (id_reserva, id_habitacion, precio_noche, subtotal)
            VALUES (@id_reserva, @id_hab, @precio_noche, @subtotal_hab);

            FETCH NEXT FROM hab_cursor INTO @id_hab;
        END

        CLOSE hab_cursor;
        DEALLOCATE hab_cursor;

        -- Actualizar total de la reserva
        UPDATE dbo.Reservas
        SET total = @total
        WHERE id_reserva = @id_reserva;

        -- Registrar en bitácora
        EXEC dbo.sp_RegistrarBitacora
            @tabla_afectada = 'Reservas',
            @accion         = 'INSERT',
            @id_referencia  = @id_reserva,
            @descripcion    = N'Nueva reserva creada',
            @usuario        = @usuario;

        SET @id_reserva_out = @id_reserva;

        COMMIT TRANSACTION;

        -- Resultado
        SELECT
            r.id_reserva,
            h.nombre + ' ' + h.apellido AS huesped,
            r.fecha_entrada,
            r.fecha_salida,
            @noches AS noches,
            r.total,
            r.estado
        FROM dbo.Reservas r
        INNER JOIN dbo.Huespedes h ON r.id_huesped = h.id_huesped
        WHERE r.id_reserva = @id_reserva;

        PRINT '✅ Reserva #' + CAST(@id_reserva AS VARCHAR) + ' creada exitosamente. Total: $' + CAST(@total AS VARCHAR);

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        RAISERROR(@ErrorMessage, @ErrorSeverity, 1);
    END CATCH
END;
GO

PRINT '✅ Procedimiento sp_CrearReserva creado.';
GO

-- ============================================================
-- 3. sp_RealizarCheckIn - Realizar check-in de una reserva
-- ============================================================
IF OBJECT_ID('dbo.sp_RealizarCheckIn', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_RealizarCheckIn;
GO

CREATE PROCEDURE dbo.sp_RealizarCheckIn
    @id_reserva         INT,
    @observaciones      NVARCHAR(500)   = NULL,
    @usuario_registro   NVARCHAR(100)   = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @estado_actual VARCHAR(20);

    -- Validar que la reserva existe
    SELECT @estado_actual = estado
    FROM dbo.Reservas
    WHERE id_reserva = @id_reserva;

    IF @estado_actual IS NULL
    BEGIN
        RAISERROR('Error: La reserva #%d no existe.', 16, 1, @id_reserva);
        RETURN;
    END

    -- Validar estado
    IF @estado_actual NOT IN ('Confirmada', 'Pendiente')
    BEGIN
        RAISERROR('Error: La reserva #%d no está en estado válido para check-in. Estado actual: %s', 16, 1, @id_reserva, @estado_actual);
        RETURN;
    END

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Crear registro de check-in
        INSERT INTO dbo.CheckIns (id_reserva, observaciones, usuario_registro)
        VALUES (@id_reserva, @observaciones, @usuario_registro);

        -- Actualizar estado de la reserva
        UPDATE dbo.Reservas
        SET estado = 'CheckIn'
        WHERE id_reserva = @id_reserva;

        -- Actualizar estado de las habitaciones a 'Ocupada'
        UPDATE h
        SET h.estado = 'Ocupada'
        FROM dbo.Habitaciones h
        INNER JOIN dbo.DetallesReserva dr ON h.id_habitacion = dr.id_habitacion
        WHERE dr.id_reserva = @id_reserva;

        -- Registrar en bitácora
        EXEC dbo.sp_RegistrarBitacora
            @tabla_afectada = 'CheckIns',
            @accion         = 'INSERT',
            @id_referencia  = @id_reserva,
            @descripcion    = N'Check-in realizado',
            @usuario        = @usuario_registro;

        COMMIT TRANSACTION;

        -- Mostrar información del check-in
        SELECT
            ci.id_checkin,
            r.id_reserva,
            hu.nombre + ' ' + hu.apellido AS huesped,
            STRING_AGG(hab.numero_habitacion, ', ') AS habitaciones,
            ci.fecha_checkin,
            r.fecha_salida,
            r.total AS total_reserva
        FROM dbo.CheckIns ci
        INNER JOIN dbo.Reservas r ON ci.id_reserva = r.id_reserva
        INNER JOIN dbo.Huespedes hu ON r.id_huesped = hu.id_huesped
        INNER JOIN dbo.DetallesReserva dr ON r.id_reserva = dr.id_reserva
        INNER JOIN dbo.Habitaciones hab ON dr.id_habitacion = hab.id_habitacion
        WHERE ci.id_reserva = @id_reserva
        GROUP BY ci.id_checkin, r.id_reserva, hu.nombre, hu.apellido, ci.fecha_checkin, r.fecha_salida, r.total;

        PRINT '✅ Check-in realizado exitosamente para la reserva #' + CAST(@id_reserva AS VARCHAR);

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        RAISERROR(@ErrorMessage, @ErrorSeverity, 1);
    END CATCH
END;
GO

PRINT '✅ Procedimiento sp_RealizarCheckIn creado.';
GO

-- ============================================================
-- 4. sp_RegistrarConsumo - Registrar un consumo de servicio
-- ============================================================
IF OBJECT_ID('dbo.sp_RegistrarConsumo', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_RegistrarConsumo;
GO

CREATE PROCEDURE dbo.sp_RegistrarConsumo
    @id_reserva         INT,
    @id_servicio        INT,
    @cantidad           INT             = 1,
    @notas              NVARCHAR(500)   = NULL,
    @usuario            NVARCHAR(100)   = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @precio_unitario    DECIMAL(10,2);
    DECLARE @subtotal           DECIMAL(12,2);
    DECLARE @nombre_servicio    NVARCHAR(100);
    DECLARE @estado_reserva     VARCHAR(20);

    -- Validar que la reserva existe y está en check-in
    SELECT @estado_reserva = estado
    FROM dbo.Reservas
    WHERE id_reserva = @id_reserva;

    IF @estado_reserva IS NULL
    BEGIN
        RAISERROR('Error: La reserva #%d no existe.', 16, 1, @id_reserva);
        RETURN;
    END

    IF @estado_reserva <> 'CheckIn'
    BEGIN
        RAISERROR('Error: La reserva #%d no está en estado CheckIn. Solo se pueden registrar consumos para huéspedes hospedados.', 16, 1, @id_reserva);
        RETURN;
    END

    -- Validar servicio y obtener precio
    SELECT @precio_unitario = precio, @nombre_servicio = nombre
    FROM dbo.ServiciosAdicionales
    WHERE id_servicio = @id_servicio AND estado = 'Activo';

    IF @precio_unitario IS NULL
    BEGIN
        RAISERROR('Error: El servicio #%d no existe o está inactivo.', 16, 1, @id_servicio);
        RETURN;
    END

    -- Calcular subtotal
    SET @subtotal = @precio_unitario * @cantidad;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Insertar consumo
        INSERT INTO dbo.Consumos (id_reserva, id_servicio, cantidad, precio_unitario, subtotal, notas)
        VALUES (@id_reserva, @id_servicio, @cantidad, @precio_unitario, @subtotal, @notas);

        DECLARE @id_consumo INT = SCOPE_IDENTITY();

        -- Registrar en bitácora
        DECLARE @desc NVARCHAR(1000) = N'Consumo registrado: ' + @nombre_servicio + N' x' + CAST(@cantidad AS NVARCHAR) + N' = $' + CAST(@subtotal AS NVARCHAR);

        EXEC dbo.sp_RegistrarBitacora
            @tabla_afectada = 'Consumos',
            @accion         = 'INSERT',
            @id_referencia  = @id_consumo,
            @descripcion    = @desc,
            @usuario        = @usuario;

        COMMIT TRANSACTION;

        -- Mostrar resultado
        SELECT
            c.id_consumo,
            c.id_reserva,
            sa.nombre AS servicio,
            sa.categoria,
            c.cantidad,
            c.precio_unitario,
            c.subtotal,
            c.fecha_consumo
        FROM dbo.Consumos c
        INNER JOIN dbo.ServiciosAdicionales sa ON c.id_servicio = sa.id_servicio
        WHERE c.id_consumo = @id_consumo;

        PRINT '✅ Consumo registrado: ' + @nombre_servicio + ' x' + CAST(@cantidad AS VARCHAR) + ' = $' + CAST(@subtotal AS VARCHAR);

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        RAISERROR(@ErrorMessage, @ErrorSeverity, 1);
    END CATCH
END;
GO

PRINT '✅ Procedimiento sp_RegistrarConsumo creado.';
GO

-- ============================================================
-- 5. sp_GenerarFactura - Generar factura con ITBIS (18%)
-- ============================================================
IF OBJECT_ID('dbo.sp_GenerarFactura', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_GenerarFactura;
GO

CREATE PROCEDURE dbo.sp_GenerarFactura
    @id_reserva         INT,
    @metodo_pago        NVARCHAR(30),
    @notas              NVARCHAR(500)   = NULL,
    @usuario            NVARCHAR(100)   = NULL,
    @id_factura_out     INT             = NULL OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @subtotal_habitaciones  DECIMAL(12,2) = 0;
    DECLARE @subtotal_consumos      DECIMAL(12,2) = 0;
    DECLARE @subtotal_total         DECIMAL(12,2) = 0;
    DECLARE @impuestos              DECIMAL(12,2) = 0;
    DECLARE @total_factura          DECIMAL(12,2) = 0;
    DECLARE @numero_factura         VARCHAR(20);
    DECLARE @id_factura             INT;

    -- Validar reserva
    IF NOT EXISTS (SELECT 1 FROM dbo.Reservas WHERE id_reserva = @id_reserva)
    BEGIN
        RAISERROR('Error: La reserva #%d no existe.', 16, 1, @id_reserva);
        RETURN;
    END

    -- Validar que no exista factura vigente para esta reserva
    IF EXISTS (SELECT 1 FROM dbo.Facturas WHERE id_reserva = @id_reserva AND estado <> 'Anulada')
    BEGIN
        RAISERROR('Error: Ya existe una factura vigente para la reserva #%d.', 16, 1, @id_reserva);
        RETURN;
    END

    -- Validar método de pago
    IF @metodo_pago NOT IN ('Efectivo', N'Tarjeta Crédito', N'Tarjeta Débito', 'Transferencia')
    BEGIN
        RAISERROR('Error: Método de pago no válido. Use: Efectivo, Tarjeta Crédito, Tarjeta Débito o Transferencia.', 16, 1);
        RETURN;
    END

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Calcular subtotal de habitaciones
        SELECT @subtotal_habitaciones = ISNULL(SUM(subtotal), 0)
        FROM dbo.DetallesReserva
        WHERE id_reserva = @id_reserva;

        -- Calcular subtotal de consumos
        SELECT @subtotal_consumos = ISNULL(SUM(subtotal), 0)
        FROM dbo.Consumos
        WHERE id_reserva = @id_reserva;

        -- Calcular totales
        SET @subtotal_total = @subtotal_habitaciones + @subtotal_consumos;
        SET @impuestos = ROUND(@subtotal_total * 0.18, 2);       -- ITBIS 18%
        SET @total_factura = @subtotal_total + @impuestos;

        -- Generar número de factura: FAC-YYYYMMDD-XXXX
        DECLARE @secuencia INT;
        SELECT @secuencia = ISNULL(MAX(id_factura), 0) + 1 FROM dbo.Facturas;
        SET @numero_factura = 'FAC-' + FORMAT(GETDATE(), 'yyyyMMdd') + '-' + RIGHT('0000' + CAST(@secuencia AS VARCHAR), 4);

        -- Insertar factura
        INSERT INTO dbo.Facturas (id_reserva, numero_factura, subtotal, impuestos, total, metodo_pago, estado, notas)
        VALUES (@id_reserva, @numero_factura, @subtotal_total, @impuestos, @total_factura, @metodo_pago, 'Pendiente', @notas);

        SET @id_factura = SCOPE_IDENTITY();
        SET @id_factura_out = @id_factura;

        -- Actualizar total en la reserva
        UPDATE dbo.Reservas
        SET total = @total_factura
        WHERE id_reserva = @id_reserva;

        -- Registrar en bitácora
        DECLARE @desc NVARCHAR(1000) = N'Factura ' + @numero_factura + N' generada. Total: $' + CAST(@total_factura AS NVARCHAR);

        EXEC dbo.sp_RegistrarBitacora
            @tabla_afectada = 'Facturas',
            @accion         = 'INSERT',
            @id_referencia  = @id_factura,
            @descripcion    = @desc,
            @usuario        = @usuario;

        COMMIT TRANSACTION;

        -- Mostrar factura generada
        PRINT '========================================';
        PRINT '       HOTEL GRAND OASIS';
        PRINT '       FACTURA: ' + @numero_factura;
        PRINT '========================================';

        SELECT
            f.numero_factura,
            f.fecha_factura,
            hu.nombre + ' ' + hu.apellido AS huesped,
            hu.documento_identidad,
            r.fecha_entrada,
            r.fecha_salida,
            DATEDIFF(DAY, r.fecha_entrada, r.fecha_salida) AS noches,
            @subtotal_habitaciones AS subtotal_habitaciones,
            @subtotal_consumos AS subtotal_consumos,
            f.subtotal AS subtotal_general,
            f.impuestos AS itbis_18_porciento,
            f.total AS total_a_pagar,
            f.metodo_pago,
            f.estado
        FROM dbo.Facturas f
        INNER JOIN dbo.Reservas r ON f.id_reserva = r.id_reserva
        INNER JOIN dbo.Huespedes hu ON r.id_huesped = hu.id_huesped
        WHERE f.id_factura = @id_factura;

        -- Detalle de habitaciones
        PRINT '--- Detalle de Habitaciones ---';
        SELECT
            hab.numero_habitacion,
            th.nombre AS tipo_habitacion,
            dr.precio_noche,
            DATEDIFF(DAY, r.fecha_entrada, r.fecha_salida) AS noches,
            dr.subtotal
        FROM dbo.DetallesReserva dr
        INNER JOIN dbo.Habitaciones hab ON dr.id_habitacion = hab.id_habitacion
        INNER JOIN dbo.TiposHabitacion th ON hab.id_tipo = th.id_tipo
        INNER JOIN dbo.Reservas r ON dr.id_reserva = r.id_reserva
        WHERE dr.id_reserva = @id_reserva;

        -- Detalle de consumos
        PRINT '--- Detalle de Consumos ---';
        SELECT
            sa.nombre AS servicio,
            sa.categoria,
            c.cantidad,
            c.precio_unitario,
            c.subtotal,
            c.fecha_consumo
        FROM dbo.Consumos c
        INNER JOIN dbo.ServiciosAdicionales sa ON c.id_servicio = sa.id_servicio
        WHERE c.id_reserva = @id_reserva;

        PRINT '✅ Factura ' + @numero_factura + ' generada exitosamente. Total: $' + CAST(@total_factura AS VARCHAR);

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        RAISERROR(@ErrorMessage, @ErrorSeverity, 1);
    END CATCH
END;
GO

PRINT '✅ Procedimiento sp_GenerarFactura creado.';
GO

-- ============================================================
-- 6. sp_RealizarCheckOut - Realizar check-out completo
-- ============================================================
IF OBJECT_ID('dbo.sp_RealizarCheckOut', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_RealizarCheckOut;
GO

CREATE PROCEDURE dbo.sp_RealizarCheckOut
    @id_reserva         INT,
    @metodo_pago        NVARCHAR(30)    = 'Efectivo',
    @observaciones      NVARCHAR(500)   = NULL,
    @usuario_registro   NVARCHAR(100)   = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @estado_actual  VARCHAR(20);
    DECLARE @id_factura     INT;

    -- Validar reserva
    SELECT @estado_actual = estado
    FROM dbo.Reservas
    WHERE id_reserva = @id_reserva;

    IF @estado_actual IS NULL
    BEGIN
        RAISERROR('Error: La reserva #%d no existe.', 16, 1, @id_reserva);
        RETURN;
    END

    IF @estado_actual <> 'CheckIn'
    BEGIN
        RAISERROR('Error: La reserva #%d no está en estado CheckIn. Estado actual: %s', 16, 1, @id_reserva, @estado_actual);
        RETURN;
    END

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Generar factura si no existe una vigente
        IF NOT EXISTS (SELECT 1 FROM dbo.Facturas WHERE id_reserva = @id_reserva AND estado <> 'Anulada')
        BEGIN
            EXEC dbo.sp_GenerarFactura
                @id_reserva     = @id_reserva,
                @metodo_pago    = @metodo_pago,
                @notas          = N'Factura generada automáticamente al momento del check-out',
                @usuario        = @usuario_registro,
                @id_factura_out = @id_factura OUTPUT;
        END
        ELSE
        BEGIN
            SELECT @id_factura = id_factura
            FROM dbo.Facturas
            WHERE id_reserva = @id_reserva AND estado <> 'Anulada';
        END

        -- Marcar factura como pagada
        UPDATE dbo.Facturas
        SET estado = 'Pagada',
            metodo_pago = @metodo_pago
        WHERE id_factura = @id_factura;

        -- Crear registro de check-out
        INSERT INTO dbo.CheckOuts (id_reserva, id_factura, observaciones, usuario_registro)
        VALUES (@id_reserva, @id_factura, @observaciones, @usuario_registro);

        -- Actualizar estado de la reserva
        UPDATE dbo.Reservas
        SET estado = 'CheckOut'
        WHERE id_reserva = @id_reserva;

        -- Liberar habitaciones (cambiar a 'Limpieza')
        UPDATE h
        SET h.estado = 'Limpieza'
        FROM dbo.Habitaciones h
        INNER JOIN dbo.DetallesReserva dr ON h.id_habitacion = dr.id_habitacion
        WHERE dr.id_reserva = @id_reserva;

        -- Registrar en bitácora
        EXEC dbo.sp_RegistrarBitacora
            @tabla_afectada = 'CheckOuts',
            @accion         = 'INSERT',
            @id_referencia  = @id_reserva,
            @descripcion    = N'Check-out realizado, habitaciones enviadas a limpieza',
            @usuario        = @usuario_registro;

        COMMIT TRANSACTION;

        -- Mostrar resumen del check-out
        SELECT
            co.id_checkout,
            r.id_reserva,
            hu.nombre + ' ' + hu.apellido AS huesped,
            f.numero_factura,
            f.total AS total_pagado,
            f.metodo_pago,
            co.fecha_checkout,
            co.observaciones
        FROM dbo.CheckOuts co
        INNER JOIN dbo.Reservas r ON co.id_reserva = r.id_reserva
        INNER JOIN dbo.Huespedes hu ON r.id_huesped = hu.id_huesped
        INNER JOIN dbo.Facturas f ON co.id_factura = f.id_factura
        WHERE co.id_reserva = @id_reserva;

        PRINT '✅ Check-out completado exitosamente para la reserva #' + CAST(@id_reserva AS VARCHAR);

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        RAISERROR(@ErrorMessage, @ErrorSeverity, 1);
    END CATCH
END;
GO

PRINT '✅ Procedimiento sp_RealizarCheckOut creado.';
GO

-- ============================================================
PRINT '========================================================';
PRINT '✅ TODOS LOS PROCEDIMIENTOS ALMACENADOS CREADOS';
PRINT '   Hotel Grand Oasis - Sistema de Gestión Hotelera';
PRINT '========================================================';
GO
