import Navbar from "./_components/navbar";
import Hero from "./_components/hero";
import Footer from "./_components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Footer />
    </div>
  );
}