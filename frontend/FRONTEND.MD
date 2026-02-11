# Rapport Frontend – ECO Impact Tracker

## Introduction

Ce document présente le frontend de l'application **ECO Impact Tracker**, développé en parallèle du backend Spring Boot documenté dans le `BACKEND.MD`. Il s'agit d'une application web monopage (SPA) construite avec React et TypeScript, qui permet aux utilisateurs de visualiser et gérer leur empreinte carbone à travers un dashboard, des graphiques, et des formulaires de saisie.

Comme pour le backend, **l'intelligence artificielle a été un outil central** dans la réalisation du frontend. J'ai utilisé **ChatGPT** pour comprendre les concepts React et résoudre des problèmes, et **Antigravity** (IDE avec agent IA intégré) pour accélérer l'écriture des composants et le débogage.

Ma démarche est restée la même que pour le backend :
- je définissais ce que je voulais afficher ou faire fonctionner
- j'analysais les erreurs dans la console du navigateur
- je formulais des prompts précis basé sur ce que j'observais
- je vérifiais le résultat visuellement dans le navigateur
- et j'itérais jusqu'à obtenir quelque chose de fonctionnel et visuellement propre

Ce document suit la même structure que le rapport backend en montrant les choix techniques, les problèmes rencontrés et les prompts utilisés.

---

## 1. Choix technologiques

### 1.1 React 19 (TypeScript)

Le frontend est développé en **React 19** avec **TypeScript 5.9**. Ce choix s'est imposé car :
- React est le framework frontend le plus utilisé en entreprise
- Les **hooks** (`useState`, `useEffect`, `useMemo`) simplifient la gestion d'état sans classes
- TypeScript ajoute le typage statique, ce qui détécte les erreurs avant le runtime
- Le **Virtual DOM** de React ne met à jour que ce qui change, ce qui est performant
- L'écosystème est énorme : des milliers de librairies compatibles

TypeScript a été essentiel pour ce projet. Par exemple, quand le backend renvoyait un champ `co2Factor` et que j'essayais d'accéder à `co2factor` (sans le F majuscule), TypeScript me le signalait immédiatement au lieu de planter en production.

### 1.2 Vite 7

Le projet utilise **Vite** comme outil de build et serveur de développement. Il remplace l'ancien Create React App (CRA) qui est obsolète :
- Le serveur de dev démarre en moins d'une seconde (vs 10+ secondes avec CRA)
- Le **Hot Module Replacement (HMR)** met à jour l'affichage instantanément quand on modifie le code
- En production, Vite utilise Rollup pour optimiser le bundle (tree-shaking, code splitting)
- La configuration est minimale, presque tout fonctionne out-of-the-box

