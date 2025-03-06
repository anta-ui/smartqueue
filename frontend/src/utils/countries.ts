// utils/countries.js ou utils/countries.ts
// Vous pouvez utiliser la bibliothèque i18n-iso-countries pour une solution complète
import countries from 'i18n-iso-countries';
// Importer les locales nécessaires
import fr from 'i18n-iso-countries/langs/fr.json';

// Initialiser les locales
countries.registerLocale(fr);

/**
 * Obtient le nom d'affichage d'un pays à partir de son code ISO
 * @param countryCode Code ISO du pays (ex: 'FR', 'US')
 * @param locale Locale pour l'affichage (par défaut: 'fr')
 * @returns Nom du pays
 */
export function getCountryDisplayName(countryCode, locale = 'fr') {
  if (!countryCode) return 'Non spécifié';
  
  try {
    const countryName = countries.getName(countryCode, locale);
    return countryName || countryCode;
  } catch (error) {
    console.error(`Erreur lors de la récupération du nom du pays pour le code ${countryCode}:`, error);
    return countryCode;
  }
}

/**
 * Retourne la liste complète des pays sous forme de paires {code: nom}
 * @param locale Locale pour l'affichage (par défaut: 'fr')
 * @returns Object avec les codes comme clés et les noms comme valeurs
 */
export function getCountriesList(locale = 'fr') {
  return countries.getNames(locale);
}

/**
 * Retourne la liste des pays sous forme de tableau d'objets {value, label}
 * Utile pour les composants de sélection
 * @param locale Locale pour l'affichage (par défaut: 'fr')
 * @returns Array d'objets {value: code, label: nom}
 */
export function getCountriesForSelect(locale = 'fr') {
  const countriesList = getCountriesList(locale);
  return Object.entries(countriesList).map(([code, name]) => ({
    value: code,
    label: name
  }));
}

export default {
  getCountryDisplayName,
  getCountriesList,
  getCountriesForSelect
};