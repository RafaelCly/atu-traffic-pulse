import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Car, 
  MapPin, 
  Clock,
  TrendingUp,
  LogOut,
  Bell,
  BarChart3,
  Camera
} from "lucide-react";
import TrafficMap from "@/components/TrafficMap";
import KPICard from "@/components/KPICard";
import AlertsPanel from "@/components/AlertsPanel";
import MetricsChart from "@/components/MetricsChart";
import IntervalDisplay from "@/components/IntervalDisplay";
import { trafficService, TrafficKPIs } from "@/services/trafficService";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [kpis, setKpis] = useState<TrafficKPIs>({
    overallOccupancyPercentage: 0,
    congestionPercentage: 0,
    redSegmentsCount: 0,
    totalSegmentsCount: 0,
    averageTravelTime: 0
  });
  const [isServerConnected, setIsServerConnected] = useState(false);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("theunianalytics-authenticated");
    const userData = localStorage.getItem("theunianalytics-user");
    
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

  // Cargar KPIs reales del servicio de tráfico
  useEffect(() => {
    const loadKPIs = async () => {
      try {
        console.log('Dashboard: Cargando KPIs...');
        const serverStatus = await trafficService.checkServerStatus();
        console.log('Dashboard: Estado del servidor:', serverStatus);
        setIsServerConnected(serverStatus);
        
        const realKPIs = await trafficService.getKPIs();
        if (realKPIs) {
          console.log('Dashboard: KPIs obtenidos:', realKPIs);
          setKpis(realKPIs);
        }
      } catch (error) {
        console.error('Dashboard: Error loading KPIs:', error);
        setIsServerConnected(false);
      }
    };

    // Cargar KPIs inicialmente
    loadKPIs();
    
    // Actualizar KPIs cada 10 segundos
    const kpiInterval = setInterval(() => {
      console.log('Dashboard: Actualizando KPIs automáticamente...');
      loadKPIs();
    }, 10000);
    
    return () => {
      console.log('Dashboard: Limpiando intervalo de KPIs');
      clearInterval(kpiInterval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("theunianalytics-authenticated");
    localStorage.removeItem("theunianalytics-user");
    navigate("/");
  };

  // Mock real-time data para activeCameras
  const [trafficData] = useState({
    activeCameras: 124,
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
                  TheUNIAnalytics Centro de Control
                </h1>
                <p className="text-sm text-muted-foreground font-medium">Sistema de Monitoreo con Cámaras y GPS</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Status Indicators */}
              {/* Status Indicators */}
              <div className="hidden sm:flex items-center space-x-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-full">
                  <div className={`w-2 h-2 rounded-full mr-2 animate-pulse ${isServerConnected ? 'bg-success' : 'bg-warning'}`} />
                  <span className={`text-xs font-medium ${isServerConnected ? 'text-success' : 'text-warning'}`}>
                    {isServerConnected ? 'Sistema Activo' : 'Modo Simulación'}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
                  <Camera className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium text-primary">{trafficData.activeCameras} Cámaras</span>
                </div>
                {isServerConnected && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-full">
                    <span className="text-xs font-medium text-success">Excel Conectado</span>
                  </div>
                )}
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
        {/* Intervalo Actual - Prominente */}
        <IntervalDisplay />

        {/* KPIs principales - Conectados con datos reales */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KPICard
            title="% Ocupación UCP"
            value={`${Math.round(kpis.overallOccupancyPercentage)}%`}
            icon={Car}
            trend="up"
            trendValue="+5.2%"
            color="primary"
          />
          <KPICard
            title="% Congestión"
            value={`${Math.round(kpis.congestionPercentage)}%`}
            icon={TrendingUp}
            trend="stable"
            trendValue="0%"
            color="accent"
          />
          <KPICard
            title="Tiempo Medio de Viaje"
            value={`${kpis.averageTravelTime} min`}
            icon={Clock}
            trend="down"
            trendValue="-2.1%"
            color="warning"
          />
        </div>

        {/* Main Dashboard with Tabs for better organization */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
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
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Solo mostrar gráficos de métricas */}
            <MetricsChart />
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
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;