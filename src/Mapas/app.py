from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import threading
import time
import pandas as pd
import osmnx as ox
import os
from shapely.geometry import Polygon
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Configurar Flask con carpeta estática para las imágenes
app = Flask(__name__, static_folder='../imagenes', static_url_path='/static/imagenes')

# Configurar CORS para permitir el frontend de Render
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

# =================================================================
# CONFIGURACIÓN
# =================================================================
UCP_WEIGHTS = {
    'Auto': 1.0, 'Taxi': 1.0, 'Omnibus': 3.0, 'Microbús': 2.0,
    'Camioneta rural': 1.25, 'Moto lineal': 0.333, 'Mototaxi': 0.75,
    'Bicicleta': 0.333, 'Camión': 2.5, 'Tráiler': 3.5,
    'Bus Interprovincial': 3.0
}

KEY_INTERSECTIONS_IDA = [
    [-12.180248, -76.943505],  # Punto 1
    [-12.178283, -76.944721],  # Punto 2
    [-12.175114, -76.946517],  # Punto 3
    [-12.172546, -76.948311],  # Punto 4
]

KEY_INTERSECTIONS_VUELTA = [
    [-12.172839, -76.948411],  # Punto 4
    [-12.175273, -76.946697],  # Punto 3
    [-12.178550, -76.944770],  # Punto 2
    [-12.180411, -76.943712]   # Punto 1
]

SEGMENT_NAMES = {
    "VMT→SJM": [
        "1 - Av. Pachacutec VTM -> SJM",  # Entre punto 1 y 2
        "2 - Av. Pachacutec VTM -> SJM",  # Entre punto 2 y 3
        "3 - Av. Pachacutec VTM -> SJM"   # Entre punto 3 y 4
    ],
    "SJM→VMT": [
        "1 - Av. Pachacutec SJM -> VTM",  # Entre punto 4 y 3
        "2 - Av. Pachacutec SJM -> VTM",  # Entre punto 3 y 2
        "3 - Av. Pachacutec SJM -> VTM"   # Entre punto 2 y 1
    ]
}

# ✅ MAPEO CORRECTO SEGÚN LA LÓGICA EXPLICADA
# (NroPunto, Sentido) -> (Segmento afectado, Operación)
# Sentido 1: IDA - ENTRADA a intersección (RESTAR del segmento anterior)
# Sentido 2: VUELTA - ENTRADA a intersección (RESTAR del segmento anterior)
# Sentido 3: IDA - SALIDA de intersección (SUMAR al segmento siguiente)
# Sentido 4: VUELTA - SALIDA de intersección (SUMAR al segmento siguiente)

SEGMENT_MAPPING = {
    # === PUNTO 1 (Extremo VMT) ===
    # Solo tiene sentido 2 (llegan de vuelta) y 3 (salen de ida)
    (1, 2): ("3 - Av. Pachacutec SJM -> VTM", -1),  # ENTRAN a punto 1 desde segmento 3 VUELTA
    (1, 3): ("1 - Av. Pachacutec VTM -> SJM", +1),  # SALEN de punto 1 hacia segmento 1 IDA
    
    # === PUNTO 2 ===
    # Sentido 1: llegan de IDA desde segmento 1
    (2, 1): ("1 - Av. Pachacutec VTM -> SJM", -1),  # ENTRAN a punto 2 desde segmento 1 IDA
    # Sentido 2: llegan de VUELTA desde segmento 2
    (2, 2): ("2 - Av. Pachacutec SJM -> VTM", -1),  # ENTRAN a punto 2 desde segmento 2 VUELTA
    # Sentido 3: salen de IDA hacia segmento 2
    (2, 3): ("2 - Av. Pachacutec VTM -> SJM", +1),  # SALEN de punto 2 hacia segmento 2 IDA
    # Sentido 4: salen de VUELTA hacia segmento 3
    (2, 4): ("3 - Av. Pachacutec SJM -> VTM", +1),  # SALEN de punto 2 hacia segmento 3 VUELTA
    
    # === PUNTO 3 ===
    (3, 1): ("2 - Av. Pachacutec VTM -> SJM", -1),  # ENTRAN a punto 3 desde segmento 2 IDA
    (3, 2): ("1 - Av. Pachacutec SJM -> VTM", -1),  # ENTRAN a punto 3 desde segmento 1 VUELTA
    (3, 3): ("3 - Av. Pachacutec VTM -> SJM", +1),  # SALEN de punto 3 hacia segmento 3 IDA
    (3, 4): ("2 - Av. Pachacutec SJM -> VTM", +1),  # SALEN de punto 3 hacia segmento 2 VUELTA
    
    # === PUNTO 4 (Extremo SJM) ===
    # Solo tiene sentido 1 (llegan de ida) y 4 (salen de vuelta)
    (4, 1): ("3 - Av. Pachacutec VTM -> SJM", -1),  # ENTRAN a punto 4 desde segmento 3 IDA
    (4, 4): ("1 - Av. Pachacutec SJM -> VTM", +1),  # SALEN de punto 4 hacia segmento 1 VUELTA
}

