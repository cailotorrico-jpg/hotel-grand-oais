-- ============================================================
-- HOTEL GRAND OASIS - Vistas y Consultas de Ejemplo
-- SQL Server 2022
-- Archivo: 05_views_and_queries.sql
-- Descripción: Vistas para reportes y consultas demostrativas
--              de JOINs, subconsultas y transacciones.
-- ============================================================

USE HotelGrandOasis;
GO

-- ============================================================
-- VISTA 1: vw_ReservasCompletas
-- Descripción: Vista completa de reservas con información
--              del huésped, habitaciones y tipo.
-- JOINs utilizados: INNER JOIN (múltiples tablas)
-- ============================================================
IF OBJECT_ID('dbo.vw_ReservasCompletas', 'V') IS NOT NULL
    DROP VIEW dbo.vw_ReservasCompletas;
GO

CREATE VIEW dbo.vw_ReservasCompletas
AS
SELECT
    r.id_reserva,
    r.fecha_reserva,
    r.fecha_entrada,
    r.fecha_salida,
    DATEDIFF(DAY, r.fecha_entrada, r.fecha_salida)     AS noches,
    r.estado                                            AS estado_reserva,

    -- Información del huésped
    h.id_huesped,
    h.nombre + ' ' + h.apellido                        AS nombre_huesped,
    h.documento_identidad,
    h.tipo_documento,
    h.telefono,
    h.email,
    h.pais,

    -- Información de habitación(es) y tipo
    dr.id_detalle,
    hab.numero_habitacion,
    hab.piso,
    hab.estado                                          AS estado_habitacion,
    th.nombre                                           AS tipo_habitacion,
    th.capacidad_maxima,

    -- Montos
    dr.precio_noche,
    dr.subtotal                                         AS subtotal_habitacion,
    r.total                                             AS total_reserva,
    r.notas
FROM dbo.Reservas r
INNER JOIN dbo.Huespedes h          ON r.id_huesped     = h.id_huesped
INNER JOIN dbo.DetallesReserva dr   ON r.id_reserva     = dr.id_reserva
INNER JOIN dbo.Habitaciones hab     ON dr.id_habitacion  = hab.id_habitacion
INNER JOIN dbo.TiposHabitacion th   ON hab.id_tipo       = th.id_tipo;
GO

PRINT '✅ Vista vw_ReservasCompletas creada.';
GO

-- ============================================================
-- VISTA 2: vw_HabitacionesDisponibles
-- Descripción: Habitaciones disponibles con detalle de tipo y precio.
-- ============================================================
IF OBJECT_ID('dbo.vw_HabitacionesDisponibles', 'V') IS NOT NULL
    DROP VIEW dbo.vw_HabitacionesDisponibles;
GO

CREATE VIEW dbo.vw_HabitacionesDisponibles
AS
SELECT
    h.id_habitacion,
    h.numero_habitacion,
    h.piso,
    h.estado,
    h.notas,
    th.id_tipo,
    th.nombre               AS tipo_habitacion,
    th.descripcion          AS descripcion_tipo,
    th.precio_por_noche,
    th.capacidad_maxima
FROM dbo.Habitaciones h
INNER JOIN dbo.TiposHabitacion th ON h.id_tipo = th.id_tipo
WHERE h.estado = 'Disponible'
  AND th.estado = 'Activo';
GO

PRINT '✅ Vista vw_HabitacionesDisponibles creada.';
GO

-- ============================================================
-- VISTA 3: vw_OcupacionActual
-- Descripción: Ocupación actual del hotel - habitaciones
--              ocupadas con info del huésped hospedado.
-- ============================================================
IF OBJECT_ID('dbo.vw_OcupacionActual', 'V') IS NOT NULL
    DROP VIEW dbo.vw_OcupacionActual;
GO

CREATE VIEW dbo.vw_OcupacionActual
AS
SELECT
    hab.numero_habitacion,
    hab.piso,
    th.nombre                                           AS tipo_habitacion,
    th.precio_por_noche,
    h.nombre + ' ' + h.apellido                        AS huesped,
    h.documento_identidad,
    h.telefono,
    r.id_reserva,
    r.fecha_entrada,
    r.fecha_salida,
    DATEDIFF(DAY, r.fecha_entrada, r.fecha_salida)     AS noches_totales,
    DATEDIFF(DAY, r.fecha_entrada, GETDATE())          AS noches_transcurridas,
    ci.fecha_checkin,
    ci.usuario_registro                                AS registrado_por
