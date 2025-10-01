#!/bin/bash
cd src/Mapas
gunicorn --bind 0.0.0.0:$PORT --workers 1 --timeout 600 --graceful-timeout 600 app:app
