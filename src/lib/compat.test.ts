import { describe, expect, it } from 'vitest';
import {
  checkBuild,
  estimatedDraw,
  recommendedPsuWattage,
  totalPrice,
  verdict,
  completeness,
  type Build,
} from './compat';
import { cpus, motherboards, rams, gpus, coolers, psus, cases, storages } from '../data/parts';

const byId = <T extends { id: string }>(list: T[], id: string): T => {
  const found = list.find((x) => x.id === id);
  if (!found) throw new Error(`missing fixture ${id}`);
  return found;
};

/** A build that satisfies every rule. */
const good = (): Build => ({
  cpu: byId(cpus, 'cpu-7600'),
  motherboard: byId(motherboards, 'mb-b650-atx'),
  ram: byId(rams, 'ram-ddr5-32'),
  gpu: byId(gpus, 'gpu-4070s'),
  cooler: byId(coolers, 'cool-peer'),
  psu: byId(psus, 'psu-850'),
  pcCase: byId(cases, 'case-airflow'),
  storage: byId(storages, 'ssd-nvme-1t'),
});

const rules = (build: Build) => checkBuild(build).map((i) => i.rule);

describe('checkBuild — happy path', () => {
  it('reports no issues for a coherent build', () => {
    expect(checkBuild(good())).toEqual([]);
  });

  it('treats an empty build as coherent (nothing selected, nothing to conflict)', () => {
    expect(checkBuild({})).toEqual([]);
  });

  it('returns verdict "ok" when there are no issues', () => {
    expect(verdict(checkBuild(good()))).toBe('ok');
  });
});

describe('checkBuild — hard errors', () => {
  it('catches a CPU that does not match the socket', () => {
    const b = good();
    b.cpu = byId(cpus, 'cpu-12400f'); // LGA1700 on an AM5 board
    expect(rules(b)).toContain('cpu-socket');
    expect(verdict(checkBuild(b))).toBe('error');
  });

  it('catches DDR4 memory on a DDR5 board', () => {
    const b = good();
    b.ram = byId(rams, 'ram-ddr4-16');
    expect(rules(b)).toContain('ram-type');
  });

  it('catches a GPU longer than the case allows', () => {
    const b = good();
    b.gpu = byId(gpus, 'gpu-4090'); // 336mm
    b.pcCase = byId(cases, 'case-atx'); // 315mm
    expect(rules(b)).toContain('gpu-length');
  });

  it('catches a cooler taller than the case', () => {
    const b = good();
    b.cooler = byId(coolers, 'cool-d15'); // 165mm
    b.pcCase = byId(cases, 'case-itx'); // 155mm
    expect(rules(b)).toContain('cooler-height');
  });

  it('catches an ATX board in an ITX-only case', () => {
    const b = good();
    b.pcCase = byId(cases, 'case-itx');
    expect(rules(b)).toContain('case-formfactor');
  });

  it('catches a PSU below the estimated draw', () => {
    const b = good();
    b.cpu = byId(cpus, 'cpu-7800x3d');
    b.gpu = byId(gpus, 'gpu-4090');
    b.psu = byId(psus, 'psu-450');
    expect(rules(b)).toContain('psu-under');
  });

  it('catches more RAM modules than the board has slots', () => {
    const b = good();
    b.motherboard = byId(motherboards, 'mb-b660m-itx'); // 2 slots, LGA1700
    b.cpu = byId(cpus, 'cpu-12400f');
    b.ram = { ...byId(rams, 'ram-ddr5-32'), modules: 4 };
    expect(rules(b)).toContain('ram-slots');
  });
});

describe('checkBuild — soft warnings', () => {
  it('warns when RAM is faster than the board supports', () => {
    const b = good();
    b.motherboard = byId(motherboards, 'mb-b650m-matx'); // rated 6200
    b.ram = byId(rams, 'ram-ddr5-32'); // 6000 -> fine
    expect(rules(b)).not.toContain('ram-speed');

    b.ram = { ...byId(rams, 'ram-ddr5-32'), speed: 7000 };
    expect(rules(b)).toContain('ram-speed');
  });

  it('warns rather than errors when the cooler is under-rated for the CPU', () => {
    const b = good();
    b.cooler = byId(coolers, 'cool-stock'); // 95W
    b.cpu = byId(cpus, 'cpu-7800x3d'); // 120W
    const issues = checkBuild(b);
    const hit = issues.find((i) => i.rule === 'cooler-tdp');
    expect(hit?.severity).toBe('warning');
  });

  it('reports every issue at once instead of stopping at the first', () => {
    const b: Build = {
      cpu: byId(cpus, 'cpu-12400f'),
      motherboard: byId(motherboards, 'mb-b550m-am4'),
      ram: byId(rams, 'ram-ddr5-32'),
      gpu: byId(gpus, 'gpu-4090'),
      pcCase: byId(cases, 'case-itx'),
    };
    expect(checkBuild(b).length).toBeGreaterThan(2);
  });
});

describe('power maths', () => {
  it('estimates a heavier build as drawing more', () => {
    const light: Build = { cpu: byId(cpus, 'cpu-12400f'), gpu: byId(gpus, 'gpu-4060') };
    const heavy: Build = { cpu: byId(cpus, 'cpu-7800x3d'), gpu: byId(gpus, 'gpu-4090') };
    expect(estimatedDraw(heavy)).toBeGreaterThan(estimatedDraw(light));
  });

  it('rounds the recommended PSU up to the next 50W with headroom', () => {
    const b = good();
    const rec = recommendedPsuWattage(b);
    expect(rec % 50).toBe(0);
    expect(rec).toBeGreaterThan(estimatedDraw(b));
  });
});

describe('totals', () => {
  it('sums prices across selected parts', () => {
    const b: Build = { cpu: byId(cpus, 'cpu-5600'), ram: byId(rams, 'ram-ddr4-16') };
    expect(totalPrice(b)).toBe(9900 + 3400);
  });

  it('treats an empty build as costing nothing', () => {
    expect(totalPrice({})).toBe(0);
  });

  it('counts how complete the build is', () => {
    expect(completeness({})).toEqual({ selected: 0, total: 8 });
    expect(completeness(good())).toEqual({ selected: 8, total: 8 });
  });
});
