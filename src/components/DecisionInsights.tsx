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
    <div className="space-y-6">
      {/* Insights Críticos */}
      <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card to-card/80">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <Target className="h-5 w-5 text-warning" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Insights para Decisiones</h3>
              <p className="text-sm text-muted-foreground">Recomendaciones basadas en IA</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
              <div key={index} className="p-4 bg-accent/30 rounded-lg border border-border/50">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    insight.type === 'critical' ? 'bg-destructive/10' :
                    insight.type === 'optimization' ? 'bg-warning/10' : 'bg-primary/10'
                  }`}>
                    <Icon className={`h-4 w-4 ${
                      insight.type === 'critical' ? 'text-destructive' :
                      insight.type === 'optimization' ? 'text-warning' : 'text-primary'
                    }`} />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{insight.title}</h4>
                      <Badge variant={getBadgeColor(insight.priority)}>
                        {insight.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        ETA: {insight.eta}
                      </div>
                      <Button size="sm" variant="outline" className="h-7">
                        {insight.action}
                        <ArrowRight className="h-3 w-3 ml-1" />
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
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <MapPin className="h-5 w-5 text-success" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Recomendaciones por Zona</h3>
              <p className="text-sm text-muted-foreground">Acciones prioritarias</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recommendations.map((rec, index) => (
            <div key={index} className="p-3 bg-accent/20 rounded-lg border border-border/30">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-primary" />
                  {rec.zone}
                </h4>
                <Badge variant="outline" className="text-xs">
                  {rec.timeline}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{rec.action}</p>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-success" />
                <span className="text-xs font-medium text-success">{rec.impact}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Métricas de Rendimiento */}
      <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card to-card/80">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Impacto de Decisiones</h3>
              <p className="text-sm text-muted-foreground">Resultados de acciones tomadas</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-success/10 rounded-lg text-center">
              <div className="text-2xl font-bold text-success">-23%</div>
              <div className="text-xs text-muted-foreground">Tiempo de Viaje</div>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg text-center">
              <div className="text-2xl font-bold text-primary">+18%</div>
              <div className="text-xs text-muted-foreground">Flujo Vehicular</div>
            </div>
            <div className="p-3 bg-warning/10 rounded-lg text-center">
              <div className="text-2xl font-bold text-warning">-45%</div>
              <div className="text-xs text-muted-foreground">Incidencias</div>
            </div>
            <div className="p-3 bg-success/10 rounded-lg text-center">
              <div className="text-2xl font-bold text-success">92%</div>
              <div className="text-xs text-muted-foreground">Satisfacción</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DecisionInsights;