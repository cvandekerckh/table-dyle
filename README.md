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
| `/menu` | Menu — PDF téléchargeable + visionneuse |
| `/reservation` | Réservation — lien Octotable |
| `/contact` | Contact — adresse, plan, téléphone |

## Setup local

```bash
npm install
npm run download-images   # télécharge les photos depuis Google Drive
npm run dev               # http://localhost:4321
```

## Images

Les images sont **exclues du dépôt git** et stockées sur Google Drive.
Le script `scripts/download-images.sh` les télécharge automatiquement lors du build.

- **Local :** `npm run download-images`
- **Vercel :** exécuté automatiquement avant le build (via `vercel.json`)

### Mettre à jour une photo (sans toucher au code)

1. Google Drive → clic droit sur la photo → **Gérer les versions** → **Importer une nouvelle version**
2. Ouvrir ce lien dans un navigateur pour redéployer le site :
   `https://api.vercel.com/v1/integrations/deploy/prj_5RhQK5vfF5b5Q4xGjX1d1Gl9d3Hk/ZDT1R9Slka`
3. Le site est mis à jour en ~2 min ✓

Pour ajouter une photo avec un nouveau fichier Drive, modifier `images.config.json`
(les instructions sont incluses dans le fichier).

## Commandes

| Commande | Action |
|---|---|
| `npm run download-images` | Télécharge les images depuis Google Drive |
| `npm run dev` | Serveur de développement — `localhost:4321` |
| `npm run build` | Build de production vers `./dist/` |
| `npm run preview` | Prévisualisation du build en local |

## Déploiement

Le site est déployé sur Vercel via le dépôt GitHub `cvandekerckh/table-dyle`.
Chaque push sur `main` déclenche un build automatique.

## À compléter

- [ ] Remplacer `RESTAURANT_ID` dans `src/pages/reservation.astro` par l'ID Octotable réel
- [ ] Remplacer `public/menu.pdf` par le vrai menu
- [x] Configurer le domaine `.be` sur Vercel → `tabledeladyle.be`
- [x] Mettre à jour `site` dans `astro.config.mjs` avec le domaine final
