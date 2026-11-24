# Gestión Hotelera Grand Oasis 🏨

Sistema integral de gestión hotelera desarrollado con **React (Vite)** en el frontend, **Node.js (Express)** en el backend y **Microsoft SQL Server** como base de datos.

---

## 🚀 Estructura del Proyecto

```text
gestion-hotelera-oasis/
├── backend/          # API REST con Express y conexión a SQL Server (mssql)
├── frontend/         # Interfaz web con React, Vite y React Router
├── sql/              # Scripts de creación, tablas, datos iniciales y procedimientos
└── README.md
```

---

## 🛠️ Requisitos Previos

- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
- [Microsoft SQL Server](https://www.microsoft.com/sql-server/) y SQL Server Management Studio (SSMS)

---

## ⚙️ Instalación y Puesta en Marcha

### 1. Base de Datos
Ejecutar los scripts de la carpeta `sql/` en SSMS en el siguiente orden:
1. `01_create_database.sql`
2. `02_create_tables.sql`
3. `03_insert_data.sql`
4. `04_stored_procedures.sql`
5. `05_views_and_queries.sql`

### 2. Backend
```bash
cd backend
npm install
```
Crear un archivo `.env` basado en `.env.example` y configurar los parámetros de conexión:
```env
PORT=4000
DB_SERVER=TU_SERVIDOR
DB_DATABASE=HotelGrandOasis
DB_AUTH=windows
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true
```
Iniciar el servidor:
```bash
npm run dev
# o npm start
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Acceder a la aplicación web en `http://localhost:5173`.
