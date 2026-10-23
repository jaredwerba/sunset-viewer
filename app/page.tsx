import Link from "next/link";

export default function Home() {
  return (
    <main className="safe-pad mx-auto flex w-full max-w-[393px] flex-1 flex-col justify-center gap-6 px-4 py-8">
      <h1 className="text-3xl font-semibold leading-tight tracking-tight">
        Sunset viewer
      </h1>
      <p className="text-[17px] leading-relaxed">
        When to leave so you arrive for sunset.
      </p>
      <Link
        href="/go"
        className="inline-flex h-14 min-h-11 items-center justify-center rounded-xl bg-foreground px-5 text-[17px] font-medium text-background"
      >
        Continue
      </Link>
    </main>
  );
}
