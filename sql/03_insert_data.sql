-- ============================================================
-- HOTEL GRAND OASIS - Datos de Ejemplo (Seed Data)
-- SQL Server 2022
-- Archivo: 03_insert_data.sql
-- Descripción: Inserta datos iniciales para pruebas y
--              demostración del sistema.
-- ============================================================

USE HotelGrandOasis;
GO

-- ============================================================
-- 1. TIPOS DE HABITACIÓN (5 tipos con precios en USD)
-- ============================================================
PRINT '📦 Insertando tipos de habitación...';

SET IDENTITY_INSERT dbo.TiposHabitacion ON;

MERGE INTO dbo.TiposHabitacion AS target
USING (VALUES
    (1, N'Estándar',          N'Habitación cómoda con cama doble, aire acondicionado, TV por cable, Wi-Fi gratuito y baño privado.',                                85.00,  2, 'Activo'),
    (2, N'Superior',          N'Habitación amplia con cama king size, escritorio de trabajo, minibar, vista al jardín y balcón privado.',                           120.00,  2, 'Activo'),
    (3, N'Deluxe',            N'Habitación premium con sala de estar, cama king size, jacuzzi, minibar premium, vista al mar y servicio de mayordomo.',             180.00,  3, 'Activo'),
    (4, N'Suite',             N'Suite de lujo con sala y comedor separados, dos baños, cocina pequeña, terraza privada y vista panorámica.',                        280.00,  4, 'Activo'),
    (5, N'Suite Presidencial', N'La suite más exclusiva con 2 habitaciones, sala de conferencias privada, terraza con piscina, chef personal y servicio 24 horas.', 450.00,  6, 'Activo')
) AS source (id_tipo, nombre, descripcion, precio_por_noche, capacidad_maxima, estado)
ON target.id_tipo = source.id_tipo
WHEN NOT MATCHED THEN
    INSERT (id_tipo, nombre, descripcion, precio_por_noche, capacidad_maxima, estado)
    VALUES (source.id_tipo, source.nombre, source.descripcion, source.precio_por_noche, source.capacidad_maxima, source.estado);

SET IDENTITY_INSERT dbo.TiposHabitacion OFF;

PRINT '✅ Tipos de habitación insertados.';
GO

-- ============================================================
-- 2. HABITACIONES (20 habitaciones en 4 pisos)
-- ============================================================
PRINT '📦 Insertando habitaciones...';

-- Piso 1: 4 habitaciones (101-104) - Estándar y Superior
IF NOT EXISTS (SELECT 1 FROM dbo.Habitaciones WHERE numero_habitacion = '101')
    INSERT INTO dbo.Habitaciones (numero_habitacion, id_tipo, piso, estado, notas) VALUES
    ('101', 1, 1, 'Disponible', N'Planta baja, acceso para personas con movilidad reducida'),
    ('102', 1, 1, 'Disponible', N'Planta baja, cerca de recepción'),
    ('103', 2, 1, 'Disponible', N'Vista al jardín interior'),
    ('104', 2, 1, 'Disponible', N'Vista al jardín, esquinera');

-- Piso 2: 5 habitaciones (201-205) - Estándar, Superior y Deluxe
IF NOT EXISTS (SELECT 1 FROM dbo.Habitaciones WHERE numero_habitacion = '201')
    INSERT INTO dbo.Habitaciones (numero_habitacion, id_tipo, piso, estado, notas) VALUES
    ('201', 1, 2, 'Disponible', N'Vista lateral'),
    ('202', 2, 2, 'Disponible', N'Vista al jardín con balcón'),
    ('203', 2, 2, 'Disponible', N'Vista al jardín con balcón amplio'),
    ('204', 3, 2, 'Disponible', N'Vista al mar, jacuzzi renovado'),
    ('205', 3, 2, 'Disponible', N'Vista al mar, esquinera premium');

