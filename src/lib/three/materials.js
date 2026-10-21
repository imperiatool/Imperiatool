// The three Imperia materials, shared by charms and covers.
//   raw        → dry pasta: bone-dry matte, semolina grain you can see when zooming
//   aldente    → soft-touch plastic: satin sheen
//   overcooked → soft silicone: velvety, puffy, light passes through the edges
import * as THREE from 'three';

export const MATERIAL_IDS = ['raw', 'aldente', 'overcooked'];

/**
 * Geometry hints per material (used by the builders):
 *   bevel  – how rounded the edges are, depth – thickness, relief – pattern height
 */
export const MATERIAL_SHAPE = {
  raw: { bevel: 0.55, depth: 0.9, relief: 0.9, smoothRelief: 0 },
  aldente: { bevel: 1, depth: 1, relief: 1, smoothRelief: 0 },
  overcooked: { bevel: 1.5, depth: 1.18, relief: 1.25, smoothRelief: 1 },
};

let cache = null;

/* ---------- procedural textures ---------------------------------------- */
function valueNoise(size, octaves, seed = 1) {
  // tileable multi-octave value noise in [0,1]
  let s = seed;
  const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const out = new Float32Array(size * size);
  let amp = 1;
  let total = 0;
  for (let o = 0; o < octaves; o++) {
    const cells = 4 << o;
    const grid = new Float32Array(cells * cells).map(() => rand());
    const g = (x, y) => grid[((y + cells) % cells) * cells + ((x + cells) % cells)];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const fx = (x / size) * cells;
        const fy = (y / size) * cells;
        const x0 = Math.floor(fx);
        const y0 = Math.floor(fy);
        const tx = fx - x0;
        const ty = fy - y0;
        const sx = tx * tx * (3 - 2 * tx);
        const sy = ty * ty * (3 - 2 * ty);
        const a = g(x0, y0) + (g(x0 + 1, y0) - g(x0, y0)) * sx;
        const b = g(x0, y0 + 1) + (g(x0 + 1, y0 + 1) - g(x0, y0 + 1)) * sx;
        out[y * size + x] += (a + (b - a) * sy) * amp;
      }
    }
    total += amp;
    amp *= 0.55;
  }
  for (let i = 0; i < out.length; i++) out[i] /= total;
  return out;
}

function canvasTexture(size, pixel) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    const [r, g, b] = pixel(i);
    img.data[i * 4] = r;
    img.data[i * 4 + 1] = g;
    img.data[i * 4 + 2] = b;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  return tex;
}

function textures() {
  if (cache) return cache;
  const N = 512;
  const fine = valueNoise(N, 6, 7);
  const mottling = valueNoise(N, 3, 99);
  let s = 12345;
  const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);

  // RAW: semolina specks + slight mottling, multiplied over the colour
  const rawMap = canvasTexture(N, (i) => {
    const r = rand();
    let v = 238 + mottling[i] * 17;
    if (r > 0.988) v -= 38 + rand() * 30; // semolina specks
    else if (r > 0.96) v = Math.min(255, v + 10); // flour grains
    return [v, v * 0.985, v * 0.96];
  });
  rawMap.colorSpace = THREE.SRGBColorSpace;
  // RAW: grainy, slightly pitted surface
  const rawBump = canvasTexture(N, (i) => {
    const pit = rand() > 0.97 ? -90 : 0;
    const v = Math.max(0, Math.min(255, (fine[i] - 0.5) * 360 + 128 + (rand() - 0.5) * 120 + pit));
    return [v, v, v];
  });
  const rawRough = canvasTexture(N, (i) => {
    const v = 225 + fine[i] * 30;
    return [v, v, v];
  });
  // OVERCOOKED: very soft orange-peel bump typical of moulded silicone
  const softNoise = valueNoise(N, 3, 3);
  const siliconeBump = canvasTexture(N, (i) => {
    const v = softNoise[i] * 255;
    return [v, v, v];
  });
  cache = { rawMap, rawBump, rawRough, siliconeBump };
  return cache;
}

/**
 * @param hex        base colour from the brand palette
 * @param id         'raw' | 'aldente' | 'overcooked'
 * @param uvRepeat   texture repeats per geometry unit (so grain has a real-world size)
 */
export function makeMaterial(hex, id, uvRepeat = 1 / 8) {
  const color = new THREE.Color(hex);
  const tx = textures();
  const withRepeat = (t) => {
    const c = t.clone();
    c.needsUpdate = true;
    c.repeat.set(uvRepeat, uvRepeat);
    return c;
  };

  if (id === 'raw') {
    // like "al dente" (same colour, soft-touch) with the grain of dry pasta
    // and a slightly less glossy surface
    return new THREE.MeshPhysicalMaterial({
      color,
      map: withRepeat(tx.rawMap),
      bumpMap: withRepeat(tx.rawBump),
      bumpScale: 1.6,
      roughness: 0.52,
      metalness: 0,
      clearcoat: 0.12,
      clearcoatRoughness: 0.55,
    });
  }
  if (id === 'overcooked') {
    // silicone: satin-velvet surface, no hard highlights, light "glow" in the body
    return new THREE.MeshPhysicalMaterial({
      color,
      roughness: 0.72,
      metalness: 0,
      sheen: 1,
      sheenRoughness: 0.32,
      sheenColor: color.clone().lerp(new THREE.Color('#ffffff'), 0.35),
      emissive: color.clone().multiplyScalar(0.09), // light scattering inside the silicone
      bumpMap: withRepeat(tx.siliconeBump),
      bumpScale: 0.6,
    });
  }
  // al dente: soft-touch plastic
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.36,
    metalness: 0,
    clearcoat: 0.32,
    clearcoatRoughness: 0.3,
  });
}

export function disposeMaterial(m) {
  for (const key of ['map', 'bumpMap', 'roughnessMap']) m[key]?.dispose();
  m.dispose();
}
