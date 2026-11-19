/**
 * Compatibility rule engine.
 *
 * Design note: every rule is a small pure function that returns issues rather
 * than throwing or short-circuiting. That way the UI can show *all* problems at
 * once, and a failing build still renders instead of collapsing — which is the
 * part most student projects skip.
 */
import type { Cpu, Motherboard, Ram, Gpu, Cooler, Psu, PcCase, Storage } from '../data/parts';

export type Severity = 'error' | 'warning';

export interface Issue {
  severity: Severity;
  /** Stable id so tests can assert on a specific rule. */
  rule: string;
  message: string;
}

export interface Build {
  cpu?: Cpu;
  motherboard?: Motherboard;
  ram?: Ram;
  gpu?: Gpu;
  cooler?: Cooler;
  psu?: Psu;
  pcCase?: PcCase;
  storage?: Storage;
}

/** Rough board power: the parts that always draw something. */
const BASE_DRAW_W = 60;

export function estimatedDraw(build: Build): number {
  const cpu = build.cpu?.tdp ?? 0;
  const gpu = build.gpu?.tdp ?? 0;
  const drives = build.storage ? 8 : 0;
  const ram = build.ram ? build.ram.modules * 3 : 0;
  const fans = 10;
  // CPU and GPU rarely peak together; 0.9 on the combined peak is a sane estimate.
  return Math.round(BASE_DRAW_W + cpu * 0.9 + gpu + drives + ram + fans);
}

/** Recommended PSU = peak estimate + 25% headroom for transient spikes. */
export function recommendedPsuWattage(build: Build): number {
  return Math.ceil((estimatedDraw(build) * 1.25) / 50) * 50;
}

export function checkBuild(build: Build): Issue[] {
  const issues: Issue[] = [];
  const add = (severity: Severity, rule: string, message: string) =>
    issues.push({ severity, rule, message });

  const { cpu, motherboard, ram, gpu, cooler, psu, pcCase, storage } = build;

  // --- CPU / motherboard -------------------------------------------------
  if (cpu && motherboard && cpu.socket !== motherboard.socket) {
    add(
      'error',
      'cpu-socket',
      `${cpu.name} is ${cpu.socket}, but ${motherboard.name} is ${motherboard.socket}. The CPU cannot physically fit.`,
    );
  }

  // --- memory ------------------------------------------------------------
  if (ram && motherboard) {
    if (ram.type !== motherboard.ramType) {
      add(
        'error',
        'ram-type',
        `${ram.name} is ${ram.type}, but the board only accepts ${motherboard.ramType}.`,
      );
    }
    if (ram.modules > motherboard.ramSlots) {
      add(
        'error',
        'ram-slots',
        `${ram.name} needs ${ram.modules} slots, but the board has ${motherboard.ramSlots}.`,
      );
    }
    if (ram.capacityGb > motherboard.maxRamGb) {
      add(
        'error',
        'ram-capacity',
        `${ram.capacityGb}GB exceeds the board's ${motherboard.maxRamGb}GB maximum.`,
      );
    }
    if (ram.type === motherboard.ramType && ram.speed > motherboard.maxRamSpeed) {
      add(
        'warning',
        'ram-speed',
        `${ram.speed}MT/s is above the board's rated ${motherboard.maxRamSpeed}MT/s — it will run at a lower speed.`,
      );
    }
  }

  // --- case / board ------------------------------------------------------
  if (pcCase && motherboard && !pcCase.supportedFormFactors.includes(motherboard.formFactor)) {
    add(
      'error',
      'case-formfactor',
      `${motherboard.name} is ${motherboard.formFactor}; ${pcCase.name} only fits ${pcCase.supportedFormFactors.join(' / ')}.`,
    );
  }

  // --- GPU / case --------------------------------------------------------
  if (gpu && pcCase && gpu.lengthMm > 0) {
    if (gpu.lengthMm > pcCase.maxGpuLengthMm) {
      add(
        'error',
        'gpu-length',
        `${gpu.name} is ${gpu.lengthMm}mm but ${pcCase.name} clears ${pcCase.maxGpuLengthMm}mm.`,
      );
    } else if (pcCase.maxGpuLengthMm - gpu.lengthMm < 15) {
      add(
        'warning',
        'gpu-clearance',
        `Only ${pcCase.maxGpuLengthMm - gpu.lengthMm}mm of GPU clearance left — cable routing will be tight.`,
      );
    }
  }

  // --- cooler ------------------------------------------------------------
  if (cooler && pcCase && cooler.heightMm > pcCase.maxCoolerHeightMm) {
    add(
      'error',
      'cooler-height',
      `${cooler.name} is ${cooler.heightMm}mm tall; ${pcCase.name} allows ${pcCase.maxCoolerHeightMm}mm.`,
    );
  }
  if (cooler && cpu && cooler.supportsTdp < cpu.tdp) {
    add(
      'warning',
      'cooler-tdp',
      `${cooler.name} is rated to ${cooler.supportsTdp}W but ${cpu.name} draws ${cpu.tdp}W. Expect thermal throttling.`,
    );
  }

  // --- storage -----------------------------------------------------------
  if (storage && motherboard && storage.interface === 'NVMe' && motherboard.m2Slots === 0) {
    add('error', 'storage-m2', `${motherboard.name} has no M.2 slot for ${storage.name}.`);
  }

  // --- power -------------------------------------------------------------
  if (psu) {
    const draw = estimatedDraw(build);
    if (psu.wattage < draw) {
      add(
        'error',
        'psu-under',
        `Estimated draw is ${draw}W but the PSU is ${psu.wattage}W. This will shut down under load.`,
      );
    } else if (psu.wattage < recommendedPsuWattage(build)) {
      add(
        'warning',
        'psu-headroom',
        `${psu.wattage}W works, but ${recommendedPsuWattage(build)}W is recommended for transient spikes.`,
      );
    }
  }

  return issues;
}

export function verdict(issues: Issue[]): 'ok' | 'warn' | 'error' {
  if (issues.some((i) => i.severity === 'error')) return 'error';
  if (issues.length > 0) return 'warn';
  return 'ok';
}

export function totalPrice(build: Build): number {
  return Object.values(build).reduce((sum, part) => sum + (part?.price ?? 0), 0);
}

export function completeness(build: Build): { selected: number; total: number } {
  const total = 8;
  const selected = Object.values(build).filter(Boolean).length;
  return { selected, total };
}