FROM dbo.Habitaciones hab
INNER JOIN dbo.TiposHabitacion th   ON hab.id_tipo          = th.id_tipo
INNER JOIN dbo.DetallesReserva dr   ON hab.id_habitacion    = dr.id_habitacion
INNER JOIN dbo.Reservas r           ON dr.id_reserva        = r.id_reserva
INNER JOIN dbo.Huespedes h          ON r.id_huesped         = h.id_huesped
LEFT  JOIN dbo.CheckIns ci          ON r.id_reserva         = ci.id_reserva
WHERE r.estado = 'CheckIn'
  AND hab.estado = 'Ocupada';
GO

PRINT '✅ Vista vw_OcupacionActual creada.';
GO

-- ============================================================
-- VISTA 4: vw_FacturacionDetallada
-- Descripción: Facturación con desglose completo de cargos
--              por habitación y consumos adicionales.
-- ============================================================
IF OBJECT_ID('dbo.vw_FacturacionDetallada', 'V') IS NOT NULL
    DROP VIEW dbo.vw_FacturacionDetallada;
GO

CREATE VIEW dbo.vw_FacturacionDetallada
AS
SELECT
    f.id_factura,
    f.numero_factura,
    f.fecha_factura,
    f.estado                                            AS estado_factura,
    f.metodo_pago,

    -- Huésped
    hu.nombre + ' ' + hu.apellido                      AS huesped,
    hu.documento_identidad,

    -- Reserva
    r.id_reserva,
    r.fecha_entrada,
    r.fecha_salida,
    DATEDIFF(DAY, r.fecha_entrada, r.fecha_salida)     AS noches,

    -- Montos
    f.subtotal,
    f.impuestos                                         AS itbis_18,
    f.total,
    f.notas
FROM dbo.Facturas f
INNER JOIN dbo.Reservas r   ON f.id_reserva     = r.id_reserva
INNER JOIN dbo.Huespedes hu ON r.id_huesped     = hu.id_huesped;
GO

PRINT '✅ Vista vw_FacturacionDetallada creada.';
GO

-- ============================================================
-- VISTA 5: vw_EstadisticasHotel
-- Descripción: Dashboard de estadísticas generales del hotel.
-- ============================================================
IF OBJECT_ID('dbo.vw_EstadisticasHotel', 'V') IS NOT NULL
    DROP VIEW dbo.vw_EstadisticasHotel;
GO

CREATE VIEW dbo.vw_EstadisticasHotel
AS
SELECT
    -- Total de habitaciones por estado
    (SELECT COUNT(*) FROM dbo.Habitaciones)                                             AS total_habitaciones,
    (SELECT COUNT(*) FROM dbo.Habitaciones WHERE estado = 'Disponible')                 AS habitaciones_disponibles,
    (SELECT COUNT(*) FROM dbo.Habitaciones WHERE estado = 'Ocupada')                    AS habitaciones_ocupadas,
    (SELECT COUNT(*) FROM dbo.Habitaciones WHERE estado = 'Mantenimiento')              AS habitaciones_mantenimiento,
    (SELECT COUNT(*) FROM dbo.Habitaciones WHERE estado = 'Limpieza')                   AS habitaciones_limpieza,

    -- Porcentaje de ocupación
    CAST(
        ROUND(
            (SELECT COUNT(*) FROM dbo.Habitaciones WHERE estado = 'Ocupada') * 100.0 /
            NULLIF((SELECT COUNT(*) FROM dbo.Habitaciones), 0)
        , 2) AS DECIMAL(5,2))                                                           AS porcentaje_ocupacion,

    -- Reservas
    (SELECT COUNT(*) FROM dbo.Reservas)                                                 AS total_reservas,
    (SELECT COUNT(*) FROM dbo.Reservas WHERE estado = 'Pendiente')                      AS reservas_pendientes,
    (SELECT COUNT(*) FROM dbo.Reservas WHERE estado = 'Confirmada')                     AS reservas_confirmadas,
    (SELECT COUNT(*) FROM dbo.Reservas WHERE estado = 'CheckIn')                        AS reservas_checkin_activo,
    (SELECT COUNT(*) FROM dbo.Reservas WHERE estado = 'CheckOut')                       AS reservas_checkout,
    (SELECT COUNT(*) FROM dbo.Reservas WHERE estado = 'Cancelada')                      AS reservas_canceladas,

    -- Huéspedes
    (SELECT COUNT(*) FROM dbo.Huespedes WHERE estado = 'Activo')                        AS huespedes_activos,

    -- Facturación
    (SELECT ISNULL(SUM(total), 0) FROM dbo.Facturas WHERE estado = 'Pagada')            AS ingresos_totales,
    (SELECT ISNULL(SUM(total), 0) FROM dbo.Facturas WHERE estado = 'Pendiente')         AS facturas_pendientes_monto,
    (SELECT COUNT(*) FROM dbo.Facturas WHERE estado = 'Pendiente')                      AS facturas_pendientes_cantidad,

    -- Consumos
    (SELECT ISNULL(SUM(subtotal), 0) FROM dbo.Consumos)                                 AS total_consumos_registrados;
