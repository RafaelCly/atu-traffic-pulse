import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Camera, AlertTriangle, Navigation } from "lucide-react";

const TrafficMap = () => {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [mapData, setMapData] = useState({
    zones: [
      { id: "zona-1", name: "Centro Histórico", congestion: 85, incidents: 2, cameras: 12, x: 25, y: 30 },
      { id: "zona-2", name: "Miraflores", congestion: 65, incidents: 1, cameras: 8, x: 45, y: 60 },
      { id: "zona-3", name: "San Isidro", congestion: 45, incidents: 0, cameras: 10, x: 35, y: 50 },
      { id: "zona-4", name: "Av. Javier Prado", congestion: 92, incidents: 3, cameras: 15, x: 60, y: 25 },
      { id: "zona-5", name: "Callao", congestion: 30, incidents: 0, cameras: 6, x: 15, y: 40 },
      { id: "zona-6", name: "La Molina", congestion: 55, incidents: 1, cameras: 9, x: 75, y: 70 },
    ]
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMapData(prev => ({
        ...prev,
        zones: prev.zones.map(zone => ({
          ...zone,
          congestion: Math.max(20, Math.min(100, zone.congestion + (Math.random() - 0.5) * 10))
        }))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getCongestionColor = (level: number) => {
    if (level >= 80) return "bg-destructive";
    if (level >= 60) return "bg-warning";
    if (level >= 40) return "bg-yellow-500";
    return "bg-success";
  };

  const getCongestionLabel = (level: number) => {
    if (level >= 80) return "Crítico";
    if (level >= 60) return "Alto";
    if (level >= 40) return "Moderado";
    return "Fluido";
  };

  return (
    <div className="h-full w-full bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden rounded-lg">
      {/* Map Background - Simulated city layout */}
      <div className="absolute inset-0 p-8">
        {/* Streets/Roads - Simplified grid */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Horizontal streets */}
          <line x1="0" y1="20" x2="100" y2="20" stroke="#cbd5e1" strokeWidth="0.5" />
          <line x1="0" y1="40" x2="100" y2="40" stroke="#cbd5e1" strokeWidth="0.5" />
          <line x1="0" y1="60" x2="100" y2="60" stroke="#cbd5e1" strokeWidth="0.5" />
          <line x1="0" y1="80" x2="100" y2="80" stroke="#cbd5e1" strokeWidth="0.5" />
          
          {/* Vertical streets */}
          <line x1="20" y1="0" x2="20" y2="100" stroke="#cbd5e1" strokeWidth="0.5" />
          <line x1="40" y1="0" x2="40" y2="100" stroke="#cbd5e1" strokeWidth="0.5" />
          <line x1="60" y1="0" x2="60" y2="100" stroke="#cbd5e1" strokeWidth="0.5" />
          <line x1="80" y1="0" x2="80" y2="100" stroke="#cbd5e1" strokeWidth="0.5" />
          
          {/* Major highways */}
          <line x1="0" y1="25" x2="100" y2="25" stroke="#94a3b8" strokeWidth="1" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="#94a3b8" strokeWidth="1" />
        </svg>

        {/* Traffic Zones */}
        {mapData.zones.map((zone) => (
          <div
            key={zone.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-110"
            style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
            onClick={() => setSelectedZone(selectedZone === zone.id ? null : zone.id)}
          >
            {/* Zone indicator */}
            <div className={`w-6 h-6 rounded-full ${getCongestionColor(zone.congestion)} shadow-lg animate-pulse relative`}>
              {zone.incidents > 0 && (
                <AlertTriangle className="absolute -top-1 -right-1 h-3 w-3 text-destructive bg-background rounded-full p-0.5" />
              )}
            </div>

            {/* Zone label */}
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              <Badge variant="outline" className="text-xs bg-background/90 backdrop-blur-sm">
                {zone.name}
              </Badge>
            </div>

            {/* Zone details popup */}
            {selectedZone === zone.id && (
              <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-card border border-border rounded-lg shadow-xl p-4 min-w-[200px] z-10">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  {zone.name}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Congestión:</span>
                    <Badge variant="outline" className={getCongestionColor(zone.congestion).replace('bg-', 'text-')}>
                      {Math.round(zone.congestion)}% - {getCongestionLabel(zone.congestion)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Incidentes:</span>
                    <span className="font-medium">{zone.incidents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cámaras:</span>
                    <span className="font-medium flex items-center gap-1">
                      <Camera className="h-3 w-3" />
                      {zone.cameras}
                    </span>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="w-full mt-3">
                  <Navigation className="h-3 w-3 mr-1" />
                  Ver Detalles
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 space-y-2">
        <h5 className="font-semibold text-sm mb-2">Nivel de Congestión</h5>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success"></div>
            <span>Fluido (0-39%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Moderado (40-59%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning"></div>
            <span>Alto (60-79%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive"></div>
            <span>Crítico (80-100%)</span>
          </div>
        </div>
      </div>

      {/* Real-time indicator */}
      <div className="absolute top-4 right-4">
        <Badge variant="outline" className="bg-card/90 backdrop-blur-sm border-success">
          <div className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse" />
          Tiempo Real
        </Badge>
      </div>
    </div>
  );
};

export default TrafficMap;