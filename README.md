# 🚦 ATU Traffic Pulse - Sistema de Monitoreo de Tráfico

Sistema inteligente de monitoreo y análisis de tráfico urbano para la Autoridad de Transporte Urbano (ATU).

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python)

## 📋 Características

- ✅ **Dashboard en Tiempo Real** - Monitoreo continuo del tráfico urbano
- 📊 **Análisis de KPIs** - Ocupación UCP, congestión, tiempos de viaje
- 🗺️ **Mapas Interactivos** - Visualización de segmentos viales con Folium
- 📈 **Gráficos Dinámicos** - Análisis de tráfico por intervalos
- 🚨 **Sistema de Alertas** - Notificaciones de incidentes y congestión
- 📱 **Diseño Responsive** - Optimizado para móviles, tablets y desktops
- 🔄 **Actualización Automática** - Sincronización cada 10 segundos

## 🛠️ Tecnologías

### Frontend
- **React 18.3** + **TypeScript 5.8**
- **Vite** - Build tool ultrarrápido
- **Tailwind CSS** - Estilos utilitarios
- **shadcn/ui** - Componentes UI
- **React Router** - Navegación
- **Recharts** - Gráficos
- **TanStack Query** - Gestión de estado

### Backend
- **Python 3.11** + **Flask 3.0**
- **Pandas** - Análisis de datos
- **Folium** - Mapas interactivos
- **OpenPyXL** - Lectura de Excel

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ ([Descargar](https://nodejs.org/))
- Python 3.11+ ([Descargar](https://www.python.org/))
- npm o yarn

### Instalación Local

1. **Clonar el repositorio**
```bash
git clone https://github.com/RafaelCly/atu-traffic-pulse.git
cd atu-traffic-pulse
```

2. **Instalar dependencias del Frontend**
```bash
npm install
```

3. **Instalar dependencias del Backend**
```bash
pip install -r requirements.txt
```

4. **Iniciar el servidor de desarrollo**

Terminal 1 (Frontend):
```bash
npm run dev
```

Terminal 2 (Backend):
```bash
cd src/Mapas
python app.py
```

5. **Abrir en el navegador**
```
http://localhost:8080
```

## 📦 Despliegue en Render

Para desplegar este proyecto en Render, sigue la guía completa en:

👉 **[DEPLOYMENT.md](./DEPLOYMENT.md)** 👈

### Resumen rápido:

1. **Push a GitHub**
```bash
git add .
git commit -m "Preparado para Render"
git push origin main
```

2. **Crear servicios en Render**
   - Frontend: Node.js Web Service
   - Backend: Python Web Service

3. **Configurar variables de entorno**
   - Ver detalles en `DEPLOYMENT.md`

4. **Deploy automático** ✨

URLs de ejemplo:
- Frontend: `https://atu-traffic-pulse-frontend.onrender.com`
- Backend: `https://atu-traffic-pulse-backend.onrender.com`

## 📁 Estructura del Proyecto

```
atu-traffic-pulse/
├── src/
│   ├── components/       # Componentes React
│   │   ├── ui/          # Componentes shadcn/ui
│   │   ├── AlertsPanel.tsx
│   │   ├── Dashboard.tsx
│   │   ├── KPICard.tsx
│   │   ├── MetricsChart.tsx
│   │   └── TrafficMap.tsx
│   ├── pages/           # Páginas de la aplicación
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   └── NotFound.tsx
│   ├── services/        # Servicios API
│   │   └── trafficService.ts
│   ├── Mapas/          # Backend Python
│   │   ├── app.py      # Servidor Flask
│   │   ├── templates/  # Templates HTML
│   │   └── cache/      # Cache de mapas
│   └── hooks/          # Custom React hooks
├── public/             # Archivos estáticos
├── DEPLOYMENT.md       # Guía de despliegue
├── requirements.txt    # Dependencias Python
├── package.json        # Dependencias Node.js
├── vite.config.ts      # Configuración Vite
└── tailwind.config.ts  # Configuración Tailwind
```

## 🎨 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo

# Producción
npm run build           # Build para producción
npm run preview         # Preview del build

# Python Backend
python src/Mapas/app.py # Inicia servidor Flask

# Linting
npm run lint            # Ejecuta ESLint
```

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env.production` basado en `.env.example`:

```env
VITE_API_URL=https://tu-backend.onrender.com
```

### Backend Flask

El backend se configura automáticamente para leer:
- `src/Mapas/data_transito.xlsx` - Datos de tráfico

## 📊 Características del Dashboard

### KPIs Principales
- **% Ocupación UCP** - Nivel de ocupación de unidades de coche patrón
- **% Congestión** - Porcentaje de congestión en la red vial
- **Tiempo Medio de Viaje** - Promedio de tiempos de viaje

### Vistas
- **Vista General** - Gráficos y métricas
- **Mapa** - Visualización geográfica del tráfico
- **Alertas** - Sistema de notificaciones

### Funcionalidades
- Actualización automática cada 10 segundos
- Filtros por intervalo y segmento
- Exportación de datos
- Modo responsive para móviles

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Autores

- **Rafael Cly** - *Desarrollo Inicial* - [RafaelCly](https://github.com/RafaelCly)

## 🙏 Agradecimientos

- Autoridad de Transporte Urbano (ATU)
- shadcn/ui por los componentes
- Vercel por Vite y las herramientas de desarrollo

---

**Project URL**: https://lovable.dev/projects/5bc615b7-b414-401a-9a8f-6183afebd3d6

Desarrollado con ❤️ para ATU

