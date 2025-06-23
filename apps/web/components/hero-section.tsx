'use client';

import React, { useEffect, useRef } from 'react';
import { BarChart3, TrendingUp, Leaf, ArrowRight, Sparkles, Play } from 'lucide-react';

export default function HeroSection() {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonsRef = useRef(null);
  const cardsRef = useRef(null);
  const statsRef = useRef(null);
  const floatingIconsRef = useRef([]);
  const orbsRef = useRef([]);

  useEffect(() => {
    // Dynamic import for GSAP to avoid SSR issues
    const loadGSAP = async () => {
      try {
        const { gsap } = await import('gsap');
        const { ScrollTrigger } = await import('gsap/ScrollTrigger');
        
        gsap.registerPlugin(ScrollTrigger);

        // Initial setup - hide elements
        if (titleRef.current && subtitleRef.current && buttonsRef.current) {
          gsap.set([titleRef.current, subtitleRef.current, buttonsRef.current], {
            opacity: 0,
            y: 50
          });
        }

        gsap.set('.feature-card', {
          opacity: 0,
          y: 30,
          scale: 0.95
        });

        gsap.set('.stat-item', {
          opacity: 0,
          y: 20
        });

        gsap.set('.floating-icon', {
          opacity: 0,
          scale: 0.8
        });

        // Create timeline for entrance animations
        const tl = gsap.timeline({ delay: 0.2 });

        // Hero entrance animations
        if (titleRef.current) {
          tl.to(titleRef.current, {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power3.out"
          });
        }

        if (subtitleRef.current) {
          tl.to(subtitleRef.current, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out"
          }, "-=0.8");
        }

        if (buttonsRef.current) {
          tl.to(buttonsRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out"
          }, "-=0.6");
        }

        // Stagger animation for feature cards
        gsap.to('.feature-card', {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          delay: 1.5
        });

        // Stats animation
        gsap.to('.stat-item', {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
          delay: 2
        });

        // Floating icons animation
        gsap.to('.floating-icon', {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.2,
          ease: "back.out(1.7)",
          delay: 2.2
        });

        // Continuous floating animation for icons
        gsap.to('.floating-icon', {
          y: -10,
          duration: 2,
          ease: "power1.inOut",
          yoyo: true,
          repeat: -1,
          stagger: 0.3
        });

        // Parallax effect for gradient orbs
        gsap.to('.gradient-orb-1', {
          y: -50,
          x: -30,
          rotation: 360,
          duration: 20,
          ease: "none",
          repeat: -1
        });

        gsap.to('.gradient-orb-2', {
          y: 30,
          x: 50,
          rotation: -360,
          duration: 25,
          ease: "none",
          repeat: -1
        });

        // Scroll-triggered animations
        ScrollTrigger.create({
          trigger: '.feature-cards',
          start: "top 80%",
          end: "bottom 20%",
          onEnter: () => {
            gsap.to('.feature-card', {
              rotateX: 0,
              rotateY: 0,
              duration: 0.8,
              stagger: 0.1,
              ease: "power2.out"
            });
          }
        });

        // Hover animations for buttons
        const buttons = document.querySelectorAll<HTMLButtonElement>('.hero-button');
        buttons.forEach((button) => {
          const handleMouseEnter = () => {
            gsap.to(button, {
              scale: 1.05,
              duration: 0.3,
              ease: "power2.out"
            });
          };

          const handleMouseLeave = () => {
            gsap.to(button, {
              scale: 1,
              duration: 0.3,
              ease: "power2.out"
            });
          };

          button.addEventListener('mouseenter', handleMouseEnter);
          button.addEventListener('mouseleave', handleMouseLeave);

          // Store cleanup functions
          (button as any).__gsapCleanup = () => {
            button.removeEventListener('mouseenter', handleMouseEnter);
            button.removeEventListener('mouseleave', handleMouseLeave);
          };
        });

        // Card hover effects
        const cards = document.querySelectorAll<HTMLDivElement>('.feature-card');
        cards.forEach((card) => {
          const handleMouseEnter = () => {
            gsap.to(card, {
              y: -5,
              scale: 1.02,
              duration: 0.3,
              ease: "power2.out"
            });
          };

          const handleMouseLeave = () => {
            gsap.to(card, {
              y: 0,
              scale: 1,
              duration: 0.3,
              ease: "power2.out"
            });
          };

          card.addEventListener('mouseenter', handleMouseEnter);
          card.addEventListener('mouseleave', handleMouseLeave);

          // Store cleanup functions
          (card as any).__gsapCleanup = () => {
            card.removeEventListener('mouseenter', handleMouseEnter);
            card.removeEventListener('mouseleave', handleMouseLeave);
          };
        });

      } catch (error) {
        console.error('Error loading GSAP:', error);
      }
    };

    loadGSAP();

    // Cleanup function
    return () => {
      try {
        // Clean up ScrollTrigger instances
        if (typeof window !== 'undefined' && (window as any).ScrollTrigger) {
          (window as any).ScrollTrigger.getAll().forEach((trigger: any) => trigger.kill());
        }

        // Clean up event listeners
        const buttons = document.querySelectorAll<HTMLButtonElement>('.hero-button');
        buttons.forEach((button) => {
          if ((button as any).__gsapCleanup) {
            (button as any).__gsapCleanup();
          }
        });

        const cards = document.querySelectorAll<HTMLDivElement>('.feature-card');
        cards.forEach((card) => {
          if ((card as any).__gsapCleanup) {
            (card as any).__gsapCleanup();
          }
        });
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    };
  }, []);

  return (
    <div ref={heroRef} className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:72px_72px]"></div>
        
        {/* Gradient Orbs */}
        <div className="gradient-orb-1 absolute top-1/4 -left-20 w-96 h-96 bg-gradient-to-r from-green-400/5 to-emerald-400/5 rounded-full blur-3xl"></div>
        <div className="gradient-orb-2 absolute bottom-1/4 -right-20 w-80 h-80 bg-gradient-to-l from-teal-400/5 to-green-400/5 rounded-full blur-3xl"></div>
        
        {/* Floating Particles */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-green-400 rounded-full opacity-30 animate-ping"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-emerald-300 rounded-full animate-pulse"></div>
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-teal-400 rounded-full opacity-40 animate-ping"></div>
      </div>

      {/* Floating Icons */}
      <div className="floating-icon absolute top-24 left-16 p-3 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-xl backdrop-blur-sm border border-green-400/20">
        <Leaf className="w-5 h-5 text-green-400" />
      </div>
      <div className="floating-icon absolute top-40 right-32 p-3 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-xl backdrop-blur-sm border border-green-400/20">
        <BarChart3 className="w-5 h-5 text-green-400" />
      </div>
      <div className="floating-icon absolute bottom-40 left-24 p-3 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-xl backdrop-blur-sm border border-green-400/20">
        <TrendingUp className="w-5 h-5 text-green-400" />
      </div>
      <div className="floating-icon absolute top-1/3 right-16 p-3 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-xl backdrop-blur-sm border border-green-400/20">
        <Sparkles className="w-5 h-5 text-green-400" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm mb-8">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Turborepo + Next.js
          </div>

          {/* Main Heading */}
          <div className="mb-8">
            <h1 ref={titleRef} className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Smart Farm
              <br />
              <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Analytics
              </span>
            </h1>
            <p ref={subtitleRef} className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Track earnings, optimize investments, and maximize yields with intelligent data insights. 
              Transform your farming decisions with real-time analytics.
            </p>
          </div>

          {/* CTA Buttons */}
          <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button className="hero-button relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-full font-medium transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25">
              <span className="relative z-10 flex items-center gap-2">
                Start Tracking
                <ArrowRight className="w-4 h-4" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            </button>
            <button className="hero-button bg-white/5 backdrop-blur-sm border border-white/10 text-white px-8 py-4 rounded-full font-medium hover:bg-white/10 transition-all duration-300 flex items-center gap-2 justify-center">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Play className="w-3 h-3 ml-0.5" />
              </div>
              View Demo
            </button>
          </div>

          {/* Feature Cards */}
          <div className="feature-cards grid md:grid-cols-3 gap-6 mb-16">
            <div className="feature-card p-6 bg-white/2 backdrop-blur-sm border border-white/5 rounded-2xl hover:bg-white/5 hover:border-green-400/20 transition-all duration-500">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-xl flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Track Earnings</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Monitor farm profitability and revenue streams in real-time with comprehensive analytics.</p>
            </div>

            <div className="feature-card p-6 bg-white/2 backdrop-blur-sm border border-white/5 rounded-2xl hover:bg-white/5 hover:border-green-400/20 transition-all duration-500">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Smart Investments</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Get data-driven recommendations on where to invest for maximum ROI and growth.</p>
            </div>

            <div className="feature-card p-6 bg-white/2 backdrop-blur-sm border border-white/5 rounded-2xl hover:bg-white/5 hover:border-green-400/20 transition-all duration-500">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-xl flex items-center justify-center mb-4">
                <Leaf className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Increase Yields</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Optimize crop production with insights that help you make better farming decisions.</p>
            </div>
          </div>

          {/* Stats */}
          <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="stat-item text-center">
              <div className="text-2xl md:text-3xl font-bold text-green-400 mb-1">+25%</div>
              <div className="text-sm text-gray-500">Avg Yield Increase</div>
            </div>
            <div className="stat-item text-center">
              <div className="text-2xl md:text-3xl font-bold text-emerald-400 mb-1">$50K</div>
              <div className="text-sm text-gray-500">Revenue Tracked</div>
            </div>
            <div className="stat-item text-center">
              <div className="text-2xl md:text-3xl font-bold text-teal-400 mb-1">150+</div>
              <div className="text-sm text-gray-500">Farms Managed</div>
            </div>
            <div className="stat-item text-center">
              <div className="text-2xl md:text-3xl font-bold text-green-400 mb-1">24/7</div>
              <div className="text-sm text-gray-500">Monitoring</div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="pt-8 border-t border-white/5">
            <p className="text-gray-500 mb-4">Built for modern farmers, by developers who care</p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                TypeScript
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Tailwind CSS
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                GSAP
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}