GO

PRINT '✅ Vista vw_EstadisticasHotel creada.';
GO


-- ============================================================
-- ============================================================
--      CONSULTAS DE EJEMPLO - LABORATORIO DE JOINs
-- ============================================================
-- ============================================================

PRINT '';
PRINT '========================================================';
PRINT '  CONSULTAS DE EJEMPLO - LABORATORIO DE JOINs';
PRINT '========================================================';
PRINT '';
GO

-- ============================================================
-- EJEMPLO 1: INNER JOIN
-- Obtener todas las reservas con datos del huésped
-- Solo muestra registros donde hay coincidencia en ambas tablas
-- ============================================================
PRINT '--- EJEMPLO 1: INNER JOIN - Reservas con datos del huésped ---';

SELECT
    r.id_reserva,
    h.nombre + ' ' + h.apellido        AS huesped,
    h.pais,
    r.fecha_entrada,
    r.fecha_salida,
    r.estado,
    r.total
FROM dbo.Reservas r
INNER JOIN dbo.Huespedes h ON r.id_huesped = h.id_huesped
ORDER BY r.fecha_entrada;
GO

-- ============================================================
-- EJEMPLO 2: LEFT JOIN (LEFT OUTER JOIN)
-- Listar TODOS los huéspedes y sus reservas (si tienen)
-- Muestra huéspedes sin reservas con valores NULL
-- ============================================================
PRINT '--- EJEMPLO 2: LEFT JOIN - Todos los huéspedes con sus reservas (o sin ellas) ---';

SELECT
    h.id_huesped,
    h.nombre + ' ' + h.apellido        AS huesped,
    h.pais,
    r.id_reserva,
    r.fecha_entrada,
    r.fecha_salida,
    r.estado                            AS estado_reserva,
    CASE
        WHEN r.id_reserva IS NULL THEN 'Sin reservas'
        ELSE 'Tiene reserva(s)'
    END                                 AS situacion
FROM dbo.Huespedes h
LEFT JOIN dbo.Reservas r ON h.id_huesped = r.id_huesped
ORDER BY h.apellido, h.nombre;
GO

-- ============================================================
-- EJEMPLO 3: RIGHT JOIN (RIGHT OUTER JOIN)
-- Listar TODAS las habitaciones y las reservas asignadas
-- Muestra habitaciones sin reserva asignada
-- ============================================================
PRINT '--- EJEMPLO 3: RIGHT JOIN - Todas las habitaciones y sus reservas asignadas ---';

SELECT
    hab.numero_habitacion,
    hab.piso,
    th.nombre                           AS tipo_habitacion,
    hab.estado                          AS estado_habitacion,
    dr.id_reserva,
    r.estado                            AS estado_reserva,
    r.fecha_entrada,
    r.fecha_salida,
    CASE
        WHEN dr.id_reserva IS NULL THEN 'Sin reserva activa'
        ELSE 'Reserva #' + CAST(dr.id_reserva AS VARCHAR)
    END                                 AS asignacion
