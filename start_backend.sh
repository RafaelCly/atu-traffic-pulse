#!/bin/bash
cd src/Mapas
gunicorn --bind 0.0.0.0:$PORT --workers 1 --timeout 300 --graceful-timeout 300 app:app
