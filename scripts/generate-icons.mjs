import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const BRAND = "#0C63E7";
const PUBLIC_DIR = path.join(process.cwd(), "public");
const ICONS_DIR = path.join(PUBLIC_DIR, "icons");
const SOURCE = path.join(PUBLIC_DIR, "icon.svg");

async function render(size) {
  const svg = await readFile(SOURCE);
  return sharp(svg, { density: 384 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();
}

// Container ICO com PNG embutido (ICONDIR + ICONDIRENTRY): aceito por todos os
// browsers atuais e evita a dependência de um encoder BMP.
function icoContainer(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  const directory = Buffer.alloc(16 * images.length);
  let offset = header.length + directory.length;

  images.forEach((image, index) => {
    const entry = index * 16;
    directory.writeUInt8(image.size >= 256 ? 0 : image.size, entry);
    directory.writeUInt8(image.size >= 256 ? 0 : image.size, entry + 1);
    directory.writeUInt8(0, entry + 2);
    directory.writeUInt8(0, entry + 3);
    directory.writeUInt16LE(1, entry + 4);
    directory.writeUInt16LE(32, entry + 6);
    directory.writeUInt32LE(image.data.length, entry + 8);
    directory.writeUInt32LE(offset, entry + 12);
    offset += image.data.length;
  });

  return Buffer.concat([header, directory, ...images.map((image) => image.data)]);
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

  const favicon = icoContainer([
    { size: 16, data: await render(16) },
    { size: 32, data: await render(32) },
  ]);

  await write(path.join(PUBLIC_DIR, "favicon.ico"), favicon);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
