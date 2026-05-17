# BadAppReact — catalogue des patterns UI/UX hostiles

Document de référence listant tous les patterns d'UX hostile implémentés dans COLNET v0.5. Le but du projet est de construire le pire portail étudiant possible — chaque pattern documenté ici est **intentionnel** et fait partie du livrable.

Catégorisé par type. Référence le fichier source lorsque pertinent.

---

## 1. Navigation et repérage

### 1.1. La sidebar se mélange en permanence
Les items de la section « MON DOSSIER » sont re-mélangés à intervalle régulier. La position d'un item est une cible mouvante : tu mémorises où est « Bulletin » et la prochaine fois qu'il te le faut, il a changé de place.
`frontend/src/layout/Sidebar.tsx:10`

### 1.2. La sidebar a 35 items, ordre alphabétique
Trente-cinq entrées dans « Mon Dossier » seul, sans regroupement sémantique, juste l'alphabet. « Bulletin » est entre « Bibliothèque » et « Carte étudiante ». Aucun indicateur de ce qui est important ou utilisé fréquemment.
`backend/data/sidebar.json`

### 1.3. Highlight de hover qui « colle » 2 secondes
Le hover de la sidebar utilise une transition CSS avec 2 secondes de délai + 2 secondes de durée. Le surlignage met 2s à apparaître quand tu passes la souris dessus, et reste collé 2s après que la souris est partie, puis fade pendant 2s. Maximalement laggy.
`frontend/src/styles/colnet.css:232-249`

### 1.4. Le hover est presque illisible
La couleur de fond au hover est `#1d0042` (violet sombre profond). Le texte noir par-dessus devient presque invisible. Cliquer au pif sur ce qui semblait être un lien.
`frontend/src/styles/colnet.css:241`

### 1.5. Le chemin pour récupérer le Code B
Pour échanger le Code A contre un Code B, il faut naviguer : *Mon dossier → Documents → Confirmations → Codes → Validation → Sélection*. Six niveaux d'imbrication. Mentionné comme un rappel dans la page de soumission.
`frontend/src/pages/BourseSubmitPage.tsx:177`

### 1.6. Les scrollbars sont toujours visibles
Un pseudo-élément invisible de 1px est positionné 8px hors du viewport sur les deux axes, ce qui force le navigateur à afficher les barres de défilement vertical ET horizontal en permanence — peu importe la taille du contenu réel. Il y a toujours quelque chose juste hors de portée.
`frontend/src/styles/colnet.css:59-68`

---

## 2. Le piège du Mode (Observation vs Soumission)

### 2.1. Aucun formulaire n'est soumissible par défaut
Le compte démarre en mode **Observation**. Tant que l'utilisateur n'est pas passé en mode **Soumission**, aucun formulaire ne se soumet. L'erreur ne dit pas explicitement pourquoi — elle ouvre la « modal d'aide sur le mode » à la place.
`frontend/src/pages/EtatDeComptePage.tsx:23-26`

### 2.2. Le toggle de mode est enterré dans « Options »
Pour changer de mode, il faut aller dans **Options** (un des 35 items de la sidebar) → faire défiler jusqu'à la section **Confidentialité** (la 4e section sur 6) → trouver l'item « Mode opérationnel du dossier » coincé entre deux toggles de confidentialité sans rapport.
`frontend/src/pages/OptionsPage.tsx:146-147`

### 2.3. Le libellé du toggle ne dit pas ce qu'il fait
« Mode opérationnel du dossier » avec les options « Consultation » et « Soumission ». Aucun lien évident avec la procédure de bourse qu'il faut activer pour utiliser le portail correctement.
`frontend/src/pages/OptionsPage.tsx:301-303`

### 2.4. La modal d'aide enterre l'information critique
Quand l'utilisateur clique « Démarrer la procédure » en mode Observation, une modal s'ouvre avec 4 paragraphes de texte juridique dense. L'instruction utile (« allez dans la page Options, section MON DOSSIER ») est dans le 3e paragraphe.
`backend/data/mode-help.json`

### 2.5. Toutes les autres options sont des leurres
Les 25+ autres paramètres dans Options (langue, fuseau horaire, notifications, accessibilité, sécurité) sont des leurres visuels. Ils affichent « En cours... » puis « Enregistré » après 1,5s mais ne persistent rien. Le seul toggle qui fonctionne est celui du mode.
`frontend/src/pages/OptionsPage.tsx:246-250`

