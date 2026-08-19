from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "instagram" / "hello-alyss-nowornever-2026-08-19"
OUT.mkdir(parents=True, exist_ok=True)

W, H = 1080, 1350
BG = "#F8F1E8"
CARD = "#FFFDF8"
GREEN = "#1E332F"
TERRA = "#C66A52"
MUTED = "#756F68"
BORDER = "#DFC7B9"
GOLD = "#B08A52"
PINK = "#FFF4EF"

DIDOT = "/System/Library/Fonts/Supplemental/Didot.ttc"
AVENIR = "/System/Library/Fonts/Avenir Next.ttc"


def font(path, size, index=0):
    try:
        return ImageFont.truetype(path, size=size, index=index)
    except Exception:
        return ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", size=size)


def text_width(draw, text, fnt):
    box = draw.textbbox((0, 0), text, font=fnt)
    return box[2] - box[0]


def draw_center(draw, y, text, fnt, fill=GREEN):
    box = draw.textbbox((0, 0), text, font=fnt)
    draw.text(((W - (box[2] - box[0])) / 2, y), text, font=fnt, fill=fill)


def draw_tracking(draw, x, y, text, fnt, fill, tracking=8):
    cur_x = x
    for ch in text:
        draw.text((cur_x, y), ch, font=fnt, fill=fill)
        cur_x += text_width(draw, ch, fnt) + tracking


def draw_tracking_center(draw, y, text, fnt, fill, tracking=8):
    total = sum(text_width(draw, ch, fnt) for ch in text) + tracking * (len(text) - 1)
    draw_tracking(draw, (W - total) / 2, y, text, fnt, fill, tracking)


def rounded(draw, box, r=28, fill=None, outline=BORDER, width=2):
    draw.rounded_rectangle(box, radius=r, fill=fill, outline=outline, width=width)


