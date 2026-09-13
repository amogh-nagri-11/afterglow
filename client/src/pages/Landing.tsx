import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Download,
  ImagePlus,
  KeyRound,
  Lock,
  Maximize2,
  Smartphone,
  Users,
  Zap,
} from "lucide-react";
import { Avatar } from "../components/Avatar";
import { Logo } from "../components/Logo";
import { Scene, type SceneName } from "../components/Scene";
import { useAuth } from "../lib/auth";

export default function Landing() {
  return (
    <div className="overflow-x-clip">
      <Nav />
      <Hero />
      <Occasions />
      <HowItWorks />
      <Features />
      <Testimonial />
      <Pricing />
      <Faq />
      <FinalCta />
      <Footer />
    </div>
  );
}

function Nav() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/"><Logo /></Link>
        <div className="hidden items-center gap-8 text-sm text-sand-400 md:flex">
          <a href="#how" className="hover:text-sand-50">How it works</a>
          <a href="#features" className="hover:text-sand-50">Features</a>
          <a href="#pricing" className="hover:text-sand-50">Pricing</a>
          <a href="#faq" className="hover:text-sand-50">FAQ</a>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <Link to="/pools" className="btn btn-primary h-10">
              Open app <ArrowRight className="size-4" />
            </Link>
          ) : (
            <>
              <Link to="/login" className="hidden px-3 text-sm text-sand-200 hover:text-sand-50 sm:block">Log in</Link>
              <Link to="/signup" className="btn btn-primary h-10">Get started</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-48 left-1/2 h-[40rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,125,125,.22),transparent)]" />
        <div className="absolute top-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(closest-side,rgba(199,125,255,.18),transparent)]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 pt-16 pb-24 lg:grid-cols-[1.05fr_1fr] lg:pt-24">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-sand-200">
            <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            Now in open beta
          </span>
          <h1 className="mt-6 font-serif text-6xl leading-[0.92] tracking-tight sm:text-7xl xl:text-8xl">
            Every photo from the night,{" "}
            <em className="text-glow pr-2">finally in one place.</em>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-sand-400">
            Afterglow gives your group a private pool for the wedding, the road trip, or the Tuesday that got out of hand.
            Share one invite code and everyone's camera roll lands in the same gallery, at full resolution.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link to="/signup" className="btn btn-primary h-12 px-6 text-base">
              Start a pool, it's free <ArrowRight className="size-4" />
            </Link>
            <a href="#how" className="btn btn-ghost h-12 px-6 text-base">See how it works</a>
          </div>
          <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm text-sand-500">
            {["No app to install", "Full-resolution originals", "Invite-only by default"].map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <Check className="size-4 text-sand-200" /> {item}
              </li>
            ))}
          </ul>
        </div>

        <HeroCollage />
      </div>
    </section>
  );
}

type Shot = { scene: SceneName; name: string; meta: string; className: string };

const shots: Shot[] = [
  { scene: "dusk", name: "Maya", meta: "8:14 PM", className: "left-[4%] top-[6%] w-[44%] -rotate-8 group-hover:-translate-x-4 group-hover:-rotate-12" },
  { scene: "city", name: "Theo", meta: "11:52 PM", className: "right-[2%] top-0 w-[40%] rotate-6 group-hover:translate-x-4 group-hover:rotate-10" },
  { scene: "coast", name: "Jordan", meta: "6:03 PM", className: "left-0 bottom-[4%] w-[38%] rotate-4 group-hover:-translate-x-6 group-hover:translate-y-3" },
  { scene: "bonfire", name: "Ren", meta: "1:26 AM", className: "right-[0%] bottom-[8%] w-[38%] -rotate-5 group-hover:translate-x-6 group-hover:translate-y-3" },
  { scene: "party", name: "Sofia", meta: "10:40 PM", className: "left-[27%] top-[20%] z-10 w-[46%] -rotate-1 group-hover:-translate-y-3 group-hover:scale-[1.03]" },
];

