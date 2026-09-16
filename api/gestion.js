// Espace de gestion : écrit les fichiers du site dans GitHub, ce qui
// déclenche un redéploiement Vercel. Le site reste entièrement statique.
//
// Aucune dépendance npm : fetch et node:crypto suffisent.

import { createHash, timingSafeEqual } from 'node:crypto';

// Les chemins ne viennent JAMAIS de la requête : l'action choisit une
// liste figée. La restriction est structurelle, pas un contrôle à oublier.
const CHEMINS = {
  menu: { pdf: 'public/menu/menu.pdf', horodatage: 'src/config/menu.json' },
  fermeture: { json: 'src/config/closure.json' },
  horaires: { json: 'src/config/hours.json' },
};

const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
const HEURE = /^([01]\d|2[0-3]):[0-5]\d$/;
const TAILLE_MAX = 4 * 1024 * 1024;
const DELAI_ENTRE_MAJ_MS = 45 * 1000;

const env = (nom, defaut) => process.env[nom] ?? defaut;

// ---------------------------------------------------------------- GitHub

async function github(chemin, options = {}) {
  const depot = env('GITHUB_REPO', 'cvandekerckh/table-dyle');
  const reponse = await fetch(`https://api.github.com/repos/${depot}${chemin}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${env('GITHUB_TOKEN')}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      // Obligatoire : fetch de Node n'envoie pas d'User-Agent et GitHub
      // répond alors 403, ce qui se diagnostique très mal.
      'User-Agent': 'table-dyle-gestion',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
  if (!reponse.ok) {
    const detail = await reponse.text();
    console.error('GitHub', reponse.status, chemin, detail.slice(0, 500));
    const erreur = new Error(`GitHub ${reponse.status}`);
    erreur.statut = reponse.status;
    throw erreur;
  }
  return reponse.json();
}

/**
 * Un seul commit, même pour plusieurs fichiers.
 * fichiers : [{ chemin, contenu }] ou [{ chemin, base64 }]
 * Renvoie null si rien n'a changé.
 */
async function committer(fichiers, message) {
  const branche = env('GITHUB_BRANCH', 'main');

  const ref = await github(`/git/ref/heads/${branche}`);
  const tete = ref.object.sha;

  // L'arbre se trouve dans le commit, pas dans la ref.
  const commit = await github(`/git/commits/${tete}`);
  const arbreBase = commit.tree.sha;

  const age = Date.now() - new Date(commit.committer.date).getTime();
  if (age < DELAI_ENTRE_MAJ_MS) {
    const erreur = new Error('trop tot');
    erreur.code = 'TROP_TOT';
    throw erreur;
  }

  const entrees = [];
  for (const fichier of fichiers) {
    if (fichier.base64 !== undefined) {
      const blob = await github('/git/blobs', {
        method: 'POST',
        body: JSON.stringify({ content: fichier.base64, encoding: 'base64' }),
      });
      entrees.push({ path: fichier.chemin, mode: '100644', type: 'blob', sha: blob.sha });
    } else {
      entrees.push({ path: fichier.chemin, mode: '100644', type: 'blob', content: fichier.contenu });
    }
  }

  const arbre = await github('/git/trees', {
    method: 'POST',
    body: JSON.stringify({ base_tree: arbreBase, tree: entrees }),
  });

  // Rien n'a bougé : pas de commit vide, pas de redéploiement inutile.
  if (arbre.sha === arbreBase) return null;

  const nouveau = await github('/git/commits', {
    method: 'POST',
    body: JSON.stringify({ message, tree: arbre.sha, parents: [tete] }),
  });

  // Pas de force : si la branche a bougé entre-temps, on préfère échouer
  // plutôt qu'écraser un commit poussé depuis ailleurs.
  await github(`/git/refs/heads/${branche}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: nouveau.sha }),
  });

  return nouveau.sha;
}

// ------------------------------------------------------------ utilitaires

function motDePasseValide(fourni) {
  const attendu = env('ADMIN_PASSWORD');
  if (!attendu || typeof fourni !== 'string' || fourni.length === 0) return false;
  const a = createHash('sha256').update(fourni).digest();
  const b = createHash('sha256').update(attendu).digest();
  return timingSafeEqual(a, b);
}

const attendre = (ms) => new Promise((r) => setTimeout(r, ms));

function horodatageBruxelles(date) {
  return new Intl.DateTimeFormat('fr-BE', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Europe/Brussels',
  }).format(date);
}

