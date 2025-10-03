# Configuración de Frontend y Backend en Railway

## 🏗️ Arquitectura del Proyecto

Este proyecto tiene **dos componentes separados**:

1. **Frontend** - React + Vite (Puerto 80)
2. **Backend** - Flask + Python (Puerto 5000)

## 🚀 Despliegue en Railway

### Opción 1: Dos Servicios Separados (Recomendado)

#### Servicio 1: Backend (Python/Flask)

1. En Railway, crea un **nuevo servicio** desde tu repositorio
2. Nómbralo: `atu-traffic-backend`
3. En **Settings** → **Environment**:
   - Agrega variable: `DOCKERFILE_PATH` = `Dockerfile.backend`
4. En **Settings** → **Build**:
   - Custom Dockerfile Path: `Dockerfile.backend`
5. Railway usará:
   - ✅ Python 3.11.9
   - ✅ Puerto asignado por Railway (variable $PORT)
   - ✅ Gunicorn como servidor

#### Servicio 2: Frontend (React/Vite)

1. En Railway, crea **otro servicio** desde el **mismo repositorio**
2. Nómbralo: `atu-traffic-frontend`
3. En **Settings** → **Environment**:
   - Agrega variable: `DOCKERFILE_PATH` = `Dockerfile.frontend`
   - Agrega variable: `VITE_API_URL` = `<URL_DEL_BACKEND>` (la URL de tu servicio backend)
4. En **Settings** → **Build**:
   - Custom Dockerfile Path: `Dockerfile.frontend`
5. Railway usará:
   - ✅ Node.js 18
   - ✅ Nginx para servir archivos estáticos
   - ✅ Puerto 80 (Railway lo mapeará)

### 📋 Variables de Entorno

#### Backend (.env en Railway)
```bash
PORT=5000  # Railway lo asigna automáticamente
FLASK_ENV=production
```

#### Frontend (.env en Railway)
```bash
VITE_API_URL=https://tu-backend.railway.app  # URL de tu servicio backend
```

## 🔧 Configuración Manual en Railway Dashboard

### Para el Backend:

1. Ve a tu servicio backend en Railway
2. Settings → Deploy → Build Configuration
3. **Builder**: Dockerfile
4. **Dockerfile Path**: `Dockerfile.backend`
5. Guarda y redespliega

### Para el Frontend:

1. Ve a tu servicio frontend en Railway
2. Settings → Deploy → Build Configuration
3. **Builder**: Dockerfile
4. **Dockerfile Path**: `Dockerfile.frontend`
5. En Settings → Variables, agrega:
   ```
   VITE_API_URL=https://[tu-backend-url].railway.app
   ```
6. Guarda y redespliega

## 📁 Estructura de Archivos

```
proyecto/
├── Dockerfile.backend          # Docker para Python/Flask
├── Dockerfile.frontend         # Docker para React/Vite
├── nginx.conf                  # Configuración Nginx para frontend
├── requirements.txt            # Dependencias Python
├── package.json                # Dependencias Node.js
├── src/
│   ├── Mapas/                  # Backend Python
│   │   ├── app.py
│   │   └── ...
│   ├── components/             # Frontend React
│   ├── pages/
│   └── ...
└── ...
```

## ✅ Verificación

### Backend funcionando:
```bash
curl https://tu-backend.railway.app/health
# Debería retornar: {"status": "ok"}
```

### Frontend funcionando:
- Abre: `https://tu-frontend.railway.app`
- Deberías ver tu aplicación React

## 🔗 Conectar Frontend con Backend

Actualiza tu archivo de configuración del frontend para apuntar al backend:

```typescript
// src/services/trafficService.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

## 🐛 Troubleshooting

### El frontend muestra el backend
- ✅ Verifica que cada servicio usa el Dockerfile correcto
- ✅ En Railway Settings → Build, confirma el Dockerfile Path
- ✅ Redespliega el servicio frontend

### Error de CORS
- ✅ Verifica que Flask tenga CORS configurado para aceptar tu dominio frontend
- ✅ En `app.py`, actualiza CORS origins si es necesario

### Frontend no puede conectar al backend
- ✅ Verifica la variable `VITE_API_URL` en el servicio frontend
- ✅ Asegúrate de usar HTTPS (no HTTP) en producción

## 📝 Notas Importantes

1. **Dos Servicios = Dos URLs Diferentes**
   - Frontend: `https://tu-proyecto-frontend.railway.app`
   - Backend: `https://tu-proyecto-backend.railway.app`

2. **Variables de Entorno**
   - Deben configurarse en Railway Dashboard
   - Se inyectan en tiempo de construcción

3. **Costos**
   - Cada servicio consume recursos separados
   - Considera el plan de Railway según tu uso

---

✅ Con esta configuración, tendrás frontend y backend funcionando independientemente en Railway.
