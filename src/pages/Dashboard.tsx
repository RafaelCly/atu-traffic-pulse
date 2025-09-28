import React from "react";
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
  Zap,
  Camera,
  Navigation
} from "lucide-react";
import TrafficMap from "@/components/TrafficMap";
import KPICard from "@/components/KPICard";
import AlertsPanel from "@/components/AlertsPanel";
import MetricsChart from "@/components/MetricsChart";
import DecisionInsights from "@/components/DecisionInsights";

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
                <p className="text-sm text-muted-foreground font-medium">Sistema de Monitoreo con Cámaras y GPS</p>
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
                  <Camera className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium text-primary">{trafficData.activeCameras} Cámaras</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-warning/10 rounded-full">
                  <Navigation className="h-3 w-3 text-warning" />
                  <span className="text-xs font-medium text-warning">GPS Activo</span>
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
        {/* Enhanced KPIs with additional metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
          <KPICard
            title="Vehículos Activos"
            value={trafficData.totalVehicles.toLocaleString()}
            icon={Car}
            trend="up"
            trendValue="+5.2%"
            color="primary"
          />
          <KPICard
            title="Velocidad Media"
            value={`${trafficData.averageSpeed} km/h`}
            icon={Activity}
            trend="down"
            trendValue="-2.1%"
            color="warning"
          />
          <KPICard
            title="Incidencias"
            value={trafficData.incidents.toString()}
            icon={AlertTriangle}
            trend="up"
            trendValue="+12%"
            color="destructive"
          />
          <KPICard
            title="Congestión"
            value={`${trafficData.congestionLevel}%`}
            icon={TrendingUp}
            trend="stable"
            trendValue="0%"
            color="accent"
          />
          <KPICard
            title="Tiempo Ahorro"
            value="23 min"
            icon={Clock}
            trend="up"
            trendValue="+8%"
            color="success"
          />
          <KPICard
            title="Eficiencia"
            value="87%"
            icon={Zap}
            trend="up"
            trendValue="+3%"
            color="primary"
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
            {/* Analytics Section - Power BI Style */}
            <MetricsChart />
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Enhanced Traffic Map */}
              <div className="xl:col-span-2">
                <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card to-card/80">
                  <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-transparent">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Mapa Inteligente de Tráfico</h3>
                        <p className="text-sm text-muted-foreground">Vista en tiempo real con IA predictiva</p>
                      </div>
                      <Badge variant="outline" className="ml-auto bg-success/10 border-success/20">
                        <div className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse" />
                        IA Activa
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 h-[520px]">
                    <TrafficMap />
                  </CardContent>
                </Card>
              </div>

              {/* Decision Insights Panel */}
              <div className="space-y-6">
                <DecisionInsights />
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
            <div className="space-y-6">
              {/* Advanced Analytics */}
              <MetricsChart />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card to-card/80">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <BarChart3 className="h-6 w-6 text-primary" />
                      Análisis Predictivo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-primary/5 rounded-lg">
                        <h4 className="font-semibold text-primary">Predicción Próximas 2 Horas</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Incremento del 35% en Centro Histórico. Recomendamos activar Plan de Contingencia B.
                        </p>
                      </div>
                      <div className="p-4 bg-warning/5 rounded-lg">
                        <h4 className="font-semibold text-warning">Alerta Temprana</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Evento masivo detectado en Miraflores. Preparar desvíos alternativos.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card to-card/80">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <TrendingUp className="h-6 w-6 text-success" />
                      ROI de Optimizaciones
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg">
                        <span className="font-medium">Ahorro Combustible</span>
                        <span className="font-bold text-success">S/. 245,000</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                        <span className="font-medium">Tiempo Ahorrado</span>
                        <span className="font-bold text-primary">1,250 hrs</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-warning/10 rounded-lg">
                        <span className="font-medium">Reducción CO2</span>
                        <span className="font-bold text-warning">-18%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;