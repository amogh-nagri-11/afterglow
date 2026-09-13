// Illustrated "photos" drawn in CSS, used on marketing surfaces and empty pools.

export const SCENES = ["dusk", "city", "party", "coast", "bonfire", "peaks"] as const;
export type SceneName = (typeof SCENES)[number];

const buildings = [
  { left: 0, width: 18, height: 48 },
  { left: 16, width: 14, height: 66 },
  { left: 28, width: 20, height: 40 },
  { left: 46, width: 12, height: 76 },
  { left: 56, width: 22, height: 52 },
  { left: 76, width: 12, height: 62 },
  { left: 86, width: 16, height: 44 },
];

export function Scene({ name, className = "" }: { name: SceneName; className?: string }) {
  return (
    <div aria-hidden className={`grain absolute inset-0 overflow-hidden ${className}`}>
      {renderScene(name)}
    </div>
  );
}

function renderScene(name: SceneName) {
  switch (name) {
    case "dusk":
      return (
        <>
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#1e1b4b 0%,#6d28d9 32%,#ec4899 62%,#fdba74 100%)" }} />
          <div
            className="absolute bottom-[22%] left-1/2 aspect-square w-[42%] -translate-x-1/2 rounded-full"
            style={{ background: "radial-gradient(circle,#fff7ed 0%,#fed7aa 42%,rgba(253,186,116,0) 70%)" }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-[38%]"
            style={{ background: "#2a1245", clipPath: "polygon(0 45%,14% 28%,30% 50%,48% 18%,66% 42%,82% 26%,100% 40%,100% 100%,0 100%)" }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-[22%]"
            style={{ background: "#0d0819", clipPath: "polygon(0 30%,22% 55%,40% 25%,62% 60%,80% 35%,100% 50%,100% 100%,0 100%)" }}
          />
        </>
      );
    case "coast":
      return (
        <>
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#fde68a 0%,#fda4af 42%,#f472b6 58%)" }} />
          <div
            className="absolute top-[30%] left-[52%] aspect-square w-[32%] rounded-full"
            style={{ background: "radial-gradient(circle,#fffbeb 0%,#fcd34d 45%,rgba(252,211,77,0) 70%)" }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-[42%]"
            style={{
              background:
                "repeating-linear-gradient(180deg,rgba(255,255,255,.14) 0 1px,transparent 1px 7px),linear-gradient(180deg,#db2777 0%,#6d28d9 55%,#1e1b4b 100%)",
            }}
          />
          <div
            className="absolute bottom-[6%] left-[58%] h-[36%] w-[20%] blur-sm"
            style={{ background: "radial-gradient(ellipse at top,rgba(254,243,199,.75),transparent 70%)" }}
          />
        </>
      );
    case "city":
      return (
        <>
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#020617 0%,#1e1b4b 55%,#7e22ce 100%)" }} />
          <div className="absolute top-[12%] right-[18%] aspect-square w-[12%] rounded-full bg-amber-50 shadow-[0_0_40px_12px_rgba(254,243,199,.3)]" />
          {buildings.map((b) => (
            <div
              key={b.left}
              className="absolute bottom-0"
              style={{
                left: `${b.left}%`,
                width: `${b.width}%`,
                height: `${b.height}%`,
                background: "radial-gradient(circle,rgba(253,224,71,.85) 0 1px,transparent 1.6px) 3px 4px / 7px 9px, #0b0a17",
              }}
            />
          ))}
          <div className="absolute inset-x-0 bottom-0 h-1/3" style={{ background: "linear-gradient(0deg,rgba(236,72,153,.35),transparent)" }} />
        </>
      );
    case "bonfire":
      return (
        <>
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 75% 60% at 50% 100%,#fdba74 0%,#ea580c 18%,#7c2d12 42%,#0c0a09 75%)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 30% 40%,#fdba74 0 1.5px,transparent 2.5px),radial-gradient(circle at 62% 28%,#fed7aa 0 1px,transparent 2px),radial-gradient(circle at 48% 52%,#fb923c 0 1.5px,transparent 2.5px),radial-gradient(circle at 70% 58%,#fdba74 0 1px,transparent 2px),radial-gradient(circle at 40% 18%,#fb923c 0 1px,transparent 2px)",
            }}
          />
          <div className="absolute bottom-0 left-[6%] h-[30%] w-[26%] rounded-t-full bg-[#050404]" />
          <div className="absolute right-[5%] bottom-0 h-[38%] w-[30%] rounded-t-full bg-[#050404]" />
        </>
      );
    case "peaks":
      return (
        <>
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#fed7aa 0%,#fbcfe8 45%,#c4b5fd 100%)" }} />
          <div
            className="absolute top-[24%] left-[28%] aspect-square w-[22%] rounded-full"
            style={{ background: "radial-gradient(circle,#fff 0%,#fde68a 50%,rgba(253,230,138,0) 72%)" }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-[60%] opacity-80"
            style={{ background: "#a78bfa", clipPath: "polygon(0 60%,20% 25%,38% 55%,58% 10%,78% 50%,100% 30%,100% 100%,0 100%)" }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-[42%]"
            style={{ background: "#6d28d9", clipPath: "polygon(0 50%,25% 15%,45% 60%,70% 20%,100% 55%,100% 100%,0 100%)" }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-[22%]"
            style={{ background: "#2e1065", clipPath: "polygon(0 40%,30% 70%,55% 30%,80% 65%,100% 45%,100% 100%,0 100%)" }}
          />
        </>
      );
    case "party":
      return (
        <>
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 25% 20%,#db2777 0%,transparent 45%),radial-gradient(circle at 80% 75%,#7c3aed 0%,transparent 50%),#1e1b4b",
            }}
          />
          <div
            className="absolute inset-0 blur-[2px]"
            style={{
              background:
                "radial-gradient(circle at 20% 70%,rgba(253,224,71,.55) 0 7%,transparent 7.5%),radial-gradient(circle at 70% 30%,rgba(244,114,182,.5) 0 9%,transparent 9.5%),radial-gradient(circle at 55% 62%,rgba(255,255,255,.35) 0 5%,transparent 5.5%),radial-gradient(circle at 86% 50%,rgba(167,139,250,.55) 0 6%,transparent 6.5%),radial-gradient(circle at 36% 36%,rgba(251,146,60,.45) 0 4%,transparent 4.5%),radial-gradient(circle at 12% 30%,rgba(255,255,255,.25) 0 3%,transparent 3.5%)",
            }}
          />
        </>
      );
  }
}
