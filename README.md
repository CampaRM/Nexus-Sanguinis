# Nexus Sanguinis 🩸
**Sistema Centralizado de Gestión de Bancos de Sangre y Trazabilidad Intercentros**

Nexus Sanguinis es una plataforma hospitalaria integral concebida para la gestión unificada de inventarios de unidades de sangre, monitoreo automatizado de caducidad (<7 días), requisiciones de transferencia entre centros médicos respaldadas por transacciones ACID en MySQL, y auditoría cronológica inmutable de trazabilidad.

---

## 🌍 Contexto y Problemática Global de Salud (ODS 3: Salud y Bienestar)

El acceso oportuno y equitativo a sangre y hemoderivados seguros es un pilar crítico en la medicina moderna de urgencias, obstetricia, oncología y cirugía de alta complejidad. A nivel global, este desafío impacta directamente en las metas del **Objetivo de Desarrollo Sostenible 3 (ODS 3: Salud y Bienestar)** de las Naciones Unidas:

1. **Mortalidad Materna y Quirúrgica (Meta 3.1 y 3.2)**: Las hemorragias posparto no controladas continúan siendo una de las principales causas de muerte materna prevenible en el mundo. La indisponibilidad inmediata de hemoderivados compatibles durante las primeras horas críticas resulta fatal.
2. **Pérdida Crítica por Caducidad (Desperdicio de Recursos Vitales)**: Debido a una vida útil limitada (aproximadamente 35 a 42 días para glóbulos rojos), la falta de visibilidad en tiempo real provoca que miles de unidades caduquen silenciosamente en almacenes regionales mientras otros centros experimentan desabastecimiento severo.
3. **Fragmentación y Falta de Trazabilidad Interhospitalaria**: Tradicionalmente, los centros de salud operan en silos aislados, dificultando el traslado transparente y seguro de componentes sanguíneos entre instituciones.
4. **Solución Nexus Sanguinis**: Brinda una red interconectada con cálculo continuo de stock por grupo y factor Rh, alertas automáticas de caducidad inminente, transferencias intercentros transaccionales (sin pérdidas ni duplicados) y registro de auditoría estricto de cada interacción médica.

---

## 🎨 Paleta de Colores y Diseño Visual

La interfaz gráfica implementa una combinación semántica de alto contraste y carácter clínico:

- **Rojo Carmesí Primario**: `#8B0000` (Identidad institucional, acciones primarias y cabecera)
- **Azul Marino Secundario**: `#1E3A8A` (Estructura de navegación, tipografías y botones secundarios)
- **Rojo Vívido de Acento**: `#E11D48` (Alertas críticas, insignias de urgencia y estados de error)
- **Fondo Neutro Claro**: `#F8FAFC`
- **Bordes y Divisores**: `#E2E8F0`
- **Identidad Gráfica (Logo)**: Ubicado en `src/assets/resources/img01.jpeg`, renderizado en la barra de navegación superior y en la tarjeta de autenticación.

---

## 🏗️ Arquitectura y Estándar de Claves (`id_<entity>`)

- **Idioma del Código**: Todo el código fuente (TypeScript, SCSS), esquemas de base de datos, DTOs, nombres de variables y rutas de la API REST se encuentran **100% en inglés**.
- **Internacionalización (i18n)**: Soporte bilingüe en tiempo de ejecución para **Inglés (`en`)** y **Español (`es`)**, con persistencia en `localStorage` y selector integrado en la barra de navegación.
- **Estándar de Nombres de Identificadores**: Cumplimiento del formato `id_<entity>` en el modelo relacional y respuestas JSON:
  - `id_user`
  - `id_medical_center`
  - `id_blood_unit`
  - `id_transfer_request`
  - `id_transfer_detail`
  - `id_movement_history`
  - `id_role`

---

## 📊 Modelo Entidad-Relación (Mermaid)

El esquema de base de datos cumple rigurosamente con la **Tercera Forma Normal (3FN)**:

