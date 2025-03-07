// plugins/types/AbstractPlugin.ts
import { IPlugin, PluginManifest, PluginSide } from './IPlugin';

export abstract class AbstractPlugin implements IPlugin {
  public readonly name: string;
  private _manifest: PluginManifest | null = null;
  private _enabled: boolean = false;
  protected side: PluginSide;
  protected api: any = {};

  constructor(name: string, side: PluginSide) {
    this.name = name;
    this.side = side;
  }

  /**
   * Charge le plugin mais ne l'active pas encore
   * Cette méthode est appelée automatiquement par le registre
   */
  public async load(): Promise<void> {
    this.log(`Chargement (${this.side})`);
    await this.onLoad();
    this.log(`Chargé avec succès`);
  }

  /**
   * Active le plugin après son chargement
   */
  public async enable(): Promise<void> {
    if (this._enabled) {
      this.log('Déjà activé');
      return;
    }

    this.log(`Activation`);
    await this.onEnable();
    this._enabled = true;
    this.log(`Activé avec succès`);
  }

  /**
   * Désactive le plugin sans le décharger
   */
  public async disable(): Promise<void> {
    if (!this._enabled) {
      this.log('Déjà désactivé');
      return;
    }

    this.log(`Désactivation`);
    await this.onDisable();
    this._enabled = false;
    this.log(`Désactivé avec succès`);
  }

  /**
   * Décharge le plugin complètement
   */
  public async unload(): Promise<void> {
    if (this._enabled) {
      await this.disable();
    }

    this.log(`Déchargement`);
    await this.onUnload();
    this.log(`Déchargé avec succès`);
  }

  /**
   * Obtient l'état d'activation du plugin
   */
  public get enabled(): boolean {
    return this._enabled;
  }

  /**
   * Obtient l'API publique du plugin
   */
  public getAPI(): any {
    return this.api;
  }

  /**
   * Méthodes du cycle de vie à implémenter par les plugins dérivés
   */
  protected abstract onLoad(): Promise<void>;
  protected abstract onEnable(): Promise<void>;
  protected abstract onDisable(): Promise<void>;
  protected abstract onUnload(): Promise<void>;

  /**
   * Définit le manifest du plugin
   * @param manifest Informations sur le plugin
   */
  protected setManifest(manifest: PluginManifest): void {
    this._manifest = manifest;
  }

  /**
   * Obtient le manifest du plugin
   * @returns Informations sur le plugin
   */
  public get manifest(): PluginManifest | null {
    return this._manifest;
  }

  /**
   * Méthode utilitaire pour logger des messages spécifiques au plugin
   * @param message Message à logger
   * @param args Arguments supplémentaires
   */
  protected log(message: string, ...args: any[]): void {
    console.log(`[Plugin:${this.name}:${this.side}] ${message}`, ...args);
  }

  /**
   * Méthode utilitaire pour logger des erreurs spécifiques au plugin
   * @param message Message d'erreur
   * @param args Arguments supplémentaires
   */
  protected error(message: string, ...args: any[]): void {
    console.error(
      `[Plugin:${this.name}:${this.side}] ERROR: ${message}`,
      ...args
    );
  }

  /**
   * Méthode utilitaire pour logger des avertissements spécifiques au plugin
   * @param message Message d'avertissement
   * @param args Arguments supplémentaires
   */
  protected warn(message: string, ...args: any[]): void {
    console.warn(
      `[Plugin:${this.name}:${this.side}] WARNING: ${message}`,
      ...args
    );
  }
}
