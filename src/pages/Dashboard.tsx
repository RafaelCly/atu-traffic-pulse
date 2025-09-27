import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Car, 
  AlertTriangle, 
  Activity, 
  Users, 
  MapPin, 
  Clock,
  TrendingUp,
  TrendingDown,
  LogOut,
  Bell
} from "lucide-react";
import TrafficMap from "@/components/TrafficMap";
import KPICard from "@/components/KPICard";
import AlertsPanel from "@/components/AlertsPanel";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("atu-authenticated");
    const userData = localStorage.getItem("atu-user");
    
    if (!isAuthenticated) {
      navigate("/");
      return;
    }
    
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("atu-authenticated");
    localStorage.removeItem("atu-user");
    navigate("/");
  };

  // Mock real-time data
  const [trafficData] = useState({
    totalVehicles: 15420,
    averageSpeed: 32.5,
    incidents: 8,
    congestionLevel: 65,
    activeCameras: 124,
    alerts: 3
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3">
                <Car className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">ATU - Centro de Control</h1>
                <p className="text-sm text-muted-foreground">Sistema de Monitoreo de Tráfico</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {currentTime.toLocaleTimeString()} - {currentTime.toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* KPIs Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Vehículos en Circulación"
            value={trafficData.totalVehicles.toLocaleString()}
            icon={Car}
            trend="up"
            trendValue="+5.2%"
            color="primary"
          />
          <KPICard
            title="Velocidad Promedio"
            value={`${trafficData.averageSpeed} km/h`}
            icon={Activity}
            trend="down"
            trendValue="-2.1%"
            color="warning"
          />
          <KPICard
            title="Incidencias Activas"
            value={trafficData.incidents.toString()}
            icon={AlertTriangle}
            trend="up"
            trendValue="+12%"
            color="destructive"
          />
          <KPICard
            title="Nivel de Congestión"
            value={`${trafficData.congestionLevel}%`}
            icon={TrendingUp}
            trend="stable"
            trendValue="0%"
            color="accent"
          />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Traffic Map - Takes 2 columns */}
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Mapa de Tráfico en Tiempo Real
                  <Badge variant="outline" className="ml-auto">
                    <div className="w-2 h-2 bg-success rounded-full mr-1 animate-pulse" />
                    En vivo
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[520px]">
                <TrafficMap />
              </CardContent>
            </Card>
          </div>

          {/* Alerts Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-warning" />
                  Alertas Activas
                  <Badge variant="destructive" className="ml-auto">
                    {trafficData.alerts}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <AlertsPanel />
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-success" />
                  Estado del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Cámaras Activas</span>
                  <Badge variant="outline">{trafficData.activeCameras}/130</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Sensores</span>
                  <Badge variant="outline" className="text-success">98% Online</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Conectividad</span>
                  <Badge variant="outline" className="text-success">Óptima</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Última Actualización</span>
                  <span className="text-sm text-muted-foreground">
                    {currentTime.toLocaleTimeString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;