// Source unique des horaires d'ouverture.
//
// Le site les affiche sous deux formes : un tableau de 7 lignes (accueil,
// réservation) et un résumé condensé qui regroupe les jours identiques
// (pied de page, contact). Les deux sont dérivées d'ici, donc elles ne
// peuvent pas diverger.

import hoursConfig from '../config/hours.json';

const DAYS = [
  { jour: 'lundi',    long: 'Lundi',    court: 'Lun' },
  { jour: 'mardi',    long: 'Mardi',    court: 'Mar' },
  { jour: 'mercredi', long: 'Mercredi', court: 'Mer' },
  { jour: 'jeudi',    long: 'Jeudi',    court: 'Jeu' },
  { jour: 'vendredi', long: 'Vendredi', court: 'Ven' },
  { jour: 'samedi',   long: 'Samedi',   court: 'Sam' },
  { jour: 'dimanche', long: 'Dimanche', court: 'Dim' },
];

const TIRET = '–'; // tiret demi-cadratin, celui déjà utilisé dans les pages
const FERME = 'Fermé';

const entries = hoursConfig.days;

// Un fichier mal formé doit casser le build : Vercel garde alors le
// déploiement précédent plutôt que de publier des horaires corrompus.
if (!Array.isArray(entries) || entries.length !== DAYS.length) {
  throw new Error('hours.json : il faut exactement 7 jours.');
}
DAYS.forEach((d, i) => {
  if (entries[i]?.jour !== d.jour) {
    throw new Error(`hours.json : jour ${i + 1} attendu "${d.jour}", reçu "${entries[i]?.jour}".`);
  }
});

// "18:00" -> "18h00"
function heureLongue(t) {
  const [h, m] = t.split(':');
  return `${Number(h)}h${m}`;
}

// "18:00" -> "18h" ; "18:30" -> "18h30"
function heureCourte(t) {
  const [h, m] = t.split(':');
  return m === '00' ? `${Number(h)}h` : `${Number(h)}h${m}`;
}

function formatServices(services, heure, separateur) {
  if (!services || services.length === 0) return FERME;
  return services.map(([a, b]) => `${heure(a)}${separateur}${heure(b)}`).join(' · ');
}

/** 7 lignes pour les tableaux : { jour, valeur, ferme }. */
export function longRows() {
  return DAYS.map((d, i) => {
    const services = entries[i].services;
    return {
      jour: d.long,
      valeur: formatServices(services, heureLongue, ` ${TIRET} `),
      ferme: !services || services.length === 0,
    };
  });
}

/** Résumé condensé : ['Lundi : Fermé', 'Mardi : 18h–22h', 'Mer – Dim : 11h–22h']. */
export function summaryLines() {
  const groupes = [];
  DAYS.forEach((d, i) => {
    const valeur = formatServices(entries[i].services, heureCourte, TIRET);
    const dernier = groupes[groupes.length - 1];
    if (dernier && dernier.valeur === valeur) dernier.fin = i;
    else groupes.push({ debut: i, fin: i, valeur });
  });

  if (groupes.length === 1) return [`Tous les jours : ${groupes[0].valeur}`];

  return groupes.map((g) => {
    const libelle = g.debut === g.fin
      ? DAYS[g.debut].long
      : `${DAYS[g.debut].court} ${TIRET} ${DAYS[g.fin].court}`;
    return `${libelle} : ${g.valeur}`;
  });
}

/** Données brutes, pour pré-remplir le formulaire de gestion. */
export function rawDays() {
  return DAYS.map((d, i) => ({
    jour: d.jour,
    libelle: d.long,
    ouverture: entries[i].services[0]?.[0] ?? '',
    fermeture: entries[i].services[0]?.[1] ?? '',
    ferme: entries[i].services.length === 0,
  }));
}
