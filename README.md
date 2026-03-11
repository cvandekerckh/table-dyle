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
| `/menu` | Menu — image PNG générée depuis `carte/menu.html` |
| `/reservation` | Réservation — widget Octotable |
| `/contact` | Contact — adresse, plan, téléphone |

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

## Commandes

| Commande | Action |
|---|---|
| `npm run dev` | Serveur de développement — `localhost:4321` |
| `npm run build` | Build de production vers `./dist/` |
| `npm run preview` | Prévisualisation du build en local |
| `npm run generate-menu` | Régénère `public/menu.png` depuis `carte/menu.html` |

## Déploiement

Le site est déployé sur Vercel via le dépôt GitHub `cvandekerckh/table-dyle`.
Chaque push sur `main` déclenche un build automatique.

## À compléter

- [ ] Remplacer le widget Octotable par le widget JS payant une fois disponible dans le dashboard Octotable
- [x] Configurer le domaine `.be` sur Vercel → `tabledeladyle.be`
- [x] Mettre à jour `site` dans `astro.config.mjs` avec le domaine final
