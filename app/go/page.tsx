import { TARGET } from "@/lib/contract";
import { LeaveByScreen } from "@/components/go/LeaveByScreen";

export default function GoPage() {
  return (
    <main className="safe-pad mx-auto flex w-full max-w-[393px] flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold leading-tight tracking-tight">
          Leave for sunset
        </h1>
        <p className="text-[17px] font-medium leading-relaxed">Destination</p>
        <p className="text-[17px] leading-relaxed">{TARGET.label}</p>
        <p className="text-[17px] leading-relaxed">42.33080962456029</p>
        <p className="text-[17px] leading-relaxed">{TARGET.lon}</p>
      </header>
      <p className="text-[17px] leading-relaxed">
        Grant location to see when to leave so you arrive at sunset. Driving
        only.
      </p>
      <LeaveByScreen />
    </main>
  );
}
