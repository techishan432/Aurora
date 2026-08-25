'use client';

import React, { useState, useEffect } from 'react';
import type { TabId } from '../types';

function ChevronDownIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function ArrowRightIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function TriangleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M13.73 4a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    </svg>
  );
}

type LandingHeroProps = {
  onOpenSession?: () => void;
  onCheckIn?: () => void;
  onNavigate: (tab: TabId) => void;
  isOpenSession?: boolean;
  activeTab?: TabId;
};

export function LandingHero({ onOpenSession, onCheckIn, onNavigate, isOpenSession = false }: LandingHeroProps) {
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

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleCtaClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOpenSession && onCheckIn) {
      onCheckIn();
    } else if (onOpenSession) {
      onOpenSession();
    } else {
      onNavigate('dashboard');
    }
  };

  return (
    <div className="font-helvetica-neue relative w-full overflow-hidden bg-[#faf8f5] text-[#2d3a2e]">
      {/* Fixed Navbar */}
      <nav className={`landing-nav ${isScrolled ? 'scrolled' : 'transparent'}`}>
        <div className="landing-nav-inner">
          <div className="landing-nav-bar">
            {/* Desktop Left Links */}
            <div className="landing-nav-left animate-fade-down stagger-1">
              <button type="button" className="landing-nav-link" onClick={() => onNavigate('dashboard')}>
                Dashboard
                <ChevronDownIcon />
              </button>
            </div>

            {/* Center Logo */}
            <a href="#top" className="landing-nav-center animate-fade-down stagger-2">
              <TriangleIcon className="w-5 h-5 text-[#2d3a2e]" />
              <span className="landing-logo-text">Aurora</span>
            </a>

            {/* Desktop CTA */}
            <button type="button" onClick={handleCtaClick} className="landing-nav-right animate-fade-down stagger-3">
              {isOpenSession ? 'Check In Now' : 'Launch Studio'}
            </button>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="landing-hamburger"
              aria-label="Toggle menu"
            >
              <div className="landing-hamburger-icon">
                <span className={`landing-hamburger-bar top ${isMobileMenuOpen ? 'open' : ''}`} />
                <span className={`landing-hamburger-bar bottom ${isMobileMenuOpen ? 'open' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Full-Screen Overlay */}
      <div className={`landing-mobile-overlay ${isMobileMenuOpen ? 'open' : 'closed'}`}>
        <div className={`landing-mobile-inner ${isMobileMenuOpen ? 'open' : 'closed'}`}>
          <button
            type="button"
            className="landing-mobile-link"
            onClick={() => {
              closeMobileMenu();
              onNavigate('dashboard');
            }}
          >
            Dashboard
          </button>
          <button
            type="button"
            className="landing-mobile-cta"
            onClick={(e) => {
              closeMobileMenu();
              handleCtaClick(e);
            }}
          >
            {isOpenSession ? 'Check In Now' : 'Launch Studio'}
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="landing-hero-section">
        {/* Background Video */}
        <div className="landing-video-layer">
          <video
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260820_010308_b1636845-4c15-4ab6-b0c9-9a29bfb0c6e3.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
        </div>

        {/* Content Column */}
        <div className="landing-content-col">
          {/* Announcement Pill */}
          <a href="#announcement" onClick={handleCtaClick} className="landing-pill animate-fade-up stagger-3">
            <span className="landing-pill-text">
              Live on Midnight Preprod today! Zero-knowledge student attendance.
            </span>
            <ArrowRightIcon className="w-3.5 h-3.5 text-[#2d3a2e]" />
          </a>

          {/* Headline */}
          <h1 className="landing-headline animate-fade-up stagger-4">
            One unified system to build,
            <br className="landing-headline-break" /> test, ship, and observe attendance
          </h1>

          {/* Backed By Row */}
          <div className="landing-backed-wrap animate-fade-up stagger-5">
            <div className="landing-backed-label">Backed by</div>
            <div className="landing-logos-row animate-fade-up stagger-6">
              <span className="landing-wordmark font-playfair">MIDNIGHT</span>
              <span className="landing-wordmark font-oswald uppercase">IOG</span>
              <span className="landing-wordmark font-montserrat">COMPACT</span>
              <span className="landing-wordmark font-roboto-slab uppercase">LACE</span>
              <span className="landing-wordmark font-raleway">CARDANO</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
