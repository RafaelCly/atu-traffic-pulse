# ATU Traffic Pulse - Deployment Guide

## 🚀 Desplegar en Render

Este proyecto está configurado para desplegarse fácilmente en Render con dos servicios:
- **Frontend**: React + Vite
- **Backend**: Python Flask (Sistema de mapas)

### Paso 1: Preparar el Repositorio

1. **Asegúrate de que todos los cambios estén en GitHub:**
   ```bash
   git add .
   git commit -m "Preparado para despliegue en Render"
   git push origin main
   ```

### Paso 2: Crear Cuenta en Render

1. Ve a [https://render.com](https://render.com)
2. Crea una cuenta o inicia sesión
3. Conecta tu cuenta de GitHub

### Paso 3: Desplegar el Frontend (React)

1. **Desde el Dashboard de Render:**
   - Click en "New +" → "Web Service"
   - Conecta tu repositorio de GitHub
   - Selecciona el repositorio `atu-traffic-pulse`

2. **Configuración del Frontend:**
   ```
   Name: atu-traffic-pulse-frontend
   Runtime: Node
   Branch: main
   Root Directory: (dejar vacío)
   Build Command: npm install && npm run build
   Start Command: npm run preview -- --host 0.0.0.0 --port $PORT
   Plan: Free
   ```

3. **Variables de Entorno (Environment Variables):**
   ```
   NODE_VERSION = 18.18.0
   NODE_ENV = production
   ```

4. Click en "Create Web Service"

### Paso 4: Desplegar el Backend (Python Flask)

1. **Desde el Dashboard de Render:**
   - Click en "New +" → "Web Service"
   - Selecciona el mismo repositorio

2. **Configuración del Backend:**
   ```
   Name: atu-traffic-pulse-backend
   Runtime: Python
   Branch: main
   Root Directory: (dejar vacío)
   Build Command: pip install -r requirements.txt
   Start Command: python src/Mapas/app.py
   Plan: Free
   ```

3. **Variables de Entorno:**
   ```
   PYTHON_VERSION = 3.11.0
   PORT = 5000
   ```

4. Click en "Create Web Service"

### Paso 5: Actualizar URLs del Backend en el Frontend

Una vez desplegado el backend, obtendrás una URL como:
```
https://atu-traffic-pulse-backend.onrender.com
```

1. **Actualiza el archivo `src/services/trafficService.ts`:**
   
   Reemplaza:
   ```typescript
   const API_BASE_URL = 'http://localhost:5000';
   ```
   
   Por:
   ```typescript
   const API_BASE_URL = 'https://atu-traffic-pulse-backend.onrender.com';
   ```

2. **Actualiza el archivo `src/components/TrafficMap.tsx`:**
   
   Reemplaza todas las instancias de:
   ```typescript
   'http://localhost:5000'
   ```
   
   Por:
   ```typescript
   'https://atu-traffic-pulse-backend.onrender.com'
   ```

3. **Commit y push los cambios:**
   ```bash
   git add .
   git commit -m "Actualizar URLs del backend para producción"
   git push origin main
   ```

   Render automáticamente detectará los cambios y redeslegará el frontend.

### Paso 6: Configurar CORS en el Backend (si es necesario)

Si el archivo `src/Mapas/app.py` no tiene CORS habilitado, asegúrate de que incluya:

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=['https://tu-frontend-url.onrender.com'])
```

### Paso 7: Verificar el Despliegue

1. **Frontend:** Accede a la URL proporcionada por Render
2. **Backend:** Verifica que `https://tu-backend-url.onrender.com/api/debug` responda correctamente

### 🎯 URLs Finales

Después del despliegue, tendrás:
- **Frontend:** `https://atu-traffic-pulse-frontend.onrender.com`
- **Backend:** `https://atu-traffic-pulse-backend.onrender.com`

### ⚠️ Importante: Planes Gratuitos de Render

- Los servicios gratuitos se "duermen" después de 15 minutos de inactividad
- El primer acceso después de dormir puede tardar 30-60 segundos
- Para servicios siempre activos, considera upgradar al plan pagado

### 🔧 Troubleshooting

**Problema: El frontend no se despliega**
- Verifica que `package.json` tenga el script `preview`
- Revisa los logs en el dashboard de Render

**Problema: El backend no inicia**
- Verifica que `requirements.txt` esté en la raíz del proyecto
- Asegúrate de que `src/Mapas/app.py` existe
- Revisa que Flask esté configurado para escuchar en `0.0.0.0`

**Problema: CORS errors**
- Añade la URL del frontend a la configuración de CORS en el backend

### 📝 Notas Adicionales

1. **Base de datos:** Si necesitas PostgreSQL, Render ofrece bases de datos gratuitas
2. **Variables de entorno:** Gestiónalas desde el dashboard de Render
3. **Custom Domain:** Puedes añadir un dominio personalizado en la configuración del servicio
4. **Auto-deploy:** Render redespliega automáticamente al hacer push a la rama configurada

### 🚀 Comandos Útiles

```bash
# Ver logs en tiempo real (desde el dashboard de Render)
# Click en "Logs" en tu servicio

# Forzar redespliegue
# Click en "Manual Deploy" → "Deploy latest commit"

# Revisar salud del servicio
# Click en "Health" en el menú del servicio
```

---

## 📦 Estructura de Archivos para Render

```
atu-traffic-pulse/
├── render.yaml          # Configuración de Render (Blueprint)
├── requirements.txt     # Dependencias Python
├── build.sh            # Script de build (opcional)
├── start.sh            # Script de inicio (opcional)
├── package.json        # Dependencias Node.js
├── vite.config.ts      # Configuración Vite
└── src/
    ├── Mapas/
    │   └── app.py      # Servidor Flask
    └── ...             # Resto del código
```

## ✅ Checklist Pre-Despliegue

- [ ] Código pusheado a GitHub
- [ ] `requirements.txt` creado
- [ ] Scripts `build.sh` y `start.sh` creados
- [ ] URLs actualizadas en el código
- [ ] Variables de entorno documentadas
- [ ] CORS configurado en el backend
- [ ] Cuenta de Render creada y conectada a GitHub

---

¡Listo para despegar! 🚀
