import { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import CustomPackages from './components/CustomPackages';
import Extras from './components/Extras';
import Pricing from './components/Pricing';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Calendar from './components/Calendar';
import SEOHead from './components/SEOHead';

type Page = 'home' | 'calendar';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'calendar':
        return <Calendar />;
      case 'home':
      default:
        return (
          <>
            <Hero />
            <div id="services">
              <Services />
            </div>
            <CustomPackages />
            <div id="extras">
              <Extras />
            </div>
            <div id="tarifs">
              <Pricing />
            </div>
            <div id="contact">
              <Contact />
            </div>
          </>
        );
    }
  };

  return (
    <div className="App">
      <SEOHead />
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      {renderPage()}
      <Footer />
    </div>
  );
}

export default App;
