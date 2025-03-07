import { initializeSpawnPed } from '../modules/spawnmanager';

let wasDead = false;
let lastHealth = 100;

setTick(() => {
  const playerPed = PlayerPedId();
  const playerId = PlayerId();
  const currentHealth = GetEntityHealth(playerPed);
  const isDead = IsPedDeadOrDying(playerPed, true) || currentHealth <= 0;

  // Détection plus sensible: mort OU perte de santé importante ET santé très basse
  const suddenHealthDrop = lastHealth > 20 && currentHealth <= 5;
  const deathDetected = isDead || suddenHealthDrop;

  if (deathDetected && !wasDead) {
    TriggerClientEvent('cp:client:onjoin', playerId);
    TriggerEvent('cp:onPlayerResurrect', playerId);
    console.log(`Joueur ${playerPed} est mort 2`);
    wasDead = true;
  } else if (!isDead && currentHealth > 20) {
    // Réinitialiser l'état de mort si le joueur est réanimé
    wasDead = false;
  }

  // Mettre à jour la dernière santé connue
  lastHealth = currentHealth;
});
