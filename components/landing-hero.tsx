"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";

interface LandingHeroProps {
  onStartAudit: () => void;
}

export function HeroSection({ onStartAudit }: LandingHeroProps) {
  return (
    <div className="relative min-h-screen bg-[#0a0a08] overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full opacity-20 blur-3xl animate-pulse"
          style={{
            background: "radial-gradient(circle, #cc785c 0%, transparent 70%)",
            animationDuration: "4s"
          }}
        />
        <div 
          className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full opacity-15 blur-3xl animate-pulse"
          style={{
            background: "radial-gradient(circle, #d4a574 0%, transparent 70%)",
            animationDuration: "6s",
            animationDelay: "2s"
          }}
        />
        <div 
          className="absolute top-1/4 right-1/4 w-1/2 h-1/2 rounded-full opacity-10 blur-3xl animate-pulse"
          style={{
            background: "radial-gradient(circle, #cc785c 0%, transparent 60%)",
            animationDuration: "5s",
            animationDelay: "1s"
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#cc785c]/30 bg-[#cc785c]/10">
            <span className="text-xs tracking-widest uppercase text-[#cc785c]">
              Free AI Spend Audit
            </span>
          </div>

          {/* Main headline */}
          <h1 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif leading-tight text-[#e8e4df] text-balance"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            {"You're probably overpaying for AI tools."}
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-[#7a756d] max-w-xl mx-auto text-balance">
            Find out exactly how much in 2 minutes. No signup required.
          </p>

          {/* Stats */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 py-4">
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl md:text-3xl font-medium text-[#cc785c]">$340/mo</span>
              <span className="text-sm text-[#7a756d]">Average team waste</span>
            </div>
            <div className="hidden sm:block w-px h-12 bg-[#2a2a24]" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl md:text-3xl font-medium text-[#e8e4df]">2 min</span>
              <span className="text-sm text-[#7a756d]">Quick audit</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="space-y-4">
            <Button
              onClick={onStartAudit}
              size="lg"
              className="bg-[#cc785c] hover:bg-[#b86a50] text-[#0a0a08] px-8 py-6 text-base font-medium rounded-lg transition-all hover:scale-105"
            >
              Audit my AI spend
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            {/* Trust indicators */}
            <div className="flex flex-col items-center gap-2 pt-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#cc785c] text-[#cc785c]" />
                ))}
              </div>
              <span className="text-sm text-[#7a756d]">
                Trusted by 1,200+ teams
              </span>
            </div>
          </div>
        </div>

        {/* Logos row */}
        <div className="mt-20 w-full max-w-2xl mx-auto">
          <p className="text-center text-xs text-[#7a756d]/60 uppercase tracking-widest mb-6">
            Audit your spend on
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <span className="text-[#7a756d]/50 text-sm font-medium tracking-wide">Cursor</span>
            <span className="text-[#7a756d]/50 text-sm font-medium tracking-wide">Claude</span>
            <span className="text-[#7a756d]/50 text-sm font-medium tracking-wide">ChatGPT</span>
            <span className="text-[#7a756d]/50 text-sm font-medium tracking-wide">GitHub Copilot</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
