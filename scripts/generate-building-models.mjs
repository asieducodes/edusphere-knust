/**
 * EduSphere — scripts/generate-building-models.mjs
 * -----------------------------------------------------------------------
 * Dev-only. Builds the low-poly 3D diorama models (.glb) for the Map
 * screen's building previews and writes them to assets/models/.
 *
 *   node scripts/generate-building-models.mjs
 *
 * Each model is bespoke geometry authored against a real reference photo
 * in assets/reference-photos/ (Wikimedia Commons, CC0 / CC BY-SA — see
 * src/data/campusBuildings.ts for attribution):
 *
 *   mainLibrary      Prempeh II Library — wide 5-storey slab, ribbed cream
 *                    facade over dark window bands, gold roof lettering
 *   libraryMall      Library Mall — stepped cream block, mustard panels,
 *                    scattered windows, glass stair slot, entrance ramp
 *   tent             Petroleum Building — orange-banded 5-storey slab, cream
 *                    stair towers, front car canopies; study shed behind
 *   auditorium       Kumapley Building — broad gable hall, cream facade
 *                    panels between gold pilasters, open colonnade
 *   aeroplaneLibrary Aeroplane Building (CoE Library) — 4-storey walkway
 *                    slab + the red/cream jet trainer parked on the lawn
 *   studySpot        Generic open-air study kiosk (ICT Centre + fallback)
 *
 * Colors are art-directed from the photos. Materials are flat PBR colors
 * (no textures) so the models load in React Native without any image
 * decoding; detail comes from real geometry (bands, columns, fins, the
 * aircraft) and the R3F scene's theme-aware lighting.
 * -----------------------------------------------------------------------
 */

import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Document, NodeIO } from '@gltf-transform/core';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'assets', 'models');

// -----------------------------------------------------------------------
// PALETTE — sampled from the reference photos
// -----------------------------------------------------------------------
const C = {
  cream: '#F1E7D0', // KNUST's signature warm cream walls
  creamDark: '#E2D5B8',
  amber: '#D9A62E', // balcony bands / columns (Petroleum, Aeroplane bldgs)
  mustard: '#B08728', // Library Mall's darker ochre panels
  concrete: '#CFC9BD', // Prempeh II brutalist fins
  glass: '#2E3641', // dark glazing
  glassBlue: '#3A4A5A', // curtain-wall glass (Main Library)
  roofGrey: '#AEB2B8', // Kumapley metal roof
  roofGreen: '#6E8F68', // PB tent's green pitched roof
  brick: '#A9705A', // tent's brick half-walls, paver tint base
  paver: '#C4A882', // brick-paver forecourts
  path: '#D8CDB6', // concrete walkways
  asphalt: '#5A5D63',
  white: '#F5F4EF', // railings, curbs
  soil: '#9C7A54', // platform side
  grass: '#7FB069',
  grassDark: '#6A9A58',
  foliage: '#5E9C55',
  foliageLight: '#79B368',
  palmGreen: '#4E8A4A',
  trunk: '#8A6644',
  timber: '#7A5A3A', // tent posts
  planeCream: '#EDE4D0',
  planeRed: '#C23B2E',
  steel: '#8D9299',
  solar: '#2C3E55',
};

/** sRGB hex -> linear-space RGBA for glTF baseColorFactor. */
function linColor(hex) {
  const n = parseInt(hex.slice(1), 16);
  const srgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
  return [...srgb.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)), 1];
}

// -----------------------------------------------------------------------
// GEOMETRY PRIMITIVES
// Vertices are duplicated per face; normals are recomputed flat after
// transforms, so generators only emit positions + indices.
// -----------------------------------------------------------------------