```mermaid
erDiagram
    ROLES ||--o{ USERS : "assigned to"
    MEDICAL_CENTERS ||--o{ USERS : "employs"
    MEDICAL_CENTERS ||--o{ BLOOD_UNITS : "stores"
    MEDICAL_CENTERS ||--o{ TRANSFER_REQUESTS : "requests"
    MEDICAL_CENTERS ||--o{ TRANSFER_REQUESTS : "supplies"
    TRANSFER_REQUESTS ||--o{ TRANSFER_DETAILS : "contains"
    BLOOD_UNITS ||--o{ TRANSFER_DETAILS : "included in"
    BLOOD_UNITS ||--o{ MOVEMENT_HISTORIES : "tracks"
    USERS ||--o{ MOVEMENT_HISTORIES : "performs"

    ROLES {
        int id_role PK
        string role_name UK "ADMIN_GENERAL | BANK_MANAGER"
    }

    MEDICAL_CENTERS {
        int id_medical_center PK
        string name
        string type "HOSPITAL | CLINIC | REGIONAL_BANK"
        string address
        string phone
        datetime created_at
        datetime updated_at
    }

    USERS {
        int id_user PK
        string full_name
        string email UK
        string password_hash
        int id_role FK
        int id_medical_center FK "Nullable"
        datetime created_at
        datetime updated_at
    }

    BLOOD_UNITS {
        int id_blood_unit PK
        string blood_type "A | B | AB | O"
        string rh_factor "POSITIVE | NEGATIVE"
        datetime extraction_date
        datetime expiration_date
        string status "AVAILABLE | NEAR_EXPIRATION | EXPIRED | DISCARDED | TRANSFERRED"
        int id_medical_center FK
        datetime created_at
        datetime updated_at
    }

    TRANSFER_REQUESTS {
        int id_transfer_request PK
        int id_requesting_center FK
        int id_supplying_center FK
        string blood_type "A | B | AB | O"
        int quantity
        string status "PENDING | APPROVED | REJECTED | IN_TRANSIT | COMPLETED"
        datetime request_date
        datetime created_at
        datetime updated_at
    }

    TRANSFER_DETAILS {
        int id_transfer_detail PK
        int id_transfer_request FK
        int id_blood_unit FK
    }

    MOVEMENT_HISTORIES {
        int id_movement_history PK
        int id_blood_unit FK
        int id_user FK
        string action
        datetime timestamp
    }
```

---

## 🚀 Guía de Instalación y Ejecución

### Prerrequisitos
- **Node.js** >= 20.x
- **pnpm** >= 9.x
- **MySQL Server** 8.x con una base de datos denominada `nexus_sanguinis`

### 1. Variables de Entorno y Base de Datos
Configurar el archivo `backend/.env`:
```env
PORT=3000
DATABASE_URL="mysql://root:password@localhost:3306/nexus_sanguinis"
JWT_SECRET="nexus_sanguinis_super_secure_jwt_token_secret_key_2026"
JWT_EXPIRES_IN="8h"
CORS_ORIGIN="http://localhost:4200"
```

Aplicar las migraciones del esquema y sembrar los datos iniciales de prueba:
```bash
cd backend
pnpm prisma:push
pnpm prisma:seed
cd ..
```

### 2. Inicio Concurrente de Backend y Frontend
Desde el directorio raíz del proyecto:
```bash
# Inicia concurrentemente backend (puerto 3000) y frontend (puerto 4200)
pnpm start
```
*(También se puede invocar con `pnpm dev`)*

Para iniciar cada servicio de forma individual:
```bash
# Solo Backend
pnpm dev:backend

# Solo Frontend
pnpm dev:frontend
```

- **Frontend Angular**: `http://localhost:4200`
- **Backend API Express**: `http://localhost:3000/api`
- **Verificación de Salud (Health Check)**: `http://localhost:3000/health`

---

## 📡 Mapeo Completo de Endpoints REST

