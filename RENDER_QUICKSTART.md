# 🚀 Guía Rápida de Despliegue en Render

## ✅ Checklist Pre-Despliegue

Antes de empezar, asegúrate de tener:
- [ ] Cuenta en GitHub
- [ ] Repositorio creado en GitHub
- [ ] Código local funcionando correctamente
- [ ] Cuenta en Render.com (gratis)

---

## 📝 PASO 1: Subir tu Código a GitHub

### 1.1 Inicializar Git (si no lo has hecho)
```bash
git init
git add .
git commit -m "Initial commit - ATU Traffic Pulse"
```

### 1.2 Crear Repositorio en GitHub
1. Ve a https://github.com/new
2. Nombre: `atu-traffic-pulse`
3. Descripción: `Sistema de Monitoreo de Tráfico Urbano`
4. Click en "Create repository"

### 1.3 Conectar y Subir
```bash
git remote add origin https://github.com/TU-USUARIO/atu-traffic-pulse.git
git branch -M main
git push -u origin main
```

---

## 🎯 PASO 2: Desplegar Frontend en Render

### 2.1 Crear Cuenta en Render
1. Ve a https://render.com
2. Click en "Get Started for Free"
3. Regístrate con GitHub (recomendado)

### 2.2 Crear Web Service para Frontend
1. Desde el Dashboard de Render, click en **"New +"**
2. Selecciona **"Web Service"**
3. Conecta tu repositorio de GitHub
4. Busca y selecciona `atu-traffic-pulse`

### 2.3 Configurar el Frontend
Ingresa los siguientes datos:

| Campo | Valor |
|-------|-------|
| **Name** | `atu-traffic-pulse-frontend` |
| **Region** | Oregon (US West) o el más cercano |
| **Branch** | `main` |
| **Root Directory** | (dejar vacío) |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run preview -- --host 0.0.0.0 --port $PORT` |
| **Plan** | `Free` |

### 2.4 Variables de Entorno (Environment Variables)
Click en "Advanced" y añade:

```
NODE_VERSION = 18.18.0
NODE_ENV = production
```

### 2.5 Deploy
1. Click en **"Create Web Service"**
2. Espera 3-5 minutos mientras se despliega
3. Verás una URL como: `https://atu-traffic-pulse-frontend.onrender.com`

⚠️ **IMPORTANTE**: Guarda esta URL, la necesitarás después.

---

## 🐍 PASO 3: Desplegar Backend (Python) en Render

### 3.1 Crear Web Service para Backend
1. Desde el Dashboard de Render, click en **"New +"**
2. Selecciona **"Web Service"**
3. Selecciona el mismo repositorio `atu-traffic-pulse`

### 3.2 Configurar el Backend
Ingresa los siguientes datos:

| Campo | Valor |
|-------|-------|
| **Name** | `atu-traffic-pulse-backend` |
| **Region** | Oregon (US West) o el mismo que el frontend |
| **Branch** | `main` |
| **Root Directory** | (dejar vacío) |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `python src/Mapas/app.py` |
| **Plan** | `Free` |

### 3.3 Variables de Entorno
Click en "Advanced" y añade:

```
PYTHON_VERSION = 3.11.0
PORT = 5000
FLASK_ENV = production
```

### 3.4 Deploy
1. Click en **"Create Web Service"**
2. Espera 3-5 minutos mientras se despliega
3. Verás una URL como: `https://atu-traffic-pulse-backend.onrender.com`

⚠️ **IMPORTANTE**: Guarda esta URL del backend.

---

## 🔗 PASO 4: Conectar Frontend con Backend

### 4.1 Actualizar trafficService.ts
Abre el archivo `src/services/trafficService.ts` y reemplaza:

**ANTES:**
```typescript
const API_BASE_URL = 'http://localhost:5000';
```

**DESPUÉS:**
```typescript
const API_BASE_URL = 'https://atu-traffic-pulse-backend.onrender.com';
```

### 4.2 Actualizar TrafficMap.tsx
Abre el archivo `src/components/TrafficMap.tsx` y busca todas las instancias de:

**ANTES:**
```typescript
'http://localhost:5000'
```

**DESPUÉS:**
```typescript
'https://atu-traffic-pulse-backend.onrender.com'
```

Hay 3 lugares donde aparece:
1. En `checkMapServer` (línea ~20)
2. En `openMapInNewTab` (línea ~35)
3. En el `iframe src` (línea ~98)

### 4.3 Commit y Push
```bash
git add .
git commit -m "Actualizar URLs para producción en Render"
git push origin main
```

### 4.4 Esperar Redespliegue Automático
Render detectará los cambios y redespleará el frontend automáticamente (2-3 minutos).

---

## ✅ PASO 5: Verificar que Todo Funciona

### 5.1 Probar el Backend
1. Abre en tu navegador: `https://atu-traffic-pulse-backend.onrender.com/api/debug`
2. Deberías ver un JSON con información del sistema

### 5.2 Probar el Frontend
1. Abre en tu navegador: `https://atu-traffic-pulse-frontend.onrender.com`
2. Deberías ver la pantalla de login
3. Ingresa cualquier email y contraseña
4. Verifica que el dashboard cargue correctamente

### 5.3 Verificar Conexión
1. En el dashboard, revisa que aparezca "Sistema Activo" o "Excel Conectado"
2. Navega a la pestaña "Mapa"
3. Navega a la pestaña "Alertas"
4. Verifica que los KPIs se actualicen

---

## 🎉 ¡LISTO!

Tu aplicación está desplegada en:
- **Frontend**: https://atu-traffic-pulse-frontend.onrender.com
- **Backend**: https://atu-traffic-pulse-backend.onrender.com

---

## 🔧 Troubleshooting

### ❌ Error: "Build failed"
**Solución**: Revisa los logs en Render y verifica que:
- `package.json` tenga todas las dependencias
- `requirements.txt` exista en la raíz
- Los comandos de build estén correctos

### ❌ Error: "Application failed to respond"
**Solución**: 
- Verifica que el comando de start esté correcto
- Revisa los logs para ver errores específicos
- Asegúrate de que el puerto esté configurado como `$PORT`

### ❌ Error: CORS
**Solución**: El backend debe tener CORS habilitado. Verifica que `src/Mapas/app.py` tenga:
```python
from flask_cors import CORS
CORS(app)
```

### ⏰ La app tarda en cargar
**Solución**: Los servicios gratuitos de Render se "duermen" después de 15 minutos de inactividad. El primer acceso puede tardar 30-60 segundos. Esto es normal.

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en el Dashboard de Render
2. Verifica que todos los archivos estén en GitHub
3. Compara tu configuración con esta guía
4. Busca el error específico en Google

---

## 🚀 Próximos Pasos

- [ ] Configurar dominio personalizado (opcional)
- [ ] Activar HTTPS (automático en Render)
- [ ] Configurar variables de entorno adicionales
- [ ] Monitorear uso y rendimiento
- [ ] Considerar upgrade a plan pagado para servicios siempre activos

---

**¡Felicidades!** 🎊 Has desplegado exitosamente tu aplicación en Render.
