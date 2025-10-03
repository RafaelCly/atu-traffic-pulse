# 🚂 Guía de Despliegue en Railway - ATU Traffic Pulse

Este proyecto tiene **DOS servicios separados** que deben desplegarse en Railway:

## 📦 Estructura de Archivos

```
├── Dockerfile.frontend          ← Frontend (React + Vite + Nginx)
├── Dockerfile.backend           ← Backend (Python + Flask)
├── railway.frontend.json        ← Configuración Railway para Frontend
├── railway.backend.json         ← Configuración Railway para Backend
└── railway.json                 ← Configuración por defecto (Frontend)
```

---

## 🎯 SERVICIO 1: BACKEND (Python/Flask)

### 📋 Configuración en Railway

**1. Settings → Build:**
- Builder: `Dockerfile`
- Dockerfile Path: `Dockerfile.backend`

**2. Variables de Entorno:**
```bash
FLASK_APP=src/Mapas/app.py
FLASK_ENV=production
PORT=5000
PYTHONUNBUFFERED=1
```

**3. Settings → Networking:**
- ✅ Habilita "Generate Domain"
- Obtendrás: `atu-traffic-pulse-backend.up.railway.app` (o similar)

**4. Root Directory:**
- Dejar en blanco (raíz del proyecto)

**5. Deploy:**
- Custom Start Command: (vacío, usa el del Dockerfile)

### 🔍 Verificación Backend:
Una vez desplegado, prueba:
- `https://TU-BACKEND-URL.up.railway.app/api/debug`
- Deberías ver un JSON con información del sistema

---

## 🎨 SERVICIO 2: FRONTEND (React/Vite)

### 📋 Configuración en Railway

**1. Settings → Build:**
- Builder: `Dockerfile`
- Dockerfile Path: `Dockerfile.frontend`

**2. Variables de Entorno:**
```bash
VITE_API_URL=https://TU-BACKEND-URL.up.railway.app
PORT=80
NODE_ENV=production
```

⚠️ **IMPORTANTE:** Reemplaza `TU-BACKEND-URL` con la URL real de tu backend del Paso 1.

**3. Settings → Networking:**
- ✅ Habilita "Generate Domain"
- Obtendrás: `atu-traffic-pulse.up.railway.app` (o similar)

**4. Root Directory:**
- Dejar en blanco (raíz del proyecto)

**5. Deploy:**
- Custom Start Command: (vacío, usa el del Dockerfile)

### 🔍 Verificación Frontend:
Una vez desplegado, prueba:
- `https://TU-FRONTEND-URL.up.railway.app`
- Deberías ver la aplicación web funcionando

---

## 📝 PASOS PARA DESPLEGAR (Orden Importante)

### ✅ Paso 1: Desplegar BACKEND primero

1. En Railway, crea un **NUEVO servicio** llamado `atu-traffic-pulse-backend`
2. Conecta tu repositorio de GitHub
3. Ve a **Settings**
4. Cambia el **Dockerfile Path** a `Dockerfile.backend`
5. Agrega las **variables de entorno del backend**
6. En **Networking**, haz clic en **"Generate Domain"**
7. **Guarda** y espera a que se despliegue
8. **COPIA la URL** generada (la necesitarás para el frontend)

### ✅ Paso 2: Desplegar FRONTEND

1. En Railway, crea un **SEGUNDO servicio** llamado `atu-traffic-pulse-frontend`
2. Conecta el **mismo repositorio** de GitHub
3. Ve a **Settings**
4. Cambia el **Dockerfile Path** a `Dockerfile.frontend`
5. Agrega las **variables de entorno del frontend**
   - ⚠️ Usa la URL del backend que copiaste en el Paso 1
6. En **Networking**, haz clic en **"Generate Domain"**
7. **Guarda** y espera a que se despliegue
8. ¡Visita la URL del frontend para ver tu app! 🎉

---

## 🚨 TROUBLESHOOTING

### ❌ "No aparece la URL del servicio"
**Solución:**
1. Ve a **Settings → Networking**
2. Asegúrate de que **Public Networking** esté habilitado
3. Haz clic en **"Generate Domain"**

### ❌ "El frontend no se conecta al backend"
**Solución:**
1. Verifica que `VITE_API_URL` tenga la URL correcta del backend
2. Asegúrate de que la URL del backend **NO** termine en `/`
3. Prueba el endpoint del backend directamente: `https://tu-backend.up.railway.app/api/debug`

### ❌ "Error 502 Bad Gateway"
**Solución:**
1. Ve a **Deployments** y revisa los logs
2. Verifica que el puerto esté correctamente configurado
3. Backend debe usar puerto `5000`
4. Frontend usa puerto `80`

### ❌ "Build falla en Railway"
**Solución:**
1. Revisa los logs en **Deployments**
2. Asegúrate de que todos los archivos estén commiteados en Git
3. Verifica que `package-lock.json` exista para el frontend
4. Verifica que `requirements.txt` exista para el backend

---

## 🔧 Configuración Avanzada

### Usar archivos de configuración específicos

Si Railway no detecta automáticamente la configuración:

**Para Backend:**
```bash
# En Settings → General → Config File Path
railway.backend.json
```

**Para Frontend:**
```bash
# En Settings → General → Config File Path
railway.frontend.json
```

---

## 📊 Monitoreo

### Logs en Tiempo Real:
1. Ve a la pestaña **"Deployments"**
2. Selecciona el deployment activo
3. Revisa los logs en tiempo real

### Métricas:
1. Ve a la pestaña **"Metrics"**
2. Monitorea CPU, RAM, y Network

---

## 🎯 URLs Finales

Una vez desplegado, tendrás:

- **Backend API:** `https://atu-traffic-pulse-backend.up.railway.app`
- **Frontend App:** `https://atu-traffic-pulse.up.railway.app`

¡Listo! 🚀
