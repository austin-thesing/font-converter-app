import dynamic from 'next/dynamic';
import LoadingSpinner from './components/LoadingSpinner';

// Dynamically import FontConverter with loading fallback
const FontConverter = dynamic(() => import('./components/FontConverter'), {
  loading: () => <LoadingSpinner />,
  ssr: false // Disable server-side rendering for this component if it's not needed
});

export default function Home() {
  return (
    <main>
      <FontConverter />
    </main>
  );
}
