import type { Metadata } from 'next';
import DisplayContent from './components/DisplayContent';

export const metadata: Metadata = {
  title: 'Projector Display - Gurbani Presenter',
  description: 'Full-screen Gurbani presentation display optimized for congregation viewing during religious services with real-time content synchronization.',
};

export default function ProjectorDisplayPage() {
  return (
    <main className="min-h-screen bg-black">
      <DisplayContent />
    </main>
  );
}