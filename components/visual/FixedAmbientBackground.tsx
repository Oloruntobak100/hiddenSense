import Image from "next/image";

type ScrimPreset = "hero" | "gate" | "quiz" | "login";

type Props = {
  src: string;
  preset: ScrimPreset;
  priority?: boolean;
  objectPosition?: string;
  imageClassName?: string;
};

/**
 * Fixed full-viewport imagery with layered translucent scrims so the vault
 * purple / amber radial language stays readable and on-brand.
 */
export function FixedAmbientBackground({
  src,
  preset,
  priority = false,
  objectPosition = "center center",
  imageClassName = "",
}: Props) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <Image
        src={src}
        alt=""
        fill
        priority={priority}
        sizes="100vw"
        className={`object-cover motion-safe:scale-[1.03] motion-reduce:scale-100 ${imageClassName}`}
        style={{ objectPosition }}
      />
      {preset === "hero" ? <HeroScrim /> : null}
      {preset === "gate" ? <GateScrim /> : null}
      {preset === "quiz" ? <QuizScrim /> : null}
      {preset === "login" ? <LoginScrim /> : null}
    </div>
  );
}

function HeroScrim() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-b from-[#09080f]/62 via-[#09080f]/44 to-[#09080f]/66" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_18%_12%,rgba(124,58,237,0.2),transparent_54%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(95%_95%_at_88%_38%,rgba(234,88,12,0.12),transparent_48%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#09080f]/72 via-transparent to-[#09080f]/20" />
    </>
  );
}

function GateScrim() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-b from-[#09080f]/90 via-[#09080f]/75 to-[#09080f]/93" />
      <div className="absolute inset-0 bg-[radial-gradient(110%_110%_at_50%_0%,rgba(124,58,237,0.26),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(80%_80%_at_100%_60%,rgba(234,88,12,0.12),transparent_50%)]" />
    </>
  );
}

function QuizScrim() {
  return (
    <>
      <div className="absolute inset-0 bg-[#09080f]/86 backdrop-blur-[2px] motion-reduce:backdrop-blur-none" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_20%_10%,rgba(124,58,237,0.22),transparent_52%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(90%_90%_at_90%_40%,rgba(234,88,12,0.12),transparent_46%)]" />
    </>
  );
}

function LoginScrim() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-b from-[#09080f]/89 via-[#09080f]/72 to-[#09080f]/91" />
      <div className="absolute inset-0 bg-[radial-gradient(100%_100%_at_70%_20%,rgba(124,58,237,0.28),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(90%_90%_at_10%_80%,rgba(234,88,12,0.12),transparent_48%)]" />
    </>
  );
}
