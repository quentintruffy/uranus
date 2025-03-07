// plugins/types/IPlugin.ts
export interface PluginManifest {
  name: string;
  description: string;
  version: string;
  author: string;
  dependencies?: string[]; // Dépendances d'autres plugins
}

export interface IPlugin {
  readonly name: string;
  readonly manifest: PluginManifest | null;
  readonly enabled: boolean;

  // Méthodes du cycle de vie
  load(): Promise<void>;
  enable(): Promise<void>;
  disable(): Promise<void>;
  unload(): Promise<void>;

  // Méthodes d'API
  getAPI(): any;
}

export enum PluginSide {
  CLIENT = 'client',
  SERVER = 'server',
  SHARED = 'shared',
}
