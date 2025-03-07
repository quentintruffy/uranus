// Auto-generated imports for plugins servers
import { PluginRegistry } from '../../src/plugins/types/PluginRegistry';

const pluginRegistry = PluginRegistry.instance;

import { LoadingScreenServer } from '../../src/plugins/LoadingScreen/server';

// Enregistrement des plugins serveur
pluginRegistry.registerServerPlugin('LoadingScreen', LoadingScreenServer);

// Initialisation asynchrone des plugins serveur
(async () => {
  try {
    await pluginRegistry.initServerPlugins();
    console.log("Plugins serveur initialisés avec succès");
  } catch (error) {
    console.error("Erreur lors de l'initialisation des plugins serveur:", error);
  }
})();