async function notifier(sujet, corps) {
  const cle = env('RESEND_API_KEY');
  const destinataire = env('NOTIFY_EMAIL');
  if (!cle || !destinataire) return;
  try {
    const reponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${cle}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env('NOTIFY_FROM', 'onboarding@resend.dev'),
        to: [destinataire],
        subject: sujet,
        text: corps,
      }),
    });
    if (!reponse.ok) console.error('Resend', reponse.status, (await reponse.text()).slice(0, 300));
  } catch (erreur) {
    // Une notification ratée ne doit jamais faire échouer une mise à jour.
    console.error('Resend', erreur);
  }
}

// --------------------------------------------------------------- réponses

const CSS = `
  body{font-family:system-ui,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;
       background:#F5F5F5;color:#1A1A1A;margin:0;padding:2rem 1rem;line-height:1.6}
  main{max-width:34rem;margin:0 auto;background:#fff;padding:2rem;border:1px solid #E8E8E8}
  h1{font-size:1.4rem;margin:0 0 1rem}
  .ok{border-left:4px solid #1A1A1A;padding-left:1rem}
  .ko{border-left:4px solid #B00020;padding-left:1rem}
  a{color:#1A1A1A}
  .liens{margin-top:1.5rem;display:flex;gap:1rem;flex-wrap:wrap}
  .liens a{display:inline-block;padding:.7rem 1.2rem;border:1px solid #1A1A1A;text-decoration:none}
`;

