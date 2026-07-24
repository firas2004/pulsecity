---
applyTo: "backend-v2/**/*.py, iot-simulator/**/*.py"
---

# Python backend guidance

- The backend is organized around FastAPI routers in backend-v2/routers, shared models in backend-v2/models, and configuration in backend-v2/config.py.
- Keep new endpoints in the existing router structure and preserve the startup, seeding, and database session patterns already used in backend-v2/main.py.
- Reuse the existing database/session setup and migration logic rather than introducing a second persistence approach.
- For simulator changes, preserve the current Kafka, Prometheus, and dynamic sensor refresh behavior in iot-simulator/sensor.py.
- Use type hints where practical, avoid hard-coded secrets, and add or update tests in the matching tests/ folder for behavior changes.
