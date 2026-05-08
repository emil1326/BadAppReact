# BadAppReact

Ok ben le brief c'est : faire la PIRE app React possible. Genre, exprès. Tout un exercice de classe sur le mauvais UI/UX, ou le but c'est pas de faire quelque chose de beau, c'est de comprendre ce qui rend une app insupportable en, ben, en faisant une.

On a choisi un portail étudiant. Tout le monde a déjà utilisé un portail étudiant pourri à un moment donné, fait que la barre est déjà honnêtement assez basse... mais nous on vas BEAUCOUP plus loin. Le concept c'est : impossible à utiliser. Des règles de sécurité partout, des onglets imbriqués dans des onglets imbriqués pour faire la moindre action, pis par dessus tout ça il y a un timer.

Pourquoi le timer ? Ben parcequ'on voulais qu'il y aille des vrais enjeux. Fait que c'est pas juste "ugh c'est gossant", c'est "si je soumets pas ce stupid form en X secondes je perds ma bourse". Ça transforme le tout en genre un jeu, tout en faisant paniquer l'utilisateur pour vrai, pis c'est ça la partie le fun :>

Le but c'est pas que ce soit un vrai portail. Le but c'est de faire RESSENTIR aux gens ce que le mauvais UX leur fait, la frustration, l'anxiété, l'envie de revirer un bureau, en empilant tous les dark patterns qu'on est capable de penser les uns par dessus les autres. Moitié produit, moitié chambre de torture.

## Stack

Architecture client-serveur classique. Backend Fastify (TS) tient toute la logique métier pis le state (in-memory, pas de DB). Frontend React + Vite + TS reste mince — juste de l'UI qui appelle le backend via RTK Query, avec Redux pour le state UI seulement. EmailJS pour envoyer des vrais emails SMTP depuis le browser (utile pour le flow de 2FA / cascade de codes).

C'est volontairement plate pis normal côté tech — la badness vit dans le UX, pas dans le code.

## Dossiers

```
BadAppReact/
├── frontend/    l'app Vite + React, mince, juste de l'UI
├── backend/     Fastify, logique métier + state in-memory + JSON statiques sous /data/*
├── docs/        t'es ici
└── start.ps1    démarre les deux dev servers en tabs Windows Terminal
```

## Comment le rouler

```powershell
.\start.ps1
```

C'est tout. Le frontend ouvre sur `http://localhost:5173`, le backend sur `http://localhost:3001`. Le script installe les dépendances tout seul si `node_modules` existe pas dans un des deux dossiers.

## Idées de mauvais design qu'on veut essayer

Juste un brain-dump pour le moment, on raffinera plus tard :

- Des onglets dans des onglets dans des onglets, peut-être 4 niveaux de profondeur avant de pouvoir faire l'action en question
- Des timers qui se mettent pas en pause quand un modal ouvre
- Des "Êtes-vous sûr ?" sur CHAQUE click, incluant le bouton annuler
- De la fausse "sécurité" du genre CAPTCHA-mais-pire, des prompts de rotation de mot de passe qui apparaissent au milieu d'un form
- Des inputs qui se reset si tu cliques sur la mauvaise affaire
- Des boutons qui changent de place juste avant que tu cliques
- De la validation de form qui se fait juste APRÈS que tu pèses sur soumettre, pis qui efface la moitié de tes inputs
- Des labels mensongers, "Sauvegarder" qui soumet en fait, "Soumettre" qui annule en fait, etc.
- Des notifications qui disparaissent en 0.5s fait que t'as pas le temps de lire
- Un spinner de chargement qui est juste là pour le vibe, sans que rien ne charge

Le thème qui unit tout ça : chaque interaction devrait se sentir un peu wrong, pis les interactions à gros enjeu (la bourse, l'inscription, etc.) devraient se sentir activement menaçantes.