FROM dbo.DetallesReserva dr
RIGHT JOIN dbo.Habitaciones hab ON dr.id_habitacion = hab.id_habitacion
LEFT JOIN dbo.Reservas r ON dr.id_reserva = r.id_reserva
INNER JOIN dbo.TiposHabitacion th ON hab.id_tipo = th.id_tipo
ORDER BY hab.numero_habitacion;
GO

-- ============================================================
-- EJEMPLO 4: FULL OUTER JOIN
-- Cruce completo entre servicios y consumos
-- Muestra servicios nunca consumidos Y consumos huérfanos
-- ============================================================
PRINT '--- EJEMPLO 4: FULL OUTER JOIN - Servicios vs Consumos ---';

SELECT
    sa.id_servicio,
    sa.nombre                           AS servicio,
    sa.categoria,
    sa.precio                           AS precio_catalogo,
    c.id_consumo,
    c.id_reserva,
    c.cantidad,
    c.subtotal                          AS total_consumido,
    CASE
        WHEN c.id_consumo IS NULL THEN '⚠️ Servicio nunca solicitado'
        WHEN sa.id_servicio IS NULL THEN '⚠️ Consumo sin servicio válido'
        ELSE '✅ Servicio consumido'
    END                                 AS estado_cruce
FROM dbo.ServiciosAdicionales sa
FULL OUTER JOIN dbo.Consumos c ON sa.id_servicio = c.id_servicio
ORDER BY sa.nombre, c.id_consumo;
GO

-- ============================================================
-- EJEMPLO 5: INNER JOIN múltiple (3+ tablas)
-- Detalle completo de consumos por reserva
-- ============================================================
PRINT '--- EJEMPLO 5: INNER JOIN múltiple - Consumos detallados por reserva ---';

SELECT
    r.id_reserva,
    hu.nombre + ' ' + hu.apellido      AS huesped,
    hab.numero_habitacion,
    sa.nombre                           AS servicio,
    sa.categoria,
    c.cantidad,
    c.precio_unitario,
    c.subtotal,
    c.fecha_consumo
FROM dbo.Consumos c
INNER JOIN dbo.Reservas r               ON c.id_reserva     = r.id_reserva
INNER JOIN dbo.Huespedes hu             ON r.id_huesped     = hu.id_huesped
INNER JOIN dbo.ServiciosAdicionales sa  ON c.id_servicio    = sa.id_servicio
INNER JOIN dbo.DetallesReserva dr       ON r.id_reserva     = dr.id_reserva
INNER JOIN dbo.Habitaciones hab         ON dr.id_habitacion = hab.id_habitacion
ORDER BY r.id_reserva, c.fecha_consumo;
GO

-- ============================================================
-- EJEMPLO 6: SUBCONSULTA CORRELACIONADA
-- Huéspedes cuyo gasto total supera el promedio general
-- ============================================================
PRINT '--- EJEMPLO 6: SUBCONSULTA - Huéspedes con gasto superior al promedio ---';

SELECT
    h.nombre + ' ' + h.apellido        AS huesped,
    h.pais,
    r.id_reserva,
    r.total                             AS total_reserva,
    (SELECT AVG(total) FROM dbo.Reservas WHERE total > 0) AS promedio_general
FROM dbo.Huespedes h
INNER JOIN dbo.Reservas r ON h.id_huesped = r.id_huesped
WHERE r.total > (SELECT AVG(total) FROM dbo.Reservas WHERE total > 0)
ORDER BY r.total DESC;
GO

-- ============================================================
-- EJEMPLO 7: SUBCONSULTA con EXISTS
-- Habitaciones que nunca han sido reservadas
-- ============================================================
PRINT '--- EJEMPLO 7: SUBCONSULTA con EXISTS - Habitaciones sin reservas ---';

SELECT
    hab.numero_habitacion,
    hab.piso,
    th.nombre                           AS tipo_habitacion,
    th.precio_por_noche,
    hab.estado
FROM dbo.Habitaciones hab
INNER JOIN dbo.TiposHabitacion th ON hab.id_tipo = th.id_tipo
WHERE NOT EXISTS (
    SELECT 1
    FROM dbo.DetallesReserva dr
    WHERE dr.id_habitacion = hab.id_habitacion
)
ORDER BY hab.numero_habitacion;
GO

-- ============================================================
-- EJEMPLO 8: SUBCONSULTA IN
-- Servicios más populares (que han sido consumidos)
-- ============================================================
PRINT '--- EJEMPLO 8: SUBCONSULTA IN - Servicios populares con estadísticas ---';

