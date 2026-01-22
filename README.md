# TimeTrack Web - Control de Horario

Aplicación web moderna para el control de horarios, gestión de fichajes y administración de empleados. Integrada con Supabase para el backend en tiempo real.

## Características

- 🕒 **Control de Jornada**: Fichaje de entrada, salida y pausas.
- 📊 **Dashboard**: KPIs diarios y semanales en tiempo real.
- 📅 **Historial**: Registro detallado de sesiones de trabajo.
- 📝 **Correcciones**: Sistema de solicitud y aprobación de correcciones de fichaje.
- 👥 **Administración**: Panel para gestores con filtros por empleado.
- 📱 **Diseño Reactivo**: Funciona en escritorio y dispositivos móviles.

## Tecnologías

- **Frontend**: React + Vite
- **Estilos**: CSS Modules (Diseño propio)
- **Gráficos**: Chart.js
- **Backend**: Supabase (Auth, Database, Realtime)

## Instalación y Ejecución

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/TU_USUARIO/Control_Horario.git
   cd Control_Horario
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   - Renombra `.env.example` a `.env` (si existe) o crea uno nuevo.
   - Añade tus credenciales de Supabase:
     ```
     VITE_SUPABASE_URL=tu_url_de_supabase
     VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
     ```

4. **Ejecutar en desarrollo**:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

## Despliegue

Este proyecto está configurado para desplegarse fácilmente en Vercel, Netlify o GitHub Pages.

### GitHub Pages
El proyecto incluye un workflow de GitHub Actions para despliegue automático.

## Licencia

MIT
