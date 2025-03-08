// src/utils/redis.ts
import Redis from 'ioredis';

/**
 * Configuration Redis avec valeurs par défaut
 */
export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
}

/**
 * Gestionnaire Redis pour FiveM
 */
export class RedisManager {
  private static _instance: RedisManager;
  private _client: Redis | null = null;
  private _config: RedisConfig;
  private _isConnected: boolean = false;

  private constructor(config: RedisConfig) {
    this._config = {
      ...config,
      keyPrefix:
        config.keyPrefix || `fivem:${GetConvar('sv_hostname', 'default')}:`,
    };
    this._setupClient();
  }

  /**
   * Obtenir l'instance unique du gestionnaire Redis
   */
  public static getInstance(config?: RedisConfig): RedisManager {
    if (!RedisManager._instance) {
      const defaultConfig: RedisConfig = {
        host: GetConvar('redis_host', '127.0.0.1'),
        port: parseInt(GetConvar('redis_port', '6379')),
        password: GetConvar('redis_password', ''),
        db: parseInt(GetConvar('redis_db', '0')),
      };

      RedisManager._instance = new RedisManager(config || defaultConfig);
    }
    return RedisManager._instance;
  }

  /**
   * Configure le client Redis
   */
  private _setupClient(): void {
    try {
      this._client = new Redis(this._config);

      const self = this; // Utiliser une référence locale pour éviter des problèmes de 'this'

      this._client.on('connect', function () {
        console.log('[Redis] Connexion établie');
        self._isConnected = true;
      });

      this._client.on('error', function (err) {
        console.error(`[Redis] Erreur: ${err.message}`);
        self._isConnected = false;
      });

      this._client.on('reconnecting', function () {
        console.log('[Redis] Tentative de reconnexion...');
      });

      this._client.on('close', function () {
        console.log('[Redis] Connexion fermée');
        self._isConnected = false;
      });
    } catch (error) {
      console.error(
        '[Redis] Erreur lors de la configuration du client:',
        error
      );
      this._client = null;
    }
  }

  /**
   * Vérifie si le client Redis est connecté
   */
  public get isConnected(): boolean {
    return (
      this._isConnected &&
      this._client !== null &&
      this._client.status === 'ready'
    );
  }

  /**
   * Obtient une valeur de Redis
   */
  public async get(key: string): Promise<string | null> {
    if (!this._client) return null;
    try {
      return await this._client.get(key);
    } catch (error) {
      console.error(
        `[Redis] Erreur lors de la récupération de la clé ${key}:`,
        error
      );
      return null;
    }
  }

  /**
   * Définit une valeur dans Redis
   */
  public async set(
    key: string,
    value: string,
    expireSeconds?: number
  ): Promise<boolean> {
    if (!this._client) return false;
    try {
      if (expireSeconds) {
        await this._client.set(key, value, 'EX', expireSeconds);
      } else {
        await this._client.set(key, value);
      }
      return true;
    } catch (error) {
      console.error(
        `[Redis] Erreur lors de la définition de la clé ${key}:`,
        error
      );
      return false;
    }
  }

  /**
   * Supprime une clé de Redis
   */
  public async del(key: string): Promise<boolean> {
    if (!this._client) return false;
    try {
      await this._client.del(key);
      return true;
    } catch (error) {
      console.error(
        `[Redis] Erreur lors de la suppression de la clé ${key}:`,
        error
      );
      return false;
    }
  }

  /**
   * Stocke un objet dans Redis (sous forme JSON)
   */
  public async setObject<T>(
    key: string,
    object: T,
    expireSeconds?: number
  ): Promise<boolean> {
    try {
      const serialized = JSON.stringify(object);
      return await this.set(key, serialized, expireSeconds);
    } catch (error) {
      console.error(
        `[Redis] Erreur lors de la sérialisation de l'objet pour la clé ${key}:`,
        error
      );
      return false;
    }
  }

  /**
   * Récupère un objet depuis Redis
   */
  public async getObject<T>(key: string): Promise<T | null> {
    try {
      const data = await this.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(
        `[Redis] Erreur lors de la désérialisation de l'objet pour la clé ${key}:`,
        error
      );
      return null;
    }
  }

  /**
   * Définit une donnée de joueur dans Redis
   */
  public async setPlayerData(
    playerId: number,
    data: any,
    expireSeconds: number = 3600
  ): Promise<boolean> {
    return await this.setObject(`player:${playerId}`, data, expireSeconds);
  }

  /**
   * Récupère les données d'un joueur depuis Redis
   */
  public async getPlayerData<T>(playerId: number): Promise<T | null> {
    return await this.getObject<T>(`player:${playerId}`);
  }

  /**
   * Définit un cooldown
   */
  public async setCooldown(
    type: string,
    identifier: string,
    durationSeconds: number
  ): Promise<boolean> {
    return await this.set(
      `cooldown:${type}:${identifier}`,
      Date.now().toString(),
      durationSeconds
    );
  }

  /**
   * Vérifie si un cooldown est actif
   */
  public async checkCooldown(
    type: string,
    identifier: string
  ): Promise<boolean> {
    if (!this._client) return false;
    try {
      const exists = await this._client.exists(
        `cooldown:${type}:${identifier}`
      );
      return exists === 1;
    } catch (error) {
      console.error(
        `[Redis] Erreur lors de la vérification du cooldown ${type}:${identifier}:`,
        error
      );
      return false;
    }
  }

  /**
   * Incrémente un compteur
   */
  public async incrementCounter(key: string): Promise<number> {
    if (!this._client) return 0;
    try {
      return await this._client.incr(key);
    } catch (error) {
      console.error(
        `[Redis] Erreur lors de l'incrémentation du compteur ${key}:`,
        error
      );
      return 0;
    }
  }

  /**
   * Publie un message sur un canal Redis
   */
  public async publish(channel: string, message: string): Promise<boolean> {
    if (!this._client) return false;
    try {
      await this._client.publish(channel, message);
      return true;
    } catch (error) {
      console.error(
        `[Redis] Erreur lors de la publication sur le canal ${channel}:`,
        error
      );
      return false;
    }
  }

  /**
   * S'abonne à un canal Redis
   */
  public async subscribe(
    channel: string,
    callback: (message: string) => void
  ): Promise<boolean> {
    if (!this._client) return false;
    try {
      // Créer un client dédié pour les abonnements
      const subClient = new Redis(this._config);

      subClient.on('message', (ch, message) => {
        if (ch === channel) {
          callback(message);
        }
      });

      await subClient.subscribe(channel);
      return true;
    } catch (error) {
      console.error(
        `[Redis] Erreur lors de l'abonnement au canal ${channel}:`,
        error
      );
      return false;
    }
  }

  /**
   * Ferme la connexion Redis
   */
  public async close(): Promise<boolean> {
    if (!this._client) return true;
    try {
      await this._client.quit();
      this._client = null;
      this._isConnected = false;
      return true;
    } catch (error) {
      console.error(
        '[Redis] Erreur lors de la fermeture de la connexion:',
        error
      );
      return false;
    }
  }
}
