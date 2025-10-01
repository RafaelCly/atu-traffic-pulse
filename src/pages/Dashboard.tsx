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
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-accent/20">
      {/* Enhanced Header */}
      <header className="bg-card/95 backdrop-blur-sm border-b border-border/50 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:h-20 gap-3 sm:gap-0">
            <div className="flex items-center w-full sm:w-auto">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg flex-shrink-0">
                <Car className="h-5 w-5 sm:h-7 sm:w-7 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent truncate">
                  TheUNIAnalytics Centro de Control
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium hidden sm:block">Sistema de Monitoreo con Cámaras y GPS</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2 sm:gap-6">
              {/* Status Indicators */}
              <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto">
                <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-success/10 rounded-full whitespace-nowrap flex-shrink-0">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${isServerConnected ? 'bg-success' : 'bg-warning'}`} />
                  <span className={`text-[10px] sm:text-xs font-medium ${isServerConnected ? 'text-success' : 'text-warning'}`}>
                    {isServerConnected ? 'Activo' : 'Simulación'}
                  </span>
                </div>
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full flex-shrink-0">
                  <Camera className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium text-primary">{trafficData.activeCameras} Cámaras</span>
                </div>
                {isServerConnected && (
                  <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-full flex-shrink-0">
                    <span className="text-xs font-medium text-success">Excel Conectado</span>
                  </div>
                )}
              </div>
              
              <div className="text-right hidden lg:block flex-shrink-0">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground whitespace-nowrap">
                  {currentTime.toLocaleTimeString()} • {currentTime.toLocaleDateString()}
                </p>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground hover:bg-destructive/10 flex-shrink-0"
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 md:space-y-8">
        {/* Intervalo Actual - Prominente */}
        <IntervalDisplay />

        {/* KPIs principales - Conectados con datos reales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Vista General</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Mapa</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
              <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Alertas</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            {/* Solo mostrar gráficos de métricas */}
            <MetricsChart />
          </TabsContent>

          <TabsContent value="map">
            <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card to-card/80 h-[500px] sm:h-[600px] lg:h-[700px]">
              <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  <span className="truncate">Vista Completa del Mapa de Tráfico</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-60px)] sm:h-[calc(100%-70px)]">
                <TrafficMap />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card to-card/80">
              <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                  <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-warning" />
                  <span className="truncate">Centro de Alertas y Notificaciones</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
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