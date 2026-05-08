# backend/data

Données statiques de l'app, servies par Fastify sous l'URL `/data/*`.

## Comment ça marche

Le serveur Fastify (`backend/src/index.ts`) utilise `@fastify/static` pour exposer ce dossier au complet sous le préfixe `/data/`. Donc :

| Fichier sur disque | URL servie |
|---|---|
| `backend/data/courses.json` | `http://localhost:3001/data/courses.json` |
| `backend/data/sidebar.json` | `http://localhost:3001/data/sidebar.json` |
| `backend/data/bulletin_2026.pdf` | `http://localhost:3001/data/bulletin_2026.pdf` |

Le frontend fetch ces URLs en runtime (via `fetch()` ou RTK Query). CORS est déjà configuré pour `localhost:5173`.

## Pourquoi un backend pour ça ?

Pour avoir une **séparation propre** entre l'app et ses données, comme dans une vraie architecture client-serveur. Même si Fastify ne fait à peu près rien (pas de logique métier, pas de DB, pas de state), c'est plus représentatif d'un vrai projet pis ça nous permet de pratiquer le pattern fetch/REST côté frontend.

## Fichiers attendus (à créer au fur et à mesure des phases)

- `sidebar.json` — items de la sidebar (Phase 1)
- `messages.json` — messages du dashboard (Phase 1)
- `courses.json` — ~200 cours pour la liste (Phase 5)
- `email-templates.json` — templates pour les emails envoyés via EmailJS (Phase 6)
- `bulletin-secrets.json` — valeurs valides pour la validation du formulaire (Phase 4)
- `bulletin_2026.pdf` — le faux bulletin qui est en fait une image (Phase 4)
