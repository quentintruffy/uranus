import { createBlip } from '../../utils/blip';
import { generateBaseModel } from '../../utils/spawnmanager';
import { AbstractJob } from '../types/AbstractJob';
import { metroStations, trainConfig } from './shared';

export class MetrodriverClient extends AbstractJob {
  public speed = 0.0;
  public isControlling = true;
  public train: number | null = null;

  public targetSpeed = 0.0;
  public speedLevel = 0; // Niveau de vitesse actuel (0-10)
  public readonly MAX_SPEED_LEVEL = 10; // Nombre total de paliers
  private lastFrameTime = 0;
  public activeBlips: number[] = [];
  public hiddenBlip: number = 0;

  protected onTick(): void {
    this.handleTrainInertia();
  }
  protected onInit(): void {
    this.registerCommand();
    this.registerControl();

    // Show Blips
    this.createMetroStationMarkersAndBlips();
  }

  protected createMetroStationMarkersAndBlips(): void {
    metroStations.map((station) => {
      createBlip(
        station.position.x,
        station.position.y,
        station.position.z,
        815,
        station.color,
        'Station de métro: ' + station.name
      );
      // const blip = AddBlipForCoord(
      //   station.position.x,
      //   station.position.y,
      //   station.position.z
      // );
      // SetBlipSprite(blip, 815);
      // SetBlipColour(blip, station.color);
      // SetBlipScale(blip, 0.6);
      // SetBlipAsShortRange(blip, true);
      // // Regroupe les blips sous une seule ligne dans la carte
      // SetBlipCategory(blip, -1);
      // BeginTextCommandSetBlipName('STRING');
      // AddTextComponentString('Station de metro: ' + station.name);
      // EndTextCommandSetBlipName(blip);
      // this.activeBlips.push(blip);
    });
    // Créer la catégorie sur la carte
    // const categoryId = AddBlipForCoord(
    //   metroStations[0].position.x,
    //   metroStations[0].position.y,
    //   metroStations[0].position.z
    // );
    // SetBlipAsShortRange(categoryId, true);
    // // Initialiser la catégorie dans le menu de la carte
    // BeginTextCommandSetBlipName('STRING');
    // AddTextComponentString('Stations de Métro');
    // EndTextCommandSetBlipName(categoryId);
    // // Parcourir toutes les stations de métro toute sauf la première
    // metroStations.forEach((station) => {
    //   // Créer un blip sur la carte pour chaque station
    //   const blip = AddBlipForCoord(
    //     station.position.x,
    //     station.position.y,
    //     station.position.z
    //   );
    //   SetBlipSprite(blip, 815); // Sprite pour la station de métro (513 = icône de train)
    //   SetBlipDisplay(blip, 4);
    //   SetBlipScale(blip, 0.7);
    //   SetBlipColour(blip, station.color);
    //   SetBlipAsShortRange(blip, true);
    //   // BeginTextCommandSetBlipName('STRING');
    //   // AddTextComponentString(`Station de métro: ${station.name}`);
    //   // EndTextCommandSetBlipName(blip);
    //   SetBlipCategory(blip, categoryId);
    //   BeginTextCommandSetBlipName('STRING');
    //   AddTextComponentString(`${station.name}`);
    //   EndTextCommandSetBlipName(blip);
    //   // Créer le marker pour la station (visible en jeu)
    //   // Le marker sera créé dynamiquement dans updateStationMarkers pour l'efficacité
    // });
  }

  protected registerCommand(): void {
    RegisterCommand(
      'train',
      () => {
        this.spawnMetro();
      },
      false
    );
  }

  protected spawnMetro(): void {
    try {
      let spawnIndex = 0;
      const spawnPoint =
        trainConfig.spawnPoints[spawnIndex % trainConfig.spawnPoints.length];

      // Forcer le modèle de base
      const modelName = 'metrotrain';
      const modelHash = generateBaseModel(modelName);
      if (!modelHash) {
        throw new Error(`Impossible de trouver le modèle ${modelName}`);
      }
      RequestModel(modelHash);
      RequestModel('s_m_m_lsmetro_01');

      // const hash = GetHashKey('metrotrain');
      // RequestModel(hash);

      // Créer le train de mission
      const train = CreateMissionTrain(
        trainConfig.variation,
        spawnPoint.position.x,
        spawnPoint.position.y,
        spawnPoint.position.z,
        spawnPoint.direction
      );

      // Configurer le train
      SetEntityAsMissionEntity(train, true, true);
      SetTrainSpeed(train, 0.0);
      SetTrainCruiseSpeed(train, 0.0);
      SetVehicleDoorShut(train, 0, true); // Fermer toutes les portes par défaut
      SetVehicleDoorsLocked(train, 6); // Verrouiller les portes après les avoir fermées

      // Activer les collisions pour ce train
      SetEntityCollision(train, true, true);

      // Ajouter à la liste des trains actifs
      MetrodriverClient.activeTrains.push(train);

      const player = PlayerPedId();

      TaskWarpPedIntoVehicle(player, train, -1);

      this.checkTrain(player, train);
      this.train = train;
    } catch (error) {
      console.error('Error spawning metro:', error);
    }
  }

  protected async checkTrain(player: number, train: number): Promise<void> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const playerVehicle = GetVehiclePedIsIn(player, false);

