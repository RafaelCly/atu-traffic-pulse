import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink, AlertTriangle } from "lucide-react";

const TrafficMap = () => {
  const [mapStatus, setMapStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Verificar si el servidor Python está corriendo
  useEffect(() => {
    const checkMapServer = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/debug');
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

  // Actualizar timestamp cada 10 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setLastUpdate(new Date());
    // Recargar el iframe
    const iframe = document.getElementById('python-map') as HTMLIFrameElement;
    if (iframe) {
      const currentSrc = iframe.src;
      iframe.src = '';
      setTimeout(() => {
        iframe.src = currentSrc;
      }, 100);
    }
  };

  const openMapInNewTab = () => {
    window.open('http://localhost:5000', '_blank');
  };

  if (mapStatus === 'error') {
    return (
      <div className="h-full w-full bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden rounded-lg flex items-center justify-center">
        <div className="text-center p-8">
          <AlertTriangle className="h-16 w-16 text-warning mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Mapa de Tráfico No Disponible
          </h3>
          <p className="text-muted-foreground mb-4">
            El servidor del mapa Python no está ejecutándose.
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Para iniciar el mapa:</p>
            <code className="block bg-muted p-2 rounded text-xs">
              cd src/Mapas && python app.py
            </code>
          </div>
          <Button 
            onClick={() => setMapStatus('loading')} 
            className="mt-4"
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
      <div className="h-full w-full bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando mapa de tráfico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative overflow-hidden rounded-lg">
      {/* Controles del mapa */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Badge variant="outline" className="bg-card/90 backdrop-blur-sm border-success">
          <div className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse" />
          Tiempo Real
        </Badge>
        <Button
          size="sm"
          variant="outline"
          onClick={handleRefresh}
          className="bg-card/90 backdrop-blur-sm"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Actualizar
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={openMapInNewTab}
          className="bg-card/90 backdrop-blur-sm"
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          Abrir
        </Button>
      </div>

      {/* Información de última actualización */}
      <div className="absolute bottom-4 left-4 z-10">
        <Badge variant="outline" className="bg-card/90 backdrop-blur-sm">
          Última actualización: {lastUpdate.toLocaleTimeString()}
        </Badge>
      </div>

      {/* Iframe del mapa Python */}
      <iframe
        id="python-map"
        src="http://localhost:5000"
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