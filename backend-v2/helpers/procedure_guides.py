"""
helpers/procedure_guides.py — Fiches pratiques des démarches administratives tunisiennes.
Données embarquées inline.
"""
from typing import List, Dict, Any

CATEGORIES = {
    "etat_civil":  {"label": "État Civil",          "emoji": "📋", "color": "#1565C0"},
    "interieur":   {"label": "Intérieur & Sécurité","emoji": "🪪",  "color": "#C62828"},
    "finances":    {"label": "Finances & Impôts",   "emoji": "💰", "color": "#F57C00"},
    "social":      {"label": "Protection Sociale",  "emoji": "🛡️", "color": "#388E3C"},
    "urbanisme":   {"label": "Urbanisme",            "emoji": "🏗️", "color": "#5D4037"},
    "economie":    {"label": "Économie & Entreprise","emoji": "🏪", "color": "#6A1B9A"},
    "justice":     {"label": "Justice",              "emoji": "⚖️", "color": "#455A64"},
    "transport":   {"label": "Transport",            "emoji": "🚗", "color": "#0277BD"},
    "education":   {"label": "Éducation",            "emoji": "🎓", "color": "#2E7D32"},
    "numerique":   {"label": "Services Numériques",  "emoji": "💻", "color": "#00838F"},
}

# Maps démarche types → établissements correspondants
PROCEDURE_ADMIN_TYPES = {
    "etat_civil": ["municipalite", "delegation"],
    "interieur":  ["police", "delegation", "commissariat"],
    "finances":   ["ministere"],
    "social":     ["cnss", "cnam"],
    "urbanisme":  ["municipalite", "delegation"],
    "economie":   ["delegation", "ministere"],
    "justice":    ["tribunal"],
    "transport":  ["delegation", "ministere"],
}

