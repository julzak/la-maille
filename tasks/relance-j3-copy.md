# Relance J3 - texte a valider

Email envoye 3 jours apres l'inscription aux users confirmes qui n'ont jamais recree de session.
Un seul message bilingue par variante (bloc EN d'abord, puis bloc FR), car la langue de
l'utilisateur n'est pas stockee et 65% de l'audience est anglophone. Un seul CTA par langue.

Mecanisme complet livre avec interrupteur ferme (`RELANCE_J3_ENABLED`) : tant que Julien n'a
pas valide ce texte, aucun email ne part. Voir la PR pour l'activation.

---

## Variante A - a deja sauvegarde un patron

**Objet (bilingue) :** Your pattern is still there / Votre patron est toujours la

**Corps (EN puis FR, separes par une ligne) :**

```
Hi,
You started a pattern on La Maille a few days ago. It's still saved, right where you left it.

[See your pattern] -> https://la-maille.com/mes-patrons

If you'd rather not get these, just reply to this email.

---

Bonjour,
Vous avez commence un patron sur La Maille il y a quelques jours. Il est toujours enregistre,
la ou vous l'avez laisse.

[Voir mon patron] -> https://la-maille.com/mes-patrons

Pour ne plus recevoir ces emails, repondez simplement a celui-ci.
```

---

## Variante B - n'a jamais sauvegarde de patron

**Objet (bilingue) :** Turn a photo into a pattern / Transformez une photo en patron

**Corps (EN puis FR, separes par une ligne) :**

```
Hi,
You created an account on La Maille but haven't tried it yet. Send a photo of a sweater you
like and get a pattern back.

[Try it now] -> https://la-maille.com/

If you'd rather not get these, just reply to this email.

---

Bonjour,
Vous avez cree un compte sur La Maille mais vous n'avez pas encore essaye. Envoyez la photo
d'un pull qui vous plait et recuperez un patron.

[Essayer maintenant] -> https://la-maille.com/fr

Pour ne plus recevoir ces emails, repondez simplement a celui-ci.
```

---

## Notes

- Pas de lien de desinscription automatise pour l'instant : repondre a l'email suffit, c'est
  dit explicitement dans chaque variante.
- Pas de promesse chiffree, pas de "nous sommes ravis".
- Gabarit HTML identique a `welcome-email` (memes couleurs, LA MAILLE / De la photo au patron).
- Route "mes patrons" verifiee dans `app/mes-patrons/page.tsx` : `https://la-maille.com/mes-patrons`.
