import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Story } from '@/components/Story';
import { Capabilities } from '@/components/Capabilities';
import { FinalCTA } from '@/components/FinalCTA';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <div className="bg-main min-h-screen">
      <Header />
      <main>
        <Hero />
        <Story />
        <Capabilities />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
