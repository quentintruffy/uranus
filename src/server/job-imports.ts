// Auto-generated imports for jobs servers
import { JobRegistry } from '../../src/jobs/types/JobRegistry';

const registry = JobRegistry.instance;

import { MetrodriverServer } from '../../src/jobs/metrodriver/server';

// Enregistrement des jobs serveur
registry.registerServerJob('metrodriver', MetrodriverServer);

// Initialisation des jobs serveur
registry.initServerJobs();
