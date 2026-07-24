---
applyTo: "**/*"
---

# Pulsecity Copilot instructions

- Treat this repository as a connected system: Python services in backend-v2/ and iot-simulator/, a Vite/React frontend in frontend/, and Kubernetes manifests in k8s/.
- Before editing, inspect the nearest existing module and reuse its patterns instead of introducing a new abstraction.
- Backend changes should stay aligned with the FastAPI router structure, SQLAlchemy models, and config setup in backend-v2/.
- Frontend changes should reuse the route guards, API client, and theme variables already used in frontend/src rather than inventing a new pattern.
- Keep deployment behavior intact: do not change ports, environment variables, or container wiring without updating the related manifest files.
- Prefer small, focused edits and add or update tests in the relevant tests/ folder when behavior changes.