/** Unit box centered at origin, 1x1x1. */
function boxGeom() {
  const p = [];
  const idx = [];
  const faces = [
    // [axis, sign] -> 4 corners CCW seen from outside
    [[-0.5, -0.5, 0.5], [0.5, -0.5, 0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5]], // +Z
    [[0.5, -0.5, -0.5], [-0.5, -0.5, -0.5], [-0.5, 0.5, -0.5], [0.5, 0.5, -0.5]], // -Z
    [[0.5, -0.5, 0.5], [0.5, -0.5, -0.5], [0.5, 0.5, -0.5], [0.5, 0.5, 0.5]], // +X
    [[-0.5, -0.5, -0.5], [-0.5, -0.5, 0.5], [-0.5, 0.5, 0.5], [-0.5, 0.5, -0.5]], // -X
    [[-0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 0.5, -0.5], [-0.5, 0.5, -0.5]], // +Y
    [[-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, 0.5], [-0.5, -0.5, 0.5]], // -Y
  ];
  for (const f of faces) {
    const base = p.length / 3;
    for (const v of f) p.push(...v);
    idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  return { positions: p, indices: idx };
}

/** Triangular prism ("gable"): ridge along X at the top. 1 wide (X), 1 deep (Z), 1 tall. */
function wedgeGeom() {
  const A = [-0.5, -0.5, 0.5]; // front-left-bottom
  const B = [0.5, -0.5, 0.5];
  const Cc = [0.5, -0.5, -0.5];
  const D = [-0.5, -0.5, -0.5];
  const E = [-0.5, 0.5, 0]; // ridge left
  const F = [0.5, 0.5, 0]; // ridge right
  const p = [];
  const idx = [];
  const quad = (a, b, c, d) => {
    const base = p.length / 3;
    p.push(...a, ...b, ...c, ...d);
    idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  };
  const tri = (a, b, c) => {
    const base = p.length / 3;
    p.push(...a, ...b, ...c);
    idx.push(base, base + 1, base + 2);
  };
  quad(A, B, F, E); // front slope (+Z)
  quad(Cc, D, E, F); // back slope (-Z)
  quad(D, Cc, B, A); // bottom
  tri(B, Cc, F); // right gable end (+X)
  tri(D, A, E); // left gable end (-X)
  return { positions: p, indices: idx };
}

/** Cylinder: radius 0.5, height 1, centered at origin, faceted sides + caps. */
function cylinderGeom(segments = 14) {
  const p = [];
  const idx = [];
  const ring = (t) =>
    Array.from({ length: segments }, (_, i) => {
      const a = (i / segments) * Math.PI * 2;
      return [Math.cos(a) * 0.5, t, Math.sin(a) * 0.5];
    });
  const bot = ring(-0.5);
  const top = ring(0.5);
  for (let i = 0; i < segments; i++) {
    const j = (i + 1) % segments;
    const base = p.length / 3;
    p.push(...bot[i], ...bot[j], ...top[j], ...top[i]);
    idx.push(base, base + 2, base + 1, base, base + 3, base + 2);
  }
  for (const [y, pts, flip] of [[0.5, top, false], [-0.5, bot, true]]) {
    const center = p.length / 3;
    p.push(0, y, 0);
    const start = p.length / 3;
    for (const v of pts) p.push(...v);
    for (let i = 0; i < segments; i++) {
      const j = (i + 1) % segments;
      if (flip) idx.push(center, start + i, start + j);
      else idx.push(center, start + j, start + i);
    }
  }
  return { positions: p, indices: idx };
}

/** Cone: base radius 0.5 at y=-0.5, apex at y=+0.5. */
function coneGeom(segments = 12) {
  const p = [];
  const idx = [];
  const base = Array.from({ length: segments }, (_, i) => {
    const a = (i / segments) * Math.PI * 2;
    return [Math.cos(a) * 0.5, -0.5, Math.sin(a) * 0.5];
  });
  for (let i = 0; i < segments; i++) {
    const j = (i + 1) % segments;
    const b = p.length / 3;
    p.push(0, 0.5, 0, ...base[j], ...base[i]);
    idx.push(b, b + 1, b + 2);
  }
  const center = p.length / 3;
  p.push(0, -0.5, 0);
  const start = p.length / 3;
  for (const v of base) p.push(...v);
  for (let i = 0; i < segments; i++) {
    const j = (i + 1) % segments;
    idx.push(center, start + i, start + j);
  }
  return { positions: p, indices: idx };
}

/** Faceted UV sphere, radius 0.5. */
function sphereGeom(wSeg = 10, hSeg = 7) {
  const p = [];
  const idx = [];
  const pt = (iy, ix) => {
    const v = iy / hSeg;
    const u = ix / wSeg;
    const phi = v * Math.PI;
    const theta = u * Math.PI * 2;
    return [
      -0.5 * Math.sin(phi) * Math.cos(theta),
      0.5 * Math.cos(phi),
      0.5 * Math.sin(phi) * Math.sin(theta),
    ];
  };
  for (let iy = 0; iy < hSeg; iy++) {
    for (let ix = 0; ix < wSeg; ix++) {
      const a = pt(iy, ix);
      const b = pt(iy + 1, ix);
      const c = pt(iy + 1, ix + 1);
      const d = pt(iy, ix + 1);
      const base = p.length / 3;
      p.push(...a, ...b, ...c, ...d);
      idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }
  }
  return { positions: p, indices: idx };
}

const GEOM = {
  box: boxGeom(),
  wedge: wedgeGeom(),
  cylinder: cylinderGeom(),
  cylinderFine: cylinderGeom(20),
  cone: coneGeom(),
  sphere: sphereGeom(),
};

// -----------------------------------------------------------------------
// SCENE ASSEMBLY
// -----------------------------------------------------------------------

/**
 * A "part" is one primitive instance: geometry + color + TRS transform.
 * Transform order: scale, then rotate X→Y→Z, then translate.
 */
function part(geom, color, { t = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1] } = {}) {
  return { geom, color, t, r, s };
}

function transformPositions(positions, { t, r, s }) {
  const [rx, ry, rz] = r;
  const [cx, sx] = [Math.cos(rx), Math.sin(rx)];
  const [cy, sy] = [Math.cos(ry), Math.sin(ry)];
  const [cz, sz] = [Math.cos(rz), Math.sin(rz)];
  const out = new Float32Array(positions.length);
  for (let i = 0; i < positions.length; i += 3) {
    let x = positions[i] * s[0];
    let y = positions[i + 1] * s[1];
    let z = positions[i + 2] * s[2];
    // rotate X
    let y1 = y * cx - z * sx;
    let z1 = y * sx + z * cx;
    y = y1; z = z1;
    // rotate Y
    let x1 = x * cy + z * sy;
    z1 = -x * sy + z * cy;
    x = x1; z = z1;
    // rotate Z
    x1 = x * cz - y * sz;
    y1 = x * sz + y * cz;
    x = x1; y = y1;
    out[i] = x + t[0];
    out[i + 1] = y + t[1];
    out[i + 2] = z + t[2];
  }
  return out;
}

