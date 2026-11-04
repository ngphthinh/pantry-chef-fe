// components/brand/PantryChefLogo.tsx
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg";

type Props = { size?: number; withBackground?: boolean };

export function PantryChefLogo({ size = 88, withBackground = true }: Props) {
  const hat = withBackground ? "#FFFFFF" : "#F2542D";
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <LinearGradient id="pcBg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FF9A3D" />
          <Stop offset="1" stopColor="#F2542D" />
        </LinearGradient>
      </Defs>

      {withBackground && (
        <Rect width="120" height="120" rx="28" fill="url(#pcBg)" />
      )}

      {/* mũ đầu bếp */}
      <Circle cx="44" cy="46" r="16" fill={hat} />
      <Circle cx="60" cy="38" r="18" fill={hat} />
      <Circle cx="76" cy="46" r="16" fill={hat} />
      <Rect x="38" y="46" width="44" height="24" fill={hat} />
      <Rect x="38" y="74" width="44" height="14" rx="5" fill={hat} />
      <Path
        d="M48 56v14M60 56v14M72 56v14"
        stroke={withBackground ? "#F2542D" : "#FFFFFF"}
        strokeWidth="3"
        strokeLinecap="round"
        opacity={0.35}
      />
    </Svg>
  );
}
