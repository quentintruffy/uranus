// src/plugins/Redis/server.ts
import { AbstractPlugin } from '../types/AbstractPlugin';
import { RedisManager, RedisConfig } from '../../utils/redis';

export class RedisServer extends AbstractPlugin {
  private redisManager: RedisManager | null = null;

  protected async onLoad(): Promise<void> {
    // Charger la configuration depuis le fichier config.json si disponible
    let config: RedisConfig | undefined = undefined;

    try {
      const configFile = LoadResourceFile(
        GetCurrentResourceName(),
        'config.json'
      );
      if (configFile && configFile.trim() !== '') {
        const parsedConfig = JSON.parse(configFile);
        if (parsedConfig.redis) {
          config = parsedConfig.redis;
          this.log('Configuration Redis chargée depuis config.json');
        }
      }
    } catch (error) {
      this.error('Erreur lors du chargement de la configuration Redis:', error);
    }

    // Initialiser le gestionnaire Redis
    this.redisManager = RedisManager.getInstance(config);

    // Attendre que la connexion soit établie
    let attempts = 0;
    const maxAttempts = 5;

    while (!this.redisManager.isConnected && attempts < maxAttempts) {
      this.log(
        `Tentative de connexion Redis ${attempts + 1}/${maxAttempts}...`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }

    if (this.redisManager.isConnected) {
      this.log('Connexion Redis établie avec succès');
    } else {
      this.warn(
        "Impossible d'établir une connexion Redis stable, le plugin fonctionnera en mode dégradé"
      );
    }

    // Exposer le gestionnaire Redis via l'API du plugin
    this.api = {
      getRedisManager: () => this.redisManager,

      // Méthodes pratiques exposées directement
      get: async (key: string) => await this.redisManager?.get(key),
      set: async (key: string, value: string, expireSeconds?: number) =>
        await this.redisManager?.set(key, value, expireSeconds),
      getObject: async <T>(key: string) =>
        await this.redisManager?.getObject<T>(key),
      setObject: async <T>(key: string, value: T, expireSeconds?: number) =>
        await this.redisManager?.setObject(key, value, expireSeconds),
      delete: async (key: string) => await this.redisManager?.del(key),
      publish: async (channel: string, message: string) =>
        await this.redisManager?.publish(channel, message),
      subscribe: async (channel: string, callback: (message: string) => void) =>
        await this.redisManager?.subscribe(channel, callback),
    };
  }

  protected async onEnable(): Promise<void> {
    // Vérifier si Redis est connecté avant d'activer le plugin
    if (this.redisManager && this.redisManager.isConnected) {
      // Stocker les informations du serveur dans Redis
      const serverInfo = {
        name: GetConvar('sv_hostname', 'Unknown Server'),
        maxPlayers: GetConvarInt('sv_maxclients', 32),
        startTime: Date.now(),
        resourceName: GetCurrentResourceName(),
      };

      await this.redisManager.setObject('server:info', serverInfo);
      this.log('Informations du serveur enregistrées dans Redis');

      // Mettre en place une tâche périodique pour maintenir les données actualisées
      setInterval(async () => {
        if (this.redisManager && this.redisManager.isConnected) {
          const playerCount = GetNumPlayerIndices();
          await this.redisManager.set(
            'server:playerCount',
            playerCount.toString(),
            300
          );
        }
      }, 60000); // Toutes les minutes
    } else {
      this.warn(
        "Redis n'est pas connecté, certaines fonctionnalités ne seront pas disponibles"
      );
    }
  }

  protected async onDisable(): Promise<void> {
    // Nettoyer les données du serveur dans Redis lors de la désactivation
    if (this.redisManager && this.redisManager.isConnected) {
      await this.redisManager.del('server:info');
      this.log('Informations du serveur supprimées de Redis');
    }
  }

  protected async onUnload(): Promise<void> {
    // Fermer la connexion Redis lors du déchargement du plugin
    if (this.redisManager) {
      await this.redisManager.close();
      this.log('Connexion Redis fermée');
    }
  }
}
