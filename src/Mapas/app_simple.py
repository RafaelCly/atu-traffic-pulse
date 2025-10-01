from flask import Flask, jsonify, render_template
from flask_cors import CORS
import random
import os
import time
import threading

app = Flask(__name__)

# Configurar CORS
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "https://atu-traffic-pulse-frontend.onrender.com",
            "http://localhost:5173",
            "http://localhost:8080"
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Datos mock de segmentos
SEGMENTS = [
    "1 - Av. Pachacutec VTM -> SJM",
    "2 - Av. Pachacutec VTM -> SJM",
    "3 - Av. Pachacutec VTM -> SJM",
    "1 - Av. Pachacutec SJM -> VTM",
    "2 - Av. Pachacutec SJM -> VTM",
    "3 - Av. Pachacutec SJM -> VTM"
]

INTERVALS = [
    '06:00 - 06:15', '06:15 - 06:30', '06:30 - 06:45', '06:45 - 07:00',
    '07:00 - 07:15', '07:15 - 07:30', '07:30 - 07:45', '07:45 - 08:00',
    '08:00 - 08:15', '08:15 - 08:30', '08:30 - 08:45', '08:45 - 09:00',
]

# Estado global que cambia con el tiempo
current_step = 0
segment_states = {}

# Coordenadas de los segmentos de Av. Pachacutec
SEGMENT_COORDS = {
    "1 - Av. Pachacutec VTM -> SJM": [
        [-12.180248, -76.943505],
        [-12.178283, -76.944721]
    ],
    "2 - Av. Pachacutec VTM -> SJM": [
        [-12.178283, -76.944721],
        [-12.175114, -76.946517]
    ],
    "3 - Av. Pachacutec VTM -> SJM": [
        [-12.175114, -76.946517],
        [-12.172546, -76.948311]
    ],
    "1 - Av. Pachacutec SJM -> VTM": [
        [-12.172839, -76.948411],
        [-12.175273, -76.946697]
    ],
    "2 - Av. Pachacutec SJM -> VTM": [
        [-12.175273, -76.946697],
        [-12.178550, -76.944770]
    ],
    "3 - Av. Pachacutec SJM -> VTM": [
        [-12.178550, -76.944770],
        [-12.180411, -76.943712]
    ]
}

def initialize_segments():
    """Inicializa los estados de los segmentos"""
    global segment_states
    for segment in SEGMENTS:
        segment_states[segment] = {
            'occupancy': random.uniform(60, 85),
            'vehicles': {
                'Auto': random.randint(20, 60),
                'Taxi': random.randint(10, 30),
                'Omnibus': random.randint(3, 10),
                'Microbús': random.randint(5, 15),
                'Camioneta rural': random.randint(8, 20),
                'Moto lineal': random.randint(15, 35),
                'Mototaxi': random.randint(10, 25),
                'Bicicleta': random.randint(5, 15),
                'Camión': random.randint(3, 12),
                'Tráiler': random.randint(1, 5),
                'Bus Interprovincial': random.randint(2, 8)
            },
            'ucp_density': random.uniform(80, 180)
        }

def update_simulation():
    """Actualiza la simulación cada 10 segundos"""
    global current_step
    while True:
        time.sleep(10)
        current_step = (current_step + 1) % len(INTERVALS)
        
        # Actualizar estados de segmentos con variación realista
        for segment in SEGMENTS:
            # Variar ocupación basada en la hora
            hour = int(INTERVALS[current_step].split(':')[0])
            if 7 <= hour <= 9:  # Hora pico
                base_occupancy = random.uniform(75, 95)
            elif 10 <= hour <= 11:
                base_occupancy = random.uniform(60, 75)
            else:
                base_occupancy = random.uniform(50, 70)
            
            segment_states[segment]['occupancy'] = base_occupancy
            segment_states[segment]['ucp_density'] = random.uniform(
                base_occupancy * 0.8, 
                base_occupancy * 1.2
            )
            
            # Actualizar vehículos
            for vtype in segment_states[segment]['vehicles']:
                multiplier = base_occupancy / 70  # Factor basado en ocupación
                base = {
                    'Auto': 40, 'Taxi': 20, 'Omnibus': 7, 'Microbús': 10,
                    'Camioneta rural': 14, 'Moto lineal': 25, 'Mototaxi': 17,
                    'Bicicleta': 10, 'Camión': 7, 'Tráiler': 3, 'Bus Interprovincial': 5
                }
                segment_states[segment]['vehicles'][vtype] = int(
                    base.get(vtype, 10) * multiplier * random.uniform(0.8, 1.2)
                )

# Inicializar al arrancar
initialize_segments()

# Iniciar thread de simulación
simulation_thread = threading.Thread(target=update_simulation, daemon=True)
simulation_thread.start()

