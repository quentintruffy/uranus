// src/plugins/Redis/client.ts
import { AbstractPlugin } from '../types/AbstractPlugin';

export class RedisClient extends AbstractPlugin {
  // Ce fichier existe principalement pour maintenir la structure de plugin,
  // mais la fonctionnalité Redis est principalement côté serveur

  protected async onLoad(): Promise<void> {
    this.log('Plugin Redis chargé côté client (fonctionnalité limitée)');
  }

  protected async onEnable(): Promise<void> {
    // Rien à faire côté client
  }

  protected async onDisable(): Promise<void> {
    // Rien à faire côté client
  }

  protected async onUnload(): Promise<void> {
    // Rien à faire côté client
  }
}
