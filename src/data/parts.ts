/**
 * Static part catalogue.
 *
 * Kept as plain data on purpose: no network calls, no API keys, no rate limits,
 * and the rule engine stays deterministic, which is what makes it testable.
 */

export type Socket = 'AM5' | 'LGA1700' | 'AM4';
export type RamType = 'DDR4' | 'DDR5';
export type FormFactor = 'ATX' | 'Micro-ATX' | 'Mini-ITX';
export type StorageInterface = 'NVMe' | 'SATA';

export interface Cpu {
  id: string;
  name: string;
  socket: Socket;
  tdp: number;
  cores: number;
  price: number;
}

export interface Motherboard {
  id: string;
  name: string;
  socket: Socket;
  ramType: RamType;
  formFactor: FormFactor;
  ramSlots: number;
  maxRamGb: number;
  maxRamSpeed: number;
  m2Slots: number;
  price: number;
}

export interface Ram {
  id: string;
  name: string;
  type: RamType;
  capacityGb: number;
  speed: number;
  modules: number;
  price: number;
}

export interface Gpu {
  id: string;
  name: string;
  tdp: number;
  lengthMm: number;
  price: number;
}

export interface Cooler {
  id: string;
  name: string;
  heightMm: number;
  supportsTdp: number;
  price: number;
}

export interface Psu {
  id: string;
  name: string;
  wattage: number;
  efficiency: string;
  price: number;
}

export interface PcCase {
  id: string;
  name: string;
  supportedFormFactors: FormFactor[];
  maxGpuLengthMm: number;
  maxCoolerHeightMm: number;
  price: number;
}

export interface Storage {
  id: string;
  name: string;
  interface: StorageInterface;
  capacityGb: number;
  price: number;
}

export const cpus: Cpu[] = [
  { id: 'cpu-7600', name: 'AMD Ryzen 5 7600', socket: 'AM5', tdp: 65, cores: 6, price: 19900 },
  { id: 'cpu-7800x3d', name: 'AMD Ryzen 7 7800X3D', socket: 'AM5', tdp: 120, cores: 8, price: 37900 },
  { id: 'cpu-12400f', name: 'Intel Core i5-12400F', socket: 'LGA1700', tdp: 65, cores: 6, price: 12400 },
  { id: 'cpu-13600k', name: 'Intel Core i5-13600K', socket: 'LGA1700', tdp: 125, cores: 14, price: 26500 },
  { id: 'cpu-5600', name: 'AMD Ryzen 5 5600', socket: 'AM4', tdp: 65, cores: 6, price: 9900 },
];

export const motherboards: Motherboard[] = [
  {
    id: 'mb-b650-atx',
    name: 'MSI B650 Tomahawk (ATX)',
    socket: 'AM5',
    ramType: 'DDR5',
    formFactor: 'ATX',
    ramSlots: 4,
    maxRamGb: 128,
    maxRamSpeed: 6400,
    m2Slots: 3,
    price: 21500,
  },
  {
    id: 'mb-b650m-matx',
    name: 'ASRock B650M Pro RS (mATX)',
    socket: 'AM5',
    ramType: 'DDR5',
    formFactor: 'Micro-ATX',
    ramSlots: 4,
    maxRamGb: 128,
    maxRamSpeed: 6200,
    m2Slots: 2,
    price: 14200,
  },
  {
    id: 'mb-b660m-itx',
    name: 'Gigabyte B660I AORUS (ITX)',
    socket: 'LGA1700',
    ramType: 'DDR5',
    formFactor: 'Mini-ITX',
    ramSlots: 2,
    maxRamGb: 64,
    maxRamSpeed: 6000,
    m2Slots: 2,
    price: 18900,
  },
  {
    id: 'mb-b760-atx',
    name: 'ASUS B760-Plus (ATX)',
    socket: 'LGA1700',
    ramType: 'DDR5',
    formFactor: 'ATX',
    ramSlots: 4,
    maxRamGb: 128,
    maxRamSpeed: 6800,
    m2Slots: 3,
    price: 17600,
  },
  {
    id: 'mb-b550m-am4',
    name: 'MSI B550M Pro-VDH (mATX)',
    socket: 'AM4',
    ramType: 'DDR4',
    formFactor: 'Micro-ATX',
    ramSlots: 4,
    maxRamGb: 128,
    maxRamSpeed: 4400,
    m2Slots: 1,
    price: 8900,
  },
];

