// src/plugins/Redis/shared.ts

// Structure de la configuration Redis
export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
}

// Structure des données de joueur dans Redis
export interface PlayerRedisData {
  identifier: string;
  name: string;
  lastSeen: number;
  position?: {
    x: number;
    y: number;
    z: number;
  };
  metadata?: Record<string, any>;
}

// Types d'événements Redis pubsub
export enum RedisChannels {
  PLAYER_JOIN = 'player:join',
  PLAYER_LEAVE = 'player:leave',
  SERVER_INFO = 'server:info',
  CHAT_MESSAGE = 'chat:message',
}

// Structure des messages inter-serveurs
export interface RedisMessage {
  serverId: string;
  timestamp: number;
  type: string;
  data: any;
}