-- Piso 3: 5 habitaciones (301-305) - Superior, Deluxe y Suite
IF NOT EXISTS (SELECT 1 FROM dbo.Habitaciones WHERE numero_habitacion = '301')
    INSERT INTO dbo.Habitaciones (numero_habitacion, id_tipo, piso, estado, notas) VALUES
    ('301', 2, 3, 'Disponible', N'Vista panorámica lateral'),
    ('302', 3, 3, 'Disponible', N'Vista al mar, recientemente renovada'),
    ('303', 3, 3, 'Disponible', N'Vista al mar, esquinera con terraza'),
    ('304', 4, 3, 'Disponible', N'Suite con vista panorámica al mar'),
    ('305', 4, 3, 'Disponible', N'Suite esquinera, la más amplia del piso');

-- Piso 4: 6 habitaciones (401-406) - Deluxe, Suite y Presidencial
IF NOT EXISTS (SELECT 1 FROM dbo.Habitaciones WHERE numero_habitacion = '401')
    INSERT INTO dbo.Habitaciones (numero_habitacion, id_tipo, piso, estado, notas) VALUES
    ('401', 3, 4, 'Disponible', N'Piso ejecutivo, vista panorámica'),
    ('402', 3, 4, 'Disponible', N'Piso ejecutivo, lounge acceso'),
    ('403', 4, 4, 'Disponible', N'Suite ejecutiva, sala de reuniones'),
    ('404', 4, 4, 'Disponible', N'Suite ejecutiva premium, terraza amplia'),
    ('405', 5, 4, 'Disponible', N'Suite Presidencial, piscina privada en terraza'),
    ('406', 5, 4, 'Mantenimiento', N'Suite Presidencial en renovación, disponible próximo mes');

PRINT '✅ Habitaciones insertadas.';
GO

-- ============================================================
-- 3. HUÉSPEDES (10 con nombres dominicanos/latinoamericanos)
-- ============================================================
PRINT '📦 Insertando huéspedes...';

IF NOT EXISTS (SELECT 1 FROM dbo.Huespedes WHERE documento_identidad = '001-1234567-8')
    INSERT INTO dbo.Huespedes (nombre, apellido, documento_identidad, tipo_documento, telefono, email, direccion, pais) VALUES
    (N'Carlos Alberto',  N'Rodríguez Peña',    '001-1234567-8', 'Cédula',    '809-555-0101', 'carlos.rodriguez@email.com',   N'Av. Winston Churchill #45, Santo Domingo',           N'República Dominicana'),
    (N'María Elena',     N'García Santana',     '002-9876543-1', 'Cédula',    '809-555-0202', 'maria.garcia@email.com',       N'C/ El Conde #120, Zona Colonial, Santo Domingo',     N'República Dominicana'),
    (N'José Manuel',     N'Martínez Vásquez',   '003-4567890-2', 'Cédula',    '829-555-0303', 'jose.martinez@email.com',      N'Av. 27 de Febrero #300, Santiago',                    N'República Dominicana'),
    (N'Ana Sofía',       N'Hernández Medina',   '004-3216549-7', 'Cédula',    '849-555-0404', 'ana.hernandez@email.com',      N'C/ Duarte #55, La Vega',                              N'República Dominicana'),
    (N'Roberto',         N'Fernández López',    'PA-78901234',   'Pasaporte', '+57-310-5550505', 'roberto.fernandez@email.com', N'Cra 15 #93-75, Bogotá',                              N'Colombia'),
    (N'Valentina',       N'Morales Jiménez',    'PA-45678901',   'Pasaporte', '+52-55-5550606',  'valentina.morales@email.com', N'Av. Reforma #250, Ciudad de México',                 N'México'),
    (N'Luis Enrique',    N'Pérez Castillo',     '005-6543210-3', 'Cédula',    '809-555-0707', 'luis.perez@email.com',          N'Av. Independencia #180, Santo Domingo',               N'República Dominicana'),
    (N'Carmen Rosa',     N'Díaz Mejía',         '006-1472583-6', 'Cédula',    '829-555-0808', 'carmen.diaz@email.com',         N'C/ Mella #90, San Pedro de Macorís',                  N'República Dominicana'),
    (N'Andrés Felipe',   N'Vargas Rojas',       'PA-12345678',   'Pasaporte', '+506-8555-0909', 'andres.vargas@email.com',     N'San José Centro, Av. Central',                        N'Costa Rica'),
    (N'Isabella',        N'Ramírez Torres',     '130567890',     'RNC',       '809-555-1010', 'isabella.ramirez@empresa.com',  N'Torre Empresarial, Av. Sarasota #25, Santo Domingo',  N'República Dominicana');

