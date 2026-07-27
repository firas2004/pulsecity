# 🏙️ PulseCity — Plateforme Cloud Native de Surveillance Urbaine Intelligente

![Kubernetes](https://img.shields.io/badge/Kubernetes-Kind-326CE5?logo=kubernetes)
![Kafka](https://img.shields.io/badge/Apache_Kafka-7.7.0-231F20?logo=apachekafka)
![FastAPI](https://img.shields.io/badge/FastAPI-v2-009688?logo=fastapi)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python)
![License](https://img.shields.io/badge/License-MIT-green)

> Plateforme IoT & IA en temps réel pour la gestion et la surveillance intelligente de **18 villes tunisiennes** : *Tunis Centre, Ariana, La Marsa, Sousse, Monastir, Bizerte, Nabeul, Mahdia, Sfax, Gabès, Kairouan, Béja, Jendouba, Le Kef, Gafsa, Tozeur, Tataouine et Médenine.*

---

## 📑 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Fonctionnalités clés](#fonctionnalités-clés)
3. [12 Métriques IoT en Temps Réel](#12-métriques-iot-en-temps-réel)
4. [Espaces & Vues Métiers](#espaces--vues-métiers)
5. [Architecture Globale](#architecture-globale)
6. [Stack Technique](#stack-technique)
7. [Guide de Déploiement](#guide-de-déploiement)
8. [Contributeur](#contributeur)

---

## 🌟 Vue d'ensemble

**PulseCity** est une solution complète d'urbanisme intelligent (*Smart City*) combinant la télémétrie IoT haute fréquence, l'analyse prédictive d'anomalies par IA, une cartographie interactive multi-couches et un assistant IA génératif connecté aux données environnementales et marines de la Tunisie.

---

## ✨ Fonctionnalités clés

- 🗂️ **Barre de Navigation Latérale (Sidebar)** : Interface fluide avec persistance de l'état réduit/déployé en `localStorage`.
- 🏖️ **Indice de Baignade & Qualité des Plages** : Évaluation en temps réel des conditions de baignade (🟢 *Idéale*, 🟡 *Prudence*, 🔴 *Interdite*) selon le pH de l'eau, la météo marine et le vent pour les plages côtières (*La Marsa, Boujaafar Sousse, Corniche Bizerte, Kélibia Fort...*).
- 🚗 **Mobilité & Parkings Détaillés** : Démographie municipale, taux d'occupation des parkings publics en temps réel et estimation des retards routiers.
- 🌿 **Environnement & Microclimats** : Jauge de CO₂, niveau sonore (dB) et analyse de la qualité de l'air.
- ⚡ **Infrastructure & Réseaux** : Alertes de remplissage des conteneurs à déchets (>85%), pureté de l'eau potable et charge électrique du réseau.
- 📈 **Comparaison Villes** : Tableau comparatif côte à côte des métriques de n'importe quelles villes.
- 🏆 **Indice de Livabilité (Score 0-100)** : Classement automatique des 18 villes tunisiennes basé sur un score composite environnement-mobilité.
- 🗺️ **Carte Interactive Multi-Couches** : Activation/désactivation dynamique des couches POI : 🏖️ *Plages*, 🅿️ *Parkings*, 🚶 *Zones piétonnes* et 📡 *Capteurs IoT*.
- 💬 **Assistant IA Génératif (PulseCity Brain)** : Intégration LLM (Groq) injectant le contexte exact des capteurs et des plages de la ville sélectionnée.
- 🔐 **Sécurité & Contrôle d'Accès** : Espace Citoyen et Espace Administration sécurisés par JWT avec gestion des villes, clients et capteurs.

---

## 📡 12 Métriques IoT en Temps Réel

| Métrique | Symbole | Unité | Plage Normale | Description |
| :--- | :---: | :---: | :---: | :--- |
| **Trafic Routier** | 🚦 | `veh/min` | 10 – 120 | Flux de véhicules sur les axes majeurs |
| **Qualité Air CO₂** | 💨 | `ppm` | 350 – 800 | Concentration en dioxyde de carbone |
| **Niveau Sonore** | 🔊 | `dB` | 40 – 75 | Nuisance acoustique urbaine |
| **Énergie Électrique** | ⚡ | `kWh` | 100 – 400 | Charge du réseau électrique municipal |
| **Température** | 🌡️ | `°C` | 10 – 38 | Température ambiante et mer |
| **Humidité** | 💧 | `%` | 30 – 85 | Taux d'humidité de l'air |
| **Vitesse du Vent** | 🌬️ | `km/h` | 5 – 40 | Intensité des rafales de vent |
| **Flux Piétonnier** | 🚶 | `p/min` | 10 – 250 | Passages piétons dans les artères |
| **Remplissage Poubelles**| 🗑️ | `%` | 0 – 85 | Niveau des conteneurs intelligents |
| **Qualité de l'Eau** | 🚰 | `pH` | 6.5 – 8.5 | Qualité de l'eau potable & mer |
| **Occupation Parking** | 🅿️ | `%` | 10 – 95 | Disponibilité des places de stationnement |
| **Flux Gare / Transports**| 🚉 | `p/min` | 10 – 300 | Affluence dans les hubs de transport |

---

## 🖼️ Espaces & Vues Métiers

```
PulseCity/
├── 📊 Vue Globale (/client, /admin)             # Dashboards synthétiques & métriques live
├── 🚗 Mobilité Détaillée (/client/mobility)     # Parkings, trafic, démographie & retards
├── 🌿 Environnement (/client/environment)       # CO2, bruit dB, microclimats urbains
├── 🏖️ Plages & Baignade (/client/beaches)       # Météo marine, pH eau, UV & baignade
├── ⚡ Infrastructure (/client/infrastructure)   # Poubelles >85%, eau pH & réseau élec
├── 📈 Comparaison Villes (/client/compare)      # Tableau comparatif ville A vs ville B
├── 🏆 Score Livabilité (/client/ranking)        # Classement général 18 villes (0-100)
├── 🔔 Centre d'Alertes (/client/alerts)         # Historique & notifications d'anomalies
├── 💬 Assistant IA (/client/chat)               # Brain AI connecté au contexte temps réel
└── ⚙️ Administration (/admin/*)                 # Gestion Villes, Clients & Capteurs
```

---

## 🏗️ Architecture Globale

```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                         Cluster Kubernetes (Kind)                           │
 │                                                                             │
 │  ┌─────────────────┐   Kafka Topics   ┌──────────────────────────────────┐  │
 │  │  iot-simulator  │ ───────────────► │            backend-v2            │  │
 │  │   (Python)      │  12 métriques    │  (FastAPI + SQLite + Thresholds) │  │
 │  └─────────────────┘                  └─────────────────┬────────────────┘  │
 │                                                         │ WebSocket / REST  │
 │                                                         ▼                   │
 │                                       ┌──────────────────────────────────┐  │
 │                                       │        pulsecity-frontend        │  │
 │                                       │    (React 18 + Leaflet + Vite)   │  │
 │                                       └──────────────────────────────────┘  │
 └─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Stack Technique

| Composant | Technologie |
| :--- | :--- |
| **Front-End** | React 18, Vite, Lucide Icons, Leaflet Maps, Vanilla CSS |
| **Back-End API** | FastAPI, Python 3.11, SQLite, Uvicorn, WebSockets |
| **Broker de Message**| Apache Kafka (KRaft mode) |
| **Simulateur IoT** | Python `kafka-python`, distribution stochastique |
| **IA & LLM** | Groq API (`llama-3.3-70b-versatile`) + Isolation Forest |
| **Containerisation** | Docker, Kubernetes (Kind), Nginx Alpine |

---

## 🚀 Guide de Déploiement

### 1. Cloner le dépôt
```powershell
git clone https://github.com/firas2004/pulsecity.git
cd pulsecity
```

### 2. Déployer sur le cluster Kubernetes local (Kind)
```powershell
# Déployer le backend v2
docker build -t pulsecity-backend:v2 ./backend-v2
kind load docker-image pulsecity-backend:v2 --name pulsecity
kubectl rollout restart deployment/backend-v2 -n default

# Déployer le frontend v3
docker build -t pulsecity-frontend:v3 ./frontend
kind load docker-image pulsecity-frontend:v3 --name pulsecity
kubectl patch deployment pulsecity-frontend -n default --patch-file k8s-patch-frontend-v3.yaml
kubectl delete pod -l app=pulsecity-frontend -n default --grace-period=0 --force
```

### 3. Exposer l'application
```powershell
kubectl port-forward svc/pulsecity-frontend 30080:80 -n default
```
Accédez à l'application sur : **http://127.0.0.1:30080**

---

## 👥 Contributeur

**Adel Firas** — Lead Cloud Native & Full-Stack Engineer  
Projet PulseCity — Plateforme de surveillance urbaine intelligente IoT  
Juillet 2026

---

*PulseCity — Tous droits réservés — Projet éducatif*
