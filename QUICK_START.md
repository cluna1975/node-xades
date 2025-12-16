# 🚀 Inicio Rápido - XAdES-BES SRI Ecuador

## Configuración Inicial (Solo la primera vez)

### Opción 1: Configuración Automática (Recomendado)

```bash
./setup.sh
```

Este script:
1. Crea el archivo `.env` desde `.env.example`
2. Le solicita la contraseña del certificado
3. Configura automáticamente el archivo `.env`

### Opción 2: Configuración Manual

```bash
# 1. Copiar el archivo de ejemplo
cp .env.example .env

# 2. Editar el archivo .env
nano .env  # o use su editor preferido

# 3. Cambiar esta línea:
CERT_PASSWORD=su_contraseña_aqui
# Por la contraseña real de su certificado mr.p12
```

## Firmar Documentos

Una vez configurado, puede firmar documentos de dos formas:

### Opción A: Script Interactivo

```bash
./firmar.sh
```

Muestra un menú con opciones:
1. Firmar test.xml (documento de prueba)
2. Firmar factura de ejemplo  
3. Verificar documento firmado
4. Salir

### Opción B: Comandos Directos

```bash
# Firmar el documento de prueba test.xml
node examples/probar-firma.js

# Firmar factura de ejemplo
npm run test

# Verificar firma
npm run verify
```

## Archivos Importantes

- `.env` - **Configuración de contraseñas** (NO incluir en git)
- `.env.example` - Plantilla de configuración
- `resources/mr.p12` - Su certificado digital
- `resources/test.xml` - Documento de prueba para firmar

## ¿Problemas?

### Error: "Invalid password"

La contraseña en `.env` es incorrecta. Edite el archivo:
```bash
nano .env
```

Y actualice la línea `CERT_PASSWORD=...`

### Error: "Cannot find module 'dotenv'"

Instale las dependencias:
```bash
npm install
```

## Siguiente Paso

Después de firmar exitosamente, valide el documento en el **Portal del SRI**:
- https://srienlinea.sri.gob.ec/

---

📚 Para documentación completa, consulte [README.md](README.md)
