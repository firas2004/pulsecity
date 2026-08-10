import requests
import json
import re
from config import settings

def generate_smart_fallback(user_message: str, system_prompt: str) -> dict:
    """
    Génère une réponse intelligente locale de secours si l'API Groq est indisponible ou non configurée.
    """
    msg_lower = user_message.lower()
    
    # 1. Transport & Trajets
    if any(w in msg_lower for w in ["trajet", "transport", "aller", "métro", "bus", "train", "louage", "taxi", "comment aller", "route"]):
        return {
            "content": "Pour vos déplacements en Tunisie, **Pulse City** propose un **Simulateur de Trajet multimodal** en temps réel :\n\n"
                       "• 🚐 **Louage** : Réseau interurbain rapide (ex: Tunis-Sousse ~12 TND, Tunis-Sfax ~22 TND)\n"
                       "• 🚂 **Train SNCFT** : Liaisons ferroviaires confortables (Gare de Tunis, Sousse, Sfax)\n"
                       "• 🚊 **Métro & TGM** : Réseau du Grand Tunis (1 TND / 0.680 TND TGM La Marsa)\n"
                       "• 🚕 **Taxi** : Tarif urbain au compteur (0.900 TND prise en charge + 0.550 TND/km)\n\n"
                       "Vous pouvez calculer l'itinéraire exact, la durée, le coût et les émissions de CO₂ dans notre section dédiée.",
            "suggested_actions": [
                {"label": "🗺️ Simulateur de Trajet", "link": "/client/trip-simulator"},
                {"label": "🚗 Mobilité Live", "link": "/client/mobility"}
            ]
        }

    # 2. Santé & Hôpitaux
    if any(w in msg_lower for w in ["santé", "sante", "hôpital", "hopital", "clinique", "pharmacie", "docteur", "urgence", "cnam", "médecin"]):
        return {
            "content": "La section **Santé & Établissements** répertorie tous les centres de soin tunisiens :\n\n"
                       "• 🏥 **Grands CHU** : Charles-Nicolle, Rabta, Habib-Thameur (Tunis), Farhat-Hached (Sousse), Habib-Bourguiba (Sfax)\n"
                       "• 🏥 **Cliniques Privées** : Taoufik, Carthagène, El Amen, Pasteur, Alyssa...\n"
                       "• 🩺 **Centres de Santé (CSB)** : 2100+ dispensaires locaux de proximité\n"
                       "• 💊 **Pharmacies & Urgences** : Filtrez les établissements ouverts 24h/24 et conventionnés CNAM.",
            "suggested_actions": [
                {"label": "🏥 Recherche Santé", "link": "/client/sante"},
                {"label": "🔔 Alertes Urbaines", "link": "/client/alerts"}
            ]
        }

    # 3. Administrations & Démarches
    if any(w in msg_lower for w in ["admin", "commune", "mairie", "cin", "passeport", "naissance", "cnss", "cnam", "poste", "papier", "démarche"]):
        return {
            "content": "L'annuaire des **Administrations** vous guide pour vos démarches officielles en Tunisie :\n\n"
                       "• 🆔 **Carte d'Identité (CIN)** : Extrait de naissance (0.150 TND) + 3 photos + timbre 7.5 TND à la police/garde nationale\n"
                       "• 🛂 **Passeport** : Timbre fiscal 75 TND (élèves/étudiants) ou 80 TND au poste de police\n"
                       "• 🏢 **Services publics** : Localisation des 350 municipalités, 24 gouvernorats, bureaux de Poste, CNSS et CNAM.",
            "suggested_actions": [
                {"label": "🏛️ Annuaire Administrations", "link": "/client/administrations"}
            ]
        }

    # 4. Économie & Prix (Éco Pulse)
    if any(w in msg_lower for w in ["éco", "eco", "prix", "dinar", "essence", "carburant", "gazole", "inflation", "devise", "euro", "dollar"]):
        return {
            "content": "La section **Éco Pulse** fournit les données économiques du quotidien en Tunisie :\n\n"
                       "• 💱 **Cours du Dinar** : 1 EUR ≈ 3.355 TND | 1 USD ≈ 3.095 TND\n"
                       "• ⛽ **Carburants** : Essence SP 95 = 2.530 TND/L | Gazole = 2.205 TND/L\n"
                       "• 📈 **Inflation** : Taux d'inflation actuel de 5.1% (IPC 196.2).",
            "suggested_actions": [
                {"label": "📊 Dashboard Éco Pulse", "link": "/client/eco"}
            ]
        }

    # 5. Magasins & Promos
    if any(w in msg_lower for w in ["magasin", "supermarché", "supermarche", "carrefour", "monoprix", "géant", "geant", "mg", "aziza", "promo", "course"]):
        return {
            "content": "Retrouvez plus de **65+ magasins et grandes surfaces** en Tunisie dans la section **Magasins** :\n\n"
                       "• 🛒 **Enseignes** : Carrefour, Monoprix, Géant, MG (Magasin Général), Aziza, BATAM\n"
                       "• 📍 **Filtres** : Horaires d'ouverture temps réel, promotions en cours, localisation sur carte et calcul d'itinéraire.",
            "suggested_actions": [
                {"label": "🛒 Chercher un Magasin", "link": "/client/magasins"}
            ]
        }

    # 6. Plages & Baignade
    if any(w in msg_lower for w in ["plage", "baignade", "mer", "eau", "vague", "uv", "marsa", "sousse", "bizerte", "mahdia"]):
        return {
            "content": "Consultez l'indice de **Baignade & Qualité des Plages** en temps réel :\n\n"
                       "• 🟢 **Conditions actuelles** : Évaluation du pH de l'eau, température marine et vent\n"
                       "• 🏖️ **Zones couvertes** : La Marsa, Gammarth, Boujaafar Sousse, Corniche Bizerte, Kélibia, Mahdia, Djerba.",
            "suggested_actions": [
                {"label": "🏖️ Qualité des Plages", "link": "/client/beaches"}
            ]
        }

    # 7. Environnement & Air
    if any(w in msg_lower for w in ["environnement", "air", "co2", "bruit", "pollution", "déchet", "poubelle", "qualité"]):
        return {
            "content": "Surveillez les données environnementales de votre ville :\n\n"
                       "• 💨 **CO₂ & Air** : Taux de dioxyde de carbone et qualité de l'air ambiant\n"
                       "• 🔊 **Niveau sonore** : Mesure en décibels (dB) dans les zones d'affluence\n"
                       "• 🗑️ **Gestion des déchets** : Alertes de remplissage des conteneurs intelligents (>85%).",
            "suggested_actions": [
                {"label": "🌿 Données Environnement", "link": "/client/environment"},
                {"label": "⚡ Infrastructure Urbaine", "link": "/client/infrastructure"}
            ]
        }

    # 8. Réponse générale par défaut
    return {
        "content": "Bienvenue sur **Pulse City** 🇹🇳, la plateforme Smart City de Tunisie !\n\n"
                   "Je peux vous accompagner sur l'ensemble de nos services :\n"
                   "• 🚗 **Trajets & Mobilité** : Itinéraires métros, trains, louages, bus et taxis\n"
                   "• 🏥 **Santé** : Carte des hôpitaux, cliniques, CSB et pharmacies 24h\n"
                   "• 🏛️ **Administrations** : Mairies, Poste, CNSS, CNAM et guides de papiers (CIN, passeport)\n"
                   "• 📊 **Éco Pulse** : Taux du dinar, prix des carburants et inflation\n"
                   "• 🛒 **Magasins** : Carrefour, Monoprix, Géant, MG, Aziza et promos\n"
                   "• 📍 **Pulse Local** : Restaurants, cafés, musées et POIs touristiques\n"
                   "• 🏖️ **Plages** : Qualité de l'eau et météo marine\n\n"
                   "Sélectionnez un service ci-dessous pour y accéder directement :",
        "suggested_actions": [
            {"label": "🚗 Trajets", "link": "/client/trip-simulator"},
            {"label": "🏥 Santé", "link": "/client/sante"},
            {"label": "🏛️ Admin", "link": "/client/administrations"},
            {"label": "📊 Éco Pulse", "link": "/client/eco"},
            {"label": "🛒 Magasins", "link": "/client/magasins"},
            {"label": "📍 Local", "link": "/client/local"},
            {"label": "🏖️ Plages", "link": "/client/beaches"},
            {"label": "🌿 Environnement", "link": "/client/environment"},
            {"label": "🏆 Classement", "link": "/client/ranking"},
            {"label": "🔔 Alertes", "link": "/client/alerts"}
        ]
    }


