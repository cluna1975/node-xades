# Proyecto XAdES-BES para SRI Ecuador

<div align="center">

![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![XAdES-BES](https://img.shields.io/badge/XAdES-BES-orange)

**Firma digital de documentos XML según estándar XAdES-BES para el SRI de Ecuador**

</div>

## 📋 Descripción

Este proyecto proporciona una solución completa en Node.js para firmar digitalmente documentos XML utilizando el estándar **XAdES-BES** (XML Advanced Electronic Signatures - Basic Electronic Signature), cumpliendo con los requisitos específicos del **Servicio de Rentas Internas (SRI)** de Ecuador.

### Características

✅ Firma digital XAdES-BES compatible con SRI Ecuador  
✅ Soporte para certificados digitales .p12/.pfx  
✅ Validación básica de estructura de firmas  
✅ Manejo automático de timezone Ecuador (GMT-5)  
✅ Ejemplos completos de uso  
✅ Documentación detallada

## 🚀 Instalación

### Requisitos Previos

- **Node.js** >= 14.0.0
- **npm** >= 6.0.0
- **Certificado digital** (.p12 o .pfx) válido

### Pasos de Instalación

```bash
# 1. Clonar o descargar el proyecto
cd node-xades

# 2. Instalar dependencias
npm install

# 3. Configurar el archivo .env
cp .env.example .env

# 4. Editar .env y configurar la contraseña del certificado
# Abra el archivo .env y cambie:
# CERT_PASSWORD=su_contraseña_aqui
# Por la contraseña real de su certificado mr.p12

# O use el script de configuración automática:
./setup.sh
```

## 📖 Uso Rápido

### Firmar un Documento

```javascript
// Asegúrese de tener .env configurado con CERT_PASSWORD
require('dotenv').config();
const XAdESSignerSRI = require('./src/signer');

async function firmar() {
  const signer = new XAdESSignerSRI();
  
  // Cargar certificado (usa CERT_PASSWORD del .env)
  await signer.loadCertificate(
    'resources/mr.p12',
    process.env.CERT_PASSWORD
  );
  
  // Firmar archivo
  await signer.signFile(
    'factura-sin-firmar.xml',
    'factura-firmada.xml'
  );
}

firmar();
```

### Verificar una Firma

```javascript
const XAdESValidator = require('./src/validator');

const validator = new XAdESValidator();
const result = validator.validateFile('factura-firmada.xml');

validator.printReport(result);
```

## 🎯 Ejemplos

El proyecto incluye ejemplos completos en la carpeta `examples/`:

### Firmar una Factura

```bash
npm run test
# o
node examples/firmar-factura.js
```

Este ejemplo:
1. Carga el certificado digital `mr.p12`
2. Lee el archivo `examples/data/factura-sin-firmar.xml`
3. Genera la firma XAdES-BES
4. Guarda el resultado en `examples/data/factura-firmada.xml`

### Verificar una Firma

```bash
npm run verify
# o
node examples/verificar-firma.js
```

Este ejemplo valida la estructura XAdES-BES del documento firmado.

## 📁 Estructura del Proyecto

```
node-xades/
├── src/
│   ├── signer.js      # Clase principal para firmar documentos
│   ├── validator.js   # Validador de firmas XAdES-BES
│   └── utils.js       # Utilidades (formato XML, timezone, etc.)
├── examples/
│   ├── firmar-factura.js    # Ejemplo de firma
│   ├── verificar-firma.js   # Ejemplo de verificación
│   └── data/
│       └── factura-sin-firmar.xml  # Factura de prueba
├── mr.p12             # Su certificado digital (no incluido)
├── package.json
└── README.md
```

## 🔧 API Reference

### XAdESSignerSRI

#### `loadCertificate(certPath, password)`

Carga un certificado digital desde un archivo .p12 o .pfx.

**Parámetros:**
- `certPath` (string): Ruta al archivo del certificado
- `password` (string): Contraseña del certificado

**Ejemplo:**
```javascript
await signer.loadCertificate('mr.p12', 'mi_contraseña');
```

#### `signXml(xmlContent, options)`

Firma un contenido XML y retorna el XML firmado.

**Parámetros:**
- `xmlContent` (string): Contenido XML a firmar
- `options` (object): Opciones de firma
  - `algorithm` (string): 'SHA-1' o 'SHA-256' (default: 'SHA-1')
  - `productionPlace` (object): Lugar de producción
  - `signerRole` (object): Rol del firmante

**Retorna:** String con el XML firmado

**Ejemplo:**
```javascript
const signedXml = await signer.signXml(xmlContent, {
  algorithm: 'SHA-1',
  productionPlace: {
    city: 'Quito',
    state: 'Pichincha',
    code: '170150',
    country: 'EC'
  }
});
```

#### `signFile(inputPath, outputPath, options)`

Firma un archivo XML y guarda el resultado.

**Parámetros:**
- `inputPath` (string): Ruta del archivo XML a firmar
- `outputPath` (string): Ruta donde guardar el XML firmado
- `options` (object): Opciones de firma (opcional)

**Ejemplo:**
```javascript
await signer.signFile(
  'entrada.xml',
  'salida.xml',
  { algorithm: 'SHA-1' }
);
```

### XAdESValidator

#### `validateStructure(signedXml)`

Valida la estructura XAdES-BES de un documento firmado.

**Parámetros:**
- `signedXml` (string): Contenido XML firmado

**Retorna:** Objeto con resultado de validación
```javascript
{
  valid: boolean,
  errors: string[],
  warnings: string[],
  info: object
}
```

#### `validateFile(filePath)`

Valida un archivo XML firmado.

**Parámetros:**
- `filePath` (string): Ruta del archivo a validar

**Retorna:** Objeto con resultado de validación

#### `printReport(validationResult)`

Imprime un reporte detallado de la validación.

**Parámetros:**
- `validationResult` (object): Resultado de `validateStructure()` o `validateFile()`

## 📝 Requisitos del SRI

El proyecto cumple con los siguientes requisitos del SRI Ecuador:

- ✅ Estándar XAdES-BES (versión 1.3.2)
- ✅ Tipo de firma: Enveloped
- ✅ Codificación: UTF-8
- ✅ Algoritmo de hash: SHA-1 (configurable a SHA-256)
- ✅ Sin tags auto-cerrados (`<tag></tag>` en lugar de `<tag/>`)
- ✅ Timezone Ecuador (GMT-5) para SigningTime
- ✅ Estructura completa con SignedProperties

## 🔐 Seguridad

### Contraseña del Certificado

**Recomendación:** Use variables de entorno para la contraseña del certificado:

```bash
export CERT_PASSWORD="su_contraseña_segura"
```

Luego en su código:
```javascript
const password = process.env.CERT_PASSWORD;
await signer.loadCertificate('mr.p12', password);
```

### Certificados

⚠️ **NUNCA** suba certificados digitales (.p12, .pfx) a repositorios públicos.

El archivo `.gitignore` ya está configurado para excluir certificados.

## ❓ Solución de Problemas

### Error: "No se pudo cargar el certificado"

**Causas posibles:**
- Contraseña incorrecta
- Archivo de certificado corrupto
- Certificado expirado

**Solución:**
1. Verifique la contraseña del certificado
2. Confirme que el archivo .p12 no esté dañado
3. Revise la fecha de validez del certificado

### Error: "El documento no es un XML bien formado"

**Causa:** El archivo XML de entrada tiene errores de sintaxis.

**Solución:**
1. Valide el XML en un editor o validador online
2. Corrija los errores de estructura
3. Asegúrese de que tenga la declaración XML: `<?xml version="1.0" encoding="UTF-8"?>`

### La firma no es aceptada por el SRI

**Causa:** La estructura puede no cumplir exactamente con los requisitos del SRI.

**Solución:**
1. Ejecute la verificación: `npm run verify`
2. Revise las advertencias del reporte
3. Compare con un documento firmado válido del SRI
4. Asegúrese de que no haya tags auto-cerrados

## 🔗 Enlaces Útiles

- [Documentación SRI - Facturación Electrónica](https://www.sri.gob.ec/facturacion-electronica)
- [Especificación XAdES](https://www.w3.org/TR/XAdES/)
- [Biblioteca xadesjs](https://www.npmjs.com/package/xadesjs)
- [Obtener Certificado Digital en Ecuador](https://www.eci.bce.ec/)

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo LICENSE para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Cree una rama para su feature (`git checkout -b feature/AmazingFeature`)
3. Commit sus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abra un Pull Request

## ⚠️ Disclaimer

Este proyecto es una herramienta de ayuda para la firma digital de documentos. La responsabilidad del cumplimiento de las normativas del SRI recae en el usuario final. Se recomienda siempre validar los documentos firmados en el portal oficial del SRI antes de su uso en producción.

## 📞 Soporte

Para reportar problemas o sugerencias, por favor abra un Issue en el repositorio.

---

<div align="center">

**Desarrollado para facilitar la firma digital de documentos electrónicos en Ecuador** 🇪🇨

</div>
