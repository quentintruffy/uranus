// plugins/types/PluginRegistry.ts
import { IPlugin, PluginSide, PluginManifest } from './IPlugin';

export type PluginConstructor<T extends IPlugin> = new (...args: any[]) => T;

export class PluginRegistry {
  private static _instance: PluginRegistry;
  private _clientPlugins: Map<string, IPlugin> = new Map();
  private _serverPlugins: Map<string, IPlugin> = new Map();
  private _loadOrder: string[] = [];
  private _dependencyGraph: Map<string, string[]> = new Map();

  private constructor() {}

  public static get instance(): PluginRegistry {
    if (!PluginRegistry._instance) {
      PluginRegistry._instance = new PluginRegistry();
    }
    return PluginRegistry._instance;
  }

  /**
   * Enregistre un plugin côté client
   * @param name Nom du plugin
   * @param pluginClass Constructeur de la classe de plugin
   */
  public registerClientPlugin<T extends IPlugin>(
    name: string,
    pluginClass: PluginConstructor<T>
  ): void {
    if (this._clientPlugins.has(name)) {
      console.warn(`Un plugin client avec le nom "${name}" existe déjà`);
      return;
    }

    try {
      const plugin = new pluginClass(name, PluginSide.CLIENT);
      this._clientPlugins.set(name, plugin);
      console.log(`Plugin client "${name}" enregistré avec succès`);
    } catch (error) {
      console.error(
        `Erreur lors de l'enregistrement du plugin client "${name}":`,
        error
      );
    }
  }

  /**
   * Enregistre un plugin côté serveur
   * @param name Nom du plugin
   * @param pluginClass Constructeur de la classe de plugin
   */
  public registerServerPlugin<T extends IPlugin>(
    name: string,
    pluginClass: PluginConstructor<T>
  ): void {
    if (this._serverPlugins.has(name)) {
      console.warn(`Un plugin serveur avec le nom "${name}" existe déjà`);
      return;
    }

    try {
      const plugin = new pluginClass(name, PluginSide.SERVER);
      this._serverPlugins.set(name, plugin);
      console.log(`Plugin serveur "${name}" enregistré avec succès`);
    } catch (error) {
      console.error(
        `Erreur lors de l'enregistrement du plugin serveur "${name}":`,
        error
      );
    }
  }

  /**
   * Charge et active tous les plugins côté client dans l'ordre des dépendances
   */
  public async initClientPlugins(): Promise<void> {
    console.log(
      `Initialisation de ${this._clientPlugins.size} plugins client...`
    );

    // Construire le graphe de dépendances
    this._buildDependencyGraph(this._clientPlugins);

    // Déterminer l'ordre de chargement
    this._calculateLoadOrder();

    // Charger les plugins dans l'ordre
    for (const name of this._loadOrder) {
      const plugin = this._clientPlugins.get(name);
      if (plugin) {
        try {
          await plugin.load();
          await plugin.enable();
        } catch (error) {
          console.error(
            `Erreur lors de l'initialisation du plugin client "${name}":`,
            error
          );
        }
      }
    }

    console.log(`Initialisation des plugins client terminée`);
  }

  /**
   * Charge et active tous les plugins côté serveur dans l'ordre des dépendances
   */
  public async initServerPlugins(): Promise<void> {
    console.log(
      `Initialisation de ${this._serverPlugins.size} plugins serveur...`
    );

    // Construire le graphe de dépendances
    this._buildDependencyGraph(this._serverPlugins);

    // Déterminer l'ordre de chargement
    this._calculateLoadOrder();

    // Charger les plugins dans l'ordre
    for (const name of this._loadOrder) {
      const plugin = this._serverPlugins.get(name);
      if (plugin) {
        try {
          await plugin.load();
          await plugin.enable();
        } catch (error) {
          console.error(
            `Erreur lors de l'initialisation du plugin serveur "${name}":`,
            error
          );
        }
      }
    }

    console.log(`Initialisation des plugins serveur terminée`);
  }

  /**
   * Désactive et décharge tous les plugins
   * @param side Côté (client ou serveur) à décharger
   */
  public async unloadPlugins(side: 'client' | 'server'): Promise<void> {
    const plugins =
      side === 'client' ? this._clientPlugins : this._serverPlugins;
    const reverseOrder = [...this._loadOrder].reverse();

    console.log(`Déchargement de ${plugins.size} plugins ${side}...`);

    for (const name of reverseOrder) {
      const plugin = plugins.get(name);
      if (plugin && plugin.enabled) {
        try {
          await plugin.disable();
          await plugin.unload();
        } catch (error) {
          console.error(
            `Erreur lors du déchargement du plugin ${side} "${name}":`,
            error
          );
        }
      }
    }

    console.log(`Déchargement des plugins ${side} terminé`);
  }

  /**
   * Récupère un plugin client par son nom
   * @param name Nom du plugin
   * @returns Plugin correspondant ou undefined si non trouvé
   */
  public getClientPlugin<T extends IPlugin = IPlugin>(
    name: string
  ): T | undefined {
    return this._clientPlugins.get(name) as T | undefined;
  }

  /**
   * Récupère un plugin serveur par son nom
   * @param name Nom du plugin
   * @returns Plugin correspondant ou undefined si non trouvé
   */
  public getServerPlugin<T extends IPlugin = IPlugin>(
    name: string
  ): T | undefined {
    return this._serverPlugins.get(name) as T | undefined;
  }

  /**
   * Récupère l'API d'un plugin client
   * @param name Nom du plugin
   * @returns API du plugin ou null si non trouvé
   */
  public getClientPluginAPI(name: string): any | null {
    const plugin = this._clientPlugins.get(name);
    return plugin ? plugin.getAPI() : null;
  }

  /**
   * Récupère l'API d'un plugin serveur
   * @param name Nom du plugin
   * @returns API du plugin ou null si non trouvé
   */
  public getServerPluginAPI(name: string): any | null {
    const plugin = this._serverPlugins.get(name);
    return plugin ? plugin.getAPI() : null;
  }

  /**
   * Construit le graphe de dépendances pour les plugins
   * @param plugins Map des plugins à analyser
   */
  private _buildDependencyGraph(plugins: Map<string, IPlugin>): void {
    this._dependencyGraph.clear();

    for (const [name, plugin] of plugins) {
      const dependencies = plugin.manifest?.dependencies || [];
      this._dependencyGraph.set(name, dependencies);
    }
  }

  /**
   * Calcule l'ordre de chargement des plugins en fonction des dépendances
   * Utilise un tri topologique
   */
  private _calculateLoadOrder(): void {
    this._loadOrder = [];
    const visited = new Set<string>();
    const temp = new Set<string>();

    // Fonction de visite pour le tri topologique
    const visit = (name: string) => {
      if (temp.has(name)) {
        throw new Error(
          `Dépendance circulaire détectée impliquant le plugin "${name}"`
        );
      }

      if (!visited.has(name)) {
        temp.add(name);

        const dependencies = this._dependencyGraph.get(name) || [];
        for (const dep of dependencies) {
          visit(dep);
        }

        temp.delete(name);
        visited.add(name);
        this._loadOrder.push(name);
      }
    };

    // Visiter chaque nœud
    for (const name of this._dependencyGraph.keys()) {
      if (!visited.has(name)) {
        visit(name);
      }
    }
  }
}
