const path = require('path');
const fs = require('fs');
const { build } = require('esbuild');

// Normalisation des chemins pour éviter les problèmes Windows
const buildPath = path.resolve(__dirname, '../dist');
const clientEntry = path.resolve(__dirname, '../src/client/client.ts');
const serverEntry = path.resolve(__dirname, '../src/server/server.ts');

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

console.log('Chemins de build:');
console.log('- Build path:', buildPath);
console.log('- Client entry:', clientEntry);
console.log('- Server entry:', serverEntry);
console.log('- Client output:', clientOutDir);
console.log('- Server output:', serverOutDir);

// Vérifier que les fichiers d'entrée existent
if (!fs.existsSync(clientEntry)) {
  console.error('ERREUR: Le fichier client.ts n\'existe pas à:', clientEntry);
  process.exit(1);
}

if (!fs.existsSync(serverEntry)) {
  console.error('ERREUR: Le fichier server.ts n\'existe pas à:', serverEntry);
  process.exit(1);
}

Promise.all([
  // Build client
  build({
    entryPoints: [clientEntry],
    outdir: clientOutDir,
    bundle: true,
    minify: true,
    platform: 'browser',
    target: ['es2020'],
    logLevel: 'info',
  }),

  // Build server
  build({
    entryPoints: [serverEntry],
    outdir: serverOutDir,
    bundle: true, 
    minify: true,
    platform: 'node',
    target: ['es2020'],
    logLevel: 'info',
  })
]).then(() => {
  console.log('Build terminé avec succès!');
  
  // Vérifier le contenu du dossier dist après le build
  console.log('Contenu du dossier dist:');
  if (fs.existsSync(buildPath)) {
    const distFiles = fs.readdirSync(buildPath);
    console.log(distFiles);
  } else {
    console.log('Le dossier dist n\'existe toujours pas après le build!');
  }
}).catch((error) => {
  console.error('Erreur de build:', error);
  process.exit(1);
});