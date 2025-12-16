const path = require('path');
require('dotenv').config(); // Cargar variables de entorno desde .env
const XAdESSignerSRI = require('../src/signer');

/**
 * Script de prueba para firmar el archivo test.xml con el certificado mr.p12
 */
async function probarFirma() {
    console.log('='.repeat(60));
    console.log('PRUEBA DE FIRMA CON CERTIFICADO mr.p12');
    console.log('='.repeat(60));

    try {
        // 1. Crear instancia del firmador
        const signer = new XAdESSignerSRI();

        // 2. Cargar el certificado digital
        console.log('\n[1/3] Cargando certificado digital...');
        const certPath = path.join(__dirname, '..', 'resources', 'mr.p12');

        // Intentar sin contraseña primero, o usar la de variables de entorno
        const certPassword = process.env.CERT_PASSWORD || '';

        // Verificar que la contraseña esté configurada
        if (!certPassword) {
            console.log('\n⚠️  ADVERTENCIA: No se ha configurado CERT_PASSWORD');
            console.log('   Configure la contraseña en el archivo .env en la raíz del proyecto:');
            console.log('   1. Copie .env.example a .env:  cp .env.example .env');
            console.log('   2. Edite .env y configure: CERT_PASSWORD=su_contraseña\n');
        }

        await signer.loadCertificate(certPath, certPassword);

        // 3. Firmar el documento test.xml
        console.log('\n[2/3] Firmando documento test.xml...');
        const inputPath = path.join(__dirname, '..', 'resources', 'test.xml');
        const outputPath = path.join(__dirname, '..', 'resources', 'test-firmado.xml');

        const options = {
            algorithm: 'SHA-1',
            productionPlace: {
                city: 'Quito',
                state: 'Pichincha',
                code: '170150',
                country: 'EC'
            }
        };

        await signer.signFile(inputPath, outputPath, options);

        // 4. Confirmación
        console.log('\n[3/3] Proceso completado');
        console.log('\n' + '='.repeat(60));
        console.log('✓ DOCUMENTO FIRMADO EXITOSAMENTE');
        console.log('='.repeat(60));
        console.log(`\nArchivo firmado: ${outputPath}`);
        console.log('\n📝 PRÓXIMOS PASOS:');
        console.log('   1. Verifique la firma con: npm run verify');
        console.log('   2. Valide el archivo en el portal del SRI\n');

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);

        if (error.message.includes('contraseña') || error.message.includes('password')) {
            console.error('\n💡 SOLUCIÓN:');
            console.error('   El certificado requiere una contraseña.');
            console.error('   Configure el archivo .env:');
            console.error('   1. cp .env.example .env');
            console.error('   2. Edite .env y configure: CERT_PASSWORD=su_contraseña\n');
        } else {
            console.error('\n📋 SOLUCIÓN DE PROBLEMAS:');
            console.error('   • Verifique que resources/mr.p12 exista');
            console.error('   • Confirme que resources/test.xml sea válido');
            console.error('   • Revise que el certificado no haya expirado\n');
        }
        process.exit(1);
    }
}

// Ejecutar
if (require.main === module) {
    probarFirma();
}

module.exports = probarFirma;
