#!/bin/bash

echo "🚀 Iniciando servidor de producción..."

# Usar el puerto proporcionado por Render o el 10000 por defecto
PORT=${PORT:-10000}

echo "📡 Servidor escuchando en puerto $PORT"

# Iniciar el servidor de preview de Vite
npx vite preview --host 0.0.0.0 --port $PORT
