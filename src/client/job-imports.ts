// Auto-generated imports for jobs clients
import { JobRegistry } from '../../src/jobs/types/JobRegistry';

const registry = JobRegistry.instance;

import { MetrodriverClient } from '../../src/jobs/metrodriver/client';

// Enregistrement des jobs client
registry.registerClientJob('metrodriver', MetrodriverClient);

// Initialisation des jobs client
registry.initClientJobs();
