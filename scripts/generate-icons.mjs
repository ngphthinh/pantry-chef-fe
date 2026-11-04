// scripts/generate-icons.mjs
import sharp from "sharp";
import fs from "node:fs";

const OUT = "assets/images";
const C1 = "#4ADE80"; // gradient bắt đầu
const C2 = "#2E7D4F"; // gradient kết thúc / màu thương hiệu
fs.mkdirSync(OUT, { recursive: true });

const hat = (fill, stripe, s) => `
<g transform="translate(60 60) scale(${s}) translate(-60 -54)">
  <circle cx="44" cy="46" r="16" fill="${fill}"/>
  <circle cx="60" cy="38" r="18" fill="${fill}"/>
  <circle cx="76" cy="46" r="16" fill="${fill}"/>
  <rect x="38" y="46" width="44" height="24" fill="${fill}"/>
  <rect x="38" y="74" width="44" height="14" rx="5" fill="${fill}"/>
  <path d="M48 56v14M60 56v14M72 56v14" stroke="${stripe}" stroke-width="3"
        stroke-linecap="round" opacity="0.35"/>
</g>`;

const svg = (body, defs = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
     <defs>${defs}</defs>${body}</svg>`;

const grad = `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="${C1}"/><stop offset="1" stop-color="${C2}"/>
</linearGradient>`;

const jobs = [
  // icon: vuông full-bleed (OS tự bo góc), không trong suốt
  [
    "icon.png",
    1024,
    svg(
      `<rect width="120" height="120" fill="url(#g)"/>${hat("#fff", C2, 1.15)}`,
      grad,
    ),
  ],
  // android adaptive foreground: nền trong suốt, nằm trong vùng an toàn ~66%
  ["adaptive-icon.png", 1024, svg(hat("#fff", C2, 0.85))],
  // splash: mũ màu thương hiệu, nền trong suốt
  ["splash-icon.png", 1024, svg(hat(C2, "#fff", 1))],
  // web favicon
  [
    "favicon.png",
    48,
    svg(
      `<rect width="120" height="120" rx="28" fill="url(#g)"/>${hat("#fff", C2, 1)}`,
      grad,
    ),
  ], // iOS dark: nền trong suốt, mũ xanh
  ["icon-ios-dark.png", 1024, svg(hat(C1, "#0F1F17", 1.15))],
  // iOS tinted: nền đen, mũ xám trắng (hệ thống tự phủ màu)
  [
    "icon-ios-tinted.png",
    1024,
    svg(
      `<rect width="120" height="120" fill="#000"/>${hat("#E5E5E5", "#000", 1.15)}`,
    ),
  ],
];

for (const [name, size, s] of jobs) {
  await sharp(Buffer.from(s)).resize(size, size).png().toFile(`${OUT}/${name}`);
  console.log("✓", name);
}
