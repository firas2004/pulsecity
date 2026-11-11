"""
Tests unitaires — PulseCity Backend V2 (helpers & modules core)
==============================================================
Teste les algorithmes métier sans dépendance externe (BDD / Kafka).
"""

import pytest
from helpers.distance import haversine_km, estimated_road_distance_km
from helpers.fare_calculator import estimate_co2_kg, is_sncft_connected


class TestDistanceCalculations:
    """Vérifie le calcul des distances géodésiques et routières."""

    def test_haversine_same_point(self):
        # Distance entre le même point doit être 0
        dist = haversine_km(36.8065, 10.1815, 36.8065, 10.1815)
        assert dist == 0.0

    def test_haversine_tunis_sfax(self):
        # Tunis (36.8065, 10.1815) à Sfax (34.7406, 10.7603) ~235 km à vol d'oiseau
        dist = haversine_km(36.8065, 10.1815, 34.7406, 10.7603)
        assert 220 < dist < 250

    def test_road_distance_scaling(self):
        # La distance routière doit intégrer le facteur 1.3
        air_dist = haversine_km(36.8065, 10.1815, 35.8256, 10.6084) # Tunis-Sousse
        road_dist = estimated_road_distance_km(36.8065, 10.1815, 35.8256, 10.6084)
        assert road_dist == round(air_dist * 1.3, 2)


class TestFareAndEcoMetrics:
    """Vérifie les estimations écologiques et de connectivité."""

    def test_estimate_co2_walk_bike(self):
        # Marche et vélo doivent avoir une émission nulle ou quasi nulle
        assert estimate_co2_kg("marche", 10.0) == 0.0
        assert estimate_co2_kg("velo", 15.0) == 0.0

    def test_estimate_co2_car_vs_train(self):
        # La voiture doit émettre plus que le train pour la même distance
        dist = 100.0
        co2_car = estimate_co2_kg("taxi", dist)
        co2_train = estimate_co2_kg("train_sncft", dist)
        assert co2_car > co2_train

    def test_sncft_connected_major_cities(self):
        # Tunis et Sousse sont reliées par la SNCFT
        assert is_sncft_connected("tunis-centre", "sousse") is True
        assert is_sncft_connected("tunis-centre", "tunis-centre") is True

