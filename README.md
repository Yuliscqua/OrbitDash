# OrbitDash

Interface de monitoring ultra-personnalisable avec widgets interactifs.

## Démarrage rapide

```bash
npm install
npm run dev
```

L'application tourne sur `http://localhost:5173`.

## Architecture

```
src/
├── types/              # Interfaces TypeScript (contrats des widgets)
├── context/            # Contextes React
│   ├── ThemeContext     # Mode sombre/clair + densité (Compact/Normal/Spaced)
│   └── AuthContext      # Utilisateur courant + rôle (admin/user)
├── hooks/
│   └── useWidgetStore   # Store Zustand (état global des widgets)
├── services/
│   ├── defaultWidgets   # Données de seed
│   └── utils            # Fonctions utilitaires
└── components/
    ├── ui/              # Composants génériques (Button, Input, Card, Badge...)
    ├── widgets/         # Widgets (contrat: grid | focus | fullscreen)
    │   ├── WidgetWrapper    # Enveloppe commune (header, actions)
    │   ├── WidgetRenderer   # Routeur type → composant
    │   ├── PollWidget       # Sondage
    │   ├── CryptoWidget     # Crypto (real-time simulation)
    │   ├── StatsWidget      # Métriques
    │   └── OtherWidgets     # RSS, Clock, Note, Calendar
    ├── layout/
    │   ├── Navbar           # Navigation, theme, user
    │   └── DashboardLayout  # Grille + zone focus + plein écran
    └── admin/
        ├── AdminView        # Vue administration globale
        ├── AdminWidgetPanel # Édition de widget (modal)
        └── WidgetFactory    # Création de nouveau widget
```

## Fonctionnalités implémentées

### Base (15 pts)
- ✅ Composants génériques réutilisables (Button, Input, Card, Badge, Select, Toggle, Textarea)
- ✅ Abstraction des widgets avec 3 modes : `grid` | `focus` | `fullscreen`
- ✅ Zone centrale de focus (panneau latéral)
- ✅ Navigation vers le mode plein écran depuis la zone focus
- ✅ Flag `focusable` par widget
- ✅ Vue administration complète
- ✅ Édition du contenu des widgets depuis l'admin
- ✅ Modifications immédiatement visibles (Zustand)
- ✅ Persistance via `localStorage` (zustand/middleware `persist`)

### Avancées (5 pts)
- ✅ **Admin Layout Mode** : Drag & Swap via @dnd-kit, verrouillé aux admins
- ✅ **Theme Engine** : Context + `data-theme` + `data-density` (Compact/Normal/Spacieux)
- ✅ **Real-time Update** : Simulation WebSocket sur le widget Crypto (mise à jour toutes les 3s)
- ✅ **Widget Factory** : Formulaire d'ajout de widget avec type + titre + position

## Widgets disponibles

| Type | Focusable | Fonctionnalité in-place | Vue focus |
|------|-----------|------------------------|-----------|
| Poll | ✅ | Vote direct | Résultats + historique |
| Crypto | ✅ | Prix live | Graphiques + sparklines |
| Stats | ✅ | KPIs condensés | Courbes 7 jours |
| RSS | ✅ | 3 titres | Liste complète |
| Clock | ❌ | Heure principale | Multi-fuseaux |
| Note | ✅ | Aperçu Markdown | Édition inline |
| Calendar | ✅ | 3 prochains événements | Agenda complet |

## Backend

Le projet utilise `localStorage` via Zustand persist pour la persistance.
Pour un vrai backend, remplacer `useWidgetStore` par des appels Supabase/Firebase :

```typescript
// Exemple avec Supabase
const { data } = await supabase.from('widgets').select('*');
```

## Changer de rôle (demo)

Cliquer sur l'icône ↻ dans la navbar pour basculer entre `Admin` et `User`.
- **Admin** : accès à la vue administration, réorganisation drag & drop, édition des widgets
- **User** : dashboard en lecture seule, vote dans les sondages