function HeroCollage() {
  return (
    <div className="group relative mx-auto aspect-[1/1.02] w-full max-w-[34rem] animate-fade-up [animation-delay:.15s]">
      {shots.map((shot) => (
        <figure
          key={shot.scene}
          className={`absolute rounded-2xl border border-white/10 bg-ink-800 p-1.5 shadow-2xl shadow-black/70 transition duration-700 ease-out ${shot.className}`}
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
            <Scene name={shot.scene} />
          </div>
          <figcaption className="flex items-center gap-2 px-1.5 pt-2 pb-1 text-[11px] text-sand-500">
            <Avatar name={shot.name} size={18} className="ring-0" />
            <span className="text-sand-200">{shot.name}</span>
            <span className="ml-auto">{shot.meta}</span>
          </figcaption>
        </figure>
      ))}

      <div className="absolute -top-2 left-[34%] z-20 animate-float">
        <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-ink-850/85 py-2 pr-4 pl-2 shadow-xl backdrop-blur-md">
          <span className="grid size-7 place-items-center rounded-full bg-glow text-ink-950">
            <KeyRound className="size-3.5" />
          </span>
          <span className="font-mono text-xs tracking-widest text-sand-200">7f3a9c21e4b0</span>
        </div>
      </div>

      <div className="absolute bottom-[-4%] left-1/2 z-20 -translate-x-1/2 animate-float [animation-delay:-3s]">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-ink-850/85 px-4 py-3 shadow-xl backdrop-blur-md">
          <div className="flex -space-x-2">
            <Avatar name="Jordan Lee" size={28} />
            <Avatar name="Sofia Marin" size={28} />
            <Avatar name="Ren Okafor" size={28} />
          </div>
          <div className="text-left">
            <p className="text-sm whitespace-nowrap">Jordan added 24 photos</p>
            <p className="text-xs whitespace-nowrap text-sand-500">Lake house weekend · just now</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const occasions = ["Weddings", "Road trips", "Birthdays", "Festivals", "Reunions", "Team offsites", "Graduations", "Bachelorettes", "Concerts", "Game nights"];

function Occasions() {
  return (
    <section aria-label="Occasions" className="border-y border-white/5 bg-ink-900/60 py-6">
      <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <div className="flex w-max animate-marquee gap-12 pr-12">
          {[...occasions, ...occasions].map((o, i) => (
            <span key={i} className="flex items-center gap-12 font-serif text-3xl whitespace-nowrap text-sand-500">
              {o} <span className="size-1.5 rounded-full bg-glow" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title, body }: { eyebrow: string; title: React.ReactNode; body?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-medium tracking-[0.2em] text-glow uppercase">{eyebrow}</p>
      <h2 className="mt-4 font-serif text-5xl leading-[1.02] tracking-tight sm:text-6xl">{title}</h2>
      {body && <p className="mt-5 text-lg text-sand-400">{body}</p>}
    </div>
  );
}

const steps = [
  { icon: ImagePlus, title: "Create a pool", body: "Name it after the event. It takes five seconds and you're the owner." },
  { icon: KeyRound, title: "Share the invite", body: "Send the link to the group chat. Anyone with it can join, and nobody else can." },
  { icon: Users, title: "Watch it fill up", body: "Everyone uploads from their own phone. Every shot, from every angle, in one gallery." },
];

function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-7xl scroll-mt-20 px-6 py-28">
      <SectionHeading
        eyebrow="How it works"
        title={<>Three steps. <em>Zero</em> chasing people for photos.</>}
        body="No more twelve different shared albums, compressed group-chat images or ‘I'll AirDrop you later.’"
      />
      <ol className="mt-16 grid gap-5 md:grid-cols-3">
        {steps.map((step, i) => (
          <li key={step.title} className="relative overflow-hidden rounded-3xl border border-white/10 bg-ink-900 p-8">
            <span className="absolute -top-6 right-4 font-serif text-[9rem] leading-none text-white/[.04]">{i + 1}</span>
            <span className="grid size-11 place-items-center rounded-2xl bg-white/5 text-sand-50">
              <step.icon className="size-5" />
            </span>
            <h3 className="mt-6 text-xl font-medium">{step.title}</h3>
            <p className="mt-2 leading-relaxed text-sand-400">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl scroll-mt-20 px-6 py-16">
      <SectionHeading eyebrow="Features" title={<>Built for the photos <em>you actually</em> want to keep.</>} />

      <div className="mt-16 grid gap-5 md:grid-cols-3">
        <article className="relative overflow-hidden rounded-3xl border border-white/10 bg-ink-900 p-8 md:col-span-2 md:row-span-2">
          <FeatureIcon icon={Maximize2} />
          <h3 className="mt-6 text-2xl font-medium">Full resolution, always</h3>
          <p className="mt-2 max-w-md leading-relaxed text-sand-400">
            Originals are stored exactly as they were uploaded. No messaging-app compression, no mystery crops. Open any shot at
            full size, whenever you want.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-3">
            {(["peaks", "dusk", "city", "party", "coast", "bonfire"] as SceneName[]).map((s, i) => (
              <div key={s} className={`relative aspect-square overflow-hidden rounded-2xl ${i === 1 ? "ring-2 ring-rose-300/60" : ""}`}>
                <Scene name={s} />
              </div>
            ))}
          </div>
        </article>

        <FeatureCard icon={Lock} title="Private by default" body="Pools are invite-only. Only members who joined with your code can see or add photos." />
        <FeatureCard icon={Zap} title="Instant thumbnails" body="Thumbnails are generated on upload, so even a 1,000-photo pool scrolls smoothly." />
        <FeatureCard icon={Users} title="Everyone contributes" body="Every guest uploads their own shots, and each photo shows who took it." />
        <FeatureCard icon={Smartphone} title="Works on any device" body="Nothing to install. Upload straight from your phone's browser or your laptop." />
        <FeatureCard icon={Download} title="Download the whole pool" body="Grab every original in one ZIP when the weekend's over." badge="Soon" />
      </div>
    </section>
  );
}

function FeatureIcon({ icon: Icon }: { icon: typeof Lock }) {
  return (
    <span className="grid size-11 place-items-center rounded-2xl bg-glow text-ink-950">
      <Icon className="size-5" />
    </span>
  );
}

function FeatureCard({ icon, title, body, badge }: { icon: typeof Lock; title: string; body: string; badge?: string }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-ink-900 p-8">
      <div className="flex items-start justify-between">
        <FeatureIcon icon={icon} />
        {badge && <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-sand-400">{badge}</span>}
      </div>
      <h3 className="mt-6 text-lg font-medium">{title}</h3>
      <p className="mt-2 leading-relaxed text-sand-400">{body}</p>
    </article>
  );
}

function Testimonial() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-28 text-center">
      <p className="font-serif text-4xl leading-[1.15] tracking-tight sm:text-5xl">
        “We came home from Portugal with <em className="text-glow">2,300 photos</em> from nine people, and for once, every single one
        of them was in the same place by Monday.”
      </p>
      <div className="mt-10 flex items-center justify-center gap-3">
        <Avatar name="Dani Kowalski" size={44} />
        <div className="text-left">
          <p className="text-sm">Dani K.</p>
          <p className="text-sm text-sand-500">Organised a 9-person trip to Lisbon</p>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl scroll-mt-20 px-6 py-16">
      <SectionHeading eyebrow="Pricing" title={<>Free while we're in beta.</>} body="Start as many pools as you like today. A Pro plan with extra features is on the way." />

      <div className="mx-auto mt-16 grid max-w-4xl gap-5 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-3xl border border-rose-300/30 bg-ink-900 p-8 shadow-[0_0_80px_-30px_rgba(255,125,125,.5)]">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Free</h3>
            <span className="rounded-full bg-glow px-2.5 py-0.5 text-xs font-medium text-ink-950">Current</span>
          </div>
          <p className="mt-6 font-serif text-6xl">$0</p>
          <p className="mt-1 text-sm text-sand-500">For every group, forever</p>
          <PlanFeatures items={["Unlimited pools", "Unlimited members per pool", "Photos up to 15 MB each", "Full-resolution originals", "Invite-only sharing"]} />
          <Link to="/signup" className="btn btn-primary mt-8 w-full">Get started</Link>
        </div>

        <div className="rounded-3xl border border-white/10 bg-ink-900/60 p-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Pro</h3>
            <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-sand-400">Coming soon</span>
          </div>
          <p className="mt-6 font-serif text-6xl text-sand-500">Soon</p>
          <p className="mt-1 text-sm text-sand-500">For big events and power organisers</p>
          <PlanFeatures muted items={["Everything in Free", "One-click ZIP downloads", "Video uploads", "Custom pool covers", "Owner moderation tools"]} />
          <button disabled className="btn btn-ghost mt-8 w-full">Coming soon</button>
        </div>
      </div>
    </section>
  );
}

function PlanFeatures({ items, muted = false }: { items: string[]; muted?: boolean }) {
  return (
    <ul className="mt-8 space-y-3 text-sm">
      {items.map((item) => (
        <li key={item} className={`flex items-center gap-3 ${muted ? "text-sand-400" : "text-sand-200"}`}>
          <Check className={`size-4 shrink-0 ${muted ? "text-sand-500" : "text-rose-300"}`} /> {item}
        </li>
      ))}
    </ul>
  );
}

const faqs = [
  { q: "Who can see the photos in a pool?", a: "Only the pool's members: people who joined with its invite code. Pools never appear publicly and can't be found by searching." },
  { q: "Do guests need an account?", a: "Yes, but it's quick: one tap with Google, or an email and password. Accounts are what let every photo show who took it." },
  { q: "Are my photos compressed?", a: "No. We store the original file exactly as uploaded and generate a separate small thumbnail for fast browsing." },
  { q: "What can I upload?", a: "JPG, PNG and WebP images up to 15 MB each. Video support is planned for the Pro plan." },
  { q: "How much does it cost?", a: "Afterglow is free while in beta. When Pro launches, everything you can do today will stay free." },
];

function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-6 py-28">
      <SectionHeading eyebrow="FAQ" title="Questions, answered." />
      <div className="mt-14 divide-y divide-white/10 border-y border-white/10">
        {faqs.map((f) => (
          <details key={f.q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg [&::-webkit-details-marker]:hidden">
              {f.q}
              <ChevronDown className="size-5 shrink-0 text-sand-500 transition group-open:rotate-180" />
            </summary>
            <p className="mt-3 pr-10 leading-relaxed text-sand-400">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-24">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 px-8 py-20 text-center sm:py-28">
        <Scene name="dusk" className="opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/95 via-ink-950/60 to-ink-950/20" />
        <div className="relative">
          <h2 className="mx-auto max-w-3xl font-serif text-5xl leading-[1.02] tracking-tight sm:text-7xl">
            Your next great night deserves <em>better</em> than a group chat.
          </h2>
          <Link to="/signup" className="btn btn-primary mt-10 h-12 px-7 text-base">
            Start your first pool <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 text-sm text-sand-500 sm:flex-row">
        <Logo className="text-sand-200" />
        <div className="flex gap-6">
          <a href="#features" className="hover:text-sand-50">Features</a>
          <a href="#pricing" className="hover:text-sand-50">Pricing</a>
          <a href="#faq" className="hover:text-sand-50">FAQ</a>
          <Link to="/login" className="hover:text-sand-50">Log in</Link>
        </div>
        <p>© {new Date().getFullYear()} Afterglow</p>
      </div>
    </footer>
  );
}
