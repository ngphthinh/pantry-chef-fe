// Nguồn màu duy nhất: dùng cho Tailwind (className) và cho chỗ không dùng được className (tab bar, icon).
const brand = { DEFAULT: "#2E7D4F", soft: "#DCEFE3" };

const light = {
  canvas: "#FAF7F2",
  surface: "#FFFFFF",
  soft: "#F0ECE4",
  ink: "#1F2D26",
  muted: "#5F6B64",
  line: "#E6E0D6",
  warnBg: "#FDEBC8",
  warnInk: "#8A5A00",
  dangerBg: "#FBE0E0",
  dangerInk: "#C62828",
  successBg: "#DCEFE3",
  successInk: "#2E7D4F",
};

const dark = {
  canvas: "#101512",
  surface: "#1A211D",
  soft: "#242C27",
  ink: "#EAF1EC",
  muted: "#9AA8A0",
  line: "#2C352F",
  warnBg: "#3A2E10",
  warnInk: "#F5C969",
  dangerBg: "#3E1D1D",
  dangerInk: "#F28B82",
  successBg: "#1E3A29",
  successInk: "#7CCB9A",
};

module.exports = { brand, light, dark };
