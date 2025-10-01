# 🚀 Guía de Despliegue en Render

## ✅ Cambios Realizados

### 1. **Eliminación de Datos Mock/Simulados**
- ❌ Se eliminaron todos los fallbacks a datos simulados
- ✅ La aplicación ahora **solo consume datos reales** del backend Python
- ✅ Los timeouts se aumentaron de 10s a 30s para dar tiempo al backend
- ✅ Se agregaron reintentos automáticos (3 intentos) para peticiones fallidas

### 2. **Mejoras en el Servicio de Tráfico (`trafficService.ts`)**
- Timeouts aumentados a 30 segundos
- Reintentos automáticos con backoff exponencial
- Logs detallados en consola para debugging
- Eliminación completa de métodos mock

### 3. **Configuración de Render Actualizada (`render.yaml`)**
```yaml
Backend:
- Usa Gunicorn en lugar de `python app.py` (más estable)
- 2 workers para manejar múltiples peticiones
- Timeout de 120 segundos
- Health check en /health en lugar de /api/debug
```

### 4. **Backend Python Mejorado**
- CORS actualizado para aceptar todas las URLs necesarias
- Cache automático para cargas rápidas
- Logs mejorados para debugging

## 🔧 Pasos para Desplegar

### Opción A: Despliegue desde GitHub

1. **Hacer commit de los cambios:**
```bash
git add .
git commit -m "fix: Eliminar datos mock y configurar para producción real"
git push origin main
```

2. **En Render Dashboard:**
   - Ve a tu servicio backend: `atu-traffic-pulse-backend`
   - Click en "Manual Deploy" > "Deploy latest commit"
   - Espera a que termine (puede tomar 5-10 minutos en el primer deploy)
   
3. **Verificar el backend:**
   - Abre: https://atu-traffic-pulse-backend.onrender.com/health
   - Deberías ver: `{"status": "ok", "message": "Server is running"}`
   - Abre: https://atu-traffic-pulse-backend.onrender.com/api/debug
   - Deberías ver los datos de simulación actual

4. **Desplegar el frontend:**
   - Ve a tu servicio frontend: `atu-traffic-pulse-frontend`
   - Click en "Manual Deploy" > "Deploy latest commit"
   - Espera a que termine (2-3 minutos)

### Opción B: Crear Nuevo Servicio en Render

1. **Backend:**
```
- Type: Web Service
- Repository: RafaelCly/atu-traffic-pulse
- Branch: main
- Runtime: Python 3.11
- Build Command: pip install --upgrade pip && pip install -r requirements.txt
- Start Command: cd src/Mapas && gunicorn --bind 0.0.0.0:$PORT --workers 2 --timeout 120 --log-level info app:app
- Plan: Free
- Health Check Path: /health
```

2. **Frontend:**
```
- Type: Web Service  
- Repository: RafaelCly/atu-traffic-pulse
- Branch: main
- Runtime: Node 18
- Build Command: npm install && npm run build
- Start Command: npm run preview -- --host 0.0.0.0 --port $PORT
- Plan: Free
- Environment Variable: VITE_API_URL=https://atu-traffic-pulse-backend.onrender.com
- Health Check Path: /
```

## 🐛 Debugging en Render

### Ver Logs del Backend:
1. Ve a tu servicio backend en Render
2. Click en la pestaña "Logs"
3. Busca por:
   - ✅ "SERVIDOR LISTO" - Backend inicializado correctamente
   - ✅ "Datos de tráfico cargados" - Excel cargado
   - ❌ "ERROR CRÍTICO" - Problema de inicialización

### Ver Logs del Frontend:
1. Ve a tu servicio frontend en Render
2. Click en la pestaña "Logs"
3. Busca por errores de compilación o inicio

### Verificar en el Navegador:
1. Abre tu app: https://atu-traffic-pulse-frontend.onrender.com
2. Abre DevTools (F12)
3. Ve a la pestaña "Console"
4. Busca por:
   - 🔍 "Verificando estado del servidor backend..."
   - ✅ "Servidor backend: CONECTADO"
   - ❌ "Error al verificar servidor backend"

## ⚠️ Problemas Comunes

### 1. "Iniciando..." y nunca carga
**Causa:** El backend no está respondiendo o está dormido (Render Free Plan)

**Solución:**
```bash
# Despertar el backend manualmente
curl https://atu-traffic-pulse-backend.onrender.com/health

# Esperar 30-60 segundos y recargar el frontend
```

### 2. Errores CORS
**Causa:** El frontend no está en la lista de orígenes permitidos

**Solución:** Verificar que `app.py` tenga tu URL de frontend en CORS:
```python
"origins": [
    "https://atu-traffic-pulse-frontend.onrender.com",
    "http://localhost:5173",
    "http://localhost:8080",
    "http://localhost:4173"
]
```

### 3. "No se encontró data_transito.xlsx"
**Causa:** El archivo no se subió a GitHub

**Solución:**
```bash
# Verificar que el archivo está en el repo
git ls-files src/Mapas/data_transito.xlsx

# Si no está, agregarlo
git add src/Mapas/data_transito.xlsx -f
git commit -m "add: Excel con datos de tráfico"
git push
```

### 4. Backend tarda mucho en iniciar
**Causa:** Render Free Plan tiene cold starts (30-60 segundos)

**Solución:**
- Primera carga siempre será lenta
- El cache ayudará en siguientes cargas
- Considera upgrade a plan pagado si necesitas respuestas más rápidas

## 📊 Verificar que TODO Funciona

Checklist después del deploy:

- [ ] Backend health: https://atu-traffic-pulse-backend.onrender.com/health → `status: ok`
- [ ] Backend debug: https://atu-traffic-pulse-backend.onrender.com/api/debug → Datos de simulación
- [ ] Backend KPIs: https://atu-traffic-pulse-backend.onrender.com/api/kpis → Porcentajes y conteos
- [ ] Frontend carga: https://atu-traffic-pulse-frontend.onrender.com → Muestra dashboard
- [ ] Datos en Dashboard: KPIs muestran valores reales (no 0)
- [ ] Intervalo actual: Muestra hora real del Excel
- [ ] Mapa: Carga el mapa interactivo de Python
- [ ] Gráficos: Muestran datos de UCP por intervalo

## 🎯 Diferencias Local vs Producción

### Local (http://localhost:5173):
- Backend: http://localhost:5000
- Conexión instantánea
- Sin cold starts

### Producción (Render):
- Backend: https://atu-traffic-pulse-backend.onrender.com
- Frontend: https://atu-traffic-pulse-frontend.onrender.com
- Primera carga: 30-60 segundos (cold start)
- Cargas siguientes: 2-5 segundos
- Backend duerme después de 15 minutos de inactividad

## 💡 Tips

1. **Mantener el backend despierto:** Usa un servicio como UptimeRobot para hacer ping cada 14 minutos
2. **Logs detallados:** Revisa la consola del navegador para ver qué está pasando
3. **Paciencia:** Render Free Plan es lento en el primer arranque
4. **Cache:** Una vez que cargue la primera vez, las siguientes serán más rápidas

## 📞 Soporte

Si sigues teniendo problemas:
1. Revisa los logs en Render
2. Revisa la consola del navegador (F12)
3. Verifica que ambos servicios estén "Running" en Render
4. Intenta hacer deploy manual de nuevo
