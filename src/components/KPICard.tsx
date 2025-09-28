import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend: "up" | "down" | "stable";
  trendValue: string;
  color: "primary" | "warning" | "destructive" | "success" | "accent";
}

const KPICard = ({ title, value, icon: Icon, trend, trendValue, color }: KPICardProps) => {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return TrendingUp;
      case "down":
        return TrendingDown;
      default:
        return Minus;
    }
  };

  const TrendIcon = getTrendIcon();

  const getColorClasses = () => {
    switch (color) {
      case "primary":
        return "bg-primary/10 text-primary border-primary/20";
      case "warning":
        return "bg-warning/10 text-warning border-warning/20";
      case "destructive":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "success":
        return "bg-success/10 text-success border-success/20";
      default:
        return "bg-accent/50 text-accent-foreground border-accent";
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return color === "destructive" ? "text-destructive" : "text-success";
      case "down":
        return color === "primary" ? "text-warning" : "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card via-card to-card/80 hover:shadow-2xl transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className={cn("p-4 rounded-xl border-2 shadow-lg group-hover:scale-110 transition-transform duration-300", getColorClasses())}>
            <Icon className="h-7 w-7" />
          </div>
          <Badge variant="outline" className={cn("gap-2 px-3 py-1 font-semibold", getTrendColor())}>
            <TrendIcon className="h-4 w-4" />
            {trendValue}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-3xl font-bold text-foreground tracking-tight">{value}</h3>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
        </div>
        
        {/* Enhanced background pattern with better opacity */}
        <div className="absolute -top-4 -right-4 w-24 h-24 opacity-[0.03] rotate-12 group-hover:rotate-6 transition-transform duration-500">
          <Icon className="w-full h-full" />
        </div>
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/[0.02] pointer-events-none" />
      </CardContent>
    </Card>
  );
};

export default KPICard;