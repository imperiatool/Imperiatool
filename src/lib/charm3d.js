// Realistic 3D preview of the charm: every layer of the composition is
// extruded from its SVG shapes (Three.js SVGLoader + ExtrudeGeometry) and
// stacked in depth, with a bevelled, rounded edge like a moulded charm.
import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { renderAssetMarkup } from './svgParser.js';
import { itemTransform } from './geometry.js';

/**
 * Material presets. `bevel` scales the rounded edge, `depth` the thickness,
 * `tint` mixes colours towards dry-pasta beige, `grain` adds a flour texture.
 */
export const CHARM_MATERIALS = {
  // grezzo, tipo pasta cruda: opaco, granuloso, spigoli quasi vivi
  raw: { roughness: 0.93, metalness: 0, clearcoat: 0, sheen: 0.12, sheenRoughness: 0.95, bevel: 0.45, depth: 0.85, tint: 0.07, grain: true },
  // plastica morbida: satinata, riflessi morbidi
  aldente: { roughness: 0.38, metalness: 0, clearcoat: 0.3, clearcoatRoughness: 0.35, sheen: 0, bevel: 0.9, depth: 1, tint: 0, grain: false },
  // silicone morbido: vellutato, bordi gonfi
  overcooked: { roughness: 0.58, metalness: 0, clearcoat: 0.05, clearcoatRoughness: 0.6, sheen: 0.9, sheenRoughness: 0.32, bevel: 1.25, depth: 1.12, tint: 0.03, grain: false, puffy: true },
};

const PASTA_BEIGE = new THREE.Color('#ead7a4');
const BG = '#ecebe7';

function grainTextures() {
  const size = 256;
  const make = (fn) => {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(size, size);
    for (let i = 0; i < size * size; i++) {
      const v = fn();
      img.data[i * 4] = v[0];
      img.data[i * 4 + 1] = v[1];
      img.data[i * 4 + 2] = v[2];
      img.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1 / 70, 1 / 70);
    return tex;
  };
  // colour: near-white with sparse darker semolina specks (multiplies the colour)
  const map = make(() => {
    const r = Math.random();
    const v = r > 0.985 ? 205 + Math.random() * 25 : 246 + Math.random() * 9;
    return [v, v * 0.985, v * 0.95];
  });
  map.colorSpace = THREE.SRGBColorSpace;
  const bump = make(() => {
    const v = 110 + Math.random() * 145;
    return [v, v, v];
  });
  return { map, bump };
}

/**
 * Rebuilds a shape with a consistent winding (outer clockwise, holes
 * counter-clockwise in SVG space). Mixed windings + the y-flip of the scene
 * would otherwise make some caps face away from the camera.
 */
function normalizeWinding(shape) {
  const outer = shape.getPoints(12);
  if (!THREE.ShapeUtils.isClockWise(outer)) outer.reverse();
  const s = new THREE.Shape(outer);
  for (const h of shape.holes) {
    const pts = h.getPoints(12);
    if (THREE.ShapeUtils.isClockWise(pts)) pts.reverse();
    s.holes.push(new THREE.Path(pts));
  }
  return s;
}

