import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink, AlertTriangle } from "lucide-react";

// Detectar si estamos en producción o desarrollo
const isProd = import.meta.env.PROD;
const PYTHON_MAP_BASE_URL = isProd 
  ? 'https://atu-traffic-pulse-backend.onrender.com'
  : 'http://localhost:5000';

const TrafficMap = () => {
  const [mapStatus, setMapStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Verificar si el servidor Python está corriendo
  useEffect(() => {
    const checkMapServer = async () => {
      try {
        const response = await fetch(`${PYTHON_MAP_BASE_URL}/api/debug`);
        if (response.ok) {
          setMapStatus('ready');
        } else {
          setMapStatus('error');
        }
      } catch (error) {
        console.error('Servidor de mapa no disponible:', error);
        setMapStatus('error');
      }
    };

    checkMapServer();
    
    // Verificar cada 30 segundos
    const interval = setInterval(checkMapServer, 30000);
    return () => clearInterval(interval);
  }, []);

  // Actualizar timestamp cada 10 segundos Y recargar el iframe
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      
      // Recargar el iframe para obtener los nuevos colores del mapa
      const iframe = document.getElementById('python-map') as HTMLIFrameElement;
      if (iframe && mapStatus === 'ready') {
        console.log('🔄 Recargando mapa para actualizar colores...');
        // Usar timestamp en la URL para forzar recarga sin caché
        const timestamp = new Date().getTime();
        iframe.src = `${PYTHON_MAP_BASE_URL}?_t=${timestamp}`;
      }
    }, 10000); // Cada 10 segundos, igual que el backend
    
    return () => clearInterval(interval);
  }, [mapStatus]); // Dependencia de mapStatus para asegurar que el iframe esté listo

  const handleRefresh = () => {
    setLastUpdate(new Date());
    // Recargar el iframe con timestamp para evitar caché
    const iframe = document.getElementById('python-map') as HTMLIFrameElement;
    if (iframe) {
      console.log('🔄 Recarga manual del mapa...');
      const timestamp = new Date().getTime();
      iframe.src = `${PYTHON_MAP_BASE_URL}?_t=${timestamp}`;
    }
  };

  const openMapInNewTab = () => {
    window.open(PYTHON_MAP_BASE_URL, '_blank');
  };

  if (mapStatus === 'error') {
    return (
      <div className="h-full w-full bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden rounded-lg flex items-center justify-center p-4">
        <div className="text-center p-4 sm:p-8 max-w-md">
          <AlertTriangle className="h-12 w-12 sm:h-16 sm:w-16 text-warning mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
            Mapa de Tráfico No Disponible
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
            El servidor del mapa Python no está ejecutándose.
          </p>
          <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
            <p>Para iniciar el mapa:</p>
            <code className="block bg-muted p-2 rounded text-[10px] sm:text-xs overflow-x-auto">
              cd src/Mapas && python app.py
            </code>
          </div>
          <Button 
            onClick={() => setMapStatus('loading')} 
            className="mt-3 sm:mt-4 text-sm"
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (mapStatus === 'loading') {
    return (
      <div className="h-full w-full bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden rounded-lg flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto mb-3 sm:mb-4"></div>
          <p className="text-sm sm:text-base text-muted-foreground">Cargando mapa de tráfico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative overflow-hidden rounded-lg">
      {/* Controles del mapa */}
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 flex flex-col sm:flex-row gap-1 sm:gap-2">
        <Badge variant="outline" className="bg-card/90 backdrop-blur-sm border-success text-xs sm:text-sm">
          <div className="w-2 h-2 bg-success rounded-full mr-1 sm:mr-2 animate-pulse" />
          <span className="hidden sm:inline">Tiempo Real</span>
          <span className="sm:hidden">Real</span>
        </Badge>
        <Button
          size="sm"
          variant="outline"
          onClick={handleRefresh}
          className="bg-card/90 backdrop-blur-sm h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
        >
          <RefreshCw className="h-3 w-3 sm:mr-1" />
          <span className="hidden sm:inline">Actualizar</span>
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={openMapInNewTab}
          className="bg-card/90 backdrop-blur-sm h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
        >
          <ExternalLink className="h-3 w-3 sm:mr-1" />
          <span className="hidden sm:inline">Abrir</span>
        </Button>
      </div>

      {/* Información de última actualización */}
      <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 z-10">
        <Badge variant="outline" className="bg-card/90 backdrop-blur-sm text-[10px] sm:text-xs">
          <span className="hidden sm:inline">Última actualización: </span>
          {lastUpdate.toLocaleTimeString()}
        </Badge>
      </div>

      {/* Iframe del mapa Python */}
      <iframe
        id="python-map"
        src={PYTHON_MAP_BASE_URL}
        className="w-full h-full border-0"
        title="Mapa de Tráfico en Tiempo Real"
        loading="lazy"
        style={{
          filter: 'none'
        }}
      />
      
      {/* Estilos para ocultar elementos del intervalo en el mapa */}
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Ocultar panel de intervalo de tiempo en el iframe */
          .status-panel {
            display: none !important;
          }
          
          /* Ocultar elementos que contengan información de tiempo/intervalo */
          [class*="status"] {
            display: none !important;
          }
          
          [id*="interval"] {
            display: none !important;
          }
          
          [id*="simulation"] {
            display: none !important;
          }
          
          /* Específicamente para el iframe del mapa */
          #python-map .status-panel {
            display: none !important;
          }
        `
      }} />
    </div>
  );
};

export default TrafficMap;