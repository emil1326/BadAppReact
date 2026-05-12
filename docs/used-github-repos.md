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

### [puppeteer/puppeteer](https://github.com/puppeteer/puppeteer)

Chromium headless piloté par Node. Sert à générer le bulletin de notes en PDF à la volée à partir d'un template HTML, au moment où l'étudiant(e) clique sur « Télécharger » dans la page Bulletin.

- Package npm : `puppeteer` (télécharge ~170 MB de Chromium à l'install — fait une fois)
- Le backend lit `backend/data/bulletin_2026.template.html`, substitue les placeholders (`{{code1}}`, `{{code2}}`, `{{code3}}` + les 3 decoys dérivés des vrais codes) avec les valeurs courantes de `bulletin-secrets.json`, puis passe l'HTML à `page.setContent` et appelle `page.pdf({ format: 'Letter', printBackground: true })`.
- Instance `Browser` mise en cache (lancée à la 1<sup>re</sup> requête, ~1-2 s, puis réutilisée — chaque PDF subséquent est ~300 ms). Fermée proprement via le hook `onClose` de Fastify.
- Avantage : modifier `bulletin-secrets.json` change immédiatement le PDF servi, pas de rebuild ni de regénération manuelle.

Voir : `backend/src/services/bulletin.ts` (rendu), `backend/src/routes/bulletin.ts` (route `GET /api/bulletin.pdf`), `backend/data/bulletin_2026.template.html` (template avec placeholders).

### [Hopding/pdf-lib](https://github.com/Hopding/pdf-lib)

Manipulation de PDF en pur JS (création, embed d'images, etc.). Utilisé en tandem avec puppeteer pour produire un bulletin **image-PDF** (codes non-copiables, pour matcher la note « document numérisé » de la page Bulletin).

- Package npm : `pdf-lib`
- Pipeline : puppeteer screenshote chaque `.page` du template HTML en PNG (`deviceScaleFactor: 2` pour la netteté), puis pdf-lib emballe les PNGs un par un dans des pages PDF Letter (612 × 792 pt). Aucun texte vectoriel dans le PDF final — chaque page est une grosse image.
- Pure JS, aucun binaire externe (vs ghostscript / wkhtmltopdf).

Voir : `backend/src/services/bulletin.ts` (la boucle `for (const handle of pageHandles)`).