ROUTE_POLYGON = Polygon([
    (-76.94355863975865, -12.18080522540366),
    (-76.9428990071678, -12.180607162560918),
    (-76.94334006307575, -12.179922712836785),
    (-76.94429571770476, -12.178458973336589),
    (-76.94484503099531, -12.177591023489583),
    (-76.94536424492756, -12.176686293086448),
    (-76.9458526857877, -12.17580328561742),
    (-76.94820456213188, -12.172334810185774),
    (-76.94907327632758, -12.170901808986514),
    (-76.95086499935601, -12.167850021415546),
    (-76.95259436691164, -12.165433986253731),
    (-76.95667637078154, -12.160155764369861),
    (-76.9575326302631, -12.159535874497408),
    (-76.97851207110256, -12.150930872310184),
    (-76.97884478211589, -12.150956550503054),
    (-76.980511693104, -12.150227570036975),
    (-76.98083774391753, -12.149818078382467),
    (-76.98203186797949, -12.150378347584223),
    (-76.95765399374115, -12.160145797317284),
    (-76.95693651367517, -12.160752397028816),
    (-76.95195760705587, -12.167003830854469),
    (-76.95136005724406, -12.167755623271432),
    (-76.95112234024414, -12.168323687844904),
    (-76.9493331158722, -12.171640214762647),
    (-76.94903944653328, -12.171668850944926),
    (-76.94866434183058, -12.172705097151251),
    (-76.94691855998008, -12.175175997426535),
    (-76.94355863975865, -12.18080522540366)
])

LANES_PER_ROAD = 3
METERS_PER_UCP = 6

# ✅ INVENTARIO INICIAL (Estado de los segmentos a las 6:00 AM)
# Valores estimados: ~30% de la capacidad del segmento
INITIAL_INVENTORY = {
    "1 - Av. Pachacutec VTM -> SJM": {
        'Auto': 20, 'Taxi': 15, 'Omnibus': 5, 'Microbús': 8,
        'Camioneta rural': 10, 'Moto lineal': 12, 'Mototaxi': 18,
        'Bicicleta': 8, 'Camión': 6, 'Tráiler': 2, 'Bus Interprovincial': 3
    },
    "2 - Av. Pachacutec VTM -> SJM": {
        'Auto': 35, 'Taxi': 25, 'Omnibus': 8, 'Microbús': 12,
        'Camioneta rural': 15, 'Moto lineal': 20, 'Mototaxi': 25,
        'Bicicleta': 12, 'Camión': 10, 'Tráiler': 3, 'Bus Interprovincial': 5
    },
    "3 - Av. Pachacutec VTM -> SJM": {
        'Auto': 40, 'Taxi': 30, 'Omnibus': 10, 'Microbús': 15,
        'Camioneta rural': 18, 'Moto lineal': 25, 'Mototaxi': 30,
        'Bicicleta': 15, 'Camión': 12, 'Tráiler': 4, 'Bus Interprovincial': 6
    },
    "1 - Av. Pachacutec SJM -> VTM": {
        'Auto': 35, 'Taxi': 28, 'Omnibus': 8, 'Microbús': 12,
        'Camioneta rural': 16, 'Moto lineal': 22, 'Mototaxi': 28,
        'Bicicleta': 13, 'Camión': 11, 'Tráiler': 3, 'Bus Interprovincial': 5
    },
    "2 - Av. Pachacutec SJM -> VTM": {
        'Auto': 30, 'Taxi': 22, 'Omnibus': 7, 'Microbús': 10,
        'Camioneta rural': 14, 'Moto lineal': 18, 'Mototaxi': 23,
        'Bicicleta': 10, 'Camión': 9, 'Tráiler': 2, 'Bus Interprovincial': 4
    },
    "3 - Av. Pachacutec SJM -> VTM": {
        'Auto': 38, 'Taxi': 26, 'Omnibus': 9, 'Microbús': 13,
        'Camioneta rural': 17, 'Moto lineal': 21, 'Mototaxi': 27,
        'Bicicleta': 14, 'Camión': 10, 'Tráiler': 3, 'Bus Interprovincial': 5
    }
}

