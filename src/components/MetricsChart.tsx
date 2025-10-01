import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChevronDown, ChevronRight, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { trafficService } from '../services/trafficService';

interface VehicleRecord {
  interval: string;
  segmentId: string;
  segmentName: string;
  autos: number;
  buses: number;
  motos: number;
  camionetas: number;
  totalVehicles: number;
  ucp: number;
  ocupacion: number;
}

interface ChartDataPoint {
  interval: string;
  totalUCP: number;
  isCurrentInterval: boolean;
}

interface SegmentOption {
  id: string;
  name: string;
}

export default function MetricsChart() {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [currentInterval, setCurrentInterval] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para la tabla de filtros
  const [allIntervals, setAllIntervals] = useState<string[]>([]);
  const [allSegments, setAllSegments] = useState<SegmentOption[]>([]);
  const [selectedInterval, setSelectedInterval] = useState<string>('');
  const [selectedSegment, setSelectedSegment] = useState<string>('');
  const [filteredVehicleData, setFilteredVehicleData] = useState<VehicleRecord[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [tableLoading, setTableLoading] = useState(false);

  // Error boundary para capturar errores
  const [hasError, setHasError] = useState(false);

  const handleError = (error: Error | unknown, context: string) => {
    console.error(`Error en ${context}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    setError(`Error en ${context}: ${errorMessage}`);
    setHasError(true);
  };

  const fetchInitialData = useCallback(async () => {
    try {
      console.log('Iniciando fetchInitialData...');
      setLoading(true);
      setError(null);
      setHasError(false);

      // Obtener intervalo actual
      console.log('Obteniendo intervalo actual...');
      const currentIntervalResponse = await trafficService.getCurrentInterval();
      if (currentIntervalResponse) {
        console.log('Intervalo actual obtenido:', currentIntervalResponse.current_interval);
        setCurrentInterval(currentIntervalResponse.current_interval);
      }

      // Obtener todos los intervalos
      console.log('Obteniendo todos los intervalos...');
      const intervals = await trafficService.getAllIntervals();
      console.log('Intervalos obtenidos:', intervals.length);
      setAllIntervals(intervals);

      // Obtener datos UCP por intervalo para el gráfico
      console.log('Obteniendo datos UCP por intervalo...');
      const ucpResponse = await trafficService.getUCPByInterval();
      console.log('Datos UCP obtenidos:', ucpResponse.length);

      // Crear datos para el gráfico
      const chartPoints: ChartDataPoint[] = intervals.map(interval => {
        const ucpData = ucpResponse.find(u => u.interval === interval);
        const isCurrentInterval = currentIntervalResponse && interval === currentIntervalResponse.current_interval;
        
        return {
          interval: interval || '',
          totalUCP: isCurrentInterval && ucpData ? (ucpData.total_ucp ?? 0) : 0,
          isCurrentInterval: isCurrentInterval || false
        };
      });

      setChartData(chartPoints);
      console.log('Datos del gráfico configurados:', chartPoints.length);

      // Obtener segmentos disponibles (usando nombres de segmentos conocidos)
      const segments = [
        { id: '1 - Av. Pachacutec VTM -> SJM', name: '1 - Av. Pachacutec VTM -> SJM' },
        { id: '2 - Av. Pachacutec VTM -> SJM', name: '2 - Av. Pachacutec VTM -> SJM' },
        { id: '3 - Av. Pachacutec VTM -> SJM', name: '3 - Av. Pachacutec VTM -> SJM' },
        { id: '1 - Av. Pachacutec SJM -> VTM', name: '1 - Av. Pachacutec SJM -> VTM' },
        { id: '2 - Av. Pachacutec SJM -> VTM', name: '2 - Av. Pachacutec SJM -> VTM' },
        { id: '3 - Av. Pachacutec SJM -> VTM', name: '3 - Av. Pachacutec SJM -> VTM' }
      ];
      setAllSegments(segments);
      console.log('Carga inicial completada exitosamente');

    } catch (error) {
      handleError(error, 'fetchInitialData');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
    
    // Configurar actualización automática cada 10 segundos para sincronizar con Python
    const updateInterval = setInterval(() => {
      console.log('🔄 Actualizando datos automáticamente...');
      fetchInitialData();
    }, 10000); // 10 segundos, igual que el backend de Python
    
    return () => {
      clearInterval(updateInterval);
    };
  }, [fetchInitialData]);

  useEffect(() => {
    const loadVehicleData = async () => {
      try {
        setTableLoading(true);
        
        // Si no hay filtros seleccionados, obtener datos del intervalo actual
        const intervalToQuery = selectedInterval || currentInterval;
        
        if (!intervalToQuery) {
          setFilteredVehicleData([]);
          return;
        }

        console.log('🚗 Cargando datos de vehículos para intervalo:', intervalToQuery);
        
        // Obtener datos de vehículos por intervalo y segmento
        const vehicleData = await trafficService.getVehiclesByIntervalAndSegment(intervalToQuery);
        
        let filteredData = vehicleData.map((v) => ({
          interval: intervalToQuery,
          segmentId: v.segment_id || '',
          segmentName: v.segment_name || '',
          autos: v.autos ?? 0,
          buses: v.buses ?? 0,
          motos: v.motos ?? 0,
          camionetas: v.camionetas ?? 0,
          totalVehicles: v.total_vehicles ?? 0,
          ucp: v.ucp ?? 0,
          ocupacion: v.ocupacion ?? 0
        }));

        // Aplicar filtro de segmento si está seleccionado
        if (selectedSegment) {
          filteredData = filteredData.filter(item => item.segmentId === selectedSegment);
        }

        setFilteredVehicleData(filteredData);
        console.log('✅ Datos de vehículos cargados:', filteredData.length, 'registros');
        
      } catch (error) {
        handleError(error, 'loadVehicleData');
        setFilteredVehicleData([]);
      } finally {
        setTableLoading(false);
      }
    };

    // Cargar datos cuando cambie el intervalo actual o los filtros
    if (currentInterval || selectedInterval) {
      const timeoutId = setTimeout(() => {
        loadVehicleData();
      }, 100); // Pequeño delay para evitar llamadas excesivas
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentInterval, selectedInterval, selectedSegment]);

  const handleSearchClick = async () => {
    try {
      setTableLoading(true);
      
      // Si no hay filtros seleccionados, obtener datos del intervalo actual
      const intervalToQuery = selectedInterval || currentInterval;
      
      if (!intervalToQuery) {
        setFilteredVehicleData([]);
        return;
      }

      // Obtener datos de vehículos por intervalo y segmento
      const vehicleData = await trafficService.getVehiclesByIntervalAndSegment(intervalToQuery);
      
      let filteredData = vehicleData.map((v) => ({
        interval: intervalToQuery,
        segmentId: v.segment_id || '',
        segmentName: v.segment_name || '',
        autos: v.autos ?? 0,
        buses: v.buses ?? 0,
        motos: v.motos ?? 0,
        camionetas: v.camionetas ?? 0,
        totalVehicles: v.total_vehicles ?? 0,
        ucp: v.ucp ?? 0,
        ocupacion: v.ocupacion ?? 0
      }));

      // Aplicar filtro de segmento si está seleccionado
      if (selectedSegment) {
        filteredData = filteredData.filter(item => item.segmentId === selectedSegment);
      }

      setFilteredVehicleData(filteredData);
      
    } catch (error) {
      console.error('Error loading vehicle data:', error);
      setFilteredVehicleData([]);
    } finally {
      setTableLoading(false);
    }
  };

  const toggleRowDetail = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const formatTooltip = (value: number, name: string) => {
    if (name === 'totalUCP') return [`${(value ?? 0).toFixed(1)} UCP`, 'UCP Total'];
    return [value ?? 0, name];
  };

  const getOcupacionColor = (ocupacion: number | undefined) => {
    const value = ocupacion ?? 0;
    if (value >= 80) return 'bg-red-500';
    if (value >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (hasError || error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Error en Métricas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-red-500 p-4 bg-red-50 rounded-lg">
              {error}
            </div>
            <Button 
              onClick={() => {
                setError(null);
                setHasError(false);
                fetchInitialData();
              }}
              className="mt-4"
            >
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Análisis de Tráfico por Intervalos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Cargando datos...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Error en Métricas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-red-500">{error}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-base sm:text-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="truncate">Análisis de Tráfico por Intervalos</span>
          </div>
          <div className="flex items-center gap-2 sm:ml-auto">
            <Badge variant="secondary" className="text-xs">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Actual: {currentInterval || 'Cargando...'}
            </Badge>
            {/* Indicador de estado del componente */}
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${hasError ? 'bg-red-500' : 'bg-green-500'} animate-pulse`} />
              <span className="text-xs text-gray-500 hidden sm:inline">
                {hasError ? 'Error' : 'Activo'}
              </span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        {/* Debug info */}
        <div className="text-xs text-gray-400 mb-4 p-2 bg-gray-50 rounded overflow-x-auto">
          <div className="whitespace-nowrap">
            📊 Gráfico: {chartData.length} puntos | 
            📋 Tabla: {filteredVehicleData.length} registros | 
            🔄 Cargando: {loading ? 'Sí' : 'No'} | 
            ⚠️ Error: {error ? 'Sí' : 'No'}
          </div>
        </div>
        
        {/* Gráfico de UCP */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">UCP por Intervalo</h3>
          <div className="w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height={250} minWidth={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="interval" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={10}
                  interval="preserveStartEnd"
                />
                <YAxis fontSize={10} />
                <Tooltip formatter={formatTooltip} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line 
                  type="monotone" 
                  dataKey="totalUCP" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="UCP Total"
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabla con filtros de vehículos */}
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-semibold">Vehículos por Intervalo y Segmento</h3>
          
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-col flex-1 min-w-[200px]">
              <label className="text-xs sm:text-sm font-medium mb-1">Intervalo:</label>
              <select 
                className="px-2 sm:px-3 py-2 border rounded-md w-full text-sm"
                value={selectedInterval}
                onChange={(e) => setSelectedInterval(e.target.value)}
              >
                <option value="">Intervalo actual ({currentInterval})</option>
                {allIntervals.map(interval => (
                  <option key={interval} value={interval}>{interval}</option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col flex-1 min-w-[200px]">
              <label className="text-xs sm:text-sm font-medium mb-1">Segmento:</label>
              <select 
                className="px-2 sm:px-3 py-2 border rounded-md w-full text-sm"
                value={selectedSegment}
                onChange={(e) => setSelectedSegment(e.target.value)}
              >
                <option value="">Todos los segmentos</option>
                {allSegments.map(segment => (
                  <option key={segment.id} value={segment.id}>{segment.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={handleSearchClick}
                disabled={tableLoading}
                className="px-3 sm:px-4 py-2 w-full sm:w-auto text-sm"
              >
                {tableLoading ? 'Cargando...' : 'Buscar'}
              </Button>
            </div>
          </div>

          {/* Tabla de resultados */}
          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-96 overflow-y-auto overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium">Intervalo</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium">Segmento</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium">Total Veh.</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium">UCP</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium">Ocupación</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicleData.map((row, index) => {
                    // Validación adicional para prevenir errores
                    const safeRow = {
                      ...row,
                      autos: row.autos ?? 0,
                      buses: row.buses ?? 0,
                      motos: row.motos ?? 0,
                      camionetas: row.camionetas ?? 0,
                      totalVehicles: row.totalVehicles ?? 0,
                      ucp: row.ucp ?? 0,
                      ocupacion: row.ocupacion ?? 0
                    };
                    
                    return (
                    <React.Fragment key={`${row.interval}-${row.segmentId}-${index}`}>
                      <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm truncate max-w-[100px]">{safeRow.interval}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm truncate max-w-[150px]">{safeRow.segmentName}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium">{safeRow.totalVehicles}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">{safeRow.ucp.toFixed(1)}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                          <Badge 
                            variant="secondary" 
                            className={`${getOcupacionColor(safeRow.ocupacion)} text-white text-xs`}
                          >
                            {safeRow.ocupacion.toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleRowDetail(index)}
                            className="flex items-center gap-1 text-xs px-2 py-1"
                          >
                            {expandedRows.has(index) ? 
                              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" /> : 
                              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                            }
                            <span className="hidden sm:inline">Detalle</span>
                          </Button>
                        </td>
                      </tr>
                      
                      {expandedRows.has(index) && (
                        <tr>
                          <td colSpan={6} className="px-2 sm:px-4 py-2 sm:py-3 bg-gray-100">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                              <div className="text-center p-2 sm:p-3 bg-white rounded border">
                                <div className="text-lg sm:text-2xl font-bold text-blue-600">{safeRow.autos}</div>
                                <div className="text-xs sm:text-sm text-gray-600">Autos</div>
                              </div>
                              <div className="text-center p-2 sm:p-3 bg-white rounded border">
                                <div className="text-lg sm:text-2xl font-bold text-red-600">{safeRow.buses}</div>
                                <div className="text-xs sm:text-sm text-gray-600">Buses</div>
                              </div>
                              <div className="text-center p-2 sm:p-3 bg-white rounded border">
                                <div className="text-lg sm:text-2xl font-bold text-green-600">{safeRow.motos}</div>
                                <div className="text-xs sm:text-sm text-gray-600">Motos</div>
                              </div>
                              <div className="text-center p-2 sm:p-3 bg-white rounded border">
                                <div className="text-lg sm:text-2xl font-bold text-yellow-600">{safeRow.camionetas}</div>
                                <div className="text-xs sm:text-sm text-gray-600">Camionetas</div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )})}
                </tbody>
              </table>
              
              {filteredVehicleData.length === 0 && !tableLoading && (
                <div className="text-center py-6 sm:py-8 text-gray-500 text-sm">
                  {selectedInterval || currentInterval ? 
                    'No se encontraron datos para los filtros seleccionados' :
                    'Selecciona un intervalo para ver los datos'
                  }
                </div>
              )}
              
              {tableLoading && (
                <div className="text-center py-6 sm:py-8 text-gray-500 text-sm">
                  Cargando datos de vehículos...
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}