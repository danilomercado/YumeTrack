const PETALS = [
  {
    left: "6%",
    size: 14,
    dur: "16s",
    delay: "0s",
    sway: "60px",
    tone: "bg-accent-soft",
  },
  {
    left: "17%",
    size: 10,
    dur: "20s",
    delay: "6s",
    sway: "-50px",
    tone: "bg-paper",
  },
  {
    left: "29%",
    size: 16,
    dur: "18s",
    delay: "3s",
    sway: "70px",
    tone: "bg-accent-soft",
  },
  {
    left: "42%",
    size: 11,
    dur: "22s",
    delay: "9s",
    sway: "-60px",
    tone: "bg-paper",
  },
  {
    left: "55%",
    size: 15,
    dur: "17s",
    delay: "1.5s",
    sway: "55px",
    tone: "bg-accent-soft",
  },
  {
    left: "68%",
    size: 10,
    dur: "21s",
    delay: "11s",
    sway: "-45px",
    tone: "bg-paper",
  },
  {
    left: "80%",
    size: 14,
    dur: "19s",
    delay: "4.5s",
    sway: "65px",
    tone: "bg-accent-soft",
  },
  {
    left: "92%",
    size: 12,
    dur: "23s",
    delay: "8s",
    sway: "-55px",
    tone: "bg-paper",
  },
];

// Pétalos de sakura que cruzan toda la página; decoración que no recibe clics.
const PetalField = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
  >
    {PETALS.map((petal) => (
      <span
        key={petal.left}
        className={`petal-page ${petal.tone}`}
        style={{
          left: petal.left,
          width: petal.size,
          height: petal.size * 0.8,
          "--dur": petal.dur,
          "--delay": petal.delay,
          "--sway": petal.sway,
        }}
      />
    ))}
  </div>
);

export default PetalField;
