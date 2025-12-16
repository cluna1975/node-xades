const { DOMParser, XMLSerializer } = require('xmldom');

/**
 * Utilidades para manejo de XML y formatos
 */

/**
 * Formatea XML con indentación legible
 * @param {string} xml - String XML a formatear
 * @returns {string} - XML formateado
 */
function formatXml(xml) {
    try {
        const formatted = xml
            .replace(/></g, '>\n<')
            .split('\n')
            .map((line, index) => {
                const trimmed = line.trim();
                if (!trimmed) return '';

                // Calcular nivel de indentación
                const openTags = (xml.substring(0, xml.indexOf(trimmed)).match(/</g) || []).length;
                const closeTags = (xml.substring(0, xml.indexOf(trimmed)).match(/>/g) || []).length;
                const indent = '  '.repeat(Math.max(0, openTags - closeTags));

                return indent + trimmed;
            })
            .join('\n');

        return formatted;
    } catch (error) {
        return xml; // Si falla, retornar original
    }
}

/**
 * Obtiene la fecha y hora actual en formato ISO 8601 con timezone de Ecuador (GMT-5)
 * @returns {string} - Fecha en formato ISO 8601
 */
function getEcuadorTimestamp() {
    const now = new Date();

    // Ecuador está en GMT-5
    const ecuadorOffset = -5 * 60; // minutos
    const localOffset = now.getTimezoneOffset(); // minutos
    const ecuadorTime = new Date(now.getTime() + (ecuadorOffset - localOffset) * 60000);

    // Formato: YYYY-MM-DDTHH:mm:ss-05:00
    const year = ecuadorTime.getFullYear();
    const month = String(ecuadorTime.getMonth() + 1).padStart(2, '0');
    const day = String(ecuadorTime.getDate()).padStart(2, '0');
    const hours = String(ecuadorTime.getHours()).padStart(2, '0');
    const minutes = String(ecuadorTime.getMinutes()).padStart(2, '0');
    const seconds = String(ecuadorTime.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}-05:00`;
}

/**
 * Valida que un string sea XML bien formado
 * @param {string} xml - String a validar
 * @returns {boolean} - true si es XML válido
 */
function isValidXml(xml) {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, 'application/xml');

        // Buscar errores de parseo
        const parseError = doc.getElementsByTagName('parsererror');
        return parseError.length === 0;
    } catch (error) {
        return false;
    }
}

/**
 * Extrae el elemento raíz de un documento XML
 * @param {string} xml - Documento XML
 * @returns {Object} - Información del elemento raíz
 */
function getRootElement(xml) {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, 'application/xml');
        const root = doc.documentElement;

        return {
            tagName: root.tagName,
            attributes: Array.from(root.attributes || []).reduce((acc, attr) => {
                acc[attr.name] = attr.value;
                return acc;
            }, {}),
            namespace: root.namespaceURI
        };
    } catch (error) {
        return null;
    }
}

/**
 * Convierte un Buffer a string hexadecimal
 * @param {Buffer} buffer - Buffer a convertir
 * @returns {string} - String hexadecimal
 */
function bufferToHex(buffer) {
    return Array.from(buffer)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Convierte un string hexadecimal a Buffer
 * @param {string} hex - String hexadecimal
 * @returns {Buffer} - Buffer resultante
 */
function hexToBuffer(hex) {
    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return Buffer.from(bytes);
}

module.exports = {
    formatXml,
    getEcuadorTimestamp,
    isValidXml,
    getRootElement,
    bufferToHex,
    hexToBuffer
};
