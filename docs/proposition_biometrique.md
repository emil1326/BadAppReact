# Proposition : étape de vérification biométrique

**Statut :** à décider 

## L'idée

Insérer une étape de "vérification d'identité biométrique" quelque part dans le flow de demande de bourse (idéalement entre l'Étape 4 et 5, juste après la confirmation des cours, juste avant la cascade d'emails). Présentée comme une nouvelle mesure de sécurité imposée par un "partenaire externe", évidemment mal intégrée pis chiante.

Le but reste 100% on-brand : faire perdre du temps précieux à l'utilisateur pendant que le timer principal continue de rouler, tout en l'humiliant un peu en le forçant à faire le clown devant sa caméra.

## Pourquoi ça fitte dans le projet

- C'est de la **fausse sécurité** poussée à l'extrême (alignée avec le thème)
- Ça ajoute une dimension **physique** à la frustration (jusqu'ici tout est mental/clavier-souris)
- Le timer qui roule pendant que tu fais des grimaces est une nouvelle source d'anxiété
- Visuellement c'est intéressant : preview de webcam + UI de "vérification en cours" très bureaucratique

## Stack technique proposé

Ajouter un **3e service** en Python à côté de Fastify :

- **FastAPI** (équivalent Python de Fastify, async, rapide à set-up)
- **MediaPipe** (lib de Google pour face/pose/hand detection, tourne localement, pas besoin d'entraînement)
- Communication : le frontend stream les frames de la webcam (via `getUserMedia`) au service Python, qui répond avec un verdict (smile detected, finger count, head pose, etc.)

Architecture :

```
React (webcam capture)
  ↓ frames
Python FastAPI (MediaPipe detection)
  ↓ verdict
React (success / fail / retry)
```

Le service Python tourne en parallèle sur un autre port (genre 8000), accessible depuis le frontend en CORS.

## Impact sur l'app

- **`start.ps1`** : ajouter un 3e tab pour démarrer le service Python (`uvicorn main:app --reload`)
- **Nouveau dossier** : `ml_service/` avec ses propres deps Python
- **Frontend** : ajouter un composant `BiometricCheck` qui fait la capture + envoie les frames + affiche le résultat
- **Backend Fastify** : un endpoint pour marquer l'étape comme complétée une fois la vérif passée (state global du flow)

## Idées d'épreuves stupides

À choisir/combiner pour rendre l'étape insupportable :

- **"Souriez exactement à 73%"** — une jauge live de l'intensité du sourire, faut tenir 3 secondes pile dans la zone (entre 70 et 76%)
- **"Maintenez 3 doigts visibles pendant 10 secondes sans bouger"** — tout tremblement reset le compteur
- **"Suivez le cercle avec votre regard"** — un cercle se promène à l'écran, tu dois le suivre des yeux, mais cligner = échec
- **"Imitez cette émotion"** — emoji aléatoire (😡, 😱, 🥺), tu dois reproduire jusqu'à ce que la détection accepte
- **"Présentez votre carte étudiante à la caméra"** — l'OCR rejette tout sauf un angle parfait, faux verdict de "carte non lisible"
- **"Tournez la tête lentement de gauche à droite"** — vitesse mal calibrée, soit trop rapide soit trop lent = échec
- **"Récitez votre numéro étudiant à voix haute"** — speech-to-text mauvais exprès, refait jusqu'à ce que ça matche

Le tout enveloppé dans un UI très "vérification gouvernementale" : preview caméra petite, bordure rouge "ENREGISTREMENT EN COURS", instructions en gris pâle, bouton "Réessayer" qui apparaît seulement après 3 secondes d'attente.

## Questions à régler avec le partenaire

- **On garde ou on garde pas ?** L'idée est cool mais ajoute beaucoup de complexité (Python à installer, MediaPipe sur Windows peut être chiant, deps à gérer). Est-ce que ça vaut la peine pour le scope du projet d'école ?
- **Si oui : combien d'épreuves ?** Une suffirait (genre "smile à 73%"), ou on en met 2-3 en cascade pour vraiment torturer ?
- **Quelle position dans le flow ?** Entre Étape 4 et 5 (proposition par défaut), ou ailleurs ? (ex: tout au début comme "vérification d'accès", ou juste avant le submit final)
- **Skip-able ou pas ?** On peut prévoir un mode "sans caméra" qui skip cette étape pour démos rapides, ou c'est mandatory dans le flow

## Décision

À remplir après discussion. Date prévue : _____ . Décision : _____ .