function page({ titre, corps, statut = 200, classe = 'ok' }) {
  const retour = env('ADMIN_PATH', '/gestion-dyle-2f7c');
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>${titre}</title><style>${CSS}</style></head>
<body><main class="${classe}"><h1>${titre}</h1>${corps}
<div class="liens"><a href="${retour}">Retour à la gestion</a><a href="/menu">Voir le menu</a></div>
</main></body></html>`;
  return new Response(html, {
    status: statut,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex' },
  });
}

const erreurPage = (titre, corps, statut = 400) =>
  page({ titre, corps: `<p>${corps}</p>`, statut, classe: 'ko' });

// ----------------------------------------------------------------- action

export async function POST(request) {
  // Origin présent mais étranger : refus. On ne refuse pas l'absence :
  // Safari l'omet parfois sur un POST de formulaire.
  const origine = request.headers.get('origin');
  if (origine) {
    try {
      if (new URL(origine).host !== new URL(request.url).host) {
        return erreurPage('Requête refusée', 'Origine non autorisée.', 403);
      }
    } catch {
      return erreurPage('Requête refusée', 'Origine invalide.', 403);
    }
  }

  if (!env('ADMIN_PASSWORD') || !env('GITHUB_TOKEN')) {
    console.error('Variables d’environnement manquantes : ADMIN_PASSWORD et/ou GITHUB_TOKEN');
    return erreurPage(
      'Configuration incomplète',
      "L'espace de gestion n'est pas encore configuré. Contactez l'administrateur du site.",
      503,
    );
  }

  let formulaire;
  try {
    formulaire = await request.formData();
  } catch {
    return erreurPage('Envoi illisible', 'Le formulaire n’a pas pu être lu. Réessayez.');
  }

  const motDePasse = formulaire.get('mdp');
  if (typeof motDePasse !== 'string' || motDePasse.length === 0) {
    return erreurPage('Mot de passe manquant', 'Indiquez le mot de passe.', 401);
  }
  if (!motDePasseValide(motDePasse)) {
    await attendre(1000);
    return erreurPage('Mot de passe incorrect', 'Vérifiez le mot de passe et réessayez.', 401);
  }

  const action = formulaire.get('action');
  if (!Object.prototype.hasOwnProperty.call(CHEMINS, action)) {
    return erreurPage('Action inconnue', 'Cette action n’existe pas.');
  }

  let fichiers;
  let message;
  let confirmation;

  try {
    if (action === 'menu') {
      const fichier = formulaire.get('fichier');
      if (!fichier || typeof fichier.arrayBuffer !== 'function' || fichier.size === 0) {
        return erreurPage('Aucun fichier', 'Choisissez un fichier PDF.');
      }
      if (fichier.size > TAILLE_MAX) {
        return erreurPage(
          'Fichier trop lourd',
          `Votre PDF fait ${(fichier.size / 1048576).toFixed(1)} Mo, le maximum est de 4 Mo. ` +
            'Compressez-le d’abord sur <a href="https://www.ilovepdf.com/fr/compresser_pdf" ' +
            'target="_blank" rel="noopener">ilovepdf.com</a>, puis réessayez.',
        );
      }
      const octets = Buffer.from(await fichier.arrayBuffer());
      if (octets.subarray(0, 4).toString('latin1') !== '%PDF') {
        return erreurPage(
          'Ce n’est pas un PDF',
          'Le fichier envoyé n’est pas un PDF valide. Vérifiez le document et réessayez.',
        );
      }
      const maintenant = new Date();
      fichiers = [
        { chemin: CHEMINS.menu.pdf, base64: octets.toString('base64') },
        {
          chemin: CHEMINS.menu.horodatage,
          contenu: JSON.stringify({ updatedAt: maintenant.toISOString() }, null, 2) + '\n',
        },
      ];
      message = 'Met à jour le menu (espace de gestion)';
      confirmation =
        `<p><strong>Menu envoyé.</strong></p><p>Le site se met à jour tout seul. ` +
        `Patientez une à deux minutes, puis ouvrez la page Menu : vous devez y lire ` +
        `« Menu mis à jour le ${horodatageBruxelles(maintenant)} ».</p>`;
    }

    if (action === 'fermeture') {
      const actif = formulaire.has('actif');
      const texte = String(formulaire.get('message') ?? '').replace(/[\r\n]+/g, ' ').trim();
      if (actif && texte.length === 0) {
        return erreurPage('Message manquant', 'Indiquez le texte à afficher, ou décochez la case.');
      }
      if (texte.length > 300) {
        return erreurPage('Message trop long', 'Le message ne doit pas dépasser 300 caractères.');
      }
      fichiers = [
        {
          chemin: CHEMINS.fermeture.json,
          contenu: JSON.stringify({ active: actif, message: texte }, null, 2) + '\n',
        },
      ];
      message = 'Met à jour le bandeau de fermeture (espace de gestion)';
      confirmation = actif
        ? `<p><strong>Bandeau activé.</strong></p><p>Texte affiché : « ${texte} »</p>` +
          `<p>Il apparaîtra sur le site dans une à deux minutes.</p>`
        : `<p><strong>Bandeau désactivé.</strong></p><p>Il disparaîtra du site dans une à deux minutes.</p>`;
    }

    if (action === 'horaires') {
      const jours = [];
      for (const jour of JOURS) {
        if (formulaire.has(`${jour}_ferme`)) {
          jours.push({ jour, services: [] });
          continue;
        }
        const ouverture = String(formulaire.get(`${jour}_ouverture`) ?? '');
        const fermeture = String(formulaire.get(`${jour}_fermeture`) ?? '');
        if (!HEURE.test(ouverture) || !HEURE.test(fermeture)) {
          return erreurPage(
            'Horaire invalide',
            `Les heures du ${jour} sont incomplètes. Renseignez l’ouverture et la fermeture, ` +
              'ou cochez « fermé ».',
          );
        }
        if (fermeture <= ouverture) {
          return erreurPage(
            'Horaire incohérent',
            `Le ${jour}, l’heure de fermeture doit être après l’heure d’ouverture.`,
          );
        }
        jours.push({ jour, services: [[ouverture, fermeture]] });
      }
      fichiers = [
        {
          chemin: CHEMINS.horaires.json,
          contenu: JSON.stringify({ days: jours }, null, 2) + '\n',
        },
      ];
      message = 'Met à jour les horaires (espace de gestion)';
      confirmation =
        `<p><strong>Horaires enregistrés.</strong></p>` +
        `<p>Ils seront visibles sur le site dans une à deux minutes, ` +
        `sur l’accueil, la page réservation, la page contact et le pied de page.</p>`;
    }

    let sha;
    try {
      sha = await committer(fichiers, message);
    } catch (erreur) {
      if (erreur.statut === 422) sha = await committer(fichiers, message); // course : une reprise
      else throw erreur;
    }

    if (sha === null) {
      return page({
        titre: 'Aucun changement',
        corps: '<p>Les valeurs envoyées étaient déjà celles du site. Rien n’a été modifié.</p>',
      });
    }

    await notifier(
      `La Table de la Dyle : ${action} mis à jour`,
      `Modification faite depuis l'espace de gestion.\nAction : ${action}\nCommit : ${sha}\n`,
    );

    return page({ titre: 'C’est enregistré', corps: confirmation });
  } catch (erreur) {
    if (erreur.code === 'TROP_TOT') {
      return erreurPage(
        'Mise à jour déjà en cours',
        'Une modification vient d’être envoyée. Patientez une minute avant la suivante.',
        429,
      );
    }
    if (erreur.statut === 401 || erreur.statut === 404) {
      return erreurPage(
        'Configuration serveur invalide',
        'Le site ne parvient pas à enregistrer la modification. Contactez l’administrateur.',
        500,
      );
    }
    console.error('gestion', erreur);
    return erreurPage(
      'Échec de l’enregistrement',
      'La modification n’a pas pu être enregistrée. Réessayez dans une minute.',
      500,
    );
  }
}
