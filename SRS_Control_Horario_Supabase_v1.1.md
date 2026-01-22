# SRS — Aplicación Web de Control Horario (Supabase) — v1.1

**Producto:** TimeTrack Web (nombre referencial)  
**Fecha:** 2026-01-21  
**Base de datos y autenticación:** Supabase (PostgreSQL + Auth + RLS)  
**Estado:** Especificación lista para implementación

---

## 0. Control de versiones y cambios

### 0.1 Versión del documento
- **v1.0**: Especificación inicial.
- **v1.1**: Ajustes para robustez operativa y mantenibilidad (integridad temporal, cierres automáticos, rendimiento de reportes y módulos IA).

### 0.2 Cambios clave en v1.1 (sin quitar funcionalidad)
1. **Integridad del tiempo (anti-manipulación cliente):**
   - Se prohíben inserts/updates directos desde frontend sobre tablas críticas.
   - Se introducen **RPC obligatorias** para marcaciones y pausas, usando `now()` del servidor.
2. **Sesiones olvidadas:**
   - Se especifica **job nocturno** (Supabase Edge Function programada) para cerrar sesiones abiertas excesivas y generar corrección proactiva.
3. **Rendimiento de reportes:**
   - Se consolidan campos calculados (`total_break_minutes`, `total_work_minutes`) y se actualizan por **triggers** para lecturas rápidas.
4. **Valor agregado IA (opcional, no marketing):**
   - **Detección de anomalías** en patrones de marcación y **asistente de reportes** en lenguaje natural (para Admin/Supervisor), con gobernanza y auditoría.

---

## 1. Información general

### 1.1 Propósito
Construir una aplicación web moderna y responsive para **registro de jornadas laborales**, gestión de pausas y generación de reportes visuales, garantizando:
- Registro intuitivo
- Cálculo automático de horas y descansos
- Reportes visuales y exportables
- Seguridad, integridad y auditoría para mantenimiento y escalabilidad

### 1.2 Alcance
- Registro de **entrada/salida**
- Gestión de **pausas**
- Cálculos automáticos (bruto, pausas, neto)
- Reportes (personal y por equipo)
- Correcciones (flujo de aprobación) + auditoría
- Administración (roles, equipos, reglas)

**Supabase** se usará como:
- **Auth**
- **PostgreSQL**
- **RLS**
- **Edge Functions** (incluye cron programado)
- (Opcional) **Storage** para adjuntos/evidencias

### 1.3 Stakeholders
- Empleado (usuario final)
- Supervisor
- Administrador
- RRHH/Operaciones
- Equipo de TI (soporte/mantenimiento)

### 1.4 Supuestos y dependencias
- Zona horaria por defecto: **America/Bogota** (configurable por usuario)
- Navegadores soportados: últimas 2 versiones
- Conectividad internet
- RLS y funciones RPC correctamente configuradas

---

## 2. Objetivos del sistema
1. Facilitar registro de jornada (1 clic).
2. Calcular automáticamente horas y descansos.
3. Reportes visuales (día/semana/mes) con buen rendimiento.
4. UI moderna y responsive.
5. Evitar fraude por manipulación de hora del cliente.
6. Reducir carga de soporte por sesiones olvidadas.

---

## 3. Roles y permisos

### 3.1 Roles
- **Empleado**
  - Registrar entrada/salida/pausas
  - Ver su historial y reportes
  - Solicitar correcciones
- **Supervisor**
  - Ver reportes del equipo
  - Aprobar/rechazar correcciones
  - Revisar alertas/anomalías
- **Administrador**
  - CRUD de usuarios/equipos
  - Configurar reglas
  - Reportes globales y auditoría

### 3.2 Principios de acceso
- **RLS obligatorio** en tablas sensibles.
- Operaciones críticas (marcaciones/pausas/cierres automáticos) **solo vía RPC**.
- Los usuarios solo acceden a su data; supervisor a su equipo; admin global.

---

## 4. Requerimientos funcionales (RF)

> Nota de arquitectura v1.1: **Todas las acciones de marcación** (entrada/salida/pausas) deben ejecutarse vía **RPC** para asegurar timestamps con `now()` del servidor y atomicidad.

### 4.1 Autenticación y cuenta
- **RF-01**: Registro e inicio de sesión por email/contraseña (Supabase Auth).  
  **CA**: Crear cuenta, login/logout y recuperación de contraseña.
- **RF-02**: Gestión de perfil (nombre, cargo, equipo, zona horaria).  
  **CA**: TZ afecta agrupación diaria en reportes.

