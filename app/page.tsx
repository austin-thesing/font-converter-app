
import FontConverter from './components/FontConverter';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center p-4 md:p-24">
      <div className="w-full max-w-4xl">
        <FontConverter />
      </div>
    </main>
  );
}