function flatNormals(positions, indices) {
  const normals = new Float32Array(positions.length);
  for (let i = 0; i < indices.length; i += 3) {
    const [a, b, c] = [indices[i] * 3, indices[i + 1] * 3, indices[i + 2] * 3];
    const ux = positions[b] - positions[a];
    const uy = positions[b + 1] - positions[a + 1];
    const uz = positions[b + 2] - positions[a + 2];
    const vx = positions[c] - positions[a];
    const vy = positions[c + 1] - positions[a + 1];
    const vz = positions[c + 2] - positions[a + 2];
    let nx = uy * vz - uz * vy;
    let ny = uz * vx - ux * vz;
    let nz = ux * vy - uy * vx;
    const len = Math.hypot(nx, ny, nz) || 1;
    nx /= len; ny /= len; nz /= len;
    for (const v of [a, b, c]) {
      normals[v] = nx;
      normals[v + 1] = ny;
      normals[v + 2] = nz;
    }
  }
  return normals;
}

/** Merge parts into per-color buckets and write one GLB. */
async function writeModel(name, parts) {
  const buckets = new Map();
  for (const pt of parts) {
    if (!buckets.has(pt.color)) buckets.set(pt.color, { positions: [], indices: [] });
    const bucket = buckets.get(pt.color);
    const transformed = transformPositions(pt.geom.positions, pt);
    const offset = bucket.positions.length / 3;
    for (const v of transformed) bucket.positions.push(v);
    for (const i of pt.geom.indices) bucket.indices.push(i + offset);
  }

  const doc = new Document();
  doc.createBuffer();
  const scene = doc.createScene(name);
  const mesh = doc.createMesh(name);
  for (const [color, { positions, indices }] of buckets) {
    const pos = new Float32Array(positions);
    const idx = positions.length / 3 > 65535 ? new Uint32Array(indices) : new Uint16Array(indices);
    const material = doc
      .createMaterial(color)
      .setBaseColorFactor(linColor(color))
      .setMetallicFactor(0)
      .setRoughnessFactor(color === C.glass || color === C.glassBlue ? 0.25 : 0.9);
    const prim = doc
      .createPrimitive()
      .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(pos).setBuffer(doc.getRoot().listBuffers()[0]))
      .setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(flatNormals(pos, idx)).setBuffer(doc.getRoot().listBuffers()[0]))
      .setIndices(doc.createAccessor().setType('SCALAR').setArray(idx).setBuffer(doc.getRoot().listBuffers()[0]))
      .setMaterial(material);
    mesh.addPrimitive(prim);
  }
  scene.addChild(doc.createNode(name).setMesh(mesh));

  const path = join(OUT_DIR, `${name}.glb`);
  await new NodeIO().write(path, doc);
  const tris = [...buckets.values()].reduce((n, b) => n + b.indices.length / 3, 0);
  console.log(`  ${name}.glb  (${buckets.size} materials, ${tris} tris)`);
}

// -----------------------------------------------------------------------
// SHARED DECOR
// -----------------------------------------------------------------------

/** Floating platform: soil drum with a grass top disc. Top surface is y=0. */
function platform(radius) {
  return [
    part(GEOM.cylinderFine, C.soil, { t: [0, -0.62, 0], s: [radius * 2, 1.2, radius * 2] }),
    part(GEOM.cylinderFine, C.grass, { t: [0, -0.05, 0], s: [radius * 2 * 0.995, 0.14, radius * 2 * 0.995] }),
  ];
}

function tree(x, z, sc = 1) {
  return [
    part(GEOM.cylinder, C.trunk, { t: [x, 0.28 * sc, z], s: [0.16 * sc, 0.56 * sc, 0.16 * sc] }),
    part(GEOM.sphere, C.foliage, { t: [x, 0.72 * sc, z], s: [0.9 * sc, 0.72 * sc, 0.9 * sc] }),
    part(GEOM.sphere, C.foliageLight, { t: [x + 0.1 * sc, 1.06 * sc, z - 0.06 * sc], s: [0.55 * sc, 0.45 * sc, 0.55 * sc] }),
  ];
}

function palm(x, z, sc = 1) {
  const parts = [
    part(GEOM.cylinder, C.trunk, { t: [x, 1.05 * sc, z], s: [0.11 * sc, 2.1 * sc, 0.11 * sc] }),
  ];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    parts.push(
      part(GEOM.box, C.palmGreen, {
        t: [x + Math.cos(a) * 0.34 * sc, 2.12 * sc, z + Math.sin(a) * 0.34 * sc],
        r: [Math.sin(a) * 0.55, -a, Math.cos(a) * 0.55],
        s: [0.85 * sc, 0.035 * sc, 0.2 * sc],
      })
    );
  }
  return parts;
}

function hedge(x, z, w, d, h = 0.32) {
  return [part(GEOM.box, C.grassDark, { t: [x, h / 2, z], s: [w, h, d] })];
}

function lamp(x, z) {
  return [
    part(GEOM.cylinder, C.steel, { t: [x, 0.8, z], s: [0.06, 1.6, 0.06] }),
    part(GEOM.box, C.white, { t: [x, 1.62, z], s: [0.22, 0.08, 0.12] }),
  ];
}

// -----------------------------------------------------------------------
// BUILDINGS
// -----------------------------------------------------------------------

/** Prempeh II Library — wide 5-storey slab straight from the front-elevation
 *  photo: recessed dark ground floor with bronze louvres and the green
 *  entrance sign, four dark window bands under a rhythm of narrow cream
 *  fins, spandrel shadow lines, parapet, and the gold "PREMPEH II LIBRARY"
 *  lettering on the roof. Central walkway with hedges, lamps, and the
 *  flanking mango trees. */
