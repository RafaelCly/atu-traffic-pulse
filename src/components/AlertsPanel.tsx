import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Car, Construction, Clock, Eye, X, Lightbulb, TrendingUp, Timer, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  type: "traffic_light" | "congestion_critical" | "travel_time_exceeded" | "incident";
  priority: "high" | "medium" | "low";
  title: string;
  location: string;
  time: string;
  description: string;
  status: "active" | "resolved";
  value?: string; // Para mostrar valores específicos como porcentajes o tiempos
  incidentType?: string; // Para especificar el tipo de incidente
}

const AlertsPanel = () => {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: "1",
      type: "traffic_light",
      priority: "high",
      title: "Semáforo en Rojo Permanente",
      location: "Av. Javier Prado - Cruce San Luis",
      time: "14:32",
      description: "Se mantiene en rojo por 2 intervalos consecutivos",
      status: "active",
      value: "2 intervalos"
    },
    {
      id: "2",
      type: "congestion_critical",
      priority: "high",
      title: "Congestión Crítica Detectada",
      location: "Centro Histórico - Jr. de la Unión",
      time: "14:15",
      description: "Nivel de congestión ha superado el límite establecido",
      status: "active",
      value: "92%"
    },
    {
      id: "3",
      type: "travel_time_exceeded",
      priority: "medium",
      title: "Tiempo de Viaje Excedido",
      location: "Miraflores - Av. Larco (Tramo 3)",
      time: "13:45",
      description: "Tiempo promedio por tramo superado significativamente",
      status: "active",
      value: "+15 min"
    },
    {
      id: "4",
      type: "incident",
      priority: "high",
      title: "Accidente de Tránsito",
      location: "Av. Arequipa - Altura del Óvalo",
      time: "13:30",
      description: "Colisión múltiple reportada por sistema automático",
      status: "active",
      incidentType: "Colisión múltiple"
    }
  ]);

  // Simulate new alerts
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.85) { // 15% chance every 10 seconds
        const alertTypes = ["traffic_light", "congestion_critical", "travel_time_exceeded", "incident"] as const;
        const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        
        const alertTemplates = {
          traffic_light: {
            title: "Falla en Semáforo",
            description: "Semáforo permanece en rojo por intervalos prolongados",
            value: "3 intervalos"
          },
          congestion_critical: {
            title: "Congestión Crítica",
            description: "Nivel de congestión supera el 90%",
            value: `${90 + Math.floor(Math.random() * 10)}%`
          },
          travel_time_exceeded: {
            title: "Tiempo de Viaje Excedido",
            description: "Tiempo promedio por tramo superado",
            value: `+${5 + Math.floor(Math.random() * 20)} min`
          },
          incident: {
            title: "Incidente Reportado",
            description: "Incidente detectado automáticamente",
            incidentType: ["Accidente", "Vehículo averiado", "Obra no programada", "Manifestación"][Math.floor(Math.random() * 4)]
          }
        };
        
        const template = alertTemplates[alertType];
        const newAlert: Alert = {
          id: Date.now().toString(),
          type: alertType,
          priority: ["high", "medium", "low"][Math.floor(Math.random() * 3)] as Alert["priority"],
          title: template.title,
          location: "Zona Automatizada",
          time: new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }),
          description: template.description,
          status: "active",
          ...('value' in template ? { value: template.value } : {}),
          ...('incidentType' in template ? { incidentType: template.incidentType } : {})
        };
        
        setAlerts(prev => [newAlert, ...prev.slice(0, 4)]); // Keep only 5 alerts
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "traffic_light":
        return Lightbulb;
      case "congestion_critical":
        return TrendingUp;
      case "travel_time_exceeded":
        return Timer;
      case "incident":
        return AlertTriangle;
      default:
        return AlertTriangle;
    }
  };

  const getPriorityColor = (priority: Alert["priority"]) => {
    switch (priority) {
      case "high":
        return "border-l-destructive bg-destructive/5";
      case "medium":
        return "border-l-warning bg-warning/5";
      case "low":
        return "border-l-primary bg-primary/5";
      default:
        return "border-l-muted";
    }
  };

  const getPriorityBadge = (priority: Alert["priority"]) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "outline";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto px-6 pb-6">
      {alerts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No hay alertas activas</p>
        </div>
      ) : (
        alerts.map((alert) => {
          const Icon = getAlertIcon(alert.type);
          return (
            <div
              key={alert.id}
              className={cn(
                "border-l-4 rounded-r-lg p-4 space-y-2 transition-all duration-200 hover:shadow-md",
                getPriorityColor(alert.priority)
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <h4 className="font-medium text-sm">{alert.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getPriorityBadge(alert.priority)} className="text-xs">
                    {alert.priority === "high" ? "Alta" : alert.priority === "medium" ? "Media" : "Baja"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleResolveAlert(alert.id)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {alert.time} - {alert.location}
                </p>
                <p className="text-xs text-foreground">{alert.description}</p>
                
                {/* Mostrar valor específico o tipo de incidente */}
                {alert.value && (
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/20">
                      {alert.type === "congestion_critical" ? "Nivel: " : 
                       alert.type === "travel_time_exceeded" ? "Exceso: " :
                       alert.type === "traffic_light" ? "Duración: " : "Valor: "}
                      {alert.value}
                    </Badge>
                  </div>
                )}
                
                {alert.incidentType && (
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/20">
                      Tipo: {alert.incidentType}
                    </Badge>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  <Eye className="h-3 w-3 mr-1" />
                  Ver
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={() => handleResolveAlert(alert.id)}
                >
                  Resolver
                </Button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default AlertsPanel;