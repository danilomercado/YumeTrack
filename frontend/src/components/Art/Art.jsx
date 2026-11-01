// Ilustraciones dibujadas en código: el sol (hinomaru) y un torii.
// El color del torii se hereda de `text-*` (fill="currentColor").

export const Sun = ({ className = "", tone = "red" }) => (
  <svg
    viewBox="0 0 100 100"
    aria-hidden="true"
    className={`aspect-square ${className}`}
  >
    <circle
      cx="50"
      cy="50"
      r="48"
      className={tone === "red" ? "fill-accent" : "fill-paper"}
    />
  </svg>
);

export const Torii = ({ className = "" }) => (
  <svg
    viewBox="0 0 200 160"
    aria-hidden="true"
    fill="currentColor"
    className={className}
  >
    {/* kasagi: viga superior curva */}
    <path d="M2 24 Q100 6 198 24 L192 38 Q100 24 8 38 Z" />
    {/* shimaki: segunda viga */}
    <rect x="14" y="38" width="172" height="9" />
    {/* nuki: travesaño */}
    <rect x="28" y="64" width="144" height="9" />
    {/* gakuzuka: soporte central */}
    <rect x="94" y="47" width="12" height="17" />
    {/* columnas */}
    <path d="M38 47 H54 L57 160 H35 Z" />
    <path d="M146 47 H162 L165 160 H143 Z" />
  </svg>
);
