import { shutdownLoadingScreen } from './loadingscreen';
import { loadModel } from './models';

const spawnPos = { x: -269.4, y: -955.3, z: 31.2, heading: 205.0 };

export const generateBaseModel = (modelName: string): number | null => {
  try {
    return GetHashKey(modelName);
  } catch (error) {
    return null;
  }
};

export const initializePed = async () => {
  try {
    // Forcer le modèle de base
    const modelName = 'mp_m_freemode_01';
    const modelHash = generateBaseModel(modelName);
    if (!modelHash) {
      throw new Error(`Impossible de trouver le modèle ${modelName}`);
    }

    // Attendre que le modèle soit chargé
    const { error } = await loadModel(modelHash);
    if (error) throw new Error(error);

    // Créer le personnage avec le modèle
    const playerId = PlayerId();
    SetPlayerModel(playerId, modelHash);

    // Attendre un tick pour que le modèle soit chargé
    await new Promise((resolve) => setTimeout(resolve, 0));

    const ped = PlayerPedId();

    // Fermer l'écran de chargement
    shutdownLoadingScreen();
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Téléporter et configurer le ped
    SetEntityCoords(
      ped,
      spawnPos.x,
      spawnPos.y,
      spawnPos.z,
      false,
      false,
      false,
      false
    );
    SetEntityHeading(ped, spawnPos.heading);

    // S'assurer que le ped est vivant et visible
    SetEntityVisible(ped, true, false);
    NetworkResurrectLocalPlayer(
      spawnPos.x,
      spawnPos.y,
      spawnPos.z,
      spawnPos.heading,
      playerId,
      true
    );
    ClearPedTasksImmediately(PlayerPedId());

    // Rendre le contrôle au joueur
    SetGameplayCamRelativeHeading(0);
    FreezeEntityPosition(ped, false);
    SetPlayerControl(playerId, true, 0);

    // Transition visuelle
    DoScreenFadeIn(500);

    SetPedDefaultComponentVariation(ped);
    SetModelAsNoLongerNeeded(modelHash);
  } catch (error) {
    console.error('Error initializing spawn manager:', error);
  }
};