class ChatAgent:
    def __init__(self):
        self.api_url = "https://api.groq.com/openai/v1/chat/completions"
        self.model = "llama-3.1-8b-instant"

    def ask_chat(self, system_prompt: str, history: list, user_message: str, api_key: str = None) -> dict:
        key = api_key if (api_key and api_key.strip()) else settings.GROQ_API_KEY
        
        # Si aucune clé Groq n'est configurée ou si elle est vide/défaut ("" ou "change-me"), utiliser le fallback intelligent directement
        if not key or key.strip() in ["", "change-me", "GROQ_API_KEY"]:
            print("[ChatAgent] Pas de clé Groq valide, utilisation du moteur de réponse locale.")
            return generate_smart_fallback(user_message, system_prompt)

        headers = {
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json"
        }

        messages = [{"role": "system", "content": system_prompt}]
        for msg in history[-8:]:
            if isinstance(msg, dict) and "role" in msg and "content" in msg:
                messages.append({"role": msg["role"], "content": msg["content"]})
        
        if not history or history[-1].get("content") != user_message:
            messages.append({"role": "user", "content": user_message})

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.3,
            "max_tokens": 1000
        }

        try:
            response = requests.post(self.api_url, headers=headers, json=payload, timeout=8)
            if response.status_code == 200:
                data = response.json()
                raw_reply = data["choices"][0]["message"]["content"]
                
                suggested_actions = []
                clean_reply = raw_reply
                
                match = re.search(r'SUGGESTED_ACTIONS:\s*(\[.*?\])', raw_reply, re.DOTALL)
                if match:
                    try:
                        suggested_actions = json.loads(match.group(1))
                        clean_reply = raw_reply.replace(match.group(0), '').strip()
                    except Exception as parse_err:
                        print(f"Error parsing suggested actions: {parse_err}")
                
                return {
                    "content": clean_reply,
                    "suggested_actions": suggested_actions
                }
            else:
                print(f"Groq API Error: {response.status_code} - {response.text}. Fallback actif.")
                return generate_smart_fallback(user_message, system_prompt)
        except Exception as e:
            print(f"Exception calling Groq API: {e}. Fallback actif.")
            return generate_smart_fallback(user_message, system_prompt)

    def ask(self, system_prompt: str, user_message: str, api_key: str = None) -> str:
        res = self.ask_chat(system_prompt, [], user_message, api_key)
        return res["content"]

chat_agent = ChatAgent()
