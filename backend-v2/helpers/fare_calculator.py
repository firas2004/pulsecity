"""
fare_calculator.py — Multi-modal fare and CO2 calculator for Tunisian transport.
Supports: Taxi, Louage, Bus/Métro (Transtu), Métro Léger, TGM, RFR, Bus SNTRI,
          Train SNCFT, Avion, Vélo, Marche.
"""
from typing import Dict, List, Any, Optional
from helpers.transport_data import (
    has_airport, get_rfr_cities, get_tgm_cities
)

# ── Geographic zones ──────────────────────────────────────────────────────────
GRAND_TUNIS = {"tunis-centre", "ariana", "ben-arous", "la-marsa", "manouba"}

# Cities served by the RFR network (Lignes D & E)
RFR_CITIES = get_rfr_cities()

# Cities served by TGM
TGM_CITIES = get_tgm_cities()

# Known SNCFT Railway Lines (intercity grandes lignes)
SNCFT_LINES = [
    {"tunis-centre", "sousse", "monastir", "mahdia", "sfax", "gabes", "gafsa", "tozeur"},
    {"tunis-centre", "beja", "jendouba"},
    {"tunis-centre", "bizerte"},
    {"tunis-centre", "nabeul"},
    {"tunis-centre", "kairouan"},
    {"tunis-centre", "siliana"},
]

# SNTRI intercity bus coverage (major city pairs)
SNTRI_CITIES = {
    "tunis-centre", "sousse", "sfax", "gabes", "monastir", "mahdia",
    "kairouan", "bizerte", "beja", "jendouba", "nabeul", "gafsa",
    "tozeur", "medenine", "siliana",
}


# ── Helpers ───────────────────────────────────────────────────────────────────
def is_sncft_connected(origin_id: str, dest_id: str) -> bool:
    if origin_id == dest_id:
        return True
    for line in SNCFT_LINES:
        if origin_id in line and dest_id in line:
            return True
    return False


def estimate_co2_kg(mode: str, distance_km: float) -> float:
    """Estimates CO2 emissions in kg based on transport mode and distance."""
    factors = {
        "taxi": 0.15,
        "louage": 0.10,
        "bus_metro": 0.04,
        "metro_transtu": 0.04,
        "tgm": 0.03,
        "rfr": 0.03,
        "bus_sntri": 0.05,
        "train": 0.03,
        "avion": 0.15,
        "marche": 0.0,
        "velo": 0.0,
    }
    factor = factors.get(mode, 0.10)
    return round(distance_km * factor, 3)


