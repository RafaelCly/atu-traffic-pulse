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
    <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-3 rounded-lg border", getColorClasses())}>
            <Icon className="h-6 w-6" />
          </div>
          <Badge variant="outline" className={cn("gap-1", getTrendColor())}>
            <TrendIcon className="h-3 w-3" />
            {trendValue}
          </Badge>
        </div>
        
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-1">{value}</h3>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
        
        {/* Subtle background pattern */}
        <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
          <Icon className="w-full h-full" />
        </div>
      </CardContent>
    </Card>
  );
};

export default KPICard;