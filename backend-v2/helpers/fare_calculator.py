from typing import Dict, List, Any, Optional

GRAND_TUNIS = {"tunis-centre", "ariana", "ben-arous", "la-marsa", "manouba"}

# Known SNCFT Railway Lines
SNCFT_LINES = [
    {"tunis-centre", "sousse", "monastir", "mahdia", "sfax", "gabes", "gafsa", "tozeur"},
    {"tunis-centre", "beja", "jendouba"},
    {"tunis-centre", "bizerte"},
    {"tunis-centre", "nabeul"},
    {"tunis-centre", "kairouan"},
    {"tunis-centre", "siliana"},
]

def is_sncft_connected(origin_id: str, dest_id: str) -> bool:
    """
    Checks if two cities are connected by a known SNCFT railway line.
    """
    if origin_id == dest_id:
        return True
    for line in SNCFT_LINES:
        if origin_id in line and dest_id in line:
            return True
    return False

def estimate_co2_kg(mode: str, distance_km: float) -> float:
    """
    Estimates CO2 emissions in kg based on transport mode and distance in km.
    Emission factors (kg CO2 per passenger-km):
    - Taxi: 0.15
    - Louage: 0.10
    - Bus/Métro: 0.04
    - Train: 0.03
    """
    factors = {
        "taxi": 0.15,
        "louage": 0.10,
        "bus_metro": 0.04,
        "train": 0.03,
    }
    factor = factors.get(mode, 0.10)
    return round(distance_km * factor, 2)

def calculate_all_modes(origin_id: str, dest_id: str, distance_km: float) -> List[Dict[str, Any]]:
    modes = []

    # 1. TAXI
    taxi_fare = round(0.900 + (distance_km * 0.550), 3)
    taxi_min = round(0.400 + (distance_km * 0.500), 3)
    taxi_max = round(0.900 + (distance_km * 0.600), 3)
    taxi_note = "Prise en charge 0.900 TND + 0.550 TND/km"
    if distance_km > 40:
        taxi_note += " — non recommandé au-delà de ~40km"

    modes.append({
        "mode_id": "taxi",
        "name": "Taxi Compteur",
        "icon": "Car",
        "available": True,
        "fare_tnd": taxi_fare,
        "fare_range": [taxi_min, taxi_max],
        "fare_note": taxi_note,
        "night_surcharge_multiplier": 1.5,
        "co2_kg": estimate_co2_kg("taxi", distance_km),
        "co2_note": "Estimation indicative (~0.15 kg CO₂/km)",
    })

    # 2. LOUAGE — intercity only, not available within Grand Tunis
    is_grand_tunis = (origin_id in GRAND_TUNIS) and (dest_id in GRAND_TUNIS)
    travel_hours = distance_km / 70.0
    louage_fare = round(max(5.0, travel_hours * 7.0), 3)
    if not is_grand_tunis:
        modes.append({
            "mode_id": "louage",
            "name": "Louage (Taxi Collectif)",
            "icon": "Users",
            "available": True,
            "fare_tnd": louage_fare,
            "fare_range": None,
            "fare_note": "Tarif estimé sur ~7 TND/heure (vitesse moy. 70 km/h, plancher 5 TND)",
            "co2_kg": estimate_co2_kg("louage", distance_km),
            "co2_note": "Estimation indicative (~0.10 kg CO₂/km partagé à 8 passagers)",
        })
    else:
        modes.append({
            "mode_id": "louage",
            "name": "Louage (Taxi Collectif)",
            "icon": "Users",
            "available": False,
            "fare_tnd": None,
            "fare_range": None,
            "fare_note": "Louage intercity — non disponible en zone Grand Tunis",
            "co2_kg": None,
            "co2_note": None,
            "reason": "Service intercity non applicable au sein du Grand Tunis",
        })

    # 3. BUS / MÉTRO LÉGER (Transtu) — Grand Tunis only
    if is_grand_tunis:
        modes.append({
            "mode_id": "bus_metro",
            "name": "Bus / Métro Léger (Transtu)",
            "icon": "Bus",
            "available": True,
            "fare_tnd": 1.000,
            "fare_range": None,
            "fare_note": "Tarif urbain forfaitaire Grand Tunis (1.000 TND)",
            "co2_kg": estimate_co2_kg("bus_metro", distance_km),
            "co2_note": "Estimation indicative (~0.04 kg CO₂/km/passager)",
        })
    else:
        modes.append({
            "mode_id": "bus_metro",
            "name": "Bus / Métro Léger (Transtu)",
            "icon": "Bus",
            "available": False,
            "fare_tnd": None,
            "fare_range": None,
            "fare_note": "Non disponible hors du Grand Tunis",
            "co2_kg": None,
            "co2_note": None,
        })

    # 4. TRAIN SNCFT
    has_train = is_sncft_connected(origin_id, dest_id)
    if has_train:
        modes.append({
            "mode_id": "train",
            "name": "Train Grandes Lignes (SNCFT)",
            "icon": "Train",
            "available": True,
            "fare_tnd": None,
            "fare_range": None,
            "fare_note": "Tarif variable selon classe — à vérifier auprès de SNCFT",
            "co2_kg": estimate_co2_kg("train", distance_km),
            "co2_note": "Estimation indicative (~0.03 kg CO₂/km/passager)",
        })
    else:
        modes.append({
            "mode_id": "train",
            "name": "Train Grandes Lignes (SNCFT)",
            "icon": "Train",
            "available": False,
            "fare_tnd": None,
            "fare_range": None,
            "fare_note": "Aucune liaison ferroviaire directe identifiée",
            "co2_kg": None,
            "co2_note": None,
        })

    return modes
