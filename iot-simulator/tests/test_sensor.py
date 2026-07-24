"""
Tests unitaires — PulseCity IoT Simulator (sensor.py)
======================================================
Mock Kafka et prometheus_client pour que les tests tournent
sans infrastructure externe.
"""

import sys
import pytest
from unittest.mock import MagicMock, patch

# ── Mocker les dépendances externes AVANT l'import de sensor ─────────────────
sys.modules["kafka"]                      = MagicMock()
sys.modules["kafka.errors"]               = MagicMock()
sys.modules["prometheus_client"]          = MagicMock()

# Importer le module à tester
from sensor import (  # noqa: E402
    generate_reading,
    ZONES,
    SENSOR_TOPICS,
    NORMAL_RANGES,
    ANOMALY_RANGES,
    ANOMALY_PROB,
)


# ── Tests de structure JSON ───────────────────────────────────────────────────
class TestGenerateReadingStructure:
    """Vérifie que chaque lecture contient tous les champs requis."""

    REQUIRED_FIELDS = {"timestamp", "zone", "sensor_type", "value", "unit", "anomaly", "sensor_id"}

    def test_all_fields_present_traffic(self):
        reading = generate_reading("traffic", "Tunis-Centre")
        assert self.REQUIRED_FIELDS.issubset(reading.keys())

    def test_all_fields_present_air_co2(self):
        reading = generate_reading("air_co2", "Sfax")
        assert self.REQUIRED_FIELDS.issubset(reading.keys())

    def test_all_fields_present_noise(self):
        reading = generate_reading("noise", "Sousse")
        assert self.REQUIRED_FIELDS.issubset(reading.keys())

    def test_all_fields_present_energy(self):
        reading = generate_reading("energy", "Ariana")
        assert self.REQUIRED_FIELDS.issubset(reading.keys())

    def test_value_is_float(self):
        reading = generate_reading("traffic", "La-Marsa")
        assert isinstance(reading["value"], float)

    def test_anomaly_is_bool(self):
        reading = generate_reading("air_co2", "Ben-Arous")
        assert isinstance(reading["anomaly"], bool)

    def test_timestamp_format(self):
        reading = generate_reading("noise", "Tunis-Centre")
        assert reading["timestamp"].endswith("Z")
        assert "T" in reading["timestamp"]


# ── Tests des zones ───────────────────────────────────────────────────────────
class TestZones:
    def test_six_zones_defined(self):
        assert len(ZONES) == 6

    def test_zone_preserved_in_reading(self):
        for zone in ZONES:
            reading = generate_reading("traffic", zone)
            assert reading["zone"] == zone

    def test_all_expected_zones_present(self):
        expected = {"Tunis-Centre", "Ariana", "Ben-Arous", "La-Marsa", "Sfax", "Sousse"}
        assert expected == set(ZONES)


# ── Tests des types de capteurs ───────────────────────────────────────────────
class TestSensorTypes:
    def test_four_sensor_types_defined(self):
        assert len(SENSOR_TOPICS) == 4

    def test_sensor_type_preserved(self):
        for sensor_type in SENSOR_TOPICS:
            reading = generate_reading(sensor_type, "Tunis-Centre")
            assert reading["sensor_type"] == sensor_type

    def test_traffic_unit(self):
        reading = generate_reading("traffic", "Sfax")
        assert reading["unit"] == "vehicles/min"

    def test_air_co2_unit(self):
        reading = generate_reading("air_co2", "Sfax")
        assert reading["unit"] == "ppm"

    def test_noise_unit(self):
        reading = generate_reading("noise", "Sfax")
        assert reading["unit"] == "dB"

    def test_energy_unit(self):
        reading = generate_reading("energy", "Sfax")
        assert reading["unit"] == "kWh"


# ── Tests des plages de valeurs ───────────────────────────────────────────────
class TestValueRanges:
    """Vérifie que les valeurs respectent les plages normales/anomalies."""

    def test_normal_traffic_in_range(self):
        with patch("random.random", return_value=0.99):  # 0.99 > ANOMALY_PROB → normal
            reading = generate_reading("traffic", "Tunis-Centre")
            assert reading["anomaly"] is False
            assert NORMAL_RANGES["traffic"]["min"] <= reading["value"] <= NORMAL_RANGES["traffic"]["max"]

    def test_anomaly_traffic_in_range(self):
        with patch("random.random", return_value=0.0):   # 0.0 < ANOMALY_PROB → anomalie
            reading = generate_reading("traffic", "Tunis-Centre")
            assert reading["anomaly"] is True
            assert ANOMALY_RANGES["traffic"]["min"] <= reading["value"] <= ANOMALY_RANGES["traffic"]["max"]

    def test_normal_co2_in_range(self):
        with patch("random.random", return_value=0.99):
            reading = generate_reading("air_co2", "Ariana")
            assert reading["value"] >= NORMAL_RANGES["air_co2"]["min"]
            assert reading["value"] <= NORMAL_RANGES["air_co2"]["max"]

    def test_anomaly_noise_in_range(self):
        with patch("random.random", return_value=0.0):
            reading = generate_reading("noise", "Ben-Arous")
            assert reading["anomaly"] is True
            assert ANOMALY_RANGES["noise"]["min"] <= reading["value"] <= ANOMALY_RANGES["noise"]["max"]


# ── Tests du sensor_id ────────────────────────────────────────────────────────
class TestSensorId:
    def test_sensor_id_format(self):
        reading = generate_reading("energy", "La-Marsa")
        assert reading["sensor_id"] == "la-marsa-energy-001"

    def test_sensor_id_contains_zone_lowercase(self):
        reading = generate_reading("traffic", "Tunis-Centre")
        assert "tunis-centre" in reading["sensor_id"]

    def test_sensor_id_contains_sensor_type(self):
        reading = generate_reading("air_co2", "Sfax")
        assert "air_co2" in reading["sensor_id"]
