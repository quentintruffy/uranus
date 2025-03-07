const path = require('path');
const fs = require('fs');
const { build } = require('esbuild');

// Normalisation des chemins pour éviter les problèmes Windows
const buildPath = path.resolve(__dirname, '../dist');
const clientEntry = path.resolve(__dirname, '../src/client/client.ts');
const serverEntry = path.resolve(__dirname, '../src/server/server.ts');

// Vérifier si nous sommes en mode watch
const isWatchMode = process.argv.includes('--watch');

// S'assurer que le dossier dist existe
console.log('Vérification du dossier de build:', buildPath);
if (!fs.existsSync(buildPath)) {
  console.log('Création du dossier dist...');
  fs.mkdirSync(buildPath, { recursive: true });
}

// S'assurer que les sous-dossiers existent
const clientOutDir = path.resolve(buildPath, 'client');
const serverOutDir = path.resolve(buildPath, 'server');

if (!fs.existsSync(clientOutDir)) {
  console.log('Création du dossier client...');
  fs.mkdirSync(clientOutDir, { recursive: true });
}

if (!fs.existsSync(serverOutDir)) {
  console.log('Création du dossier server...');
  fs.mkdirSync(serverOutDir, { recursive: true });
}

// Générer les fichiers d'importation automatique pour les jobs
generateJobsImports();

console.log('Chemins de build:');
console.log('- Build path:', buildPath);
console.log('- Client entry:', clientEntry);
console.log('- Server entry:', serverEntry);
console.log('- Client output:', clientOutDir);
console.log('- Server output:', serverOutDir);

// Vérifier que les fichiers d'entrée existent
if (!fs.existsSync(clientEntry)) {
  console.error("ERREUR: Le fichier client.ts n'existe pas à:", clientEntry);
  process.exit(1);
}

if (!fs.existsSync(serverEntry)) {
  console.error("ERREUR: Le fichier server.ts n'existe pas à:", serverEntry);
  process.exit(1);
}

// Configuration de base commune aux deux builds
const commonConfig = {
  bundle: true,
  minify: true,
  target: ['es2020'],
  logLevel: 'info',
};