### 4.2 Registro de jornada (solo vía RPC)
- **RF-03**: Registrar **Entrada (Clock-in)**.  
  **CA**: Si no hay sesión abierta, se crea con `clock_in = now()` del servidor.
- **RF-04**: Registrar **Salida (Clock-out)**.  
  **CA**: Si hay sesión abierta, se cierra con `clock_out = now()` del servidor.
- **RF-05**: Evitar estados inválidos.  
  **CA**: No salida sin entrada; no doble entrada; no pausa fuera de sesión.
- **RF-06**: Pausas (inicio/fin).  
  **CA**: Solo una pausa activa por sesión; timestamps de servidor.
- **RF-07**: Cálculo automático de tiempo.  
  **CA**: Tiempo neto por sesión/día = (salida-entrada) - pausas.

### 4.3 Integridad del tiempo y antifraude (nuevo, sin romper RF existentes)
- **RF-18**: Prohibir marcaciones usando hora del cliente.  
  **CA**: No se aceptan inserts/updates directos desde frontend en `work_sessions`/`breaks`; solo RPC asigna timestamps.
- **RF-19**: Registrar metadatos de marcación (opcional pero recomendado).  
  **CA**: Se guarda `source` (web), `user_agent` (texto) e `ip_hash` (hash), sin almacenar PII sensible cruda.

### 4.4 Sesiones olvidadas (operación real)
- **RF-20**: Cierre automático nocturno de sesiones abiertas excesivas.  
  **CA**: Un job nocturno detecta sesiones `open` con duración > X horas (configurable, default 14) y:
  1) Cierra con `clock_out = now()` y `status = 'auto_closed'`
  2) Registra auditoría “Cierre Automático por Sistema”
  3) Crea una **solicitud de corrección proactiva** en estado `pending` para revisión del supervisor/usuario
- **RF-21**: Notificar a usuario/supervisor (opcional).  
  **CA**: Se envía notificación in-app o email (según alcance).

### 4.5 Correcciones y auditoría
- **RF-08**: Solicitud de corrección con motivo.  
  **CA**: Queda en estado `pending`.
- **RF-09**: Aprobación/rechazo por Supervisor/Admin.  
  **CA**: Cambios solo al aprobar; auditoría completa.
- **RF-10**: Historial de auditoría.  
  **CA**: Se registra antes/después, actor y timestamp.

### 4.6 Reportes y visualización
- **RF-11**: Reporte personal (día/semana/mes).  
  **CA**: Totales por día y acumulados.
- **RF-12**: Reporte de equipo (Supervisor).  
  **CA**: Totales por persona, alertas e inconsistencias.
- **RF-13**: Reportes visuales (gráficas) con filtros.  
  **CA**: Cambiar rango actualiza gráfica.
- **RF-14**: Exportación CSV/Excel/PDF (según prioridad).  
  **CA**: Exporta lo filtrado.

### 4.7 Configuración (Admin)
- **RF-15**: Configurar reglas: jornada esperada, tolerancias, límites, umbral de cierre automático X.  
  **CA**: Parámetros se aplican a alertas/cálculos.
- **RF-16**: Gestión de usuarios/equipos/roles.  
  **CA**: Asignación de supervisor y equipos.

### 4.8 Alertas (incluye soporte real)
- **RF-17**: Alertas por inconsistencias (sesión sin salida, pausas largas, etc.).  
  **CA**: Se marca día como “incompleto” / “auto_closed” / “requiere revisión”.

---

## 5. Requerimientos no funcionales (RNF)

### 5.1 UX/UI
- **RNF-01**: Responsive, mobile-first.
- **RNF-02**: Acciones primarias visibles (Entrada/Salida/Pausa).
- **RNF-03**: Registrar entrada ≤ 5s.

### 5.2 Rendimiento
- **RNF-04**: Dashboard ≤ 2.5s (p50) con 30 días.
- **RNF-05**: Reportes escalables:
  - Lectura de sesiones debe ser **O(1) por fila** (usar campos precomputados y evitar cálculos pesados al vuelo).
  - Paginación para rangos largos.

### 5.3 Seguridad e integridad
- **RNF-06**: HTTPS obligatorio.
- **RNF-07**: RLS en todas las tablas sensibles.
- **RNF-08**: Operaciones críticas solo por RPC (antifraude por hora cliente).
- **RNF-09**: Auditoría para cambios críticos y cierres automáticos.
- **RNF-10**: Principio de mínimo privilegio.

### 5.4 Confiabilidad
- **RNF-11**: Atomicidad en marcaciones (evitar carreras):
  - RPC debe ser transaccional para no crear doble sesión abierta.
