import GalaxyAnimation from "@/components/GalaxyAnimation";

export default function Home() {
  return (
    <main className="flex min-h-full flex-col items-center justify-between p-24 bg-white">
      <div className="min-h-screen w-full h-full bg-slate-950">
        <GalaxyAnimation />
      </div>
    </main>
  );
}
