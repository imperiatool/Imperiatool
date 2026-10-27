"""Renders the recipe-builder ingredients (transparent WebP) with the app's 3D
studio. Needs the dev server: npm run dev, then python3 scripts/render-ingredients.py
"""
import base64, io, os, sys
from playwright.sync_api import sync_playwright
from PIL import Image

OUT = os.path.join(os.path.dirname(__file__), '..', 'src', 'assets', 'ingredients')
os.makedirs(OUT, exist_ok=True)
ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
URL = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:5173/'
only = set(sys.argv[2:])
JS = """async (id) => {
  const { Studio } = await import('/src/lib/three/studio.js');
  const { buildIngredient } = await import('/src/lib/ingredients3d.js');
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:0;top:0;width:600px;height:600px;z-index:9999';
  document.body.appendChild(host);
  const st = new Studio(host, { transparent: true });
  st.setObject(buildIngredient(id), { height: 1 });
  const t = st.controls.target, d = st.fitDistance * 1.1;
  st.camera.position.set(t.x + d * 0.25, t.y + d * 0.75, t.z + d * 0.62);
  st.controls.update();
  await new Promise(r => setTimeout(r, 700));
  st.renderer.render(st.scene, st.camera);
  const url = st.renderer.domElement.toDataURL('image/png');
  st.dispose(); host.remove();
  return url;
}"""
with sync_playwright() as p:
    b = p.chromium.launch(args=ARGS)
    pg = b.new_page(viewport={'width': 600, 'height': 600}, device_scale_factor=1)
    pg.set_default_timeout(240000)
    pg.goto(URL); pg.wait_for_timeout(2500)
    ids = pg.evaluate("import('/src/lib/ingredients3d.js').then(m => m.INGREDIENT_IDS)")
    for i in ids:
        if only and i not in only: continue
        im = Image.open(io.BytesIO(base64.b64decode(pg.evaluate(JS, i).split(',')[1]))).convert('RGBA')
        box = im.getchannel('A').point(lambda a: 255 if a > 6 else 0).getbbox()
        if box: im = im.crop(box)
        im.thumbnail((360, 360))
        im.save(os.path.join(OUT, f'{i}.webp'), 'WEBP', quality=88, method=6)
        print(i, im.size)
    b.close()
