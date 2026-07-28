# 🏙️ PulseCity — Plateforme Cloud Native & IoT de Surveillance Urbaine Intelligente

**Rapport de Présentation du Projet**  
**Réalisé par :** Adel Firas  
**Projet :** Smart City IoT & IA — Surveillance Urbaine Intelligente  
**Date :** Juillet 2026  

---

## 📑 Table des Matières

1. [Présentation Générale & Problématique](#1-présentation-générale--problématique)
2. [Périmètre Géographique (18 Villes Instrumentées)](#2-périmètre-géographique-18-villes-instrumentées)
3. [Architecture globale & Pipeline de Données](#3-architecture-globale--pipeline-de-données)
4. [Les 12 Métriques IoT de Télémétrie Urbaine](#4-les-12-métriques-iot-de-télémétrie-urbaine)
5. [Modules & Vues Métiers de la Plateforme](#5-modules--vues-métiers-de-la-plateforme)
6. [Intelligence Artificielle & Assistant IA (PulseCity Brain)](#6-intelligence-artificielle--assistant-ia-pulsecity-brain)
7. [Architecture Cloud Native, Kubernetes & GitOps](#7-architecture-cloud-native-kubernetes--gitops)
8. [Conclusion & Valeur Ajoutée du Projet](#8-conclusion--valeur-ajoutée-du-projet)

---

## 1. Présentation Générale & Problématique

Dans le cadre de la modernisation des infrastructures urbaines et de la transition vers les villes intelligentes (*Smart Cities*), **PulseCity** est une plateforme Cloud Native globale assurant la collecte en temps réel, l'analyse prédictive et la restitution des données urbaines.

### Objectifs Principaux du Projet :
- **Surveillance Continue en Temps Réel** : Centralisation des flux télémétriques issus de réseaux de capteurs IoT répartis sur le territoire tunisien.
- **Détection Automatique d'Anomalies** : Combinaison de moteurs de règles (seuils critiques) et d'apprentissage automatique (*Machine Learning*) pour anticiper les embouteillages, les pics de pollution ou les pannes de réseau.
- **Aide à la Décision & Information Citoyenne** : Mise à disposition de dashboards interactifs pour les décideurs municipaux et d'un assistant IA génératif pour les citoyens.
- **Évaluation de la Qualité de Vie & Sécurité Maritime** : Analyse spécifique des conditions de baignade côtière et calcul d'un indice composite de livabilité urbaine.

---

## 2. Périmètre Géographique (18 Villes Instrumentées)

La plateforme couvre de manière détaillée **18 grandes villes tunisiennes**, regroupées par zones géographiques et spécificités territoriales :

- **Grand Tunis & Littoral Nord** : Tunis Centre, Ariana, La Marsa, Ben Arous, Bizerte, Nabeul.
- **Région du Sahel & Côte Est** : Sousse, Monastir, Mahdia, Sfax.
- **Régions Intérieures & Sud** : Gabès, Kairouan, Béja, Jendouba, Le Kef, Gafsa, Tozeur, Tataouine, Médenine.

Chaque ville dispose de son propre réseau de capteurs virtuels instrumentés et géolocalisés.

---

## 3. Architecture Globale & Pipeline de Données

L'architecture du système repose sur un modèle réactif événementiel (*Event-Driven Architecture*) garantissant une faible latence et une haute disponibilité.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                         ARCHITECTURAL PIPELINE PULSECITY                         │
│                                                                                  │
│  ┌───────────────────┐    Kafka Topics    ┌───────────────────────────────────┐  │
│  │   iot-simulator   │ ─────────────────► │            backend-v2            │  │
│  │ (Génération IoT)  │   12 Flux Data     │ (FastAPI + SQLite + IA Engine)    │  │
│  └───────────────────┘                    └─────────────────┬─────────────────┘  │
│                                                             │ Flux WebSockets    │
│                                                             ▼                    │
│                                           ┌───────────────────────────────────┐  │
│                                           │        pulsecity-frontend        │  │
│                                           │ (React 18 + Leaflet + Dashboards) │  │
│                                           └───────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Description des Composants Système :

1. **Générateur IoT (`iot-simulator`)** : Microservice simulant la télémétrie haute fréquence des 12 types de capteurs pour les 18 villes et transmettant les données vers le bus de messages.
2. **Bus de Messages (Apache Kafka)** : Broker de messages garantissant l'ingestion massive et le découplage entre la simulation et le traitement backend.
3. **Backend Central & Moteur d'IA (`backend-v2`)** : Service développé sous **FastAPI** assurant l'ingestion Kafka, le stockage dans la base SQLite (`pulsecity.db`), l'exécution des algorithmes de détection d'anomalies et la diffusion WebSockets en temps réel.
4. **Interface Utilisateur React (`pulsecity-frontend`)** : Application Front-End moderne en dark mode glassmorphic offrant des tableaux de bord interactifs et une cartographie multi-couches.

---

## 4. Les 12 Métriques IoT de Télémétrie Urbaine

La plateforme analyse simultanément 12 indicateurs fondamentaux de la vie urbaine :

| Indicateur | Icône | Unité | Définition & Rôle dans le Système |
| :--- | :---: | :---: | :--- |
| **Trafic Routier** | 🚦 | `veh/min` | Densité et fluidité de la circulation sur les artères principales |
| **Qualité Air CO₂** | 💨 | `ppm` | Taux de dioxyde de carbone et pollution atmosphérique |
| **Niveau Sonore** | 🔊 | `dB` | Pression acoustique et nuisances sonores urbaines |
| **Énergie Électrique** | ⚡ | `kWh` | Consommation et charge instantanée du réseau électrique |
| **Température** | 🌡️ | `°C` | Température de l'air ambiant et de la mer |
| **Humidité** | 💧 | `%` | Taux d'humidité relative de l'air |
| **Vitesse du Vent** | 🌬️ | `km/h` | Force des rafales de vent et conditions météorologiques |
| **Flux Piétonnier** | 🚶 | `p/min` | Densité de fréquentation des rues piétonnes et places |
| **Remplissage Poubelles**| 🗑️ | `%` | Niveau de remplissage des conteneurs à déchets intelligents |
| **Qualité de l'Eau** | 🚰 | `pH` | Potabilité de l'eau du réseau et salinité maritime |
| **Occupation Parking** | 🅿️ | `%` | Taux de réservation et places libres dans les parkings publics |
| **Flux Gare / Transports**| 🚉 | `p/min` | Affluence dans les stations de métro, train et bus |

---

## 5. Modules & Vues Métiers de la Plateforme

L'application est structurée en 6 modules métiers spécialisés accessibles via une barre de navigation latérale ergonomique :

### 1. 📊 Vue Globale Synthétique
Présente une vue d'ensemble de la ville sélectionnée avec des jauges en temps réel pour chaque capteur, les alertes actives et la cartographie géolocalisée.

### 2. 🚗 Mobilité & Parkings Détaillés
Fournit des données démographiques par municipalité (ex. Tunis: 650k hab, Ariana: 500k hab), l'état de remplissage des parkings municipaux et les estimations de retard sur les itinéraires clés.

### 3. 🌿 Environnement & Microclimats Urbains
Propose un suivi approfondi de la qualité de l'air (CO₂ ppm), de l'exposition sonore (dB) et des variations microclimatiques.

### 4. 🏖️ Plages & Indice de Baignade
Module dédié aux villes littorales (*La Marsa, Sousse, Monastir, Bizerte, Nabeul, Mahdia...*) évaluant automatiquement les conditions de baignade :
- 🟢 **Baignade Autorisée & Idéale** : Eau propre, pH stable, vent faible.
- 🟡 **Prudence Recommandée** : Mer agitée ou affluence élevée.
- 🔴 **Baignade Interdite** : Anomalie de pureté de l'eau ou vent violent (>40 km/h).
Inclut également la température de la mer, l'indice UV et la densité de foule sur la plage.

### 5. ⚡ Infrastructure, Énergie & Réseaux
Supervise la collecte des déchets en identifiant les conteneurs saturés (>85%), vérifie le pH de l'eau potable et mesure la consommation énergétique globale.

### 6. 📈 Comparaison Villes & 🏆 Score de Livabilité
- **Comparateur Inter-Villes** : Permet de comparer simultanément deux villes sur l'ensemble des 12 métriques.
- **Classement Général de Livabilité** : Calcule un score composite sur 100 pour classer les 18 villes selon leur qualité de vie.

---

## 6. Intelligence Artificielle & Assistant IA (PulseCity Brain)

PulseCity intègre un double moteur d'Intelligence Artificielle :

1. **Détection d'Anomalies par Machine Learning** : Utilisation de l'algorithme **Isolation Forest** (Scikit-Learn) pour identifier les déviations statistiques complexes sans règles pré-établies.
2. **Assistant IA Génératif (`PulseCity Brain`)** : Modèle de langage (LLM Groq - `llama-3.3-70b-versatile`) infusé en temps réel du contexte télémétrique de la ville active. L'assistant répond aux questions des citoyens sur la baignade, le trafic, les itinéraires et les alertes environnementales.

---

## 7. Architecture Cloud Native, Kubernetes & GitOps

Le projet adopte les meilleures pratiques de l'écosystème **Cloud Native** :

- **Conteneurisation (Docker)** : Microservices isolés et optimisés sous Linux Alpine.
- **Orchestration (Kubernetes)** : Gestion automatisée de la scalabilité, du redéploiement à chaud et de l'auto-guérison des pods.
- **Déploiement GitOps (ArgoCD)** : Synchronisation continue et automatisée entre le dépôt GitHub et le cluster Kubernetes.

---

## 8. Conclusion & Valeur Ajoutée du Projet

Le projet **PulseCity** démontre l'apport des technologies Cloud Native, de l'IoT et de l'Intelligence Artificielle pour la gestion des villes de demain. 

Par sa couverture de **18 villes**, ses **12 capteurs spécialisés**, ses **modules de baignade et de livabilité**, et son **Assistant IA connecté**, la plateforme offre une solution complète, moderne et directement exploitable pour les collectivités territoriales et les citoyens.

---

**Réalisé par :** Adel Firas  
**Projet PulseCity — Smart City & Cloud Native Engineering**  
*Juillet 2026*
