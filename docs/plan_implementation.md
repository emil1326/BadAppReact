# Plan d'implémentation

Roadmap pour construire BadAppReact, organisée en phases avec dépendances explicites. Chaque phase devrait être livrable indépendamment ("tu peux la voir marcher dans le navigateur") avant de passer à la suivante.

## Règle d'or : ZÉRO dette technique

**JAMAIS de dette technique. Toujours squeaky clean.** Cette règle est non-négociable et s'applique à 100% du code dans ce projet — frontend ET backend.

Concrètement, ça veut dire :

- **Pas de `// TODO: à refactorer plus tard`.** Si tu vois que quelque chose devrait être fait, tu le fais maintenant ou tu le notes dans `docs/` comme une décision explicite avec un raisonnement, pas comme un hack laissé en suspens.
- **Pas de code commenté-out.** Si c'est mort, supprime-le. Git garde l'historique.
- **Pas de "ouais c'est laid mais ça marche pour le démo".** Si ça marche pour le démo c'est qu'il y a une façon propre de l'écrire qui marche aussi.
- **Pas de hacks contournants.** Genre throw une erreur générique pour faire passer le typecheck, mocker un truc avec `any`, dupliquer du code parce que "c'est plus rapide" — non. On comprend le problème pis on fait la bonne fix.
- **Pas de duplication de logique.** DRY. Si on copie-colle 3 lignes pour la 2e fois, on extrait dans un helper.
- **Naming clair.** Pas de `data`, `temp`, `x`, `helper`, `util`. Si on se forçait à expliquer le nom à un collègue, ça doit avoir l'air sensé.
- **Types stricts partout.** Pas de `any`, pas de `@ts-ignore`, pas de `as unknown as X`. Si TypeScript se plaint c'est qu'il y a un vrai problème.
- **Pas d'over-engineering non plus.** Pas d'abstraction prématurée, pas de patterns enterprise pour 50 lignes de code. "Squeaky clean" ≠ "complexe", ça veut dire "exactement ce qu'il faut, écrit clairement".
- **Si un raccourci est légitime pour le scope** (genre, valider côté frontend pour UX optimistic), c'est pas une dette — c'est un choix volontaire. Mais ça doit être documenté quand c'est pas évident.

**À chaque PR / merge / commit important** : relecture rapide pour s'assurer qu'aucune dette s'est glissée dedans. Si oui, on règle avant de merger.

Cette règle s'applique même quand on est pressé. Surtout quand on est pressé.

## Architecture

Architecture client-serveur classique. **Backend tient la logique métier pis le state**, frontend est un client mince qui fait juste de l'UI.

### Backend (Fastify + TypeScript)

C'est là que tout se passe :

