// Auto-generated imports for plugins clients
import { PluginRegistry } from '../../src/plugins/types/PluginRegistry';

const pluginRegistry = PluginRegistry.instance;

import { LoadingScreenClient } from '../../src/plugins/LoadingScreen/client';
import { RedisClient } from '../plugins/RedisConnection/client';
import { MenuClient } from '../plugins/menu/client';

// Enregistrement des plugins client
pluginRegistry.registerClientPlugin('LoadingScreen', LoadingScreenClient);
pluginRegistry.registerClientPlugin('Redis', RedisClient);
pluginRegistry.registerClientPlugin('Menu', MenuClient);

// Initialisation asynchrone des plugins client
(async () => {
  try {
    await pluginRegistry.initClientPlugins();
    console.log('Plugins client initialisés avec succès');
  } catch (error) {
    console.error("Erreur lors de l'initialisation des plugins client:", error);
  }
})();