SELECT
    sa.nombre                               AS servicio,
    sa.categoria,
    sa.precio                               AS precio_unitario,
    COUNT(c.id_consumo)                     AS veces_solicitado,
    SUM(c.cantidad)                         AS cantidad_total,
    SUM(c.subtotal)                         AS ingresos_generados,
    AVG(c.subtotal)                         AS ticket_promedio
FROM dbo.ServiciosAdicionales sa
INNER JOIN dbo.Consumos c ON sa.id_servicio = c.id_servicio
WHERE sa.id_servicio IN (
    SELECT id_servicio
    FROM dbo.Consumos
    GROUP BY id_servicio
    HAVING COUNT(*) >= 1
)
GROUP BY sa.nombre, sa.categoria, sa.precio
ORDER BY ingresos_generados DESC;
GO

-- ============================================================
-- EJEMPLO 9: Resumen de ocupación por tipo de habitación
-- Usando GROUP BY, HAVING y JOIN
-- ============================================================
PRINT '--- EJEMPLO 9: Ocupación por tipo de habitación ---';

SELECT
    th.nombre                               AS tipo_habitacion,
    th.precio_por_noche,
    COUNT(hab.id_habitacion)                AS total_habitaciones,
    SUM(CASE WHEN hab.estado = 'Disponible' THEN 1 ELSE 0 END)     AS disponibles,
    SUM(CASE WHEN hab.estado = 'Ocupada' THEN 1 ELSE 0 END)        AS ocupadas,
    SUM(CASE WHEN hab.estado = 'Mantenimiento' THEN 1 ELSE 0 END)  AS mantenimiento,
    SUM(CASE WHEN hab.estado = 'Limpieza' THEN 1 ELSE 0 END)       AS limpieza,
    CAST(
        ROUND(
            SUM(CASE WHEN hab.estado = 'Ocupada' THEN 1 ELSE 0 END) * 100.0 /
            COUNT(hab.id_habitacion)
        , 1) AS DECIMAL(5,1))               AS porcentaje_ocupacion
FROM dbo.TiposHabitacion th
INNER JOIN dbo.Habitaciones hab ON th.id_tipo = hab.id_tipo
GROUP BY th.nombre, th.precio_por_noche
HAVING COUNT(hab.id_habitacion) > 0
ORDER BY th.precio_por_noche;
GO

-- ============================================================
-- EJEMPLO 10: TRANSACCIONES - BEGIN TRAN / COMMIT / ROLLBACK
-- Demostración de control transaccional
-- ============================================================
PRINT '--- EJEMPLO 10: Demostración de TRANSACCIONES ---';

-- Ejemplo 10a: Transacción exitosa (COMMIT)
PRINT '  10a: Transacción con COMMIT (se ejecuta completamente)';

BEGIN TRY
    BEGIN TRANSACTION;

    -- Simular cambio de estado de una habitación disponible a limpieza y vuelta
    DECLARE @hab_prueba INT;
    SELECT TOP 1 @hab_prueba = id_habitacion
    FROM dbo.Habitaciones
    WHERE estado = 'Disponible';

    IF @hab_prueba IS NOT NULL
    BEGIN
        -- Paso 1: Cambiar a Limpieza
        UPDATE dbo.Habitaciones
        SET estado = 'Limpieza'
        WHERE id_habitacion = @hab_prueba;

        PRINT '    → Habitación cambiada a Limpieza';

        -- Paso 2: Volver a Disponible (simulando que se completó la limpieza)
        UPDATE dbo.Habitaciones
        SET estado = 'Disponible'
        WHERE id_habitacion = @hab_prueba;

        PRINT '    → Habitación restaurada a Disponible';
    END

    COMMIT TRANSACTION;
    PRINT '    ✅ COMMIT ejecutado - Transacción completada exitosamente';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    PRINT '    ❌ ROLLBACK ejecutado - Error: ' + ERROR_MESSAGE();
END CATCH
GO

-- Ejemplo 10b: Transacción con ROLLBACK (se revierte)
PRINT '  10b: Transacción con ROLLBACK (se revierte intencionalmente)';