function mainLibrary() {
  const parts = [...platform(9)];

  // Recessed ground floor: darker plinth, glazed entrance, bronze louvres
  parts.push(part(GEOM.box, C.creamDark, { t: [0, 0.525, -1.2], s: [12.0, 1.05, 4.4] }));
  parts.push(part(GEOM.box, C.glass, { t: [0, 0.5, 0.99], s: [3.2, 0.9, 0.24] }));
  for (const px of [-2.9, -4.7, 2.9, 4.7]) {
    parts.push(part(GEOM.box, C.trunk, { t: [px, 0.55, 1.02], s: [1.4, 0.72, 0.14] }));
  }
  // Green "PREMPEH II LIBRARY" sign board beside the entrance
  parts.push(part(GEOM.box, C.grassDark, { t: [2.05, 0.64, 1.14], s: [0.95, 0.5, 0.08] }));

  // Main slab, floors 1–4
  parts.push(part(GEOM.box, C.cream, { t: [0, 3.0, -1.2], s: [12.4, 3.9, 4.6] }));
  for (let floor = 0; floor < 4; floor++) {
    const y = 1.62 + floor * 0.86;
    // Dark window band, front and back
    parts.push(part(GEOM.box, C.glass, { t: [0, y, 1.12], s: [11.9, 0.5, 0.1] }));
    parts.push(part(GEOM.box, C.glass, { t: [0, y, -3.52], s: [11.9, 0.5, 0.1] }));
    // Narrow cream fins across the front band — the facade's vertical ribbing
    for (let i = 0; i < 19; i++) {
      parts.push(part(GEOM.box, C.cream, { t: [-5.4 + i * 0.6, y, 1.19], s: [0.14, 0.56, 0.1] }));
    }
    // Spandrel shadow line above each band
    parts.push(part(GEOM.box, C.creamDark, { t: [0, y + 0.47, -1.2], s: [12.5, 0.08, 4.66] }));
  }

  // Parapet cap + small rooftop stair head (left, as in the photo)
  parts.push(part(GEOM.box, C.creamDark, { t: [0, 5.04, -1.2], s: [12.6, 0.18, 4.8] }));
  parts.push(part(GEOM.box, C.cream, { t: [-4.6, 5.43, -1.8], s: [1.6, 0.6, 1.6] }));

  // Gold roof lettering — blocks pacing out "PREMPEH II LIBRARY", standing
  // tall on the parapet's front edge so they read against the sky
  let cx = -4.6;
  for (const w of [0.42, 0.42, 0.42, 0.42, 0.42, 0.42, 0.42, 0.18, 0.18, 0.42, 0.42, 0.42, 0.42, 0.42, 0.42, 0.42]) {
    parts.push(part(GEOM.box, C.amber, { t: [cx + w / 2, 5.48, 1.05], s: [w, 0.52, 0.14] }));
    cx += w + (w < 0.3 ? 0.14 : 0.2);
  }

  // Entrance canopy + posts
  parts.push(part(GEOM.box, C.white, { t: [0, 1.08, 1.7], s: [3.6, 0.12, 1.2] }));
  for (const px of [-1.5, 1.5]) {
    parts.push(part(GEOM.cylinder, C.concrete, { t: [px, 0.52, 2.2], s: [0.12, 1.04, 0.12] }));
  }

  // Grounds: central walkway, flanking hedges, lamps, mango trees
  parts.push(part(GEOM.box, C.path, { t: [0, 0.045, 4.6], s: [1.9, 0.09, 6.4] }));
  parts.push(...hedge(1.7, 4.3, 0.7, 4.6), ...hedge(-1.7, 4.3, 0.7, 4.6));
  parts.push(...hedge(4.4, 1.9, 3.4, 0.5), ...hedge(-4.4, 1.9, 3.4, 0.5));
  parts.push(...lamp(2.6, 3.4), ...lamp(-2.6, 3.4), ...lamp(2.6, 6.2), ...lamp(-2.6, 6.2));
  parts.push(...tree(7.0, 1.4, 1.2), ...tree(-7.0, 1.4, 1.2), ...tree(-6.0, 3.6, 0.95), ...tree(6.0, 3.6, 0.95));
  return parts;
}

