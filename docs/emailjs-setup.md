# Configuration EmailJS pour BadAppReact

## Étape 1 : Créer un compte EmailJS

1. Aller sur https://www.emailjs.com/
2. Créer un compte gratuit (200 emails/mois)
3. Connecter un service email (Gmail recommandé)

## Étape 2 : Récupérer les clés

1. Dans le dashboard EmailJS, aller dans **Account**
2. Noter les valeurs suivantes :
   - **Service ID** (ex: `service_xxxxxx`)
   - **Public Key** (ex: `E04Wker...`)
   - **Private Key** (ex: `R1oILDf...`)
3. Les copier dans `backend/.env` (voir `.env.example`)

## Étape 3 : Créer les templates

### Template 1 : Code 2FA (ID: `template_2fa`)

**Nom** : BadApp - Code 2FA  
**Sujet** : Vérification de sécurité - Code requis  

**Contenu HTML** :
```html
<h2>Code de vérification 2FA</h2>
<p>Bonjour,</p>
<p>Pour des raisons de sécurité, veuillez entrer le code suivant dans le portail ColNet :</p>
<h1 style="background: #f0f0f0; padding: 20px; text-align: center; font-family: monospace; letter-spacing: 5px;">
  {{code}}
</h1>
<p><strong>Attention :</strong> Ce code est valide pour une seule utilisation et expire avec votre session.</p>
<p>Si vous n'avez pas demandé ce code, veuillez ignorer ce message.</p>
<hr>
<p style="color: #666; font-size: 12px;">
  Ceci est un message automatique du système ColNet. Ne pas répondre à cet email.
</p>
```

**Variables du template** :
- `{{code}}` : le code 2FA à 6 chiffres
- `{{to}}` : l'adresse email du destinataire (géré automatiquement)

---

### Template 2 : Code A (ID: `template_code_a`)

**Nom** : BadApp - Code de confirmation de sélection  
**Sujet** : Code de confirmation de sélection de confirmation de cours  

**Contenu HTML** :
```html
<h2>Code de confirmation de sélection de confirmation de cours</h2>
<p>Bonjour,</p>
<p>Votre vérification 2FA a été complétée avec succès.</p>
<p>Veuillez utiliser le code suivant pour récupérer votre code de confirmation de choix de cours :</p>
<div style="background: #e8f4f8; border: 2px solid #0066cc; padding: 20px; text-align: center; margin: 20px 0;">
  <p style="margin: 0; color: #666; font-size: 14px;">Code A</p>
  <h1 style="font-family: monospace; letter-spacing: 3px; margin: 10px 0; color: #0066cc;">
    {{codeA}}
  </h1>
</div>
<p><strong>Important :</strong> Ce code doit être échangé dans la section <em>Mon dossier > Documents > Confirmations > Codes > Validation > Sélection</em> du portail.</p>
<p>Le Code A vous permettra d'obtenir le Code B nécessaire à la soumission finale de votre demande.</p>
<hr>
<p style="color: #666; font-size: 12px;">
  Ceci est un message automatique du système ColNet. Ne pas répondre à cet email.
</p>
```

**Variables du template** :
- `{{codeA}}` : le code alphanumérique A (~10 caractères)
- `{{to}}` : l'adresse email du destinataire (géré automatiquement)

---

## Étape 4 : Configurer les variables d'environnement

Dans `backend/.env`, ajouter :

```env
EMAILJS_TEMPLATE_2FA=template_2fa
EMAILJS_TEMPLATE_CODE_A=template_code_a
```

(Remplacer par les IDs réels si différents)

## Notes importantes

- Les emails peuvent prendre **1 à 30 secondes** pour arriver (c'est on-brand car le timer continue)
- Le free tier EmailJS limite à **200 emails/mois** — largement suffisant pour un projet d'école
- Les emails peuvent atterrir dans les **spams** — demander aux testeurs de whitelister l'adresse d'envoi
- Le **Code B** n'est PAS envoyé par email — il est retourné directement par l'API après validation du Code A

## Test manuel

Pour tester l'envoi d'emails sans passer par toute l'app :

```bash
# Dans backend/
node -e "
import('./src/services/email.js').then(m => 
  m.sendEmail({
    templateId: 'template_2fa',
    to: 'votre.email@example.com',
    vars: { code: '123456' }
  }).then(() => console.log('✓ Email envoyé'))
    .catch(e => console.error('✗ Erreur:', e))
)
"
```