PROCEDURES: List[Dict[str, Any]] = [
    # ── ÉTAT CIVIL ──────────────────────────────────────────────────────────
    {
        "id": "extrait-naissance",
        "title": "Demande d'extrait de naissance",
        "category": "etat_civil",
        "description": "Obtenir une copie ou un extrait de l'acte de naissance pour toute formalité administrative.",
        "required_documents": [
            "Carte d'identité nationale (CIN) du demandeur",
            "Numéro de l'acte de naissance et sa date",
            "Jugement du tribunal (pour les non-intéressés directs)"
        ],
        "where": ["municipalite", "delegation"],
        "delay": "24 à 48 heures",
        "cost": "0.150 TND (extrait) / 0.200 TND (copie intégrale)",
        "online": False,
        "steps": [
            "Se rendre au bureau d'état civil de la commune d'inscription de l'acte",
            "Présenter la CIN et indiquer le numéro d'acte",
            "Payer la redevance au guichet",
            "Récupérer l'extrait immédiatement ou sous 48h"
        ],
        "legal_refs": ["Loi n°57-3 du 1er août 1957 relative à l'état civil"],
        "useful_links": [],
        "notes": "Gratuit pour les actes de naissance des enfants de moins d'1 an."
    },
    {
        "id": "livret-famille",
        "title": "Demande de livret de famille",
        "category": "etat_civil",
        "description": "Obtenir ou renouveler le livret de famille suite à un mariage.",
        "required_documents": [
            "Photo d'identité du chef de famille",
            "Extrait de l'acte de mariage",
            "Extraits de naissance des deux conjoints",
            "Extraits de naissance des enfants (si applicable)"
        ],
        "where": ["municipalite"],
        "delay": "Immédiat si mariage célébré à la mairie / 1 semaine sinon",
        "cost": "1.000 TND",
        "online": False,
        "steps": [
            "Se rendre à la municipalité du lieu de mariage",
            "Fournir les pièces justificatives",
            "Payer la redevance",
            "Retirer le livret de famille"
        ],
        "legal_refs": [],
        "useful_links": [],
        "notes": "En cas de perte, une déclaration de perte auprès de la police est requise."
    },
    {
        "id": "acte-mariage",
        "title": "Contrat de mariage civil",
        "category": "etat_civil",
        "description": "Célébrer et enregistrer un mariage civil à la municipalité.",
        "required_documents": [
            "Extraits de naissance des deux conjoints",
            "Certificat médical prénuptial pour les deux parties",
            "Photocopies des CIN des deux conjoints",
            "CIN des deux témoins",
            "Expédition du jugement de divorce (si divorcé(e))",
            "Extrait de décès du conjoint précédent (si veuf/veuve)"
        ],
        "where": ["municipalite"],
        "delay": "2 jours à 1 semaine (délai de publication)",
        "cost": "1.500 TND",
        "online": False,
        "steps": [
            "Déposer la demande au bureau d'état civil",
            "Publication de l'avis de mariage (48h minimum)",
            "Fixer la date et l'heure de la cérémonie",
            "Signature du contrat devant l'officier d'état civil et les deux témoins",
            "Délivrance du livret de famille"
        ],
        "legal_refs": ["Code du Statut Personnel, Art. 3 et suivants"],
        "useful_links": [],
        "notes": "L'âge minimum légal du mariage est de 18 ans pour les deux conjoints."
    },
    {
        "id": "acte-deces",
        "title": "Déclaration de décès",
        "category": "etat_civil",
        "description": "Déclarer un décès et obtenir l'acte de décès officiel.",
        "required_documents": [
            "Certificat médical de décès signé par un médecin",
            "CIN du défunt (si disponible)",
            "CIN du déclarant"
        ],
        "where": ["municipalite"],
        "delay": "Immédiat (à déclarer dans les 24h)",
        "cost": "Gratuit",
        "online": False,
        "steps": [
            "Se rendre immédiatement à la municipalité (délai légal : 24h)",
            "Présenter le certificat médical de décès",
            "L'officier d'état civil établit l'acte de décès",
            "Obtenir plusieurs exemplaires pour les démarches successorales"
        ],
        "legal_refs": ["Loi n°57-3 du 1er août 1957, Art. 30"],
        "useful_links": [],
        "notes": "Déclaration obligatoire dans les 24 heures suivant le décès."
    },

    # ── INTÉRIEUR ────────────────────────────────────────────────────────────
    {
        "id": "cin-renouvellement",
        "title": "Renouvellement de la CIN",
        "category": "interieur",
        "description": "Renouveler la Carte d'Identité Nationale (CIN) expirée, perdue ou abîmée.",
        "required_documents": [
            "Ancienne CIN (si disponible)",
            "Extrait de naissance récent (moins d'1 an)",
            "2 photos d'identité récentes sur fond blanc",
            "Certificat de résidence si changement d'adresse"
        ],
        "where": ["police", "delegation"],
        "delay": "2 à 4 semaines",
        "cost": "7.500 TND + timbre fiscal 1.000 TND",
        "online": True,
        "online_url": "https://e-bawaba.tn",
        "steps": [
            "Se rendre au commissariat ou à la délégation avec les pièces",
            "Remplir le formulaire de demande",
            "Payer les frais administratifs",
            "Récupérer la CIN sur présentation du récépissé"
        ],
        "legal_refs": ["Décret-loi n°93-2002 relatif à la carte d'identité nationale"],
        "useful_links": [{"label": "e-bawaba.tn", "url": "https://e-bawaba.tn"}],
        "notes": "En cas de perte, une déclaration de perte au commissariat est obligatoire avant la demande."
    },
    {
        "id": "passeport",
        "title": "Demande de passeport biométrique",
        "category": "interieur",
        "description": "Obtenir un nouveau passeport biométrique tunisien (première demande, renouvellement, ou perte).",
        "required_documents": [
            "CIN valide",
            "Extrait de naissance récent (moins d'1 an)",
            "2 photos d'identité biométriques récentes",
            "Fiche de renseignements complétée",
            "Ancien passeport (si renouvellement)",
            "Déclaration de perte (si perte)"
        ],
        "where": ["police", "delegation"],
        "delay": "2 à 4 semaines",
        "cost": "75 TND (validité 5 ans) / 100 TND (validité 10 ans)",
        "online": True,
        "online_url": "https://e-bawaba.tn",
        "steps": [
            "Prise de rendez-vous en ligne ou sur place",
            "Dépôt du dossier complet",
            "Prise d'empreintes et photo biométrique",
            "Paiement des frais",
            "Retrait du passeport (sous 2 à 4 semaines)"
        ],
        "legal_refs": [],
        "useful_links": [{"label": "e-bawaba.tn", "url": "https://e-bawaba.tn"}],
        "notes": "Les mineurs de moins de 18 ans doivent être accompagnés d'un parent ou tuteur légal."
    },

    # ── FINANCES ─────────────────────────────────────────────────────────────
    {
        "id": "timbre-fiscal",
        "title": "Achat de timbre fiscal électronique",
        "category": "finances",
        "description": "Acheter des timbres fiscaux numériques pour toute procédure administrative.",
        "required_documents": [
            "Compte e-dinar (CCP ou carte bancaire Poste)"
        ],
        "where": ["en_ligne"],
        "delay": "Immédiat",
        "cost": "Selon montant (0.600 TND à plusieurs TND selon acte)",
        "online": True,
        "online_url": "https://e-dinar.poste.tn",
        "steps": [
            "Se connecter au portail e-dinar.poste.tn",
            "Choisir le type et le montant du timbre",
            "Payer via CCP ou carte bancaire",
            "Télécharger et imprimer le timbre fiscal électronique"
        ],
        "legal_refs": [],
        "useful_links": [
            {"label": "e-dinar.poste.tn", "url": "https://e-dinar.poste.tn"}
        ],
        "notes": "Le timbre fiscal électronique est légalement équivalent au timbre papier depuis 2020."
    },
    {
        "id": "e-tasrih",
        "title": "Télé-déclaration fiscale (e-Tasrih)",
        "category": "finances",
        "description": "Déclarer ses revenus et payer ses impôts en ligne via le portail e-Tasrih.",
        "required_documents": [
            "Numéro d'Identification Fiscal (NIF)",
            "Mot de passe e-Tasrih",
            "Documents comptables de l'exercice"
        ],
        "where": ["en_ligne"],
        "delay": "Immédiat",
        "cost": "Gratuit (service public)",
        "online": True,
        "online_url": "https://e-tasrih.finances.gov.tn",
        "steps": [
            "Se connecter à e-tasrih.finances.gov.tn avec NIF et mot de passe",
            "Choisir le type de déclaration (IS, IRPP, TVA...)",
            "Saisir les données comptables",
            "Valider et soumettre la déclaration",
            "Payer en ligne si impôt est dû"
        ],
        "legal_refs": ["Code de l'IRPP et de l'IS"],
        "useful_links": [
            {"label": "e-tasrih.finances.gov.tn", "url": "https://e-tasrih.finances.gov.tn"}
        ],
        "notes": "Date limite IRPP personnes physiques : 25 février pour les revenus salariaux."
    },

    # ── SOCIAL ───────────────────────────────────────────────────────────────
    {
        "id": "carte-cnam",
        "title": "Demande de carte CNAM",
        "category": "social",
        "description": "Obtenir la carte d'assurance maladie CNAM pour bénéficier du remboursement des soins.",
        "required_documents": [
            "CIN",
            "Attestation d'affiliation CNSS ou CNRPS",
            "Photo d'identité récente"
        ],
        "where": ["cnam"],
        "delay": "2 à 4 semaines",
        "cost": "Gratuit",
        "online": False,
        "steps": [
            "Se rendre au centre CNAM le plus proche",
            "Déposer le dossier complet",
            "Recevoir un récépissé de dépôt",
            "Retirer la carte sur présentation du récépissé"
        ],
        "legal_refs": ["Loi n°2004-71 du 2 août 2004 relative à l'assurance maladie"],
        "useful_links": [
            {"label": "cnam.nat.tn", "url": "https://cnam.nat.tn"},
            {"label": "N° vert CNAM", "url": "tel:80100295"}
        ],
        "notes": "Numéro vert CNAM : 80 100 295 (appel gratuit). La carte CNAM est renouvelable tous les 2 ans."
    },
    {
        "id": "affiliation-cnss",
        "title": "Affiliation à la CNSS",
        "category": "social",
        "description": "Affilier une entreprise, un employeur ou un travailleur indépendant à la Caisse Nationale de Sécurité Sociale.",
        "required_documents": [
            "CIN du représentant légal",
            "Extrait du registre de commerce (si entreprise)",
            "Contrat de travail ou attestation d'emploi",
            "Relevé d'identité bancaire (RIB)"
        ],
        "where": ["cnss"],
        "delay": "1 à 2 semaines",
        "cost": "Gratuit",
        "online": True,
        "online_url": "https://cnss.tn",
        "steps": [
            "Créer un compte sur le portail cnss.tn",
            "Remplir le formulaire d'affiliation en ligne",
            "Télécharger les documents scannés",
            "Validation par les services CNSS",
            "Réception de l'attestation d'affiliation et du numéro CNSS"
        ],
        "legal_refs": ["Loi n°60-30 du 14 décembre 1960 instituant la CNSS"],
        "useful_links": [{"label": "cnss.tn", "url": "https://cnss.tn"}],
        "notes": "L'affiliation est obligatoire dans les 30 jours suivant le début d'activité."
    },

    # ── URBANISME ────────────────────────────────────────────────────────────
    {
        "id": "permis-construire",
        "title": "Demande de permis de construire",
        "category": "urbanisme",
        "description": "Obtenir l'autorisation de construire, d'agrandir ou de rénover un bâtiment.",
        "required_documents": [
            "Demande timbrée (timbre fiscal)",
            "Titre foncier ou contrat de vente notarié",
            "Plans architecturaux visés par un architecte agréé",
            "Certificat d'urbanisme",
            "Fiche technique du projet"
        ],
        "where": ["municipalite", "delegation"],
        "delay": "1 à 3 mois selon la nature du projet",
        "cost": "Variable selon la surface (calculé en m²)",
        "online": True,
        "online_url": "https://taamir.tn",
        "steps": [
            "Obtenir le certificat d'urbanisme auprès de la municipalité",
            "Faire réaliser les plans par un architecte agréé",
            "Déposer le dossier sur taamir.tn ou à la municipalité",
            "Étude technique par les services compétents (1-3 mois)",
            "Visite des lieux si nécessaire",
            "Délivrance du permis ou demande de complément"
        ],
        "legal_refs": ["Loi n°94-122 relative à l'aménagement du territoire"],
        "useful_links": [{"label": "Portail Taamir", "url": "https://taamir.tn"}],
        "notes": "Le commencement des travaux sans permis est passible d'amendes et de démolition."
    },
    {
        "id": "permis-lotir",
        "title": "Demande de permis de lotir",
        "category": "urbanisme",
        "description": "Diviser un terrain en plusieurs lots constructibles.",
        "required_documents": [
            "Titre foncier",
            "Plan topographique du terrain",
            "Demande timbrée",
            "Accord des copropriétaires (si indivis)"
        ],
        "where": ["municipalite", "delegation"],
        "delay": "2 à 6 mois",
        "cost": "Variable",
        "online": True,
        "online_url": "https://taamir.tn",
        "steps": [
            "Déposer la demande à la municipalité avec le plan topographique",
            "Étude par la commission d'urbanisme",
            "Approbation du plan de lotissement",
            "Travaux de viabilisation",
            "Réception et délivrance des titres de propriété des lots"
        ],
        "legal_refs": [],
        "useful_links": [],
        "notes": None
    },

    # ── ÉCONOMIE ─────────────────────────────────────────────────────────────
    {
        "id": "creation-entreprise",
        "title": "Création d'entreprise (SARL, SUARL, EI...)",
        "category": "economie",
        "description": "Créer et immatriculer une entreprise en Tunisie — 100% en ligne depuis 2026.",
        "required_documents": [
            "CIN du ou des fondateurs",
            "Statuts de la société (pour SARL/SA)",
            "Attestation de dépôt de capital (banque)",
            "Déclaration d'existence"
        ],
        "where": ["en_ligne"],
        "delay": "24 à 72 heures (en ligne) / 2 semaines (classique)",
        "cost": "Variable selon forme juridique (0 à plusieurs centaines de TND)",
        "online": True,
        "online_url": "https://rne.tn",
        "steps": [
            "Créer un compte sur rne.tn",
            "Choisir la forme juridique (SARL, SUARL, EI, SNC...)",
            "Télécharger les documents requis",
            "Paiement en ligne des frais d'enregistrement",
            "Transmission automatique à la Direction Générale des Impôts",
            "Obtention du NIF (Numéro d'Identification Fiscal)",
            "Finalisation de l'immatriculation"
        ],
        "legal_refs": ["Loi n°2019-47 sur l'amélioration du climat des affaires"],
        "useful_links": [
            {"label": "Registre National des Entreprises (RNE)", "url": "https://rne.tn"},
            {"label": "API — Agence de Promotion de l'Investissement", "url": "https://www.tunisieinvestissement.tn"}
        ],
        "notes": "Depuis 2026, la création d'entreprise est 100% dématérialisée via rne.tn."
    },

    # ── TRANSPORT ────────────────────────────────────────────────────────────
    {
        "id": "permis-conduire",
        "title": "Permis de conduire (1ère demande ou renouvellement)",
        "category": "transport",
        "description": "Obtenir un permis de conduire tunisien pour la première fois, ou le renouveler.",
        "required_documents": [
            "CIN valide",
            "Certificat médical d'aptitude (médecin agréé)",
            "2 photos d'identité",
            "Attestation de formation (auto-école agréée, 1ère demande)",
            "Relevé de notes du code (1ère demande)"
        ],
        "where": ["delegation"],
        "delay": "1 à 3 semaines après réussite des examens",
        "cost": "Variable selon catégorie (B : ~80 TND avec auto-école)",
        "online": False,
        "steps": [
            "S'inscrire dans une auto-école agréée (1ère demande)",
            "Passer et réussir l'examen du code",
            "Passer et réussir l'examen de conduite",
            "Déposer le dossier à la délégation",
            "Retirer le permis sous 1 à 3 semaines"
        ],
        "legal_refs": [],
        "useful_links": [],
        "notes": "L'âge minimum est 18 ans pour le permis B (voiture)."
    },

    # ── NUMÉRIQUE ────────────────────────────────────────────────────────────
    {
        "id": "e-bawaba",
        "title": "Portail e-Bawaba — Services administratifs en ligne",
        "category": "numerique",
        "description": "Accéder à l'ensemble des services administratifs tunisiens dématérialisés via e-bawaba.tn.",
        "required_documents": [
            "Mobile ID (identité numérique tunisienne)",
            "Carte SIM tunisienne active"
        ],
        "where": ["en_ligne"],
        "delay": "Variable selon le service",
        "cost": "Variable selon le service",
        "online": True,
        "online_url": "https://e-bawaba.tn",
        "steps": [
            "Activer le service Mobile ID auprès de votre opérateur téléphonique",
            "Se connecter sur e-bawaba.tn avec le Mobile ID",
            "Naviguer vers le service souhaité",
            "Soumettre la demande et payer en ligne si nécessaire",
            "Suivre l'avancement du dossier en ligne"
        ],
        "legal_refs": [],
        "useful_links": [{"label": "e-bawaba.tn", "url": "https://e-bawaba.tn"}],
        "notes": "e-Bawaba regroupe plus de 200 services administratifs tunisiens en ligne depuis 2025."
    },
]


