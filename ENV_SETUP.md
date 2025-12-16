# ✅ Configuración con .env Completada

El proyecto ahora utiliza archivos `.env` para manejar la configuración de forma segura.

## 🎯 Cambios Realizados

### 1. Nuevo Sistema de Configuración

- ✅ **Instalado `dotenv`** - Paquete npm para manejar variables de entorno
- ✅ **Creado `.env.example`** - Plantilla de configuración
- ✅ **Actualizado `.gitignore`** - Excluye archivos `.env` del control de versiones

### 2. Scripts de Ayuda

- ✅ **`setup.sh`** - Script interactivo para configuración inicial
- ✅ **`firmar.sh`** - Script de menú para firmar documentos (actualizado)

### 3. Ejemplos Actualizados

Todos los ejemplos ahora usan `dotenv`:

- ✅ `examples/probar-firma.js`  
- ✅ `examples/firmar-factura.js`
- ✅ `examples/verificar-firma.js`

### 4. Documentación Actualizada

- ✅ **README.md** - Sección de instalación actualizada
- ✅ **QUICK_START.md** - Guía completa de .env

## 🚀 Cómo Usar

### Primera Vez (Configuración)

```bash
# Opción 1: Automático (Recomendado)
./setup.sh

# Opción 2: Manual  
cp .env.example .env
nano .env  # Editar y poner contraseña
```

### Firmar Documentos

```bash
# Método 1: Script interactivo
./firmar.sh

# Método 2: Directamente
node examples/probar-firma.js
```

## 📝 Estructura del .env

```env
# Contraseña del certificado digital
CERT_PASSWORD=su_contraseña_aqui

# Ruta del certificado (relativa al proyecto)
CERT_PATH=resources/mr.p12

# Algoritmo de firma (SHA-1 o SHA-256)
SIGNATURE_ALGORITHM=SHA-1

# Ubicación de producción (opcional)
PRODUCTION_CITY=Quito
PRODUCTION_STATE=Pichincha
PRODUCTION_CODE=170150
PRODUCTION_COUNTRY=EC
```

## 🔒 Seguridad

- ✅ El archivo `.env` está en `.gitignore` y **NO se subirá a git**
- ✅ Solo `.env.example` (sin contraseñas) se incluye en el repositorio
- ✅ Cada desarrollador mantiene su propio `.env` local

## ✅ Próximos Pasos

1. **Configure su .env:**
   ```bash
   ./setup.sh
   ```

2. **Pruebe la firma:**
   ```bash
   node examples/probar-firma.js
   ```

3. **Si funciona, verá:**
   ```
   ✓ Certificado cargado exitosamente
   ✓ Documento firmado guardado en: resources/test-firmado.xml
   ```

## 📚 Documentación

- Ver [QUICK_START.md](file:///Users/home/node-xades/QUICK_START.md) para guía rápida
- Ver [README.md](file:///Users/home/node-xades/README.md) para documentación completa
