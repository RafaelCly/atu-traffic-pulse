import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Clock, Wifi, WifiOff } from 'lucide-react';
import { Badge } from './ui/badge';
import { trafficService } from '../services/trafficService';

const IntervalDisplay: React.FC = () => {
  const [currentInterval, setCurrentInterval] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [simulationStep, setSimulationStep] = useState<number>(0);
  const [totalIntervals, setTotalIntervals] = useState<number>(0);

  useEffect(() => {
    const updateInterval = async () => {
      try {
        const intervalData = await trafficService.getCurrentInterval();
        if (intervalData) {
          setCurrentInterval(intervalData.current_interval);
          setSimulationStep(intervalData.simulation_step);
          setTotalIntervals(intervalData.total_intervals);
          setIsConnected(true);
        } else {
          setIsConnected(false);
          setCurrentInterval('Sin conexión');
        }
      } catch (error) {
        console.error('Error fetching current interval:', error);
        setIsConnected(false);
        setCurrentInterval('Error de conexión');
      }
    };

    // Actualizar inmediatamente
    updateInterval();

    // Actualizar cada 5 segundos
    const interval = setInterval(updateInterval, 5000);

    return () => clearInterval(interval);
  }, []);

  const progressPercentage = totalIntervals > 0 ? ((simulationStep + 1) / totalIntervals) * 100 : 0;

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">
                Intervalo Actual
              </h3>
              <p className="text-2xl font-bold text-primary">
                {currentInterval}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Conectado
                  </Badge>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-500" />
                  <Badge variant="destructive">
                    Desconectado
                  </Badge>
                </>
              )}
            </div>
            
            {isConnected && (
              <div className="text-right text-sm text-muted-foreground">
                <div>Paso {simulationStep + 1} de {totalIntervals}</div>
                <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntervalDisplay;