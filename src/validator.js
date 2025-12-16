const { DOMParser } = require('xmldom');
const { isValidXml } = require('./utils');

/**
 * Validador de firmas XAdES-BES para documentos del SRI Ecuador
 */
class XAdESValidator {

    /**
     * Valida la estructura básica de un documento firmado con XAdES-BES
     * @param {string} signedXml - Documento XML firmado
     * @returns {Object} - Resultado de la validación
     */
    validateStructure(signedXml) {
        const result = {
            valid: true,
            errors: [],
            warnings: [],
            info: {}
        };

        try {
            // Validar que sea XML bien formado
            if (!isValidXml(signedXml)) {
                result.valid = false;
                result.errors.push('El documento no es un XML bien formado');
                return result;
            }

            const parser = new DOMParser();
            const doc = parser.parseFromString(signedXml, 'application/xml');

            // Verificar que existe el elemento Signature
            const signatures = doc.getElementsByTagNameNS('http://www.w3.org/2000/09/xmldsig#', 'Signature');
            if (signatures.length === 0) {
                result.valid = false;
                result.errors.push('No se encontró el elemento ds:Signature');
                return result;
            }

            result.info.signatureCount = signatures.length;

            // Validar primera firma
            const signature = signatures[0];

            // Verificar SignedInfo
            const signedInfo = signature.getElementsByTagNameNS('http://www.w3.org/2000/09/xmldsig#', 'SignedInfo');
            if (signedInfo.length === 0) {
                result.valid = false;
                result.errors.push('No se encontró el elemento ds:SignedInfo');
            } else {
                result.info.hasSignedInfo = true;
            }

            // Verificar SignatureValue
            const signatureValue = signature.getElementsByTagNameNS('http://www.w3.org/2000/09/xmldsig#', 'SignatureValue');
            if (signatureValue.length === 0) {
                result.valid = false;
                result.errors.push('No se encontró el elemento ds:SignatureValue');
            } else {
                result.info.hasSignatureValue = true;
            }

            // Verificar KeyInfo
            const keyInfo = signature.getElementsByTagNameNS('http://www.w3.org/2000/09/xmldsig#', 'KeyInfo');
            if (keyInfo.length === 0) {
                result.warnings.push('No se encontró el elemento ds:KeyInfo');
            } else {
                result.info.hasKeyInfo = true;

                // Verificar X509Certificate
                const x509Data = keyInfo[0].getElementsByTagNameNS('http://www.w3.org/2000/09/xmldsig#', 'X509Data');
                if (x509Data.length > 0) {
                    const x509Cert = x509Data[0].getElementsByTagNameNS('http://www.w3.org/2000/09/xmldsig#', 'X509Certificate');
                    result.info.hasCertificate = x509Cert.length > 0;
                }
            }

            // Verificar Object (contiene las propiedades XAdES)
            const objects = signature.getElementsByTagNameNS('http://www.w3.org/2000/09/xmldsig#', 'Object');
            if (objects.length === 0) {
                result.warnings.push('No se encontró el elemento ds:Object');
            } else {
                result.info.hasObject = true;

                // Verificar QualifyingProperties (XAdES)
                const qualifyingProps = objects[0].getElementsByTagNameNS('http://uri.etsi.org/01903/v1.3.2#', 'QualifyingProperties');
                if (qualifyingProps.length === 0) {
                    result.warnings.push('No se encontraron QualifyingProperties (XAdES)');
                } else {
                    result.info.hasQualifyingProperties = true;

                    // Verificar SignedProperties
                    const signedProps = qualifyingProps[0].getElementsByTagNameNS('http://uri.etsi.org/01903/v1.3.2#', 'SignedProperties');
                    if (signedProps.length > 0) {
                        result.info.hasSignedProperties = true;

                        // Verificar SigningTime
                        const signingTime = signedProps[0].getElementsByTagNameNS('http://uri.etsi.org/01903/v1.3.2#', 'SigningTime');
                        if (signingTime.length > 0) {
                            result.info.signingTime = signingTime[0].textContent;
                        } else {
                            result.warnings.push('No se encontró SigningTime');
                        }

                        // Verificar SigningCertificate
                        const signingCert = signedProps[0].getElementsByTagNameNS('http://uri.etsi.org/01903/v1.3.2#', 'SigningCertificate');
                        result.info.hasSigningCertificate = signingCert.length > 0;
                    }
                }
            }

            // Verificar que no haya tags auto-cerrados (requisito SRI)
            if (signedXml.includes('/>') && !signedXml.match(/^<\?xml[^>]+\?>/)) {
                result.warnings.push('Se encontraron tags auto-cerrados, el SRI puede rechazarlos');
            }

            // Verificar encoding UTF-8
            if (!signedXml.includes('encoding="UTF-8"') && !signedXml.includes("encoding='UTF-8'")) {
                result.warnings.push('El documento no especifica encoding UTF-8');
            }

        } catch (error) {
            result.valid = false;
            result.errors.push(`Error al validar: ${error.message}`);
        }

        return result;
    }

    /**
     * Imprime un reporte de validación
     * @param {Object} validationResult - Resultado de validateStructure()
     */
    printReport(validationResult) {
        console.log('\n' + '='.repeat(60));
        console.log('REPORTE DE VALIDACIÓN XAdES-BES');
        console.log('='.repeat(60));

        if (validationResult.valid) {
            console.log('✓ VÁLIDO - La estructura básica es correcta');
        } else {
            console.log('✗ INVÁLIDO - Se encontraron errores');
        }

        if (validationResult.errors.length > 0) {
            console.log('\nERRORES:');
            validationResult.errors.forEach(err => console.log(`  ✗ ${err}`));
        }

        if (validationResult.warnings.length > 0) {
            console.log('\nADVERTENCIAS:');
            validationResult.warnings.forEach(warn => console.log(`  ⚠ ${warn}`));
        }

        if (Object.keys(validationResult.info).length > 0) {
            console.log('\nINFORMACIÓN:');
            Object.entries(validationResult.info).forEach(([key, value]) => {
                console.log(`  • ${key}: ${value}`);
            });
        }

        console.log('\n' + '='.repeat(60));
        console.log('NOTA: Esta es una validación básica de estructura.');
        console.log('Para validación completa, use el portal del SRI.');
        console.log('='.repeat(60) + '\n');
    }

    /**
     * Valida un archivo XML firmado
     * @param {string} filePath - Ruta del archivo a validar
     * @returns {Object} - Resultado de la validación
     */
    validateFile(filePath) {
        const fs = require('fs');
        const signedXml = fs.readFileSync(filePath, 'utf8');
        return this.validateStructure(signedXml);
    }
}

module.exports = XAdESValidator;