/** Library Mall — stepped cream block, mustard panels, scattered windows. */
function libraryMall() {
  const parts = [...platform(9)];

  // Massing: main block + stepped wings
  parts.push(part(GEOM.box, C.cream, { t: [-0.4, 3.1, -0.6], s: [9.6, 6.2, 5.6] }));
  parts.push(part(GEOM.box, C.cream, { t: [-6.4, 2.6, -0.4], s: [3.4, 5.2, 4.8] }));
  parts.push(part(GEOM.box, C.cream, { t: [5.7, 2.1, -0.6], s: [2.8, 4.2, 4.6] }));
  // Parapet copings
  parts.push(part(GEOM.box, C.creamDark, { t: [-0.4, 6.26, -0.6], s: [9.8, 0.16, 5.8] }));
  parts.push(part(GEOM.box, C.creamDark, { t: [-6.4, 5.26, -0.4], s: [3.6, 0.16, 5.0] }));
  parts.push(part(GEOM.box, C.creamDark, { t: [5.7, 4.26, -0.6], s: [3.0, 0.16, 4.8] }));

  // Mustard facade fields (the big ochre panels in the photo)
  const front = 2.26;
  parts.push(part(GEOM.box, C.mustard, { t: [1.7, 4.4, front], s: [3.4, 2.6, 0.1] }));
  parts.push(part(GEOM.box, C.mustard, { t: [-2.6, 2.4, front], s: [2.2, 3.2, 0.1] }));
  parts.push(part(GEOM.box, C.mustard, { t: [2.5, 1.15, front], s: [2.6, 1.7, 0.1] }));
  parts.push(part(GEOM.box, C.mustard, { t: [-6.4, 3.4, 2.06], s: [1.8, 2.4, 0.1] }));

  // Scattered rectangular windows (irregular grid, like the photo)
  const windows = [
    [-4.1, 5.3], [-3.0, 5.3], [-1.2, 5.3], [0.3, 5.3], [3.6, 5.3],
    [-4.2, 3.9], [-0.9, 3.9], [0.4, 3.9], [3.9, 3.7],
    [-4.2, 2.3], [-0.6, 2.5], [1.4, 2.6], [3.9, 2.2],
    [-3.4, 0.9], [-1.4, 0.9], [0.6, 0.8], [3.7, 0.9],
    [-6.9, 4.6], [-5.9, 4.6], [-6.9, 1.6], [-5.9, 1.6],
    [5.2, 3.3], [6.2, 3.3], [5.7, 1.5],
  ];
  for (const [wx, wy] of windows) {
    parts.push(part(GEOM.box, C.glass, { t: [wx, wy, front + 0.02], s: [0.62, 0.95, 0.07] }));
  }

  // Vertical glass stair slot with amber frame
  parts.push(part(GEOM.box, C.amber, { t: [-0.05, 3.2, front + 0.04], s: [1.06, 5.6, 0.1] }));
  parts.push(part(GEOM.box, C.glass, { t: [-0.05, 3.2, front + 0.1], s: [0.82, 5.3, 0.07] }));

  // Roof solar strips
  for (let i = 0; i < 4; i++) {
    parts.push(
      part(GEOM.box, C.solar, {
        t: [-3.2 + i * 1.9, 6.42, -0.7], r: [-0.16, 0, 0], s: [1.5, 0.06, 2.4],
      })
    );
  }

  // Entrance ramp with white railings + low perimeter wall
  parts.push(part(GEOM.box, C.path, { t: [-4.5, 0.22, 3.6], r: [0, 0, 0.075], s: [3.4, 0.14, 1.2] }));
  parts.push(part(GEOM.box, C.white, { t: [-4.5, 0.62, 4.14], r: [0, 0, 0.075], s: [3.4, 0.06, 0.06] }));
  parts.push(part(GEOM.box, C.white, { t: [-4.5, 0.62, 3.06], r: [0, 0, 0.075], s: [3.4, 0.06, 0.06] }));
  parts.push(part(GEOM.box, C.creamDark, { t: [1.6, 0.3, 5.6], s: [9.5, 0.6, 0.24] }));
  parts.push(part(GEOM.box, C.amber, { t: [1.6, 0.64, 5.6], s: [9.6, 0.09, 0.3] }));

  parts.push(...tree(7.4, 2.6, 0.95), ...tree(-7.9, 3.4, 0.8));
  parts.push(...lamp(3.4, 4.9), ...lamp(-1.8, 4.9));
  return parts;
}

/** Petroleum Building + the "PB Tent" study shed, from the user's photo:
 *  orange/gold banded 5-storey slab with cream stair towers at both ends,
 *  perforated screen strips, AC units, green canvas car canopies on steel
 *  posts along the brick-paved front — and the study shed sits BEHIND the
 *  building, where it actually is. */