road_segments_data = {}
sections = []
traffic_df = None
time_intervals = []
simulation_step = 0

def load_traffic_data():
    global traffic_df, time_intervals
    try:
        file_path = 'data_transito.xlsx'  # Archivo en el directorio actual
        logging.info(f"Cargando datos de tráfico desde '{file_path}'...")
        traffic_df = pd.read_excel(file_path)
        traffic_df.columns = traffic_df.columns.str.strip()
        time_intervals = sorted(traffic_df['HoraControl'].unique())
        logging.info(f"✅ Datos de tráfico cargados. {len(traffic_df)} registros encontrados.")
        logging.info(f"Intervalos de simulación ({len(time_intervals)}): {time_intervals}")
    except FileNotFoundError:
        logging.warning(f"⚠️ ADVERTENCIA: No se encontró el archivo '{file_path}'. El programa funcionará sin datos de tráfico.")
        traffic_df = pd.DataFrame()
        time_intervals = []
    except Exception as e:
        logging.warning(f"⚠️ ADVERTENCIA al leer el archivo Excel: {e}. El programa funcionará sin datos de tráfico.")
        traffic_df = pd.DataFrame()
        time_intervals = []

def load_and_structure_data():
    global road_segments_data, sections
    
    logging.info("=" * 70)
    logging.info("🔄 INICIANDO CARGA DE DATOS DEL MAPA...")
    logging.info("=" * 70)
    logging.info("1. Descargando la red de calles desde OpenStreetMap...")
    logging.info("   (Esto puede tardar 1-2 minutos en la primera ejecución)")
    
    try:
        # Configurar cache de OSMnx
        ox.settings.use_cache = True
        ox.settings.log_console = True
        
        graph = ox.graph_from_polygon(ROUTE_POLYGON, network_type='drive')
        logging.info("✅ Red de calles descargada exitosamente")
    except Exception as e:
        logging.critical(f"❌ ERROR AL DESCARGAR: {e}")
        return
    
    logging.info("2. Procesando edges del grafo...")
    edges_gdf = ox.graph_to_gdfs(graph, nodes=False, edges=True)
    for (u, v, key), edge_data in edges_gdf.iterrows():
        road_id = f"{u}_{v}_{key}"
        road_segments_data[road_id] = {
            'id': road_id,
            'name': str(edge_data.get('name', 'Vía sin nombre')),
            'coords': [[lat, lon] for lon, lat in list(edge_data.geometry.coords)],
            'color': 'gray',
            'length': float(edge_data.get('length', 100))
        }
    logging.info(f"✅ {len(road_segments_data)} segmentos de calles procesados")
    
    logging.info("3. Encontrando nodos clave...")
    try:
        key_nodes_ida = ox.nearest_nodes(graph, 
            [p[1] for p in KEY_INTERSECTIONS_IDA], 
            [p[0] for p in KEY_INTERSECTIONS_IDA])
        key_nodes_vuelta = ox.nearest_nodes(graph, 
            [p[1] for p in KEY_INTERSECTIONS_VUELTA], 
            [p[0] for p in KEY_INTERSECTIONS_VUELTA])
        logging.info("✅ Nodos clave encontrados")
    except Exception as e:
        logging.critical(f"❌ ERROR al encontrar nodos: {e}")
        return

    logging.info("4. Calculando las secciones de la ruta...")
    directions = {"VMT→SJM": key_nodes_ida, "SJM→VMT": key_nodes_vuelta}

    for dir_name, nodes_order in directions.items():
        for i in range(len(nodes_order) - 1):
            start_node, end_node = nodes_order[i], nodes_order[i+1]
            try:
                path_nodes = ox.shortest_path(graph, start_node, end_node, weight='length')
                if not path_nodes:
                    continue
                
                names_for_direction = SEGMENT_NAMES.get(dir_name, [])
                segment_name = names_for_direction[i] if i < len(names_for_direction) else f"Segmento {i+1} ({dir_name})"

                section_info = {
                    "section_id": f"{dir_name}_{i}",
                    "segment_name": segment_name,
                    "direction": dir_name,
                    "edges": set(),
                    "vehicle_counts": {vtype: 0 for vtype in UCP_WEIGHTS.keys()},
                    "ucp_density": 0.0,
                    "total_length_meters": 0.0,
                    "ucp_capacity": 0.0
                }
                
                for j in range(len(path_nodes) - 1):
                    u, v = path_nodes[j], path_nodes[j+1]
                    if graph.has_edge(u, v):
                        for key in graph[u][v]:
                            section_info["edges"].add(f"{u}_{v}_{key}")
                
                if section_info["edges"]:
                    total_length = sum(road_segments_data[edge_id]['length'] 
                                     for edge_id in section_info["edges"])
                    section_info['total_length_meters'] = round(total_length, 2)
                    
                    if METERS_PER_UCP > 0:
                        capacity = (total_length / METERS_PER_UCP) * LANES_PER_ROAD
                        section_info['ucp_capacity'] = round(capacity, 2)
                    
                    # ✅ APLICAR INVENTARIO INICIAL
                    segment_name = section_info['segment_name']
                    if segment_name in INITIAL_INVENTORY:
                        section_info['vehicle_counts'] = INITIAL_INVENTORY[segment_name].copy()
                        initial_vehicles = sum(INITIAL_INVENTORY[segment_name].values())
                        logging.info(f"✅ Sección '{segment_name}' creada con inventario inicial de {initial_vehicles} vehículos. "
                                   f"Longitud: {section_info['total_length_meters']}m, "
                                   f"Capacidad: {section_info['ucp_capacity']} UCP.")
                    else:
                        logging.info(f"✅ Sección '{segment_name}' creada (sin inventario inicial). "
                                   f"Longitud: {section_info['total_length_meters']}m, "
                                   f"Capacidad: {section_info['ucp_capacity']} UCP.")
                    
                    sections.append(section_info)

            except Exception as e:
                logging.error(f"❌ Fallo al calcular la sección {i} ({dir_name}): {e}")

