import dynamic from "next/dynamic";

const FontConverter = dynamic(() => import("./components/FontConverter"), { ssr: false });

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <FontConverter />
    </main>
  );
}
