on('onClientResourceStart', (resourceName: string) => {
  if (GetCurrentResourceName() != resourceName) {
    return;
  }
  console.log(`The resource ${resourceName} has been started on the client.`);
  TriggerEvent('cp:client:onjoin');
});
