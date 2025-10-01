from flask import Flask, jsonify, render_template
from flask_cors import CORS
import random
import os

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

current_step = 0

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
    return jsonify({
        'overall_occupancy_percentage': random.uniform(65, 85),
        'congestion_percentage': random.uniform(55, 75),
        'red_segments_count': random.randint(1, 3),
        'total_segments_count': 6
    })

@app.route('/api/traffic_data')
def get_traffic_data():
    data = []
    for segment in SEGMENTS:
        occupancy = random.uniform(60, 95)
        data.append({
            'segment_name': segment,
            'direction': 'VMT→SJM' if 'VTM -> SJM' in segment else 'SJM→VMT',
            'vehicle_counts': {
                'Auto': random.randint(20, 60),
                'Taxi': random.randint(10, 30),
                'Omnibus': random.randint(3, 10),
                'Microbús': random.randint(5, 15)
            },
            'ucp_density': random.uniform(80, 180),
            'occupancy_percentage': occupancy,
            'total_vehicles': random.randint(50, 120)
        })
    return jsonify(data)

@app.route('/api/road_data')
def get_road_data():
    # Retornar segmentos de ruta simplificados
    return jsonify([])

@app.route('/api/debug')
def debug_info():
    return jsonify({
        'total_segments_in_polygon': 150,
        'total_route_sections': 6,
        'current_simulation_step': current_step,
        'current_interval': INTERVALS[current_step % len(INTERVALS)],
        'sections_info': [
            {'name': seg, 'ucp': random.uniform(80, 180), 'vehicles': random.randint(50, 120)}
            for seg in SEGMENTS
        ]
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
    for segment in SEGMENTS:
        data.append({
            'segment_id': segment,
            'segment_name': segment,
            'autos': random.randint(20, 60),
            'buses': random.randint(3, 12),
            'motos': random.randint(10, 30),
            'camionetas': random.randint(5, 20),
            'total_vehicles': random.randint(50, 120),
            'ucp': random.uniform(80, 180),
            'ocupacion': random.uniform(60, 95)
        })
    return jsonify(data)

if __name__ == '__main__':
    print("🚀 Iniciando servidor simplificado...")
    print("✅ Servidor listo en modo mock")
    app.run(host='0.0.0.0', port=5000, debug=False)