PRINT '✅ Huéspedes insertados.';
GO

-- ============================================================
-- 4. SERVICIOS ADICIONALES (8 servicios)
-- ============================================================
PRINT '📦 Insertando servicios adicionales...';

IF NOT EXISTS (SELECT 1 FROM dbo.ServiciosAdicionales WHERE nombre = N'Masaje Relajante Spa')
    INSERT INTO dbo.ServiciosAdicionales (nombre, descripcion, precio, categoria) VALUES
    (N'Masaje Relajante Spa',       N'Masaje corporal completo de 60 minutos con aromaterapia y aceites esenciales',            75.00,  'Spa'),
    (N'Cena Buffet Restaurante',    N'Cena buffet internacional con estación de carnes, mariscos, ensaladas y postres',         45.00,  'Restaurante'),
    (N'Servicio de Lavandería',     N'Lavado, secado y planchado de hasta 10 prendas con entrega en 24 horas',                  25.00,  'Lavandería'),
    (N'Minibar Premium',            N'Reposición completa del minibar: bebidas, snacks, licores premium y agua importada',      35.00,  'Minibar'),
    (N'Transfer Aeropuerto',        N'Transporte privado ida y vuelta al Aeropuerto Internacional Las Américas (AILA)',         60.00,  'Transporte'),
    (N'Acceso Gimnasio Premium',    N'Acceso diario al gimnasio con entrenador personal y clase grupal incluida',               20.00,  'Otros'),
    (N'Room Service Desayuno',      N'Desayuno completo servido en la habitación: jugo, frutas, huevos, café y pan artesanal',  28.00,  'Restaurante'),
    (N'Estacionamiento VIP',        N'Estacionamiento cubierto con seguridad 24/7 y servicio de valet parking',                 15.00,  'Transporte');

PRINT '✅ Servicios adicionales insertados.';
GO

-- ============================================================
-- 5. RESERVAS DE EJEMPLO (5 reservas con detalles)
-- ============================================================
PRINT '📦 Insertando reservas de ejemplo...';

-- Reserva 1: Carlos Rodríguez - Habitación Deluxe 204 (3 noches, CheckIn)
IF NOT EXISTS (SELECT 1 FROM dbo.Reservas WHERE id_huesped = 1 AND fecha_entrada = '2024-12-15')
BEGIN
    INSERT INTO dbo.Reservas (id_huesped, fecha_entrada, fecha_salida, estado, notas, total)
    VALUES (1, '2024-12-15', '2024-12-18', 'CheckIn', N'Huésped frecuente, solicita almohadas extra', 540.00);

    INSERT INTO dbo.DetallesReserva (id_reserva, id_habitacion, precio_noche, subtotal)
    VALUES (SCOPE_IDENTITY(), 10, 180.00, 540.00); -- Hab 204 (id=10), 3 noches × $180

    -- Marcar habitación como ocupada
    UPDATE dbo.Habitaciones SET estado = 'Ocupada' WHERE numero_habitacion = '204';
END

-- Reserva 2: María Elena García - Suite 304 (5 noches, CheckIn)
IF NOT EXISTS (SELECT 1 FROM dbo.Reservas WHERE id_huesped = 2 AND fecha_entrada = '2024-12-14')
BEGIN
    INSERT INTO dbo.Reservas (id_huesped, fecha_entrada, fecha_salida, estado, notas, total)
    VALUES (2, '2024-12-14', '2024-12-19', 'CheckIn', N'Celebración de aniversario, decoración especial', 1400.00);

    INSERT INTO dbo.DetallesReserva (id_reserva, id_habitacion, precio_noche, subtotal)
    VALUES (SCOPE_IDENTITY(), 14, 280.00, 1400.00); -- Hab 304 (id=14), 5 noches × $280

    UPDATE dbo.Habitaciones SET estado = 'Ocupada' WHERE numero_habitacion = '304';
