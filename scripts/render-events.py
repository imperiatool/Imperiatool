"""Renders the Events pasta visuals (transparent PNG → WebP) with the app's own
3D studio. Needs the dev server: npm run dev, then python3 scripts/render-events.py
"""
import base64, io, sys, os
from playwright.sync_api import sync_playwright
from PIL import Image

OUT = os.path.join(os.path.dirname(__file__), '..', 'src', 'assets', 'events')
os.makedirs(OUT, exist_ok=True)
ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
URL = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:5173/'
JS = """async ({shape, color, finish, az, el}) => {
  const { Studio } = await import('/src/lib/three/studio.js');
  const { buildPasta } = await import('/src/lib/pasta3d.js');
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:0;top:0;width:900px;height:900px;z-index:9999';
  document.body.appendChild(host);
  const st = new Studio(host, { transparent: true });
  st.setObject(buildPasta({ shape, color, finish }), { height: 1.3 });
  const t = st.controls.target, d = st.fitDistance * 1.02;
  st.camera.position.set(t.x + d * Math.sin(az) * Math.cos(el), t.y + d * Math.sin(el), t.z + d * Math.cos(az) * Math.cos(el));
  st.controls.update();
  await new Promise(r => setTimeout(r, 600));
  st.renderer.render(st.scene, st.camera);
  const url = st.renderer.domElement.toDataURL('image/png');
  st.dispose(); host.remove();
  return url;
}"""
# shape, colour, finish, camera azimuth, elevation
from_args = [
  ('reginette', '#ffb548', 'raw', 0.2, 0.85),
  ('sculpture', '#e1201b', 'aldente', 0.25, 0.22),
  ('spaghetti', '#ffb548', 'aldente', 0.3, 0.62),
  ('gnocchi', '#f8eabe', 'raw', 0.4, 0.5),
  ('fusilli', '#1a5632', 'aldente', 0.3, 0.42),
  ('ravioli', '#ffb548', 'raw', 0.3, 0.42),
]
only = set(sys.argv[2:])
with sync_playwright() as p:
    b = p.chromium.launch(args=ARGS)
    pg = b.new_page(viewport={'width': 900, 'height': 900}, device_scale_factor=1.6)
    pg.set_default_timeout(240000)
    pg.goto(URL); pg.wait_for_timeout(2500)
    for shape, color, finish, az, el in from_args:
        if only and shape not in only: continue
        data = pg.evaluate(JS, dict(shape=shape, color=color, finish=finish, az=az, el=el))
        im = Image.open(io.BytesIO(base64.b64decode(data.split(',')[1]))).convert('RGBA')
        bbox = im.getchannel('A').point(lambda a: 255 if a > 6 else 0).getbbox()
        if bbox:
            pad = 30
            im = im.crop((max(0, bbox[0]-pad), max(0, bbox[1]-pad), min(im.width, bbox[2]+pad), min(im.height, bbox[3]+pad)))
        im.thumbnail((1100, 1100))
        im.save(os.path.join(OUT, f'{shape}.webp'), 'WEBP', quality=88, method=6)
        print(shape, im.size)
    b.close()
