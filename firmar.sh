#!/bin/bash

# Script de ayuda para firmar documentos con XAdES-BES

echo "============================================================"
echo "    FIRMADOR XAdES-BES PARA SRI ECUADOR"
echo "============================================================"
echo ""

# Verificar que existe el certificado
if [ ! -f "resources/mr.p12" ]; then
    echo "❌ Error: No se encuentra el certificado resources/mr.p12"
    exit 1
fi

# Verificar contraseña del certificado
if [ -z "$CERT_PASSWORD" ]; then
    echo "⚠️  ADVERTENCIA: Variable CERT_PASSWORD no configurada"
    echo ""
    echo "Para configurar la contraseña del certificado:"
    echo "  export CERT_PASSWORD=\"su_contraseña\""
    echo ""
    read -p "¿Desea continuar sin contraseña? (s/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 1
    fi
fi

# Menú de opciones
echo ""
echo "Seleccione una opción:"
echo "  1) Firmar test.xml (documento de prueba)"
echo "  2) Firmar factura de ejemplo"
echo "  3) Verificar documento firmado"
echo "  4) Salir"
echo ""
read -p "Opción: " option

case $option in
    1)
        echo ""
        echo "Firmando resources/test.xml..."
        node examples/probar-firma.js
        ;;
    2)
        echo ""
        echo "Firmando factura de ejemplo..."
        npm run test
        ;;
    3)
        echo ""
        echo "Verificando firma..."
        npm run verify
        ;;
    4)
        echo "Saliendo..."
        exit 0
        ;;
    *)
        echo "Opción inválida"
        exit 1
        ;;
esac
