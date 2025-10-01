# TheUNIAnalytics Traffic Pulse - Sistema Integrado

## 🚀 Configuración e Instalación

### Prerrequisitos Python (Mapa de Tráfico)
```bash
# Instalar dependencias Python
pip install flask pandas osmnx shapely
```

### Iniciando el Sistema Completo

#### 1. **Servidor de Mapa Python** (Terminal 1)
```bash
cd src/Mapas
python app.py
```
El servidor estará disponible en: `http://localhost:5000`

#### 2. **Aplicación React** (Terminal 2)
```bash
npm run dev
```
La aplicación estará disponible en: `http://localhost:5173`

## 📊 **Integración de Datos**

### **Datos en Tiempo Real**
- **Excel**: `src/Mapas/data_transito.xlsx` contiene datos de tráfico por hora
- **Python**: Procesa el Excel y calcula UCP en tiempo real
- **React**: Consume APIs Python para mostrar datos actualizados

### **KPIs Conectados**
1. **% Ocupación UCP**: Calculado desde datos reales de segmentos
2. **% Congestión**: Porcentaje de segmentos en estado crítico  
3. **Tiempo Medio de Viaje**: Calculado basado en nivel de congestión

### **APIs Disponibles**
- `GET /api/kpis` - KPIs principales
- `GET /api/traffic_data` - Datos de segmentos
- `GET /api/road_data` - Estado de calles para el mapa
- `GET /api/debug` - Información de depuración

## 🗃️ **Estructura de Datos Excel**

El archivo `data_transito.xlsx` debe contener:
- **HoraControl**: Hora del registro (06:00, 07:00, etc.)
- **NroPunto**: Punto de control (1-4)
- **Sentido**: Dirección del tráfico (1-4)
- **TipoVehiculo**: Tipo de vehículo
- **Cantidad**: Número de vehículos

## 🔄 **Flujo de Datos**

```
Excel Data → Python Processing → React Dashboard
     ↓              ↓                ↓
[data_transito.xlsx] → [Flask APIs] → [KPIs + Charts]
```

## 🎯 **Funcionalidades**

### **Dashboard React**
- **3 KPIs principales** con datos reales
- **Gráfica UCP por hora** (6:00-12:00) desde Python
- **Tabla filtrable** por hora y segmento
- **Mapa interactivo** integrado via iframe
- **Alertas en tiempo real**

### **Mapa Python**
- **Visualización en tiempo real** de segmentos de tráfico
- **Colores dinámicos** (verde/amarillo/rojo) según ocupación
- **Click en segmentos** para ver detalles
- **Simulación automática** cada 10 segundos

## 🛠️ **Modo Desarrollo**

### **Con Servidor Python Activo**
- KPIs actualizados cada 10 segundos
- Datos desde Excel procesados en tiempo real
- Mapa completamente funcional
- Indicador: "Sistema Activo" + "Excel Conectado"

### **Sin Servidor Python**
- Datos simulados/mock
- Funcionalidad limitada del mapa
- Indicador: "Modo Simulación"
- Mensaje de error en mapa con instrucciones

## 📈 **Monitoreo**

- **Status del servidor**: Verificación automática cada 30s
- **Actualización de datos**: Cada 10s para KPIs, 30s para gráficas
- **Logs**: Disponibles en consola Python y browser

## 🚨 **Solución de Problemas**

### **Mapa no carga**
1. Verificar que Python server esté corriendo en puerto 5000
2. Revisar firewall/permisos
3. Comprobar dependencias Python instaladas

### **Datos no actualizan**
1. Verificar formato del Excel
2. Comprobar logs del servidor Python
3. Verificar conectividad de red

### **Error de CORS**
Si hay problemas de CORS, agregar headers en Flask:
```python
from flask_cors import CORS
CORS(app)
```

## 🔧 **Personalización**

### **Modificar Segmentos**
Editar `KEY_INTERSECTIONS_IDA/VUELTA` en `app.py`

### **Cambiar Horarios**
Modificar rango en `trafficService.ts` y `MetricsChart.tsx`

### **Ajustar KPIs**
Personalizar cálculos en `trafficService.ts`