# PulseCity Operations Guide

This document is a complete operational guide for the PulseCity platform. It explains how to run the app, stop it, rebuild it after code changes, deploy it to the local Kubernetes cluster, and understand each major part of the system.

---

## 1. What this app is

PulseCity is a cloud-native smart city monitoring platform that simulates IoT sensor data, sends it through Kafka, detects anomalies, stores and exposes data through a backend API, and displays everything in a React frontend.

The main components are:

- Frontend: React/Vite UI
- Backend: FastAPI backend serving the app API and WebSocket data
- IoT Simulator: Python service that generates realistic sensor data
- Kafka: event bus for streaming sensor and alert messages
- Anomaly Detector: Python/FastAPI service that consumes Kafka messages and detects anomalies
- Kubernetes: local cluster orchestration for running the whole platform
- Docker: containerization for the frontend, backend, simulator, and anomaly detector

---

## 2. Architecture overview

### High-level flow

1. The IoT simulator generates sensor readings.
2. It publishes those readings to Kafka topics.
3. The anomaly detector consumes the events and detects unusual values.
4. The backend receives and serves data to the frontend.
5. The frontend displays dashboards, alerts, chat, and admin/client views.

### Main technical layers

- Frontend layer
  - Vite + React
  - UI for admin/client experience
  - Uses the backend API and WebSocket endpoints

- Backend layer
  - FastAPI application
  - Exposes REST endpoints and real-time data endpoints
  - Reads and writes application state

- Streaming layer
  - Apache Kafka
  - Topics for sensor data and alerts

- Simulation layer
  - Python IoT simulator producing realistic traffic, air, noise, and energy measurements

- Deployment layer
  - Docker containers
  - Kubernetes manifests for deployment and services

---

## 3. Project structure

The important folders are:

- frontend/: React app and Dockerfile
- backend-v2/: FastAPI backend code
- iot-simulator/: Python IoT simulator and tests
- anomaly-detector/: anomaly detection service
- k8s/: Kubernetes deployment files
- monitoring/: Prometheus/Grafana monitoring manifests
- argocd/: ArgoCD application definitions

---

## 4. Each major part in detail

### 4.1 Frontend

Location:
- frontend/

Purpose:
- Provides the user interface for the platform.
- Allows admin and client users to interact with the system.

Technologies:
- React
- Vite
- JavaScript/JSX
- CSS variables and inline styles

Important files:
- frontend/package.json
- frontend/src/App.jsx
- frontend/src/main.jsx
- frontend/src/theme.js
- frontend/src/index.css
- frontend/src/services/api.js
- frontend/src/services/websocket.js

How it works:
- The frontend loads the app shell.
- It uses the API client to call backend endpoints.
- It uses WebSockets for live updates.
- It is served through Nginx in the container.

How to build it:
```powershell
cd C:\Users\user\Desktop\pulsecity
docker build -t pulsecity-frontend:v2 .\frontend
```

How to deploy it:
```powershell
kubectl apply -f .\frontend\deployment.yaml
kubectl apply -f .\frontend\service.yaml
```

How to update after code changes:
```powershell
docker build -t pulsecity-frontend:v2 .\frontend
kind load docker-image pulsecity-frontend:v2 --name pulsecity
kubectl rollout restart deployment/pulsecity-frontend
```

---

### 4.2 Backend

Location:
- backend-v2/

Purpose:
- Main API layer for the platform.
- Exposes routes for auth, alerts, metrics, cities, sensors, chat, etc.

Technologies:
- FastAPI
- Python
- SQLAlchemy-style models
- Pydantic-style schemas where relevant

Important files:
- backend-v2/main.py
- backend-v2/config.py
- backend-v2/state.py
- backend-v2/routers/
- backend-v2/models/

How it works:
- Starts the FastAPI app.
- Includes routers for the major API domains.
- Handles authentication, city data, sensor data, and chat logic.
- Connects to the app state and other services.

How to build it:
```powershell
cd C:\Users\user\Desktop\pulsecity
docker build -t pulsecity-backend:v3 .\backend-v2
```

How to deploy it:
```powershell
kubectl apply -f .\k8s\backend-v2\deployment.yaml
kubectl apply -f .\k8s\backend-v2\service.yaml
```

How to update after code changes:
```powershell
docker build -t pulsecity-backend:v3 .\backend-v2
kind load docker-image pulsecity-backend:v3 --name pulsecity
kubectl rollout restart deployment/backend-v2
```

---

### 4.3 Kubernetes

Location:
- k8s/