def recalculate_segment_states():
    """Recalcula la densidad UCP y el color para todos los segmentos."""
    for section in sections:
        total_ucp = 0
        for v_type, count in section['vehicle_counts'].items():
            # Ya no necesitamos ajustar negativos aquí, se manejan en update_traffic_periodically
            total_ucp += section['vehicle_counts'][v_type] * UCP_WEIGHTS.get(v_type, 0)
        section['ucp_density'] = round(total_ucp, 2)

        capacity = section.get('ucp_capacity', 0)
        occupancy_percentage = 0
        if capacity > 0:
            occupancy_percentage = (section['ucp_density'] / capacity) * 100

        section['occupancy_percentage'] = round(occupancy_percentage, 2)
        
        new_color = 'gray'
        if occupancy_percentage <= 50:
            new_color = 'green'
        elif 50 < occupancy_percentage <= 80:
            new_color = 'yellow'
        else:
            new_color = 'red'
        
        for road_id in section["edges"]:
            if road_id in road_segments_data:
                road_segments_data[road_id]['color'] = new_color

def update_traffic_periodically():
    """Lógica de simulación con nueva regla de evacuación al 45%."""
    global simulation_step
    while True:
        if traffic_df is None or traffic_df.empty or not time_intervals:
            logging.warning("No hay datos de tráfico para simular. Esperando 10s...")
            time.sleep(10)
            continue

        # REINICIAR CON INVENTARIO INICIAL al inicio del ciclo
        if simulation_step == 0:
            logging.info("🔄 REINICIANDO SIMULACIÓN - Aplicando inventario inicial")
            for section in sections:
                segment_name = section['segment_name']
                if segment_name in INITIAL_INVENTORY:
                    section['vehicle_counts'] = INITIAL_INVENTORY[segment_name].copy()
                else:
                    section['vehicle_counts'] = {vtype: 0 for vtype in UCP_WEIGHTS.keys()}
        
        # 1. Seleccionar intervalo actual
        current_interval = time_intervals[simulation_step]
        logging.info(f"\n{'='*70}\n⏰ INTERVALO: {current_interval}\n{'='*70}")
        
        # 2. Filtrar y procesar datos del Excel
        interval_data = traffic_df[traffic_df['HoraControl'] == current_interval]
        for _, row in interval_data.iterrows():
            key = (int(row['NroPunto']), int(row['Sentido']))
            if key in SEGMENT_MAPPING:
                segment_name, operation = SEGMENT_MAPPING[key]
                v_type = row['TipoVehiculo'].strip()
                quantity = row['Cantidad']
                
                for section in sections:
                    if section['segment_name'] == segment_name:
                        if v_type in section['vehicle_counts']:
                            new_count = section['vehicle_counts'][v_type] + (quantity * operation)
                            # Asegurar que el conteo no sea negativo
                            section['vehicle_counts'][v_type] = max(0, new_count)
                        break
        
        ## <<< LÓGICA ANTERIOR ELIMINADA >>>
        ## Se ha quitado el sistema de evacuación de dos etapas.

        ## <<< NUEVA LÓGICA SIMPLIFICADA >>>
        # 3. VERIFICAR OCUPACIÓN Y APLICAR REDUCCIÓN SI SUPERA EL 100%
        for section in sections:
            # Primero, recalculamos la UCP y el porcentaje con los datos actuales
            current_ucp = sum(section['vehicle_counts'][vt] * UCP_WEIGHTS.get(vt, 0) for vt in section['vehicle_counts'])
            capacity = section.get('ucp_capacity', 0)
            occupancy = 0
            if capacity > 0:
                occupancy = (current_ucp / capacity) * 100
            
            # Si la ocupación supera el 100%, aplicamos la reducción al 45%
            if occupancy > 100:
                logging.info(f"  ⚠️ EVACUACIÓN en '{section['segment_name']}': Ocupación ({occupancy:.1f}%) > 100%. Reduciendo al 45%.")
                for v_type in section['vehicle_counts']:
                    current_count = section['vehicle_counts'][v_type]
                    # Reducimos cada tipo de vehículo AL 45% de su valor actual
                    section['vehicle_counts'][v_type] = int(current_count * 0.45)

        # 4. Recalcular estados finales (UCP y color) y mostrar logs
        recalculate_segment_states()
        
        logging.info(f"\n📊 ESTADO FINAL DE SEGMENTOS:")
        for section in sections:
            total_vehicles = sum(section['vehicle_counts'].values())
            logging.info(f"  🚗 '{section['segment_name']}': {int(total_vehicles)} veh | {section['ucp_density']} UCP | {section['occupancy_percentage']}% ocupado")
        
        # 5. Avanzar al siguiente paso
        simulation_step = (simulation_step + 1) % len(time_intervals)
        time.sleep(10)

