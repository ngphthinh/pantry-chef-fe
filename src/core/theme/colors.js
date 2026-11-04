// Nguồn màu chuẩn mực: dùng cho Tailwind (className) và cho chỗ dùng StyleSheet/Theme token.
const brand = {
  DEFAULT: "#2E7D4F",
  dark: "#10B981",
  soft: "#E1F2E7",
  softDark: "rgba(16, 185, 129, 0.16)",
};

const light = {
  canvas: "#F7FAF8",        // Nền trắng sương mai thanh khiết, sạch sẽ
  surface: "#FFFFFF",       // Thẻ nổi bật trên nền canvas
  soft: "#EFF4F0",          // Bề mặt phụ mềm mại
  ink: "#121C16",           // Chữ chính than đen ánh ngọc sẫm sang trọng
  muted: "#55645B",         // Chữ phụ xám trầm đạt chuẩn WCAG AAA
  line: "#E2ECE5",          // Viền thanh mảnh trang nhã
  warnBg: "#FEF3C7",        // Nền cảnh báo vàng mật ấm
  warnInk: "#92400E",       // Chữ cảnh báo nâu hổ phách
  dangerBg: "#FEE2E2",      // Nền báo lỗi hồng phấn nhẹ
  dangerInk: "#DC2626",     // Chữ báo lỗi đỏ tươi
  successBg: "#E1F2E7",     // Nền tươi mới xanh pastel
  successInk: "#2E7D4F",    // Chữ thành công xanh ngọc lục bảo
};

const dark = {
  canvas: "#0A0E0C",        // Nền đen nhung than chì sâu thẳm, loại bỏ sắc bùn xỉn
  surface: "#161D19",       // Thẻ đen đá phiến sang trọng có độ nổi khối rõ rệt
  soft: "#202823",          // Bề mặt phụ tạo phân cấp thị giác
  ink: "#F5F7F6",           // Chữ trắng sương tinh khiết, sắc nét, tương phản cao
  muted: "#95A39B",         // Chữ phụ xám bạc dễ chịu
  line: "#26322B",          // Viền kính mảnh mai, tinh xảo
  warnBg: "rgba(245, 158, 11, 0.16)",  // Kính mờ hổ phách phát quang
  warnInk: "#FBBF24",       // Vàng kim sáng rực rỡ
  dangerBg: "rgba(239, 68, 68, 0.16)", // Kính mờ đỏ san hô
  dangerInk: "#F87171",     // Đỏ san hô tươi sáng
  successBg: "rgba(16, 185, 129, 0.16)", // Kính mờ bạc hà phát quang
  successInk: "#34D399",    // Xanh bạc hà neon tràn đầy năng lượng
};

module.exports = { brand, light, dark };
