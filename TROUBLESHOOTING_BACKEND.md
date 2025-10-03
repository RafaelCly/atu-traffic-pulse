# 🚨 SOLUCIÓN - Backend desplegando Frontend por error

## ❌ PROBLEMA:
El servicio backend está desplegando nginx (frontend) en lugar de Flask/Gunicorn.

## ✅ SOLUCIÓN PASO A PASO:

### 1. Ve al servicio "atu-traffic-pulse" en Railway

### 2. Settings → General
Busca **"Config File Path"** y escribe:
```
railway.backend.toml
```

### 3. Si NO encuentras "Config File Path", entonces:

#### Opción A: Renombrar archivos temporalmente
En Railway Settings → Build → Watch Paths, pon:
```
Dockerfile.backend
```

Y temporalmente, en tu proyecto local, renombra:
```bash
# Renombrar Dockerfile.backend a Dockerfile
mv Dockerfile Dockerfile.temp
mv Dockerfile.backend Dockerfile
git add .
git commit -m "Use backend Dockerfile"
git push
```

#### Opción B: Usar railway.backend.json en lugar de .toml

### 4. Verifica Variables de Entorno
En la pestaña "Variables", asegúrate de tener:
```bash
FLASK_APP=src/Mapas/app.py
FLASK_ENV=production
PORT=5000
PYTHONUNBUFFERED=1
```

### 5. Forzar un Redeploy
- Ve a "Deployments"
- Haz clic en los tres puntos (...) del último deployment
- Selecciona "Redeploy"

---

## 🔍 VERIFICACIÓN:

Una vez que el deploy termine, revisa los logs. Deberías ver:
```
[INFO] Starting gunicorn...
[INFO] Listening at: http://0.0.0.0:5000
```

En lugar de:
```
[notice] nginx/1.29.1
```

---

## 🎯 LOGS CORRECTOS DEL BACKEND:

Deberías ver algo como:
```
Starting Container
[2025-10-03 07:32:16] [INFO] Starting gunicorn 22.0.0
[2025-10-03 07:32:16] [INFO] Listening at: http://0.0.0.0:5000 (1)
[2025-10-03 07:32:16] [INFO] Using worker: sync
[2025-10-03 07:32:16] [INFO] Booting worker with pid: 7
```

---

## 💡 ALTERNATIVA RÁPIDA:

Si nada funciona, la forma más rápida es:

1. **Eliminar el servicio backend actual en Railway**
2. **Crear un NUEVO servicio desde cero**
3. **En Settings → Source:**
   - Root Directory: (vacío)
4. **Crear un archivo en la raíz llamado exactamente `Dockerfile`** que contenga lo de `Dockerfile.backend`
5. **Railway automáticamente detectará y usará el Dockerfile**

¿Quieres que te ayude con la alternativa rápida?
