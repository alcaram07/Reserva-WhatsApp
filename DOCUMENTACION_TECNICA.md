# Documentación Técnica - Sistema de Reservas (Barbería)

Este documento detalla la arquitectura y configuración de despliegue para asegurar la continuidad del proyecto en futuras modificaciones.

## 🏗️ Arquitectura General
El proyecto es una aplicación FullStack dividida en dos partes:
- **Frontend:** React (Vite + TypeScript) con Tailwind/CSS moderno.
- **Backend:** .NET 9 Web API (C#) ejecutándose en un contenedor Docker.
- **Base de Datos:** PostgreSQL gestionado en la nube (Neon.tech).

## 🚀 Despliegue Actual (Producción)

### 1. Backend (Render.com)
- **Servicio:** Web Service (Docker).
- **URL:** `https://reserva-whatsapp.onrender.com`
- **Variables de Entorno Críticas:**
  - `DATABASE_URL`: Cadena de conexión de Neon PostgreSQL.
  - `ASPNETCORE_ENVIRONMENT`: `Production`
  - `PORT`: `8080`
- **Dockerfile:** Ubicado en `/server/Dockerfile`. Utiliza .NET 9 sobre Alpine Linux.

### 2. Frontend (Vercel.com)
- **Framework:** Vite / React.
- **URL:** `https://reserva-whatsapp.vercel.app` (URL de cliente).
- **Variables de Env Críticas:**
  - `VITE_API_URL`: `https://reserva-whatsapp.onrender.com` (Apunta al backend de Render).

### 3. Base de Datos (Neon.tech)
- **Motor:** PostgreSQL.
- **Modo:** Serverless (Escalado automático).
- **Gestión:** El backend aplica las migraciones de Entity Framework automáticamente al iniciar (`context.Database.Migrate()`).

## 🛠️ Flujo de Desarrollo y Cambios

Para realizar modificaciones en el futuro, sigue este flujo:

1. **Local:** Realiza los cambios en el código.
   - La base de datos local sigue usando **SQLite** (`barberia.db`) por defecto para facilitar el desarrollo sin internet.
2. **Pruebas:** Verifica que todo funcione en `localhost`.
3. **Subida:** Ejecuta los comandos de Git:
   ```bash
   git add .
   git commit -m "Descripción del cambio"
   git push origin main
   ```
4. **Auto-Deploy:** Al hacer `push`, Render y Vercel detectarán los cambios y actualizarán los sitios automáticamente en 2-3 minutos.

## 📁 Archivos Clave
- `src/App.tsx`: Lógica principal del Frontend y llamadas a la API.
- `server/Program.cs`: Configuración del servidor, CORS y conexión a base de datos dinámica (Postgres/SQLite).
- `server/Data/ReservaDbContext.cs`: Definición de las tablas de la base de datos.
- `server/Controllers/`: Endpoints de la API para reservas, servicios y configuración.

---
*Documento generado para referencia de mantenimiento y escalabilidad.*
