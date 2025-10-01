#!/bin/bash

echo "🚀 Iniciando build de producción..."

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Build del proyecto
echo "🔨 Construyendo proyecto..."
npm run build

echo "✅ Build completado exitosamente!"