BEGIN TRY
    BEGIN TRANSACTION;

    -- Intentar insertar un huésped de prueba
    INSERT INTO dbo.Huespedes (nombre, apellido, documento_identidad, tipo_documento, telefono, pais)
    VALUES (N'TEST', N'ROLLBACK', 'TEST-999999', 'Cédula', '000-000-0000', N'TEST');

    PRINT '    → Huésped de prueba insertado (aún en transacción)';

    -- Verificar que existe dentro de la transacción
    IF EXISTS (SELECT 1 FROM dbo.Huespedes WHERE documento_identidad = 'TEST-999999')
        PRINT '    → Verificación: Huésped EXISTE dentro de la transacción';

    -- Revertir intencionalmente
    ROLLBACK TRANSACTION;
    PRINT '    ⏪ ROLLBACK ejecutado - Transacción revertida intencionalmente';

    -- Verificar que ya no existe
    IF NOT EXISTS (SELECT 1 FROM dbo.Huespedes WHERE documento_identidad = 'TEST-999999')
        PRINT '    ✅ Verificación: Huésped NO existe después del ROLLBACK';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    PRINT '    ❌ Error inesperado: ' + ERROR_MESSAGE();
END CATCH
GO

-- Ejemplo 10c: Transacción con SAVE POINT (punto de guardado parcial)
PRINT '  10c: Transacción con SAVE POINT (reversión parcial)';

BEGIN TRY
    BEGIN TRANSACTION;

    -- Insertar un huésped de prueba
    INSERT INTO dbo.Huespedes (nombre, apellido, documento_identidad, tipo_documento, telefono, pais)
    VALUES (N'Prueba', N'SavePoint', 'SP-123456789', 'Pasaporte', '000-000-0001', N'Test');

    PRINT '    → Huésped de prueba insertado';

    -- Crear punto de guardado
    SAVE TRANSACTION PuntoGuardado1;
    PRINT '    💾 SAVE POINT creado: PuntoGuardado1';

    -- Intentar insertar un duplicado (esto fallaría por la constraint UNIQUE)
    -- En su lugar, insertamos otro registro y lo revertimos parcialmente
    INSERT INTO dbo.Bitacora (tabla_afectada, accion, descripcion, usuario)
    VALUES ('TEST', 'INSERT', N'Registro de prueba para SAVE POINT', N'sistema_test');

    PRINT '    → Registro de bitácora de prueba insertado';

    -- Revertir solo hasta el save point (el huésped se mantiene, la bitácora se revierte)
    ROLLBACK TRANSACTION PuntoGuardado1;
    PRINT '    ⏪ ROLLBACK hasta PuntoGuardado1 - Bitácora de prueba revertida';

    -- Ahora revertir todo
    ROLLBACK TRANSACTION;
    PRINT '    ⏪ ROLLBACK completo - Todo revertido (incluido el huésped)';

    IF NOT EXISTS (SELECT 1 FROM dbo.Huespedes WHERE documento_identidad = 'SP-123456789')
        PRINT '    ✅ Verificación: Huésped de prueba NO existe después del ROLLBACK completo';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    PRINT '    ❌ Error: ' + ERROR_MESSAGE();
END CATCH
GO

-- ============================================================
-- CONSULTAS ÚTILES ADICIONALES
-- ============================================================

-- Consultar el dashboard de estadísticas
PRINT '--- Dashboard de Estadísticas del Hotel ---';
SELECT * FROM dbo.vw_EstadisticasHotel;
GO

-- Consultar las reservas completas
PRINT '--- Reservas Completas ---';
SELECT * FROM dbo.vw_ReservasCompletas ORDER BY id_reserva;
GO

-- Consultar habitaciones disponibles
PRINT '--- Habitaciones Disponibles ---';
SELECT * FROM dbo.vw_HabitacionesDisponibles ORDER BY piso, numero_habitacion;
GO

-- Consultar ocupación actual
PRINT '--- Ocupación Actual ---';
SELECT * FROM dbo.vw_OcupacionActual ORDER BY numero_habitacion;
GO

-- ============================================================
PRINT '========================================================';
PRINT '✅ TODAS LAS VISTAS Y CONSULTAS EJECUTADAS EXITOSAMENTE';
PRINT '   Hotel Grand Oasis - Sistema de Gestión Hotelera';
PRINT '========================================================';
GO