- **Auth** : login (accepte n'importe quoi pis retourne un sessionId), middleware qui valide le sessionId sur les routes protégées
- **Session / timer** : génération + burn de codes, calcul du temps restant, expiration automatique
- **Profile mode** : toggle Observation/Soumission, gates serveur pour les actions selon le mode
- **Flow de bourse** : étapes, validation des inputs, transitions d'état, cascade de codes A/B
- **Static data** : sert tous les fichiers de `backend/data/` sous `/data/*` (déjà en place)
- **State** : in-memory, `Map<sessionId, GameState>`. Pas de DB. Le state se perd au restart, c'est OK pour ce projet.

Le code backend est organisé proprement (routes, services, state) mais peut rester pragmatique — pas de DI containers, pas d'over-abstraction. C'est un thin server, pas une vraie app de prod.

### Frontend (React + Vite + TypeScript)

Mince. Ça affiche ce que le backend dit. Aucune logique métier.

- **RTK Query** pour fetcher pis cacher les responses du backend (timer, profil, formulaire, etc.)
- **Redux Toolkit** pour le state UI seulement (quel modal est ouvert, drafts de form non submitted, navigation tab courante) + un peu de state cached du backend qu'on veut garder local pour éviter le re-fetch (genre `endTime` du timer)
- **redux-persist** avec `localStorage` pour que le state survive un refresh
- **Style production** : composants bien séparés, hooks bien nommés, types stricts, pas de `any`, pas de logique stuffée dans des composants. Code-reviewable comme un vrai projet
- **Pas de validation côté client** (sauf UX optimistic). Le backend valide tout pis retourne les erreurs
- **EmailJS** : seul truc côté client qui appelle un service externe. Déclenché en réponse aux signaux du backend (genre `/api/codes/init-2fa` retourne `{ emailToSend: { template: '2fa-code', vars: { code: ... } } }`, frontend dispatche)

#### Pattern RTK à suivre

Mirror du pattern d'Emil dans son repo [emil1326/ReactNativeMicCamTest](https://github.com/emil1326/ReactNativeMicCamTest), adapté pour Vite/web :

**Types** (`src/types/<domain>.ts`) — type + factory function :
```ts
export type Profile = {
  mode: 'OBSERVATION' | 'SOUMISSION';
  studentNumber: string | null;
  // ...
};

const defaultProfile: Profile = {
  mode: 'SOUMISSION',
  studentNumber: null,
};

export function createProfile(overrides: Partial<Profile> = {}): Profile {
  return { ...defaultProfile, ...overrides };
}
```

**Slice** (`src/store/slices/<domain>Slice.ts`) — set/update/reset trio :
```ts
const profileSlice = createSlice({
  name: 'profile',
  initialState: createProfile(),
  reducers: {
    setProfile(_state, action: PayloadAction<Profile>) { return action.payload; },
    updateProfile(state, action: PayloadAction<Partial<Profile>>) { return { ...state, ...action.payload }; },
    resetProfile() { return createProfile(); },
  },
});
```

**Store** (`src/store/store.ts`) — combineReducers + persist + configureStore + RTK Query api middleware :
```ts
const rootReducer = combineReducers({
  profile: profileReducer,
  flow: flowReducer,
  ui: uiReducer,
  [api.reducerPath]: api.reducer,
});
const persistConfig: PersistConfig<RootState> = {
  key: 'root',
  storage,
  whitelist: ['profile', 'flow'], // PAS l'api cache (RTK Query gère sa propre cache), PAS l'ui state
};
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefault) => getDefault({
    serializableCheck: { ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', /* ... */] },
  }).concat(api.middleware),
});
```

**Hooks** (`src/store/hooks.ts`) — typed wrappers + selecteurs domain-specific (la "friendly wrapper") :
```ts
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Domain-specific — c'est ÇA le wrapper friendly
export const useProfile = () => useAppSelector((state) => state.profile);
export const useFlow = () => useAppSelector((state) => state.flow);
export const useUiState = () => useAppSelector((state) => state.ui);
```

**Provider setup** (`src/main.tsx`) :
```tsx
<Provider store={store}>
  <PersistGate loading={null} persistor={persistor}>
    <App />
  </PersistGate>
</Provider>
```

Naming conventions à respecter :
- Slice file : `<domain>Slice.ts`
- Reducers : `setX`, `updateX`, `resetX`
- Selector hook : `useCurrentX` ou `useX` selon ce qui se lit le mieux
- Pour les RTK Query endpoints : les hooks auto-générés (`useGetCoursesQuery`, `useStartFlowMutation`) sont OK tels quels, on les wrap pas sauf si on veut combiner plusieurs endpoints en un seul hook ergonomic

### Pourquoi cette architecture

- **Frontend portfolio-ready** : Emil veut que le code frontend soit clean, comme s'il allait être code-reviewé
- **Pratique du pattern client-serveur** : exactement comme un vrai projet
- **Backend test-friendly** : la logique métier dans le backend est testable en isolation (curl, Postman, etc.)
- **Pas de duplication de logique** : si la validation est seulement côté backend, on peut pas la "rater" sur un nouvel écran
- **No technical debt** : code clean dès le début, pas de "on règlera ça plus tard"

### State management split (récap)

| State | Vit ou |
|---|---|
| Source de vérité du game state (codes valides, profil, étape courante, validation) | Backend in-memory |
| Données statiques (cours, sidebar, messages, templates) | Backend `data/*.json` |
| Timer `endTime` (absolute timestamp) | **Cached côté frontend** dans `flowSlice` (persisté) — calculé une fois côté backend, réutilisé tel quel ensuite |
| Cache des responses backend (cours, profil, etc.) | Frontend RTK Query |
| UI state local (modal ouvert, draft de form, nav state) | Frontend Redux `uiSlice` |

**Principe :** on évite de poll le backend pour des données qui changent pas (genre le `endTime` qui est fixé une fois pour toutes au démarrage du flow). On call le backend seulement pour les actions (mutations) ou si on a perdu la cache pis qu'on doit recover.

### EmailJS

EmailJS reste pour envoyer les vrais emails SMTP depuis le browser. Pourrait techniquement être en backend avec nodemailer, mais ça nécessiterait de configurer des credentials SMTP côté serveur, ce qui ajoute du setup pour un gain marginal. EmailJS = juste une clé publique + un template ID. 200 emails/mois free tier.

Pattern : le backend retourne dans une response `{ ..., emailToSend: { template: 'twoFA', to: '...', vars: { code: '123456' } } }`. Le frontend voit ce signal pis dispatche EmailJS. Pas de logique d'envoi côté frontend, juste l'exécution.

## Phase 0 — Foundation (✅ fait)

- [x] Vite + React + TypeScript scaffold (`frontend/`)
- [x] Fastify + TypeScript backend (`backend/`) qui sert `backend/data/*` sous `/data/*` via `@fastify/static`
- [x] `backend/data/` créé avec un README
- [x] `start.ps1` qui lance les deux dev servers en tabs Windows Terminal

**Reste à faire :**

Côté frontend :
- `npm install @reduxjs/toolkit react-redux redux-persist`
- `npm install @emailjs/browser`
- Setup le store Redux dans `frontend/src/store/` selon le pattern de la section Architecture :
  - `store.ts` — combineReducers + persistReducer + configureStore + RTK Query api middleware. Whitelist `['flow', 'profile']` (pas l'api cache, pas l'ui)
  - `hooks.ts` — `useAppDispatch`, `useAppSelector`, pis les selecteurs domain (`useFlow`, `useProfile`, `useUiState`)
  - `api.ts` — `createApi` avec `baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3001', prepareHeaders: (h) => { h.set('X-Session-Id', sessionId); return h } })`
  - `slices/uiSlice.ts` — UI state (modals ouverts, etc.) avec set/update/reset
- Wrapper l'app dans `<Provider store={store}><PersistGate loading={null} persistor={persistor}>`
- Créer `frontend/src/config/emailjs.ts` (vide pour l'instant, sera rempli en Phase 6)
- Nettoyer le scaffold Vite default (App.tsx, App.css, le logo qui tourne, etc.)

Côté backend :
- Créer la structure de dossiers : `src/routes/`, `src/services/`, `src/state/`
- Créer `src/state/store.ts` : exporte la `Map<sessionId, GameState>` pis les helpers d'accès (getSession, createSession, etc.)
- Créer `src/services/auth.ts` : middleware qui lit le header `X-Session-Id` pis attache la session au request
- Créer `src/routes/auth.ts` avec `POST /api/auth/login` (accepte n'importe quoi, génère un sessionId UUID, le retourne)
- Wirer ça dans `src/index.ts`

Côté EmailJS :
- Créer un compte gratuit sur emailjs.com
- Configurer un service email (Gmail le plus simple)
- Créer un premier template de test
- Récupérer la clé publique + IDs (à mettre dans `frontend/src/config/emailjs.ts` plus tard)

## Phase 1 — Le shell visuel ColNet

Construire le layout de base que toutes les pages utilisent. Aucune logique de jeu, juste le squelette visuel.

**Frontend :**
- En-tête rouge solide avec : logo (placeholder), nom de l'utilisateur (depuis backend), date du jour, bouton DÉCONNECTER
- Sidebar gauche avec sections (`MON DOSSIER`, `MON COLLÈGE`) en rouge majuscule
- 30+ items dans la sidebar (fetched depuis `/data/sidebar.json` via RTK Query)
- Zone principale avec barre de titre grise/bleue
- CSS global "années 2003" : Times/Arial 11px, fond beige/gris pâle, bordures 1px solides, liens bleus soulignés, aucun whitespace
- Setup React Router avec pages stub vides
- Page d'accueil avec tableau de "messages de l'administration" (fetched depuis `/data/messages.json`)
- Page Login : formulaire qui appelle `POST /api/auth/login`, stocke le sessionId, redirige vers Accueil

**Backend :**
- Aucun nouveau code. Les endpoints `/api/auth/login` et `/data/*` faits en Phase 0 suffisent.

**Données :** `backend/data/sidebar.json`, `backend/data/messages.json`

**Sortie :** tu te login (n'importe quoi accepté), tu vois l'accueil ColNet-like, tu peux cliquer dans la sidebar pis tomber sur des pages "À venir".

## Phase 2 — Le système de timer

Foundational, doit être solide avant le reste.

### Principe : pas de polling

Le `endTime` du timer est calculé UNE fois côté backend au démarrage du flow, retourné au frontend, pis cached dans Redux (persisté). Le frontend gère ensuite tout localement à partir de cette valeur :

- Le temps restant = `endTime - Date.now()`, calculé à chaque render
- Les modals de jalons (1min/30s/10s) sont déclenchés par `setTimeout` locaux, calculés à partir de `endTime`
- Aucune requête backend juste pour "savoir l'heure"
- Le backend est seulement appelé pour les **actions** (start, check-timer avec code, regenerate-code) ou en **recovery** si la cache est manquante au load

Le bad-UX joke est préservé parce que le timer est **caché visuellement** par défaut — le frontend a la valeur mais le UI ne l'affiche pas. C'est seulement la dialog de vérification (avec le code 6 chiffres) qui révèle l'affichage pendant 10s. La validation du code se fait toujours côté backend (sécurité du jeu).

### Backend

Routes (`src/routes/session.ts`) :

- `POST /api/session/start-bourse-flow`
  - Démarre le timer (calcule `endTime = Date.now() + 3 * 60 * 1000`)
  - Génère le 1er code à 6 chiffres
  - Retourne `{ endTime, code }`
- `POST /api/session/check-timer` body `{ code }`
  - Valide le code (existe + pas brûlé)
  - Brûle le code
  - Retourne `{ ok: true, remainingMs }` si OK, 400 sinon
  - (Le frontend a déjà `endTime` mais on retourne `remainingMs` quand même comme source-of-truth pour la dialog)
- `POST /api/session/regenerate-code`
  - Génère un nouveau code 6 chiffres
  - Retourne `{ code }`
- `GET /api/session/recover`
  - Pour le cas ou le frontend a perdu son `endTime` cached
  - Retourne `{ flowActive: boolean, endTime: number | null, expired: boolean }`
  - Appelé seulement à la recovery (on app load si flowSlice dit "active" mais `endTime` est manquant ou bizarre)

Services (`src/services/timer.ts`) : génère codes 6 chiffres, gère le set des codes valides + brûlés, expiration auto.

State : ajout au `GameState` de `{ flow: { endTime, codes: { active: string | null, burned: string[] } } }`.

### Frontend

**Slice** (`src/store/slices/flowSlice.ts`) :
- State : `{ active: boolean, endTime: number | null }` (le `endTime` cached, c'est tout)
- Reducers : `setFlow`, `updateFlow`, `resetFlow` (pattern habituel)
- Persisté via redux-persist whitelist

**Hook `useTimer()`** (`src/hooks/useTimer.ts`) :
```ts
export function useTimer() {
  const flow = useFlow(); // depuis store/hooks.ts
  return {
    isActive: flow.active,
    endTime: flow.endTime,
    remainingMs: () => flow.endTime ? flow.endTime - Date.now() : 0,
    isExpired: () => flow.endTime ? Date.now() >= flow.endTime : false,
  };
}
```

**Hook `useTimerMilestones()`** : déclenche les modals à 1min/30s/10s via `setTimeout` calculés depuis `endTime`. Cleanup les timeouts si unmount ou flow reset.

**RTK Query endpoints** (`src/store/api.ts`) :
- `startBourseFlow: builder.mutation<{ endTime: number; code: string }, void>` — appelée par le bouton "Demander un remboursement". onQueryStarted dispatch `setFlow({ active: true, endTime: data.endTime })` après réponse.
- `checkTimer: builder.mutation<{ remainingMs: number }, { code: string }>` — utilisée par la dialog de vérification.
- `regenerateCode: builder.mutation<{ code: string }, void>` — bouton "Générer un nouveau code".
- `recoverSession: builder.query<{ active: boolean; endTime: number | null; expired: boolean }, void>` — appelée seulement au mount de l'app si `flowSlice.active === true && flowSlice.endTime === null`.

**Composants :**
- `VerificationDialog` : input pour le code, sur submit appelle `checkTimer` mutation, affiche `remainingMs` retourné pendant 10s (countdown UI local), se ferme.
- Page "Sécurité > Codes de vérification de session" : bouton qui appelle `regenerateCode`, affiche le code retourné.
- `TimerMilestoneModal` : monté au root quand `useTimer().isActive`. Schedule `setTimeout` pour les 3 jalons. À chaque trigger, ouvre le modal pendant 3s, sans bouton de fermeture.
- Page de timeout : montrée quand `useTimer().isExpired()` devient true. Dispatch `resetFlow()` au mount.

**Recovery au app load** : un `useEffect` dans `App.tsx` qui regarde `useFlow()`. Si `active && endTime == null` → appelle `useRecoverSessionQuery()`. Si la backend dit que le flow est active, dispatch `setFlow({ ... })` avec les nouvelles valeurs. Si le flow est expiré ou inactif, dispatch `resetFlow()`.

**Sortie :** tu démarres un faux flow, tu reçois un code, tu fais la danse pour voir le timer, tu regenères des codes, tu te fais matraquer par les modals de jalons (déclenchés localement, pas via polling), tu te fais kicker au timeout.

## Phase 3 — Le toggle profil

Affecte presque toutes les pages.

**Backend :**
- Routes (`src/routes/profile.ts`) :
  - `GET /api/profile` → retourne le profil complet, MAIS le no étudiant et autres infos sensibles sont retournées comme `null` si `mode === 'SOUMISSION'`
  - `POST /api/profile/mode` body `{ mode }` → flip le mode
  - Middleware sur toutes les routes de submit : check le mode actuel, retourne 403 si en `OBSERVATION` avec un message clair (genre `{ error: 'PROFILE_MODE_BLOCKS_SUBMIT' }`)
- State : `profileMode: 'OBSERVATION' | 'SOUMISSION'`, `studentNumber: string`, etc. dans `GameState`

**Frontend :**
- Hook `useProfile()` qui wrap RTK Query
- Page Options : longue liste de settings. Le toggle de mode est caché parmi 30 autres options sans label clair
- Composant `<ProtectedField>` : utilise `useProfile()` pour décider de render la valeur ou un placeholder vide
- Composant `<SubmitButton>` : utilise `useProfile()` pour décider d'être disabled ou non. Aucun message d'erreur clair, juste grisé.

**Sortie :** tu peux flipper ton profil dans Options, observer que les boutons Submit deviennent grisés, observer que les infos disparaissent quand tu retournes en Soumission.

## Phase 4 — Le formulaire + le bulletin

Maintenant qu'on a le timer pis le profil mode, on construit la 1ʳᵉ vraie étape frustrante.

**Backend :**
- Routes (`src/routes/bourse.ts`) :
  - `GET /api/bourse/balance` → retourne `{ balance: 13486 }` ou `{ balance: 0 }` selon l'état du flow
  - `POST /api/bourse/form` body `{ studentNumber, code1, code2, code3 }` → validation stricte (un caractère wrong = 400 avec détails), sauvegarde si OK
- Service `src/services/bourse.ts` : la logique de validation (lit les vraies valeurs depuis `backend/data/bulletin-secrets.json`)

**Frontend :**
- Page "État de compte" : affiche le solde (RTK Query) + bouton "Demander un remboursement" (mutation qui call `start-bourse-flow`)
- Page Formulaire de demande : champs simples, sur submit envoie au backend, affiche les erreurs retournées
- Page Bulletin : bouton qui télécharge `/data/bulletin_2026.pdf`
- Le PDF est en fait une image — à fabriquer manuellement (PNG dans un PDF wrapper, ou screenshot d'un faux bulletin HTML converti en PDF)

**Données :** `backend/data/bulletin_2026.pdf` (à fabriquer), `backend/data/bulletin-secrets.json` (les vraies valeurs valides pour validation)

**Sortie :** tu démarres une demande, tu vas chercher tes infos en mode Observation (no étudiant + codes du bulletin-image), tu retapes les UUIDs à la main, tu re-flippes en Soumission, tu soumets le formulaire.

## Phase 5 — La liste de cours

L'écran ou tu confirmes ta sélection avec le mauvais scroller.

**Backend :**
- Routes (dans `src/routes/bourse.ts`) :
  - `GET /api/bourse/courses` → retourne les ~200 cours hardcodés
  - `POST /api/bourse/course-selection` body `{ courseIds: string[] }` → valide qu'il y en a 3 + qu'ils matchent ceux du formulaire, sauvegarde

**Frontend :**
- Composant `CourseList` : ~200 cours fetched, texte minuscule, sans recherche, ordre apparemment aléatoire
- Composant `BadScroller` : custom scroll qui bug (trop lent en click+drag, trop rapide à la molette, saute des sections)
- Checkboxes minuscules
- Bouton Confirmer qui apparaît seulement quand 3 sont cochés (sans message qui te le dit)

**Données :** `backend/data/courses.json` avec ~200 entrées hardcodées

**Sortie :** tu confirmes ta sélection après avoir scrollé dans l'enfer.

## Phase 6 — Email réel (SMTP) + 2FA + cascade de codes

Tu reçois un VRAI email dans ta vraie inbox, fais du 2FA, pis trouves le tab caché pour générer le Code B.

**Setup EmailJS :**
- Compte gratuit sur emailjs.com, service Gmail, 2-3 templates ("2fa-code", "code-a")
- Mettre la clé publique + IDs dans `frontend/src/config/emailjs.ts`

**Backend :**
- Routes (`src/routes/codes.ts`) :
  - `POST /api/codes/init-2fa` → génère un code 2FA, le sauve en state, retourne `{ emailToSend: { template: '2fa-code', to: ..., vars: { code: ... } } }`
  - `POST /api/codes/verify-2fa` body `{ code }` → vérifie, retourne `{ ok: true, emailToSend: { template: 'code-a', ... } }` si OK
  - `POST /api/codes/exchange-a-for-b` body `{ codeA }` → vérifie le Code A, génère + retourne le Code B
- Service `src/services/codes.ts` : génération + validation des codes A et B

**Frontend :**
- Hook `useEmailJS()` : wrapper sur `@emailjs/browser` qui prend `{ template, to, vars }` et envoie. Trigger automatique quand un endpoint retourne `emailToSend`.
- Page 2FA : champ pour entrer le code reçu par email, submit appelle `verify-2fa`
- Page cachée dans nested tabs (`Mon dossier > Documents > Confirmations > Codes > Validation > Sélection`) : entre le Code A → reçoit le Code B

**Données :** `backend/data/email-templates.json` (le contenu textuel injecté dans les templates EmailJS — variables seulement)

**Tradeoffs à savoir :**
- Délai EmailJS de 1-30s, ON-BRAND pendant que le timer roule
- Spam filter à whitelister
- Free tier 200 emails/mois

**Sortie :** tu joues le flow, vrai email reçu, tu copies les codes, tu complètes la cascade pis arrives avec un Code B en main.

## Phase 7 — Le submit + les modals piège

La fin du flow.

**Backend :**
- Route (`src/routes/bourse.ts`) :
  - `POST /api/bourse/submit` body `{ codeB }` → vérifie le Code B + mode Soumission, met le balance à 0, ferme le flow
  - `POST /api/bourse/cancel` → annule la demande, balance reste

**Frontend :**
- Modal de confirmation 1 ("Êtes-vous sûr ?") : bouton Confirmer normal (UI seulement, pas de call backend)
- Modal de confirmation 2 ("Action irréversible") : bouton Confirmer normal
- Modal de confirmation 3 ("Veuillez NE PAS confirmer...") : tous les boutons appellent `cancel`, faut attendre 10s sans rien toucher pour que le frontend appelle `submit` (timer caché client-side, c'est de l'UI behavior pas de la business logic)
- Page de succès : notif verte 0.5s qui disparaît, écran avec balance à 0$
- Page d'échec : "Demande annulée. Veuillez recommencer.", balance reste 13 486 $

**Sortie :** flow complet jouable end-to-end. C'est le MVP du jeu.

## Phase 8 — Polish & extras (optionnel)

Une fois le core en place, on ajoute des trucs purement UI (frontend only) :

- Notifications qui disparaissent en 0.5s (succès, erreurs, info)
- Spinner de chargement décoratif sur des actions instantanées
- Boutons qui changent de position aléatoirement quand tu hover (sur les pages secondaires)
- Form validation qui clear la moitié des champs en cas d'erreur (côté UI uniquement)
- Inputs qui se reset si tu cliques mal
- "Êtes-vous sûr ?" sur des actions triviales (cancel, retour)
- Animations qui freeze le UI pendant 2s

À faire en dernier, en piochant selon ce qui semble le plus drôle. Tout ça reste UI behavior, donc frontend only.

## Phase 9 — Vérification biométrique (à décider)

Voir [proposition_biometrique.md](./proposition_biometrique.md). En attente de discussion avec le partenaire.

Note : si retenue, le service Python ferait son propre /api (genre POST /api/biometric/verify), le backend Fastify ferait juste un proxy ou laisserait le frontend appeler directement. À décider plus tard.

---

## Structure de fichiers cible

```
BadAppReact/
├── frontend/
│   └── src/
│       ├── store/
│       │   ├── store.ts              configureStore + persist + api middleware
│       │   ├── hooks.ts              useAppDispatch, useAppSelector, useFlow, useProfile, useUiState
│       │   ├── api.ts                RTK Query (createApi + endpoints)
│       │   └── slices/
│       │       ├── flowSlice.ts      flow active + endTime cached
│       │       ├── profileSlice.ts   mode + infos profil cached
│       │       └── uiSlice.ts        UI-only state (modals ouverts, drafts, etc.)
│       ├── types/                    flow.ts, profile.ts, course.ts, etc. (types + factory functions)
│       ├── layout/                   Header, Sidebar, MainArea
│       ├── pages/                    Accueil, EtatDeCompte, Bulletin, Options, Login, etc.
│       ├── flows/bourse/             Pages spécifiques au flow de bourse
│       ├── components/               BadScroller, VerificationDialog, MilestoneModal, ProtectedField, SubmitButton
│       ├── hooks/                    useTimer, useTimerMilestones, useEmailJS
│       ├── config/                   emailjs.ts (clé publique + IDs templates)
│       └── styles/                   CSS global "ColNet 2003"
├── backend/
│   ├── src/
│   │   ├── index.ts                  bootstrap Fastify, register plugins, register routes
│   │   ├── routes/
│   │   │   ├── auth.ts               POST /api/auth/login
│   │   │   ├── session.ts            timer + codes 6-chiffres
│   │   │   ├── profile.ts            mode Observation/Soumission
│   │   │   ├── bourse.ts             balance, form, course selection, submit, cancel
│   │   │   └── codes.ts              2FA + Code A/B
│   │   ├── services/
│   │   │   ├── timer.ts              génération + validation des codes 6-chiffres, expiration
│   │   │   ├── bourse.ts             validation du formulaire, course selection
│   │   │   └── codes.ts              génération Code A/B
│   │   └── state/
│   │       └── store.ts              Map<sessionId, GameState> + helpers
│   ├── data/
│   │   ├── sidebar.json              items de la sidebar
│   │   ├── messages.json             messages dashboard
│   │   ├── courses.json              ~200 cours
│   │   ├── email-templates.json      contenu textuel des emails (vars seulement)
│   │   ├── bulletin-secrets.json     valeurs valides pour validation
│   │   └── bulletin_2026.pdf         le faux bulletin (image dans un PDF)
│   └── package.json
├── docs/                             ← documentation
└── start.ps1                         lance frontend + backend en 2 tabs wt
```

## Approche de testing

Pas de tests automatisés. Le projet EST le test. Manuel uniquement : tu joues le flow toi-même, tu valides que c'est suffisamment frustrant, tu ajustes.

Pour le backend, vu qu'il a maintenant de la vraie logique : un fichier `backend/test-requests.http` (utilisable avec REST Client de VS Code) avec les requêtes principales pour pouvoir tester rapidement les endpoints sans cliquer dans l'app. Léger, pas de framework.

Si jamais doute si une étape est "vraiment chiante" ou juste "broken" : faire jouer un proche qui sait pas c'est quoi le projet pis observer sa réaction. C'est ça la métrique.

## Ordre recommandé pour 2 personnes

Phases 0, 1, 2 et 3 doivent être faites avant à peu près tout le reste. Une fois ces 4 fondations en place, on peut paralléliser :

- Personne A : Phase 4 (formulaire + bulletin) → Phase 7 (submit + modals)
- Personne B : Phase 5 (course list) → Phase 6 (email + 2FA + codes)

Phase 8 (polish) en dernier, ensemble. Phase 9 (biométrique) en parallèle si décidée.

Pour les phases avec backend + frontend, possible aussi de splitter par couche : une personne fait les routes/services côté backend, l'autre branche le frontend dessus avec RTK Query. Ça marche bien si les deux personnes sont à l'aise des deux côtés.