def paste_contain(base, img, box, bg=CARD):
    x1, y1, x2, y2 = box
    frame = Image.new("RGB", (x2 - x1, y2 - y1), bg)
    im = ImageOps.exif_transpose(img.convert("RGB"))
    im.thumbnail((x2 - x1 - 34, y2 - y1 - 34), Image.Resampling.LANCZOS)
    frame.paste(im, ((frame.width - im.width) // 2, (frame.height - im.height) // 2))
    base.paste(frame, (x1, y1))


def paste_cover(base, img, box, bg=CARD):
    x1, y1, x2, y2 = box
    frame = Image.new("RGB", (x2 - x1, y2 - y1), bg)
    im = ImageOps.exif_transpose(img.convert("RGB"))
    scale = max(frame.width / im.width, frame.height / im.height)
    im = im.resize((int(im.width * scale), int(im.height * scale)), Image.Resampling.LANCZOS)
    left = (im.width - frame.width) // 2
    top = max(0, (im.height - frame.height) // 2)
    frame.paste(im.crop((left, top, left + frame.width, top + frame.height)), (0, 0))
    base.paste(frame, (x1, y1))


def header(draw, canvas):
    icon_path = ROOT / "public" / "title-burger.png"
    icon = Image.open(icon_path).convert("RGBA")
    icon.thumbnail((52, 52), Image.Resampling.LANCZOS)
    canvas.paste(icon, (104, 86), icon)
    draw.text((170, 88), "Lexi's Selection", font=font(AVENIR, 30, 3), fill=GREEN)
    draw_tracking(draw, 200, 150, "CURATED BOUTIQUE DEALS", font(AVENIR, 20, 2), MUTED, 9)
    draw.line((110, 195, 970, 195), fill=BORDER, width=1)


def base_slide():
    canvas = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(canvas)
    rounded(draw, (44, 48, 1036, 1306), 36, fill=None, outline=BORDER, width=1)
    header(draw, canvas)
    return canvas, draw


def wrap_text(draw, text, fnt, max_width, max_lines=2):
    words = text.split()
    lines = []
    cur = ""
    for word in words:
        test = word if not cur else f"{cur} {word}"
        if text_width(draw, test, fnt) <= max_width:
            cur = test
        else:
            if cur:
                lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    if len(lines) > max_lines:
        kept = lines[:max_lines]
        while kept[-1] and text_width(draw, kept[-1] + "…", fnt) > max_width:
            kept[-1] = kept[-1].rsplit(" ", 1)[0] if " " in kept[-1] else kept[-1][:-1]
        kept[-1] += "…"
        return kept
    return lines


def crop_product(item):
    im = Image.open(item["path"]).convert("RGB")
    if item.get("crop"):
        return im.crop(item["crop"])
    # Screenshots are product cards; top 42% is the image frame.
    crop = im.crop((0, 0, im.width, min(int(im.height * 0.43), 540)))
    pix = crop.load()
    samples = [
        pix[8, 8],
        pix[crop.width - 9, 8],
        pix[8, crop.height - 9],
        pix[crop.width - 9, crop.height - 9],
        pix[crop.width // 2, 8],
        pix[crop.width // 2, crop.height - 9],
    ]
    bg = tuple(sum(c[i] for c in samples) // len(samples) for i in range(3))
    xs, ys = [], []
    for y in range(crop.height):
        for x in range(crop.width):
            r, g, b = pix[x, y]
            diff = abs(r - bg[0]) + abs(g - bg[1]) + abs(b - bg[2])
            if diff > 36 and not (r > 246 and g > 242 and b > 236):
                xs.append(x)
                ys.append(y)
    if xs and ys:
        pad = 24
        x1, x2 = max(0, min(xs) - pad), min(crop.width, max(xs) + pad)
        y1, y2 = max(0, min(ys) - pad), min(crop.height, max(ys) + pad)
        if (x2 - x1) > 80 and (y2 - y1) > 80:
            crop = crop.crop((x1, y1, x2, y2))
    return crop


items = [
    {
        "path": "/var/folders/j7/0cky4_9x30j_41hwq9_7c1pw0000gn/T/codex-clipboard-9dacb992-00c2-433a-b065-70a3373be66b.png",
        "brand": "NELLYSTELLA",
        "title": "Camila Dress in Space Dye Check",
        "page_price": "$80.00",
        "final_price": "$24.00",
        "retail": "$138.00",
        "off": "83% off",
        "sizes": "2",
        "crop": (120, 52, 404, 466),
    },
    {
        "path": "/var/folders/j7/0cky4_9x30j_41hwq9_7c1pw0000gn/T/codex-clipboard-2f8be2df-3fa4-40d1-bd42-1ec8fdc90241.png",
        "brand": "STELLA",
        "title": "Hope Girls Flowy Crepe Dress in Lilac",
        "page_price": "$42.00",
        "final_price": "$12.60",
        "retail": "$140.00",
        "off": "91% off",
        "sizes": "5",
        "crop": (166, 72, 360, 462),
    },
    {
        "path": "/var/folders/j7/0cky4_9x30j_41hwq9_7c1pw0000gn/T/codex-clipboard-cb0b246f-0af9-4bdd-b511-29945a3960fa.png",
        "brand": "TOCOTO VINTAGE",
        "title": "Girls Embroidery Dress",
        "page_price": "$58.00",
        "final_price": "$17.40",
        "retail": "$116.00",
        "off": "85% off",
        "sizes": "2Y, 4Y",
        "crop": (132, 76, 392, 464),
    },
    {
        "path": "/var/folders/j7/0cky4_9x30j_41hwq9_7c1pw0000gn/T/codex-clipboard-c4eceb84-430c-4c74-8879-5524114de1d4.png",
        "brand": "LOUISE MISHA",
        "title": "Salvador Dress in White Rainbow",
        "page_price": "$60.00",
        "final_price": "$18.00",
        "retail": "$147.00",
        "off": "88% off",
        "sizes": "3",
        "crop": (116, 28, 412, 488),
    },
]

CART = "/var/folders/j7/0cky4_9x30j_41hwq9_7c1pw0000gn/T/codex-clipboard-669942e8-d4dd-4eab-96a7-824438b1f94d.png"


def make_cover():
    canvas, draw = base_slide()
    draw_tracking_center(draw, 282, "S A L E   N O T E", font(AVENIR, 28, 3), GOLD, 10)
    draw_center(draw, 375, "Hello", font(DIDOT, 112), GREEN)
    draw_center(draw, 492, "Alyss", font(DIDOT, 112), GREEN)
    draw_center(draw, 645, "extra 70% OFF", font(DIDOT, 76), TERRA)
    draw_center(draw, 731, "with code NOWORNEVER", font(DIDOT, 48), GREEN)

    rounded(draw, (142, 832, 938, 1090), 28, fill=CARD, outline=BORDER, width=1)
    positions = [(174, 862, 338, 1048), (370, 862, 534, 1048), (566, 862, 730, 1048), (762, 862, 906, 1048)]
    for item, box in zip(items, positions):
        paste_contain(canvas, crop_product(item), box, bg=CARD)

    draw_center(draw, 1138, "Cart showed $163.10 off the sale prices.", font(AVENIR, 24, 2), MUTED)
    draw_center(draw, 1202, "Always confirm price, stock, shipping, and final terms at checkout.", font(AVENIR, 22, 1), MUTED)
    out = OUT / "01_hello_alyss_sale_cover.png"
    canvas.save(out)
    return out


def make_cart_slide():
    canvas, draw = base_slide()
    draw_tracking_center(draw, 245, "C H E C K O U T   P R O O F", font(AVENIR, 26, 3), GOLD, 8)
    draw_center(draw, 318, "NOWORNEVER", font(DIDOT, 72), GREEN)
    draw_center(draw, 404, "$163.10 order discount", font(DIDOT, 48), TERRA)

    img = Image.open(CART).convert("RGB")
    crop = img.crop((0, 0, img.width, min(img.height, 1240)))
    rounded(draw, (112, 505, 968, 1090), 24, fill=CARD, outline=BORDER, width=1)
    paste_contain(canvas, crop, (132, 530, 948, 1065), bg=CARD)

    draw_center(draw, 1160, "Code savings shown in cart; shipping and tax vary.", font(AVENIR, 24, 1), MUTED)
    out = OUT / "02_cart_checkout_proof.png"
    canvas.save(out)
    return out


def make_product(item, idx):
    canvas, draw = base_slide()
    draw_tracking_center(draw, 245, "S A L E   F I N D", font(AVENIR, 27, 3), GOLD, 10)
    rounded(draw, (132, 302, 948, 752), 24, fill=CARD, outline=BORDER, width=1)
    paste_contain(canvas, crop_product(item), (150, 320, 930, 734), bg=CARD)

    pill_font = font(AVENIR, 24, 2)
    pw = min(text_width(draw, item["brand"], pill_font) + 56, 600)
    rounded(draw, (144, 798, 144 + pw, 854), 28, fill=BG, outline=BORDER, width=2)
    draw.text((172, 813), item["brand"], font=pill_font, fill="#884438")

    title_font = font(AVENIR, 33, 2)
    y = 887
    for line in wrap_text(draw, item["title"], title_font, 800, 2):
        draw.text((144, y), line, font=title_font, fill=GREEN)
        y += 42

    rounded(draw, (144, 1010, 936, 1136), 22, fill=PINK, outline=None, width=0)
    draw.text((178, 1033), "Hello Alyss", font=font(AVENIR, 34, 2), fill=GREEN)
    draw.text((178, 1085), "USE CODE: NOWORNEVER", font=font(AVENIR, 24, 2), fill="#A44234")

    price_y = 1182
    draw.text((144, price_y), item["final_price"], font=font(AVENIR, 37, 2), fill=GREEN)
    old_font = font(AVENIR, 25, 1)
    x = 304
    for old in (item["page_price"], item["retail"]):
        draw.text((x, price_y + 9), old, font=old_font, fill="#68736F")
        w = text_width(draw, old, old_font)
        draw.line((x, price_y + 25, x + w, price_y + 25), fill="#68736F", width=3)
        x += w + 24
    rounded(draw, (x, price_y + 2, x + 126, price_y + 42), 20, fill="#F5DDD7", outline=None, width=0)
    draw.text((x + 18, price_y + 8), item["off"], font=font(AVENIR, 22, 2), fill="#A44234")
    draw.text((144, 1240), f"Sizes: {item['sizes']}", font=font(AVENIR, 27, 1), fill="#68736F")

    safe = item["brand"].lower().replace(" ", "_")
    out = OUT / f"{idx:02d}_{safe}.png"
    canvas.save(out)
    return out


paths = [make_cover(), make_cart_slide()]
for index, item in enumerate(items, start=3):
    paths.append(make_product(item, index))

thumbs = []
for path in paths:
    im = Image.open(path).convert("RGB")
    im.thumbnail((216, 270), Image.Resampling.LANCZOS)
    thumbs.append(im)

sheet = Image.new("RGB", (216 * len(thumbs), 270), BG)
for i, im in enumerate(thumbs):
    sheet.paste(im, (i * 216, 0))
sheet.save(OUT / "contact_sheet.jpg", quality=92)

print("\n".join(str(path) for path in paths))
print(OUT / "contact_sheet.jpg")
