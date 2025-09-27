import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Car, Construction, Clock, Eye, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  type: "incident" | "congestion" | "maintenance";
  priority: "high" | "medium" | "low";
  title: string;
  location: string;
  time: string;
  description: string;
  status: "active" | "resolved";
}

const AlertsPanel = () => {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: "1",
      type: "incident",
      priority: "high",
      title: "Accidente de Tránsito",
      location: "Av. Javier Prado - Altura del Óvalo",
      time: "14:32",
      description: "Colisión múltiple, 2 carriles bloqueados",
      status: "active"
    },
    {
      id: "2",
      type: "congestion",
      priority: "medium",
      title: "Congestión Severa",
      location: "Centro Histórico - Jr. de la Unión",
      time: "14:15",
      description: "Flujo vehicular reducido al 30%",
      status: "active"
    },
    {
      id: "3",
      type: "maintenance",
      priority: "low",
      title: "Mantenimiento Programado",
      location: "Miraflores - Av. Larco",
      time: "13:45",
      description: "Reparación semafórica en progreso",
      status: "active"
    }
  ]);

  // Simulate new alerts
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.85) { // 15% chance every 10 seconds
        const newAlert: Alert = {
          id: Date.now().toString(),
          type: ["incident", "congestion", "maintenance"][Math.floor(Math.random() * 3)] as Alert["type"],
          priority: ["high", "medium", "low"][Math.floor(Math.random() * 3)] as Alert["priority"],
          title: "Nueva Incidencia Detectada",
          location: "Zona Automatizada",
          time: new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }),
          description: "Anomalía detectada por sensores",
          status: "active"
        };
        
        setAlerts(prev => [newAlert, ...prev.slice(0, 4)]); // Keep only 5 alerts
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "incident":
        return AlertTriangle;
      case "congestion":
        return Car;
      case "maintenance":
        return Construction;
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