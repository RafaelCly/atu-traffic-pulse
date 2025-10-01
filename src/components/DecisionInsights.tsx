import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Lightbulb, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  MapPin,
  Users,
  ArrowRight,
  Target
} from "lucide-react";

const insights = [
  {
    type: "critical",
    icon: AlertTriangle,
    title: "Congestión Crítica Detectada",
    description: "Av. Javier Prado muestra 85% de congestión. Se recomienda activar rutas alternas.",
    action: "Activar Plan B",
    priority: "Alto",
    eta: "5 min"
  },
  {
    type: "optimization",
    icon: Lightbulb,
    title: "Oportunidad de Optimización",
    description: "Semáforos en Surco pueden reducir tiempo de espera en 12% con ajuste de timing.",
    action: "Optimizar Semáforos",
    priority: "Medio",
    eta: "15 min"
  },
  {
    type: "prediction",
    icon: TrendingUp,
    title: "Predicción de Tráfico",
    description: "Se espera incremento del 30% en Centro Histórico a las 18:00 hrs.",
    action: "Preparar Recursos",
    priority: "Medio",
    eta: "2 hrs"
  }
];

const recommendations = [
  {
    zone: "Centro Histórico",
    action: "Implementar horario escalonado",
    impact: "Reducción 25% congestión",
    timeline: "Inmediato"
  },
  {
    zone: "Av. Arequipa",
    action: "Activar carriles reversibles",
    impact: "Mejora flujo 35%",
    timeline: "30 min"
  },
  {
    zone: "San Isidro",
    action: "Coordinar semáforos inteligentes",
    impact: "Reducción 15% tiempo viaje",
    timeline: "10 min"
  }
];

const DecisionInsights = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Insights Críticos */}
      <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card to-card/80">
        <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-warning/10 rounded-lg flex-shrink-0">
              <Target className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold truncate">Insights para Decisiones</h3>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">Recomendaciones basadas en IA</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            const getBadgeColor = (priority: string) => {
              switch (priority) {
                case "Alto": return "destructive";
                case "Medio": return "secondary";
                default: return "outline";
              }
            };

            return (
              <div key={index} className="p-3 sm:p-4 bg-accent/30 rounded-lg border border-border/50">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                    insight.type === 'critical' ? 'bg-destructive/10' :
                    insight.type === 'optimization' ? 'bg-warning/10' : 'bg-primary/10'
                  }`}>
                    <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${
                      insight.type === 'critical' ? 'text-destructive' :
                      insight.type === 'optimization' ? 'text-warning' : 'text-primary'
                    }`} />
                  </div>
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                      <h4 className="font-semibold text-sm sm:text-base truncate">{insight.title}</h4>
                      <Badge variant={getBadgeColor(insight.priority)} className="text-xs self-start sm:self-auto flex-shrink-0">
                        {insight.priority}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{insight.description}</p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        ETA: {insight.eta}
                      </div>
                      <Button size="sm" variant="outline" className="h-6 sm:h-7 text-xs w-full sm:w-auto">
                        <span className="truncate">{insight.action}</span>
                        <ArrowRight className="h-3 w-3 ml-1 flex-shrink-0" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Recomendaciones por Zona */}
      <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card to-card/80">
        <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-success/10 rounded-lg flex-shrink-0">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold truncate">Recomendaciones por Zona</h3>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">Acciones prioritarias</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3 px-4 sm:px-6">
          {recommendations.map((rec, index) => (
            <div key={index} className="p-2.5 sm:p-3 bg-accent/20 rounded-lg border border-border/30">
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <h4 className="font-medium text-sm sm:text-base flex items-center gap-1 sm:gap-2 truncate flex-1">
                  <MapPin className="h-3 w-3 text-primary flex-shrink-0" />
                  <span className="truncate">{rec.zone}</span>
                </h4>
                <Badge variant="outline" className="text-[10px] sm:text-xs flex-shrink-0 ml-2">
                  {rec.timeline}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-2 line-clamp-2">{rec.action}</p>
              <div className="flex items-center gap-1 sm:gap-2">
                <TrendingUp className="h-3 w-3 text-success flex-shrink-0" />
                <span className="text-xs font-medium text-success truncate">{rec.impact}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Métricas de Rendimiento */}
      <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card to-card/80">
        <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg flex-shrink-0">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold truncate">Impacto de Decisiones</h3>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">Resultados de acciones tomadas</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <div className="p-2 sm:p-3 bg-success/10 rounded-lg text-center">
              <div className="text-xl sm:text-2xl font-bold text-success">-23%</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">Tiempo de Viaje</div>
            </div>
            <div className="p-2 sm:p-3 bg-primary/10 rounded-lg text-center">
              <div className="text-xl sm:text-2xl font-bold text-primary">+18%</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">Flujo Vehicular</div>
            </div>
            <div className="p-2 sm:p-3 bg-warning/10 rounded-lg text-center">
              <div className="text-xl sm:text-2xl font-bold text-warning">-45%</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">Incidencias</div>
            </div>
            <div className="p-2 sm:p-3 bg-success/10 rounded-lg text-center">
              <div className="text-xl sm:text-2xl font-bold text-success">92%</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">Satisfacción</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DecisionInsights;