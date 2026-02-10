# Rapport Technique Frontend — ECO Impact Tracker

---

## 1. Introduction

### 1.1. Présentation du frontend

Le frontend de **ECO Impact Tracker** est une application web monopage (SPA) construite avec React et TypeScript. Il sert d'interface utilisateur pour visualiser et gérer l'empreinte carbone, en communiquant avec le backend Spring Boot via une API REST sécurisée par JWT.

### 1.2. Rôle du frontend

Le frontend assume les responsabilités suivantes :

- **Interface utilisateur** : affichage des données sous forme de tableaux, graphiques et cartes statistiques
- **Authentification client** : gestion des tokens JWT, stockage local, redirection automatique
- **Communication API** : requêtes HTTP vers le backend avec Axios, gestion des erreurs réseau
- **Visualisation des données** : graphiques interactifs (courbes d'émissions, répartition par catégorie)
- **Export de données** : filtrage et téléchargement CSV des activités
- **Expérience utilisateur** : design responsive, animations, skeleton loading, feedback visuel

### 1.3. Objectifs fonctionnels

| Fonctionnalité | Description |
|----------------|-------------|
| **Authentification** | Connexion/inscription avec gestion des tokens JWT |
| **Dashboard** | Vue d'ensemble avec KPIs et graphiques |
| **Gestion des entrées** | CRUD complet des activités quotidiennes |
| **Templates** | Gestion des modèles d'activités avec facteurs CO₂ |
| **Objectifs** | Suivi des objectifs de réduction avec barres de progression |
| **Export** | Filtrage avancé et export CSV des données |

---

## 2. Choix technologiques

### 2.1. React 19

**Ce que c'est :**
React est une bibliothèque JavaScript développée par Meta pour construire des interfaces utilisateur à base de composants réutilisables.

**Pourquoi ce choix :**
- **Composants réutilisables** : architecture modulaire, chaque élément UI est un composant isolé
- **Virtual DOM** : mises à jour performantes, React ne re-render que ce qui change
- **Écosystème mature** : énorme communauté, bibliothèques tierces abondantes
- **Hooks** : `useState`, `useEffect`, `useMemo` simplifient la gestion d'état sans classes
- **Standard industriel** : framework le plus utilisé en entreprise pour le frontend

**Alternatives non retenues :**
- *Vue.js* : plus simple d'accés mais écosystème moins riche que React
- *Angular* : trop lourd et complexe pour un projet de cette taille
- *Svelte* : prometteur mais communauté encore petite comparé à React

---

### 2.2. TypeScript 5.9

**Ce que c'est :**
TypeScript est un sur-ensemble typé de JavaScript, développé par Microsoft, qui ajoute le typage statique au langage.

**Pourquoi ce choix :**
- **Détection d'erreurs** : les erreurs de type sont captées à la compilation, pas en production
- **Autocomplétion** : l'IDE comprend la structure des objets et propose des suggestions
- **Documentation implicite** : les interfaces décrivent les contrats entre composants
- **Refactoring sûr** : renommer une propriété met en évidence tous les usages

**Exemple du projet :**
```typescript
// Interface pour une entrée — le typage documente la structure attendue
export interface Entry {
    id: number;
    quantity: number;
    date: string;
    note: string;
    activityTemplate: {
        id: number;
        name: string;
        co2Factor: number;
        defaultUnit: string;
        activityType?: { id: number; name: string };
    };
}
```

---

### 2.3. Vite 7.2.4

**Ce que c'est :**
Vite est un outil de build frontend créé par Evan You (créateur de Vue.js), basé sur les ES modules natifs du navigateur.

**Pourquoi ce choix :**
- **Démarrage instantané** : le serveur de développement démarre en moins d'une seconde
- **Hot Module Replacement (HMR)** : les modifications sont reflétées immédiatement sans rechargement complet
- **Build optimisé** : utilise Rollup en production pour le tree-shaking et le code splitting
- **Configuration minimale** : fonctionne out-of-the-box avec React et TypeScript

**Alternatives non retenues :**
- *Create React App (CRA)* : obsolète, plus maintenu par Meta
- *Webpack* : configuration complexe et démarrage lent comparé à Vite
- *Next.js* : orienté SSR, surdimensionné pour une SPA simple

**Configuration du projet (`vite.config.ts`) :**
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,    // Échoue si le port est occupé au lieu de chercher un autre
    host: true,          // Écoute sur toutes les interfaces (accès réseau local)
    open: false,
    cors: true,
  },
  logLevel: 'warn',      // Réduit la verbosité des logs Vite
});
```

---

### 2.4. Material UI (MUI) v7

**Ce que c'est :**
Material UI est la bibliothèque de composants React la plus populaire, basée sur les principes du Material Design de Google.

**Pourquoi ce choix :**
- **Composants riches** : boutons, tableaux, dialogues, formulaires, barres de progression prêts à l'emploi
- **Personnalisation avancée** : système de thème complet pour adapter le design
- **Accessibilité** : composants conformes aux standards ARIA par défaut
- **Responsive** : breakpoints et utilitaires intégrés (`useMediaQuery`, `sx` prop)

**Packages installés :**

| Package | Rôle |
|---------|------|
| `@mui/material` | Composants principaux (Button, Card, Dialog, Table...) |
| `@mui/icons-material` | Icônes Material Design (500+ icônes) |
| `@mui/x-data-grid` | Tableau de données avancé (tri, filtrage, pagination) |
| `@emotion/react` + `@emotion/styled` | Moteur CSS-in-JS utilisé par MUI |

**Alternatives non retenues :**
- *Ant Design* : design moins moderne, moins personnalisable
- *Chakra UI* : moins de composants avancés (pas de DataGrid natif)
- *CSS pur / Tailwind* : trop de travail pour atteindre le même niveau de qualité

---

### 2.5. Recharts 3.6

**Ce que c'est :**
Recharts est une bibliothèque de graphiques construite spécifiquement pour React, utilisant D3.js en interne.

**Pourquoi ce choix :**
- **Intégration React native** : les graphiques sont des composants React, pas du DOM manipulé manuellement
- **API déclarative** : `<LineChart>`, `<PieChart>`, `<Tooltip>` s'utilisent comme du JSX
- **Responsive** : `<ResponsiveContainer>` s'adapte automatiquement à la taille du parent
- **Personnalisable** : tooltips et légendes custom avec des composants React

**Exemple du projet (Dashboard) :**
```tsx
<ResponsiveContainer width="100%" height={300}>
    <LineChart data={dailyData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
        <XAxis dataKey="date" tickFormatter={(d) => format(new Date(d), 'dd MMM')} />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Line type="monotone" dataKey="totalCo2" stroke="#16A34A" strokeWidth={2.5} />
    </LineChart>
</ResponsiveContainer>
```

---

### 2.6. Axios 1.13

**Ce que c'est :**
Axios est un client HTTP JavaScript basé sur les Promises, fonctionnant dans le navigateur et Node.js.

**Pourquoi ce choix :**
- **Intercepteurs** : possibilité d'ajouter automatiquement le token JWT et de gérer les erreurs 401
- **Instances configurables** : une instance Axios centralisée avec le `baseURL` et les headers
- **Transformation automatique** : sérialisation/désérialisation JSON transparente
- **Gestion des erreurs** : structure d'erreur riche avec `error.response.status`

**Alternatives non retenues :**
- *Fetch API natif* : pas d'intercepteurs, gestion des erreurs plus verbieuse
- *React Query / TanStack Query* : couche supplémentaire inutile pour la taille du projet

---

### 2.7. React Router DOM 7

**Ce que c'est :**
React Router est la bibliothèque standard de routage pour React, permettant la navigation entre pages sans rechargement.

**Pourquoi ce choix :**
- **Navigation SPA** : changement de page instantané, sans requête serveur
- **Routes protégées** : composant `ProtectedRoute` pour garder les pages authentifiées
- **Hooks** : `useNavigate`, `useLocation` pour la navigation programmatique

---

### 2.8. date-fns 4.1

**Ce que c'est :**
Bibliothèque de manipulation de dates JavaScript, légère et modulaire.

**Pourquoi ce choix :**
- **Tree-shakeable** : on importe uniquement les fonctions utilisées (`format`, `subDays`)
- **Immutable** : ne modifie jamais l'objet Date original
- **Léger** : beaucoup plus petit que Moment.js (qui est obsolète)

**Alternative non retenue :**
- *Moment.js* : obsolète et trop lourd (300+ KB)

---

## 3. Architecture du frontend

### 3.1. Organisation globale

Le projet suit une organisation par fonctionnalité, conforme aux bonnes pratiques React :

```
eco-impact-tracker-frontend/
├── index.html                    # Point d'entrée HTML
├── package.json                  # Dépendances et scripts
├── vite.config.ts                # Configuration Vite
├── tsconfig.json                 # Configuration TypeScript
├── .env                          # Variables d'environnement (VITE_API_BASE_URL)
├── .env.development              # Variables spécifiques au dev (VITE_LOG_LEVEL)
└── src/
    ├── main.tsx                  # Bootstrap React (createRoot)
    ├── App.tsx                   # Routing et providers
    ├── App.css                   # Styles globaux (hérité de Vite)
    ├── index.css                 # Reset CSS + styles globaux personnalisés
    ├── theme.ts                  # Thème Material UI (~530 lignes)
    ├── auth/                     # Couche d'authentification
    │   ├── AuthContext.tsx        # Context React + Provider
    │   └── ProtectedRoute.tsx    # Guard de route
    ├── api/                      # Clients API (Axios)
    │   ├── axiosClient.ts        # Instance Axios centralisée
    │   ├── authApi.ts            # POST /auth/register, /auth/login
    │   ├── entriesApi.ts         # CRUD /entries
    │   ├── statsApi.ts           # GET /stats/summary, by-day, by-type
    │   ├── templatesApi.ts       # CRUD /activity-templates
    │   ├── goalsApi.ts           # CRUD /goals
    │   ├── activityTypesApi.ts   # CRUD /activity-types
    │   └── devApi.ts             # POST /dev/generate-user-data
    ├── pages/                    # Pages de l'application
    │   ├── DashboardPage.tsx     # KPIs + graphiques (431 lignes)
    │   ├── EntriesPage.tsx       # CRUD entrées (424 lignes)
    │   ├── TemplatesPage.tsx     # CRUD templates (466 lignes)
    │   ├── GoalsPage.tsx         # CRUD objectifs (425 lignes)
    │   ├── ExportPage.tsx        # Filtrage + export CSV (534 lignes)
    │   ├── LoginPage.tsx         # Connexion (230 lignes)
    │   └── RegisterPage.tsx      # Inscription (250 lignes)
    ├── components/               # Composants partagés
    │   ├── AppLayout.tsx         # Sidebar + AppBar responsive (365 lignes)
    │   ├── StatCard.tsx          # Carte KPI avec tendance
    │   ├── TemplatePicker.tsx    # Sélecteur de template (favoris, récents, recherche)
    │   ├── FormDialog.tsx        # Dialogue de formulaire réutilisable
    │   ├── ConfirmDialog.tsx     # Dialogue de confirmation (suppression)
    │   ├── EmptyState.tsx        # État vide avec illustration
    │   ├── ErrorAlert.tsx        # Alerte d'erreur
    │   ├── Loading.tsx           # Skeleton loading (cards, table, default)
    │   ├── PageHeader.tsx        # En-tête de page avec action
    │   ├── PageContainer.tsx     # Container de page avec padding
    │   └── GenerateDataModal.tsx # Modal de génération de données test
    ├── hooks/                    # Hooks personnalisés
    │   ├── index.ts              # Barrel export
    │   └── useDebouncedValue.ts  # Debounce pour recherche
    └── utils/                    # Utilitaires
        └── tokenStorage.ts      # Gestion du localStorage (token + user)
```

### 3.2. Séparation des responsabilités

| Couche | Responsabilité | Exemple |
|--------|---------------|---------|
| **Pages** | Logique métier, état local, orchestration des appels API | `DashboardPage.tsx` |
| **Components** | UI réutilisable, sans logique métier | `StatCard.tsx` |
| **API** | Communication HTTP, sérialisation des requêtes/réponses | `entriesApi.ts` |
| **Auth** | Gestion de l'état d'authentification et protection des routes | `AuthContext.tsx` |
| **Hooks** | Logique réutilisable encapsulée dans des hooks React | `useDebouncedValue.ts` |
| **Utils** | Fonctions utilitaires pures | `tokenStorage.ts` |
| **Theme** | Configuration du design system | `theme.ts` |

### 3.3. Flux de données

L'application suit un flux unidirectionnel typique de React :

```
Utilisateur → Action (clic, saisie)
    → Page (gestionnaire d'événement)
        → Module API (requête Axios)
            → Backend REST (réponse JSON)
        → setState (mise à jour de l'état)
    → Re-render du composant (nouveau JSX)
→ Affichage mis à jour
```

### 3.4. Diagramme des routes

```
App.tsx (BrowserRouter)
├── /login          → LoginPage           (public)
├── /register       → RegisterPage        (public)
├── /dashboard      → ProtectedRoute → AppLayout → DashboardPage
├── /entries        → ProtectedRoute → AppLayout → EntriesPage
├── /templates      → ProtectedRoute → AppLayout → TemplatesPage
├── /goals          → ProtectedRoute → AppLayout → GoalsPage
├── /export         → ProtectedRoute → AppLayout → ExportPage
└── /               → Navigate → /dashboard (redirection)
```

---

## 4. Système de design (Theme)

### 4.1. Philosophie du design

Le thème a été conçu pour reproduire un design **Apple-like** : minimal, épuré, avec des typographies nettes et des couleurs douces. Le fichier `theme.ts` fait environ 530 lignes et personnalise profondément Material UI.

### 4.2. Palette de couleurs

```typescript
palette: {
    mode: 'light',
    primary: {
        main: '#16A34A',      // Vert — identité écologique
        light: '#22C55E',
        dark: '#15803D',
    },
    secondary: {
        main: '#6366F1',      // Indigo — accent
        light: '#818CF8',
        dark: '#4F46E5',
    },
    background: {
        default: '#FAFAFA',   // Gris très clair
        paper: '#FFFFFF',
    },
    text: {
        primary: '#1D1D1F',   // Noir Apple
        secondary: '#6B7280',
    },
}
```

**Choix des couleurs :**
- Le **vert primaire** (`#16A34A`) symbolise l'écologie et l'environnement
- L'**indigo secondaire** (`#6366F1`) apporte du contraste sans agressivité
- Le **fond gris clair** (`#FAFAFA`) donne un aspect aéré, style Apple

### 4.3. Typographie

```typescript
typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h4: { fontWeight: 700, fontSize: '1.75rem', letterSpacing: '-0.02em' },
    h6: { fontWeight: 600, fontSize: '1.125rem' },
    subtitle2: { fontWeight: 500, letterSpacing: '0.02em' },
}
```

La police **Inter** est chargée depuis Google Fonts dans `index.css` :
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
```

### 4.4. Personnalisations des composants MUI

Le thème modifie le style par défaut de presque tout les composants MUI :

| Composant | Personnalisation |
|-----------|-----------------|
| `MuiButton` | `borderRadius: 10`, padding augmenté, gradient vert sur `containedPrimary` |
| `MuiCard` | Ombre subtile, `borderRadius: 16`, bordure légère |
| `MuiTextField` | `borderRadius: 10`, fond gris clair, transitions douces |
| `MuiDialog` | `borderRadius: 16`, ombre prononcée |
| `MuiAppBar` | Fond blanc, ombre légère, texte sombre (style Apple) |
| `MuiTableCell` | Padding réduit, couleurs alternées sur les lignes |
| `MuiChip` | Coins arrondis, fond semi-transparent |
| `MuiAlert` | `borderRadius: 12`, couleurs adoucies |

**Exemple — Bouton primaire avec gradient :**
```typescript
MuiButton: {
    styleOverrides: {
        root: { borderRadius: 10, padding: '10px 20px', textTransform: 'none' },
        containedPrimary: {
            background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
            '&:hover': {
                background: 'linear-gradient(135deg, #15803D 0%, #166534 100%)',
            },
        },
    },
},
```

### 4.5. Global CSS (`index.css`)

En plus du thème MUI, des styles globaux sont définis dans `index.css` :

- **Reset CSS** : `box-sizing: border-box` sur tout les éléments
- **Scrollbar personnalisée** : fine (8px), grise, avec hover
- **Sélection de texte** : couleur verte semi-transparente (`rgba(22, 163, 74, 0.2)`)
- **Focus visible** : outline vert pour l'accessibilité
- **Anti-aliasing** : rendu de police lissé (`-webkit-font-smoothing: antialiased`)
- **Autofill** : suppression du fond bleu/jaune par défaut des navigateurs

---

## 5. Authentification côté client

### 5.1. Architecture de l'authentification

L'authentification côté frontend repose sur trois fichiers :

| Fichier | Rôle |
|---------|------|
| `AuthContext.tsx` | Context React qui gère l'état utilisateur global |
| `ProtectedRoute.tsx` | Composant qui bloque l'accès aux routes non-authentifiées |
| `tokenStorage.ts` | Utilitaire pour lire/écrire le token et l'utilisateur dans `localStorage` |

### 5.2. AuthContext — Gestion de l'état global

Le contexte d'authentification utilise le **Context API** de React (pas de Redux, c'est suffisant ici) :

```typescript
interface AuthContextType {
    user: AuthResponse | null;    // Données utilisateur (token, email, name)
    loading: boolean;             // true pendant la vérification initiale
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;     // Raccourci : user !== null
}
```

**Flux de connexion :**
```
1. Utilisateur remplit le formulaire → appel login(email, password)
2. AuthContext appelle authApi.login({ email, password })
3. Le backend retourne { token, name, email }
4. tokenStorage.setToken(token) + tokenStorage.setUser(response)
5. setUser(response) → re-render → redirection vers /dashboard
```

**Persistance au rechargement :**
```typescript
useEffect(() => {
    const token = tokenStorage.getToken();
    const storedUser = tokenStorage.getUser();
    if (token && storedUser) {
        setUser(storedUser);  // Restaure la session depuis localStorage
    }
    setLoading(false);
}, []);
```

### 5.3. ProtectedRoute — Garde de route

Le composant `ProtectedRoute` empèche l'accès aux pages protégées :

```typescript
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 20 }}>
                <CircularProgress />   {/* Spinner pendant la vérification */}
            </Box>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;  // Redirige si non connecté
    }

    return <>{children}</>;
};
```

### 5.4. Token Storage — Persistance locale

Le fichier `tokenStorage.ts` encapsule l'accès au `localStorage` :

```typescript
const TOKEN_KEY = 'eco_tracker_token';
const USER_KEY = 'eco_tracker_user';

