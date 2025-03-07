// jobs/types/AbstractJob.ts
import { IJob, JobManifest, JobSide } from './IJob';

export abstract class AbstractJob implements IJob {
  public readonly name: string;
  private _manifest: JobManifest | null = null;
  protected side: JobSide;

  constructor(name: string, side: JobSide) {
    this.name = name;
    this.side = side;
  }

  /**
   * Initialise le job
   * Cette méthode est appelée automatiquement par le registre
   */
  public init(): void {
    this.log(`Initialisation (${this.side})`);
    this.onInit();
  }

  /**
   * Tick du job
   * Cette méthode est appelée automatiquement par le registre
   */
  public tick(): void {
    // this.log(`Tick (${this.side})`);
    this.onTick();
  }

  /**
   * Méthode à implémenter par les jobs dérivés
   * Contient la logique d'initialisation spécifique au job
   */
  protected abstract onInit(): void;

  /**
   * Fonction qui s'exécute régulièrement
   */
  protected abstract onTick(): void;

  /**
   * Définit le manifest du job
   * @param manifest Informations sur le job
   */
  protected setManifest(manifest: JobManifest): void {
    this._manifest = manifest;
  }

  /**
   * Obtient le manifest du job
   * @returns Informations sur le job
   */
  public get manifest(): JobManifest | null {
    return this._manifest;
  }

  /**
   * Méthode utilitaire pour logger des messages spécifiques au job
   * @param message Message à logger
   * @param args Arguments supplémentaires
   */
  protected log(message: string, ...args: any[]): void {
    console.log(`[Job:${this.name}:${this.side}] ${message}`, ...args);
  }

  /**
   * Méthode utilitaire pour logger des erreurs spécifiques au job
   * @param message Message d'erreur
   * @param args Arguments supplémentaires
   */
  protected error(message: string, ...args: any[]): void {
    console.error(`[Job:${this.name}:${this.side}] ERROR: ${message}`, ...args);
  }
}