function tent() {
  const parts = [...platform(9)];

  // 5-storey slab — the orange balcony bands dominate and wrap the corners
  const B = { w: 9.6, d: 4.0, floorH: 1.06 };
  parts.push(part(GEOM.box, C.cream, { t: [0, 2.75, -0.6], s: [B.w, 5.5, B.d] }));
  const zF = -0.6 + B.d / 2; // front face
  for (let floor = 0; floor < 5; floor++) {
    const y = 0.62 + floor * B.floorH;
    parts.push(part(GEOM.box, C.amber, { t: [0, y, zF + 0.02], s: [B.w + 0.3, 0.55, 0.18] }));
    parts.push(part(GEOM.box, C.amber, { t: [0, y, -0.6 - B.d / 2 - 0.02], s: [B.w + 0.3, 0.55, 0.18] }));
    for (const sx of [-1, 1]) {
      parts.push(part(GEOM.box, C.amber, { t: [sx * (B.w / 2 + 0.02), y, -0.6], s: [0.18, 0.55, B.d + 0.3] }));
    }
    // window strip above each band
    parts.push(part(GEOM.box, C.glass, { t: [0, y + 0.55, zF + 0.01], s: [B.w - 0.5, 0.44, 0.07] }));
  }
  // Perforated ochre screen columns interrupting the window bays
  for (const sx of [-1.2, 2.1]) {
    parts.push(part(GEOM.box, C.mustard, { t: [sx, 2.9, zF + 0.06], s: [0.64, 4.6, 0.08] }));
  }
  // AC units clinging to the bands (photo detail)
  for (const [ax, ay] of [[-2.8, 1.15], [0.3, 2.2], [3.1, 1.15], [-1.6, 3.25], [3.6, 3.25], [1.2, 4.3]]) {
    parts.push(part(GEOM.box, C.white, { t: [ax, ay, zF + 0.16], s: [0.34, 0.26, 0.2] }));
  }
  // Cream stair towers at both ends, slightly taller, tiny window slots
  for (const sx of [-1, 1]) {
    const tx = sx * (B.w / 2 + 0.7);
    parts.push(part(GEOM.box, C.cream, { t: [tx, 2.95, -0.6], s: [1.5, 5.9, 3.2] }));
    parts.push(part(GEOM.box, C.creamDark, { t: [tx, 5.94, -0.6], s: [1.62, 0.12, 3.32] }));
    for (let i = 0; i < 3; i++) {
      parts.push(part(GEOM.box, C.glass, { t: [tx, 1.4 + i * 1.5, zF - 0.35], s: [0.5, 0.5, 0.08] }));
    }
  }
  parts.push(part(GEOM.box, C.creamDark, { t: [0, 5.54, -0.6], s: [B.w + 0.4, 0.14, B.d + 0.4] })); // parapet

  // Green canvas car canopies on steel posts along the front (photo detail)
  for (const [cx, tilt] of [[-2.2, 0.1], [2.4, 0.1]]) {
    parts.push(part(GEOM.box, C.roofGreen, { t: [cx, 1.52, 2.7], r: [tilt, 0, 0], s: [4.2, 0.1, 1.7] }));
    for (const px of [cx - 1.8, cx + 1.8]) {
      parts.push(part(GEOM.cylinder, C.steel, { t: [px, 0.72, 3.3], s: [0.09, 1.5, 0.09] }));
    }
  }
  // A couple of parked cars under the canopy
  for (const [carX, body] of [[-2.4, C.planeRed], [1.9, C.steel]]) {
    parts.push(part(GEOM.box, body, { t: [carX, 0.32, 2.6], s: [1.6, 0.36, 0.82] }));
    parts.push(part(GEOM.box, C.glass, { t: [carX - 0.1, 0.62, 2.6], s: [0.9, 0.28, 0.74] }));
  }

  // Brick-paver forecourt with white curb
  parts.push(part(GEOM.box, C.paver, { t: [0.4, 0.04, 3.6], s: [11.0, 0.09, 4.6] }));
  parts.push(part(GEOM.box, C.white, { t: [0.4, 0.07, 5.95], s: [11.0, 0.1, 0.18] }));

  // The study shed — behind the building, offset to the back-right corner
  // (the side the default camera angle can see), where it actually is
  const S = { x: 4.6, z: -4.2 };
  parts.push(part(GEOM.box, C.path, { t: [S.x, 0.14, S.z], s: [4.2, 0.28, 2.8] })); // plinth
  parts.push(part(GEOM.box, C.brick, { t: [S.x - 1.95, 0.62, S.z], s: [0.26, 0.68, 2.6] }));
  parts.push(part(GEOM.box, C.brick, { t: [S.x + 1.95, 0.62, S.z], s: [0.26, 0.68, 2.6] }));
  parts.push(part(GEOM.box, C.brick, { t: [S.x, 0.62, S.z - 1.25], s: [3.9, 0.68, 0.26] }));
  for (const px of [-1.8, 0, 1.8]) {
    for (const pz of [-1.1, 1.1]) {
      parts.push(part(GEOM.cylinder, C.timber, { t: [S.x + px, 1.02, S.z + pz], s: [0.15, 1.5, 0.15] }));
    }
  }
  parts.push(part(GEOM.wedge, C.roofGreen, { t: [S.x, 2.22, S.z], s: [4.9, 0.95, 3.6] }));
  parts.push(part(GEOM.box, C.roofGreen, { t: [S.x, 1.78, S.z], s: [5.0, 0.07, 3.7] })); // eaves plate
  for (const bz of [-0.5, 0.45]) {
    parts.push(part(GEOM.box, C.timber, { t: [S.x, 0.5, S.z + bz], s: [2.8, 0.08, 0.5] }));
  }

  parts.push(...tree(-7.0, 1.0, 1.0), ...tree(-6.2, -3.6, 0.9));
  parts.push(...lamp(5.4, 4.8));
  return parts;
}

/** Kumapley Building — broad gable hall with colonnade + cream facade panels. */
function auditorium() {
  const parts = [...platform(9.5)];
  const W = 13.6; // hall width
  const D = 5.6; // hall depth

  // Ground colonnade level: floor slab, dark recess, slim gold columns, railings
  parts.push(part(GEOM.box, C.path, { t: [0, 0.09, 0.4], s: [W + 0.6, 0.18, D + 1.6] }));
  parts.push(part(GEOM.box, C.glass, { t: [0, 0.85, -0.4], s: [W - 0.6, 1.5, 0.12] })); // recessed interior
  parts.push(part(GEOM.box, C.cream, { t: [0, 0.85, -2.2], s: [W, 1.7, 1.4] })); // back mass
  for (let i = 0; i < 11; i++) {
    const x = -W / 2 + 0.6 + i * ((W - 1.2) / 10);
    parts.push(part(GEOM.cylinder, C.amber, { t: [x, 0.85, 2.15], s: [0.18, 1.7, 0.18] }));
  }
  for (const rz of [0.55, 0.85]) {
    parts.push(part(GEOM.box, C.white, { t: [0, rz, 2.35], s: [W - 1.4, 0.05, 0.05] })); // railings
  }

  // Mid band: solid body + proud cream panels between gold pilasters + window slots
  parts.push(part(GEOM.box, C.cream, { t: [0, 2.45, -0.3], s: [W, 1.9, D] }));
  const panelFront = -0.3 + D / 2 + 0.08;
  for (let i = 0; i < 6; i++) {
    const x = -W / 2 + 1.75 + i * ((W - 3.5) / 5);
    parts.push(part(GEOM.box, C.creamDark, { t: [x, 2.25, panelFront], s: [1.75, 1.25, 0.12] }));
    parts.push(part(GEOM.box, C.glass, { t: [x, 3.08, panelFront - 0.02], s: [1.55, 0.34, 0.08] }));
  }
  for (let i = 0; i < 7; i++) {
    const x = -W / 2 + 0.8 + i * ((W - 1.6) / 6);
    parts.push(part(GEOM.box, C.amber, { t: [x, 2.45, panelFront + 0.03], s: [0.16, 1.9, 0.16] }));
  }

  // Sweeping fascia band across the front (slopes gently, like the photo)
  parts.push(part(GEOM.box, C.cream, { t: [0, 3.62, 2.5], r: [0, 0, -0.055], s: [W + 1.2, 0.5, 0.14] }));

  // Clerestory gable + grey metal roof planes
  parts.push(part(GEOM.wedge, C.cream, { t: [0, 4.25, -0.3], s: [W + 0.4, 1.7, D + 0.2] }));
  parts.push(part(GEOM.box, C.roofGrey, { t: [0, 4.62, 1.22], r: [0.523, 0, 0], s: [W + 0.9, 0.08, 3.4] }));
  parts.push(part(GEOM.box, C.roofGrey, { t: [0, 4.62, -1.82], r: [-0.523, 0, 0], s: [W + 0.9, 0.08, 3.4] }));

  // Hedgerow, forecourt, lamps, side trees
  for (let i = 0; i < 5; i++) {
    parts.push(...hedge(-5.2 + i * 2.6, 3.4, 2.0, 0.55, 0.4));
  }
  parts.push(part(GEOM.box, C.paver, { t: [0, 0.04, 5.9], s: [12.0, 0.08, 3.4] }));
  parts.push(...lamp(-3.4, 5.4), ...lamp(3.4, 5.4));
  parts.push(...tree(-8.1, -1.6, 1.0), ...tree(8.1, -1.2, 1.1));
  return parts;
}

