RegisterCommand(
  'veh',
  async (source: number, args: string[], rawCommand: string) => {
    const [model] = args;
    if (!model) {
      emit('chat:addMessage', {
        color: [255, 0, 0],
        message: 'Veuillez spécifier un modèle de véhicule',
      });
      return;
    }

    const modelHash = GetHashKey(model);

    if (!IsModelInCdimage(modelHash)) {
      emit('chat:addMessage', {
        color: [255, 0, 0],
        message: 'Modèle invalide',
      });
      return;
    }

    RequestModel(modelHash);
    while (!HasModelLoaded(modelHash)) await Delay(100);

    const [x, y, z] = GetEntityCoords(PlayerPedId(), true);
    const h = GetEntityHeading(PlayerPedId());
    const veh = CreateVehicle(modelHash, x, y, z, h, true, true);

    while (!DoesEntityExist(veh)) await Delay(100);

    SetPedIntoVehicle(PlayerPedId(), veh, -1);
    SetVehicleEngineOn(veh, true, true, false);

    SendNuiMessage('e');

    console.log(`Véhicule ${model} créé !`);
  },
  false
);

export function Delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
