const path = require('path');
require('dotenv').config(); // Cargar variables de entorno desde .env
const XAdESSignerSRI = require('../src/signer');

/**
 * Ejemplo de cómo firmar una factura electrónica para el SRI Ecuador
 */
async function firmarFactura() {
    console.log('='.repeat(60));
    console.log('FIRMA DE FACTURA ELECTRÓNICA - SRI ECUADOR');
    console.log('='.repeat(60));

    try {
        // 1. Crear instancia del firmador
        const signer = new XAdESSignerSRI();

        // 2. Cargar el certificado digital
        console.log('\n[1/3] Cargando certificado digital...');
        const certPath = path.join(__dirname, '..', 'resources', 'mr.p12');
        const certPassword = process.env.CERT_PASSWORD || '';

        if (!certPassword) {
            console.log('\n⚠️  ADVERTENCIA: No se ha configurado CERT_PASSWORD en .env');
            console.log('   Configure la contraseña en el archivo .env:');
            console.log('   1. cp .env.example .env');
            console.log('   2. Edite .env y configure: CERT_PASSWORD=su_contraseña\n');
        }

        await signer.loadCertificate(certPath, certPassword);

        // 3. Firmar el documento
        console.log('\n[2/3] Firmando documento...');
        const inputPath = path.join(__dirname, 'data', 'factura-sin-firmar.xml');
        const outputPath = path.join(__dirname, 'data', 'factura-firmada.xml');

        // Opciones de firma (opcional)
        const options = {
            algorithm: 'SHA-1', // SHA-1 es el tradicional para SRI
            productionPlace: {
                city: 'Quito',
                state: 'Pichincha',
                code: '170150',
                country: 'EC'
            },
            signerRole: {
                claimed: ['Emisor']
            }
        };

        await signer.signFile(inputPath, outputPath, options);

        // 4. Confirmación
        console.log('\n[3/3] Proceso completado');
        console.log('\n' + '='.repeat(60));
        console.log('✓ FACTURA FIRMADA EXITOSAMENTE');
        console.log('='.repeat(60));
        console.log(`\nArchivo firmado: ${outputPath}`);
        console.log('\n📝 PRÓXIMOS PASOS:');
        console.log('   1. Verifique la firma con: npm run verify');
        console.log('   2. Valide el archivo en el portal del SRI');
        console.log('   3. Envíe el comprobante electrónico\n');

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error('\n📋 SOLUCIÓN DE PROBLEMAS:');
        console.error('   • Verifique que el certificado mr.p12 esté en la raíz del proyecto');
        console.error('   • Confirme que la contraseña del certificado sea correcta');
        console.error('   • Asegúrese de que el certificado no haya expirado');
        console.error('   • Verifique que el archivo XML de entrada sea válido\n');
        process.exit(1);
    }
}

// Ejecutar el ejemplo
if (require.main === module) {
    firmarFactura();
}

module.exports = firmarFactura;
