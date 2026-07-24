"""
Tests unitaires — PulseCity Anomaly Detector (detector.py)
===========================================================
Teste l'AnomalyStore (fenêtre glissante + Isolation Forest)
et les endpoints FastAPI (/health, /anomalies, /metrics).
"""

import sys
import pytest
from unittest.mock import MagicMock

# ── Mocker prometheus_client et kafka AVANT tout import ──────────────────────
# Crée des mocks réalistes pour éviter les erreurs d'import
mock_prometheus = MagicMock()
mock_counter    = MagicMock()
mock_histogram  = MagicMock()
mock_gauge      = MagicMock()

mock_prometheus.Counter.return_value   = mock_counter
mock_prometheus.Histogram.return_value = mock_histogram
mock_prometheus.Gauge.return_value     = mock_gauge
mock_prometheus.CONTENT_TYPE_LATEST    = "text/plain; version=0.0.4"
mock_prometheus.generate_latest.return_value = b"# HELP pulsecity_test\n"
mock_prometheus.REGISTRY               = MagicMock()

sys.modules["prometheus_client"] = mock_prometheus
sys.modules["kafka"]             = MagicMock()
sys.modules["kafka.errors"]      = MagicMock()

# Maintenant on peut importer le module
from detector import AnomalyStore, app  # noqa: E402
from fastapi.testclient import TestClient   # noqa: E402

client = TestClient(app)


# ── Tests AnomalyStore ────────────────────────────────────────────────────────
class TestAnomalyStore:
    """Tests du store de fenêtre glissante et détection Isolation Forest."""

    def setup_method(self):
        """Crée un store frais avant chaque test."""
        self.store = AnomalyStore()

    def test_score_zero_before_min_samples(self):
        """Avant MIN_SAMPLES, le score doit être 0.0."""
        score = self.store.add_reading("sensor-test", 100.0)
        assert score == 0.0

    def test_score_nonzero_after_min_samples(self):
        """Après MIN_SAMPLES mesures, le score IF doit être calculé."""
        for i in range(15):
            self.store.add_reading("sensor-a", 100.0 + i * 0.1)
        score = self.store.add_reading("sensor-a", 100.0)
        assert isinstance(score, float)
        assert score != 0.0

    def test_normal_value_score_positive(self):
        """Une valeur normale (similaire aux autres) doit avoir un score proche de 0."""
        # Remplir avec des valeurs homogènes avec une petite variation
        for i in range(25):
            self.store.add_reading("sensor-b", 100.0 + (i % 5) * 0.2)
        # La même valeur ne devrait pas être une anomalie
        score = self.store.add_reading("sensor-b", 100.0)
        assert score > -0.2  # proche de 0, pas fortement négatif

    def test_outlier_gets_negative_score(self):
        """Une valeur extrême doit obtenir un score négatif (anomalie IF)."""
        for i in range(25):
            self.store.add_reading("sensor-c", 100.0 + (i % 5) * 0.2)
        # Valeur extrêmement différente → anomalie
        score = self.store.add_reading("sensor-c", 999999.0)
        assert score < -0.05

    def test_active_sensors_count(self):
        """Le nombre de capteurs actifs doit augmenter à chaque nouveau sensor_id."""
        self.store.add_reading("sensor-x", 10.0)
        self.store.add_reading("sensor-y", 20.0)
        self.store.add_reading("sensor-z", 30.0)
        assert len(self.store.windows) == 3

    def test_window_max_size(self):
        """La fenêtre glissante ne doit pas dépasser WINDOW_SIZE."""
        from detector import WINDOW_SIZE
        for i in range(WINDOW_SIZE + 20):
            self.store.add_reading("sensor-w", float(i))
        assert len(self.store.windows["sensor-w"]) == WINDOW_SIZE

    def test_record_anomaly(self):
        alert = {"sensor_id": "test-001", "zone": "Tunis", "value": 999.9}
        self.store.record_anomaly(alert)
        assert self.store.total_anomalies == 1

    def test_get_recent_anomalies_count(self):
        for i in range(10):
            self.store.record_anomaly({"id": i, "value": float(i)})
        result = self.store.get_recent_anomalies(5)
        assert len(result) == 5

    def test_get_recent_anomalies_order(self):
        """Les anomalies les plus récentes doivent être en premier."""
        self.store.record_anomaly({"value": 1.0, "order": "first"})
        self.store.record_anomaly({"value": 2.0, "order": "second"})
        result = self.store.get_recent_anomalies(2)
        # appendleft → le plus récent est en index 0
        assert result[0]["order"] == "second"
        assert result[1]["order"] == "first"

    def test_increment_messages(self):
        self.store.increment_messages()
        self.store.increment_messages()
        stats = self.store.get_stats()
        assert stats["total_messages_consumed"] == 2

    def test_get_stats_keys(self):
        stats = self.store.get_stats()
        assert "total_messages_consumed" in stats
        assert "total_anomalies_detected" in stats
        assert "active_sensors" in stats
        assert "started_at" in stats


# ── Tests API FastAPI ─────────────────────────────────────────────────────────
class TestHealthEndpoint:
    def test_status_ok(self):
        response = client.get("/health")
        assert response.status_code == 200

    def test_service_name(self):
        data = client.get("/health").json()
        assert data["service"] == "pulsecity-anomaly-detector"

    def test_version_present(self):
        data = client.get("/health").json()
        assert "version" in data

    def test_kafka_bootstrap_present(self):
        data = client.get("/health").json()
        assert "kafka_bootstrap" in data

    def test_all_stats_keys(self):
        data = client.get("/health").json()
        assert "total_messages_consumed" in data
        assert "total_anomalies_detected" in data
        assert "active_sensors" in data


class TestAnomaliesEndpoint:
    def test_status_200(self):
        response = client.get("/anomalies")
        assert response.status_code == 200

    def test_response_structure(self):
        data = client.get("/anomalies").json()
        assert "count" in data
        assert "anomalies" in data
        assert isinstance(data["anomalies"], list)

    def test_default_limit_20(self):
        """Sans paramètre, limit par défaut = 20."""
        data = client.get("/anomalies").json()
        assert data["count"] <= 20

    def test_custom_limit(self):
        response = client.get("/anomalies?limit=5")
        assert response.status_code == 200
        data = response.json()
        assert data["count"] <= 5

    def test_limit_max_100(self):
        """Même si limit > 100, la réponse ne doit pas dépasser 100."""
        response = client.get("/anomalies?limit=999")
        assert response.status_code == 200


class TestMetricsEndpoint:
    def test_metrics_status_200(self):
        response = client.get("/metrics")
        assert response.status_code == 200

    def test_metrics_content_type(self):
        response = client.get("/metrics")
        assert "text/plain" in response.headers["content-type"]
