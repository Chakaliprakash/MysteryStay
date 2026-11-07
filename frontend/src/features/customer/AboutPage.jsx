import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Code2, 
  Terminal, 
  Cpu, 
  ShieldCheck, 
  Lock, 
  Database, 
  Layers, 
  Github, 
  Linkedin, 
  Mail, 
  ExternalLink,
  Award,
  ArrowRight,
  UserCheck,
  Quote
} from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-12 space-y-16">
      {/* 1. Header with Tagline */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#14251F] text-[#C6A66B] text-xs font-semibold border border-[#C6A66B]/30 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Architect Behind MysteryStay</span>
        </div>
        <h1 className="font-editorial text-4xl sm:text-6xl text-[#14251F] leading-tight">
          About the Developer
        </h1>
        <p className="text-lg sm:text-xl font-light text-[#8C6D32] italic">
          "Discover Hidden Stays. Unlock Better Deals."
        </p>
      </div>

      {/* 2. Developer Profile Card */}
      <div className="bg-white rounded-3xl border border-[#E4DFD5] shadow-luxury-lg p-8 sm:p-12 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Photo Placeholder / Monogram Crest */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center text-center">
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-3xl overflow-hidden bg-gradient-to-br from-[#14251F] to-[#0C1814] border-2 border-[#C6A66B] shadow-2xl flex flex-col items-center justify-center p-4 group">
              {/* Image with fallback */}
              <img 
                src="/prakash-chakali.jpg" 
                alt="Prakash Chakali" 
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              <div className="w-20 h-20 rounded-2xl bg-[#C6A66B]/20 border border-[#C6A66B]/40 flex items-center justify-center text-[#DFCA9E] font-editorial text-3xl font-bold mb-3 shadow-inner">
                PC
              </div>
              <span className="text-xs font-bold text-white tracking-wider uppercase">
                Prakash Chakali
              </span>
              <span className="text-[10px] text-[#C6A66B] font-medium tracking-wide">
                Founder & Developer
              </span>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-[#F8F6F0] hover:bg-[#EFECE4] text-[#14251F] transition-colors border border-[#E4DFD5]"
                title="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-[#F8F6F0] hover:bg-[#EFECE4] text-[#14251F] transition-colors border border-[#E4DFD5]"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="mailto:prakash.chakali@mysterystay.com"
                className="p-2.5 rounded-xl bg-[#F8F6F0] hover:bg-[#EFECE4] text-[#14251F] transition-colors border border-[#E4DFD5]"
                title="Email Prakash"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Bio & Official Personal Statement */}
          <div className="lg:col-span-8 space-y-6">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C6A66B]">
                  Prakash Chakali — Founder & Developer
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#0D8A5E] border border-emerald-200 text-[10px] font-bold">
                  Java & Full-Stack Architect
                </span>
              </div>
              <h2 className="font-editorial text-3xl sm:text-4xl text-[#14251F]">
                Prakash Chakali
              </h2>
              <p className="text-xs text-[#5A626A] font-medium">
                Founder & Lead Engineer of MysteryStay
              </p>
            </div>

            {/* Official Bio Statement */}
            <div className="p-6 bg-[#F8F6F0] rounded-2xl border-l-4 border-[#C6A66B] space-y-3">
              <p className="text-sm sm:text-base text-[#1C1F24] leading-relaxed font-normal">
                "I am a passionate Java developer focused on building scalable, user-friendly applications using Java, Spring Boot, React, and MySQL. I enjoy solving real-world problems through technology, exploring data structures and algorithms, and designing modern software experiences."
              </p>
              <p className="text-sm sm:text-base text-[#1C1F24] leading-relaxed font-normal">
                "MysteryStay reflects my interest in combining innovative ideas with practical technology to make travel more affordable and accessible."
              </p>
              <div className="text-xs font-bold text-[#8C6D32] pt-1">
                — Prakash Chakali, Founder & Developer
              </div>
            </div>

            {/* Core Tech Stack Chips */}
            <div className="space-y-2 pt-2 border-t border-[#EFECE4]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A626A] block">
                Core Engineering Stack:
              </span>
              <div className="flex flex-wrap gap-2 text-[11px] font-medium text-[#14251F]">
                {[
                  'Java 21',
                  'Spring Boot 3.3.5',
                  'Spring Security (JWT)',
                  'Hibernate (ddl-auto=validate)',
                  'MySQL 9.x Flyway (v7)',
                  'Pessimistic Row Locking',
                  'HMAC-SHA256 Razorpay Sandbox',
                  'React 18 & Vite',
                  'Tailwind CSS',
                  'Framer Motion',
                  'Recharts Analytics',
                  'DSA Top-K Min-Heap',
                  'Sliding Window Stay Optimizer'
                ].map((tech) => (
                  <span
                    key={tech}
                    className="px-2.5 py-1 rounded-lg bg-[#F8F6F0] border border-[#E4DFD5] text-[#14251F]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Project Vision & Philosophy */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-3xl p-8 border border-[#E4DFD5] shadow-luxury space-y-4">
          <div className="w-10 h-10 rounded-xl bg-[#14251F] text-[#C6A66B] flex items-center justify-center font-bold">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-editorial text-2xl text-[#14251F]">
            Zero Rate-Parity Conflict
          </h3>
          <p className="text-xs text-[#5A626A] leading-relaxed">
            Hotels publish discounted distressed inventory. The identity masking algorithm strictly conceals property name, exact street address, and phone coordinates until the traveler completes payment.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-[#E4DFD5] shadow-luxury space-y-4">
          <div className="w-10 h-10 rounded-xl bg-[#14251F] text-[#C6A66B] flex items-center justify-center font-bold">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-editorial text-2xl text-[#14251F]">
            Algorithms in Production
          </h3>
          <p className="text-xs text-[#5A626A] leading-relaxed">
            Algorithms are not theoretical exercises. MysteryStay runs an <strong>O(N log K) Bounded Min-Heap</strong> for deal scoring, an <strong>Inverted Index</strong> for sub-ms search, and a <strong>Sliding Window</strong> calendar price optimizer.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-[#E4DFD5] shadow-luxury space-y-4">
          <div className="w-10 h-10 rounded-xl bg-[#14251F] text-[#C6A66B] flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-editorial text-2xl text-[#14251F]">
            Concurrency & Integrity
          </h3>
          <p className="text-xs text-[#5A626A] leading-relaxed">
            Zero double-booking risk achieved through <code>@Lock(LockModeType.PESSIMISTIC_WRITE)</code> (<code>SELECT ... FOR UPDATE</code>) on inventory records, backed by 58 automated unit and concurrency stress tests.
          </p>
        </div>
      </div>

      {/* 4. Interviewer Quick Navigation CTA */}
      <div className="bg-[#14251F] text-white rounded-3xl p-8 sm:p-12 border border-[#C6A66B]/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C6A66B]">
            Interviewer & Reviewer Sandbox
          </span>
          <h3 className="font-editorial text-2xl sm:text-3xl text-white">
            Inspect the Live Implementation
          </h3>
          <p className="text-xs text-white/70 max-w-xl">
            Switch personas in the top navigation bar to test as Traveler, Hotel Partner, or Platform Admin, or explore the live interactive DSA Laboratory.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/dsa-lab"
            className="px-5 py-3 rounded-xl bg-[#C6A66B] hover:bg-[#B5955A] text-[#14251F] text-xs font-bold uppercase tracking-wider transition-all shadow-luxury-gold inline-flex items-center gap-2"
          >
            <Cpu className="w-4 h-4" /> Open DSA Lab
          </Link>
          <Link
            to="/search"
            className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-all inline-flex items-center gap-2"
          >
            Explore Deals <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