@app.route('/')
def map_page():
    return render_template('map.html')

@app.route('/health')
def health_check():
    """Endpoint simple para verificar que el servidor está vivo"""
    return jsonify({'status': 'ok', 'message': 'Server is running'}), 200

@app.route('/api/status')
def get_status():
    """Endpoint para verificar el estado de inicialización"""
    return jsonify({
        'status': 'initializing' if not road_segments_data or not sections else 'ready',
        'road_segments_loaded': len(road_segments_data),
        'sections_loaded': len(sections),
        'traffic_data_loaded': traffic_df is not None and not traffic_df.empty,
        'intervals_count': len(time_intervals)
    }), 200

@app.route('/api/road_data')
def get_road_data():
    route_segments = [road for road in road_segments_data.values() if road['color'] != 'gray']
    return jsonify(route_segments)

@app.route('/api/traffic_data')
def get_traffic_data():
    clean_sections = []
    for s in sections:
        clean_sections.append({
            "segment_name": s["segment_name"],
            "direction": s["direction"],
            "vehicle_counts": s["vehicle_counts"],
            "ucp_density": s["ucp_density"],
            "edges": list(s["edges"]),
            "occupancy_percentage": s.get("occupancy_percentage", 0),
            "total_vehicles": sum(s["vehicle_counts"].values())
        })
    return jsonify(clean_sections)

