// Riverborn's mark: a river-motif icon in the brand palette (Forest / Lime / Mist).
// No official logo asset was provided to this project — if one exists, drop the
// file into `frontend/public/` and swap it in wherever <RiverbornMark /> is used.
function RiverbornMark({ size = 40, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={className}
      role="img"
      aria-label="Riverborn"
    >
      <rect width="40" height="40" rx="10" fill="#0D2B22" />
      <path
        d="M5 24c5-8 9 5 14-3s9 5 14-3"
        stroke="#D4F53C"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M5 31c5-7 10 5 15-2s9 5 13-2"
        stroke="#9FCEBE"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.65"
      />
    </svg>
  );
}

export default RiverbornMark;