END

-- Reserva 3: Roberto Fernández - Estándar 101 (2 noches, Confirmada/Futura)
IF NOT EXISTS (SELECT 1 FROM dbo.Reservas WHERE id_huesped = 5 AND fecha_entrada = '2024-12-20')
BEGIN
    INSERT INTO dbo.Reservas (id_huesped, fecha_entrada, fecha_salida, estado, notas, total)
    VALUES (5, '2024-12-20', '2024-12-22', 'Confirmada', N'Viajero de negocios, necesita early check-in', 170.00);

    INSERT INTO dbo.DetallesReserva (id_reserva, id_habitacion, precio_noche, subtotal)
    VALUES (SCOPE_IDENTITY(), 1, 85.00, 170.00); -- Hab 101 (id=1), 2 noches × $85
END

-- Reserva 4: Valentina Morales - Suite Presidencial 405 (4 noches, Confirmada/Futura)
IF NOT EXISTS (SELECT 1 FROM dbo.Reservas WHERE id_huesped = 6 AND fecha_entrada = '2024-12-22')
BEGIN
    INSERT INTO dbo.Reservas (id_huesped, fecha_entrada, fecha_salida, estado, notas, total)
    VALUES (6, '2024-12-22', '2024-12-26', 'Confirmada', N'Celebridad, requiere máxima privacidad y seguridad', 1800.00);

    INSERT INTO dbo.DetallesReserva (id_reserva, id_habitacion, precio_noche, subtotal)
    VALUES (SCOPE_IDENTITY(), 19, 450.00, 1800.00); -- Hab 405 (id=19), 4 noches × $450
END

-- Reserva 5: Andrés Vargas - Superior 202 + Deluxe 302 (3 noches, Pendiente)
IF NOT EXISTS (SELECT 1 FROM dbo.Reservas WHERE id_huesped = 9 AND fecha_entrada = '2024-12-28')
BEGIN
    DECLARE @id_reserva5 INT;

    INSERT INTO dbo.Reservas (id_huesped, fecha_entrada, fecha_salida, estado, notas, total)
    VALUES (9, '2024-12-28', '2024-12-31', 'Pendiente', N'Viaje familiar, 2 habitaciones conectadas si es posible', 900.00);

    SET @id_reserva5 = SCOPE_IDENTITY();

    INSERT INTO dbo.DetallesReserva (id_reserva, id_habitacion, precio_noche, subtotal) VALUES
    (@id_reserva5, 6,  120.00, 360.00),  -- Hab 202 (id=6), 3 noches × $120
    (@id_reserva5, 12, 180.00, 540.00);  -- Hab 302 (id=12), 3 noches × $180
END

PRINT '✅ Reservas de ejemplo insertadas.';
GO

-- ============================================================
-- 6. CHECK-INS para las reservas activas
-- ============================================================
PRINT '📦 Insertando check-ins...';

-- Check-in para Reserva 1 (Carlos Rodríguez)
IF NOT EXISTS (SELECT 1 FROM dbo.CheckIns WHERE id_reserva = 1)
    INSERT INTO dbo.CheckIns (id_reserva, fecha_checkin, observaciones, usuario_registro)
    VALUES (1, '2024-12-15 14:30:00', N'Huésped llegó a tiempo, se le entregaron llaves y tarjeta de amenidades', N'recepcion_jperez');

-- Check-in para Reserva 2 (María Elena García)
IF NOT EXISTS (SELECT 1 FROM dbo.CheckIns WHERE id_reserva = 2)
    INSERT INTO dbo.CheckIns (id_reserva, fecha_checkin, observaciones, usuario_registro)
    VALUES (2, '2024-12-14 15:00:00', N'Suite decorada para aniversario, botella de champagne de cortesía entregada', N'recepcion_mgarcia');

PRINT '✅ Check-ins insertados.';
GO

-- ============================================================
-- 7. CONSUMOS DE EJEMPLO (vinculados a reservas activas)
-- ============================================================
PRINT '📦 Insertando consumos de ejemplo...';

