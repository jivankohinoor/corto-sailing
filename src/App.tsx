import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import CustomPackages from './components/CustomPackages';
import Extras from './components/Extras';
import Pricing from './components/Pricing';
import Contact from './components/Contact';
import Footer from './components/Footer';
import SEOHead from './components/SEOHead';

function App() {
  return (
    <div className="App">
      <SEOHead />
      <Header />
      <Hero />
      <Services />
      <CustomPackages />
      <Extras />
      <Pricing />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;