- **RNF-12**: Manejo de fallos:
  - UI debe mostrar estado y reintentar si hay fallos temporales, sin duplicar registros.

### 5.5 Accesibilidad
- **RNF-13**: Buenas prácticas WCAG (contraste, labels, teclado).

---

## 6. Reglas de negocio (RB)

- **RB-01**: Sesión = entrada → salida (0..n pausas).
- **RB-02**: Tiempo neto = (clock_out - clock_in) - sum(pausas).
- **RB-03**: Solo una sesión `open` por usuario.
- **RB-04**: Solo una pausa activa por sesión.
- **RB-05**: Correcciones requieren auditoría (antes/después, motivo, actor).
- **RB-06**: TZ define corte diario y agrupación.
- **RB-07 (nuevo)**: Cierre automático si sesión > X horas (X configurable, default 14).

---

## 7. Casos de uso (UC)

### UC-01 Marcar entrada (RPC)
1) Usuario autenticado presiona “Marcar Entrada”.  
2) Frontend llama `rpc_clock_in()`.  
3) DB valida que no exista sesión abierta y crea sesión con `now()`.  
4) UI muestra estado “Trabajando”.

### UC-02 Iniciar/Finalizar pausa (RPC)
- `rpc_break_start()` / `rpc_break_end()` con `now()` y validaciones.

### UC-03 Marcar salida (RPC)
- `rpc_clock_out()` cierra sesión y dispara actualización de totales (ver triggers).

### UC-04 Sesión olvidada (Job nocturno)
1) Edge Function programada detecta sesiones > X horas.  
2) Cierra sesión con `auto_closed`.  
3) Inserta auditoría y crea solicitud de corrección `pending`.  
4) UI muestra inconsistencia al usuario/supervisor.

### UC-05 Solicitar corrección
- Usuario solicita corrección con motivo; supervisor revisa.

---

## 8. Modelo de datos (Supabase / PostgreSQL)

> Se mantienen tablas base y se refuerzan para operación real: campos calculados + estados + trazabilidad.

### 8.1 Tablas

#### profiles
- `id (uuid, PK)` = `auth.users.id`
- `full_name (text)`
- `role (text: employee | supervisor | admin)`
- `team_id (uuid, nullable)`
- `timezone (text, default 'America/Bogota')`
- `created_at, updated_at`

#### teams
- `id (uuid, PK)`
- `name (text)`
- `supervisor_id (uuid -> profiles.id, nullable)`
- `created_at`

#### work_sessions
- `id (uuid, PK)`
- `user_id (uuid -> profiles.id)`
- `clock_in (timestamptz)`  **(servidor)**
- `clock_out (timestamptz, nullable)` **(servidor)**
- `status (text: open | closed | corrected | auto_closed)`
- `closure_reason (text, nullable)` (ej. “Cierre Automático por Sistema”)
- `total_break_minutes (int, default 0)` **(precomputado)**
- `total_work_minutes (int, default 0)` **(precomputado: neto)**
- `source (text, nullable)` (web, etc.)
- `user_agent (text, nullable)`
- `ip_hash (text, nullable)`
- `created_at, updated_at`

#### breaks
- `id (uuid, PK)`
- `session_id (uuid -> work_sessions.id)`
- `break_start (timestamptz)` **(servidor)**
- `break_end (timestamptz, nullable)` **(servidor)**
- `created_at, updated_at`

#### correction_requests
- `id (uuid, PK)`
- `session_id (uuid -> work_sessions.id)`
- `requested_by (uuid -> profiles.id)`
- `proposed_clock_in (timestamptz, nullable)`
- `proposed_clock_out (timestamptz, nullable)`
- `reason (text)`
- `status (text: pending | approved | rejected)`
- `reviewed_by (uuid -> profiles.id, nullable)`
- `reviewed_at (timestamptz, nullable)`
- `reviewer_comment (text, nullable)`
- `created_at, updated_at`

#### audit_log
- `id (uuid, PK)`
- `entity_type (text: session | break | correction | system_job)`
- `entity_id (uuid)`
- `action (text: create | update | close | auto_close | approve | reject)`
- `performed_by (uuid -> profiles.id, nullable)` *(nullable para sistema)*
- `before (jsonb, nullable)`
- `after (jsonb, nullable)`
- `created_at`

### 8.2 Políticas RLS (lineamientos v1.1)
- **work_sessions / breaks**:
  - Lectura según rol (self/team/admin).
  - **Escritura directa denegada** (inserts/updates) para empleado/supervisor.
  - Escritura permitida solo a través de **SECURITY DEFINER RPC** (o roles de servicio).