@app.route('/api/kpis')
def get_kpis():
    """
    Calcula y devuelve los KPIs generales de la simulación:
    - % Ocupación: UCP total actual vs. capacidad UCP total.
    - % Congestión: Porcentaje de segmentos en estado 'rojo'.
    """
    # 1. Inicializar variables
    total_current_ucp = 0
    total_ucp_capacity = 0
    red_segments_count = 0
    total_segments_count = len(sections)

    # 2. Recorrer los segmentos para sumar los valores
    if total_segments_count > 0:
        for section in sections:
            total_current_ucp += section.get('ucp_density', 0)
            total_ucp_capacity += section.get('ucp_capacity', 0)
            
            # Contar segmentos en 'rojo' (ocupación > 80%)
            if section.get('occupancy_percentage', 0) > 80:
                red_segments_count += 1

    # 3. Calcular los KPIs
    # KPI de Ocupación General
    overall_occupancy_percentage = 0
    if total_ucp_capacity > 0:
        overall_occupancy_percentage = (total_current_ucp / total_ucp_capacity) * 100

    # KPI de Congestión (porcentaje de segmentos en rojo)
    congestion_percentage = 0
    if total_segments_count > 0:
        congestion_percentage = (red_segments_count / total_segments_count) * 100

    # 4. Preparar la respuesta JSON
    kpis = {
        "overall_occupancy_percentage": round(overall_occupancy_percentage, 2),
        "congestion_percentage": round(congestion_percentage, 2),
        "red_segments_count": red_segments_count,
        "total_segments_count": total_segments_count
    }

    return jsonify(kpis)

@app.route('/api/debug')
def debug_info():
    return jsonify({
        'total_segments_in_polygon': len(road_segments_data),
        'total_route_sections': len(sections),
        'current_simulation_step': simulation_step,
        'current_interval': time_intervals[simulation_step] if time_intervals else "N/A",
        'sections_info': [{
            'name': s.get('segment_name'),
            'ucp': s.get('ucp_density'),
            'vehicles': sum(s.get('vehicle_counts', {}).values())
        } for s in sections]
    })

@app.route('/api/current_interval')
def get_current_interval():
    """
    Retorna el intervalo actual de la simulación
    """
    current_interval = time_intervals[simulation_step] if time_intervals else "N/A"
    return jsonify({
        'current_interval': current_interval,
        'simulation_step': simulation_step,
        'total_intervals': len(time_intervals)
    })

@app.route('/api/intervals')
def get_all_intervals():
    """
    Retorna todos los intervalos disponibles
    """
    return jsonify({
        'intervals': time_intervals,
        'current_step': simulation_step
    })

@app.route('/api/ucp_by_interval')
def get_ucp_by_interval():
    """
    Retorna datos UCP agrupados por intervalo de tiempo
    """
    ucp_data = []
    
    # Solo mostrar datos para el intervalo actual
    current_interval = time_intervals[simulation_step] if time_intervals else "N/A"
    total_ucp = sum(section.get('ucp_density', 0) for section in sections)
    
    ucp_data.append({
        'interval': current_interval,
        'total_ucp': round(total_ucp, 2)
    })
    
    # Para otros intervalos, mostrar 0 (siguiendo la lógica solicitada)
    for i, interval in enumerate(time_intervals):
        if i != simulation_step:
            ucp_data.append({
                'interval': interval,
                'total_ucp': 0
            })
    
    return jsonify(ucp_data)

