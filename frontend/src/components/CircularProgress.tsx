export function CircularProgress({ value, size = 140, stroke = 12, trackColor = '#1f2937', barColor = '#06b6d4', rounded = true, showLabel = true }: { value: number; size?: number; stroke?: number; trackColor?: string; barColor?: string; rounded?: boolean; showLabel?: boolean }) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, value))
  const dash = (clamped / 100) * circumference
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={radius} stroke={trackColor} strokeWidth={stroke} fill="none" />
      <circle
        cx={size/2}
        cy={size/2}
        r={radius}
        stroke={barColor}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={`${dash} ${circumference - dash}`}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        strokeLinecap={rounded ? 'round' : 'butt'}
      />
      {showLabel && (
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize={size * 0.22} fontWeight="700" fill="#1F2937">{clamped}%</text>
      )}
    </svg>
  )
}
