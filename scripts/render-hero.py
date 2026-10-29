"""Renders the home hero background: a close-up of ruffled Reginette ribbons
in egg-yellow raw pasta, made with the app's own 3D studio. Needs the dev
server: npm run dev, then python3 scripts/render-hero.py [url]
"""
import base64, io, os, sys
from playwright.sync_api import sync_playwright
from PIL import Image

OUT = os.path.join(os.path.dirname(__file__), '..', 'src', 'assets', 'home')
os.makedirs(OUT, exist_ok=True)
ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
URL = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:5173/'
W, H = 2400, 1000
JS = """async ({w, h}) => {
  const THREE = await import('/node_modules/.vite/deps/three.js');
  const { Studio } = await import('/src/lib/three/studio.js');
  const { buildPasta } = await import('/src/lib/pasta3d.js');
  const host = document.createElement('div');
  host.style.cssText = `position:fixed;left:0;top:0;width:${w}px;height:${h}px;z-index:9999`;
  document.body.appendChild(host);
  const st = new Studio(host);
  st.scene.background = new THREE.Color('#d98f2c');
  const g = new THREE.Group();
  // ribbons side by side, overlapping like the sheets in a pasta drawer
  const place = [[-80, 0, -30, 0.25], [-30, 6, 10, -0.1], [30, 3, -20, 0.18], [85, 8, 15, -0.2], [0, 14, 45, 0.05], [-60, 10, 55, 0.3], [70, 12, -55, -0.15]];
  for (const [x, y, z, ry] of place) {
    const p = buildPasta({ shape: 'reginette', color: '#f6b440', finish: 'raw' });
    p.scale.setScalar(1.6);
    p.rotation.y = ry;
    p.position.set(x, y, z);
    g.add(p);
  }
  st.setObject(g, { height: 0.6 });
  st.floor.visible = false;
  const t = st.controls.target;
  const d = st.fitDistance * 0.36;
  st.camera.fov = 30; st.camera.updateProjectionMatrix();
  st.camera.position.set(t.x + d * 0.15, t.y + d * 0.95, t.z + d * 0.55);
  st.controls.update();
  await new Promise(r => setTimeout(r, 800));
  st.renderer.render(st.scene, st.camera);
  const url = st.renderer.domElement.toDataURL('image/png');
  st.dispose(); host.remove();
  return url;
}"""
with sync_playwright() as p:
    b = p.chromium.launch(args=ARGS)
    pg = b.new_page(viewport={'width': W, 'height': H})
    pg.set_default_timeout(600000)
    pg.goto(URL); pg.wait_for_timeout(2500)
    im = Image.open(io.BytesIO(base64.b64decode(pg.evaluate(JS, {'w': W, 'h': H}).split(',')[1]))).convert('RGB')
    im.save(os.path.join(OUT, 'hero.webp'), 'WEBP', quality=82, method=6)
    im.resize((1200, 500)).save(os.path.join(OUT, 'hero-sm.webp'), 'WEBP', quality=80, method=6)
    print(im.size)
    b.close()
