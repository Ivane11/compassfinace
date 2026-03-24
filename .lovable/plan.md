
# Finance Flow — App Mobile de Gestion Financière

## Direction Artistique
- **Dark mode** : fond #0A0A0A, accents vert néon #9EF01A (positif) et rouge corail #FF6B6B (dépenses)
- Cartes arrondies (24px), typographie Inter/Geist, icônes Lucide minimalistes
- Affichage mobile-first verrouillé (max-width 480px, centré sur desktop)
- Inspiré du style Wise (capture fournie)

## Navigation — Bottom Tab Bar (4 onglets)
1. **Dashboard** (Accueil)
2. **Revenus** (Entrées)  
3. **Budget** (Dépenses & Charges)
4. **Settings** (Paramètres)

## Pages & Fonctionnalités

### 1. Dashboard (Home)
- Solde total affiché en grand (FCFA)
- Graphique Area Chart de l'évolution du solde sur la semaine (Recharts)
- 3 dernières transactions (entrées/sorties)
- Résumé rapide de la répartition 50/30/20

### 2. Revenus — Ajout de flux
- Formulaire : Source, Montant (FCFA), Date, Récurrence (mensuel/hebdo/unique)
- Pavé numérique optimisé mobile
- Dès qu'un revenu est ajouté → calcul automatique de la répartition **50/30/20** (Besoins/Envies/Épargne)
- Liste des revenus avec possibilité de modifier/supprimer

### 3. Budget & Analytics
- Gestion des charges fixes (Loyer, Internet, Transport, etc.) avec catégories
- **Progress Rings** par catégorie montrant le % du budget consommé
- Graphiques comparatifs mois par mois (bar chart)
- Tendances et prédiction de fin de mois basée sur le rythme de dépenses actuel
- Liste détaillée des dépenses par catégorie avec pourcentages

### 4. Settings
- Définir le salaire/revenu mensuel par défaut
- Personnaliser les catégories de dépenses
- Réinitialiser les données
- À propos de l'app

## Logique Métier
- **Solde en temps réel** = Total revenus − Total dépenses
- **Auto-Budget 50/30/20** : répartition automatique proposée à chaque ajout de revenu
- **Persistance** : toutes les données sauvegardées en localStorage
- **Prédictions** : estimation fin de mois basée sur la moyenne journalière des dépenses

## Stack
- React + TypeScript + Tailwind CSS
- Recharts pour les graphiques (Area Chart, Bar Chart, Progress Rings)
- localStorage pour la persistance
- Lucide Icons
