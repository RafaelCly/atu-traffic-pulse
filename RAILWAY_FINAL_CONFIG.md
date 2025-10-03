# ✅ CONFIGURACIÓN FINAL - Railway

## 🎯 LO QUE DEBES HACER EN RAILWAY

### Para el servicio "positive-recreation" (Frontend):

#### 1. Settings → General
```
Config File Path: railway.frontend.toml
```

#### 2. Settings → Builder
```
Dejar como está (Nixpacks)
```

#### 3. Watch Paths
```
Dockerfile.frontend
railway.frontend.toml
nixpacks.frontend.toml
```

#### 4. Variables (Pestaña "Variables")
```bash
VITE_API_URL=https://atu-traffic-pulse-production.up.railway.app
PORT=80
NODE_ENV=production
```

#### 5. Networking
- Habilita "Generate Domain"

---

### Para el servicio "atu-traffic-pulse" (Backend):

#### 1. Settings → General
```
Config File Path: railway.backend.toml
```

#### 2. Settings → Builder
```
Dejar como está (Nixpacks)
```

#### 3. Watch Paths
```
Dockerfile.backend
railway.backend.toml
nixpacks.backend.toml
src/Mapas/**
```

#### 4. Variables (Pestaña "Variables")
```bash
FLASK_APP=src/Mapas/app.py
FLASK_ENV=production
PORT=5000
PYTHONUNBUFFERED=1
```

#### 5. Networking
- Habilita "Generate Domain"

---

## 📝 RESUMEN

**Archivos creados:**
- ✅ `railway.frontend.toml` ← Config para Frontend
- ✅ `railway.backend.toml` ← Config para Backend
- ✅ `nixpacks.frontend.toml` ← Backup config Frontend
- ✅ `nixpacks.backend.toml` ← Backup config Backend

**En Railway debes configurar:**
1. **Config File Path** en Settings → General
2. **Watch Paths** para que detecte cambios
3. **Variables de entorno** en la pestaña Variables
4. **Generate Domain** en Networking

---

## 🚀 PRÓXIMO PASO

1. Commitea los cambios:
```bash
git add .
git commit -m "Add Railway configuration files"
git push
```

2. En Railway:
   - **Frontend:** Settings → General → Config File Path: `railway.frontend.toml`
   - **Backend:** Settings → General → Config File Path: `railway.backend.toml`
   
3. Haz clic en "Deploy" (botón morado)

¡Listo! 🎉
