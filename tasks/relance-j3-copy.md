# Relance J3 - texte à valider

Email envoyé 3 jours après l'inscription aux users confirmés qui n'ont jamais recréé de session.
Un seul message bilingue par variante (bloc EN d'abord, puis bloc FR), car la langue de
l'utilisateur n'est pas stockée et 65% de l'audience est anglophone. Un seul CTA par langue.

Mécanisme complet livré avec interrupteur fermé (`RELANCE_J3_ENABLED`) : tant que Julien n'a
pas validé ce texte, aucun email ne part. Voir la PR pour l'activation.

---

## Variante A - a déjà sauvegardé un patron

**Objet (bilingue) :** Your pattern is still there / Votre patron est toujours là

**Corps (EN puis FR, séparés par une ligne) :**

```
Hi,
You started a pattern on La Maille a few days ago. It's still saved, right where you left it.

[See your pattern] -> https://la-maille.com/mes-patrons

If you'd rather not get these, just reply to this email.

---

Bonjour,
Vous avez commencé un patron sur La Maille il y a quelques jours. Il est toujours enregistré,
là où vous l'avez laissé.

[Voir mon patron] -> https://la-maille.com/mes-patrons

Pour ne plus recevoir ces emails, répondez simplement à celui-ci.
```

---

## Variante B - n'a jamais sauvegardé de patron

**Objet (bilingue) :** Turn a photo into a pattern / Transformez une photo en patron

**Corps (EN puis FR, séparés par une ligne) :**

```
Hi,
You created an account on La Maille but haven't tried it yet. Send a photo of a sweater you
like and get a pattern back.

[Try it now] -> https://la-maille.com/

If you'd rather not get these, just reply to this email.

---

Bonjour,
Vous avez créé un compte sur La Maille mais vous n'avez pas encore essayé. Envoyez la photo
d'un pull qui vous plaît et récupérez un patron.

[Essayer maintenant] -> https://la-maille.com/fr

Pour ne plus recevoir ces emails, répondez simplement à celui-ci.
```

---

## Notes

- Pas de lien de désinscription automatisé pour l'instant : répondre à l'email suffit, c'est
  dit explicitement dans chaque variante.
- Pas de promesse chiffrée, pas de "nous sommes ravis".
- Gabarit HTML identique à `welcome-email` (mêmes couleurs, LA MAILLE / De la photo au patron).
- Route "mes patrons" vérifiée dans `app/mes-patrons/page.tsx` : `https://la-maille.com/mes-patrons`.
