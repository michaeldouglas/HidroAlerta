import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";

const root = resolve(import.meta.dirname, "..");
const source = resolve(root, "assets/branding/hydrobot.svg");
const images = resolve(root, "assets/images");
const markSvg = await readFile(source);

const iconBackground = Buffer.from(`
  <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="background" x1="80" y1="20" x2="930" y2="1000" gradientUnits="userSpaceOnUse">
        <stop stop-color="#0D4E80"/>
        <stop offset="0.52" stop-color="#082D50"/>
        <stop offset="1" stop-color="#04182C"/>
      </linearGradient>
      <radialGradient id="glow" cx="0" cy="0" r="1" gradientTransform="translate(512 470) rotate(90) scale(400)">
        <stop stop-color="#4DB6E8" stop-opacity="0.25"/>
        <stop offset="1" stop-color="#4DB6E8" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1024" height="1024" rx="220" fill="url(#background)"/>
    <circle cx="512" cy="500" r="390" fill="url(#glow)"/>
    <path d="M75 790C250 700 325 865 520 768C715 670 810 820 980 730V1024H0V830C25 820 50 804 75 790Z" fill="#26A9E8" fill-opacity="0.08"/>
  </svg>
`);

const iconMark = await sharp(markSvg).resize(600, 600).png().toBuffer();
await sharp(iconBackground)
  .composite([{ input: iconMark, left: 212, top: 190 }])
  .png()
  .toFile(resolve(images, "icon.png"));

const foregroundMark = await sharp(markSvg).resize(270, 270).png().toBuffer();
await sharp({ create: { width: 432, height: 432, channels: 4, background: "#00000000" } })
  .composite([{ input: foregroundMark, left: 81, top: 76 }])
  .png()
  .toFile(resolve(images, "android-icon-foreground.png"));

const splashMark = await sharp(markSvg).resize(390, 390).png().toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: "#00000000" } })
  .composite([{ input: splashMark, left: 61, top: 52 }])
  .png()
  .toFile(resolve(images, "splash-icon.png"));

const monochromeSvg = Buffer.from(`
  <svg width="432" height="432" viewBox="0 0 108 108" xmlns="http://www.w3.org/2000/svg">
    <path d="M54 17C44 29 29 45 29 63c0 15 11 26 25 26s25-11 25-26c0-18-15-34-25-46Z" fill="#fff"/>
    <circle cx="82" cy="34" r="4" fill="#fff"/>
    <circle cx="90" cy="25" r="3" fill="#fff"/>
  </svg>
`);
await sharp(monochromeSvg).png().toFile(resolve(images, "android-icon-monochrome.png"));

await sharp(resolve(images, "icon.png")).resize(64, 64).png().toFile(resolve(images, "favicon.png"));

console.log("HydroBot brand assets generated.");