if (isWatchMode) {
  console.log('🔍 Mode watch activé, surveillance des fichiers...');

  // Configuration du client avec watch
  build({
    ...commonConfig,
    entryPoints: [clientEntry],
    outdir: clientOutDir,
    platform: 'browser',
    watch: {
      onRebuild(error, result) {
        if (error) {
          console.error(
            '❌ Erreur lors de la reconstruction du client:',
            error
          );
        } else {
          console.log('✅ Client reconstruit avec succès!');
          generateJobsImports();
        }
      },
    },
  }).catch((error) => {
    console.error('Erreur de build client:', error);
  });

  // Configuration du serveur avec watch
  build({
    ...commonConfig,
    entryPoints: [serverEntry],
    outdir: serverOutDir,
    platform: 'node',
    watch: {
      onRebuild(error, result) {
        if (error) {
          console.error(
            '❌ Erreur lors de la reconstruction du serveur:',
            error
          );
        } else {
          console.log('✅ Serveur reconstruit avec succès!');
          generateJobsImports();
        }
      },
    },
  }).catch((error) => {
    console.error('Erreur de build serveur:', error);
  });

  console.log('👀 Surveillance active, appuyez sur Ctrl+C pour arrêter...');
} else {
  // Build unique (non-watch)
  Promise.all([
    // Build client
    build({
      ...commonConfig,
      entryPoints: [clientEntry],
      outdir: clientOutDir,
      platform: 'browser',
    }),

    // Build server
    build({
      ...commonConfig,
      entryPoints: [serverEntry],
      outdir: serverOutDir,
      platform: 'node',
    }),
  ])
    .then(() => {
      console.log('Build terminé avec succès!');

      // Vérifier le contenu du dossier dist après le build
      console.log('Contenu du dossier dist:');
      if (fs.existsSync(buildPath)) {
        const distFiles = fs.readdirSync(buildPath);
        console.log(distFiles);
      } else {
        console.log("Le dossier dist n'existe toujours pas après le build!");
      }
    })
    .catch((error) => {
      console.error('Erreur de build:', error);
      process.exit(1);
    });
}
// Fonction pour générer les importations automatiques des jobs
function generateJobsImports() {
  const jobsPath = path.resolve(__dirname, '../jobs');

  console.log('Chemin recherché pour les jobs:', jobsPath);

  if (!fs.existsSync(jobsPath)) {
    console.log("Le dossier jobs n'existe pas à l'emplacement:", jobsPath);
    return;
  }

  console.log('Génération des importations automatiques pour les jobs...');

  // Lire tous les dossiers de jobs (en excluant le dossier types)
  const allItems = fs.readdirSync(jobsPath);
  console.log('Tous les éléments dans le dossier jobs:', allItems);

  const jobFolders = fs
    .readdirSync(jobsPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory() && dirent.name !== 'types')
    .map((dirent) => dirent.name);

  console.log('Dossiers de jobs trouvés:', jobFolders);

  if (jobFolders.length === 0) {
    console.log('Aucun dossier de job valide trouvé.');
    return;
  }

  // Chemins des fichiers d'importation
  const clientImportPath = path.resolve(
    __dirname,
    '../src/client/job-imports.ts'
  );
  const serverImportPath = path.resolve(
    __dirname,
    '../src/server/job-imports.ts'
  );

  // Générer les imports pour client.ts avec vérification
  let clientImports = '// Auto-generated imports for jobs clients\n';
  clientImports +=
    "import { JobRegistry } from '../../jobs/types/JobRegistry';\n\n";
  let hasClientJobs = false;

  // Générer les imports pour server.ts avec vérification
  let serverImports = '// Auto-generated imports for jobs servers\n';
  serverImports +=
    "import { JobRegistry } from '../../jobs/types/JobRegistry';\n\n";
  let hasServerJobs = false;

  // Récupérer la référence au registre
  clientImports += 'const registry = JobRegistry.instance;\n\n';
  serverImports += 'const registry = JobRegistry.instance;\n\n';

  for (const job of jobFolders) {
    const jobNameCapitalized = job.charAt(0).toUpperCase() + job.slice(1);

    const clientPath = path.join(jobsPath, job, 'client.ts');
    const serverPath = path.join(jobsPath, job, 'server.ts');

    if (fs.existsSync(clientPath)) {
      clientImports += `import { ${jobNameCapitalized}Client } from '../../jobs/${job}/client';\n`;
      hasClientJobs = true;
      console.log(`Fichier client trouvé pour ${job}: ${clientPath}`);
    } else {
      console.log(`⚠️ Fichier client manquant pour ${job}: ${clientPath}`);
    }

    if (fs.existsSync(serverPath)) {
      serverImports += `import { ${jobNameCapitalized}Server } from '../../jobs/${job}/server';\n`;
      hasServerJobs = true;
      console.log(`Fichier serveur trouvé pour ${job}: ${serverPath}`);
    } else {
      console.log(`⚠️ Fichier serveur manquant pour ${job}: ${serverPath}`);
    }
  }

  clientImports += '\n// Enregistrement des jobs client\n';
  serverImports += '\n// Enregistrement des jobs serveur\n';

  for (const job of jobFolders) {
    const jobNameCapitalized = job.charAt(0).toUpperCase() + job.slice(1);

    const clientPath = path.join(jobsPath, job, 'client.ts');
    const serverPath = path.join(jobsPath, job, 'server.ts');

    if (fs.existsSync(clientPath)) {
      clientImports += `registry.registerClientJob('${job}', ${jobNameCapitalized}Client);\n`;
    }

    if (fs.existsSync(serverPath)) {
      serverImports += `registry.registerServerJob('${job}', ${jobNameCapitalized}Server);\n`;
    }
  }

  clientImports +=
    '\n// Initialisation des jobs client\nregistry.initClientJobs();\n';
  serverImports +=
    '\n// Initialisation des jobs serveur\nregistry.initServerJobs();\n';

  // Écrire les fichiers d'importation uniquement s'ils ont du contenu
  if (hasClientJobs) {
    fs.writeFileSync(clientImportPath, clientImports);
    console.log(`Fichier d'importation client généré: ${clientImportPath}`);
  } else {
    // Créer un fichier vide ou avec juste un commentaire
    fs.writeFileSync(clientImportPath, '// Aucun job client trouvé\n');
    console.log("Aucun job client trouvé, fichier d'importation vide généré.");
  }

  if (hasServerJobs) {
    fs.writeFileSync(serverImportPath, serverImports);
    console.log(`Fichier d'importation serveur généré: ${serverImportPath}`);
  } else {
    // Créer un fichier vide ou avec juste un commentaire
    fs.writeFileSync(serverImportPath, '// Aucun job serveur trouvé\n');
    console.log("Aucun job serveur trouvé, fichier d'importation vide généré.");
  }

  console.log(`${jobFolders.length} jobs trouvés et importés automatiquement.`);
}