@app.route('/api/vehicles_by_interval_and_segment')
def get_vehicles_by_interval_and_segment():
    """
    Retorna datos detallados de vehículos por intervalo y segmento
    Solo muestra datos para el intervalo solicitado o el actual
    """
    # Obtener el intervalo solicitado desde query parameters
    requested_interval = request.args.get('interval')
    current_interval = time_intervals[simulation_step] if time_intervals else "N/A"
    
    # Si no se especifica intervalo, usar el actual
    target_interval = requested_interval if requested_interval else current_interval
    
    detailed_data = []
    
    # Mapeo de tipos de vehículos Python a frontend
    vehicle_mapping = {
        'Auto': 'autos',
        'Taxi': 'autos',  # Los taxis se agrupan con autos
        'Omnibus': 'buses',
        'Microbús': 'buses',  # Los microbuses se agrupan con buses
        'Bus Interprovincial': 'buses',
        'Camioneta rural': 'camionetas',
        'Camión': 'camionetas',  # Los camiones se agrupan con camionetas
        'Tráiler': 'camionetas',
        'Moto lineal': 'motos',
        'Mototaxi': 'motos',  # Los mototaxis se agrupan con motos
        'Bicicleta': 'motos'  # Las bicicletas se agrupan con motos para simplificar
    }
    
    for section in sections:
        # Agrupar vehículos según el mapeo
        grouped_vehicles = {
            'autos': 0,
            'buses': 0,
            'motos': 0,
            'camionetas': 0
        }
        
        # Solo mostrar datos reales si es el intervalo actual, si no, mostrar 0s
        if target_interval == current_interval:
            for vehicle_type, count in section['vehicle_counts'].items():
                mapped_type = vehicle_mapping.get(vehicle_type, 'autos')  # Default a autos si no encuentra
                grouped_vehicles[mapped_type] += count
        
        # Solo agregar UNA fila por segmento para el intervalo solicitado
        detailed_data.append({
            'interval': target_interval,
            'segment_id': section['segment_name'],  # Usar segment_name como ID también
            'segment_name': section['segment_name'],
            'autos': grouped_vehicles['autos'],
            'buses': grouped_vehicles['buses'],
            'motos': grouped_vehicles['motos'],
            'camionetas': grouped_vehicles['camionetas'],
            'total_vehicles': sum(grouped_vehicles.values()),
            'ucp': section.get('ucp_density', 0) if target_interval == current_interval else 0,
            'ocupacion': section.get('occupancy_percentage', 0) if target_interval == current_interval else 0
        })
    
    return jsonify(detailed_data)

if __name__ == '__main__':
    if not os.path.exists('templates'):
        os.makedirs('templates')
    
    logging.info("🚀 Iniciando el servidor...")
    load_traffic_data()
    load_and_structure_data()
    
    if not road_segments_data or not sections:
        logging.critical("❌ ERROR CRÍTICO: No se pudieron cargar datos del mapa.")
        exit(1)
    
    logging.info("\n" + "="*60 + "\n✅ ESTRUCTURACIÓN COMPLETADA\n" + "="*60)
    
    traffic_thread = threading.Thread(target=update_traffic_periodically, daemon=True)
    traffic_thread.start()
    
    logging.info(f"🚦 SERVIDOR LISTO. Accede a http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=False, use_reloader=False)
else:
    # Para producción con gunicorn
    logging.info("🚀 Iniciando en modo producción...")
    load_traffic_data()
    load_and_structure_data()
    
    if not road_segments_data or not sections:
        logging.critical("❌ ERROR CRÍTICO: No se pudieron cargar datos del mapa.")
    else:
        logging.info("\n" + "="*60 + "\n✅ ESTRUCTURACIÓN COMPLETADA\n" + "="*60)
        
        traffic_thread = threading.Thread(target=update_traffic_periodically, daemon=True)
        traffic_thread.start()
        logging.info("🚦 SERVIDOR LISTO para producción")