Purpose:
- Runs the app inside a local Kubernetes cluster.
- Exposes services and manages pods and deployments.

Important manifests:
- k8s/backend-v2/deployment.yaml
- k8s/backend-v2/service.yaml
- frontend/deployment.yaml
- frontend/service.yaml
- iot-simulator/deployment.yaml
- anomaly-detector/deployment.yaml
- k8s/anomaly-detector/service.yaml

How it works:
- Deployments create pods for each app.
- Services expose them inside the cluster and sometimes outside via NodePort.
- The frontend service uses NodePort 30080.

How to check running services:
```powershell
kubectl get pods
kubectl get svc
```

How to restart a deployment:
```powershell
kubectl rollout restart deployment/pulsecity-frontend
kubectl rollout restart deployment/backend-v2
kubectl rollout restart deployment/iot-simulator
```

---

### 4.4 Docker

Purpose:
- Packages the app into containers so Kubernetes can run it consistently.

Relevant Dockerfiles:
- frontend/Dockerfile
- backend-v2/Dockerfile
- iot-simulator/Dockerfile
- anomaly-detector/Dockerfile

How to build images:
```powershell
cd C:\Users\user\Desktop\pulsecity
docker build -t pulsecity-frontend:v2 .\frontend
docker build -t pulsecity-backend:v3 .\backend-v2
docker build -t pulsecity-sensor:v3 .\iot-simulator
docker build -t pulsecity-anomaly-detector:v1 .\anomaly-detector
```

How to load images into Kind:
```powershell
kind load docker-image pulsecity-frontend:v2 --name pulsecity
kind load docker-image pulsecity-backend:v3 --name pulsecity
kind load docker-image pulsecity-sensor:v3 --name pulsecity
kind load docker-image pulsecity-anomaly-detector:v1 --name pulsecity
```

---

### 4.5 Kafka

Location:
- iot-simulator/
- anomaly-detector/
- iot-simulator/kafka-k8s.yaml

Purpose:
- Kafka is the event bus for the platform.
- The simulator sends sensor messages to topics.
- The anomaly detector consumes them and produces alerts.

Main topics expected by the system:
- traffic-data
- air-quality
- noise-level
- energy-data
- alerts

How to deploy Kafka:
```powershell
kubectl create namespace kafka
kubectl apply -f .\iot-simulator\kafka-k8s.yaml
```

How to verify Kafka topics:
```powershell
kubectl exec -n kafka kafka-0 -- kafka-topics --bootstrap-server localhost:9092 --list
```

---

### 4.6 IoT Simulator

Location:
- iot-simulator/

Purpose:
- Simulates smart city data from different sensor types.
- Publishes messages to Kafka.
- Helps demonstrate real-time data flow.

Important files:
- iot-simulator/sensor.py
- iot-simulator/requirements.txt
- iot-simulator/deployment.yaml

How it works:
- Reads sensors from the backend.
- Generates random but realistic readings.
- Sends messages to Kafka topics.
- Can also expose metrics for monitoring.

How to build and deploy it:
```powershell
docker build -t pulsecity-sensor:v3 .\iot-simulator
kind load docker-image pulsecity-sensor:v3 --name pulsecity
kubectl apply -f .\iot-simulator\deployment.yaml
```

How to update after code changes:
```powershell
docker build -t pulsecity-sensor:v3 .\iot-simulator
kind load docker-image pulsecity-sensor:v3 --name pulsecity
kubectl rollout restart deployment/iot-simulator
```

---

### 4.7 Anomaly Detector

Location:
- anomaly-detector/

Purpose:
- Consumes Kafka events and detects anomalies.
- Exposes an API for health and anomaly results.

Important files:
- anomaly-detector/detector.py
- anomaly-detector/deployment.yaml
- anomaly-detector/service.yaml

How to build and deploy it:
```powershell
docker build -t pulsecity-anomaly-detector:v1 .\anomaly-detector
kind load docker-image pulsecity-anomaly-detector:v1 --name pulsecity
kubectl apply -f .\anomaly-detector\deployment.yaml
kubectl apply -f .\k8s\anomaly-detector\service.yaml
```

---

## 5. How to run the app

### 5.1 Prerequisites

You need:
- Docker Desktop
- Kind
- kubectl
- PowerShell

Make sure they are installed:
```powershell
docker --version
kind version
kubectl version --client
```

### 5.2 Create or use the cluster

If you do not already have the cluster:
```powershell
kind create cluster --name pulsecity
```

If the cluster already exists:
```powershell
kind get clusters
```

### 5.3 Start the app

