#!/bin/bash

echo "============================================================"
echo "    CONFIGURACIÓN INICIAL - XAdES-BES SRI ECUADOR"
echo "============================================================"
echo ""

# 1. Copiar .env.example a .env si no existe
if [ ! -f ".env" ]; then
    echo "📝 Creando archivo .env desde .env.example..."
    cp .env.example .env
    echo "✓ Archivo .env creado"
    echo ""
else
    echo "✓ El archivo .env ya existe"
    echo ""
fi

# 2. Solicitar contraseña del certificado
echo "🔐 Configurar contraseña del certificado"
echo ""
read -sp "Ingrese la contraseña del certificado mr.p12: " password
echo ""

if [ -z "$password" ]; then
    echo "⚠️  No se proporcionó contraseña. Puede configurarla manualmente en .env"
else
    # Actualizar .env con la contraseña
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/CERT_PASSWORD=.*/CERT_PASSWORD=$password/" .env
    else
        # Linux
        sed -i "s/CERT_PASSWORD=.*/CERT_PASSWORD=$password/" .env
    fi
    echo "✓ Contraseña configurada en .env"
fi

echo ""
echo "============================================================"
echo "✓ CONFIGURACIÓN COMPLETADA"
echo "============================================================"
echo ""
echo "Próximos pasos:"
echo "  1. Ejecute: ./firmar.sh"
echo "  2. O ejecute: node examples/probar-firma.js"
echo ""
