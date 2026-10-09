# Nexus Sanguinis - Modelo Entidad-Relación y Arquitectura de Datos 🩸

## Visión General
El modelo relacional de base de datos de **Nexus Sanguinis** implementa rigurosamente la **Tercera Forma Normal (3FN)**:
- **Primera Forma Normal (1FN)**: Todos los valores de los atributos son atómicos; se eliminan grupos repetitivos y arreglos dentro de columnas.
- **Segunda Forma Normal (2FN)**: Cumple 1FN y todos los atributos no clave tienen dependencia funcional completa respecto a las claves primarias.
- **Tercera Forma Normal (3FN)**: Cumple 2FN y no existen dependencias funcionales transitivas (ningún atributo no clave depende de otro atributo no clave).

Asimismo, todas las claves primarias y foráneas se adhieren al estándar estricto de nomenclatura: `id_<entity_name>`.

---

## Diagrama Entidad-Relación (Mermaid)

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

## Justificación Técnica de Normalización (3FN)

1. **Tabla `roles` vs `users`**: Desacopla la definición de roles y privilegios de la entidad de usuarios, previniendo redundancia y anomalías de modificación en accesos.
2. **Tabla `medical_centers`**: Centraliza hospitales, clínicas y bancos de almacenamiento, eliminando la duplicación de direcciones, teléfonos y tipos en las unidades físicas y el personal.
3. **Tabla `blood_units`**: Almacena el ciclo de vida unitario de cada bolsa de sangre (`id_blood_unit`) con trazabilidad atómica de tipo, factor Rh, fecha de extracción y caducidad.
4. **Tabla `transfer_details` (Entidad Puente)**: Normaliza la relación Muchos a Muchos entre solicitudes de transferencia y bolsas individuales, permitiendo asociar qué unidades físicas específicas satisfacen cada requisición sin redundar la cabecera del pedido.
5. **Tabla `movement_histories`**: Bitácora inmutable de solo adición (*append-only*), garantizando la auditoría cronológica y el no repudio de acciones operativas realizadas por cada usuario (`id_user`) sobre cada bolsa (`id_blood_unit`).
