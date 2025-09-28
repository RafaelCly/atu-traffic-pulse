import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, AlertTriangle, Clock } from "lucide-react";

const hourlyData = [
  { hour: '06:00', vehicles: 2400, incidents: 1, speed: 45 },
  { hour: '07:00', vehicles: 4800, incidents: 3, speed: 25 },
  { hour: '08:00', vehicles: 7200, incidents: 5, speed: 15 },
  { hour: '09:00', vehicles: 6800, incidents: 4, speed: 20 },
  { hour: '10:00', vehicles: 5200, incidents: 2, speed: 35 },
  { hour: '11:00', vehicles: 4600, incidents: 1, speed: 40 },
  { hour: '12:00', vehicles: 5800, incidents: 3, speed: 30 },
];

const zoneData = [
  { name: 'Centro', value: 35, color: '#ef4444' },
  { name: 'San Isidro', value: 25, color: '#f97316' },
  { name: 'Miraflores', value: 20, color: '#eab308' },
  { name: 'Surco', value: 15, color: '#22c55e' },
  { name: 'La Molina', value: 5, color: '#3b82f6' },
];

const incidentData = [
  { type: 'Congestión', count: 45, percentage: 60 },
  { type: 'Accidentes', count: 18, percentage: 24 },
  { type: 'Obras', count: 8, percentage: 11 },
  { type: 'Eventos', count: 4, percentage: 5 },
];

const MetricsChart = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Tráfico por Hora */}
      <Card className="col-span-1 lg:col-span-2 overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card to-card/80">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Flujo de Tráfico por Hora</h3>
              <p className="text-sm text-muted-foreground">Análisis de patrones horarios</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" />
              <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
              <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Bar yAxisId="left" dataKey="vehicles" fill="hsl(var(--primary))" radius={4} />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="speed" 
                stroke="hsl(var(--warning))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--warning))', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Distribución por Zona */}
      <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card to-card/80">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Congestión por Zona</h3>
              <p className="text-sm text-muted-foreground">Distribución actual</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={zoneData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {zoneData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tipos de Incidencias */}
      <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card to-card/80">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Tipos de Incidencias</h3>
              <p className="text-sm text-muted-foreground">Últimas 24 horas</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {incidentData.map((incident, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="font-medium">{incident.type}</span>
              </div>
              <div className="text-right">
                <div className="font-bold">{incident.count}</div>
                <div className="text-xs text-muted-foreground">{incident.percentage}%</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricsChart;