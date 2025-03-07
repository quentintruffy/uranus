const chokidar = require('chokidar');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Utiliser des chemins absolus pour être sûr
const srcDir = path.resolve(__dirname, '../src');
console.log('Dossier source surveillé:', srcDir);

// Vérifier que le dossier source existe
if (!fs.existsSync(srcDir)) {
  console.error(`ERREUR: Le dossier source ${srcDir} n'existe pas!`);
  process.exit(1);
}

// Débounce pour éviter des builds multiples lors de sauvegardes rapides
let debounceTimer;
let isBuilding = false;

function runBuild() {
  // Si un build est déjà en cours, ne pas en lancer un autre
  if (isBuilding) return;
  
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    console.log('\n🔄 Changements détectés, reconstruction en cours...');
    
    isBuilding = true;
    const build = spawn('node', [path.resolve(__dirname, 'ensure-dist-build.js')], { 
      stdio: 'inherit',
      shell: true
    });
    
    build.on('close', (code) => {
      isBuilding = false;
      if (code === 0) {
        console.log('✅ Reconstruction terminée avec succès\n');
      } else {
        console.log(`❌ Erreur lors de la reconstruction (code ${code})\n`);
      }
    });
    
    build.on('error', (err) => {
      isBuilding = false;
      console.error('❌ Erreur lors du lancement de la reconstruction:', err);
    });
  }, 100); // Délai court pour regrouper les sauvegardes multiples
}

// Exécuter le build initial
console.log('🚀 Lancement du build initial...');
runBuild();

// Configuration plus robuste pour la surveillance
console.log('👀 Démarrage de la surveillance des fichiers...');
const watcher = chokidar.watch(srcDir, {
  ignored: ['**/node_modules/**', '**/dist/**'],
  persistent: true,
  usePolling: true,  // Utiliser le polling pour Windows
  interval: 500,     // Intervalle de polling plus court pour être plus réactif
  binaryInterval: 1000,
  awaitWriteFinish: {
    stabilityThreshold: 300, // Attendre 300ms après la dernière modification
    pollInterval: 100        // Vérifier toutes les 100ms
  },
  alwaysStat: true,
  ignorePermissionErrors: true
});

// Afficher les messages de débogage
watcher.on('ready', () => {
  console.log(`⌛ Surveillance initialisée pour ${srcDir}`);
  console.log('En attente de changements...');
});

// Très verbeux pour le débogage
watcher
  .on('add', path => {
    console.log(`📁 Fichier ajouté: ${path}`);
    runBuild();
  })
  .on('change', path => {
    console.log(`📝 Fichier modifié: ${path}`);
    runBuild();
  })
  .on('unlink', path => {
    console.log(`🗑️ Fichier supprimé: ${path}`);
    runBuild();
  })
  .on('error', error => {
    console.error(`⚠️ Erreur de surveillance: ${error}`);
  });

// Gérer l'arrêt propre
process.on('SIGINT', () => {
  console.log('\n👋 Arrêt de la surveillance et sortie...');
  watcher.close().then(() => process.exit(0));
});