You can use the port-forward to make the frontend available locally:
```powershell
cd C:\Users\user\Desktop\pulsecity
kubectl port-forward svc/pulsecity-frontend 30080:80
```

Then open:
```text
http://127.0.0.1:30080
```

### 5.4 Default credentials

- Admin: admin / admin123
- Client: client / client123

---

## 6. How to stop the app

If you started the port-forward in the terminal, stop it by pressing:
```text
Ctrl+C
```

If you want to stop the whole platform from Kubernetes, you can delete the deployments/services you applied. In most cases you only need to stop the port-forward and leave the cluster running.

For a full stop of the running app stack:
```powershell
kubectl delete deployment pulsecity-frontend backend-v2 iot-simulator anomaly-detector
kubectl delete service pulsecity-frontend backend-v2 anomaly-detector iot-simulator-metrics
```

---

## 7. How to build and deploy after changing code

### 7.1 For frontend changes

```powershell
cd C:\Users\user\Desktop\pulsecity
docker build -t pulsecity-frontend:v2 .\frontend
kind load docker-image pulsecity-frontend:v2 --name pulsecity
kubectl rollout restart deployment/pulsecity-frontend
```

### 7.2 For backend changes

```powershell
docker build -t pulsecity-backend:v3 .\backend-v2
kind load docker-image pulsecity-backend:v3 --name pulsecity
kubectl rollout restart deployment/backend-v2
```

### 7.3 For IoT simulator changes

```powershell
docker build -t pulsecity-sensor:v3 .\iot-simulator
kind load docker-image pulsecity-sensor:v3 --name pulsecity
kubectl rollout restart deployment/iot-simulator
```

### 7.4 For anomaly detector changes

```powershell
docker build -t pulsecity-anomaly-detector:v1 .\anomaly-detector
kind load docker-image pulsecity-anomaly-detector:v1 --name pulsecity
kubectl rollout restart deployment/anomaly-detector
```

### 7.5 Full rebuild and redeploy flow

```powershell
cd C:\Users\user\Desktop\pulsecity
docker build -t pulsecity-backend:v3 .\backend-v2
docker build -t pulsecity-frontend:v2 .\frontend
docker build -t pulsecity-sensor:v3 .\iot-simulator
docker build -t pulsecity-anomaly-detector:v1 .\anomaly-detector

kind load docker-image pulsecity-backend:v3 --name pulsecity
kind load docker-image pulsecity-frontend:v2 --name pulsecity
kind load docker-image pulsecity-sensor:v3 --name pulsecity
kind load docker-image pulsecity-anomaly-detector:v1 --name pulsecity

kubectl rollout restart deployment/backend-v2
kubectl rollout restart deployment/pulsecity-frontend
kubectl rollout restart deployment/iot-simulator
kubectl rollout restart deployment/anomaly-detector
```

---

## 8. Useful commands

### Check status
```powershell
kubectl get pods
kubectl get svc
kubectl get deployment
```

### Watch logs
```powershell
kubectl logs deployment/pulsecity-frontend
kubectl logs deployment/backend-v2
kubectl logs deployment/iot-simulator
kubectl logs deployment/anomaly-detector
```

### Check if the app responds
```powershell
curl.exe http://127.0.0.1:30080
```

### Delete and recreate a deployment quickly
```powershell
kubectl delete deployment pulsecity-frontend
kubectl apply -f .\frontend\deployment.yaml
```

---

## 9. Recommended daily workflow

When you are developing locally:

1. Edit the code.
2. Rebuild the changed component image.
3. Load it into Kind.
4. Restart the deployment.
5. Open the app at http://127.0.0.1:30080.

Example for frontend changes:
```powershell
cd C:\Users\user\Desktop\pulsecity
docker build -t pulsecity-frontend:v2 .\frontend
kind load docker-image pulsecity-frontend:v2 --name pulsecity
kubectl rollout restart deployment/pulsecity-frontend
```

Example for backend changes:
```powershell
cd C:\Users\user\Desktop\pulsecity
docker build -t pulsecity-backend:v3 .\backend-v2
kind load docker-image pulsecity-backend:v3 --name pulsecity
kubectl rollout restart deployment/backend-v2
```

---

## 10. Summary

- The app runs locally through Kubernetes with Docker images.
- The frontend is available through the port-forward at http://127.0.0.1:30080.
- Kafka carries the real-time sensor stream.
- The IoT simulator generates the data.
- The anomaly detector consumes it and detects issues.
- After code changes, rebuild the relevant image, load it into Kind, and restart the deployment.
