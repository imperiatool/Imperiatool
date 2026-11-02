"""Renders the Recipe Club pastas in their natural colour (transparent WebP)
with the app's 3D studio. Needs the dev server: npm run dev, then
python3 scripts/render-recipe-pasta.py [url] [shapes...]
"""
import base64, io, sys, os
from playwright.sync_api import sync_playwright
from PIL import Image

OUT = os.path.join(os.path.dirname(__file__), '..', 'src', 'assets', 'recipe-pasta')
os.makedirs(OUT, exist_ok=True)
ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
URL = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:5173/'
JS = """async ({shape, color, finish, az, el}) => {
  const { Studio } = await import('/src/lib/three/studio.js');
  const { buildPasta } = await import('/src/lib/pasta3d.js');
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:0;top:0;width:700px;height:700px;z-index:9999';
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
# natural colours: durum-wheat pasta, egg pasta, potato gnocchi
WHEAT = '#f1cf7c'
EGG = '#f6c457'
POTATO = '#f3e2b0'
SHAPES = [
  ('spaghetti', WHEAT, 0.3, 0.62), ('tagliatelle', EGG, 0.3, 0.6), ('gnocchi', POTATO, 0.4, 0.5),
  ('ravioli', EGG, 0.3, 0.42), ('fusilli', WHEAT, 0.3, 0.42), ('penne', WHEAT, 0.3, 0.5),
  ('maccheroni', WHEAT, 0.3, 0.55), ('rigatoni', WHEAT, 0.35, 0.5), ('bucatini', WHEAT, 0.5, 0.55),
  ('orecchiette', WHEAT, 0.3, 0.7), ('farfalle', WHEAT, 0.3, 0.62), ('trofie', WHEAT, 0.3, 0.65),
  ('reginette', WHEAT, 0.2, 0.85), ('tortellini', EGG, 0.3, 0.6), ('conchiglie', WHEAT, 0.3, 0.55), ('anelli', WHEAT, 0.3, 0.75),
  ('cavatappi', WHEAT, 0.3, 0.5), ('lasagne', EGG, 0.3, 0.7),
]
only = set(sys.argv[2:])
with sync_playwright() as p:
    b = p.chromium.launch(args=ARGS)
    pg = b.new_page(viewport={'width': 700, 'height': 700})
    pg.set_default_timeout(240000)
    pg.goto(URL); pg.wait_for_timeout(2500)
    for shape, color, az, el in SHAPES:
        if only and shape not in only: continue
        data = pg.evaluate(JS, dict(shape=shape, color=color, finish='raw', az=az, el=el))
        im = Image.open(io.BytesIO(base64.b64decode(data.split(',')[1]))).convert('RGBA')
        bbox = im.getchannel('A').point(lambda a: 255 if a > 6 else 0).getbbox()
        if bbox: im = im.crop(bbox)
        im.thumbnail((360, 360))
        im.save(os.path.join(OUT, f'{shape}.webp'), 'WEBP', quality=88, method=6)
        print(shape, im.size)
    b.close()