/** Aeroplane Building — 4-storey walkway slab + jet trainer on the lawn. */
function aeroplaneLibrary() {
  const parts = [...platform(10.5)];

  // Slab block: dark glazed core wrapped by cream floor slabs + gold parapets
  const B = { x: 0, z: -3.4, w: 15.0, d: 3.6, floorH: 1.12 };
  parts.push(part(GEOM.box, C.glass, { t: [B.x, 2.4, B.z], s: [B.w - 0.5, 4.5, B.d - 0.5] }));
  for (let floor = 0; floor <= 4; floor++) {
    const y = 0.18 + floor * B.floorH;
    parts.push(part(GEOM.box, C.cream, { t: [B.x, y, B.z], s: [B.w, 0.2, B.d + 0.5] }));
    if (floor < 4) {
      // walkway parapet on the front edge of each floor
      parts.push(
        part(GEOM.box, C.amber, {
          t: [B.x, y + 0.36, B.z + B.d / 2 + 0.18], s: [B.w, 0.4, 0.09],
        })
      );
    }
  }
  // Ground-floor door rhythm
  for (let i = 0; i < 8; i++) {
    parts.push(
      part(GEOM.box, C.glass, {
        t: [-6.3 + i * 1.8, 0.62, B.z + B.d / 2 + 0.03], s: [0.8, 0.9, 0.07],
      })
    );
  }
  // External stair tower (left end) with zigzag flights
  parts.push(part(GEOM.box, C.cream, { t: [-8.4, 2.4, B.z + 0.4], s: [1.9, 4.8, 2.6] }));
  for (let f = 0; f < 4; f++) {
    parts.push(
      part(GEOM.box, C.creamDark, {
        t: [-8.4, 0.75 + f * B.floorH, B.z + 1.78],
        r: [0, 0, f % 2 === 0 ? 0.42 : -0.42],
        s: [1.5, 0.09, 0.5],
      })
    );
  }
  // Roof water tank
  parts.push(part(GEOM.cylinder, C.steel, { t: [5.2, 5.05, B.z], s: [0.9, 0.7, 0.9] }));

  // The jet trainer on the lawn (red/cream, mounted on pylons) — scaled up
  // and pushed to the open foreground so it reads as the landmark it is
  const P0 = { x: 0.2, z: 3.0, ry: 0.55, y: 1.25 };
  const rot = (dx, dz) => [
    P0.x + dx * Math.cos(P0.ry) + dz * Math.sin(P0.ry),
    P0.z - dx * Math.sin(P0.ry) + dz * Math.cos(P0.ry),
  ];
  const at = (dx, dy, dz) => {
    const [x, z] = rot(dx, dz);
    return [x, P0.y + dy, z];
  };
  // fuselage (lying along the yawed heading). NOTE transformPositions
  // applies Euler X->Y->Z, so "tilt onto X axis, then yaw" must be written
  // [ry, 0, PI/2] (equivalent to RotY(ry)*RotZ(PI/2)), not [0, ry, PI/2].
  parts.push(part(GEOM.cylinderFine, C.planeCream, { t: at(0, 0, 0), r: [P0.ry, 0, Math.PI / 2], s: [0.87, 4.35, 0.87] }));
  parts.push(part(GEOM.cone, C.planeRed, { t: at(2.68, 0, 0), r: [-P0.ry, 0, -Math.PI / 2], s: [0.84, 1.0, 0.84] })); // nose
  parts.push(part(GEOM.cone, C.planeCream, { t: at(-2.68, 0.03, 0), r: [P0.ry, 0, Math.PI / 2], s: [0.73, 1.0, 0.73] })); // tail taper
  parts.push(part(GEOM.sphere, C.glass, { t: at(1.09, 0.41, 0), r: [0, P0.ry, 0], s: [1.04, 0.49, 0.73] })); // canopy
  // wings + red tip tanks
  for (const side of [1, -1]) {
    parts.push(
      part(GEOM.box, C.planeCream, {
        t: at(0.22, -0.12, side * 1.81), r: [0, P0.ry + side * 0.1, 0], s: [1.23, 0.1, 3.63],
      })
    );
    parts.push(
      part(GEOM.cylinder, C.planeRed, {
        t: at(0.22, -0.09, side * 3.55), r: [P0.ry, 0, Math.PI / 2], s: [0.23, 0.94, 0.23] },
      )
    );
    // tailplane
    parts.push(
      part(GEOM.box, C.planeRed, {
        t: at(-2.54, 0.23, side * 0.65), r: [0, P0.ry, 0], s: [0.73, 0.07, 1.23] },
      )
    );
  }
  // vertical fin
  parts.push(part(GEOM.box, C.planeRed, { t: at(-2.5, 0.62, 0), r: [0, P0.ry, 0], s: [1.0, 1.05, 0.12] }));
  // pylon stands
  for (const dx of [-1.0, 1.0]) {
    parts.push(part(GEOM.box, C.steel, { t: at(dx, -0.62, 0), r: [0, P0.ry, 0], s: [0.29, 1.38, 0.34] }));
  }

  // Satellite dish on its pedestal (photo detail) — off to the right,
  // clear of the aircraft
  parts.push(part(GEOM.cylinder, C.steel, { t: [7.2, 0.5, 0.4], s: [0.14, 1.0, 0.14] }));
  parts.push(part(GEOM.sphere, C.white, { t: [7.2, 1.25, 0.55], r: [0.8, 0, 0], s: [1.15, 0.3, 1.15] }));

  // Palms along the road edge + hedge border + road strip
  parts.push(...palm(8.2, 3.4, 1.1), ...palm(9.0, 0.6, 0.95), ...palm(7.4, 6.0, 0.85));
  for (let i = 0; i < 4; i++) parts.push(...hedge(-6.5 + i * 3.4, 6.6, 2.8, 0.4, 0.26));
  parts.push(part(GEOM.box, C.asphalt, { t: [0.2, 0.03, 7.7], s: [9.5, 0.07, 1.9] }));
  parts.push(...lamp(-4.0, 5.2));
  return parts;
}