      if (playerVehicle === train) {
        console.log('[Système Train] Téléportation réussie.');
        await new Promise((resolve) => setTimeout(resolve, 500));
        this.activeControlTrain(train);
      } else {
        SetPedIntoVehicle(player, train, -1);
        await new Promise((resolve) => setTimeout(resolve, 500));
        const playerVehicle2 = GetVehiclePedIsIn(player, false);
        if (playerVehicle2 === train) {
          console.log('[Système Train] Téléportation alternative réussie.');
        } else {
          console.log(
            '[Système Train] ERREUR: Toutes les tentatives de téléportation ont échoué.'
          );
        }
      }
    } catch (error) {
      throw error;
    }
  }

  protected activeControlTrain(train: number): void {
    if (train === 0 || !DoesEntityExist(train)) {
      console.log(
        '[Système Train] Impossible de contrôler le train: véhicule invalide.'
      );
      return;
    }

    console.log('[Système Train] Début du contrôle du train.');

    // Démarrer la boucle de contrôle
    console.log('[Système Train] Début du contrôle du train.');
    console.log('[Système Train] Utilisez E pour ouvrir/fermer les portes.');
  }

  protected registerControl(): void {
    // Enregistrement de l'événement de la molette de souris avec les bonnes commandes FiveM
    // Utiliser les exportations natives de FiveM pour l'événement de molette
    RegisterCommand(
      '+speedUp',
      () => {
        this.handleSpeedChange(1);
      },
      false
    );

    RegisterCommand(
      '+speedDown',
      () => {
        this.handleSpeedChange(-1);
      },
      false
    );

    // Associer la molette aux commandes
    RegisterKeyMapping(
      '+speedUp',
      'Augmenter vitesse du train',
      'MOUSE_WHEEL',
      'IOM_WHEEL_UP'
    );
    RegisterKeyMapping(
      '+speedDown',
      'Diminuer vitesse du train',
      'MOUSE_WHEEL',
      'IOM_WHEEL_DOWN'
    );

    console.log('[Système Train] Contrôle à la molette enregistré');
  }

  protected handleSpeedChange(direction: number): void {
    // Cette fonction est appelée par les commandes de molette
    if (this.train === null || !DoesEntityExist(this.train)) return;
    if (!IsPedInVehicle(PlayerPedId(), this.train, false)) return;
    if (!this.isControlling) return;

    console.log(
      `[Système Train] Changement de vitesse: ${
        direction > 0 ? 'augmentation' : 'diminution'
      }`
    );

    if (direction > 0) {
      this.speedLevel = Math.min(this.speedLevel + 1, this.MAX_SPEED_LEVEL);
    } else {
      this.speedLevel = Math.max(this.speedLevel - 1, 0);
    }

    // Calculer la vitesse cible en fonction du niveau et l'appliquer immédiatement
    this.targetSpeed =
      (this.speedLevel / this.MAX_SPEED_LEVEL) * trainConfig.maxSpeed;

    console.log(
      `[Système Train] Niveau de vitesse: ${
        this.speedLevel
      }/10 - Vitesse cible: ${this.targetSpeed.toFixed(2)}`
    );
  }

  protected handleTrainInertia(): void {
    if (
      this.train === null ||
      !DoesEntityExist(this.train) ||
      !this.isControlling
    )
      return;

    const currentTime = GetGameTimer();
    if (this.lastFrameTime === 0) {
      this.lastFrameTime = currentTime;
      return;
    }

    const deltaTime = (currentTime - this.lastFrameTime) / 2000; // En secondes
    this.lastFrameTime = currentTime;

    // Vérification de la validité du deltaTime pour éviter les bugs
    if (deltaTime <= 0 || deltaTime > 1.0) {
      // Ignorer les valeurs aberrantes
      return;
    }

    // Calculer l'accélération ou décélération en fonction de l'écart entre vitesse actuelle et cible
    if (Math.abs(this.speed - this.targetSpeed) > 0.01) {
      const direction = this.speed < this.targetSpeed ? 1 : -1;

      // Inertie plus rapide et responsive
      // Utiliser une constante d'accélération plus élevée pour des retours plus immédiats
      const baseAcceleration = trainConfig.acceleration * 1.5;
      const accelerationFactor = direction * baseAcceleration * deltaTime;

      // Distance factor augmentée pour une réponse plus rapide
      const distanceFactor = Math.min(
        Math.abs(this.speed - this.targetSpeed) / 3,
        1
      );
      const acceleration = accelerationFactor * (0.7 + 0.3 * distanceFactor);

      // Mise à jour de la vitesse avec l'accélération calculée
      this.speed = Math.max(
        0,
        Math.min(trainConfig.maxSpeed, this.speed + acceleration)
      );

      // Appliquer directement la vitesse au train
      if (this.train && DoesEntityExist(this.train)) {
        SetTrainSpeed(this.train, this.speed);
        SetTrainCruiseSpeed(this.train, this.speed);
      }

      // Debug: Afficher l'application de la vitesse
      if (this.train) {
        const actualSpeed = GetEntitySpeed(this.train);
        console.log(
          `[Train Debug] Vitesse appliquée: ${this.speed.toFixed(
            2
          )}, Vitesse réelle: ${actualSpeed.toFixed(2)}, Vitesse level: ${
            this.speedLevel
          }`
        );
      }
    }
  }
}
