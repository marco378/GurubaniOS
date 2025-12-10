import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import ControllerInterfaceClient from './components/ControllerInterfaceClient';

export const metadata: Metadata = {
  title: 'Controller Interface - Gurbani Presenter',
  description: 'Manage and control Gurbani presentations during religious services with search functionality, line-by-line navigation, and custom slide creation capabilities.',
};

export default function ControllerInterfacePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ControllerInterfaceClient />
    </div>
  );
}