/** Generic open-air study kiosk — ICT Centre + fallback for uncurated spots. */
function studySpot() {
  const parts = [...platform(6.5)];

  // Deck, posts, gently sloped roof
  parts.push(part(GEOM.box, C.path, { t: [0, 0.14, 0], s: [4.6, 0.28, 3.6] }));
  for (const px of [-2.0, 2.0]) {
    for (const pz of [-1.5, 1.5]) {
      parts.push(part(GEOM.cylinder, C.timber, { t: [px, 1.25, pz], s: [0.14, 2.2, 0.14] }));
    }
  }
  parts.push(part(GEOM.box, C.cream, { t: [0, 2.42, 0], r: [0.07, 0, 0], s: [5.3, 0.16, 4.3] }));
  parts.push(part(GEOM.box, C.amber, { t: [0, 2.28, 2.12], r: [0.07, 0, 0], s: [5.3, 0.12, 0.1] })); // fascia

  // Brick half-walls on two sides
  parts.push(part(GEOM.box, C.brick, { t: [-2.14, 0.68, 0], s: [0.24, 0.8, 3.3] }));
  parts.push(part(GEOM.box, C.brick, { t: [0, 0.68, -1.62], s: [4.3, 0.8, 0.24] }));

  // Study table with a laptop + benches
  parts.push(part(GEOM.box, C.timber, { t: [0, 0.78, 0], s: [1.8, 0.09, 0.8] }));
  for (const lx of [-0.7, 0.7]) {
    parts.push(part(GEOM.box, C.timber, { t: [lx, 0.5, 0], s: [0.09, 0.5, 0.7] }));
  }
  parts.push(part(GEOM.box, C.glass, { t: [0.15, 0.98, -0.1], r: [-0.35, 0.3, 0], s: [0.5, 0.34, 0.03] }));
  parts.push(part(GEOM.box, C.white, { t: [0.15, 0.835, 0.08], s: [0.5, 0.025, 0.34] }));
  for (const bz of [0.95, -0.95]) {
    parts.push(part(GEOM.box, C.timber, { t: [0, 0.42, bz], s: [2.2, 0.07, 0.4] }));
  }

  // Wifi mast on the roof
  parts.push(part(GEOM.cylinder, C.steel, { t: [1.9, 3.0, -1.4], s: [0.05, 1.1, 0.05] }));
  parts.push(part(GEOM.sphere, C.white, { t: [1.9, 3.6, -1.4], s: [0.18, 0.18, 0.18] }));

  parts.push(part(GEOM.box, C.path, { t: [0, 0.04, 3.6], s: [1.4, 0.08, 2.8] }));
  parts.push(...tree(-3.9, 1.6, 0.95), ...tree(4.0, -1.4, 0.8));
  parts.push(...hedge(2.6, 2.9, 1.8, 0.4, 0.28));
  return parts;
}

// -----------------------------------------------------------------------
// MAIN
// -----------------------------------------------------------------------
mkdirSync(OUT_DIR, { recursive: true });
console.log('Generating building models into assets/models/');
await writeModel('mainLibrary', mainLibrary());
await writeModel('libraryMall', libraryMall());
await writeModel('tent', tent());
await writeModel('auditorium', auditorium());
await writeModel('aeroplaneLibrary', aeroplaneLibrary());
await writeModel('studySpot', studySpot());
console.log('Done.');
