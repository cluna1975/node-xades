require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const XAdESSignerSRI = require('./src/signer');
const XAdESValidator = require('./src/validator');

const app = express();
const PORT = process.env.PORT || 3000;

// Inicializar firmador global
let globalSigner = null;

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:"]
        }
    }
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Inicializar certificado al arrancar
async function initializeSigner() {
    try {
        const certPath = process.env.CERT_PATH || 'resources/mr.p12';
        const certPassword = process.env.CERT_PASSWORD || '';

        globalSigner = new XAdESSignerSRI();
        await globalSigner.loadCertificate(certPath, certPassword);

        console.log('✓ Certificado cargado correctamente');
        return true;
    } catch (error) {
        console.error('❌ Error al cargar certificado:', error.message);
        console.error('   El servidor funcionará pero no podrá firmar documentos');
        return false;
    }
}

// ============================================================
// ENDPOINTS API
// ============================================================

// GET /api/health - Estado del servicio
app.get('/api/health', async (req, res) => {
    const certificateInfo = globalSigner && globalSigner.certificate ? {
        loaded: true,
        issuer: globalSigner.certificate.issuer.getField('CN')?.value || 'N/A',
        subject: globalSigner.certificate.subject.getField('CN')?.value || 'N/A',
        validFrom: globalSigner.certificate.validity.notBefore.toISOString(),
        validUntil: globalSigner.certificate.validity.notAfter.toISOString()
    } : {
        loaded: false
    };

    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        certificate: certificateInfo,
        version: '1.0.0'
    });
});

// POST /api/sign - Firmar documento XML
app.post('/api/sign', async (req, res) => {
    try {
        // Verificar que el firmador esté inicializado
        if (!globalSigner || !globalSigner.certificate) {
            return res.status(503).json({
                success: false,
                error: 'Servicio no disponible',
                message: 'El certificado digital no está cargado. Verifique la configuración del servidor.'
            });
        }

        // Obtener contenido XML del body
        const { xmlContent, options = {} } = req.body;

        if (!xmlContent) {
            return res.status(400).json({
                success: false,
                error: 'Bad Request',
                message: 'El campo xmlContent es requerido'
            });
        }

        // Validar que sea XML válido
        if (!xmlContent.trim().startsWith('<?xml') && !xmlContent.trim().startsWith('<')) {
            return res.status(400).json({
                success: false,
                error: 'Invalid XML',
                message: 'El contenido no parece ser un XML válido'
            });
        }

        // Opciones de firma
        const signOptions = {
            algorithm: options.algorithm || 'SHA-1',
            productionPlace: options.productionPlace || {
                city: process.env.PRODUCTION_CITY || 'Quito',
                state: process.env.PRODUCTION_STATE || 'Pichincha',
                code: process.env.PRODUCTION_CODE || '170150',
                country: process.env.PRODUCTION_COUNTRY || 'EC'
            }
        };

        // Firmar documento
        const signedXml = await globalSigner.signXml(xmlContent, signOptions);

        res.json({
            success: true,
            signedXml: signedXml,
            timestamp: new Date().toISOString(),
            algorithm: signOptions.algorithm
        });

    } catch (error) {
        console.error('Error al firmar:', error);
        res.status(500).json({
            success: false,
            error: 'Signing Error',
            message: error.message
        });
    }
});

// POST /api/validate - Validar documento firmado
app.post('/api/validate', async (req, res) => {
    try {
        const { xmlContent } = req.body;

        if (!xmlContent) {
            return res.status(400).json({
                success: false,
                error: 'Bad Request',
                message: 'El campo xmlContent es requerido'
            });
        }

        // Validar estructura
        const validator = new XAdESValidator();
        const result = validator.validateStructure(xmlContent);

        res.json({
            success: true,
            validation: result,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error al validar:', error);
        res.status(500).json({
            success: false,
            error: 'Validation Error',
            message: error.message
        });
    }
});

// Ruta principal - servir interfaz web
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Ruta ${req.path} no encontrada`
    });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error no manejado:', err);
    res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: err.message
    });
});

// ============================================================
// INICIAR SERVIDOR
// ============================================================

async function startServer() {
    console.log('='.repeat(60));
    console.log('   SERVIDOR API XAdES-BES - SRI ECUADOR');
    console.log('='.repeat(60));
    console.log('');

    // Cargar certificado
    await initializeSigner();

    // Iniciar servidor
    app.listen(PORT, () => {
        console.log('');
        console.log('='.repeat(60));
        console.log(`✓ Servidor iniciado en http://localhost:${PORT}`);
        console.log('='.repeat(60));
        console.log('');
        console.log('Endpoints disponibles:');
        console.log(`  • GET  http://localhost:${PORT}/`);
        console.log(`  • GET  http://localhost:${PORT}/api/health`);
        console.log(`  • POST http://localhost:${PORT}/api/sign`);
        console.log(`  • POST http://localhost:${PORT}/api/validate`);
        console.log('');
        console.log('Presione Ctrl+C para detener el servidor');
        console.log('='.repeat(60));
    });
}

// Iniciar
startServer().catch(console.error);

module.exports = app;