export const rams: Ram[] = [
  { id: 'ram-ddr5-16', name: '16GB DDR5-5600 (2×8)', type: 'DDR5', capacityGb: 16, speed: 5600, modules: 2, price: 4900 },
  { id: 'ram-ddr5-32', name: '32GB DDR5-6000 (2×16)', type: 'DDR5', capacityGb: 32, speed: 6000, modules: 2, price: 8900 },
  { id: 'ram-ddr5-64', name: '64GB DDR5-6000 (2×32)', type: 'DDR5', capacityGb: 64, speed: 6000, modules: 2, price: 18900 },
  { id: 'ram-ddr4-16', name: '16GB DDR4-3200 (2×8)', type: 'DDR4', capacityGb: 16, speed: 3200, modules: 2, price: 3400 },
  { id: 'ram-ddr4-32', name: '32GB DDR4-3600 (2×16)', type: 'DDR4', capacityGb: 32, speed: 3600, modules: 2, price: 6200 },
];

export const gpus: Gpu[] = [
  { id: 'gpu-igpu', name: 'No dedicated GPU (integrated)', tdp: 0, lengthMm: 0, price: 0 },
  { id: 'gpu-4060', name: 'GeForce RTX 4060', tdp: 115, lengthMm: 244, price: 27900 },
  { id: 'gpu-4070s', name: 'GeForce RTX 4070 Super', tdp: 220, lengthMm: 305, price: 58900 },
  { id: 'gpu-7800xt', name: 'Radeon RX 7800 XT', tdp: 263, lengthMm: 267, price: 46900 },
  { id: 'gpu-4090', name: 'GeForce RTX 4090', tdp: 450, lengthMm: 336, price: 159900 },
];

export const coolers: Cooler[] = [
  { id: 'cool-stock', name: 'Stock cooler', heightMm: 70, supportsTdp: 95, price: 0 },
  { id: 'cool-peer', name: 'Thermalright Peerless Assassin', heightMm: 155, supportsTdp: 245, price: 2900 },
  { id: 'cool-d15', name: 'Noctua NH-D15', heightMm: 165, supportsTdp: 250, price: 9900 },
  { id: 'cool-240aio', name: 'DeepCool 240mm AIO', heightMm: 55, supportsTdp: 280, price: 7500 },
];

export const psus: Psu[] = [
  { id: 'psu-450', name: '450W 80+ Bronze', wattage: 450, efficiency: 'Bronze', price: 2900 },
  { id: 'psu-650', name: '650W 80+ Gold', wattage: 650, efficiency: 'Gold', price: 5900 },
  { id: 'psu-750', name: '750W 80+ Gold', wattage: 750, efficiency: 'Gold', price: 7900 },
  { id: 'psu-850', name: '850W 80+ Gold', wattage: 850, efficiency: 'Gold', price: 10900 },
  { id: 'psu-1000', name: '1000W 80+ Platinum', wattage: 1000, efficiency: 'Platinum', price: 15900 },
];

export const cases: PcCase[] = [
  {
    id: 'case-itx',
    name: 'Cooler Master NR200 (ITX)',
    supportedFormFactors: ['Mini-ITX'],
    maxGpuLengthMm: 330,
    maxCoolerHeightMm: 155,
    price: 6900,
  },
  {
    id: 'case-matx',
    name: 'DeepCool CH370 (mATX)',
    supportedFormFactors: ['Micro-ATX', 'Mini-ITX'],
    maxGpuLengthMm: 320,
    maxCoolerHeightMm: 165,
    price: 4900,
  },
  {
    id: 'case-atx',
    name: 'Fractal Meshify C (ATX)',
    supportedFormFactors: ['ATX', 'Micro-ATX', 'Mini-ITX'],
    maxGpuLengthMm: 315,
    maxCoolerHeightMm: 172,
    price: 8900,
  },
  {
    id: 'case-airflow',
    name: 'Lian Li Lancool 216 (ATX)',
    supportedFormFactors: ['ATX', 'Micro-ATX', 'Mini-ITX'],
    maxGpuLengthMm: 392,
    maxCoolerHeightMm: 180,
    price: 7900,
  },
];

export const storages: Storage[] = [
  { id: 'ssd-sata-500', name: '500GB SATA SSD', interface: 'SATA', capacityGb: 500, price: 2900 },
  { id: 'ssd-nvme-1t', name: '1TB NVMe Gen4 SSD', interface: 'NVMe', capacityGb: 1000, price: 5900 },
  { id: 'ssd-nvme-2t', name: '2TB NVMe Gen4 SSD', interface: 'NVMe', capacityGb: 2000, price: 11900 },
];
