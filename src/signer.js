const forge = require('node-forge');
const { DOMParser, XMLSerializer } = require('xmldom');
const fs = require('fs');
const crypto = require('crypto');
const { getEcuadorTimestamp } = require('./utils');

/**
 * Clase para firmar documentos XML con XAdES-BES según especificaciones del SRI Ecuador
 * Implementación simplificada usando node-forge
 */
class XAdESSignerSRI {
  constructor() {
    this.certificate = null;
    this.privateKey = null;
  }

  /**
   * Carga un certificado digital desde archivo .p12/.pfx
   * @param {string} certPath - Ruta al archivo del certificado
   * @param {string} password - Contraseña del certificado
   */
  async loadCertificate(certPath, password) {
    try {
      // Leer el archivo del certificado
      const p12Data = fs.readFileSync(certPath);
      const p12Asn1 = forge.asn1.fromDer(p12Data.toString('binary'));
      const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

      // Extraer certificado y clave privada
      const bags = p12.getBags({ bagType: forge.pki.oids.certBag });
      const certBag = bags[forge.pki.oids.certBag][0];
      this.certificate = certBag.cert;

      const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
      const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0];
      this.privateKey = keyBag.key;

      console.log('✓ Certificado cargado exitosamente');
      console.log(`  Emisor: ${this.certificate.issuer.getField('CN')?.value || 'N/A'}`);
      console.log(`  Titular: ${this.certificate.subject.getField('CN')?.value || 'N/A'}`);
      console.log(`  Válido desde: ${this.certificate.validity.notBefore.toISOString()}`);
      console.log(`  Válido hasta: ${this.certificate.validity.notAfter.toISOString()}`);

      return true;
    } catch (error) {
      console.error('Error al cargar el certificado:', error.message);
      throw new Error(`No se pudo cargar el certificado: ${error.message}`);
    }
  }

  /**
   * Crea un elemento XML con namespace
   */
  createElementNS(doc, namespace, tagName) {
    const element = doc.createElementNS(namespace, tagName);
    return element;
  }

  /**
   * Firma un documento XML con XAdES-BES
   * @param {string} xmlContent - Contenido XML a firmar
   * @param {Object} options - Opciones de firma
   * @returns {string} - XML firmado
   */
  async signXml(xmlContent, options = {}) {
    if (!this.certificate || !this.privateKey) {
      throw new Error('Debe cargar un certificado antes de firmar');
    }

    try {
      // Parsear el documento XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, 'application/xml');
      const rootElement = xmlDoc.documentElement;

      // Namespaces
      const dsNS = 'http://www.w3.org/2000/09/xmldsig#';
      const xadesNS = 'http://uri.etsi.org/01903/v1.3.2#';

      // Calcular digest del documento (sin firma)
      const serializer = new XMLSerializer();
      const canonicalDoc = serializer.serializeToString(rootElement);
      const docDigest = crypto.createHash('sha1').update(canonicalDoc).digest('base64');

      // Crear elemento Signature
      const signature = this.createElementNS(xmlDoc, dsNS, 'ds:Signature');
      signature.setAttribute('xmlns:ds', dsNS);
      signature.setAttribute('xmlns:etsi', xadesNS);
      signature.setAttribute('Id', 'Signature');

      // SignedInfo
      const signedInfo = this.createElementNS(xmlDoc, dsNS, 'ds:SignedInfo');
      signature.appendChild(signedInfo);

      // CanonicalizationMethod
      const canonMethod = this.createElementNS(xmlDoc, dsNS, 'ds:CanonicalizationMethod');
      canonMethod.setAttribute('Algorithm', 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315');
      signedInfo.appendChild(canonMethod);

      // SignatureMethod
      const sigMethod = this.createElementNS(xmlDoc, dsNS, 'ds:SignatureMethod');
      sigMethod.setAttribute('Algorithm', 'http://www.w3.org/2000/09/xmldsig#rsa-sha1');
      signedInfo.appendChild(sigMethod);

      // Reference al documento
      const reference = this.createElementNS(xmlDoc, dsNS, 'ds:Reference');
      reference.setAttribute('URI', '#comprobante');
      signedInfo.appendChild(reference);

      // Transforms
      const transforms = this.createElementNS(xmlDoc, dsNS, 'ds:Transforms');
      reference.appendChild(transforms);

      const transform = this.createElementNS(xmlDoc, dsNS, 'ds:Transform');
      transform.setAttribute('Algorithm', 'http://www.w3.org/2000/09/xmldsig#enveloped-signature');
      transforms.appendChild(transform);

      // DigestMethod
      const digestMethod = this.createElementNS(xmlDoc, dsNS, 'ds:DigestMethod');
      digestMethod.setAttribute('Algorithm', 'http://www.w3.org/2000/09/xmldsig#sha1');
      reference.appendChild(digestMethod);

      // DigestValue
      const digestValue = this.createElementNS(xmlDoc, dsNS, 'ds:DigestValue');
      digestValue.textContent = docDigest;
      reference.appendChild(digestValue);

      // Referencia a SignedProperties
      const refSigProps = this.createElementNS(xmlDoc, dsNS, 'ds:Reference');
      refSigProps.setAttribute('Type', 'http://uri.etsi.org/01903#SignedProperties');
      refSigProps.setAttribute('URI', '#SignedProperties');
      signedInfo.appendChild(refSigProps);

      const digestMethodSP = this.createElementNS(xmlDoc, dsNS, 'ds:DigestMethod');
      digestMethodSP.setAttribute('Algorithm', 'http://www.w3.org/2000/09/xmldsig#sha1');
      refSigProps.appendChild(digestMethodSP);

      const digestValueSP = this.createElementNS(xmlDoc, dsNS, 'ds:DigestValue');
      digestValueSP.textContent = ''; // Se calculará después
      refSigProps.appendChild(digestValueSP);

      // Calgular la firma de SignedInfo
      const signedInfoC14n = serializer.serializeToString(signedInfo);
      const md = forge.md.sha1.create();
      md.update(signedInfoC14n, 'utf8');
      const signatureValueBytes = this.privateKey.sign(md);
      const signatureValueBase64 = forge.util.encode64(signatureValueBytes);

      // SignatureValue
      const signatureValue = this.createElementNS(xmlDoc, dsNS, 'ds:SignatureValue');
      signatureValue.setAttribute('Id', 'SignatureValue');
      signatureValue.textContent = signatureValueBase64;
      signature.appendChild(signatureValue);

      // KeyInfo
      const keyInfo = this.createElementNS(xmlDoc, dsNS, 'ds:KeyInfo');
      keyInfo.setAttribute('Id', 'KeyInfo');
      signature.appendChild(keyInfo);

      const x509Data = this.createElementNS(xmlDoc, dsNS, 'ds:X509Data');
      keyInfo.appendChild(x509Data);

      const x509Cert = this.createElementNS(xmlDoc, dsNS, 'ds:X509Certificate');
      const certPem = forge.pki.certificateToPem(this.certificate);
      const certBase64 = certPem.replace(/-----BEGIN CERTIFICATE-----|-----END CERTIFICATE-----|\n/g, '');
      x509Cert.textContent = certBase64;
      x509Data.appendChild(x509Cert);

      // KeyValue (opcional pero recomendado)
      const keyValue = this.createElementNS(xmlDoc, dsNS, 'ds:KeyValue');
      keyInfo.appendChild(keyValue);

      const rsaKeyValue = this.createElementNS(xmlDoc, dsNS, 'ds:RSAKeyValue');
      keyValue.appendChild(rsaKeyValue);

      const modulus = this.createElementNS(xmlDoc, dsNS, 'ds:Modulus');
      modulus.textContent = forge.util.encode64(forge.util.hexToBytes(this.certificate.publicKey.n.toString(16)));
      rsaKeyValue.appendChild(modulus);

      const exponent = this.createElementNS(xmlDoc, dsNS, 'ds:Exponent');
      exponent.textContent = forge.util.encode64(forge.util.hexToBytes(this.certificate.publicKey.e.toString(16)));
      rsaKeyValue.appendChild(exponent);

      // Object con XAdES properties
      const object = this.createElementNS(xmlDoc, dsNS, 'ds:Object');
      object.setAttribute('Id', 'Object');
      signature.appendChild(object);

      // QualifyingProperties
      const qualifyingProps = this.createElementNS(xmlDoc, xadesNS, 'etsi:QualifyingProperties');
      qualifyingProps.setAttribute('Target', '#Signature');
      object.appendChild(qualifyingProps);

      // SignedProperties
      const signedProps = this.createElementNS(xmlDoc, xadesNS, 'etsi:SignedProperties');
      signedProps.setAttribute('Id', 'SignedProperties');
      qualifyingProps.appendChild(signedProps);

      // SignedSignatureProperties
      const signedSigProps = this.createElementNS(xmlDoc, xadesNS, 'etsi:SignedSignatureProperties');
      signedProps.appendChild(signedSigProps);

      // SigningTime
      const signingTime = this.createElementNS(xmlDoc, xadesNS, 'etsi:SigningTime');
      signingTime.textContent = getEcuadorTimestamp();
      signedSigProps.appendChild(signingTime);

      // SigningCertificate
      const signingCert = this.createElementNS(xmlDoc, xadesNS, 'etsi:SigningCertificate');
      signedSigProps.appendChild(signingCert);

      const cert = this.createElementNS(xmlDoc, xadesNS, 'etsi:Cert');
      signingCert.appendChild(cert);

      const certDigest = this.createElementNS(xmlDoc, xadesNS, 'etsi:CertDigest');
      cert.appendChild(certDigest);

      const certDigestMethod = this.createElementNS(xmlDoc, dsNS, 'ds:DigestMethod');
      certDigestMethod.setAttribute('Algorithm', 'http://www.w3.org/2000/09/xmldsig#sha1');
      certDigest.appendChild(certDigestMethod);

      const certDer = forge.asn1.toDer(forge.pki.certificateToAsn1(this.certificate)).getBytes();
      const certDigestValue = crypto.createHash('sha1').update(certDer, 'binary').digest('base64');

      const certDigestVal = this.createElementNS(xmlDoc, dsNS, 'ds:DigestValue');
      certDigestVal.textContent = certDigestValue;
      certDigest.appendChild(certDigestVal);

      const issuerSerial = this.createElementNS(xmlDoc, xadesNS, 'etsi:IssuerSerial');
      cert.appendChild(issuerSerial);

      const x509IssuerName = this.createElementNS(xmlDoc, dsNS, 'ds:X509IssuerName');
      x509IssuerName.textContent = this.certificate.issuer.attributes.map(attr => {
        return `${attr.shortName}=${attr.value}`;
      }).join(',');
      issuerSerial.appendChild(x509IssuerName);

      const x509SerialNumber = this.createElementNS(xmlDoc, dsNS, 'ds:X509SerialNumber');
      x509SerialNumber.textContent = this.certificate.serialNumber;
      issuerSerial.appendChild(x509SerialNumber);

      // Calcular digest de SignedProperties
      const signedPropsC14n = serializer.serializeToString(signedProps);
      const signedPropsDigest = crypto.createHash('sha1').update(signedPropsC14n).digest('base64');
      digestValueSP.textContent = signedPropsDigest;

      // Agregar firma al documento
      rootElement.appendChild(signature);

      // Serializar
      let signedXml = serializer.serializeToString(xmlDoc);

      // Evitar tags auto-cerrados
      signedXml = this.fixSelfClosingTags(signedXml);

      return signedXml;
    } catch (error) {
      console.error('Error al firmar el documento:', error);
      throw new Error(`Error en la firma: ${error.message}`);
    }
  }

  /**
   * Convierte tags auto-cerrados a formato completo
   * @param {string} xml - XML con posibles tags auto-cerrados
   * @returns {string} - XML con tags en formato completo
   */
  fixSelfClosingTags(xml) {
    // Reemplazar tags auto-cerrados excepto declaración XML
    return xml.replace(/<([^?\/][^>\/]*)\/>/g, '<$1></$1>');
  }

  /**
   * Firma un archivo XML y guarda el resultado
   * @param {string} inputPath - Ruta del archivo XML a firmar
   * @param {string} outputPath - Ruta donde guardar el XML firmado
   * @param {Object} options - Opciones de firma
   */
  async signFile(inputPath, outputPath, options = {}) {
    try {
      console.log(`\nFirmando documento: ${inputPath}`);

      // Leer el archivo XML
      const xmlContent = fs.readFileSync(inputPath, 'utf8');

      // Firmar
      const signedXml = await this.signXml(xmlContent, options);

      // Guardar el resultado
      fs.writeFileSync(outputPath, signedXml, 'utf8');

      console.log(`✓ Documento firmado guardado en: ${outputPath}`);

      return signedXml;
    } catch (error) {
      console.error('Error al firmar el archivo:', error.message);
      throw error;
    }
  }
}

module.exports = XAdESSignerSRI;