@app.route('/')
def index():
    # Intentar renderizar el template HTML si existe
    if os.path.exists('templates/map.html'):
        return render_template('map.html')
    # Si no, mostrar página simple
    return '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>ATU Traffic Pulse Backend</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
            h1 { color: #333; }
            .status { background: #4CAF50; color: white; padding: 10px; border-radius: 5px; }
            .endpoints { background: #f4f4f4; padding: 15px; border-radius: 5px; margin-top: 20px; }
            code { background: #ddd; padding: 2px 5px; border-radius: 3px; }
        </style>
    </head>
    <body>
        <h1>🚦 ATU Traffic Pulse Backend API</h1>
        <div class="status">✅ Status: Running</div>
        <div class="endpoints">
            <h3>Available Endpoints:</h3>
            <ul>
                <li><code>GET /api/kpis</code> - Traffic KPIs</li>
                <li><code>GET /api/traffic_data</code> - Segment data</li>
                <li><code>GET /api/debug</code> - Debug information</li>
                <li><code>GET /api/current_interval</code> - Current time interval</li>
                <li><code>GET /api/intervals</code> - All intervals</li>
                <li><code>GET /api/ucp_by_interval</code> - UCP data</li>
                <li><code>GET /api/vehicles_by_interval_and_segment</code> - Vehicle details</li>
            </ul>
        </div>
        <p><strong>Note:</strong> This is a simplified version using mock data for faster performance.</p>
    </body>
    </html>
    '''

@app.route('/health')
def health():
    return jsonify({'status': 'ok'}), 200

@app.route('/api/status')
def status():
    return jsonify({
        'status': 'ready',
        'road_segments_loaded': 150,
        'sections_loaded': 6,
        'traffic_data_loaded': True,
        'intervals_count': len(INTERVALS)
    }), 200

@app.route('/api/kpis')
def get_kpis():
    # Calcular KPIs basados en estados actuales
    total_occupancy = sum(seg['occupancy'] for seg in segment_states.values()) / len(segment_states)
    red_count = sum(1 for seg in segment_states.values() if seg['occupancy'] > 80)
    congestion = (red_count / len(segment_states)) * 100
    
    return jsonify({
        'overall_occupancy_percentage': round(total_occupancy, 2),
        'congestion_percentage': round(congestion, 2),
        'red_segments_count': red_count,
        'total_segments_count': len(SEGMENTS)
    })

@app.route('/api/traffic_data')
def get_traffic_data():
    data = []
    for segment_name, state in segment_states.items():
        data.append({
            'segment_name': segment_name,
            'direction': 'VMT→SJM' if 'VTM -> SJM' in segment_name else 'SJM→VMT',
            'vehicle_counts': state['vehicles'],
            'ucp_density': round(state['ucp_density'], 2),
            'occupancy_percentage': round(state['occupancy'], 2),
            'total_vehicles': sum(state['vehicles'].values())
        })
    return jsonify(data)

@app.route('/api/road_data')
def get_road_data():
    """Retorna segmentos de ruta con colores basados en ocupación"""
    roads = []
    segment_id = 0
    
    for segment_name, state in segment_states.items():
        occupancy = state['occupancy']
        
        # Determinar color basado en ocupación
        if occupancy <= 50:
            color = 'green'
        elif occupancy <= 80:
            color = 'yellow'
        else:
            color = 'red'
        
        roads.append({
            'id': f'segment_{segment_id}',
            'name': segment_name,
            'coords': SEGMENT_COORDS.get(segment_name, []),
            'color': color,
            'length': 1000,  # Metros aproximados
            'occupancy': round(occupancy, 2),
            'vehicles': sum(state['vehicles'].values()),
            'ucp': round(state['ucp_density'], 2)
        })
        segment_id += 1
    
    return jsonify(roads)

@app.route('/api/debug')
def debug_info():
    sections_info = []
    for segment_name, state in segment_states.items():
        sections_info.append({
            'name': segment_name,
            'ucp': round(state['ucp_density'], 2),
            'vehicles': sum(state['vehicles'].values())
        })
    
    return jsonify({
        'total_segments_in_polygon': 150,
        'total_route_sections': len(SEGMENTS),
        'current_simulation_step': current_step,
        'current_interval': INTERVALS[current_step % len(INTERVALS)],
        'sections_info': sections_info
    })

@app.route('/api/current_interval')
def get_current_interval():
    return jsonify({
        'current_interval': INTERVALS[current_step % len(INTERVALS)],
        'simulation_step': current_step,
        'total_intervals': len(INTERVALS)
    })

@app.route('/api/intervals')
def get_all_intervals():
    return jsonify({
        'intervals': INTERVALS,
        'current_step': current_step
    })

@app.route('/api/ucp_by_interval')
def get_ucp_by_interval():
    current_interval = INTERVALS[current_step % len(INTERVALS)]
    data = []
    for interval in INTERVALS:
        data.append({
            'interval': interval,
            'total_ucp': random.uniform(600, 900) if interval == current_interval else 0
        })
    return jsonify(data)

@app.route('/api/vehicles_by_interval_and_segment')
def get_vehicles_by_interval():
    interval = INTERVALS[current_step % len(INTERVALS)]
    data = []
    
    for segment_name, state in segment_states.items():
        vehicles = state['vehicles']
        data.append({
            'segment_id': segment_name,
            'segment_name': segment_name,
            'autos': vehicles.get('Auto', 0) + vehicles.get('Taxi', 0),
            'buses': vehicles.get('Omnibus', 0) + vehicles.get('Microbús', 0) + vehicles.get('Bus Interprovincial', 0),
            'motos': vehicles.get('Moto lineal', 0) + vehicles.get('Mototaxi', 0) + vehicles.get('Bicicleta', 0),
            'camionetas': vehicles.get('Camioneta rural', 0) + vehicles.get('Camión', 0) + vehicles.get('Tráiler', 0),
            'total_vehicles': sum(vehicles.values()),
            'ucp': round(state['ucp_density'], 2),
            'ocupacion': round(state['occupancy'], 2)
        })
    return jsonify(data)

if __name__ == '__main__':
    print("🚀 Iniciando servidor simplificado...")
    print("✅ Servidor listo en modo mock")
    app.run(host='0.0.0.0', port=5000, debug=False)