export class CharmScene {
  constructor(container) {
    this.container = container;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.touchAction = 'none';

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(BG);
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    this.scene.environment = this.envTexture;
    this.scene.environmentIntensity = 0.85;

    const key = new THREE.DirectionalLight(0xffffff, 1.5);
    key.position.set(1.6, 3.2, 2.6);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.radius = 6;
    key.shadow.bias = -0.0004;
    Object.assign(key.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 0.1, far: 12 });
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xfff4e6, 0.35);
    fill.position.set(-2.5, 1.2, 1.5);
    this.scene.add(fill);

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.16 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    this.camera = new THREE.PerspectiveCamera(28, 1, 0.05, 100);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    this.controls.maxPolarAngle = Math.PI * 0.53;
    this.controls.autoRotateSpeed = 1.6;

    this.root = null;
    this.grain = null;
    this.running = true;
    this.resize = this.resize.bind(this);
    this.ro = new ResizeObserver(this.resize);
    this.ro.observe(container);
    this.resize();
    const loop = () => {
      if (!this.running) return;
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
      this.raf = requestAnimationFrame(loop);
    };
    loop();
  }

  resize() {
    const w = this.container.clientWidth || 1;
    const h = this.container.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  setAutoRotate(on) {
    this.controls.autoRotate = on;
  }

  /** Builds the extruded charm from the editor items. */
  setDesign(items, assetsById, materialId = 'aldente') {
    const preset = CHARM_MATERIALS[materialId] || CHARM_MATERIALS.aldente;
    this.clearDesign();
    const visible = items.filter((it) => !it.hidden && assetsById[it.assetId]);
    if (!visible.length) return;
    if (preset.grain && !this.grain) this.grain = grainTextures();

    const loader = new SVGLoader();
    const pieces = [];
    visible.forEach((item, index) => {
      const asset = assetsById[item.assetId];
      const svg = `<svg xmlns="http://www.w3.org/2000/svg"><g transform="${itemTransform(item)}"><g transform="translate(${-asset.width / 2} ${-asset.height / 2})">${renderAssetMarkup(asset, item.colors, `c${index}`)}</g></g></svg>`;
      let data;
      try {
        data = loader.parse(svg);
      } catch {
        return;
      }
      // consecutive paths with the same fill = one "piece" (e.g. both eye whites);
      // a new fill starts a new, raised piece (e.g. the pupils on top)
      let level = -1;
      let prevFill = null;
      for (const path of data.paths) {
        const style = path.userData?.style || {};
        const fill = style.fill;
        if (!fill || fill === 'none' || style.fillOpacity === 0) continue;
        const shapes = SVGLoader.createShapes(path).map(normalizeWinding);
        if (!shapes.length) continue;
        if (fill !== prevFill) {
          level += 1;
          pieces.push({ index, level, isFirstItem: index === 0, color: fill, shapes: [] });
          prevFill = fill;
        }
        pieces[pieces.length - 1].shapes.push(...shapes);
      }
    });
    if (!pieces.length) return;

    const root = new THREE.Group();
    const placed = [];
    for (const piece of pieces) {
      const box = new THREE.Box2();
      piece.shapes.forEach((s) => s.getPoints(4).forEach((p) => box.expandByPoint(p)));
      const size = box.getSize(new THREE.Vector2());
      const minDim = Math.max(1, Math.min(size.x, size.y));

      const baseDepth = piece.isFirstItem && piece.level === 0 ? 110 : piece.level === 0 ? 40 : 18;
      const depth = baseDepth * preset.depth;
      const bt = Math.min(depth * 0.42, piece.level === 0 ? 26 : 10) * preset.bevel;
      // a wide inward bevel self-intersects on tight waves (e.g. tortellino edges)
      const bs = Math.min(bt * 0.9, minDim * 0.12, 11);

      // sits on top of whatever it overlaps (bodies first, then features…)
      let z0 = 0;
      for (const p of placed) if (p.box.intersectsBox(box)) z0 = Math.max(z0, p.top - 2);

      const geometry = new THREE.ExtrudeGeometry(piece.shapes, {
        depth: Math.max(1, depth - bt * 2),
        bevelEnabled: bt > 0.5,
        bevelThickness: bt,
        bevelSize: bs,
        bevelOffset: -bs,
        bevelSegments: preset.puffy ? 7 : 5,
        curveSegments: 1, // shapes are already sampled by normalizeWinding
      });
      geometry.computeVertexNormals();

      const color = new THREE.Color(piece.color);
      if (preset.tint) color.lerp(PASTA_BEIGE, preset.tint);
      const material = new THREE.MeshPhysicalMaterial({
        color,
        roughness: preset.roughness,
        metalness: preset.metalness,
        clearcoat: preset.clearcoat,
        clearcoatRoughness: preset.clearcoatRoughness ?? 0.5,
        sheen: preset.sheen,
        sheenRoughness: preset.sheenRoughness ?? 0.5,
        sheenColor: new THREE.Color('#ffffff'),
        map: preset.grain ? this.grain.map : null,
        bumpMap: preset.grain ? this.grain.bump : null,
        bumpScale: preset.grain ? 1.4 : 0,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.z = z0 + bt;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      root.add(mesh);
      placed.push({ box, top: z0 + depth });
    }

    // SVG is y-down: flip, scale to ~2 units, stand it on the ground
    root.scale.set(1, -1, 1);
    const holder = new THREE.Group();
    holder.add(root);
    let bb = new THREE.Box3().setFromObject(holder);
    const dims = bb.getSize(new THREE.Vector3());
    const s = 2 / Math.max(dims.x, dims.y);
    holder.scale.setScalar(s);
    bb = new THREE.Box3().setFromObject(holder);
    const c = bb.getCenter(new THREE.Vector3());
    holder.position.set(-c.x, -bb.min.y, -c.z);
    this.scene.add(holder);
    this.root = holder;

    const finalBox = new THREE.Box3().setFromObject(holder);
    const fsize = finalBox.getSize(new THREE.Vector3());
    const target = new THREE.Vector3(0, fsize.y / 2, 0);
    const fov = (this.camera.fov * Math.PI) / 180;
    const dist = (Math.max(fsize.x, fsize.y) / 2 / Math.tan(fov / 2)) * 1.12;
    if (!this.framed) {
      this.camera.position.set(dist * 0.18, target.y + fsize.y * 0.12, dist);
      this.framed = true;
    }
    this.controls.target.copy(target);
    this.controls.minDistance = dist * 0.45;
    this.controls.maxDistance = dist * 2.2;
  }

  clearDesign() {
    if (!this.root) return;
    this.root.traverse((o) => {
      if (o.isMesh) {
        o.geometry.dispose();
        o.material.dispose();
      }
    });
    this.scene.remove(this.root);
    this.root = null;
  }

  /** Current view as a JPEG data URL (for the order summary). */
  snapshot(quality = 0.88) {
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/jpeg', quality);
  }

  dispose() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    this.clearDesign();
    this.controls.dispose();
    this.envTexture.dispose();
    if (this.grain) {
      this.grain.map.dispose();
      this.grain.bump.dispose();
    }
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
