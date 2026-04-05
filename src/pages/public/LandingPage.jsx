
import Navbar from "../../components/Navbar"
import HeroSection from "../../components/HeroSection"
import ServicesSection from "../../components/ServicesSection";
import DoctorsSection from "../../components/DoctorsSection"
import ContactSection from "../../components/ContactSection"

function LandingPage() {
  return (
    <div>
        <Navbar/>
      <HeroSection/>
      <ServicesSection/>
      <DoctorsSection/>
      <ContactSection/>
   
      
    </div>
  )
}

export default LandingPage