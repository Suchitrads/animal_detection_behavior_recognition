import React from "react";
import Slider from "react-slick";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Home = () => {
  const heroSliderSettings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    fade: true,
  };

  const heroImages = [
    "/images/wildlife-1.jpg",
    "/images/wildlife-2.jpg",
    "/images/wildlife-3.jpg",
    "/images/wildlife-4.jpg",
  ];

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">

      {/* Navbar */}
      <header className="fixed top-0 left-0 w-full bg-gray-800 px-10 py-5 z-50 shadow-lg flex items-center justify-between">
        <h1 className="text-2xl font-bold">INSTAWILD</h1>
        <nav>
          <ul className="flex space-x-6 items-center">
            <li><a href="/signin" className="hover:text-gray-400">SIGN IN</a></li>
            <li><a href="/signup" className="hover:text-gray-400">SIGNUP</a></li>
            <li><a href="#about-us" className="hover:text-gray-400">ABOUT US</a></li>
            <li><a href="#our-work" className="hover:text-gray-400">OUR WORK</a></li>
          </ul>
        </nav>
      </header>

      {/* Main Content Wrapper (padding to avoid overlap) */}
      <div className="pt-[100px] relative z-10">

        {/* Hero Slider */}
        <section className="relative h-screen overflow-hidden z-0">
          <Slider {...heroSliderSettings}>
            {heroImages.map((src, index) => (
              <div key={index}>
                <div
                  className="h-screen bg-cover bg-center relative"
                  style={{ backgroundImage: `url('${src}')` }}
                >
                  <div className="absolute inset-0 bg-black opacity-60 pointer-events-none"></div>
                  <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-6">
                    <h1 className="text-5xl font-bold text-white leading-tight">
                      Revolutionizing Wildlife Monitoring
                    </h1>
                    <p className="mt-4 text-lg text-gray-200 max-w-2xl mx-auto">
                      AI-driven solutions for automating wildlife analysis, from species identification to behavior tracking.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </section>

        {/* About Us Section */}
        <section
          id="about-us"
          className="relative h-[900px] bg-cover bg-center flex items-center justify-center"
          style={{ backgroundImage: "url('/images/aboutus.jpeg')" }} // Replace with your image
        >
          <div className="bg-white/30 backdrop-blur-md p-8 rounded-lg shadow-xl max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-4">About InstaWild</h2>
            <p className="text-white text-lg">
              At InstaWild, we harness the power of AI and computer vision to protect and monitor wildlife. 
              Our system provides real-time tracking, behavior analysis, and automated alerts, helping researchers and conservationists take informed action faster.
            </p>
          </div>
        </section>


        {/* Our Work Section */}
        <section id="our-work" className="py-20 bg-gray-100 text-gray-800">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold">Our Work</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              From rescuing distressed wildlife to deploying AI-powered monitoring systems, we focus on protecting nature through technology and compassion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
            {/* Wildlife Rescue */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105 duration-300">
              <img src="/images/pexels-twilightkenya-7335639.jpg" alt="Wildlife Rescue" className="w-full h-90 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Wildlife Rescue</h3>
                <p className="text-gray-600">
                  We support wildlife rescue operations by using real-time detection and alerts, helping field teams act swiftly in emergencies.
                </p>
              </div>
            </div>

            {/* Habitat Protection */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105 duration-300">
              <img src="/images/OIP.jpeg" alt="Habitat Protection" className="w-full h-90 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Habitat Protection</h3>
                <p className="text-gray-600">
                  Our systems help detect encroachments, monitor animal movement, and reduce human-wildlife conflict near sensitive zones.
                </p>
              </div>
            </div>

            {/* Conservation Tech */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105 duration-300">
              <img src="/images/Sound-monitoring-768x511.jpg" alt="Conservation Tech" className="w-full h-90 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Conservation Technology</h3>
                <p className="text-gray-600">
                  With AI and computer vision, we bring data-driven insights to conservationists and researchers to make faster, smarter decisions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h5 className="text-lg font-bold mb-2">Follow Us</h5>
                <div className="flex space-x-4">
                  <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition"><FaFacebook size={24} /></a>
                  <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition"><FaTwitter size={24} /></a>
                  <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 transition"><FaInstagram size={24} /></a>
                  <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition"><FaLinkedin size={24} /></a>
                </div>
              </div>
            </div>
            <div className="text-center mt-6 border-t border-gray-700 pt-4">
              <p>© 2025 InstaWild. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;
