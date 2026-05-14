# Phase 6 — Test du flow complet

## Statut de l'implémentation

✅ **Backend** : Tous les endpoints créés et fonctionnels  
✅ **Frontend** : Toutes les pages créées et routées  
✅ **Types** : TypeScript compile sans erreurs  
⚠️ **EmailJS** : À configurer pour tester l'envoi réel d'emails

## Flow complet de la demande de bourse (avec Phase 6)

### Étape 1 : Connexion et démarrage
1. Se connecter sur `/login` avec "un nom d'utilisateur"
2. Aller sur **État de compte** (`/etat-de-compte`)
3. Cliquer sur **"Demander un remboursement"** → démarre le timer de 3 minutes

### Étape 2 : Remplir le formulaire
1. Basculer le profil en **mode Observation** (`/options`)
2. Noter son **numéro étudiant** (visible uniquement en mode Observation)
3. Télécharger le **bulletin PDF** (`/bulletin`)
4. Noter les 3 **codes de bulletin** (du PDF)
5. Basculer le profil en **mode Soumission**
6. Retourner au **formulaire** (`/bourse-formulaire`)
7. Entrer numéro étudiant + 3 codes de bulletin → Soumettre

### Étape 3 : Convertir les codes
1. Aller sur **Convertisseur de codes** (`/bourse-convertisseur`)
2. Entrer chaque code de bulletin → obtenir le code de cours
3. Noter les 3 codes de cours (ils disparaissent après 8 secondes!)

### Étape 4 : Sélectionner les cours
1. Aller sur **Sélection de cours** (`/bourse-cours`)
2. Trouver chacun des 3 codes de cours dans la liste de 150+ entrées
3. Confirmer la sélection

### 🆕 Étape 5 : Vérification 2FA (NOUVELLE)
1. Aller sur **Vérification 2FA** (`/bourse-2fa`)
2. Entrer son email
3. Recevoir le code 2FA par email (6 chiffres)
4. Entrer le code 2FA → validation
5. Recevoir le **Code A** par email (alphanumérique, ~10 caractères)

### 🆕 Étape 6 : Échange Code A → Code B (NOUVELLE)
1. Chercher dans la sidebar : **"Valid. sélection confirm."** (`/bourse-code-exchange`)
   - (Nom volontairement obscur pour être difficile à trouver)
2. Entrer le **Code A** (reçu par email)
3. Obtenir le **Code B** (affiché à l'écran)
4. **Noter immédiatement le Code B** — il ne sera plus accessible après avoir quitté la page

### 🆕 Étape 7 : Soumission finale avec Code B (MODIFIÉE)
1. Aller sur **Soumission** (`/bourse-soumission`)
2. **Entrer le Code B** obtenu à l'étape précédente
3. Cliquer **Continuer vers la confirmation**
4. **Modal 1** : "Êtes-vous sûr ?" → Confirmer
5. **Modal 2** : "Action irréversible" → Confirmer
6. **Modal 3** : "Veuillez NE PAS confirmer" → **ATTENDRE 10 SECONDES SANS RIEN TOUCHER**
7. ✅ Succès! Le solde passe de 13 486 $ à 0 $

## Points de test spécifiques Phase 6

### Backend (avec EmailJS configuré)
- [ ] `/api/codes/init-2fa` envoie un vrai email avec code 6 chiffres
- [ ] `/api/codes/verify-2fa` valide le code et envoie le Code A par email
- [ ] `/api/codes/exchange-a-for-b` génère Code B après validation du Code A
- [ ] `/api/bourse/submit` refuse la soumission si Code B invalide ou manquant

### Frontend
- [ ] Page 2FA accessible depuis la sidebar
- [ ] Page 2FA affiche les 2 étapes (email → code)
- [ ] Message de succès 2FA explique ou trouver la page d'échange
- [ ] Page d'échange de codes accessible depuis la sidebar (nom obscur)
- [ ] Page d'échange affiche le Code B en gros et clair
- [ ] Page de soumission demande le Code B avant les modals
- [ ] Erreur si Code B invalide à la soumission finale

### UX "bad design" attendu
- [ ] Les emails prennent 1-30s pour arriver (le timer continue)
- [ ] Le nom de la page d'échange dans la sidebar est cryptique
- [ ] Le Code B disparaît si on quitte la page (on doit le noter)
- [ ] Pas de lien direct entre les pages — on doit naviguer dans la sidebar
- [ ] Chaque étape fait perdre du temps précieux pendant que le timer roule

## Configuration EmailJS (pour test complet)

### 1. Créer un compte
https://www.emailjs.com/ (gratuit, 200 emails/mois)

### 2. Créer les templates

**Template 1 : `template_2fa`**
- Sujet : Vérification de sécurité - Code requis
- Variable : `{{code}}`
- Voir contenu HTML dans `docs/emailjs-setup.md`

**Template 2 : `template_code_a`**
- Sujet : Code de confirmation de sélection de confirmation de cours
- Variable : `{{codeA}}`
- Voir contenu HTML dans `docs/emailjs-setup.md`

### 3. Mettre à jour `.env`
Les IDs de service et clés sont déjà dans `backend/.env`.  
Vérifier que `EMAILJS_TEMPLATE_2FA` et `EMAILJS_TEMPLATE_CODE_A` correspondent aux IDs réels.

## Commandes de test

### Démarrer le projet complet
```powershell
.\start.ps1
```

### Backend uniquement
```powershell
cd backend
npm run dev
```

### Frontend uniquement
```powershell
cd frontend
npm run dev
```

### Tester les endpoints backend
```powershell
cd backend
.\test-api.ps1
```

Ou utiliser REST Client dans VS Code avec `backend/test-requests.http`.

## Erreurs attendues (avant config EmailJS)

**Backend** : `EMAIL_SEND_FAILED` sur `/api/codes/init-2fa` et `/api/codes/verify-2fa`  
**Raison** : EmailJS n'est pas configuré ou les templates n'existent pas  
**Solution** : Suivre le guide dans `docs/emailjs-setup.md`

**Frontend** : Erreur lors de la vérification 2FA  
**Raison** : Le backend n'a pas pu envoyer l'email  
**Solution** : Configurer EmailJS d'abord

## Ordre de test recommandé

1. **Test backend seul** (sans EmailJS) : vérifier que les endpoints répondent
2. **Configurer EmailJS** : créer les templates
3. **Test backend avec EmailJS** : vérifier l'envoi réel d'emails
4. **Test frontend complet** : jouer le flow de A à Z
5. **Test timer** : vérifier que le timer expire bien et bloque la soumission

## Note sur le timer

Le timer de 3 minutes continue de rouler pendant :
- L'envoi et la réception des emails (1-30s chacun)
- La navigation entre les pages
- La lecture des instructions
- Les 10 secondes d'attente du modal final

C'est **volontairement stressant** — c'est le concept du jeu!
