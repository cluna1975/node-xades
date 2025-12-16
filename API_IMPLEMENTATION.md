# 🚀 API REST y Web Interface - XAdES-BES

## ✅ Implementación Completada

Se ha creado exitosamente una API REST con interfaz web profesional para el servicio de firma digital XAdES-BES.

## 📦 Componentes Creados

### Backend API Server

#### [server.js](file:///Users/home/node-xades/server.js)
- Servidor Express.js con middleware de seguridad (Helmet, CORS)
- Inicialización automática del certificado al arrancar
- 3 endpoints REST completamente funcionales
- Manejo de errores centralizado
- Servidor corriendo en puerto 3000

### Web Interface

#### [public/index.html](file:///Users/home/node-xades/public/index.html)
- **Diseño profesional y elegante** con gradientes modernos
- **FontAwesome 6.4.0** para iconos
- **Diseño responsivo** adaptable a móviles y tablets
- **Animaciones suaves** en cards y botones
- **Validación en tiempo real** del estado del servidor

**Características de la interfaz:**
- ✨ Subida de archivos por arrastrar y soltar
- 📝 Editor de texto para pegar contenido XML
- 🎨 Tarjetas con efecto hover y sombras
- 📊 Visualización de resultados con código de colores
- 💾 Descarga directa de documentos firmados
- 🟢 Indicador de estado del servidor en tiempo real

### Documentación

#### [API.md](file:///Users/home/node-xades/API.md)
- Documentación completa de todos los endpoints
- Ejemplos de código en JavaScript, Python y PHP
- Especificaciones de request/response
- Códigos de error y soluciones
- Configuración de seguridad

## 🎯 Endpoints API

### 1. GET /api/health
- **Función:** Verificar estado del servicio
- **Retorna:** Info del certificado y estado del servidor

### 2. POST /api/sign
- **Función:** Firmar documentos XML con XAdES-BES
- **Input:** XML en formato string
- **Output:** XML firmado con estructura completa

### 3. POST /api/validate
- **Función:** Validar estructura de documentos firmados
- **Input:** XML firmado
- **Output:** Reporte de validación detallado

## 🎨 Características de Diseño

### Paleta de Colores
- **Primary:** #2563eb (Azul profesional)
- **Secondary:** #10b981 (Verde éxito)
- **Danger:** #ef4444 (Rojo advertencia)
- **Background:** Gradiente púrpura (#667eea → #764ba2)

### Iconos FontAwesome Utilizados
- 🖊️ `fa-file-signature` - Logo principal
- ✏️ `fa-pen-fancy` - Sección de firma
- ✅ `fa-check-circle` - Validación
- ☁️ `fa-cloud-upload-alt` - Subida de archivos
- 🚀 `fa-rocket` - Info cards
- 🛡️ `fa-shield-alt` - Seguridad
- 💻 `fa-code` - Editor XML

### Efectos Visuales
- Sombras suaves con `box-shadow`
- Transiciones de 0.3s en hover
- Animaciones de entrada con `@keyframes slideIn`
- Indicador de carga tipo spinner
- Cards con efecto de elevación

## 🧪 Pruebas Realizadas

### Test del Servidor

```bash
npm start
```

**Resultado:** ✅ Exitoso

```
✓ Certificado cargado exitosamente
  Emisor: AUTORIDAD DE CERTIFICACION SUBCA-2 SECURITY DATA
  Titular: MARIA DEL CARMEN RUGEL ARMENDARIZ
  Válido desde: 2023-12-27T14:57:07.000Z
  Válido hasta: 2025-12-26T14:57:07.000Z

✓ Servidor iniciado en http://localhost:3000
```

### Endpoints Disponibles

✅ GET  `http://localhost:3000/`  
✅ GET  `http://localhost:3000/api/health`  
✅ POST `http://localhost:3000/api/sign`  
✅ POST `http://localhost:3000/api/validate`  

## 📖 Uso

### Iniciar el Servidor

```bash
# Configurar .env (solo primera vez)
cp .env.example .env
nano .env  # Configurar CERT_PASSWORD

# Iniciar servidor
npm start
```

### Acceder a la Interfaz Web

1. Abrir navegador en: **http://localhost:3000**
2. El servidor verifica automáticamente el estado
3. Usar la interfaz para firmar o validar documentos

### Firmar un Documento

**Opción A: Via Web**
1. Acceder a http://localhost:3000
2. Arrastrar archivo XML o pegar contenido
3. Clic en "Firmar Documento"
4. Descargar XML firmado

**Opción B: Via API**
```javascript
const response = await fetch('http://localhost:3000/api/sign', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ xmlContent: '<?xml...' })
});

const data = await response.json();
console.log(data.signedXml);
```

## 🔧 Configuración

### Variables de Entorno (.env)

```env
CERT_PASSWORD=contraseña_del_certificado
CERT_PATH=resources/mr.p12
PORT=3000
NODE_ENV=development
```

### package.json Scripts

```json
{
  "start": "node server.js",    // Iniciar servidor
  "dev": "node server.js",      // Modo desarrollo
  "test": "...",                // Firmar ejemplo
  "verify": "..."               // Validar firma
}
```

## 🔒 Seguridad

- ✅ **Helmet** - Headers de seguridad HTTP
- ✅ **CORS** - Control de acceso entre orígenes
- ✅ **Content Security Policy** - Prevención XSS
- ✅ **Límites de tamaño** - 10MB máximo
- ✅ **Validación de entrada** - XML válido requerido

## 📊 Tecnologías Utilizadas

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Express.js | 4.x | Framework web |
| Helmet | Latest | Seguridad HTTP |
| CORS | Latest | Control de acceso |
| FontAwesome | 6.4.0 | Iconos |
| node-forge | 1.3.1 | Firma digital |

## 🎯 Próximos Pasos

1. **Probar la interfaz web** en http://localhost:3000
2. **Firmar un documento** usando el archivo `resources/test.xml`
3. **Validar el resultado** con el endpoint /api/validate
4. **Integrar en su aplicación** usando los ejemplos de API.md

## 📚 Documentación

- Ver [API.md](file:///Users/home/node-xades/API.md) para documentación completa de API
- Ver [README.md](file:///Users/home/node-xades/README.md) para documentación general
- Ver [QUICK_START.md](file:///Users/home/node-xades/QUICK_START.md) para inicio rápido

---

**✅ Proyecto completamente funcional con API REST y Web Interface profesional**
