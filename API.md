# API REST - XAdES-BES SRI Ecuador

## 📡 Documentación de Endpoints

Base URL: `http://localhost:3000`

### 1. GET /api/health

Verifica el estado del servicio y del certificado digital.

**Request:**
```bash
curl http://localhost:3000/api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-15T21:00:00.000Z",
  "certificate": {
    "loaded": true,
    "issuer": "Nombre del emisor",
    "subject": "Nombre del titular",
    "validFrom": "2024-01-01T00:00:00.000Z",
    "validUntil": "2026-01-01T00:00:00.000Z"
  },
  "version": "1.0.0"
}
```

---

### 2. POST /api/sign

Firma un documento XML con XAdES-BES.

**Request:**
```bash
curl -X POST http://localhost:3000/api/sign \
  -H "Content-Type: application/json" \
  -d '{
    "xmlContent": "<?xml version=\"1.0\" encoding=\"UTF-8\"?><factura>...</factura>",
    "options": {
      "algorithm": "SHA-1",
      "productionPlace": {
        "city": "Quito",
        "state": "Pichincha",
        "code": "170150",
        "country": "EC"
      }
    }
  }'
```

**Body Parameters:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `xmlContent` | string | Sí | Contenido del documento XML a firmar |
| `options` | object | No | Opciones de firma |
| `options.algorithm` | string | No | Algoritmo de hash (SHA-1 o SHA-256). Default: SHA-1 |
| `options.productionPlace` | object | No | Lugar de producción del documento |

**Success Response (200):**
```json
{
  "success": true,
  "signedXml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?><factura>...<ds:Signature>...</ds:Signature></factura>",
  "timestamp": "2025-12-15T21:00:00.000Z",
  "algorithm": "SHA-1"
}
```

**Error Responses:**

- **400 Bad Request:** XML inválido o falta xmlContent
```json
{
  "success": false,
  "error": "Bad Request",
  "message": "El campo xmlContent es requerido"
}
```

- **503 Service Unavailable:** Certificado no cargado
```json
{
  "success": false,
  "error": "Servicio no disponible",
  "message": "El certificado digital no está cargado..."
}
```

---

### 3. POST /api/validate

Valida la estructura de un documento XML firmado con XAdES-BES.

**Request:**
```bash
curl -X POST http://localhost:3000/api/validate \
  -H "Content-Type: application/json" \
  -d '{
    "xmlContent": "<?xml version=\"1.0\" encoding=\"UTF-8\"?><factura>...<ds:Signature>...</ds:Signature></factura>"
  }'
```

**Body Parameters:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `xmlContent` | string | Sí | Contenido del documento XML firmado a validar |

**Success Response (200):**
```json
{
  "success": true,
  "validation": {
    "valid": true,
    "errors": [],
    "warnings": [
      "No se encontró SigningTime"
    ],
    "info": {
      "signatureCount": 1,
      "hasSignedInfo": true,
      "hasSignatureValue": true,
      "hasKeyInfo": true,
      "hasCertificate": true,
      "hasObject": true,
      "hasQualifyingProperties": true,
      "hasSignedProperties": true,
      "signingTime": "2025-12-15T21:00:00-05:00",
      "hasSigningCertificate": true
    }
  },
  "timestamp": "2025-12-15T21:00:00.000Z"
}
```

---

## 🚀 Inicio Rápido

### 1. Configurar e Iniciar Servidor

```bash
# Configurar .env
cp .env.example .env
nano .env  # Editar CERT_PASSWORD

# Iniciar servidor
npm start
```

### 2. Acceder a la Interfaz Web

Abra su navegador en: **http://localhost:3000**

La interfaz web permite:
- ✨ Firmar documentos XML arrastrando archivos o pegando contenido
- ✅ Validar firmas XAdES-BES  
- 📥 Descargar documentos firmados
- 🎨 Interfaz moderna con FontAwesome

### 3. Usar la API Programáticamente

#### JavaScript/Node.js

```javascript
const fs = require('fs');

async function firmarDocumento() {
  const xmlContent = fs.readFileSync('factura.xml', 'utf8');
  
  const response = await fetch('http://localhost:3000/api/sign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ xmlContent })
  });
  
  const data = await response.json();
  
  if (data.success) {
    fs.writeFileSync('factura-firmada.xml', data.signedXml);
    console.log('✓ Documento firmado');
  }
}

firmarDocumento();
```

#### Python

```python
import requests

with open('factura.xml', 'r') as f:
    xml_content = f.read()

response = requests.post('http://localhost:3000/api/sign', json={
    'xmlContent': xml_content
})

data = response.json()

if data['success']:
    with open('factura-firmada.xml', 'w') as f:
        f.write(data['signedXml'])
    print('✓ Documento firmado')
```

#### PHP

```php
<?php
$xmlContent = file_get_contents('factura.xml');

$ch = curl_init('http://localhost:3000/api/sign');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'xmlContent' => $xmlContent
]));

$response = curl_exec($ch);
$data = json_decode($response, true);

if ($data['success']) {
    file_put_contents('factura-firmada.xml', $data['signedXml']);
    echo "✓ Documento firmado\n";
}
?>
```

---

## 🔒 Seguridad

### Headers de Seguridad

El servidor utiliza **Helmet** para configurar headers de seguridad HTTP:
- Content Security Policy (CSP)
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection

### CORS

CORS está habilitado para permitir peticiones desde cualquier origen en desarrollo. En producción, configure dominios específicos.

### Límites

- **Tamaño máximo de body:** 10MB
- **Tipos de archivo permitidos:** Solo XML

---

## 📊 Códigos de Estado HTTP

| Código | Significado |
|--------|-------------|
| 200 | Success - Solicitud procesada correctamente |
| 400 | Bad Request - Parámetros inválidos o faltantes |
| 404 | Not Found - Endpoint no existe |
| 500 | Internal Server Error - Error en el servidor |
| 503 | Service Unavailable - Certificado no disponible |

---

## 🛠️ Configuración

### Variables de Entorno (.env)

```env
# Certificado
CERT_PASSWORD=contraseña_del_certificado
CERT_PATH=resources/mr.p12

# Servidor
PORT=3000
NODE_ENV=development
MAX_FILE_SIZE=5242880

# Firma
SIGNATURE_ALGORITHM=SHA-1
PRODUCTION_CITY=Quito
PRODUCTION_STATE=Pichincha
PRODUCTION_CODE=170150
PRODUCTION_COUNTRY=EC
```

---

## 📝 Notas

- El servidor debe tener acceso al certificado `.p12` configurado
- La contraseña del certificado debe estar en `.env`
- Los documentos deben tener `id="comprobante"` en el elemento raíz
- La validación local es básica; use el portal del SRI para validación oficial

---

## 🔗 Enlaces Útiles

- **Portal SRI:** https://srienlinea.sri.gob.ec/
- **Documentación XAdES:** https://www.w3.org/TR/XAdES/
- **FontAwesome Icons:** https://fontawesome.com/icons
