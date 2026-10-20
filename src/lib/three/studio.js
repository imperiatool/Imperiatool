// Photo-studio scene shared by every 3D product preview: soft light, a floor
// that only receives the shadow, 360° orbit, zoom buttons and snapshots.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { disposeMaterial } from './materials.js';

export const STUDIO_BG = '#f2f2f0';

export class Studio {
  constructor(container) {
    this.container = container;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const el = this.renderer.domElement;
    el.style.display = 'block';
    el.style.touchAction = 'none';
    el.style.cursor = 'grab';
    container.appendChild(el);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(STUDIO_BG);
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    this.scene.environment = this.env;
    this.scene.environmentIntensity = 0.62;

    // soft, slightly warm "window light" like a product photo
    const key = new THREE.DirectionalLight(0xfffaf2, 1.35);
    key.position.set(1.8, 3.4, 2.8);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.radius = 9;
    key.shadow.bias = -0.0003;
    key.shadow.normalBias = 0.01;
    Object.assign(key.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 0.1, far: 14 });
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(0xfff1e0, 0.5);
    rim.position.set(-2.5, 1.6, -2.2);
    this.scene.add(rim);
    const fill = new THREE.DirectionalLight(0xffffff, 0.3);
    fill.position.set(-2.4, 1, 2);
    this.scene.add(fill);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.2 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    this.camera = new THREE.PerspectiveCamera(28, 1, 0.02, 100);
    this.controls = new OrbitControls(this.camera, el);
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    this.controls.maxPolarAngle = Math.PI * 0.56; // never under the floor
    this.controls.autoRotateSpeed = 1.4;
    el.addEventListener('pointerdown', () => (el.style.cursor = 'grabbing'));
    el.addEventListener('pointerup', () => (el.style.cursor = 'grab'));

    this.object = null;
    this.running = true;
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(container);
    this.resize();
    this.wobbleUntil = 0;
    const loop = () => {
      if (!this.running) return;
      this.applyWobble();
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

  /**
   * Shows a new object, scaled so its height is `height` units and standing
   * on the floor. Keeps the current camera angle when the object changes.
   */
  setObject(object, { height = 2 } = {}) {
    this.clear();
    if (!object) return;
    const holder = new THREE.Group();
    holder.add(object);
    let bb = new THREE.Box3().setFromObject(holder);
    const size = bb.getSize(new THREE.Vector3());
    holder.scale.setScalar(height / Math.max(size.y, size.x * 0.75, 1e-6));
    bb = new THREE.Box3().setFromObject(holder);
    const c = bb.getCenter(new THREE.Vector3());
    holder.position.set(-c.x, -bb.min.y, -c.z);
    holder.traverse((o) => {
      if (o.isMesh && !o.userData.noShadow) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    // pivot on the floor, under the object: the jelly squash stays grounded
    const pivot = new THREE.Group();
    pivot.add(holder);
    this.scene.add(pivot);
    this.object = pivot;
    this.baseScale = 1;
    this.wobbleUntil = 0;

    const fb = new THREE.Box3().setFromObject(holder);
    const fs = fb.getSize(new THREE.Vector3());
    const target = new THREE.Vector3(0, fs.y / 2, 0);
    const fov = (this.camera.fov * Math.PI) / 180;
    const fitH = fs.y / 2 / Math.tan(fov / 2);
    const fitW = fs.x / 2 / Math.tan(fov / 2) / Math.max(this.camera.aspect, 0.4);
    this.fitDistance = Math.max(fitH, fitW) * (this.margin || 1.3);
    this.controls.target.copy(target);
    this.controls.minDistance = this.fitDistance * 0.25;
    this.controls.maxDistance = this.fitDistance * 2.5;
    if (!this.framed || this.reframe) this.resetView();
    this.framed = true;
    this.reframe = false;
  }

  /**
   * Squash-and-stretch "jelly" animation: shows at a glance how soft a
   * material is (strong for silicone, light for soft plastic).
   */
  wobble(strength = 0.08, duration = 1100) {
    if (!this.object) return;
    this.wobbleStart = performance.now();
    this.wobbleUntil = this.wobbleStart + duration;
    this.wobbleStrength = strength;
  }

  applyWobble() {
    if (!this.object || !this.wobbleUntil) return;
    const now = performance.now();
    const s = this.baseScale;
    if (now >= this.wobbleUntil) {
      this.object.scale.setScalar(s);
      this.wobbleUntil = 0;
      return;
    }
    const t = (now - this.wobbleStart) / 1000;
    const k = this.wobbleStrength * Math.exp(-t * 4.5) * Math.sin(t * 22);
    this.object.scale.set(s * (1 + k * 0.6), s * (1 - k), s * (1 + k * 0.6));
  }

  resetView() {
    const t = this.controls.target;
    const d = this.fitDistance || 5;
    this.camera.position.set(t.x + d * 0.22, t.y + d * 0.1, t.z + d * 0.97);
    this.controls.update();
  }

  /** factor < 1 zooms in, > 1 zooms out */
  zoom(factor) {
    const t = this.controls.target;
    const v = this.camera.position.clone().sub(t);
    const len = THREE.MathUtils.clamp(v.length() * factor, this.controls.minDistance, this.controls.maxDistance);
    this.camera.position.copy(t).add(v.setLength(len));
  }

  clear() {
    if (!this.object) return;
    this.object.traverse((o) => {
      if (o.isMesh) {
        o.geometry.dispose();
        (Array.isArray(o.material) ? o.material : [o.material]).forEach(disposeMaterial);
        o.customDepthMaterial?.dispose();
      }
    });
    this.scene.remove(this.object);
    this.object = null;
  }

  snapshot(quality = 0.88) {
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/jpeg', quality);
  }

  dispose() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    this.clear();
    this.controls.dispose();
    this.env.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
