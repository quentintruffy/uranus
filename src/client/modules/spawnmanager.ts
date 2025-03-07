import { shutdownLoadingScreen } from '../utils/loadingscreen';
import { loadModel } from '../utils/loadmodel';

on('cp:client:onjoin', () => {
  initializeSpawnPed();
});

const spawnPos = { x: -269.4, y: -955.3, z: 31.2, heading: 205.0 };

/**
 * Initialise le spawn manager
 */
export const initializeSpawnPed = async () => {
  try {
    const modelName = 'mp_m_freemode_01';
    const modelHash = GetHashKey(modelName);

    //Attendre que le model soit prêt
    const { error } = await loadModel(modelHash);
    if (error) return error;

    // Cree le ped avec le model chargé
    const playerId = PlayerId();
    SetPlayerModel(playerId, modelHash);

    // Attendre un tick pour que le model soit chargé
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Créer le ped
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
    SetEntityHeading(ped, GetEntityHeading(playerId));

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

    // Définir les valeurs par défaut du ped
    SetPedDefaultComponentVariation(ped);
    SetModelAsNoLongerNeeded(modelHash);
  } catch (error) {
    console.error('Error initializing spawn manager:', error);
  }
};