Prefijo Base: `http://localhost:3000/api`

### 1. Autenticación (`/api/auth`)
| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `POST` | `/api/auth/register` | Público | Registro de nuevo usuario (`full_name`, `email`, `password`, `id_role`). |
| `POST` | `/api/auth/login` | Público | Autenticación y generación de token JWT con rol. |
| `GET` | `/api/auth/me` | Autenticado | Perfil del usuario en sesión activa. |

### 2. Centros Médicos (`/api/medical-centers`)
| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/api/medical-centers` | Autenticado | Listado de todos los hospitales y bancos de sangre registrados. |
| `GET` | `/api/medical-centers/:id` | Autenticado | Consulta detallada de un centro por su identificador. |
| `POST` | `/api/medical-centers` | ADMIN_GENERAL | Creación de un nuevo centro médico. |
| `PUT` | `/api/medical-centers/:id` | ADMIN_GENERAL | Actualización de datos de un centro médico. |
| `DELETE` | `/api/medical-centers/:id` | ADMIN_GENERAL | Eliminación de un centro médico. |

### 3. Inventario de Unidades de Sangre (`/api/blood-units`)
| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/api/blood-units` | Autenticado | Búsqueda paginada y filtrada (`blood_type`, `rh_factor`, `status`, `id_medical_center`, `page`, `limit`). |
| `GET` | `/api/blood-units/:id` | Autenticado | Consulta de una unidad de sangre por identificador. |
| `POST` | `/api/blood-units` | Autenticado | Registro de una nueva bolsa recolectada. |
| `PUT` | `/api/blood-units/:id` | Autenticado | Modificación de estado o reubicación de la unidad. |
| `DELETE` | `/api/blood-units/:id` | ADMIN / MANAGER | Descarte o baja de la unidad de sangre. |

### 4. Solicitudes de Transferencia Intercentros (`/api/transfers`)
| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/api/transfers` | Autenticado | Consulta de requisiciones de traslado (filtro por `status`). |
| `GET` | `/api/transfers/:id` | Autenticado | Consulta detallada con desglose de bolsas asignadas. |
| `POST` | `/api/transfers` | Autenticado | Creación de una solicitud entre centro emisor y receptor. |
| `POST` | `/api/transfers/:id/process` | ADMIN / MANAGER | **Transacción ACID en MySQL**: Aprobación o rechazo con reasignación atómica de unidades y registro de trazabilidad. |

### 5. Métricas del Panel de Operaciones (`/api/dashboard`)
| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/api/dashboard/metrics` | Autenticado | Recuperación de los 3 KPIs: desglose por tipo/Rh, alertas de vencimiento (<7 días) y solicitudes pendientes. |

### 6. Registro de Trazabilidad (`/api/movements`)
| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/api/movements` | Autenticado | Historial inmutable de auditoría de traslados y cambios de estado. |

---

## 🔑 Credenciales de Acceso Demo

| Rol | Correo Electrónico | Contraseña | Alcance Operativo |
|---|---|---|---|
| **Administrador General** | `admin@nexus.org` | `Admin123!` | Control total del sistema, gestión de centros y aprobaciones globales. |
| **Gestor de Banco Regional** | `manager.metro@nexus.org` | `Manager123!` | Gestión de inventario local, transferencias y trazabilidad. |

---

## 🧪 Pruebas Automatizadas

### Pruebas de Backend (Express + Node Test Runner + Supertest)
```bash
cd backend
pnpm test
```
- Valida inicio de sesión, rechazo de credenciales incorrectas, filtros y paginación en inventario, y la ejecución de la **transacción ACID** en el traslado de unidades con verificación en base de datos.

### Pruebas de Frontend (Angular TestBed + Vitest)
```bash
cd frontend
pnpm ng test --no-watch
```
- Valida la inicialización de estado de sesión en `AuthService`, la reactividad del componente `LanguageSwitcherComponent` (conmutación entre EN y ES) y el montaje del componente principal `App`.
