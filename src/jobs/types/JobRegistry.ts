// jobs/types/JobRegistry.ts
import { IJob, JobSide } from './IJob';

export type JobConstructor<T extends IJob> = new (...args: any[]) => T;

export class JobRegistry {
  private static _instance: JobRegistry;
  private _clientJobs: Map<string, IJob> = new Map();
  private _serverJobs: Map<string, IJob> = new Map();

  private constructor() {}

  public static get instance(): JobRegistry {
    if (!JobRegistry._instance) {
      JobRegistry._instance = new JobRegistry();
    }
    return JobRegistry._instance;
  }

  /**
   * Enregistre un job côté client
   * @param name Nom du job
   * @param jobClass Constructeur de la classe de job
   */
  public registerClientJob<T extends IJob>(
    name: string,
    jobClass: JobConstructor<T>
  ): void {
    if (this._clientJobs.has(name)) {
      console.warn(`Un job client avec le nom "${name}" existe déjà`);
      return;
    }

    try {
      const job = new jobClass(name, JobSide.CLIENT);
      this._clientJobs.set(name, job);
      console.log(`Job client "${name}" enregistré avec succès`);
    } catch (error) {
      console.error(
        `Erreur lors de l'enregistrement du job client "${name}":`,
        error
      );
    }
  }

  /**
   * Enregistre un job côté serveur
   * @param name Nom du job
   * @param jobClass Constructeur de la classe de job
   */
  public registerServerJob<T extends IJob>(
    name: string,
    jobClass: JobConstructor<T>
  ): void {
    if (this._serverJobs.has(name)) {
      console.warn(`Un job serveur avec le nom "${name}" existe déjà`);
      return;
    }

    try {
      const job = new jobClass(name, JobSide.SERVER);
      this._serverJobs.set(name, job);
      console.log(`Job serveur "${name}" enregistré avec succès`);
    } catch (error) {
      console.error(
        `Erreur lors de l'enregistrement du job serveur "${name}":`,
        error
      );
    }
  }

  /**
   * Initialise tous les jobs côté client
   */
  public initClientJobs(): void {
    console.log(`Initialisation de ${this._clientJobs.size} jobs client...`);
    for (const [name, job] of this._clientJobs) {
      try {
        job.init();
      } catch (error) {
        console.error(
          `Erreur lors de l'initialisation du job client "${name}":`,
          error
        );
      }
    }
    // Cree une boucle de tick pour les jobs
    setInterval(() => {
      for (const [name, job] of this._clientJobs) {
        try {
          job.tick();
        } catch (error) {
          console.error(`Erreur lors du tick du job client "${name}":`, error);
        }
      }
    }, 10);
  }

  /**
   * Initialise tous les jobs côté serveur
   */
  public initServerJobs(): void {
    console.log(`Initialisation de ${this._serverJobs.size} jobs serveur...`);
    for (const [name, job] of this._serverJobs) {
      try {
        job.init();
      } catch (error) {
        console.error(
          `Erreur lors de l'initialisation du job serveur "${name}":`,
          error
        );
      }
    }
  }

  /**
   * Récupère un job client par son nom
   * @param name Nom du job
   * @returns Job correspondant ou undefined si non trouvé
   */
  public getClientJob<T extends IJob = IJob>(name: string): T | undefined {
    return this._clientJobs.get(name) as T | undefined;
  }

  /**
   * Récupère un job serveur par son nom
   * @param name Nom du job
   * @returns Job correspondant ou undefined si non trouvé
   */
  public getServerJob<T extends IJob = IJob>(name: string): T | undefined {
    return this._serverJobs.get(name) as T | undefined;
  }

  /**
   * Récupère tous les jobs client
   * @returns Map de tous les jobs client
   */
  public get clientJobs(): ReadonlyMap<string, IJob> {
    return this._clientJobs;
  }

  /**
   * Récupère tous les jobs serveur
   * @returns Map de tous les jobs serveur
   */
  public get serverJobs(): ReadonlyMap<string, IJob> {
    return this._serverJobs;
  }
}