export const tokenStorage = {
    getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
    setToken: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
    removeToken: (): void => localStorage.removeItem(TOKEN_KEY),
    getUser: (): AuthResponse | null => {
        const user = localStorage.getItem(USER_KEY);
        return user ? JSON.parse(user) : null;
    },
    setUser: (user: AuthResponse): void =>
        localStorage.setItem(USER_KEY, JSON.stringify(user)),
    clear: (): void => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },
};
```

### 5.5. Pourquoi localStorage et pas les cookies

- **Simplicité** : pas de configuration `httpOnly`, `Secure`, `SameSite`
- **Accès JavaScript** : le token est facilement lisible pour les headers Axios
- **Suffisant pour un projet pédagogique** : en production, les cookies httpOnly seraient plus sécurisés contre les attaques XSS

---

## 6. Communication avec le backend (API)

### 6.1. Instance Axios centralisée

Le fichier `axiosClient.ts` configure une instance Axios unique utilisée par tous les modules API :

```typescript
const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081',
    headers: { 'Content-Type': 'application/json' },
});
```

**Variables d'environnement :**

| Fichier | Variable | Valeur |
|---------|----------|--------|
| `.env` | `VITE_API_BASE_URL` | `http://localhost:8081` |
| `.env.development` | `VITE_LOG_LEVEL` | `info` |

