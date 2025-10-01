// Servicio para conectar con el mapa Python y obtener datos reales
export interface TrafficKPIs {
  overallOccupancyPercentage: number;
  congestionPercentage: number;
  redSegmentsCount: number;
  totalSegmentsCount: number;
  averageTravelTime: number;
}

export interface TrafficSegment {
  segment_name: string;
  direction: string;
  vehicle_counts: Record<string, number>;
  ucp_density: number;
  occupancy_percentage: number;
  total_vehicles: number;
}

export interface DebugInfo {
  total_segments_in_polygon: number;
  total_route_sections: number;
  current_simulation_step: number;
  current_interval: string;
  sections_info: Array<{
    name: string;
    ucp: number;
    vehicles: number;
  }>;
}

export interface CurrentInterval {
  current_interval: string;
  simulation_step: number;
  total_intervals: number;
}

export interface UCPByInterval {
  interval: string;
  total_ucp: number;
}

export interface VehicleDetailByInterval {
  interval: string;
  segment: string;
  vehicle_counts: Record<string, number>;
  total_vehicles: number;
  ucp_density: number;
  occupancy_percentage: number;
}

export interface VehicleByIntervalAndSegment {
  segment_id: string;
  segment_name: string;
  autos: number;
  buses: number;
  motos: number;
  camionetas: number;
  total_vehicles: number;
  ucp: number;
  ocupacion: number;
}

// Detectar si estamos en producción o desarrollo
const isProd = import.meta.env.PROD;
const PYTHON_MAP_BASE_URL = isProd 
  ? 'https://atu-traffic-pulse-backend.onrender.com'
  : 'http://localhost:5000';

const REQUEST_TIMEOUT = 30000; // 30 segundos timeout (Render puede tardar en "despertar")
const MAX_RETRIES = 3; // Número de reintentos antes de fallar

