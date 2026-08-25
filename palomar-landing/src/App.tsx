import React, { useState, useEffect } from "react";
import { ChevronDown, ArrowRight, Triangle } from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-brand-cream/90 backdrop-blur-md shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="relative flex items-center h-16 md:h-20">
            {/* Desktop Left Links */}
            <div className="hidden md:flex items-center gap-8 animate-fade-down stagger-1">
              <button
                type="button"
                className="flex items-center gap-1 text-sm text-brand-dark tracking-wide uppercase hover:opacity-70 transition-opacity"
              >
                Solutions
                <ChevronDown className="w-3.5 h-3.5 text-brand-dark" />
              </button>
              <a
                href="#plans"
                className="text-sm text-brand-dark tracking-wide uppercase hover:opacity-70 transition-opacity"
              >
                Plans
              </a>
              <a
                href="#news"
                className="text-sm text-brand-dark tracking-wide uppercase hover:opacity-70 transition-opacity"
              >
                News
              </a>
            </div>

            {/* Center Logo */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 animate-fade-down stagger-2">
              <Triangle className="w-5 h-5 text-brand-dark fill-brand-dark" />
              <span className="text-xl text-brand-dark tracking-tight font-helvetica-neue">
                Palomar
              </span>
            </div>

            {/* Desktop CTA */}
            <a
              href="#try"
              className="hidden md:inline-flex items-center ml-auto px-5 py-2.5 bg-brand-dark text-white text-sm tracking-wide uppercase rounded-full hover:bg-brand-green transition-colors animate-fade-down stagger-3"
            >
              Try It Free
            </a>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden ml-auto z-50 w-10 h-10 relative flex items-center justify-center focus:outline-none"
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-5">
                <span
                  className={`absolute left-0 top-[6px] w-6 h-[2px] bg-brand-dark rounded transition-all duration-300 ease-[cubic-bezier(0.68,-0.6,0.32,1.6)] ${
                    isMobileMenuOpen ? "rotate-45 translate-y-[5px]" : ""
                  }`}
                />
                <span
                  className={`absolute left-0 top-[13px] w-6 h-[2px] bg-brand-dark rounded transition-all duration-300 ease-[cubic-bezier(0.68,-0.6,0.32,1.6)] ${
                    isMobileMenuOpen ? "-rotate-45" : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-brand-cream z-40 transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`flex flex-col items-center justify-center h-full gap-8 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] delay-100 ${
            isMobileMenuOpen
              ? "translate-y-0 opacity-100"
              : "-translate-y-8 opacity-0"
          }`}
        >
          <a
            href="#solutions"
            onClick={closeMobileMenu}
            className="text-3xl text-brand-dark tracking-tight"
          >
            Solutions
          </a>
          <a
            href="#plans"
            onClick={closeMobileMenu}
            className="text-3xl text-brand-dark tracking-tight"
          >
            Plans
          </a>
          <a
            href="#news"
            onClick={closeMobileMenu}
            className="text-3xl text-brand-dark tracking-tight"
          >
            News
          </a>
          <a
            href="#try"
            onClick={closeMobileMenu}
            className="mt-4 inline-flex items-center px-8 py-3.5 bg-brand-dark text-white text-lg tracking-wide rounded-full"
          >
            Try It Free
          </a>
        </div>
      </div>
    </>
  );
}

export function TrustedBy() {
  return (
    <div className="w-full mt-8 md:mt-10 animate-fade-up stagger-5">
      <div className="text-left text-xs tracking-[0.25em] uppercase text-brand-dark/50 mb-6 md:mb-8 font-helvetica-neue">
        Backed by
      </div>
      <div className="flex flex-wrap items-center justify-start gap-6 md:gap-12 lg:gap-16 animate-fade-up stagger-6">
        <span className="font-playfair text-lg md:text-xl lg:text-2xl text-brand-dark/80 whitespace-nowrap">
          Meridian
        </span>
        <span className="font-oswald uppercase text-lg md:text-xl lg:text-2xl text-brand-dark/80 whitespace-nowrap">
          STELLEX
        </span>
        <span className="font-montserrat text-lg md:text-xl lg:text-2xl text-brand-dark/80 whitespace-nowrap">
          Luminar
        </span>
        <span className="font-roboto-slab uppercase text-lg md:text-xl lg:text-2xl text-brand-dark/80 whitespace-nowrap">
          OVERLAND
        </span>
        <span className="font-raleway text-lg md:text-xl lg:text-2xl text-brand-dark/80 whitespace-nowrap">
          Kinetic
        </span>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative w-full h-screen min-h-[700px] overflow-hidden bg-brand-cream">
      {/* Video layer */}
      <div className="absolute inset-0">
        <video
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260820_010308_b1636845-4c15-4ab6-b0c9-9a29bfb0c6e3.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover object-bottom"
        />
      </div>

      {/* Content column */}
      <div className="relative z-10 flex flex-col items-start max-w-7xl mx-auto pt-28 md:pt-36 px-6 lg:px-8">
        {/* Announcement pill */}
        <a
          href="#announcement"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-dark/15 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-colors mb-5 md:mb-6 animate-fade-up stagger-3"
        >
          <span className="text-sm text-brand-dark">
            Live for everyone today! Offering $1MM in credits.
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-brand-dark" />
        </a>

        {/* Headline */}
        <h1 className="text-left text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-brand-dark leading-[1.05] tracking-tight max-w-4xl font-helvetica-neue animate-fade-up stagger-4">
          One unified system to build,
          <br className="hidden sm:block" /> test, ship, and observe LLMs
        </h1>

        {/* Trusted by */}
        <TrustedBy />
      </div>
    </section>
  );
}

export default function App() {
  return (
    <main className="font-helvetica-neue relative min-h-screen bg-brand-cream selection:bg-brand-dark selection:text-white">
      <Navbar />
      <Hero />
    </main>
  );
}
