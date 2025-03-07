export const createBlip = (
  x: number,
  y: number,
  z: number,
  sprite: number,
  color: number,
  name: string
): number => {
  const blip = AddBlipForCoord(x, y, z);
  SetBlipSprite(blip, sprite);
  SetBlipColour(blip, color);
  SetBlipScale(blip, 0.8);
  SetBlipAsShortRange(blip, true);

  BeginTextCommandSetBlipName('STRING');
  AddTextComponentString(name);
  EndTextCommandSetBlipName(blip);

  return blip;
};
