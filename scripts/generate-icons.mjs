import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const BRAND = "#1F6B52";
const PUBLIC_DIR = path.join(process.cwd(), "public");
const ICONS_DIR = path.join(PUBLIC_DIR, "icons");
const SOURCE = path.join(PUBLIC_DIR, "icon.svg");

async function render(size) {
  const svg = await readFile(SOURCE);
  return sharp(svg, { density: 384 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();
}

async function write(file, buffer) {
  await writeFile(file, buffer);
  console.log(`${path.relative(process.cwd(), file)} — ${(buffer.length / 1024).toFixed(1)} kB`);
}

async function main() {
  await mkdir(ICONS_DIR, { recursive: true });

  await write(path.join(ICONS_DIR, "icon-192.png"), await render(192));
  await write(path.join(ICONS_DIR, "icon-512.png"), await render(512));

  // Maskable: a marca fica dentro da zona segura de 80% e o fundo sangra até a borda,
  // porque o sistema operacional recorta o ícone em círculo ou squircle.
  const safeArea = Math.round(512 * 0.62);
  const maskable = await sharp({
    create: { width: 512, height: 512, channels: 4, background: BRAND },
  })
    .composite([{ input: await render(safeArea), gravity: "centre" }])
    .png({ compressionLevel: 9 })
    .toBuffer();

  await write(path.join(ICONS_DIR, "icon-maskable-512.png"), maskable);

  const appleTouch = await sharp({
    create: { width: 180, height: 180, channels: 4, background: BRAND },
  })
    .composite([{ input: await render(180) }])
    .flatten({ background: BRAND })
    .png({ compressionLevel: 9 })
    .toBuffer();

  await write(path.join(PUBLIC_DIR, "apple-touch-icon.png"), appleTouch);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
