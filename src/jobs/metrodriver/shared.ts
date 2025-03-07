interface TrainConfig {
  variation: number;
  spawnPoints: SpawnPoint[];
  maxSpeed: number;
  acceleration: number;
  brakeForce: number;
}

interface SpawnPoint {
  position: Vector3;
  direction: boolean; // Direction dans laquelle le train va
}

interface Vector3 {
  x: number;
  y: number;
  z: number;
}

// Configuration du train
export const trainConfig: TrainConfig = {
  variation: 28, // Variation 1 pour un train de fret standard
  spawnPoints: [
    { position: { x: -1354.0, y: -464.0, z: 15.0 }, direction: true },
  ],
  maxSpeed: 20.0,
  acceleration: 5.0,
  brakeForce: 10.0,
};

export const metroStations = [
  {
    name: 'LSIA Terminal',
    position: { x: -1088.62, y: -2835.56, z: -0.29 },
    color: 12, // Jaune
  },
  {
    name: 'LSIA Parking',
    position: { x: -878.46, y: -2317.92, z: -10.0 },
    color: 12,
  },
  {
    name: 'Puerto Del Sol',
    position: { x: -539.73, y: -1277.52, z: 25.9 },
    color: 12,
  },
  {
    name: 'Strawberry',
    position: { x: 279.58, y: -1206.08, z: 37.89 },
    color: 12,
  },
  {
    name: 'Burton',
    position: { x: -283.35, y: -333.94, z: 29.1 },
    color: 12,
  },
  {
    name: 'Portola Drive',
    position: { x: -816.47, y: -134.47, z: 28.18 },
    color: 12,
  },
  {
    name: 'Del Perro',
    position: { x: -1350.83, y: -466.33, z: 14.5 },
    color: 12,
  },
  {
    name: 'Little Seoul',
    position: { x: -499.15, y: -673.32, z: 19.06 },
    color: 12,
  },
  {
    name: 'Pillbox South',
    position: { x: -220.24, y: -1011.96, z: 29.14 },
    color: 12,
  },
  {
    name: 'Davis',
    position: { x: 114.22, y: -1729.05, z: 29.2 },
    color: 12,
  },
];
