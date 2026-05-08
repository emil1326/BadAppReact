# Repos GitHub utilisés

Liste des repos qu'on a référencés ou dont on a utilisé du code dans BadAppReact. Sert de crédit + de pointeur si on veut retourner voir comment ils ont fait quelque chose.

## Patterns / structure

### [emil1326/ReactNativeMicCamTest](https://github.com/emil1326/ReactNativeMicCamTest)

Repo personnel d'Emil (projet React Native antérieur). On y a pris le pattern Redux Toolkit utilisé partout dans le frontend :

- `types/<domain>.ts` avec un type + une factory `createX(overrides)`
- `store/slices/<domain>Slice.ts` avec le trio `setX` / `updateX` / `resetX`
- `store/store.ts` avec `combineReducers` + `redux-persist` + `configureStore`
- `store/hooks.ts` avec les wrappers typés `useAppDispatch`, `useAppSelector` + des selecteurs domain (`useCurrentX`)

Adapté pour le web : `redux-persist/lib/storage` (en fait un adapter custom localStorage à cause d'un bug Vite/CJS) au lieu de `AsyncStorage`.

Voir : `frontend/src/store/`, `frontend/src/types/`.

## Bibliothèques (npm packages)

### [effectussoftware/react-custom-roulette](https://github.com/effectussoftware/react-custom-roulette)

Composant `<Wheel>` pour la roue de fortune. Utilisé sur la page `Vignette auto` pour le tirage de vignette de stationnement.

- Package npm : `react-custom-roulette`
- Peer dep officiel : React `^18.2.0`. On l'a installé avec `--legacy-peer-deps` sur React 19, fonctionne sans souci.
- Props utilisées : `data`, `mustStartSpinning`, `prizeNumber`, `onStopSpinning`, `outerBorderColor`, `innerBorderColor`, `radiusLineColor`, `fontSize`, `spinDuration`.

Voir : `frontend/src/pages/VignetteAutoPage.tsx`.

### [produktdev/svg-captcha](https://github.com/produktdev/svg-captcha) (côté backend)

Génération de SVG captcha pour les codes à 6 chiffres affichés dans la page Sécurité.

- Package npm : `svg-captcha`
- Utilisé côté backend (Fastify) — le serveur génère le SVG et envoie le markup au frontend, qui le rend tel quel via `dangerouslySetInnerHTML`. Ça garde le texte du code hors du frontend (pas de copier-coller possible, faut le déchiffrer visuellement).

Voir : `backend/src/services/timer.ts` (génération), `frontend/src/components/CaptchaCode.tsx` (rendu).

### [emailjs-com/emailjs-nodejs](https://github.com/emailjs-com/emailjs-nodejs)

SDK Node.js officiel d'EmailJS pour envoyer des vrais emails SMTP depuis le backend.

- Package npm : `@emailjs/nodejs`
- La clé privée EmailJS reste côté serveur via `backend/.env`, jamais dans le bundle frontend.

Voir : `backend/src/services/email.ts`.
