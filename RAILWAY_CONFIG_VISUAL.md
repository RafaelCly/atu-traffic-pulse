# 🎯 GUÍA VISUAL - Configurar Dockerfile en Railway

## 📍 UBICACIÓN EXACTA EN LA INTERFAZ

### Paso 1: Ir a Settings
```
Tu Servicio → Pestaña "Settings" (arriba)
```

### Paso 2: Buscar la sección "Build"
```
Settings
  ↓
Scroll hacia abajo
  ↓
Encontrarás la sección "Builder" (como en tu screenshot)
```

### Paso 3: Cambiar de Nixpacks a Dockerfile
```
Actualmente dice:
  Builder
    └─ Nixpacks  [Deprecated]  ← HAZ CLIC AQUÍ
       └─ Nix-based builder developed by Railway

Debe quedar:
  Builder
    └─ Dockerfile  ← SELECCIONA ESTA OPCIÓN
       └─ Build with a Dockerfile using BuildKit
```

### Paso 4: Configurar el Dockerfile Path
```
Una vez seleccionado "Dockerfile", aparecerá:

  Dockerfile
    └─ Dockerfile Path: [_____________]  ← ESCRIBE AQUÍ
```

---

## ⚙️ CONFIGURACIÓN PARA CADA SERVICIO

### 🎨 SERVICIO 1: Frontend (positive-recreation)

**En Railway Settings → Build:**

1. **Builder:** Haz clic y selecciona `Dockerfile`
2. **Dockerfile Path:** Escribe → `Dockerfile.frontend`

**Variables (Settings → Variables):**
```bash
VITE_API_URL=https://atu-traffic-pulse-production.up.railway.app
PORT=80
NODE_ENV=production
```

---

### 🔧 SERVICIO 2: Backend (atu-traffic-pulse)

**En Railway Settings → Build:**

1. **Builder:** Haz clic y selecciona `Dockerfile`
2. **Dockerfile Path:** Escribe → `Dockerfile.backend`

**Variables (Settings → Variables):**
```bash
FLASK_APP=src/Mapas/app.py
FLASK_ENV=production
PORT=5000
PYTHONUNBUFFERED=1
```

---

## 🖼️ CÓMO SE VE EN LA INTERFAZ

### ANTES (Nixpacks - Lo que tienes ahora):
```
┌──────────────────────────────────────┐
│ Builder                              │
├──────────────────────────────────────┤
│ ○ Nixpacks           [Deprecated]    │
│   Nix-based builder...               │
│                                      │
│ ○ Dockerfile                         │
│   Build with a Dockerfile...         │
└──────────────────────────────────────┘
```

### DESPUÉS (Dockerfile - Lo que necesitas):
```
┌──────────────────────────────────────┐
│ Builder                              │
├──────────────────────────────────────┤
│ ○ Nixpacks           [Deprecated]    │
│                                      │
│ ● Dockerfile         ✓               │
│   Build with a Dockerfile...         │
│                                      │
│   Dockerfile Path                    │
│   ┌────────────────────────────────┐ │
│   │ Dockerfile.frontend            │ │
│   └────────────────────────────────┘ │
└──────────────────────────────────────┘
```

---

## 📋 CHECKLIST COMPLETO

### ✅ Para el Frontend (positive-recreation):

- [ ] 1. Ve a Settings
- [ ] 2. En "Builder", selecciona "Dockerfile"
- [ ] 3. En "Dockerfile Path", escribe: `Dockerfile.frontend`
- [ ] 4. Ve a "Variables" y agrega:
  - [ ] `VITE_API_URL` = URL del backend
  - [ ] `PORT` = `80`
  - [ ] `NODE_ENV` = `production`
- [ ] 5. Ve a "Networking" → "Generate Domain"
- [ ] 6. Haz clic en "Deploy" (botón morado arriba)

### ✅ Para el Backend (atu-traffic-pulse):

- [ ] 1. Ve a Settings
- [ ] 2. En "Builder", selecciona "Dockerfile"
- [ ] 3. En "Dockerfile Path", escribe: `Dockerfile.backend`
- [ ] 4. Ve a "Variables" y agrega:
  - [ ] `FLASK_APP` = `src/Mapas/app.py`
  - [ ] `FLASK_ENV` = `production`
  - [ ] `PORT` = `5000`
- [ ] 5. Ve a "Networking" → "Generate Domain"
- [ ] 6. Haz clic en "Deploy" (botón morado arriba)

---

## 🔍 DÓNDE ESTÁ CADA OPCIÓN

```
Railway Dashboard
│
├─ Tu Servicio (positive-recreation)
│  │
│  ├─ [Deployments] ← Ver logs y estado
│  │
│  ├─ [Variables] ← Agregar VITE_API_URL, PORT, etc.
│  │
│  ├─ [Metrics] ← Ver uso de recursos
│  │
│  └─ [Settings] ← CONFIGURAR AQUÍ
│     │
│     ├─ Source ← Repo de GitHub conectado
│     │
│     ├─ Build ← ⭐ AQUÍ CAMBIAS A DOCKERFILE ⭐
│     │  └─ Builder
│     │     ├─ [ ] Nixpacks
│     │     └─ [✓] Dockerfile
│     │        └─ Dockerfile Path: Dockerfile.frontend
│     │
│     ├─ Deploy ← Start Command, etc.
│     │
│     ├─ Networking ← ⭐ GENERAR DOMAIN AQUÍ ⭐
│     │  └─ [+ Generate Domain]
│     │
│     └─ Danger ← Eliminar servicio
```

---

## 🚨 ERRORES COMUNES

### ❌ Error: "No such file or directory: Dockerfile"
**Causa:** Railway busca en la raíz del proyecto
**Solución:** Asegúrate de escribir exactamente `Dockerfile.frontend` (con el punto)

### ❌ Error: "Builder not found"
**Causa:** No guardaste los cambios
**Solución:** Después de cambiar el Builder, espera unos segundos y verifica que se guardó

### ❌ Error: "Build failed"
**Causa:** Dockerfile incorrecto o variables faltantes
**Solución:** Ve a Deployments → Logs para ver el error específico

---

## 💡 TIPS

1. **Guarda siempre después de cambiar** → Railway auto-guarda, pero verifica
2. **No uses "Metal Build Environment"** → Déjalo desactivado por ahora
3. **Genera el Domain DESPUÉS de configurar el Builder** → Evita errores
4. **Verifica los logs** → Deployments → Click en el deployment → View Logs

---

## 🎯 RESULTADO FINAL

Una vez configurado correctamente, deberías ver:

**En Settings → Build:**
```
Builder: Dockerfile ✓
Dockerfile Path: Dockerfile.frontend
```

**En Deployments:**
```
✓ Building...
✓ Deploying...
✓ Ready (con URL clickeable)
```

**En Networking:**
```
Public Networking
  └─ positive-recreation.up.railway.app ← Tu URL
```

---

¡Eso es todo! 🚀
