# Nexus Sanguinis - Guía de la API REST 🩸

URL Base del Servidor: `http://localhost:3000/api`

---

## 🔐 Autenticación y Autorización
Todos los endpoints protegidos requieren un Token Bearer JWT transmitido en la cabecera HTTP:
```http
Authorization: Bearer <your_jwt_token>
```

---

## 📋 Mapeo Detallado de Endpoints

### 1. Autenticación (`/api/auth`)
| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `POST` | `/api/auth/register` | Público | Registra un nuevo usuario en la red (`full_name`, `email`, `password`, `id_role`). |
| `POST` | `/api/auth/login` | Público | Autentica las credenciales y devuelve el token JWT con los datos de sesión y rol del usuario. |
| `GET` | `/api/auth/me` | Autenticado | Devuelve los detalles del perfil del usuario actualmente autenticado. |

---

### 2. Centros Médicos (`/api/medical-centers`)
| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/api/medical-centers` | Autenticado | Lista todos los hospitales, clínicas y bancos de sangre registrados junto con el conteo de unidades almacenadas. |
| `GET` | `/api/medical-centers/:id` | Autenticado | Obtiene los detalles específicos de un centro médico por su `id_medical_center`. |
| `POST` | `/api/medical-centers` | ADMIN_GENERAL | Registra una nueva institución médica en el sistema (`name`, `type`, `address`, `phone`). |
| `PUT` | `/api/medical-centers/:id` | ADMIN_GENERAL | Actualiza la información operativa o de contacto de un centro médico. |
| `DELETE` | `/api/medical-centers/:id` | ADMIN_GENERAL | Elimina un centro médico del sistema. |

---

### 3. Unidades de Sangre (`/api/blood-units`)
| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/api/blood-units` | Autenticado | Búsqueda filtrada y paginada del inventario físico. Parámetros de consulta: `blood_type`, `rh_factor`, `status`, `id_medical_center`, `page`, `limit`. |
| `GET` | `/api/blood-units/:id` | Autenticado | Obtiene la ficha técnica completa de una bolsa de sangre por su `id_blood_unit`. |
| `POST` | `/api/blood-units` | Autenticado | Registra una nueva unidad recolectada (`blood_type`, `rh_factor`, `extraction_date`, `expiration_date`, `id_medical_center`). |
| `PUT` | `/api/blood-units/:id` | Autenticado | Actualiza el estado (`AVAILABLE`, `NEAR_EXPIRATION`, `EXPIRED`, `DISCARDED`, `TRANSFERRED`) o la reubicación de la unidad. |
| `DELETE` | `/api/blood-units/:id` | ADMIN_GENERAL / BANK_MANAGER | Da de baja o descarta una unidad de sangre no apta para transfusión. |

---

### 4. Solicitudes de Transferencia Intercentros (`/api/transfers`)
| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/api/transfers` | Autenticado | Lista las solicitudes de transferencia entre centros (filtro opcional por `status`: `PENDING`, `APPROVED`, `REJECTED`, `COMPLETED`). |
| `GET` | `/api/transfers/:id` | Autenticado | Obtiene el detalle de la solicitud junto con las bolsas asignadas en `transfer_details`. |
| `POST` | `/api/transfers` | Autenticado | Crea una nueva requisición de sangre de un centro solicitante a un centro proveedor (`id_requesting_center`, `id_supplying_center`, `blood_type`, `quantity`). |
| `POST` | `/api/transfers/:id/process` | ADMIN_GENERAL / BANK_MANAGER | **Transacción ACID Garantizada**: Procesa la aprobación o rechazo (`action`: `APPROVE` \| `REJECT`). Reasigna las bolsas en MySQL, actualiza estados y genera la pista de auditoría sin inconsistencias. |

---

### 5. Métricas del Panel de Control (`/api/dashboard`)
| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/api/dashboard/metrics` | Autenticado | Retorna los 3 KPIs críticos: Distribución por grupo sanguíneo y factor Rh, alertas de caducidad (<7 días) y solicitudes pendientes de aprobación. |

---

### 6. Registro de Trazabilidad y Auditoría (`/api/movements`)
| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/api/movements` | Autenticado | Consulta la bitácora inmutable de movimientos e incidencias registradas sobre las unidades de sangre (filtros por `id_blood_unit`, `id_user`). |