Configuration du serveur de dev (`vite.config.ts`) :
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,   // Échoue si le port est pris (important pour les CORS)
    host: true,          // Accessible depuis le réseau local
    cors: true,
  },
  logLevel: 'warn',
});
```

Le `strictPort: true` est important : si Vite utilisait un port alternatif (ex: 5174), les CORS configurées côté backend pour `localhost:5173` bloqueraient toutes les requêtes.

### 1.3 Material UI (MUI) v7

Pour le design, j'ai utilisé **Material UI v7**, la bibliothèque de composants React la plus populaire :
- Des composants prêts à l'emploi : Button, Card, Dialog, Table, TextField, Drawer...
- Un système de **thème** pour personnaliser l'apparence globalement
- Des composants accessibles par défaut (conformes ARIA)
- Le `DataGrid` de `@mui/x-data-grid` pour l'export de données

Les packages utilisés :

| Package | Rôle |
|---------|------|
| `@mui/material` | Composants principaux |
| `@mui/icons-material` | Icônes (500+) |
| `@mui/x-data-grid` | Tableau de données avancé |
| `@emotion/react` + `@emotion/styled` | Moteur CSS-in-JS |

### 1.4 Autres dépendances

| Librairie | Version | Rôle |
|-----------|---------|------|
| `react-router-dom` | 7 | Navigation entre pages (SPA) |
| `axios` | 1.13 | Client HTTP avec intercepteurs |
| `recharts` | 3.6 | Graphiques (courbe CO₂, donut par catégorie) |
| `date-fns` | 4.1 | Manipulation de dates (léger, tree-shakeable) |
| `eslint` | 9.39 | Linting du code |

---

## 2. Architecture du projet

### 2.1 Organisation des fichiers

```
eco-impact-tracker-frontend/
├── index.html              → Point d'entrée HTML
├── package.json            → Dépendances et scripts npm
├── vite.config.ts          → Configuration Vite
├── .env                    → VITE_API_BASE_URL=http://localhost:8081
├── .env.development        → VITE_LOG_LEVEL=info
└── src/
    ├── main.tsx            → Bootstrap React (createRoot)
    ├── App.tsx             → Routing + providers (Theme, Auth)
    ├── theme.ts            → Design system MUI (~530 lignes)
    ├── index.css           → Reset CSS + styles globaux
    ├── auth/               → Authentification
    │   ├── AuthContext.tsx  → Context React (login, logout, register)
    │   └── ProtectedRoute.tsx → Garde de route
    ├── api/                → Clients API (7 modules)
    │   ├── axiosClient.ts  → Instance Axios centralisée
    │   ├── authApi.ts      → /auth/register, /auth/login
    │   ├── entriesApi.ts   → CRUD /entries
    │   ├── statsApi.ts     → /stats/summary, by-day, by-type
    │   ├── templatesApi.ts → CRUD /activity-templates
    │   ├── goalsApi.ts     → CRUD /goals
    │   ├── activityTypesApi.ts → CRUD /activity-types
    │   └── devApi.ts       → /dev/generate-user-data
    ├── pages/              → Pages de l'application (7)
    │   ├── DashboardPage.tsx
    │   ├── EntriesPage.tsx
    │   ├── TemplatesPage.tsx
    │   ├── GoalsPage.tsx
    │   ├── ExportPage.tsx
    │   ├── LoginPage.tsx
    │   └── RegisterPage.tsx
    ├── components/         → Composants réutilisables (11)
    │   ├── AppLayout.tsx   → Layout principal (sidebar + contenu)
    │   ├── StatCard.tsx    → Carte KPI
    │   ├── TemplatePicker.tsx → Sélecteur de template
    │   ├── FormDialog.tsx  → Dialogue de formulaire
    │   ├── ConfirmDialog.tsx → Dialogue de confirmation
    │   ├── EmptyState.tsx  → État vide
    │   ├── ErrorAlert.tsx  → Alerte d'erreur
    │   ├── Loading.tsx     → Skeleton loading
    │   ├── PageHeader.tsx  → En-tête de page
    │   ├── PageContainer.tsx → Container responsive
    │   └── GenerateDataModal.tsx → Générer des données test
    ├── hooks/              → Hooks personnalisés
    │   └── useDebouncedValue.ts → Debounce pour la recherche
    └── utils/
        └── tokenStorage.ts → Gestion localStorage (token + user)
```

### 2.2 Séparation des responsabilités

Chaque dossier a un rôle précis :
- Les **pages** contiennent la logique métier (appels API, état, orchestration)
- Les **components** sont réutilisables et ne connaissent pas l'API
- Les **modules API** encapsulent les requêtes HTTP (un fichier par ressource backend)
- Le dossier **auth** gère l'état de connexion globalement via le Context API
- Les **hooks** isolent la logique réutilisable (ex: debounce de la recherche)

### 2.3 Routing

Le routage utilise `react-router-dom` dans `App.tsx` :

```tsx
<BrowserRouter>
  <Routes>
    {/* Routes publiques */}
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

    {/* Routes protégées — redirigent vers /login si pas connecté */}
    <Route path="/dashboard" element={
      <ProtectedRoute>
        <AppLayout><DashboardPage /></AppLayout>
      </ProtectedRoute>
    } />
    <Route path="/entries" element={
      <ProtectedRoute>
        <AppLayout><EntriesPage /></AppLayout>
      </ProtectedRoute>
    } />
    {/* ... pareil pour /templates, /goals, /export */}

    {/* Redirection racine */}
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
  </Routes>
</BrowserRouter>
```

Chaque page protégée est enveloppée dans `ProtectedRoute` (qui vérifie le token) et `AppLayout` (qui ajoute la sidebar et la barre de navigation).

---

## 3. Design system (Thème)

### 3.1 Philosophie

J'ai voulu un design **Apple-like** : minimal, épuré, avec des couleurs douces et une typographie nette. Le fichier `theme.ts` fait environ 530 lignes et personalise profondément Material UI.

### 3.2 Palette de couleurs

```typescript
primary: { main: '#16A34A', light: '#22C55E', dark: '#15803D' },   // Vert écologique
secondary: { main: '#6366F1', light: '#818CF8', dark: '#4F46E5' }, // Indigo accent
background: { default: '#FAFAFA', paper: '#FFFFFF' },              // Gris très clair
text: { primary: '#1D1D1F', secondary: '#6B7280' },                // Noir Apple
```

Le vert primaire `#16A34A` a été choisi pour symboliser l'écologie. L'indigo secondaire apporte du contraste sans être agressif.

