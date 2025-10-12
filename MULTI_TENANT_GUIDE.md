# 🏢 Guía Multi-Tenant - Mini Sivesoft Backend

## 📋 Índice
- [Arquitectura](#arquitectura)
- [Flujo de Autenticación](#flujo-de-autenticación)
- [Cambio de Tenant](#cambio-de-tenant)
- [Uso en el Frontend](#uso-en-el-frontend)

---

## 🏗️ Arquitectura

### Bases de Datos
El sistema maneja 3 empresas (tenants) independientes:

| Tenant ID | Base de Datos | Empresa |
|-----------|---------------|---------|
| `empresa1` | `mini_sivesoft_backend` | Empresa 1 S.A. |
| `empresa2` | `mini_sivesoft_backend_2` | Empresa 2 S.A. |
| `empresa3` | `mini_sivesoft_backend_3` | Empresa 3 S.A. |

### Usuario Multi-Tenant
El usuario `admin` tiene acceso a las 3 empresas:
- **Username**: `admin`
- **Password**: `12345`
- **Role**: `super_admin`
- **TenantIds**: `["empresa1", "empresa2", "empresa3"]`

---

## 🔐 Flujo de Autenticación

### 1. Login Inicial

**Endpoint**: `POST /auth/login`

**Body**:
```json
{
  "username": "admin",
  "password": "12345"
}
```

**Respuesta**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "admin",
    "id": 1,
    "role": "super_admin",
    "nameEntity": null,
    "tenantIds": ["empresa1", "empresa2", "empresa3"],
    "tenantId": "empresa1"  // 👈 Tenant activo por defecto (el primero)
  }
}
```

**Payload del JWT**:
```json
{
  "username": "admin",
  "id": 1,
  "role": "super_admin",
  "nameEntity": null,
  "tenantIds": ["empresa1", "empresa2", "empresa3"],
  "tenantId": "empresa1"  // 👈 Empresa activa actual
}
```

---

## 🔄 Cambio de Tenant

### 2. Switch Tenant (Cambiar de Empresa)

**Endpoint**: `POST /auth/switch-tenant`

**Headers**:
```
Authorization: Bearer {token_actual}
```

**Body**:
```json
{
  "tenantId": "empresa2"
}
```

**Respuesta**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  // 👈 NUEVO TOKEN
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "admin",
    "id": 1,
    "role": "super_admin",
    "nameEntity": null,
    "tenantIds": ["empresa1", "empresa2", "empresa3"],
    "tenantId": "empresa2"  // 👈 Ahora la empresa activa es empresa2
  },
  "message": "Cambiado a tenant: empresa2"
}
```

**⚠️ IMPORTANTE**: 
- Debes **reemplazar el token anterior** con el nuevo token
- El nuevo token contiene `tenantId: "empresa2"`
- Todas las peticiones subsecuentes usarán empresa2

---

## 💻 Uso en el Frontend

### Configuración de Axios/Fetch

```typescript
// Guardar el token después del login o switch
const saveToken = (token: string) => {
  localStorage.setItem('authToken', token);
};

// Configurar axios para incluir el token en todas las peticiones
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Ejemplo de Uso

```typescript
// 1. LOGIN
const login = async () => {
  const response = await axios.post('/auth/login', {
    username: 'admin',
    password: '12345'
  });
  
  saveToken(response.data.token);
  console.log('Empresa activa:', response.data.user.tenantId); // "empresa1"
};

// 2. CAMBIAR DE EMPRESA
const switchToEmpresa2 = async () => {
  const response = await axios.post('/auth/switch-tenant', {
    tenantId: 'empresa2'
  });
  
  saveToken(response.data.token); // 👈 IMPORTANTE: Guardar el nuevo token
  console.log('Empresa activa:', response.data.user.tenantId); // "empresa2"
};

// 3. HACER PETICIONES (automáticamente usa el tenant del JWT)
const getWarehouses = async () => {
  // El tenantId se obtiene automáticamente del token JWT
  // No necesitas enviar nada adicional
  const response = await axios.get('/warehouses');
  console.log(response.data); // Almacenes de la empresa activa
};
```

---

## 🎯 Endpoints Principales

Todos los endpoints protegidos obtienen el `tenantId` automáticamente del JWT:

### Usuarios
- `GET /users` - Lista usuarios de la empresa activa
- `POST /users` - Crear usuario en la empresa activa
- `GET /users/:id` - Obtener usuario de la empresa activa
- `PATCH /users/:id` - Actualizar usuario de la empresa activa
- `DELETE /users/:id` - Eliminar usuario de la empresa activa

### Almacenes
- `GET /warehouses` - Lista almacenes de la empresa activa
- `POST /warehouses` - Crear almacén en la empresa activa
- `GET /warehouses/:id` - Obtener almacén de la empresa activa
- `PATCH /warehouses/:id` - Actualizar almacén de la empresa activa
- `DELETE /warehouses/:id` - Eliminar almacén de la empresa activa

### Entidades de Negocio
- `GET /entities` - Lista entidades de la empresa activa
- `POST /entities` - Crear entidad en la empresa activa
- `GET /entities/:id` - Obtener entidad de la empresa activa
- `PATCH /entities/:id` - Actualizar entidad de la empresa activa
- `DELETE /entities/:id` - Eliminar entidad de la empresa activa

### Hojas de Inventario
- `GET /inventory-sheets` - Lista hojas de la empresa activa
- `POST /inventory-sheets` - Crear hoja en la empresa activa
- `GET /inventory-sheets/:id` - Obtener hoja de la empresa activa
- `PATCH /inventory-sheets/:id` - Actualizar hoja de la empresa activa

---

## ✅ Ventajas de este Enfoque

1. **🔒 Seguridad**: El tenantId viene del JWT firmado, no se puede manipular
2. **🎯 Simplicidad**: Solo necesitas el Bearer token, sin headers adicionales
3. **📱 Fácil para Frontend**: Configuración única de axios/fetch
4. **🔄 Consistencia**: Siempre usa el tenant correcto del token actual
5. **👤 Usuario Único**: El mismo admin funciona en todas las empresas

---

## 🐛 Debugging

Si necesitas ver qué tenant se está usando, revisa los logs del servidor:

```
🔑 [TenantId Decorator] request.user: { userId: 1, username: 'admin', ... }
✅ [TenantId Decorator] TenantId del JWT: empresa2
🎯 [WarehousesController.findAll] tenantId desde decorator: empresa2
🔍 [WarehousesService.findAll] tenantId recibido: empresa2
🔍 [WarehousesService.findAll] database conectada: mini_sivesoft_backend_2
```

---

## 🔧 Desarrollo

### Crear las Bases de Datos
```bash
# Ejecutar el script SQL
Get-Content create-databases.sql | docker exec -i mini_sivesoft_backend mysql -u root -p12345
```

### Generar Hash de Contraseña
```bash
node generate-hash.js
```

---

## 📝 Notas Importantes

- ✅ El usuario `admin` existe en las 3 bases de datos con el mismo ID y credenciales
- ✅ Al cambiar de tenant, el usuario sigue siendo el mismo, solo cambia el contexto de la empresa
- ✅ No necesitas enviar headers adicionales, todo viene del JWT
- ✅ Después de `switch-tenant`, DEBES usar el nuevo token devuelto
