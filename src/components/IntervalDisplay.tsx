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
        console.log('🔄 Actualizando intervalo actual...');
        const intervalData = await trafficService.getCurrentInterval();
        if (intervalData) {
          console.log('✅ Intervalo obtenido:', intervalData.current_interval);
          setCurrentInterval(intervalData.current_interval);
          setSimulationStep(intervalData.simulation_step);
          setTotalIntervals(intervalData.total_intervals);
          setIsConnected(true);
        } else {
          console.warn('⚠️ No se pudo obtener el intervalo');
          setIsConnected(false);
          setCurrentInterval('Sin conexión');
        }
      } catch (error) {
        console.error('❌ Error al obtener intervalo actual:', error);
        setIsConnected(false);
        setCurrentInterval('Error de conexión');
      }
    };

    // Actualizar inmediatamente
    updateInterval();

    // Actualizar cada 10 segundos (coincide con el backend)
    const interval = setInterval(updateInterval, 10000);

    return () => clearInterval(interval);
  }, []);

  const progressPercentage = totalIntervals > 0 ? ((simulationStep + 1) / totalIntervals) * 100 : 0;

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 shadow-lg w-full">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="p-2 bg-primary/10 rounded-full flex-shrink-0">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-lg text-foreground">
                Intervalo Actual
              </h3>
              <p className="text-xl sm:text-2xl font-bold text-primary truncate">
                {currentInterval}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <Wifi className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                    Conectado
                  </Badge>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 flex-shrink-0" />
                  <Badge variant="destructive" className="text-xs">
                    Desconectado
                  </Badge>
                </>
              )}
            </div>
            
            {isConnected && (
              <div className="text-left sm:text-right text-xs sm:text-sm text-muted-foreground w-full sm:w-auto">
                <div className="whitespace-nowrap">Paso {simulationStep + 1} de {totalIntervals}</div>
                <div className="w-full sm:w-32 bg-gray-200 rounded-full h-2 mt-1">
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