**Pourquoi le préfixe `VITE_` :** Vite n'expose que les variables préfixées par `VITE_` au code client (sécurité : empêche l'exposition accidentelle de secrets serveur).

### 6.2. Intercepteurs Axios

**Intercepteur de requête — Ajout du token JWT :**
```typescript
axiosClient.interceptors.request.use((config) => {
    const token = tokenStorage.getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

**Intercepteur de réponse — Gestion des erreurs 401 :**
```typescript
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            tokenStorage.clear();                    // Supprime le token expiré
            window.location.href = '/login';         // Redirige vers la connexion
        }
        return Promise.reject(error);
    }
);
```

**Logging en développement :**
```typescript
if (import.meta.env.DEV) {
    axiosClient.interceptors.request.use((config) => {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
        return config;
    });
}
```

### 6.3. Modules API

Chaque resource backend a son module API dédié :

| Module | Endpoints | Interfaces TypeScript |
|--------|-----------|----------------------|
| `authApi.ts` | `POST /auth/register`, `POST /auth/login` | `RegisterRequest`, `AuthRequest`, `AuthResponse` |
| `entriesApi.ts` | CRUD `/entries` + `GET /entries/range` | `Entry`, `EntryRequest` |
| `statsApi.ts` | `GET /stats/summary`, `by-day`, `by-type` | `StatsSummary`, `StatsByDay`, `StatsByType` |
| `templatesApi.ts` | CRUD `/activity-templates` + `by-type/{id}` | `ActivityTemplate`, `ActivityTemplateRequest` |
| `goalsApi.ts` | CRUD `/goals` | `Goal`, `GoalRequest` |
| `activityTypesApi.ts` | CRUD `/activity-types` | `ActivityType` |
| `devApi.ts` | `POST /dev/generate-user-data` | `GenerateUserDataParams`, `GenerateUserDataResult` |

**Exemple — Module entriesApi :**
```typescript
export const entriesApi = {
    getAll: async (): Promise<Entry[]> => {
        const response = await axiosClient.get<Entry[]>('/entries');
        return response.data;
    },
    create: async (data: EntryRequest): Promise<Entry> => {
        const response = await axiosClient.post<Entry>('/entries', data);
        return response.data;
    },
    getByDateRange: async (from: string, to: string): Promise<Entry[]> => {
        const response = await axiosClient.get<Entry[]>('/entries/range', {
            params: { from, to },
        });
        return response.data;
    },
    // update, delete, getById...
};
```

### 6.4. Gestion des erreurs côté frontend

Chaque page gère les erreurs de manière cohérante :

```typescript
try {
    const data = await entriesApi.getAll();
    setEntries(data);
} catch (err) {
    setError('Failed to load entries');
    console.error(err);
}
```

Les erreurs réseau sont affichées via le composant `ErrorAlert` ou des `Snackbar` MUI.

---

## 7. Pages de l'application

### 7.1. DashboardPage — Tableau de bord

**Fichier :** `src/pages/DashboardPage.tsx` (431 lignes)

**Fonctionnalités :**
- **3 cartes KPI** : CO₂ total, nombre d'entrées, moyenne journalière
- **Courbe d'émissions** : graphique linéaire (Recharts `LineChart`) montrant les émissions par jour
- **Répartition par catégorie** : graphique en donut (Recharts `PieChart`) avec légende et pourcentages
- **Filtre de dates** : sélection de la période d'analyse (7j, 30j, 90j, personnalisé)
- **Bouton de rafraîchissement** : rechargement manuel des données

**Appels API :**
```typescript
const [summary] = await Promise.all([
    statsApi.getSummary(from, to),    // KPIs
    statsApi.getByDay(from, to),      // Données courbe
    statsApi.getByType(from, to),     // Données donut
]);
```

**Tooltip et légende personnalisés :**

Le `CustomTooltip` du graphique linéaire affiche la date formatée et le CO₂ en kg. Le `CustomLegend` du donut affiche le nom de la catégorie avec son pourcentage, calculé dynamiquement à partir du total.

---

### 7.2. EntriesPage — Gestion des entrées

**Fichier :** `src/pages/EntriesPage.tsx` (424 lignes)

**Fonctionnalités :**
- **Tableau** des entrées avec colonnes : Date, Activité, Catégorie, Quantité, CO₂ (kg), Note
- **Ajout via TemplatePicker** : sélection d'un template → ouverture du formulaire pré-rempli
- **Édition** : clic sur le bouton edit → `FormDialog` avec les valeurs existantes
- **Suppression** : bouton delete → `ConfirmDialog` avant suppression
- **Calcul automatique du CO₂** : `quantity × template.co2Factor`

**Pattern CRUD utilisé :**
```typescript
// Création
const handleSave = async () => {
    const request: EntryRequest = {
        quantity: formData.quantity,
        date: formData.date,
        note: formData.note,
        activityTemplateId: formData.activityTemplateId,
    };
    if (editingEntry) {
        await entriesApi.update(editingEntry.id, request);
    } else {
        await entriesApi.create(request);
    }
    await loadEntries();  // Recharge la liste
};
```

---

### 7.3. TemplatesPage — Gestion des modèles

**Fichier :** `src/pages/TemplatesPage.tsx` (466 lignes)

**Fonctionnalités :**
- **Tableau** avec colonnes : Nom, Catégorie, Facteur CO₂, Unité, Source
- **Recherche** par nom ou catégorie avec debounce
- **Filtrage par catégorie** : chips de couleur cliquables (Transport, Énergie, Alimentation...)
- **CRUD complet** avec `FormDialog`
- **Sélection de type d'activité** via dropdown (`Select`)

---

### 7.4. GoalsPage — Objectifs de réduction

**Fichier :** `src/pages/GoalsPage.tsx` (425 lignes)

**Fonctionnalités :**
- **Tableau** avec : Période, Cible CO₂, Dates, Progression
- **Barre de progression** : `LinearProgress` MUI avec couleur dynamique :
  - Vert si < 80% de la cible
  - Orange si entre 80% et 100%
  - Rouge si dépassement (> 100%)
- **Calcul de la progression** : appel à `statsApi.getSummary()` pour chaque objectif

**Calcul de la progression :**
```typescript
// Pour chaque goal, on récupère le CO2 réel sur la période
const summary = await statsApi.getSummary(goal.startDate, goal.endDate);
const progress = (summary.totalCo2 / goal.targetCo2) * 100;
```

---

### 7.5. ExportPage — Export des données

**Fichier :** `src/pages/ExportPage.tsx` (534 lignes)

**Fonctionnalités :**
- **Filtre de dates** : sélection de la période d'export
- **Filtre par catégorie** : chips de sélection
- **Tableau de données** : `@mui/x-data-grid` avec tri et sélection
- **Résumé statistique** : CO₂ total, nombre d'entrées, top catégories
- **Export CSV** : génération côté client avec BOM UTF-8

**Code d'export CSV :**
```typescript
const handleExport = () => {
    const headers = ['Date', 'Activity', 'Category', 'Quantity', 'Unit', 'CO2 (kg)', 'Source', 'Note'];
    const rows = filteredEntries.map(entry => [
        entry.date,
        entry.activityTemplate.name,
        entry.activityTemplate.activityType?.name || '',
        entry.quantity,
        entry.activityTemplate.defaultUnit,
        (entry.quantity * entry.activityTemplate.co2Factor).toFixed(3),
        entry.activityTemplate.source || '',
        entry.note || '',
    ]);

    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const BOM = '\uFEFF';  // Byte Order Mark pour Excel
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

    // Téléchargement via un lien invisible
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `eco-tracker-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
};
```

**Pourquoi le BOM UTF-8 ?** Sans le `\uFEFF`, Excel ne détecte pas correctement l'encodage et les caractères accentués (comme "Énergie" ou "Déchet") sont mal affichés.

---

### 7.6. LoginPage et RegisterPage — Authentification

**Fichiers :** `LoginPage.tsx` (230 lignes), `RegisterPage.tsx` (250 lignes)

**Design commun :**
- Fond avec **gradient radial** vert clair
- Carte blanche centrée avec **ombre** et **border-radius: 24px**
- Logo ECO Tracker en haut (icône feuille)
- Lien vers l'autre page en bas ("Don't have an account?" / "Already have an account?")

**Fonctionnalités :**
- Champs avec **icônes** (Email, Lock)
- **Toggle visibilité mot de passe** : bouton œil dans le champ
- **Gestion des erreurs** : message d'erreur affiché en cas d'échec
- **Loading state** : bouton désactivé pendant la requête

**Exemple — Bouton de connexion :**
```tsx
<Button
    fullWidth
    variant="contained"
    size="large"
    disabled={loading}
    onClick={handleLogin}
    sx={{
        py: 1.5,
        fontSize: '1rem',
        fontWeight: 600,
        background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
    }}
>
    {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
</Button>
```

---

## 8. Composants partagés

### 8.1. AppLayout — Layout principal

**Fichier :** `src/components/AppLayout.tsx` (365 lignes)

C'est le composant de layout principal qui enveloppe toutes les pages protégées.

**Structure :**
- **Sidebar fixe** (desktop) de `260px` avec :
  - Logo ECO Tracker
  - Menu de navigation (Dashboard, Entries, Templates, Goals, Export)
  - Bouton "Generate Data" (pour les tests)
  - Section utilisateur (avatar, nom, email, déconnexion)
- **AppBar mobile** : hamburger menu qui ouvre la sidebar en `Drawer` temporaire
- **Zone de contenu** : `maxWidth: 1400px`, padding responsive

**Responsive :**
```typescript
const isMobile = useMediaQuery(theme.breakpoints.down('md'));
// md = 900px → en dessous, AppBar + Drawer temporaire
// au dessus, Drawer permanent à gauche
```

### 8.2. StatCard — Carte statistique

**Fichier :** `src/components/StatCard.tsx` (134 lignes)

Composant réutilisable pour afficher un KPI :
- **Bande colorée** en haut (gradient de la couleur choisie)
- **Titre** en petit, gris, majuscules
- **Valeur** en grand et gras
- **Subtile** optionnel
- **Tendance** optionnelle (flèche haut/bas en vert/rouge avec pourcentage)
- **Icône** optionnelle dans un cercle coloré

### 8.3. TemplatePicker — Sélecteur de template avancé

**Fichier :** `src/components/TemplatePicker.tsx` (327 lignes)

Dialogue modal pour sélectionner un template d'activité :
- **3 onglets** : All, Favorites, Recent
- **Recherche** avec debounce (200ms) + `useDeferredValue` pour garder la saisie fluide
- **Filtrage par catégorie** : chips colorées par type d'activité
- **Favoris** : sauvegardés dans `localStorage` (clé `eco_favorites`)
- **Récents** : les 10 derniers templates utilisés (clé `eco_recents`)
- **Couleurs par catégorie** : map statique (Transport = bleu, Énergie = jaune, Alimentation = vert...)

### 8.4. FormDialog et ConfirmDialog — Dialogues réutilisables

**FormDialog** (102 lignes) : dialogue générique avec titre, contenu (children), boutons Cancel/Save. Utilise le pattern **Render Props** via `children`.

**ConfirmDialog** (115 lignes) : dialogue de confirmation avec icône d'avertissement, variants (`danger`/`warning`/`info`), et boutons d'action colorés.

### 8.5. Loading — Skeleton loading

**Fichier :** `src/components/Loading.tsx` (89 lignes)

Composant de chargement avec **4 variants** :
- `skeleton` : squelette générique avec cartes et rectangles
- `cards` : grille de cartes-squelettes
- `table` : tableau avec lignes et colonnes-squelettes
- `spinner` : défini mais redirect vers skeleton par défaut

**Pourquoi les skeletons plutôt qu'un spinner ?** Les squelettes donnent à l'utilisateur une idée de la structure de la page à venir, ce qui réduit la perception du temps de chargement. C'est une pratique UX moderne utilisée par Facebook, YouTube, et d'autres.

### 8.6. Autres composants

| Composant | Lignes | Rôle |
|-----------|--------|------|
| `PageHeader` | 70 | Titre + description + bouton d'action |
| `PageContainer` | 27 | Container avec padding responsive |
| `EmptyState` | 84 | État vide avec icône, texte et bouton d'action |
| `ErrorAlert` | 21 | Alerte d'erreur avec titre et message |
| `GenerateDataModal` | 215 | Modal pour générer des données de test (dev tool) |

---

## 9. Hooks personnalisés

### 9.1. useDebouncedValue

**Fichier :** `src/hooks/useDebouncedValue.ts` (26 lignes)

Ce hook retarde la mise à jour d'une valeur pour éviter les appels excessifs :

```typescript
export function useDebouncedValue<T>(value: T, delay: number = 200): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(handler);  // Annule le timer si la valeur change
    }, [value, delay]);

    return debouncedValue;
}
```

**Utilisation dans TemplatePicker :**
```typescript
const debouncedSearch = useDebouncedValue(search, 200);
const deferredSearch = useDeferredValue(debouncedSearch);
// Double optimisation : debounce (200ms) + useDeferredValue (React concurrent)
```

**Pourquoi deux niveaux d'optimisation ?**
- Le **debounce** attend 200ms après la dernière touche avant de filtrer
- Le **useDeferredValue** (React 18+) permet au rendu de rester fluide même si le filtrage est lourd, en laissant React prioriser la mise à jour de l'input sur le re-render de la liste

---

## 10. Problèmes rencontrés et résolutions

### 10.1. Page blanche après le build

**Problème :** L'application affichait une page blanche après le lancement du serveur de développement.

**Diagnostic :** Les imports de types TypeScript étaient faits comme des imports de valeurs. Par exemple :
```typescript
// ❌ Mauvais — importe comme une valeur
import { AuthResponse } from '../api/authApi';

// ✅ Correct — importe comme un type
import type { AuthResponse } from '../api/authApi';
```

**Cause :** Vite utilise ESBuild pour la transpilation, qui ne comprends pas les imports de types non marqués avec `import type`. Cela peut causer des erreurs silencieuses.

**Solution :** Ajout du mot-clé `type` sur tous les imports qui ne sont utilisés que comme annotations TypeScript.

**Apprentissage :** Avec Vite, toujours utiliser `import type` pour les imports de types. C'est aussi une bonne pratique TypeScript générale car ça rend le code plus explicite.

---

### 10.2. Erreurs CORS avec le backend

**Problème :** Les requêtes du frontend (port 5173) vers le backend (port 8081) étaient bloquées par le navigateur.

**Cause :** Le navigateur applique la politique **Same-Origin Policy** : un script depuis `localhost:5173` ne peut pas appeler `localhost:8081` sans autorisation explicite du serveur.

**Solution :** Le backend a été configuré pour envoyer les headers CORS appropriés (voir `CorsConfig.java` dans le rapport backend). Côté frontend, `cors: true` a été activé dans `vite.config.ts`.

**Apprentissage :** Les erreurs CORS se résolvent côté **serveur**, pas côté client. Le frontend ne peut pas contourner cette restriction.

---

### 10.3. Erreurs 403 Forbidden sur /auth/login

**Problème :** Le `POST /auth/login` retournait 403 même sans token.

**Diagnostic :** Le problème venait du backend — la protection CSRF de Spring Security était activée par défaut et bloquait les requêtes POST.

**Solution :** Désactivation du CSRF côté backend (`http.csrf(AbstractHttpConfigurer::disable)`) puisque l'API utilise des tokens JWT (pas de cookies de session).

**Apprentissage :** Pour une API REST stateless, le CSRF n'est pas nécessaire car l'attaque CSRF exploite les cookies de session — et notre API n'en utilise pas.

---

### 10.4. Token expiré — erreurs 401 silencieuses

**Problème :** Après 24h, l'utilisateur voyait des erreurs "Failed to load data" sans comprendre pourquoi.

**Solution :** L'intercepteur de réponse Axios détecte les erreurs 401 et redirige automatiquement vers `/login` en nettoyant le `localStorage`.

**Apprentissage :** La gestion de l'expiration des tokens doit être pensée de bout en bout (backend expire le token → frontend détecte le 401 → frontend redirige).

---

### 10.5. Port 5173 déjà occupé

**Problème :** Vite ne démarrait pas car le port 5173 était utilisé par une autre instance.

**Cause :** Un processus Vite précédent n'avait pas été arrêté proprement.

**Solution :** Configuration `strictPort: true` dans `vite.config.ts` — Vite échoue avec un message clair au lieu de silencieusement utiliser un autre port (ce qui casserait les CORS configurés pour le port 5173).

---

### 10.6. Caractères accentués cassés dans l'export CSV

**Problème :** Les noms de catégories comme "Énergie" ou "Déchets" apparaissaient mal dans Excel.

**Cause :** Excel n'interprète pas par défaut les fichiers CSV en UTF-8.

**Solution :** Ajout du BOM (Byte Order Mark) `\uFEFF` au début du fichier CSV. Ce caractère invisible indique à Excel d'utiliser l'encodage UTF-8.

---

## 11. Outil de développement — Generate Data

### 11.1. Pourquoi cet outil

Pendant le développement, il était fastidieux de créer manuellement des dizaines d'entrées pour tester le dashboard et les graphiques. Un outil de génération de données a donc été créé.

### 11.2. Architecture

| Fichier | Rôle |
|---------|------|
| `devApi.ts` | Client API pour `POST /dev/generate-user-data` |
| `GenerateDataModal.tsx` | Modal avec options (jours, entrées/jour, goals, overwrite) |
| `AppLayout.tsx` | Bouton "Generate Data" dans la sidebar |

### 11.3. Paramètres de génération

```typescript
export interface GenerateUserDataParams {
    daysBack?: number;           // Nombre de jours à remplir (défaut: 30)
    entriesPerDayMin?: number;   // Min entrées par jour
    entriesPerDayMax?: number;   // Max entrées par jour
    includeGoals?: boolean;      // Générer aussi des objectifs
    overwriteInRange?: boolean;  // Écraser les données existantes
}
```

### 11.4. Flux utilisateur

1. Clic sur **"Generate Data"** dans la sidebar
2. Modal s'ouvre avec un slider et des options
3. Clic sur **"Generate"** → appel API → spinner
4. Affichage du résultat (X entrées + Y goals créés)
5. **Auto-refresh** de la page après 2 secondes (`window.location.reload()`)

---

## 12. Limites actuelles et améliorations possibles

### 12.1. Améliorations techniques

| Domaine | Limite actuelle | Amélioration proposée |
|---------|-----------------|----------------------|
| **Tests** | Aucun test frontend | Ajouter Vitest + React Testing Library |
| **Gestion d'état** | `useState` local dans chaque page | React Query / TanStack Query pour le cache API |
| **Formulaires** | Gestion manuelle de l'état | React Hook Form pour la validation |
| **Pagination** | Toutes les données chargées d'un coup | Pagination côté serveur pour les grandes listes |
| **PWA** | Application web classique | Service Worker pour le mode hors-ligne |

### 12.2. UX et accessibilité

- **Mode sombre** : le thème MUI supporte `palette.mode: 'dark'`, il suffirait d'ajouter un toggle
- **Internationalisation (i18n)** : actuellement en anglais, `react-i18next` pourrait ajouter le français
- **Accessibilité (a11y)** : les composants MUI sont conformes ARIA, mais les composants custom pourraient être audités
- **Animations** : Framer Motion pour des transitions de page plus fluides

### 12.3. Performance

- **Code splitting** : `React.lazy()` pour charger les pages à la demande
- **Memoization** : `React.memo` sur les composants qui ne changent pas souvent (ex: sidebar)
- **Image optimization** : pas d'images pour l'instant, mais un CDN serait nécessaire si ajoutées
- **Bundle analysis** : utiliser `rollup-plugin-visualizer` pour identifier les dépendances lourdes

### 12.4. Sécurité

- **XSS** : React échappe automatiquement le HTML, mais attention à `dangerouslySetInnerHTML`
- **Token storage** : migrer de `localStorage` vers des cookies HttpOnly pour plus de sécurité
- **Rate limiting UI** : désactiver le bouton login après plusieurs tentatives échouées
- **Content Security Policy** : ajouter des headers CSP pour limiter les scripts exécutables

---

## 13. Conclusion

### 13.1. Bilan du frontend

Le frontend ECO Impact Tracker est une application React/TypeScript moderne qui démontre :

- Une **architecture modulaire** claire avec séparation des responsabilités
- Un **design system cohérent** via le thème MUI personnalisé (style Apple-like)
- Une **communication API robuste** avec intercepteurs Axios et gestion d'erreurs
- Une **authentification complète** avec Context API, localStorage et route guards
- Des **composants réutilisables** (FormDialog, ConfirmDialog, StatCard, TemplatePicker...)
- Une **expérience utilisateur soignée** (skeleton loading, transitions, responsive design)

### 13.2. Compétences démontrées

| Compétence | Mise en œuvre |
|------------|-------------|
| React moderne | Hooks, Context API, useDeferredValue, composants fonctionnels |
| TypeScript | Interfaces, génériques, typage strict des API |
| Material UI | Thème personnalisé, composants avancés (DataGrid, Drawer) |
| Architecture frontend | Séparation pages/composants/API/auth |
| Visualisation de données | Recharts (LineChart, PieChart, tooltips custom) |
| Communication REST | Axios, intercepteurs, gestion JWT |
| UX/UI Design | Skeleton loading, responsive, design Apple-like |
| Résolution de problèmes | CORS, type imports, CSV encoding, token expiry |

### 13.3. Apports pédagogiques

Ce projet a permis d'apprendre :

1. **L'écosystème React** : comment les hooks, le context et le routeur s'articulent ensemble
2. **TypeScript en pratique** : le typage strict détecte les erreurs avant même le lancement
3. **L'intégration frontend/backend** : coordination des formats de données, gestion des tokens
4. **Le design system** : personnalisation profonde d'une bibliothèque de composants (MUI)
5. **La gestion d'état** : choisir entre état local, context et solutions plus complexes
6. **Les bonnes pratiques UX** : skeleton loading, états vides, feedback utilisateur, responsive

---

**Document rédigé dans le cadre du projet ECO Impact Tracker**  
*Cours d'Architectures Web — Janvier 2026*