- **correction_requests**:
  - Empleado crea solicitudes para sus sesiones.
  - Supervisor/admin puede aprobar/rechazar según alcance.
- **audit_log**:
  - Solo supervisor/admin (configurable).

---

## 9. Capa transaccional obligatoria (RPC) — v1.1

### 9.1 RPC mínimas requeridas
- `rpc_clock_in()`
- `rpc_clock_out()`
- `rpc_break_start()`
- `rpc_break_end()`
- `rpc_request_correction(session_id, proposed_clock_in, proposed_clock_out, reason)`
- `rpc_review_correction(request_id, decision, comment)`
- `rpc_auto_close_sessions(max_hours)` *(invocada por job)*

### 9.2 Reglas de implementación (criterios técnicos)
- Todas las RPC:
  - Usan `now()` para timestamps
  - Son **transaccionales**
  - Validan invariantes (una sesión abierta, una pausa activa)
  - Registran auditoría cuando aplique

---

## 10. Rendimiento: precomputación y triggers (v1.1)

### 10.1 Estrategia
Para que RF-13 sea sostenible con miles de registros:
- Mantener `total_break_minutes` y `total_work_minutes` en `work_sessions`
- Actualizarlos automáticamente mediante **triggers** cuando:
  - se inserta/cierra una pausa
  - se cierra una sesión
  - se aplica corrección aprobada

### 10.2 Criterios de aceptación
- Consultar reportes de 30–90 días no debe requerir sumatorias complejas por solicitud.
- Las lecturas usan campos precomputados (por fila).

---

## 11. Operación: Job nocturno para sesiones olvidadas (v1.1)

### 11.1 Programación
- **Supabase Edge Function** programada (cron) 1 vez por noche (p.ej. 23:59 TZ).
- Configuración:
  - `max_open_hours` (default 14)
  - comportamiento de cierre (crear corrección proactiva)

### 11.2 Criterios de aceptación
- Sesiones abiertas > X horas terminan con:
  - `status=auto_closed`
  - `closure_reason="Cierre Automático por Sistema"`
  - auditoría registrada
  - `correction_request` creada en `pending`

---

## 12. IA: módulos de valor agregado (opcional)

> Estos módulos NO son requisito del MVP, pero se definen para expansión sin deuda técnica.

### 12.1 Detección de anomalías (RF-22, opcional)
- **RF-22**: Detectar marcaciones anómalas según historial (hora inusual, patrón atípico, cambio de ubicación/IP hash, etc.).  
  **CA**: Genera alerta “Requiere revisión” para supervisor con explicación trazable.

**RNF asociado:** explicabilidad mínima (qué regla/modelo disparó la alerta).

### 12.2 Asistente de reportes (RF-23, opcional)
- **RF-23**: Chat/consulta en lenguaje natural para Admin/Supervisor (“Quién excedió pausas esta semana”, “Resumen de inconsistencias del equipo X”).  
  **CA**: Respuesta basada solo en datos permitidos por rol, con auditoría de consulta.

**Seguridad IA:** no exponer datos fuera del alcance RLS/rol.

---

## 13. UI — pantallas mínimas
1. Login / Recuperación
2. Dashboard (acción principal + estado + contadores)
3. Historial (por día/sesión)
4. Reportes (filtros + gráficas + export)
5. Correcciones (solicitar + bandeja de aprobación)
6. Administración (usuarios/equipos/reglas)
7. Alertas (inconsistencias y, opcional, anomalías IA)

---

## 14. Priorización (MoSCoW)

### Must (MVP)
- Auth Supabase
- Marcaciones Entrada/Salida/Pausas **por RPC**
- Cálculo automático
- Reporte personal (tabla + totales)
- RLS + roles
- Dashboard responsive
- Auditoría básica (al menos para cierres y correcciones)

### Should
- Job nocturno de cierre automático + corrección proactiva
- Reportes por equipo
- Gráficas (RF-13)
- Triggers para precomputación de totales

### Could
- Export PDF
- Notificaciones (in-app/email)
- Metadatos de marcación (user_agent, ip_hash)
- IA: anomalías y asistente de reportes

### Won’t (por ahora)
- Nómina/ERP
- App nativa

---

## 15. Definition of Done (DoD)
- Todas las marcaciones se ejecutan via RPC (sin hora cliente).
- Job nocturno operativo y trazable.
- Campos calculados actualizados por triggers.
- Reportes con buen rendimiento.
- RLS validado por rol.
- Auditoría completa para correcciones y auto-cierres.
- Pruebas mínimas:
  - unitarias: reglas de cálculo e invariantes
  - e2e: flujo de marcación + pausa + auto-cierre + corrección

---
