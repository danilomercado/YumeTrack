const SEASONS = ["Invierno", "Primavera", "Verano", "Otoño"];

// Misma regla que el backend: cuatro temporadas de tres meses.
export const currentSeasonLabel = (date = new Date()) => {
  const season = SEASONS[Math.floor(date.getUTCMonth() / 3)];
  return `${season} ${date.getUTCFullYear()}`;
};
