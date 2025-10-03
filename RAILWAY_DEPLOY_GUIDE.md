# Despliegue en Railway - ATU Traffic Pulse

## 📋 Requisitos Previos
- Cuenta en [Railway.app](https://railway.app)
- Repositorio de GitHub con el proyecto

## 🚀 Pasos para Desplegar

### 1. Conectar con Railway

1. Ve a [Railway.app](https://railway.app) e inicia sesión
2. Haz clic en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Autoriza Railway para acceder a tu repositorio
5. Selecciona el repositorio `atu-traffic-pulse`

### 2. Configuración Automática

Railway detectará automáticamente:
- ✅ Python 3.11.9 (definido en `runtime.txt` y `.python-version`)
- ✅ Dependencias (desde `requirements.txt`)
- ✅ Comando de inicio (desde `Procfile`)

### 3. Variables de Entorno (Opcional)

Si tu aplicación necesita variables de entorno:

1. En el dashboard de Railway, ve a **"Variables"**
2. Agrega las variables necesarias:
   ```
   PORT=5000
   FLASK_ENV=production
   ```

### 4. Despliegue

Railway automáticamente:
1. 🔨 Instalará Python 3.11.9
2. 📦 Instalará las dependencias
3. 🚀 Ejecutará el comando del Procfile
4. 🌐 Asignará una URL pública

### 5. Verificar Despliegue

1. Ve a la pestaña **"Deployments"** en Railway
2. Espera a que el estado sea **"SUCCESS"** (✓)
3. Haz clic en el dominio generado (ej: `your-app.up.railway.app`)
4. Tu aplicación debería estar funcionando 🎉

## 📁 Archivos de Configuración Creados

### `runtime.txt`
Especifica la versión de Python:
```
python-3.11.9
```

### `.python-version`
Versión alternativa para algunos builders:
```
3.11.9
```

### `Procfile`
Define cómo iniciar la aplicación:
```
web: gunicorn --chdir src/Mapas app:app --bind 0.0.0.0:$PORT --workers 1 --timeout 120
```

### `railway.json` (Opcional)
Configuración específica de Railway:
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pip install -r requirements.txt"
  },
  "deploy": {
    "startCommand": "gunicorn ...",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### `nixpacks.toml` (Opcional)
Configuración del builder Nixpacks:
```toml
[build]
builder = "NIXPACKS"

[build.env]
PYTHON_VERSION = "3.11.9"
```

## 🔧 Comandos de Gunicorn

El `Procfile` usa Gunicorn con las siguientes opciones:
- `--chdir src/Mapas`: Cambia al directorio de la aplicación
- `app:app`: Módulo y objeto Flask
- `--bind 0.0.0.0:$PORT`: Usa el puerto de Railway
- `--workers 1`: Un worker (ajustable según recursos)
- `--timeout 120`: Timeout de 120 segundos

## 📊 Logs y Monitoreo

Para ver logs en tiempo real:
1. Ve al dashboard de Railway
2. Haz clic en tu servicio
3. Ve a la pestaña **"Logs"**

## 🔄 Redespliegues

Railway redespliega automáticamente cuando:
- Haces push a la rama principal (main/master)
- Cambias variables de entorno
- Haces clic en "Redeploy" manualmente

## ⚠️ Notas Importantes

1. **Python 3.11.9**: Railway usará Python 3.11.9 como especificaste
2. **Caché**: Railway cachea dependencias para builds más rápidos
3. **Dominio personalizado**: Puedes agregar tu propio dominio en Settings
4. **Base de datos**: Si necesitas BD, agrégala desde "New" → "Database"

## 🐛 Troubleshooting

### Error: "Application failed to start"
- Verifica los logs en Railway
- Asegúrate de que `gunicorn` está en `requirements.txt`
- Verifica que la ruta en el Procfile es correcta

### Error: "Module not found"
- Verifica que todas las dependencias están en `requirements.txt`
- Revisa que la versión de Python es compatible

### Error de memoria
- Aumenta los recursos del plan de Railway
- Reduce el número de workers en el Procfile

## 📞 Soporte

- [Railway Docs](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [GitHub Issues](https://github.com/RafaelCly/atu-traffic-pulse/issues)

---

✅ **¡Listo para desplegar!** Solo sube estos cambios a GitHub y conecta con Railway.