def get_all_procedures() -> List[Dict[str, Any]]:
    """Retourne toutes les fiches pratiques enrichies."""
    result = []
    for p in PROCEDURES:
        enriched = dict(p)
        cat = CATEGORIES.get(p["category"], {})
        enriched["category_label"] = cat.get("label", p["category"])
        enriched["category_emoji"] = cat.get("emoji", "📋")
        enriched["category_color"] = cat.get("color", "#607D8B")
        enriched["admin_types"] = PROCEDURE_ADMIN_TYPES.get(p["category"], [])
        result.append(enriched)
    return result


def get_procedure_by_id(procedure_id: str) -> Dict[str, Any]:
    for p in PROCEDURES:
        if p["id"] == procedure_id:
            cat = CATEGORIES.get(p["category"], {})
            return {
                **p,
                "category_label": cat.get("label", p["category"]),
                "category_emoji": cat.get("emoji", "📋"),
                "category_color": cat.get("color", "#607D8B"),
                "admin_types": PROCEDURE_ADMIN_TYPES.get(p["category"], []),
            }
    return {}


def search_procedures(q: str = "", category: str = "") -> List[Dict[str, Any]]:
    all_procs = get_all_procedures()
    if not q and not category:
        return all_procs
    results = []
    q_lower = q.lower().strip()
    for p in all_procs:
        if category and p["category"] != category:
            continue
        if q_lower:
            searchable = (
                p["title"].lower() + " " +
                p["description"].lower() + " " +
                " ".join(p.get("required_documents", [])).lower()
            )
            if q_lower not in searchable:
                continue
        results.append(p)
    return results
