"""Home page images: same square canvas, object centred at the same scale.
The case is rendered with the app's 3D studio (transparent background, soft
shadow); charm, sticker and events images are re-centred.
Needs the dev server: npm run dev, then python3 scripts/render-home.py
"""
import base64, io, os, sys
from playwright.sync_api import sync_playwright
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..', 'src', 'assets')
URL = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:5173/'
ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
JS = """async () => {
  const { Studio } = await import('/src/lib/three/studio.js');
  const { buildCover } = await import('/src/lib/cover3d.js');
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:0;top:0;width:900px;height:900px;z-index:9999';
  document.body.appendChild(host);
  const st = new Studio(host, { transparent: true });
  st.setObject(buildCover({ pattern: 'ravioli', color: '#e1201b', material: 'aldente', model: 'iphone-17-pro' }), { height: 2.2 });
  const t = st.controls.target, d = st.fitDistance;
  st.camera.position.set(t.x + d * 0.28, t.y + d * 0.12, t.z + d * 0.95);
  st.controls.update();
  await new Promise(r => setTimeout(r, 1200));
  st.renderer.render(st.scene, st.camera);
  const url = st.renderer.domElement.toDataURL('image/png');
  st.dispose(); host.remove();
  return url;
}"""

def fit(im, size=900, box=0.74, solid_bbox=None):
    """Centre the object (its opaque part, so shadows don't shift it) in a square."""
    im = im.convert('RGBA')
    a = im.getchannel('A')
    bbox = solid_bbox or a.point(lambda v: 255 if v > 200 else 0).getbbox()
    full = a.point(lambda v: 255 if v > 6 else 0).getbbox()
    obj_w, obj_h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    k = size * box / max(obj_w, obj_h)
    im = im.crop(full).resize((round((full[2] - full[0]) * k), round((full[3] - full[1]) * k)), Image.LANCZOS)
    # object centre inside the crop
    cx = (bbox[0] + bbox[2]) / 2 - full[0]
    cy = (bbox[1] + bbox[3]) / 2 - full[1]
    out = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    out.alpha_composite(im, (round(size / 2 - cx * k), round(size / 2 - cy * k)))
    return out

def die_cut(im, border=26, rim=2):
    """White sticker border with a thin grey edge and a soft shadow, like the
    sticker preview and the downloaded PNG, so it reads as a sticker on white."""
    from PIL import ImageFilter, ImageChops
    im = im.convert('RGBA')
    pad = border + 30
    big = Image.new('RGBA', (im.width + pad * 2, im.height + pad * 2), (0, 0, 0, 0))
    big.alpha_composite(im, (pad, pad))
    a = big.getchannel('A').point(lambda v: 255 if v > 40 else 0)
    # round offset: blur + threshold gives a smooth, even border
    white_a = a.filter(ImageFilter.GaussianBlur(border * 0.55)).point(lambda v: 255 if v > 18 else 0).filter(ImageFilter.GaussianBlur(0.8))
    edge_a = white_a.filter(ImageFilter.MaxFilter(rim * 2 + 1)).filter(ImageFilter.GaussianBlur(0.6))
    shadow_a = white_a.filter(ImageFilter.GaussianBlur(10)).point(lambda v: int(v * 0.22))
    out = Image.new('RGBA', big.size, (0, 0, 0, 0))
    sh = Image.new('RGBA', big.size, (0, 0, 0, 255)); sh.putalpha(shadow_a)
    out.alpha_composite(sh, (0, 8))
    ed = Image.new('RGBA', big.size, (0, 0, 0, 255)); ed.putalpha(edge_a.point(lambda v: int(v * 0.16)))
    out.alpha_composite(ed)
    wh = Image.new('RGBA', big.size, (255, 255, 255, 255)); wh.putalpha(white_a)
    out.alpha_composite(wh)
    out.alpha_composite(big)
    return out

with sync_playwright() as p:
    b = p.chromium.launch(args=ARGS)
    pg = b.new_page(viewport={'width': 900, 'height': 900}, device_scale_factor=1.4)
    pg.set_default_timeout(240000)
    pg.goto(URL); pg.wait_for_timeout(2500)
    data = pg.evaluate(JS)
    b.close()
case = Image.open(io.BytesIO(base64.b64decode(data.split(',')[1])))
fit(case).save(os.path.join(ROOT, 'previews', 'case.png'))
SRC = os.path.join(os.path.dirname(__file__), 'home-sources')
fit(Image.open(os.path.join(SRC, 'charm-art.png')), box=0.8).save(os.path.join(ROOT, 'previews', 'charm.png'))
fit(die_cut(Image.open(os.path.join(SRC, 'sticker-art.png'))), box=0.8).save(os.path.join(ROOT, 'previews', 'sticker.png'))
fit(Image.open(os.path.join(ROOT, 'events', 'spaghetti.webp')), box=0.8).save(os.path.join(ROOT, 'previews', 'events.png'))
print('ok')
