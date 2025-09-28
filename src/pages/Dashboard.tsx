import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Bell,
  BarChart3,
  Settings,
  Monitor,
  Zap
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      {/* Enhanced Header */}
      <header className="bg-card/95 backdrop-blur-sm border-b border-border/50 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <Car className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  ATU Centro de Control
                </h1>
                <p className="text-sm text-muted-foreground font-medium">Sistema Inteligente de Monitoreo de Tráfico</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Status Indicators */}
              <div className="hidden sm:flex items-center space-x-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-full">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-success">Sistema Activo</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
                  <Monitor className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium text-primary">{trafficData.activeCameras} Cámaras</span>
                </div>
              </div>
              
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {currentTime.toLocaleTimeString()} • {currentTime.toLocaleDateString()}
                </p>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Enhanced KPIs with better visual hierarchy */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
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

        {/* Main Dashboard with Tabs for better organization */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Vista General</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Mapa</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alertas</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Análisis</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Enhanced Traffic Map */}
              <div className="lg:col-span-2">
                <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card to-card/80">
                  <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-transparent">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Mapa de Tráfico en Tiempo Real</h3>
                        <p className="text-sm text-muted-foreground">Monitoreo inteligente de 6 zonas de Lima</p>
                      </div>
                      <Badge variant="outline" className="ml-auto bg-success/10 border-success/20">
                        <div className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse" />
                        En Vivo
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 h-[520px]">
                    <TrafficMap />
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Sidebar */}
              <div className="space-y-6">
                {/* Alerts Panel */}
                <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card to-card/80">
                  <CardHeader className="pb-4 bg-gradient-to-r from-warning/5 to-transparent">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-warning/10 rounded-lg">
                        <Bell className="h-5 w-5 text-warning" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Alertas Críticas</h3>
                        <p className="text-sm text-muted-foreground">Requieren atención inmediata</p>
                      </div>
                      <Badge variant="destructive" className="ml-auto">
                        {trafficData.alerts}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <AlertsPanel />
                  </CardContent>
                </Card>

                {/* Enhanced System Status */}
                <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card to-card/80">
                  <CardHeader className="pb-4 bg-gradient-to-r from-success/5 to-transparent">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-success/10 rounded-lg">
                        <Activity className="h-5 w-5 text-success" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Estado del Sistema</h3>
                        <p className="text-sm text-muted-foreground">Monitoreo de infraestructura</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-accent/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Cámaras Activas</span>
                      </div>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {trafficData.activeCameras}/130
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-accent/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-success" />
                        <span className="text-sm font-medium">Sensores IoT</span>
                      </div>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                        98% Online
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-accent/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-success" />
                        <span className="text-sm font-medium">Conectividad</span>
                      </div>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                        Óptima
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-accent/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Última Sync</span>
                      </div>
                      <span className="text-sm font-medium text-success">
                        {currentTime.toLocaleTimeString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="map">
            <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card to-card/80 h-[700px]">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-primary" />
                  Vista Completa del Mapa de Tráfico
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[620px]">
                <TrafficMap />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card to-card/80">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <Bell className="h-6 w-6 text-warning" />
                  Centro de Alertas y Notificaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AlertsPanel />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card to-card/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <BarChart3 className="h-6 w-6 text-primary" />
                    Tendencias de Tráfico
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Análisis de datos en desarrollo</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card to-card/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <TrendingUp className="h-6 w-6 text-success" />
                    Reportes de Rendimiento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Métricas avanzadas próximamente</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;