# La Table de la Dyle

Site web statique pour **La Table de la Dyle**, brasserie belge à Wavre.

## Tech stack

- [Astro](https://astro.build) — static site generator
- HTML / CSS — no JS framework
- Hosted on [Vercel](https://vercel.com)

## Pages

| Route | Description |
|---|---|
| `/` | Accueil — hero, concept, terrasse, photos, horaires |
| `/menu` | Menu — PDF affiché avec PDF.js (`public/menu/menu.pdf`) |
| `/reservation` | Réservation — widget Octotable |
| `/contact` | Contact — adresse, plan, téléphone |
| `/gestion-dyle-2f7c` | Espace de gestion (non indexé, protégé par mot de passe) |

## Setup local

```bash
npm install
npm run dev   # http://localhost:4321
```

## Images

Les images sont dans `public/images/` et versionnées dans git.

### Mettre à jour une photo (sans terminal)

1. Va sur **github.com** → dépôt `table-dyle` → dossier `public/images/`
2. Clique sur **"Add file" → "Upload files"**
3. Glisse la nouvelle photo — **utilise exactement le même nom de fichier**
4. Clique **"Commit changes"** → le site se met à jour en ~2 min ✓

> ⚠️ **Taille maximale recommandée : 1 MB par image.**
> Au-delà, les performances du site se dégradent. Compresse tes photos sur
> [squoosh.app](https://squoosh.app) avant de les uploader si nécessaire.

Fichiers actuels : `hero.jpg` · `terrasse.jpg` · `interieur.jpg` · `puis_lumineux.jpg` · `exterieur.JPEG`

## Gestion du site (pour le gérant)

Le gérant met à jour le site lui-même, sans développeur ni compte GitHub :

**https://tabledeladyle.be/gestion-dyle-2f7c**

Trois choses s'y modifient : le **menu** (PDF), le **message de fermeture**
(bandeau en haut des pages) et les **horaires**. Le mot de passe est demandé à
chaque enregistrement.

À savoir :

- Après enregistrement, le site se met à jour tout seul en **une à deux minutes**.
  Inutile de recommencer si le changement n'est pas visible tout de suite.
- Pour vérifier qu'un nouveau menu est bien passé : la page `/menu` affiche
  « Mise à jour du … » sous le titre de la carte.
- **Le PDF ne doit pas dépasser 4 Mo.** Au-delà, la page le signale avant l'envoi
  et propose de le compresser sur [ilovepdf.com](https://www.ilovepdf.com/fr/compresser_pdf).
- Deux modifications ne peuvent pas s'enchaîner à moins de 45 secondes d'intervalle.

### Fonctionnement

La page envoie des formulaires HTML à `api/gestion.js`, une fonction serverless
qui écrit dans ce dépôt via l'API Git Data de GitHub. Chaque enregistrement crée
un commit, et Vercel redéploie. Le site reste donc entièrement statique.

Les fichiers écrits sont fixes, jamais dérivés de la requête :
`public/menu/menu.pdf`, `src/config/menu.json`, `src/config/closure.json`,
`src/config/hours.json`.

### Variables d'environnement (Vercel, Production)

| Variable | Rôle |
|---|---|
| `ADMIN_PASSWORD` | Mot de passe de l'espace de gestion |
| `GITHUB_TOKEN` | Jeton GitHub *fine-grained*, dépôt `table-dyle`, **Contents: Read and write**, sans expiration |
| `GITHUB_REPO` | Optionnel, défaut `cvandekerckh/table-dyle` |
| `GITHUB_BRANCH` | Optionnel, défaut `main` |
| `RESEND_API_KEY` | Optionnel — notification e-mail à chaque modification |
| `NOTIFY_EMAIL` | Optionnel — destinataire de la notification |

> Une variable ajoutée ne s'applique qu'aux **déploiements suivants** : après
> l'avoir créée ou modifiée, il faut redéployer.

### Horaires

`src/config/hours.json` est la source unique. `src/lib/hours.js` en dérive les
deux affichages du site : le tableau de sept lignes (accueil, réservation) et le
résumé condensé qui regroupe les jours identiques (pied de page, contact). Ne pas
réécrire d'horaires en dur dans les pages.

Un fichier mal formé lève une erreur à l'import et **casse le build** : c'est
voulu, Vercel conserve alors le déploiement précédent.

## Commandes

| Commande | Action |
|---|---|
| `npm run dev` | Serveur de développement — `localhost:4321` |
| `npm run build` | Build de production vers `./dist/` |
| `npm run preview` | Prévisualisation du build en local |

## Déploiement

Le site est déployé sur Vercel via le dépôt GitHub `cvandekerckh/table-dyle`.
Chaque push sur `main` déclenche un build automatique.

## À compléter

- [ ] Remplacer le widget Octotable par le widget JS payant une fois disponible dans le dashboard Octotable
- [x] Configurer le domaine `.be` sur Vercel → `tabledeladyle.be`
- [x] Mettre à jour `site` dans `astro.config.mjs` avec le domaine final