### 3.3 Personnalisations principales

Le thème modifie l'apparence de presque tous les composants MUI :
- **Boutons** : `borderRadius: 10`, gradient vert sur le bouton primaire
- **Cards** : `borderRadius: 16`, ombre subtile, bordure fine
- **TextFields** : fond gris clair, transitions douces
- **Dialogues** : `borderRadius: 16`, ombre prononcée
- **AppBar** : fond blanc avec texte sombre (au lieu du bleu par défaut de Material Design)
- **Tables** : lignes alternées avec fond légèrement gris

La police utilisée est **Inter** (Google Fonts), chargée dans `index.css` :
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
```

### 3.4 Styles globaux (`index.css`)

En plus du thème MUI, j'ai personnalisé :
- La **scrollbar** (fine, grise, avec hover)
- La **sélection de texte** (couleur verte semi-transparente)
- Le **focus visible** (outline vert pour l'accessibilité)
- L'**autofill** des navigateurs (suppresssion du fond bleu/jaune par défaut)

---

## 4. Authentification côté client

### 4.1 Fonctionnement

L'authentification repose sur 3 fichiers :

| Fichier | Rôle |
|---------|------|
| `AuthContext.tsx` | Context React qui stocke l'état utilisateur (token, email, nom) |
| `ProtectedRoute.tsx` | Bloque l'accès si l'utilisateur n'est pas connecté |
| `tokenStorage.ts` | Lit/écrit le token et les infos user dans `localStorage` |

Le flux de connexion :
1. L'utilisateur remplit le formulaire de login
2. `AuthContext` appelle `authApi.login({ email, password })`
3. Le backend retourne `{ token, name, email }`
4. Le token est sauvegardé dans `localStorage` via `tokenStorage`
5. L'état React est mis à jour → redirection vers `/dashboard`

### 4.2 Persistance de la session

Au chargement de l'application, le `AuthContext` vérifie si un token existe dans le `localStorage` :

```typescript
useEffect(() => {
    const token = tokenStorage.getToken();
    const storedUser = tokenStorage.getUser();
    if (token && storedUser) {
        setUser(storedUser);
    }
    setLoading(false);
}, []);
```

Si un token est trouvé, l'utilisateur est considéré comme connecté sans avoir à se re-loguer. Le token a une durée de 24h (gérée côté backend).

### 4.3 Token Storage

Le `localStorage` utilise deux clés spécifiques :
- `eco_tracker_token` : le JWT brut
- `eco_tracker_user` : les infos utilisateur en JSON (`{ name, email, token }`)

J'aurais pu utiliser des cookies `httpOnly` pour plus de sécurité (protection contre le XSS), mais le `localStorage` est suffisant pour un projet pédagogique et plus simple à mettre en place.

---

## 5. Communication avec le backend

### 5.1 Instance Axios centralisée

Toutes les requêtes API passent par une seule instance Axios configurée dans `axiosClient.ts` :

```typescript
const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081',
    headers: { 'Content-Type': 'application/json' },
});
```

La `baseURL` vient du fichier `.env` (variable `VITE_API_BASE_URL`). Le préfixe `VITE_` est obligatoire : Vite n'expose que les variables avec ce préfixe au code client, pour éviter d'exposer des secrets par accident.

### 5.2 Intercepteurs

**Intercepteur de requête** — ajoute le token JWT automatiquement :
```typescript
axiosClient.interceptors.request.use((config) => {
    const token = tokenStorage.getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

**Intercepteur de réponse** — gère les erreurs 401 (token expiré) :
```typescript
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            tokenStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
```

En développement, les requêtes et réponses sont aussi loguées dans la console.

### 5.3 Modules API

Chaque ressource du backend a son module dédié. Les modules définissent les **interfaces TypeScript** (pour le typage) et les **fonctions CRUD** :

| Module | Endpoints | Types définis |
|--------|-----------|--------------|
| `authApi.ts` | `POST /auth/register`, `POST /auth/login` | `RegisterRequest`, `AuthRequest`, `AuthResponse` |
| `entriesApi.ts` | CRUD `/entries` + `/entries/range` | `Entry`, `EntryRequest` |
| `statsApi.ts` | `/stats/summary`, `by-day`, `by-type` | `StatsSummary`, `StatsByDay`, `StatsByType` |
| `templatesApi.ts` | CRUD `/activity-templates` | `ActivityTemplate`, `ActivityTemplateRequest` |
| `goalsApi.ts` | CRUD `/goals` | `Goal`, `GoalRequest` |
| `activityTypesApi.ts` | CRUD `/activity-types` | `ActivityType` |
| `devApi.ts` | `POST /dev/generate-user-data` | `GenerateUserDataParams`, `GenerateUserDataResult` |

Exemple concret — récupérer les entrées par date :
```typescript
getByDateRange: async (from: string, to: string): Promise<Entry[]> => {
    const response = await axiosClient.get<Entry[]>('/entries/range', {
        params: { from, to },
    });
    return response.data;
},
```

---

## 6. Pages et composants

### 6.1 Les 7 pages

**DashboardPage** (431 lignes) : le tableau de bord principal. Affiche 3 cartes KPI (CO₂ total, nombre d'entrées, moyenne journalière), un graphique linéaire des émissions par jour (Recharts `LineChart`), et un donut de répartition par catégorie (Recharts `PieChart`). Inclut un filtre de dates et un bouton de rafraîchissement.

**EntriesPage** (424 lignes) : gestion des activités quotidiennes. Tableau avec les colonnes Date, Activité, Catégorie, Quantité, CO₂ (kg), Note. Ajout via le `TemplatePicker` (sélection d'un template → formulaire pré-rempli). Édition et suppression avec confirmation.

**TemplatesPage** (466 lignes) : gestion des modèles d'activité. Tableau triable avec recherche par nom et filtrage par catégorie via des chips colorées. Formulaire de création/édition avec sélection du type d'activité et du facteur CO₂.

**GoalsPage** (425 lignes) : objectifs de réduction CO₂. Tableau avec barres de progression (`LinearProgress`) qui changent de couleur selon l'avancement : vert (< 80%), orange (80-100%), rouge (> 100% = dépassement). Chaque objectif a une période, une cible en kg et des dates de début/fin.

**ExportPage** (534 lignes) : export des données. Filtre par dates et catégories, affichage dans un `DataGrid` MUI avec tri, résumé statistique (total CO₂, nombre d'entrées, top catégories), et bouton d'export CSV.

**LoginPage** (230 lignes) et **RegisterPage** (250 lignes) : formulaires d'authentification avec un design centré, fond gradient vert, icône ECO, champs avec toggle de visibilité du mot de passe, et lien vers l'autre page.

### 6.2 Les composants partagés

| Composant | Rôle |
|-----------|------|
| `AppLayout` | Layout principal : sidebar fixe (260px) sur desktop, AppBar avec hamburger menu sur mobile |
| `StatCard` | Carte KPI avec bande colorée en haut, valeur en gros, tendance optionnelle (↑/↓) |
| `TemplatePicker` | Dialog de sélection de template avec 3 onglets (All, Favorites, Recent), recherche debounced, filtrage par catégorie |
| `FormDialog` | Dialogue générique pour les formulaires (titre, contenu, boutons Cancel/Save) |
| `ConfirmDialog` | Dialogue de confirmation avec icône warning, variants danger/warning/info |
| `Loading` | Skeleton loading avec 3 variants : cards, table, default |
| `EmptyState` | État vide avec icône, texte et bouton d'action |
| `ErrorAlert` | Alerte d'erreur simple |
| `PageHeader` | Titre + description + bouton d'action (ex: "Add Entry") |
| `PageContainer` | Container avec padding responsive |
| `GenerateDataModal` | Modal pour générer des données de test (slider jours, range entrées/jour) |

### 6.3 Le TemplatePicker en détail

Le `TemplatePicker` est le composant le plus complexe (327 lignes). Il utilise une double optimisation pour la recherche :

```typescript
const debouncedSearch = useDebouncedValue(search, 200);        // Attend 200ms après la frappe
const deferredSearch = useDeferredValue(debouncedSearch);      // React concurrent mode
```

Pourquoi deux niveaux ? Le **debounce** empêche de filtrer à chaque touche. Le **useDeferredValue** (React 18+) permet à React de prioriser la mise à jour du champ de texte sur le re-render de la liste — donc l'input reste fluide même si la liste est longue.

Les favoris et récents sont sauvegardés dans le `localStorage` (clés `eco_favorites` et `eco_recents`) pour persister entre les sessions.

### 6.4 Export CSV

L'export CSV est fait entièrement côté client dans `ExportPage.tsx` :

```typescript
const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
const BOM = '\uFEFF';   // Byte Order Mark pour UTF-8
const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
const link = document.createElement('a');
link.href = URL.createObjectURL(blob);
link.download = `eco-tracker-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
link.click();
```

Le `BOM` (`\uFEFF`) est nécéssaire pour qu'Excel interprète correctement les accents (comme "Énergie" ou "Déchets"). Sans lui, les caractères spéciaux sont cassés dans Excel.

---

## 7. Utilisation de l'IA – Démarche et exemples de prompts

### 7.1 Mon approche

Comme pour le backend, j'ai jamais utilisé l'IA avec des prompts vagues du type "fais-moi un frontend". Chaque interaction étais précédée d'une observation concrète (un bug visuel, un composant à créer, un comportement inattendu).

L'IA m'a beaucoup aidé sur le **design** (personnalisation du thème MUI) et sur la **logique des composants** (gestion d'état, effets de bord), mais j'ai toujours vérifié le résultat visuellement dans le navigateur.

### 7.2 Exemples concrets de prompts

**Prompt 1 – Choix du framework et setup**

> « Je dois créer un frontend React pour mon API Spring Boot. Quel outil de build utiliser en 2026 ? Create React App, Vite ou Next.js ? Mon projet est une SPA simple sans SSR. »

→ J'ai compris que CRA est obsolète, que Next.js est surdimensionné pour une SPA, et que Vite est le choix optimal pour mon cas. J'ai aussi appris ce qu'est le HMR.

**Prompt 2 – Design system et thème MUI**

> « Je veux un design Apple-like pour mon app React avec Material UI. Montre-moi comment créer un thème personnalisé avec une palette verte, la police Inter, des cards avec des ombres subtiles et des boutons avec des gradients. »

→ C'est comme ça que j'ai créé le `theme.ts` de ~530 lignes. J'ai compris comment le `createTheme` de MUI permet de surcharger chaque composant individuellement.

**Prompt 3 – Authentification React**

> « Comment gérer l'authentification JWT dans une app React ? Je veux un Context qui stocke le token, un composant ProtectedRoute qui redirige vers /login si pas connecté, et un intercepteur Axios qui ajoute le token automatiquement. »

→ J'ai appris le pattern Context API + Provider, et comment les intercepteurs Axios simplifient la gestion des tokens sans toucher à chaque appel API.

**Prompt 4 – Page blanche après le build**

> « Mon frontend React avec Vite affiche une page blanche. La console montre une erreur sur un import. Le backend fonctionne sur Swagger. Je pense que c'est un problème de TypeScript. »

→ Le problème venait des imports de types : il fallait `import type { AuthResponse }` au lieu de `import { AuthResponse }`. Vite/ESBuild n'arrivait pas à enlever ces imports à la transpilation.

**Prompt 5 – Graphiques Recharts**

> « Je veux afficher un graphique linéaire de mes émissions CO₂ par jour avec Recharts. Les données viennent de mon API /stats/by-day. Je veux aussi un donut pour la répartition par catégorie avec des tooltips personnalisés qui montrent le pourcentage. »

→ J'ai appris à utiliser `ResponsiveContainer`, `LineChart`, `PieChart`, et surtout à créer des `CustomTooltip` en React plutôt que d'utiliser les tooltips par défaut de Recharts.

**Prompt 6 – Sidebar responsive**

> « Ma sidebar s'affiche bien sur desktop mais prend tout l'écran sur mobile. Comment faire un drawer MUI permanent sur desktop et temporaire (hamburger menu) sur mobile ? »

→ J'ai compris l'utilisation de `useMediaQuery(theme.breakpoints.down('md'))` pour détecter la taille d'écran, et la différence entre `Drawer variant="permanent"` et `variant="temporary"`.

**Prompt 7 – Skeleton loading**

> « Au lieu d'un spinner quand les données chargent, je veux des skeletons (comme Facebook). Comment faire avec MUI ? Je veux un variant pour les cards et un pour les tableaux. »

→ J'ai créé le composant `Loading.tsx` avec des variants (cards, table, skeleton), en utilisant le composant `Skeleton` de MUI. C'est une meilleure UX car l'utilisateur voit la structure de la page avant que les données arrivent.

**Prompt 8 – Export CSV avec accents cassés**

> « Mon export CSV fonctionne mais les accents sont cassés dans Excel. "Énergie" s'affiche comme "Ã‰nergie". Comment forcer l'encodage UTF-8 dans un CSV ? »

→ La solution était d'ajouter le BOM UTF-8 (`\uFEFF`) au début du fichier. C'est un caractère invisible qui dit à Excel "ce fichier est en UTF-8".

**Prompt 9 – Données de test**

> « Je veux un bouton dans la sidebar qui ouvre un modal pour générer des données de test via mon API /dev/generate-user-data. Le modal doit avoir un slider pour le nombre de jours et des checkboxes pour les options. »

→ J'ai créé le `GenerateDataModal.tsx` et le `devApi.ts`. Après la génération, la page se recharge automatiquement pour afficher les nouvelles données.

---

## 8. Problèmes rencontrés et résolutions

| Problème | Cause | Solution |
|----------|-------|----------|
| Page blanche après `npm run dev` | Imports TypeScript incorrects (`import` au lieu de `import type`) | Fix de tous les imports de types dans le projet |
| Erreurs CORS | Frontend (5173) et backend (8081) sur des ports différents | `CorsConfig.java` côté backend + `cors: true` dans Vite |
| 403 Forbidden sur `/auth/login` | CSRF Spring Security activé par défaut | `http.csrf(AbstractHttpConfigurer::disable)` côté backend |
| Token expiré → erreurs silencieuses | Le frontend ne gérait pas le 401 | Intercepteur Axios qui détecte le 401 et redirige vers `/login` |
| Port 5173 déja occupé | Instance Vite précédente non fermée | `strictPort: true` pour échouer proprement |
| Accents cassés dans l'export CSV | Excel n'interprète pas UTF-8 par défaut | Ajout du BOM `\uFEFF` au début du fichier |
| Dashboard vide (graphiques sans données) | Pas d'entrées pour l'utilisateur connecté | Création du `GenerateDataModal` pour générer des données test |
| Recherche qui lag dans le TemplatePicker | Filtrage sur chaque touche | `useDebouncedValue` (200ms) + `useDeferredValue` |

Chaque problème a été résolu par le même processus que pour le backend : **observer → analyser → prompt IA → vérifier dans le navigateur → itérer**.

---

## 9. Ce que j'ai appris

Ce projet m'a permis de comprendre concrétement :
- Comment fonctionne une **application React moderne** (hooks, context, routing)
- L'utilité de **TypeScript** pour détecter les erreurs avant le runtime
- Comment personnaliser un **design system** avec Material UI (thème, composants custom)
- Le fonctionnement de **Axios** et ses intercepteurs (token, 401, logging)
- Comment faire une app **responsive** avec MUI (breakpoints, Drawer, useMediaQuery)
- L'importance des **skeleton loading** pour l'UX (vs un simple spinner)
- Comment créer des **graphiques interactifs** avec Recharts
- La gestion du **localStorage** pour la persistance (tokens, favoris, récents)
- L'export **CSV côté client** avec gestion de l'encodage
- Et surtout, comment **piloter le développement frontend avec l'IA** : décrire précisement ce qu'on veut visuellement, vérifier dans le navigateur, et corriger les détails

---

## Conclusion

Ce frontend est le résultat d'une démarche structurée ou j'ai piloté chaque décision de design et de code, même quand l'IA m'aidait à aller plus vite.

L'IA a été un **accélérateur**, pas un remplaçant :
- c'est moi qui ais choisi le design system et la charte graphique
- c'est moi qui ais structuré les composants et les pages
- c'est moi qui ais testé chaque fonctionnalité dans le navigateur
- c'est moi qui ais débogué les erreurs CORS, les imports TypeScript et les problèmes d'encodage
- c'est moi qui ais validé que le frontend communiquait correctement avec le backend

Le projet final est une application React complète avec un dashboard interactif, des graphiques Recharts, un système d'authentification JWT, un design Apple-like personnalisé, et un workflow de saisie/export des données fonctionel de bout en bout.

---

*Projet réalisé dans le cadre du cours d'Architectures Web — Février 2026*
