/**
 * Charge un modèle avec timeout et gestion d'erreurs
 * @param modelHash Hash du modèle à charger
 * @param timeout Temps maximal d'attente en ms (défaut: 10000ms)
 * @returns Object avec data (succès) et error (message d'erreur si échec)
 */
export async function loadModel(
  modelHash: number,
  timeout: number = 10000
): Promise<{ error: string | null }> {
  if (!IsModelInCdimage(modelHash)) {
    return { error: "Le modèle n'existe pas dans les fichiers du jeu" };
  }

  try {
    RequestModel(modelHash);

    return new Promise((resolve) => {
      const timeoutTimer = setTimeout(() => {
        resolve({ error: 'Timeout: Impossible de charger le modèle' });
      }, timeout);

      const checkLoaded = setInterval(() => {
        if (HasModelLoaded(modelHash)) {
          clearInterval(checkLoaded);
          clearTimeout(timeoutTimer);
          resolve({ error: null });
        }
      }, 100);
    });
  } catch (err) {
    return { error: `Erreur interne: ${err}` };
  }
}
