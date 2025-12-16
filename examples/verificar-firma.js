const path = require('path');
const fs = require('fs');
const XAdESValidator = require('../src/validator');

/**
 * Ejemplo de cómo verificar una factura firmada
 */
function verificarFirma() {
    console.log('='.repeat(60));
    console.log('VERIFICACIÓN DE FIRMA XAdES-BES');
    console.log('='.repeat(60));

    try {
        // Ruta del archivo firmado
        const signedFilePath = path.join(__dirname, 'data', 'factura-firmada.xml');

        // Verificar que el archivo existe
        if (!fs.existsSync(signedFilePath)) {
            console.error('\n❌ ERROR: No se encontró el archivo firmado');
            console.error(`   Ruta buscada: ${signedFilePath}`);
            console.error('\n💡 Primero debe firmar un documento con: npm run test\n');
            process.exit(1);
        }

        // Crear validador y verificar
        const validator = new XAdESValidator();
        console.log(`\nVerificando: ${signedFilePath}\n`);

        const result = validator.validateFile(signedFilePath);

        // Mostrar reporte
        validator.printReport(result);

        // Código de salida según resultado
        process.exit(result.valid ? 0 : 1);

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        process.exit(1);
    }
}

// Ejecutar la verificación
if (require.main === module) {
    verificarFirma();
}

module.exports = verificarFirma;