// Función helper para agregar timeout a fetch con reintentos
const fetchWithTimeout = async (url: string, timeout = REQUEST_TIMEOUT, retries = MAX_RETRIES): Promise<Response> => {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      console.log(`Intento ${attempt + 1}/${retries} para ${url}`);
      const response = await fetch(url, { 
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log(`✅ Petición exitosa a ${url}`);
        return response;
      }
      
      // Si el servidor responde pero con error, no reintentar
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error as Error;
      
      // Si es el último intento, lanzar el error
      if (attempt === retries - 1) {
        console.error(`❌ Falló después de ${retries} intentos: ${lastError.message}`);
        throw lastError;
      }
      
      // Esperar antes del siguiente intento (backoff exponencial)
      const waitTime = Math.min(1000 * Math.pow(2, attempt), 5000);
      console.log(`⏳ Reintentando en ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError || new Error('Failed after retries');
};

class TrafficService {
  private isServerRunning = false;
  private serverCheckInProgress = false;

  async checkServerStatus(): Promise<boolean> {
    // Evitar múltiples checks simultáneos
    if (this.serverCheckInProgress) {
      return this.isServerRunning;
    }
    
    this.serverCheckInProgress = true;
    
    try {
      console.log('🔍 Verificando estado del servidor backend...');
      const response = await fetchWithTimeout(`${PYTHON_MAP_BASE_URL}/api/debug`, 30000, 3);
      this.isServerRunning = response.ok;
      console.log(`✅ Servidor backend: ${this.isServerRunning ? 'CONECTADO' : 'NO DISPONIBLE'}`);
      return this.isServerRunning;
    } catch (error) {
      console.error('❌ Error al verificar servidor backend:', error);
      this.isServerRunning = false;
      return false;
    } finally {
      this.serverCheckInProgress = false;
    }
  }

  async getKPIs(): Promise<TrafficKPIs | null> {
    try {
      console.log('📊 Obteniendo KPIs del backend...');
      const response = await fetchWithTimeout(`${PYTHON_MAP_BASE_URL}/api/kpis`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch KPIs: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ KPIs obtenidos:', data);
      
      // Calcular tiempo promedio de viaje basado en la congestión
      const averageTravelTime = this.calculateAverageTravelTime(data.congestion_percentage);

      return {
        overallOccupancyPercentage: data.overall_occupancy_percentage || 0,
        congestionPercentage: data.congestion_percentage || 0,
        redSegmentsCount: data.red_segments_count || 0,
        totalSegmentsCount: data.total_segments_count || 0,
        averageTravelTime
      };
    } catch (error) {
      console.error('❌ Error al obtener KPIs del servidor Python:', error);
      // NO devolver datos mock - dejar que la UI maneje el error
      return null;
    }
  }

  async getTrafficSegments(): Promise<TrafficSegment[]> {
    try {
      console.log('🚦 Obteniendo segmentos de tráfico del backend...');
      const response = await fetchWithTimeout(`${PYTHON_MAP_BASE_URL}/api/traffic_data`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch traffic segments: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ ${data.length} segmentos obtenidos`);
      return data;
    } catch (error) {
      console.error('❌ Error al obtener segmentos de tráfico:', error);
      return [];
    }
  }

  async getDebugInfo(): Promise<DebugInfo | null> {
    try {
      console.log('🔧 Obteniendo información de debug...');
      const response = await fetchWithTimeout(`${PYTHON_MAP_BASE_URL}/api/debug`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch debug info: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Debug info obtenida:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al obtener debug info:', error);
      return null;
    }
  }

  // NUEVOS MÉTODOS PARA INTERVALOS

  async getCurrentInterval(): Promise<CurrentInterval> {
    try {
      console.log('⏰ Obteniendo intervalo actual...');
      const response = await fetchWithTimeout(`${PYTHON_MAP_BASE_URL}/api/current_interval`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch current interval: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Intervalo actual:', data.current_interval);
      return data;
    } catch (error) {
      console.error('❌ Error al obtener intervalo actual:', error);
      // Devolver un valor por defecto seguro
      return {
        current_interval: 'Cargando...',
        simulation_step: 0,
        total_intervals: 0
      };
    }
  }

  async getAllIntervals(): Promise<string[]> {
    try {
      console.log('📅 Obteniendo todos los intervalos...');
      const response = await fetchWithTimeout(`${PYTHON_MAP_BASE_URL}/api/intervals`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch intervals: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ ${data.intervals?.length || 0} intervalos obtenidos`);
      return data.intervals || [];
    } catch (error) {
      console.error('❌ Error al obtener intervalos:', error);
      return [];
    }
  }

  async getUCPByInterval(): Promise<UCPByInterval[]> {
    try {
      console.log('📈 Obteniendo UCP por intervalo...');
      const response = await fetchWithTimeout(`${PYTHON_MAP_BASE_URL}/api/ucp_by_interval`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch UCP by interval: ${response.status}`);
      }

      const data = await response.json();
      
      // Asegurar que todos los valores sean seguros
      const result = data.map((item: Record<string, unknown>) => ({
        interval: String(item.interval || ''),
        total_ucp: Number(item.total_ucp) || 0
      }));
      
      console.log(`✅ ${result.length} registros UCP obtenidos`);
      return result;
    } catch (error) {
      console.error('❌ Error al obtener UCP por intervalo:', error);
      return [];
    }
  }

  async getVehiclesByIntervalAndSegment(interval: string): Promise<VehicleByIntervalAndSegment[]> {
    try {
      console.log(`🚗 Obteniendo vehículos para intervalo: ${interval}...`);
      const response = await fetchWithTimeout(
        `${PYTHON_MAP_BASE_URL}/api/vehicles_by_interval_and_segment?interval=${encodeURIComponent(interval)}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Asegurar que todos los valores numéricos existan
      const result = data.map((item: Record<string, unknown>) => ({
        segment_id: String(item.segment_id || ''),
        segment_name: String(item.segment_name || ''),
        autos: Number(item.autos) || 0,
        buses: Number(item.buses) || 0,
        motos: Number(item.motos) || 0,
        camionetas: Number(item.camionetas) || 0,
        total_vehicles: Number(item.total_vehicles) || 0,
        ucp: Number(item.ucp) || 0,
        ocupacion: Number(item.ocupacion) || 0
      }));
      
      console.log(`✅ ${result.length} registros de vehículos obtenidos`);
      return result;
    } catch (error) {
      console.error('❌ Error al obtener vehículos por intervalo y segmento:', error);
      return [];
    }
  }

  async getVehicleDetailsByInterval(): Promise<VehicleDetailByInterval[]> {
    try {
      console.log('🔍 Obteniendo detalles de vehículos...');
      const response = await fetchWithTimeout(`${PYTHON_MAP_BASE_URL}/api/vehicles_by_interval_and_segment`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch vehicle details: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ ${data.length} registros de detalles obtenidos`);
      return data;
    } catch (error) {
      console.error('❌ Error al obtener detalles de vehículos:', error);
      return [];
    }
  }

  // Generar datos de UCP por intervalo para la gráfica
  async getUCPByIntervalForChart(): Promise<Array<{ interval: string; ucp: number }>> {
    try {
      console.log('📊 Generando datos UCP para gráficos...');
      const ucpData = await this.getUCPByInterval();
      const result = ucpData.map(data => ({
        interval: data.interval,
        ucp: data.total_ucp
      }));
      console.log(`✅ ${result.length} puntos de datos UCP generados`);
      return result;
    } catch (error) {
      console.error('❌ Error al generar datos UCP para gráficos:', error);
      return [];
    }
  }

  // Generar datos detallados por segmento e intervalo para la tabla
  async getDetailedTrafficDataByInterval(): Promise<Array<{ id: number; interval: string; vehiculos: number; segmento: string; vehicle_details: Record<string, number> }>> {
    try {
      console.log('📋 Generando datos detallados por intervalo...');
      const details = await this.getVehicleDetailsByInterval();
      
      const result = details.map((detail, index) => ({
        id: index + 1,
        interval: detail.interval,
        vehiculos: detail.total_vehicles,
        segmento: detail.segment,
        vehicle_details: detail.vehicle_counts
      }));
      
      console.log(`✅ ${result.length} registros detallados generados`);
      return result;
    } catch (error) {
      console.error('❌ Error al generar datos detallados por intervalo:', error);
      return [];
    }
  }

  // Generar datos detallados por segmento y hora para la tabla (método legacy)
  async getDetailedTrafficData(): Promise<Array<{ id: number; hora: string; vehiculos: number; segmento: string }>> {
    try {
      console.log('📋 Generando datos detallados...');
      const segments = await this.getTrafficSegments();
      
      if (segments.length === 0) {
        console.warn('⚠️ No hay segmentos disponibles');
        return [];
      }

      // Convertir datos reales de segmentos a formato de tabla
      const detailedData: Array<{ id: number; hora: string; vehiculos: number; segmento: string }> = [];
      const hours = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00'];
      
      segments.forEach((segment, segmentIndex) => {
        // Usar el nombre real del segmento del Python
        const segmentName = segment.segment_name;
        
        hours.forEach((hour, hourIndex) => {
          const id = segmentIndex * hours.length + hourIndex + 1;
          
          // Simular variación horaria basada en el total actual de vehículos
          const currentVehicles = segment.total_vehicles;
          const timeMultiplier = this.getTimeMultiplier(hour);
          const vehicles = Math.round(currentVehicles * timeMultiplier);
          
          detailedData.push({
            id,
            hora: hour,
            vehiculos: vehicles,
            segmento: segmentName
          });
        });
      });

      console.log(`✅ ${detailedData.length} registros generados`);
      return detailedData;
    } catch (error) {
      console.error('❌ Error al generar datos detallados:', error);
      return [];
    }
  }

  // MÉTODOS MOCK PARA INTERVALOS

  private getMockCurrentInterval(): CurrentInterval {
    const intervals = this.getMockIntervals();
    const currentIndex = Math.floor(Math.random() * intervals.length);
    return {
      current_interval: intervals[currentIndex],
      simulation_step: currentIndex + 1,
      total_intervals: intervals.length
    };
  }

  private getMockVehiclesByInterval(interval: string): VehicleByIntervalAndSegment[] {
    const segments = [
      '1 - Av. Pachacutec VTM -> SJM',
      '2 - Av. Pachacutec VTM -> SJM', 
      '3 - Av. Pachacutec VTM -> SJM',
      '1 - Av. Pachacutec SJM -> VTM',
      '2 - Av. Pachacutec SJM -> VTM',
      '3 - Av. Pachacutec SJM -> VTM'
    ];
    
    return segments.map(segment => ({
      segment_id: segment,
      segment_name: segment,
      autos: Math.floor(Math.random() * 50) + 20,
      buses: Math.floor(Math.random() * 8) + 2,
      motos: Math.floor(Math.random() * 30) + 10,
      camionetas: Math.floor(Math.random() * 12) + 5,
      total_vehicles: Math.floor(Math.random() * 100) + 50,
      ucp: Math.floor(Math.random() * 150) + 80,
      ocupacion: Math.floor(Math.random() * 40) + 60
    }));
  }

  private getMockIntervals(): string[] {
    return [
      '06:00 - 06:15', '06:15 - 06:30', '06:30 - 06:45', '06:45 - 07:00',
      '07:00 - 07:15', '07:15 - 07:30', '07:30 - 07:45', '07:45 - 08:00',
      '08:00 - 08:15', '08:15 - 08:30', '08:30 - 08:45', '08:45 - 09:00',
      '09:00 - 09:15', '09:15 - 09:30', '09:30 - 09:45', '09:45 - 10:00',
      '10:00 - 10:15', '10:15 - 10:30', '10:30 - 10:45', '10:45 - 11:00',
      '11:00-11:15', '11:15 - 11:30', '11:30 - 11:45', '11:45 - 12:00'
    ];
  }

  private getMockUCPByInterval(): UCPByInterval[] {
    const intervals = this.getMockIntervals();
    const currentInterval = intervals[Math.floor(Math.random() * intervals.length)];
    
    return intervals.map(interval => ({
      interval,
      total_ucp: interval === currentInterval ? 750 : 0
    }));
  }

  private getMockVehicleDetails(): VehicleDetailByInterval[] {
    const intervals = this.getMockIntervals();
    const segments = [
      '1 - Av. Pachacutec VTM -> SJM',
      '2 - Av. Pachacutec VTM -> SJM', 
      '3 - Av. Pachacutec VTM -> SJM',
      '1 - Av. Pachacutec SJM -> VTM',
      '2 - Av. Pachacutec SJM -> VTM',
      '3 - Av. Pachacutec SJM -> VTM'
    ];
    const currentInterval = intervals[Math.floor(Math.random() * intervals.length)];
    
    const details: VehicleDetailByInterval[] = [];
    
    intervals.forEach(interval => {
      segments.forEach(segment => {
        const isCurrentInterval = interval === currentInterval;
        details.push({
          interval,
          segment,
          vehicle_counts: isCurrentInterval ? {
            'Auto': Math.floor(Math.random() * 50) + 20,
            'Taxi': Math.floor(Math.random() * 30) + 10,
            'Omnibus': Math.floor(Math.random() * 8) + 2,
            'Microbús': Math.floor(Math.random() * 12) + 5
          } : {
            'Auto': 0, 'Taxi': 0, 'Omnibus': 0, 'Microbús': 0
          },
          total_vehicles: isCurrentInterval ? Math.floor(Math.random() * 100) + 50 : 0,
          ucp_density: isCurrentInterval ? Math.floor(Math.random() * 150) + 80 : 0,
          occupancy_percentage: isCurrentInterval ? Math.floor(Math.random() * 40) + 60 : 0
        });
      });
    });
    
    return details;
  }

  private getMockDetailedDataByInterval() {
    const mockDetails = this.getMockVehicleDetails();
    return mockDetails.map((detail, index) => ({
      id: index + 1,
      interval: detail.interval,
      vehiculos: detail.total_vehicles,
      segmento: detail.segment,
      vehicle_details: detail.vehicle_counts
    }));
  }

  private getTimeMultiplier(hour: string): number {
    const hourNum = parseInt(hour.split(':')[0]);
    // Multiplicadores basados en patrones reales de tráfico
    const multipliers: Record<number, number> = {
      6: 0.5,   // 50% del tráfico normal
      7: 0.8,   // 80% del tráfico normal
      8: 1.2,   // 120% del tráfico normal (hora pico)
      9: 1.0,   // 100% del tráfico normal
      10: 0.7,  // 70% del tráfico normal
      11: 0.6,  // 60% del tráfico normal
      12: 0.9   // 90% del tráfico normal
    };
    
    return multipliers[hourNum] || 1.0;
  }

  private calculateAverageTravelTime(congestionPercentage: number): number {
    // Tiempo base: 25 minutos
    // Incremento por congestión: hasta 15 minutos adicionales
    const baseTime = 25;
    const congestionDelay = (congestionPercentage / 100) * 15;
    return Math.round(baseTime + congestionDelay);
  }

  private getMockKPIs(): TrafficKPIs {
    return {
      overallOccupancyPercentage: 77,
      congestionPercentage: 65,
      redSegmentsCount: 2,
      totalSegmentsCount: 6,
      averageTravelTime: 35
    };
  }

  private getMockUCPData() {
    return [
      { hour: '06:00', ucp: 450 },
      { hour: '07:00', ucp: 820 },
      { hour: '08:00', ucp: 1200 },
      { hour: '09:00', ucp: 980 },
      { hour: '10:00', ucp: 750 },
      { hour: '11:00', ucp: 680 },
      { hour: '12:00', ucp: 890 },
    ];
  }

  private getMockDetailedData() {
    // Usar los nombres reales de los segmentos del Python como fallback
    const realSegmentNames = [
      '1 - Av. Pachacutec VTM -> SJM',
      '2 - Av. Pachacutec VTM -> SJM', 
      '3 - Av. Pachacutec VTM -> SJM',
      '1 - Av. Pachacutec SJM -> VTM',
      '2 - Av. Pachacutec SJM -> VTM',
      '3 - Av. Pachacutec SJM -> VTM'
    ];
    
    const mockData = [];
    const hours = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00'];
    
    realSegmentNames.forEach((segmento, segmentIndex) => {
      hours.forEach((hora, hourIndex) => {
        const id = segmentIndex * hours.length + hourIndex + 1;
        const baseVehicles = 80 + (segmentIndex * 20); // Variación por segmento
        const timeMultiplier = this.getTimeMultiplier(hora);
        const vehiculos = Math.round(baseVehicles * timeMultiplier);
        
        mockData.push({
          id,
          hora,
          vehiculos,
          segmento
        });
      });
    });
    
    return mockData;
  }

  isServerAvailable(): boolean {
    return this.isServerRunning;
  }
}

export const trafficService = new TrafficService();