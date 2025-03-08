// Auto-generated imports for plugins servers
import { PluginRegistry } from '../../src/plugins/types/PluginRegistry';

const pluginRegistry = PluginRegistry.instance;

import { LoadingScreenServer } from '../../src/plugins/LoadingScreen/server';
import { RedisServer } from '../plugins/RedisConnection/server';
import { MenuClient } from '../plugins/menu/server';

// Enregistrement des plugins serveur
pluginRegistry.registerServerPlugin('LoadingScreen', LoadingScreenServer);
pluginRegistry.registerServerPlugin('Redis', RedisServer);
pluginRegistry.registerServerPlugin('Menu', MenuClient);

// Initialisation asynchrone des plugins serveur
(async () => {
  try {
    await pluginRegistry.initServerPlugins();
    console.log('Plugins serveur initialisés avec succès');
  } catch (error) {
    console.error(
      "Erreur lors de l'initialisation des plugins serveur:",
      error
    );
  }
})();