-- Consumos de Reserva 1 (Carlos Rodríguez - Hab 204)
IF NOT EXISTS (SELECT 1 FROM dbo.Consumos WHERE id_reserva = 1)
BEGIN
    INSERT INTO dbo.Consumos (id_reserva, id_servicio, cantidad, precio_unitario, subtotal, fecha_consumo, notas) VALUES
    (1, 7, 2, 28.00, 56.00,  '2024-12-15 08:00:00', N'Desayuno para 2 personas en la habitación'),
    (1, 4, 1, 35.00, 35.00,  '2024-12-15 20:00:00', N'Minibar consumido parcialmente'),
    (1, 1, 1, 75.00, 75.00,  '2024-12-16 10:00:00', N'Masaje relajante de 60 min en el spa'),
    (1, 2, 1, 45.00, 45.00,  '2024-12-16 19:30:00', N'Cena buffet para 1 persona');
END

-- Consumos de Reserva 2 (María Elena García - Hab 304)
IF NOT EXISTS (SELECT 1 FROM dbo.Consumos WHERE id_reserva = 2)
BEGIN
    INSERT INTO dbo.Consumos (id_reserva, id_servicio, cantidad, precio_unitario, subtotal, fecha_consumo, notas) VALUES
    (2, 5, 1, 60.00, 60.00,   '2024-12-14 12:00:00', N'Transfer desde aeropuerto AILA'),
    (2, 1, 2, 75.00, 150.00,  '2024-12-15 11:00:00', N'Masaje para pareja - paquete aniversario'),
    (2, 2, 2, 45.00, 90.00,   '2024-12-15 20:00:00', N'Cena de aniversario para 2 personas'),
    (2, 7, 3, 28.00, 84.00,   '2024-12-16 08:00:00', N'Room service desayuno 3 mañanas prepagado'),
    (2, 4, 2, 35.00, 70.00,   '2024-12-16 22:00:00', N'Minibar repuesto 2 veces'),
    (2, 8, 5, 15.00, 75.00,   '2024-12-14 15:00:00', N'Estacionamiento VIP por 5 noches');
END

PRINT '✅ Consumos de ejemplo insertados.';
GO

-- ============================================================
-- 8. REGISTROS EN BITÁCORA (auditoría inicial)
-- ============================================================
PRINT '📦 Insertando registros de bitácora...';

IF NOT EXISTS (SELECT 1 FROM dbo.Bitacora WHERE tabla_afectada = 'Reservas' AND id_referencia = 1)
BEGIN
    INSERT INTO dbo.Bitacora (tabla_afectada, accion, id_referencia, descripcion, usuario) VALUES
    ('Reservas',  'INSERT', 1, N'Nueva reserva creada para Carlos Rodríguez - Hab 204, 3 noches',      N'sistema'),
    ('Reservas',  'INSERT', 2, N'Nueva reserva creada para María Elena García - Suite 304, 5 noches',   N'sistema'),
    ('CheckIns',  'INSERT', 1, N'Check-in realizado para reserva #1 - Carlos Rodríguez',               N'recepcion_jperez'),
    ('CheckIns',  'INSERT', 2, N'Check-in realizado para reserva #2 - María Elena García',             N'recepcion_mgarcia'),
    ('Reservas',  'UPDATE', 1, N'Estado de reserva #1 cambiado a CheckIn',                              N'recepcion_jperez'),
    ('Reservas',  'UPDATE', 2, N'Estado de reserva #2 cambiado a CheckIn',                              N'recepcion_mgarcia'),
    ('Consumos',  'INSERT', 1, N'Consumo registrado: Room Service Desayuno x2 para reserva #1',         N'restaurante_admin'),
    ('Consumos',  'INSERT', 2, N'Consumo registrado: Transfer Aeropuerto para reserva #2',              N'recepcion_mgarcia');
END

PRINT '✅ Registros de bitácora insertados.';
GO

-- ============================================================
PRINT '========================================================';
PRINT '✅ TODOS LOS DATOS DE EJEMPLO INSERTADOS EXITOSAMENTE';
PRINT '   Hotel Grand Oasis - Sistema de Gestión Hotelera';
PRINT '========================================================';
GO
