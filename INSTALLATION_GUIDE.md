# 📦 Guía de Instalación - Mini Sivesoft Backend

Esta guía te llevará paso a paso desde cero hasta tener el proyecto corriendo completamente.

---

## 📋 Tabla de Contenidos

1. [Pre-requisitos](#-pre-requisitos)
2. [Instalación de Docker Desktop](#-instalación-de-docker-desktop)
3. [Instalación de Node.js](#-instalación-de-nodejs)
4. [Clonar el Proyecto](#-clonar-el-proyecto)
5. [Configuración del Proyecto](#️-configuración-del-proyecto)
6. [Levantar la Base de Datos](#-levantar-la-base-de-datos)
7. [Crear las Bases de Datos y Tablas](#-crear-las-bases-de-datos-y-tablas)
8. [Instalar Dependencias](#-instalar-dependencias)
9. [Levantar el Servidor](#-levantar-el-servidor)
10. [Verificar la Instalación](#-verificar-la-instalación)
11. [Crear Usuario Administrador (Opcional)](#-crear-usuario-administrador-opcional)
12. [Solución de Problemas](#-solución-de-problemas)

---

## ✅ Pre-requisitos

Antes de comenzar, necesitas tener instalado:

- **Windows 10/11** (64-bit)
- **PowerShell** (viene por defecto en Windows)
- **Conexión a Internet**

---

## 🐳 Instalación de Docker Desktop

Docker Desktop nos permite correr MySQL en un contenedor sin instalarlo directamente en el sistema.

### Paso 1: Verificar si Docker está instalado

Abre **PowerShell** y ejecuta:

```powershell
docker --version
```

Si ves algo como `Docker version 24.x.x`, **ya tienes Docker instalado** y puedes [saltar al siguiente paso](#-instalación-de-nodejs).

### Paso 2: Descargar Docker Desktop

Si Docker **no está instalado**:

1. Ve a [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. Haz clic en **Download for Windows**
3. Ejecuta el instalador descargado (`Docker Desktop Installer.exe`)
4. Durante la instalación, asegúrate de marcar:
   - ✅ **Use WSL 2 instead of Hyper-V** (recomendado)
   - ✅ **Add shortcut to desktop**

### Paso 3: Instalar WSL 2 (Windows Subsystem for Linux)

Docker Desktop requiere WSL 2. Abre **PowerShell como Administrador** y ejecuta:

```powershell
wsl --install
```

Después de la instalación, **reinicia tu computadora**.

### Paso 4: Iniciar Docker Desktop

1. Abre **Docker Desktop** desde el menú de inicio
2. Acepta los términos y condiciones
3. Espera a que Docker Desktop se inicie completamente (el icono en la barra de tareas debe estar verde)

### Paso 5: Verificar Docker

Abre **PowerShell** y ejecuta:

```powershell
docker --version
docker ps
```

Si no hay errores, ¡Docker está listo! 🎉

---

## 📦 Instalación de Node.js

Node.js es necesario para ejecutar el backend de NestJS.

### Paso 1: Verificar si Node.js está instalado

Abre **PowerShell** y ejecuta:

```powershell
node --version
npm --version
```

Si ves las versiones (ejemplo: `v20.x.x` y `10.x.x`), **ya tienes Node.js instalado** y puedes [saltar al siguiente paso](#-clonar-el-proyecto).

### Paso 2: Descargar Node.js

Si Node.js **no está instalado**:

1. Ve a [https://nodejs.org/](https://nodejs.org/)
2. Descarga la versión **LTS** (Long Term Support) - recomendada
3. Ejecuta el instalador descargado (`.msi`)
4. Durante la instalación:
   - Acepta los términos
   - Deja todas las opciones por defecto
   - ✅ Marca **Automatically install the necessary tools** (si aparece)

### Paso 3: Verificar Node.js

Abre **PowerShell** (cierra y abre de nuevo si ya tenías una abierta) y ejecuta:

```powershell
node --version
npm --version
```

Deberías ver las versiones instaladas. ¡Node.js está listo! 🎉

---

## 📂 Clonar el Proyecto

### Opción 1: Si tienes Git instalado

```powershell
cd D:\Proyectos\Freelance
git clone <URL_DEL_REPOSITORIO>
cd mini_sivesoft_backend
```

### Opción 2: Si no tienes Git

1. Descarga el proyecto como ZIP
2. Extrae el contenido en `D:\Proyectos\Freelance\`
3. Renombra la carpeta a `mini_sivesoft_backend`
4. Abre **PowerShell** y navega al proyecto:

```powershell
cd D:\Proyectos\Freelance\mini_sivesoft_backend
```

---

## ⚙️ Configuración del Proyecto

### Paso 1: Verificar el archivo `.env`

El proyecto debe tener un archivo `.env` en la raíz con el siguiente contenido:

```env
NODE_ENV=development
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui_cambiar_en_produccion
JWT_REFRESH_SECRET=tu_refresh_secret_muy_seguro_aqui_cambiar_en_produccion
DB_PORT=3309
```

Si el archivo **no existe**, créalo manualmente con ese contenido.

### Paso 2: (Opcional) Cambiar los secretos JWT

Para mayor seguridad, cambia los valores de `JWT_SECRET` y `JWT_REFRESH_SECRET` por valores aleatorios largos.

---

## 🗄️ Levantar la Base de Datos

Ahora vamos a iniciar el contenedor de MySQL usando Docker.

### Paso 1: Asegúrate de estar en la carpeta del proyecto

```powershell
cd D:\Proyectos\Freelance\mini_sivesoft_backend
```

### Paso 2: Levantar Docker Compose

Ejecuta el siguiente comando:

```powershell
docker-compose up -d
```

**¿Qué hace este comando?**
- `docker-compose up`: Levanta los servicios definidos en `docker-compose.yml`
- `-d`: Lo ejecuta en segundo plano (detached mode)

Verás algo como:

```
[+] Running 2/2
 ✔ Network mini_sivesoft_backend_app-network  Created
 ✔ Container mini_sivesoft_backend            Started
```

### Paso 3: Verificar que el contenedor está corriendo

```powershell
docker ps
```

Deberías ver algo como:

```
CONTAINER ID   IMAGE     COMMAND                  CREATED         STATUS         PORTS                    NAMES
abc123def456   mysql:8   "docker-entrypoint.s…"   2 minutes ago   Up 2 minutes   0.0.0.0:3309->3306/tcp   mini_sivesoft_backend
```

✅ **El puerto `3309` debe estar en la columna PORTS**

### Paso 4: Esperar a que MySQL esté listo

MySQL tarda unos segundos en inicializarse. Espera **30 segundos** aproximadamente.

Para verificar los logs:

```powershell
docker logs mini_sivesoft_backend
```

Busca la línea: `ready for connections` - Esto significa que MySQL está listo.

---

## 🗃️ Crear las Bases de Datos y Tablas

Ahora vamos a ejecutar los scripts SQL para crear las bases de datos y las tablas.

### Paso 1: Instalar un cliente MySQL (si no lo tienes)

#### Opción A: MySQL Workbench (GUI)

1. Descarga desde [https://dev.mysql.com/downloads/workbench/](https://dev.mysql.com/downloads/workbench/)
2. Instala y abre MySQL Workbench
3. Crea una nueva conexión:
   - **Hostname:** `localhost`
   - **Port:** `3309`
   - **Username:** `root`
   - **Password:** `12345`

#### Opción B: MySQL CLI (Línea de comandos)

1. Descarga MySQL Server desde [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)
2. Durante la instalación, selecciona solo **MySQL Server** y **MySQL Command Line Client**
3. Agrega MySQL al PATH (opcional)

### Paso 2: Conectarse a MySQL

**Usando MySQL Workbench:**
- Haz clic en la conexión creada
- Ingresa la contraseña: `12345`

**Usando MySQL CLI:**

```powershell
mysql -h localhost -P 3309 -u root -p
```

Cuando te pida la contraseña, ingresa: `12345`

### Paso 3: Ejecutar el script de creación de bases de datos

Desde **PowerShell** en la carpeta del proyecto:

```powershell
Get-Content .\create-databases.sql | docker exec -i mini_sivesoft_backend mysql -u root -p12345
```

Este comando:
1. Lee el archivo `create-databases.sql`
2. Lo ejecuta dentro del contenedor Docker
3. Crea las 3 bases de datos: `mini_sivesoft_backend`, `mini_sivesoft_backend_2`, `mini_sivesoft_backend_3`
4. Crea todas las tablas necesarias
5. Inserta un usuario administrador en cada base de datos

**Credenciales del administrador creado:**
- Username: `admin`
- Password: `12345`
- Role: `super_admin`

### Paso 4: Verificar que las bases de datos se crearon

Conéctate a MySQL y ejecuta:

```sql
SHOW DATABASES;
```

Deberías ver:

```
+----------------------------+
| Database                   |
+----------------------------+
| mini_sivesoft_backend      |
| mini_sivesoft_backend_2    |
| mini_sivesoft_backend_3    |
| information_schema         |
| mysql                      |
| performance_schema         |
| sys                        |
+----------------------------+
```

### Paso 5: Verificar las tablas

```sql
USE mini_sivesoft_backend;
SHOW TABLES;
```

Deberías ver:

```
+---------------------------------+
| Tables_in_mini_sivesoft_backend |
+---------------------------------+
| business_entity                 |
| inventory_sheet                 |
| inventory_sheet_detail          |
| product                         |
| user                            |
| warehouse                       |
+---------------------------------+
```

¡Perfecto! Las bases de datos están listas 🎉

---

## 📥 Instalar Dependencias

Ahora vamos a instalar todas las librerías de Node.js necesarias.

### Paso 1: Navegar al proyecto

```powershell
cd D:\Proyectos\Freelance\mini_sivesoft_backend
```

### Paso 2: Instalar dependencias con npm

```powershell
npm install
```

Este comando lee el archivo `package.json` y descarga todas las dependencias. Puede tardar 2-5 minutos.

Verás muchas líneas de descarga y al final algo como:

```
added 1234 packages in 2m
```

✅ **¡Las dependencias están instaladas!**

---

## 🚀 Levantar el Servidor

¡Ya casi terminamos! Ahora vamos a iniciar el servidor de NestJS.

### Modo Desarrollo (con hot-reload)

Para desarrollo, usa este comando que reinicia automáticamente el servidor cuando haces cambios:

```powershell
npm run start:dev
```

Verás algo como:

```
[Nest] 12345  - 18/10/2025, 10:30:45 AM     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 18/10/2025, 10:30:45 AM     LOG [InstanceLoader] AppModule dependencies initialized
[Nest] 12345  - 18/10/2025, 10:30:45 AM     LOG [InstanceLoader] ConfigModule dependencies initialized
[Nest] 12345  - 18/10/2025, 10:30:45 AM     LOG [InstanceLoader] TenantModule dependencies initialized
[Nest] 12345  - 18/10/2025, 10:30:45 AM     LOG [InstanceLoader] UsersModule dependencies initialized
[Nest] 12345  - 18/10/2025, 10:30:45 AM     LOG [InstanceLoader] WarehousesModule dependencies initialized
[Nest] 12345  - 18/10/2025, 10:30:45 AM     LOG [InstanceLoader] ProductsModule dependencies initialized
[Nest] 12345  - 18/10/2025, 10:30:46 AM     LOG [NestApplication] Nest application successfully started
[Nest] 12345  - 18/10/2025, 10:30:46 AM     LOG Application is running on: http://localhost:3000
```

✅ **¡El servidor está corriendo en http://localhost:3000!**

### Modo Producción

Para producción, primero compila el proyecto:

```powershell
npm run build
npm run start:prod
```

---

## ✅ Verificar la Instalación

Ahora vamos a probar que todo funciona correctamente.

### Prueba 1: Health Check

Abre tu navegador y ve a:

```
http://localhost:3000
```

Deberías ver:

```json
{
  "message": "Hello World!"
}
```

### Prueba 2: Swagger API Documentation

Ve a:

```
http://localhost:3000/api
```

Deberías ver la interfaz de Swagger con todos los endpoints documentados.

### Prueba 3: Login con el usuario administrador

Usa **Postman**, **Thunder Client** o **curl** para hacer login:

**Endpoint:** `POST http://localhost:3000/auth/login`

**Body (JSON):**

```json
{
  "username": "admin",
  "password": "12345"
}
```

**Respuesta esperada:**

```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "role": "super_admin",
    "tenantId": "mini_sivesoft_backend"
  },
  "backendTokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

✅ **Si obtienes un `accessToken`, ¡todo funciona perfectamente!** 🎉

### Prueba 4: Probar un endpoint protegido

Usa el `accessToken` que obtuviste para hacer una petición protegida:

**Endpoint:** `GET http://localhost:3000/users`

**Headers:**

```
Authorization: Bearer <TU_ACCESS_TOKEN_AQUI>
```

Deberías ver la lista de usuarios (incluyendo el admin que acabas de usar).

---

## 👤 Crear Usuario Administrador (Opcional)

Si por alguna razón necesitas crear usuarios administradores adicionales o el script anterior no los creó, puedes usar este script:

### Opción 1: Ejecutar script SQL

```powershell
Get-Content .\create-admin-user.sql | docker exec -i mini_sivesoft_backend mysql -u root -p12345
```

### Opción 2: Crear manualmente desde la API

Usa el endpoint `POST /auth/register` con un token de super_admin existente.

---

## 🔧 Solución de Problemas

### Problema 1: "docker: command not found"

**Solución:** Docker Desktop no está instalado o no está en el PATH.

1. Verifica que Docker Desktop esté corriendo (icono verde en la barra de tareas)
2. Cierra y vuelve a abrir PowerShell
3. Si persiste, reinstala Docker Desktop

### Problema 2: "Port 3309 is already in use"

**Solución:** Otro servicio está usando el puerto 3309.

**Opción A:** Detener el servicio que usa el puerto

**Opción B:** Cambiar el puerto en `docker-compose.yml`:

```yaml
ports:
  - "3310:3306"  # Cambiar 3309 por 3310
```

Y actualiza el archivo `.env`:

```env
DB_PORT=3310
```

Luego ejecuta:

```powershell
docker-compose down
docker-compose up -d
```

### Problema 3: "Cannot find module '@nestjs/core'"

**Solución:** Las dependencias no se instalaron correctamente.

```powershell
rm -r node_modules
rm package-lock.json
npm install
```

### Problema 4: "Connection ETIMEDOUT" al conectar a MySQL

**Solución:** MySQL aún no está listo o el puerto es incorrecto.

1. Verifica que el contenedor esté corriendo: `docker ps`
2. Espera 30 segundos más y reintenta
3. Verifica los logs: `docker logs mini_sivesoft_backend`
4. Verifica que el puerto en `.env` coincida con `docker-compose.yml`

### Problema 5: Error de autenticación "Access denied for user 'root'"

**Solución:** La contraseña de MySQL es incorrecta.

La contraseña configurada en `docker-compose.yml` es `12345`. Si la cambiaste, usa la nueva contraseña.

### Problema 6: "Cannot GET /api"

**Solución:** La aplicación está corriendo pero no en el puerto esperado.

Verifica en la consola del servidor cuál es el puerto (debería ser 3000). Si es diferente, ajusta tus peticiones.

### Problema 7: El servidor no inicia - Error de TypeORM

**Solución:** Verifica que:

1. Las bases de datos estén creadas: `SHOW DATABASES;`
2. El archivo `.env` exista y tenga `DB_PORT=3309`
3. El contenedor de MySQL esté corriendo: `docker ps`

---

## 📚 Comandos Útiles

### Docker

```powershell
# Ver contenedores corriendo
docker ps

# Ver todos los contenedores (incluyendo detenidos)
docker ps -a

# Ver logs del contenedor
docker logs mini_sivesoft_backend

# Detener el contenedor
docker-compose down

# Detener y eliminar volúmenes (CUIDADO: Borra los datos)
docker-compose down -v

# Reiniciar el contenedor
docker-compose restart

# Ejecutar comando en el contenedor
docker exec -it mini_sivesoft_backend mysql -u root -p12345
```

### NPM

```powershell
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run start:dev

# Compilar para producción
npm run build

# Ejecutar en modo producción
npm run start:prod

# Correr tests
npm run test

# Ver scripts disponibles
npm run
```

### MySQL

```powershell
# Conectarse a MySQL en el contenedor
docker exec -it mini_sivesoft_backend mysql -u root -p12345

# Ejecutar un script SQL
Get-Content .\script.sql | docker exec -i mini_sivesoft_backend mysql -u root -p12345

# Backup de una base de datos
docker exec mini_sivesoft_backend mysqldump -u root -p12345 mini_sivesoft_backend > backup.sql

# Restaurar un backup
Get-Content .\backup.sql | docker exec -i mini_sivesoft_backend mysql -u root -p12345 mini_sivesoft_backend
```

---

## 🎯 Resumen de Puertos

| Servicio      | Puerto | URL                      |
|---------------|--------|--------------------------|
| Backend API   | 3000   | http://localhost:3000    |
| Swagger Docs  | 3000   | http://localhost:3000/api|
| MySQL Docker  | 3309   | localhost:3309           |

---

## 📖 Próximos Pasos

Una vez que el proyecto esté corriendo:

1. **Explora la API:** Ve a http://localhost:3000/api para ver todos los endpoints
2. **Lee la documentación de módulos:** Revisa los README.md en cada carpeta de módulos
3. **Crea entidades de negocio:** Usa el endpoint `POST /entities`
4. **Crea almacenes:** Usa el endpoint `POST /warehouses`
5. **Gestiona productos:** Usa los endpoints en `/products`
6. **Crea hojas de inventario:** Usa el endpoint `POST /inventory-sheets`

---

## 🆘 Soporte

Si tienes problemas que no están cubiertos en esta guía:

1. Revisa los logs del servidor: La terminal donde ejecutaste `npm run start:dev`
2. Revisa los logs de Docker: `docker logs mini_sivesoft_backend`
3. Verifica que todas las dependencias estén instaladas: `npm list`
4. Asegúrate de que los puertos no estén ocupados: `netstat -ano | findstr :3000` y `netstat -ano | findstr :3309`

---

## ✨ ¡Listo!

Si llegaste hasta aquí y todas las pruebas pasaron, **¡felicitaciones!** 🎉

Tu proyecto **Mini Sivesoft Backend** está completamente configurado y listo para desarrollo.

**Happy Coding! 🚀**
