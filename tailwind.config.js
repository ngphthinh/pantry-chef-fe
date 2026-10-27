const { light, dark, brand } = require('./src/core/theme/colors');

// Mỗi token ngữ nghĩa có 2 giá trị: `bg-canvas` (sáng) và `dark:bg-canvas-dark` (tối)
const semantic = Object.fromEntries(
  Object.keys(light).map((k) => [k, { DEFAULT: light[k], dark: dark[k] }]),
);

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: { extend: { colors: { brand, ...semantic } } },
  plugins: [],
};