---

## 3. Pression temporelle

### 3.1. La procédure de bourse a un timer de 15 minutes
Une fois la procédure démarrée depuis l'État de compte, l'utilisateur a 15 minutes pour tout compléter — bulletin PDF, convertisseur, sélection de cours, code B, 3 modals. Aucune sauvegarde intermédiaire possible.
`backend/src/services/timer.ts:4`

### 3.2. Une modal « RAPPEL DE TEMPS » s'affiche toutes les 1min30
Une bannière plein écran apparaît à 11 moments fixes pendant la procédure : à 13:30, 12:00, 10:30, 9:00, 7:30, 6:00, 4:30, 3:00, 1:30 restant (chacun à 1min30 d'intervalle), puis 30s et 10s pour les rappels finaux. Chaque modal **bloque la page pendant 3 secondes** sans contrôle de fermeture. **11 interruptions de 3 secondes = 33 secondes volées** sur le timer de 15 minutes, à des moments choisis pour maximiser l'agacement (parfois au milieu d'une saisie).
`frontend/src/hooks/useTimerMilestones.ts` + `frontend/src/components/TimerMilestoneModal.tsx`

### 3.3. Le résultat du convertisseur disparaît au bout de 8 secondes
Chaque conversion de code (3 à faire au total) affiche le résultat pendant 8 secondes, puis il disparaît. Aucun historique conservé. Tu dois copier le code à la main avant qu'il disparaisse.
`frontend/src/pages/BourseConverterPage.tsx:7`

### 3.4. La modal de validation finale demande d'attendre 10 secondes
La 3e et dernière modal de confirmation contient ce piège : si tu cliques **n'importe quel bouton** (Confirmer ou Annuler), la demande est **annulée**. Pour qu'elle se soumette réellement, il faut attendre 10 secondes sans rien faire.
`frontend/src/pages/BourseSubmitPage.tsx:24, 65-76, 333-367`

### 3.5. Le système est en maintenance pendant la deadline
Date d'échéance du solde : **15 mars 2026**. Le système de réinscription est en maintenance du **12 au 16 mars 2026**. La fenêtre de paiement chevauche exactement la panne planifiée.
`frontend/src/pages/EtatDeComptePage.tsx:11`

### 3.6. La fenêtre de désistement est de 24 heures
D'après le bulletin : le désistement de la réinscription doit être remis **en personne** au bureau 14-B entre le 15 et le 16 juillet 2026 inclusivement (fenêtre d'un jour effectif), avec bulletin imprimé en deux exemplaires « non-pliés, non-agrafés, non-troués ».
`backend/data/bulletin_2026.template.html:324-326`

---

## 4. Le piège des codes

### 4.1. Quatre systèmes de codes incompatibles coexistent
Codes administratifs de bulletin (`BRS-2026-A17293`), sigles académiques (`420-3B4-SBDL`), codes de cours bourse (`INF-420-A7`), codes de programme (`240.A0` vs `420.B0-SBDL-...`). Aucun ne correspond à un autre. L'utilisateur doit deviner lesquels sont demandés à quelle étape.
`docs/lore.md` — section « Les systèmes de codes »

### 4.2. Le bulletin est un PDF raster non-copiable
Les codes sont visibles dans le bulletin PDF, mais c'est une image rastérisée par Puppeteer — impossible de sélectionner/copier le texte. L'utilisateur doit saisir manuellement chaque code.
`backend/src/services/bulletin.ts:88-135`

### 4.3. 7 leurres parmi les 10 codes du bulletin
Page 2 du bulletin affiche 10 codes. Seulement 3 sont les vrais. Les 7 autres incluent :
- Des codes marqués « interne » qui déclenchent un audit si saisis
- Des « leurres » dérivés des vrais codes (année -1, séquence -1, suffixe différent) pour ressembler à la bonne réponse
`backend/data/bulletin_2026.template.html:347-357`
`backend/src/services/bulletin.ts:61-71`

### 4.4. Le convertisseur traite un code à la fois
Pas de mode batch. Pour les 3 codes du formulaire, il faut faire 3 conversions distinctes, mémoriser chaque résultat avant qu'il disparaisse au bout de 8 secondes, et garder une trace mentale.
`frontend/src/pages/BourseConverterPage.tsx`

### 4.5. Aucun copier-coller, pas même au clavier
Implicitement (bulletin raster) et explicitement (politique #PV-2003-14 art. 8 mentionnée dans le bulletin) : la saisie manuelle est requise. Le bulletin précise que la saisie est « sensible à la casse, aux tirets, aux espaces, et à l'humeur du serveur ».
`backend/data/bulletin_2026.template.html:367`

---

## 5. Modals et confirmations

### 5.1. Trois modals de confirmation pour soumettre une demande
Pour une seule action (soumettre la demande de bourse) :
- **Modal 1** : Confirmation requise
- **Modal 2** : ATTENTION — Action irréversible
- **Modal 3** : Validation finale (avec le piège des 10 secondes)
`frontend/src/pages/BourseSubmitPage.tsx:259-367`

### 5.2. Le bouton « Annuler » des modals 1 et 2 te renvoie en arrière
Cliquer « Annuler » dans Modal 1 ou Modal 2 ne ferme pas la modal — ça te navigue à `/bourse-cours`, ce qui te ramène à l'étape précédente du flow.
`frontend/src/pages/BourseSubmitPage.tsx:282-287, 320-326`

### 5.3. Modal 3 : tous les boutons annulent
Dans la troisième et dernière modal, les deux boutons (Confirmer ET Annuler) appellent `handleCancel`. La soumission réelle n'arrive qu'à l'expiration du timer auto-submit après 10 secondes d'inactivité totale.
`frontend/src/pages/BourseSubmitPage.tsx:349-364`

### 5.4. Le succès est un flash vert de 500ms
Quand la soumission réussit, un overlay vert plein écran apparaît pendant 0,5 seconde, sans message. Puis tu te retrouves sur la page de succès. Aucune célébration, juste un flash agressif.
`frontend/src/pages/BourseSubmitPage.tsx:101`

---

## 6. La roue de l'attribution de vignette

### 6.1. Cliquer la roue directement = déconnexion
Si l'utilisateur tente d'interagir avec la roue rotative directement, une modal d'avertissement apparaît avec un seul bouton : « OK - DÉCONNEXION IMMÉDIATE ». Le seul moyen d'utiliser la roue est le bouton « TOURNER LA ROUE ».
`frontend/src/pages/VignetteAutoPage.tsx:69-72, 158-181`

### 6.2. Une seule tentative par année académique
Tenter une deuxième rotation déclenche aussi la même modal de déconnexion.
`frontend/src/pages/VignetteAutoPage.tsx:48-52`

### 6.3. La roue contient presque uniquement de mauvais résultats
12 outcomes possibles : Aucune, Sibérie, Antarctique, Lune, EXPIRÉE, Toit, Sous-Marin, Vélo, Covoit, Chantier, VIP refusé, → 2027. Tous sont mauvais ou absurdes. Aucune zone « normale ».
`backend/data/vignette-content.json`

---

## 7. Lecture, données, et présentation

### 7.1. Les messages d'administration sont triés du plus ancien au plus récent
La table des messages affiche les communications de 2003 → 2026, dans cet ordre. Convention universelle violée : l'utilisateur scrolle 23 ans pour atteindre le message reçu hier.
`frontend/src/pages/AccueilPage.tsx` + `backend/data/messages.json`

### 7.2. Le nom de l'institution fait 250+ caractères
Le nom de l'établissement contient 23 mots et apparaît partout (login, bulletin, en-tête). Sur le bulletin il est imprimé en `text-transform: uppercase`, en lettres séparées par des tirets, occupant 4 lignes en haut de chaque page.
`frontend/src/config/branding.ts`

### 7.3. La sélection de cours offre 3 dropdowns de 150+ entrées
Trois dropdowns natifs `<select>`, chacun listant la totalité des codes de cours dans l'ordre des suffixes (pas par discipline), sans filtre, sans recherche. Largeur fixée à **145px**, trop étroite pour afficher un code complet sans ellipsis.
`frontend/src/pages/BourseCoursPage.tsx` + `frontend/src/pages/BourseCoursPage.module.css`

### 7.4. Deux conseillers aux noms quasi-identiques, listés côte à côte
La liste des rendez-vous affiche Dr. Hannibal **Lecter** (conseiller en alimentation, plage 11h00) suivi 30 minutes plus tard de Dr. Hannibal **Lecteur** (conseiller en littérature, plage 11h30). Deux personnes réelles et différentes, mais l'orthographe ne diffère que d'une lettre et aucun marqueur visuel ne les distingue. L'étudiant qui voulait s'inscrire au club de lecture du mercredi a une bonne chance de finir chez Hannibal Lecter par accident.
`backend/data/rendez-vous-slots.json:38-49`

### 7.5. Le doublon « Cassier » d'école n'est pas fusionnable
Casier d'école / Cassier d'école — deux entrées distinctes pour le même dossier dans Mon Dossier, créées en 2019 par une coquille de saisie. La fusion requiert un formulaire AUTH-2009-P3 dont l'impression est bloquée par la panne du photocopieur B-214 (depuis 2021). Demande de fusion ouverte depuis avril 2019.
`backend/data/casiers.json`

### 7.6. Le bulletin contient des frais absurdes
La page 5 du bulletin liste des frais comme : « Frais bancaires (paiement par billets sales) : 12,00 $ », « Frais bancaires (paiement par billets neufs) : 14,00 $ », « Frais d'inscription au plan de paiement (le plan n'est plus offert depuis 2019) : 25,00 $ » + « Frais de désinscription du plan de paiement (obligatoire malgré l'inexistence du plan) : 25,00 $ ».
`backend/data/bulletin_2026.template.html:485-489`

### 7.7. Les coordonnées du Registraire envoient au mauvais bureau
La page 6 du bulletin liste les coordonnées du Service du registrariat — mais l'adresse présentielle est « bureau 14-B, mardis impairs uniquement, entre 10h12 et 10h47 ». Le vrai bureau du Registraire est B-214 (Pavillon B, lun-ven 8h30-16h00). Les coordonnées dans le bulletin pointent vers le mauvais endroit avec des heures absurdes.
`backend/data/bulletin_2026.template.html:537-545`

---

## 8. Pages et interactions parasites

### 8.1. Le bouton « ne pas cliquer » sur la page de login
En haut à droite de la page de login, un petit bouton discret affiche « ne pas cliquer ». Cliquer ferme la fenêtre courante et redirige vers un Rickroll YouTube. Branding du « Ne pas cliquer », directeur principal.
`frontend/src/pages/LoginPage.tsx:13, 39-42`

### 8.2. Le placeholder du Code B est trompeur
Le champ Code B affiche le placeholder `XXXX123456` — suggérant 4 lettres + 6 chiffres. Aucune indication réelle du format attendu, et le placeholder n'a aucun rapport avec la vraie structure du code (qui dépend de ce qui a été soumis dans le formulaire).
`frontend/src/pages/BourseSubmitPage.tsx:208`

### 8.3. La page Bulletin a une typo « de l'session »
La page Bulletin écrit « Votre bulletin officiel **de l'session** Hiver 2026 ». Conservée intentionnellement comme touche de finition bureaucratique imparfaite.
`frontend/src/pages/BulletinPage.tsx:14-17`

### 8.4. Une boîte aux lettres facturée sans clé
Le Casier postal documente que chaque étudiant a une boîte aux lettres institutionnelle (B-214-47) facturée 47,50 $/an, mais **aucune clé n'est remise à l'admission**. La procédure de demande de clé requiert une déclaration de perte au bureau 14-B (95,00 $ de réémission) — pour une clé qui n'a jamais existé.
`backend/data/casiers.json` (casier-postal)

### 8.5. Le login exige une chaîne littérale précise sans donner aucun indice
La page de login propose un unique champ texte « Nom d'utilisateur », sans mot de passe, sans 2FA. L'utilisateur croit pouvoir entrer n'importe quoi — mais en réalité le backend rejette tout sauf la chaîne exacte **« un nom d'utilisateur »** (avec l'espace, l'apostrophe et les minuscules). Aucun placeholder, aucun message d'aide, aucun hint dans le DOM : tout ce que l'utilisateur reçoit est « Échec de la connexion. Veuillez réessayer. » Il faut littéralement deviner la phrase exacte que le champ attend de soi.
`frontend/src/pages/LoginPage.tsx` + `backend/src/routes/auth.ts:6,15-17`

---

## 9. Erreurs et feedback

### 9.1. Les messages d'erreur dirigent vers des endroits inaccessibles
Le formulaire de consentement en attente échoue toujours avec un message qui dit « Veuillez vérifier auprès du bureau 14-B (mardis impairs entre 10h12 et 10h47) avant de soumettre à nouveau ». L'utilisateur n'a aucun moyen de vérifier quoi que ce soit dans l'application.
`frontend/src/pages/ConsentementsPage.tsx:94-97`

### 9.2. Le formulaire de consentement échoue, peu importe l'entrée
Indépendamment des valeurs saisies, le formulaire de complétion du consentement c016 (rétention post-mortem) échoue toujours avec la même erreur. Les champs incluent : nom de jeune fille de la grand-mère paternelle, couleur des nuages le jour de l'admission, nombre de boutons d'ascenseur B actionnés, nom du témoin (de préférence : Fantôme du Pavillon B).
`frontend/src/pages/ConsentementsPage.tsx:90-97`

### 9.3. Aucun feedback de progression
Pendant la procédure de bourse (15 minutes), il n'y a pas d'indicateur de progression visible. Pas de stepper, pas de barre de progression — juste une succession de pages sans contexte.

### 9.4. Les leurres se font passer pour des « Enregistrés »
Dans Options, chaque modification de leurre affiche brièvement « En cours... » puis « Enregistré ». L'utilisateur croit que ses préférences sont sauvegardées — elles ne le sont pas. Aucune persistance, aucune erreur visible.
`frontend/src/pages/OptionsPage.tsx:367-374`

---

## 10. Architecture et flux

### 10.1. La déconnexion est presque immédiate sur les erreurs paranormales
Sur la page Vignette, la modal de déconnexion ne propose qu'un bouton : « OK - DÉCONNEXION IMMÉDIATE ». Pas de « Annuler », pas de « Réessayer », pas d'option pour revenir en arrière. Cliquer = perdre la session.
`frontend/src/pages/VignetteAutoPage.tsx:172-178`

### 10.2. La structure du flow de bourse est en série stricte
État de compte → Formulaire → Convertisseur → Sélection de cours → Code Exchange → 2FA → Soumission. Chaque étape requiert la précédente. Une erreur à l'étape 5 force le redémarrage depuis l'étape 1 (avec un nouveau timer de 15 minutes).

### 10.3. Aucun moyen de quitter le flow proprement
Une fois la procédure démarrée, il n'y a pas de bouton « Sauvegarder et continuer plus tard ». La seule façon de sortir est : laisser expirer le timer, ou tomber sur une erreur qui réinitialise tout.

### 10.4. Le retour « En arrière » du navigateur ne fait pas ce qu'on pense
Naviguer en arrière depuis une étape du flow ne te ramène pas à l'étape précédente du flow — ça te ramène à l'historique de navigation du navigateur, qui peut être n'importe où. L'état du flow continue de tourner en parallèle.

### 10.5. La déconnexion est verrouillée par défaut
Le bouton « DÉCONNECTER » dans le header est **désactivé** par défaut. À côté, un bouton « DÉBLOQUER » doit être cliqué en premier pour le déverrouiller. Une fois cliqué :
- Le bouton DÉCONNECTER devient actif pendant **2 secondes seulement**
- Un compte à rebours visible affiche « BLOQUER (1.4s) », « BLOQUER (0.9s) »...
- Si l'utilisateur n'a pas cliqué DÉCONNECTER avant la fin du compte à rebours, le verrou se réactive automatiquement et il faut tout recommencer

Trois actions séquentielles dans une fenêtre étroite pour faire ce qui devrait être un clic.
`frontend/src/layout/Header.tsx:14, 50-79, 87-91`

---

## 11. Détails ambiants

### 11.1. Police 11px partout
Toute l'application est en `font-size: 11px`, Arial. Lisible mais fatigant sur la durée. Conforme à l'esthétique 2003.
`frontend/src/styles/colnet.css:47`

### 11.2. La version ne change jamais
Le footer du login affiche `v0.5`. Depuis 2003. Faux indicateur de version, vrai joke récurrent.
`frontend/src/config/branding.ts:13`

### 11.3. Aucune indication de quels items de la sidebar fonctionnent
Sur les 35 items de Mon Dossier, environ 15 ont une page réelle. Les 20 autres tombent silencieusement sur la StubPage générique (« Page non disponible »). Aucun indicateur visuel de cette différence dans la sidebar.
`frontend/src/App.tsx:81`

### 11.4. Le breadcrumb du info-strip est en monospace, en majuscules, espacé
La barre d'info-strip en haut de page utilise `font-family: 'Courier New'` avec `letter-spacing: 0.5px` pour les métadonnées de session. Aesthetic institutionnel agressif des années 2000.
`frontend/src/styles/colnet.css:130-137`