# ── Main Calculator ───────────────────────────────────────────────────────────
def calculate_all_modes(origin_id: str, dest_id: str, distance_km: float) -> List[Dict[str, Any]]:
    modes = []
    is_grand_tunis = (origin_id in GRAND_TUNIS) and (dest_id in GRAND_TUNIS)

    # ── 1. MARCHE (< 3km) ────────────────────────────────────────────────────
    if distance_km < 3.0:
        duration_walk = round(distance_km / 5.0 * 60)
        modes.append({
            "mode_id": "marche",
            "name": "À pied",
            "icon": "Footprints",
            "available": True,
            "fare_tnd": 0.0,
            "fare_range": None,
            "fare_note": "Trajet accessible à pied (~5 km/h)",
            "co2_kg": 0.0,
            "co2_note": "Zéro émission — déplacement doux",
            "duration_min": duration_walk,
            "wait_time_min": 0,
        })

    # ── 2. VÉLO (< 10km) ─────────────────────────────────────────────────────
    if distance_km < 10.0:
        duration_velo = round(distance_km / 15.0 * 60)
        modes.append({
            "mode_id": "velo",
            "name": "Vélo",
            "icon": "Bike",
            "available": True,
            "fare_tnd": 0.0,
            "fare_range": None,
            "fare_note": "Déplacement à vélo (~15 km/h)",
            "co2_kg": 0.0,
            "co2_note": "Zéro émission — déplacement doux",
            "duration_min": duration_velo,
            "wait_time_min": 0,
        })

    # ── 3. TAXI ───────────────────────────────────────────────────────────────
    taxi_fare = round(0.900 + (distance_km * 0.550), 3)
    taxi_min = round(0.400 + (distance_km * 0.500), 3)
    taxi_max = round(0.900 + (distance_km * 0.600), 3)
    taxi_note = "Prise en charge 0.900 TND + 0.550 TND/km"
    taxi_warning = None
    if distance_km > 40:
        taxi_note += " — non recommandé au-delà de ~40km"
        taxi_warning = "Tarif élevé pour longue distance — envisagez louage ou train"
    taxi_duration = round(distance_km / 60.0 * 60)  # ~60 km/h moyenne
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
        "duration_min": taxi_duration,
        "wait_time_min": 5,
        "warning": taxi_warning,
        "deep_links": {
            "bolt": {"url": "https://bolt.eu", "name": "Bolt", "available_cities": ["Tunis", "Sousse", "Sfax"]},
            "etaxi": {"url": "https://etaxi.tn", "name": "eTaxi", "available_cities": ["Toutes villes"]},
            "yango": {"url": "https://yango.com", "name": "Yango", "available_cities": ["Tunis", "Sousse"]},
        },
    })

    # ── 4. MÉTRO LÉGER TRANSTU (Intra-Grand Tunis uniquement) ────────────────
    if is_grand_tunis:
        metro_duration = round(max(10, distance_km / 25.0 * 60))
        modes.append({
            "mode_id": "metro_transtu",
            "name": "Métro Léger (TRANSTU)",
            "icon": "Train",
            "available": True,
            "fare_tnd": 0.680,
            "fare_range": [0.680, 0.900],
            "fare_note": "0.680 TND (carte magnétique) / 0.900 TND (ticket unitaire) — 6 lignes, 66 stations",
            "co2_kg": estimate_co2_kg("metro_transtu", distance_km),
            "co2_note": "Estimation indicative (~0.04 kg CO₂/km/passager)",
            "duration_min": metro_duration,
            "wait_time_min": 8,
        })
    else:
        modes.append({
            "mode_id": "metro_transtu",
            "name": "Métro Léger (TRANSTU)",
            "icon": "Train",
            "available": False,
            "fare_tnd": None,
            "fare_range": None,
            "fare_note": "Réseau limité au Grand Tunis (Tunis, Ariana, Ben Arous, La Marsa, Manouba)",
            "co2_kg": None,
            "co2_note": None,
            "duration_min": None,
            "reason": "Métro non disponible hors du Grand Tunis",
        })

    # ── 5. TGM (Tunis-Centre ↔ La Marsa) ─────────────────────────────────────
    tgm_available = (origin_id in TGM_CITIES) and (dest_id in TGM_CITIES)
    if tgm_available:
        modes.append({
            "mode_id": "tgm",
            "name": "TGM (Tunis-Goulette-Marsa)",
            "icon": "Train",
            "available": True,
            "fare_tnd": 0.680,
            "fare_range": None,
            "fare_note": "0.680 TND — 19km, 12 stations, fréquence toutes les 10-20 min",
            "co2_kg": estimate_co2_kg("tgm", distance_km),
            "co2_note": "Estimation indicative (~0.03 kg CO₂/km/passager)",
            "duration_min": 40,
            "wait_time_min": 10,
        })
    else:
        modes.append({
            "mode_id": "tgm",
            "name": "TGM (Tunis-Goulette-Marsa)",
            "icon": "Train",
            "available": False,
            "fare_tnd": None,
            "fare_range": None,
            "fare_note": "Dessert uniquement Tunis Marine ↔ La Marsa (19 km)",
            "co2_kg": None,
            "co2_note": None,
            "duration_min": None,
            "reason": "TGM non disponible pour ce trajet",
        })

    # ── 6. RFR (Tunis ↔ Manouba/Bardo/Sidi Hassine) ──────────────────────────
    rfr_available = (origin_id in RFR_CITIES) and (dest_id in RFR_CITIES)
    if rfr_available:
        rfr_duration = round(max(15, distance_km / 40.0 * 60))
        modes.append({
            "mode_id": "rfr",
            "name": "RFR (Réseau Ferroviaire Rapide)",
            "icon": "Zap",
            "available": True,
            "fare_tnd": 1.500,
            "fare_range": None,
            "fare_note": "~1.500 TND — Lignes D & E (Gobâa, Sidi Hassine) depuis Gare de Tunis",
            "co2_kg": estimate_co2_kg("rfr", distance_km),
            "co2_note": "Estimation indicative (~0.03 kg CO₂/km/passager)",
            "duration_min": rfr_duration,
            "wait_time_min": 10,
        })
    else:
        modes.append({
            "mode_id": "rfr",
            "name": "RFR (Réseau Ferroviaire Rapide)",
            "icon": "Zap",
            "available": False,
            "fare_tnd": None,
            "fare_range": None,
            "fare_note": "Dessert Tunis ↔ Manouba/Bardo (Ligne D) et Tunis ↔ Sidi Hassine (Ligne E)",
            "co2_kg": None,
            "co2_note": None,
            "duration_min": None,
            "reason": "RFR non disponible pour ce trajet",
        })

    # ── 7. LOUAGE (Intercity uniquement — pas intra-Grand Tunis) ─────────────
    travel_hours = distance_km / 70.0
    louage_fare = round(max(5.0, travel_hours * 7.0), 3)
    louage_duration = round(distance_km / 70.0 * 60)
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
            "duration_min": louage_duration,
            "wait_time_min": 20,
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
            "duration_min": None,
            "reason": "Service intercity non applicable au sein du Grand Tunis",
        })

    # ── 8. BUS URBAIN / MÉTRO (Transtu) — Grand Tunis seulement ─────────────
    if is_grand_tunis:
        bus_duration = round(max(15, distance_km / 20.0 * 60))
        modes.append({
            "mode_id": "bus_metro",
            "name": "Bus / Métro Léger (Transtu)",
            "icon": "Bus",
            "available": True,
            "fare_tnd": 1.000,
            "fare_range": None,
            "fare_note": "Tarif urbain forfaitaire Grand Tunis (1.000 TND) — +200 lignes de bus",
            "co2_kg": estimate_co2_kg("bus_metro", distance_km),
            "co2_note": "Estimation indicative (~0.04 kg CO₂/km/passager)",
            "duration_min": bus_duration,
            "wait_time_min": 15,
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
            "duration_min": None,
            "reason": "Transtu limité au Grand Tunis",
        })

    # ── 9. BUS SNTRI (Interurbain national) ──────────────────────────────────
    sntri_available = (
        not is_grand_tunis
        and distance_km > 20
        and origin_id in SNTRI_CITIES
        and dest_id in SNTRI_CITIES
    )
    if sntri_available:
        sntri_fare = round(max(5.0, distance_km * 0.120), 3)
        sntri_duration = round(distance_km / 70.0 * 60 + 30)  # +30 min arrêts
        modes.append({
            "mode_id": "bus_sntri",
            "name": "Bus Interurbain (SNTRI)",
            "icon": "Bus",
            "available": True,
            "fare_tnd": sntri_fare,
            "fare_range": None,
            "fare_note": f"~0.120 TND/km (min 5.0 TND) — SNTRI couverture nationale. Réservation sur sntri.com.tn",
            "co2_kg": estimate_co2_kg("bus_sntri", distance_km),
            "co2_note": "Estimation indicative (~0.05 kg CO₂/km/passager)",
            "duration_min": sntri_duration,
            "wait_time_min": 15,
            "external_link": "https://www.sntri.com.tn",
        })
    else:
        modes.append({
            "mode_id": "bus_sntri",
            "name": "Bus Interurbain (SNTRI)",
            "icon": "Bus",
            "available": False,
            "fare_tnd": None,
            "fare_range": None,
            "fare_note": "Bus interurbain national — réservation sur sntri.com.tn",
            "co2_kg": None,
            "co2_note": None,
            "duration_min": None,
            "reason": "Trajet intra-Grand Tunis ou villes non desservies" if is_grand_tunis else "Villes non couvertes par le réseau SNTRI",
        })

    # ── 10. TRAIN SNCFT (Grandes Lignes) ──────────────────────────────────────
    has_train = is_sncft_connected(origin_id, dest_id)
    if has_train and not (origin_id == dest_id):
        train_duration = round(distance_km / 100.0 * 60 + 30)  # ~100 km/h + haltes
        modes.append({
            "mode_id": "train",
            "name": "Train Grandes Lignes (SNCFT)",
            "icon": "Train",
            "available": True,
            "fare_tnd": None,
            "fare_range": None,
            "fare_note": "Tarif variable selon classe — à vérifier auprès de SNCFT (sncft.com.tn)",
            "co2_kg": estimate_co2_kg("train", distance_km),
            "co2_note": "Estimation indicative (~0.03 kg CO₂/km/passager)",
            "duration_min": train_duration,
            "wait_time_min": 10,
            "external_link": "https://www.sncft.com.tn",
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
            "duration_min": None,
            "reason": "Pas de ligne SNCFT directe pour ce trajet",
        })

    # ── 11. AVION (Distance > 300km + aéroports disponibles) ─────────────────
    origin_has_airport = has_airport(origin_id)
    dest_has_airport = has_airport(dest_id)
    avion_available = distance_km > 300 and origin_has_airport and dest_has_airport
    if avion_available:
        avion_duration = round(distance_km / 700.0 * 60 + 90)  # vol + 90min aéroport
        modes.append({
            "mode_id": "avion",
            "name": "Avion intérieur",
            "icon": "Plane",
            "available": True,
            "fare_tnd": None,
            "fare_range": None,
            "fare_note": "Tarif variable — à vérifier sur Tunisair ou Nouvelair. Inclure 90 min d'aéroport.",
            "co2_kg": estimate_co2_kg("avion", distance_km),
            "co2_note": "Estimation indicative (~0.15 kg CO₂/km — mode le plus émetteur)",
            "duration_min": avion_duration,
            "wait_time_min": 90,
            "external_link": "https://www.tunisair.com",
            "warning": "Option uniquement viable si économies significatives — CO₂ élevé",
        })
    else:
        reason = "Distance < 300km (vol intérieur non pertinent)" if distance_km <= 300 else "Un ou plusieurs aéroports manquants pour ce trajet"
        modes.append({
            "mode_id": "avion",
            "name": "Avion intérieur",
            "icon": "Plane",
            "available": False,
            "fare_tnd": None,
            "fare_range": None,
            "fare_note": "Vols intérieurs Tunisair / Nouvelair disponibles pour longues distances",
            "co2_kg": None,
            "co2_note": None,
            "duration_min": None,
            "reason": reason,
        })

    return modes
