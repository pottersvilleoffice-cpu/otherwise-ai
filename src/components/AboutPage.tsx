import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useAI } from '../context/AIContext';
import { Sparkles, ArrowRight, Compass, Heart, GraduationCap, ShieldCheck, Lightbulb, Box, Music, PenTool } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { openAuthModal, isAuthenticated } = useAuth();
  const { setActiveNav } = useAI();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 text-neutral-200">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs font-mono tracking-[0.25em] text-neutral-400 uppercase mb-4">
          <span>THE PHILOSOPHY & STORY</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-[0.14em] text-white drop-shadow-2xl mb-6">
          ABOUT OTHERWISE
        </h1>

        <div className="space-y-4 text-base sm:text-xl font-serif text-amber-100/90 font-light leading-relaxed">
          <p>“OTHERWISE began with a simple question:</p>
          <p className="font-semibold text-white text-xl sm:text-2xl">
            What if technology could do more than answer questions?”
          </p>
        </div>
      </div>

      {/* The Core Concept: From Thought to Reality */}
      <section className="mb-20 sm:mb-28 p-8 sm:p-12 rounded-3xl border border-white/[0.1] bg-[#090b10] shadow-2xl relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-6">
          <span className="text-[10px] font-mono tracking-[0.25em] text-amber-300 uppercase block">
            MORE THAN A CHATBOT
          </span>

          <h2 className="font-serif text-2xl sm:text-3xl text-white font-bold tracking-wide">
            A Place Where Ideas Become Real
          </h2>

          <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
            OTHERWISE was conceived as an all-in-one creative intelligence platform. Most AI tools are fragmented—one window for writing, another for image generation, a third for sound, and a dozen separate dashboards.
          </p>

          <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
            We wanted to build something fundamentally different: a unified universe where an idea can begin as a quiet spark and naturally evolve into something tangible and complete.
          </p>

          {/* Evolution Chain */}
          <div className="my-8 py-6 border-y border-white/[0.08] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
              <span>A thought can become a story.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-fuchsia-400 shrink-0" />
              <span>A story can become a song.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span>A character can become an image.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
              <span>An image can become a 3D model.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-violet-400 shrink-0" />
              <span>A game idea can become a playable project.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
              <span>A question can become knowledge.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-3 sm:col-span-2">
              <span className="w-2 h-2 rounded-full bg-amber-300 shrink-0" />
              <span className="font-serif text-amber-200">A possibility can become an entire alternate world.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mb-20 sm:mb-28 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 rounded-3xl border border-white/[0.1] bg-white/[0.02] flex flex-col justify-between">
          <div>
            <div className="text-xs font-mono uppercase tracking-[0.25em] text-amber-300 mb-2">
              OUR MISSION
            </div>
            <h3 className="font-serif text-2xl text-white font-bold mb-4">
              Approachable Power for Every Creator
            </h3>
            <blockquote className="font-serif italic text-base text-neutral-300 leading-relaxed border-l-2 border-amber-300/60 pl-4 mb-4">
              “Give people one intelligent place where they can turn questions into knowledge, ideas into creations and imagination into possibilities.”
            </blockquote>
          </div>
          <p className="text-xs text-neutral-400 font-light mt-4">
            Democratizing complex creative technology so that anyone with curiosity can build without encountering walls.
          </p>
        </div>

        <div className="p-8 rounded-3xl border border-white/[0.1] bg-white/[0.02] flex flex-col justify-between">
          <div>
            <div className="text-xs font-mono uppercase tracking-[0.25em] text-sky-300 mb-2">
              OUR VISION
            </div>
            <h3 className="font-serif text-2xl text-white font-bold mb-4">
              Unbounded Human Imagination
            </h3>
            <blockquote className="font-serif italic text-base text-neutral-300 leading-relaxed border-l-2 border-sky-300/60 pl-4 mb-4">
              “To build a future where imagination is not limited by the tools available to you.”
            </blockquote>
          </div>
          <p className="text-xs text-neutral-400 font-light mt-4">
            An evolving platform that continues to integrate emerging technologies while preserving its central artistic soul.
          </p>
        </div>
      </section>

      {/* ========================================================= */}
      {/* MEET THE AUTHOR SECTION */}
      {/* ========================================================= */}
      <section className="mb-20 sm:mb-28 pt-10 border-t border-white/[0.1]">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-xs font-mono tracking-widest text-amber-200 uppercase mb-3">
            <Heart className="w-3.5 h-3.5" />
            <span>THE CREATOR'S STORY</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl text-white font-bold tracking-wide mb-3">
            MEET THE AUTHOR: DAVID BODUNDE
          </h2>

          <p className="font-serif italic text-base sm:text-lg text-neutral-300 font-light">
            “Created by <span className="text-white font-semibold not-italic">David Bodunde</span>, a 15-year-old student at Pottersville School who believes that big ideas do not have to wait for a big opportunity.”
          </p>
        </div>

        {/* Visual Timeline Bar */}
        <div className="mb-16 p-6 rounded-2xl border border-white/[0.08] bg-[#07090e] overflow-x-auto scrollbar-none">
          <div className="flex items-center justify-between min-w-[620px] text-[11px] font-mono text-neutral-400">
            <div className="flex flex-col items-center gap-1">
              <span className="text-white font-bold">DAVID BODUNDE</span>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            </div>
            <span className="text-neutral-600">→</span>
            <div className="flex flex-col items-center gap-1">
              <span>CURIOSITY</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            </div>
            <span className="text-neutral-600">→</span>
            <div className="flex flex-col items-center gap-1">
              <span>THE IDEA</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            </div>
            <span className="text-neutral-600">→</span>
            <div className="flex flex-col items-center gap-1">
              <span>LEARNING</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            </div>
            <span className="text-neutral-600">→</span>
            <div className="flex flex-col items-center gap-1">
              <span>BUILDING</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            </div>
            <span className="text-neutral-600">→</span>
            <div className="flex flex-col items-center gap-1">
              <span className="text-amber-300 font-bold">OTHERWISE</span>
              <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
            </div>
            <span className="text-neutral-600">→</span>
            <div className="flex flex-col items-center gap-1">
              <span className="text-sky-300 font-bold">THE FUTURE</span>
              <span className="w-2 h-2 rounded-full bg-sky-400" />
            </div>
          </div>
        </div>

        {/* 9 Structured Story Sections */}
        <div className="space-y-12 max-w-3xl mx-auto">
          {/* 1. THE BEGINNING */}
          <div className="space-y-3">
            <h3 className="font-serif text-xl sm:text-2xl text-white font-bold tracking-wide flex items-center gap-3">
              <span className="text-xs font-mono text-amber-300 px-2 py-0.5 rounded bg-white/[0.05]">01</span>
              <span>THE BEGINNING</span>
            </h3>
            <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
              OTHERWISE was born from the imagination of <span className="text-white font-semibold">David Bodunde</span>, a 15-year-old student who simply refused to believe that age should determine how big a dream can be. While many people see technology as something to consume, David became fascinated by the possibility of creating something truly meaningful with it.
            </p>
            <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
              As a student at <span className="text-white font-medium">Pottersville School</span>, David balances schoolwork, classes, and everyday teenage life with an unrelenting drive to build. The journey takes place not in a Silicon Valley boardroom, but at a school desk between study sessions, notebooks, and late-night coding breakthroughs.
            </p>
          </div>

          {/* 2. THE QUESTION */}
          <div className="space-y-3">
            <h3 className="font-serif text-xl sm:text-2xl text-white font-bold tracking-wide flex items-center gap-3">
              <span className="text-xs font-mono text-amber-300 px-2 py-0.5 rounded bg-white/[0.05]">02</span>
              <span>THE QUESTION</span>
            </h3>
            <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
              It started with a question that wouldn't leave him alone: <em>“Why do we use technology only to answer questions, instead of using it to imagine what could be?”</em>
            </p>
            <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
              He watched friends and classmates scroll through endless feeds, using incredible supercomputers simply as passive mirrors. He wanted to flip that script. He wanted to build an engine that turned the human mind into an active architect.
            </p>
          </div>

          {/* 3. THE IDEA */}
          <div className="space-y-3">
            <h3 className="font-serif text-xl sm:text-2xl text-white font-bold tracking-wide flex items-center gap-3">
              <span className="text-xs font-mono text-amber-300 px-2 py-0.5 rounded bg-white/[0.05]">03</span>
              <span>THE IDEA</span>
            </h3>
            <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
              The idea was audacious for anyone, let alone a 15-year-old: craft an all-in-one creative universe where writing, music, 3D spatial models, code, and alternate timelines live under one roof. Not twenty scattered tools, but one intelligent companion.
            </p>
            <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
              Many people might have waited for adulthood, for a formal computer science degree, or for an investor to say yes. But he realized that waiting is often just fear in disguise.
            </p>
            <blockquote className="font-serif italic text-base text-amber-100 pl-4 border-l-2 border-amber-300/60 my-2">
              “Being young is not a reason to wait. Sometimes, it is the best reason to begin.”
            </blockquote>
          </div>

          {/* 4. LEARNING TO BUILD */}
          <div className="space-y-3">
            <h3 className="font-serif text-xl sm:text-2xl text-white font-bold tracking-wide flex items-center gap-3">
              <span className="text-xs font-mono text-amber-300 px-2 py-0.5 rounded bg-white/[0.05]">04</span>
              <span>LEARNING TO BUILD</span>
            </h3>
            <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
              Building a platform of this scope meant teaching himself full-stack development, modern TypeScript, Three.js 3D rendering, API architectures, and systems design from the ground up.
            </p>
            <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
              There were countless errors, broken layouts, and frustrating compiler bugs. Yet each broken build was treated as a lesson rather than a stop sign. He learned by doing, breaking, rebuilding, and persisting.
            </p>
          </div>

          {/* 5. WHY OTHERWISE? */}
          <div className="space-y-3">
            <h3 className="font-serif text-xl sm:text-2xl text-white font-bold tracking-wide flex items-center gap-3">
              <span className="text-xs font-mono text-amber-300 px-2 py-0.5 rounded bg-white/[0.05]">05</span>
              <span>WHY OTHERWISE?</span>
            </h3>
            <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
              The name OTHERWISE came from a deep fascination with human choices. Every morning, we make dozens of decisions that define who we become. But what about the lives we left behind?
            </p>
            <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
              He created OTHERWISE Mode so people could look into alternate timelines with empathy, wonder, and curiosity. And from that root grew the wider creative intelligence that allows people to make music, design games, and build real things today.
            </p>
          </div>

          {/* 6. THE JOURNEY */}
          <div className="space-y-3">
            <h3 className="font-serif text-xl sm:text-2xl text-white font-bold tracking-wide flex items-center gap-3">
              <span className="text-xs font-mono text-amber-300 px-2 py-0.5 rounded bg-white/[0.05]">06</span>
              <span>THE JOURNEY</span>
            </h3>
            <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
              At Pottersville School, his teachers and classmates know him as a dedicated student. His journey is taking place alongside regular classes, homework, and teenage responsibilities.
            </p>
            <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
              He understands that he is still young and still learning. And that is exactly what makes the journey special. He does not claim to know everything; he simply claims a willingness to learn faster, work harder, and stay curious.
            </p>
            <blockquote className="font-serif italic text-base text-amber-100 pl-4 border-l-2 border-amber-300/60 my-2">
              “He does not expect the first version to be perfect. He expects it to become better.”
            </blockquote>
          </div>

          {/* 7. THE DREAM */}
          <div className="space-y-3">
            <h3 className="font-serif text-xl sm:text-2xl text-white font-bold tracking-wide flex items-center gap-3">
              <span className="text-xs font-mono text-amber-300 px-2 py-0.5 rounded bg-white/[0.05]">07</span>
              <span>THE DREAM</span>
            </h3>
            <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
              His dream is not just to build software, but to build something that outlives the screen. He envisions OTHERWISE growing into a platform used by writers, students, game developers, dreamers, and explorers worldwide.
            </p>
            <blockquote className="font-serif italic text-base text-amber-100 pl-4 border-l-2 border-amber-300/60 my-2">
              “The dream is bigger than an app. The app is simply where the dream begins.”
            </blockquote>
          </div>

          {/* 8. WHAT COMES NEXT */}
          <div className="space-y-3">
            <h3 className="font-serif text-xl sm:text-2xl text-white font-bold tracking-wide flex items-center gap-3">
              <span className="text-xs font-mono text-amber-300 px-2 py-0.5 rounded bg-white/[0.05]">08</span>
              <span>WHAT COMES NEXT</span>
            </h3>
            <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
              OTHERWISE will continue to expand. As artificial intelligence advances, new capabilities in 3D physics, real-time spatial synthesis, multi-track audio generation, and collaborative worldbuilding will be connected.
            </p>
            <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
              The creator plans to grow alongside his creation, learning new disciplines and listening carefully to everyone who uses it.
            </p>
          </div>

          {/* 9. A NOTE FROM THE AUTHOR */}
          <div className="mt-12 p-8 sm:p-10 rounded-3xl border border-amber-400/30 bg-gradient-to-b from-amber-950/20 via-[#0a0c10] to-black space-y-4">
            <div className="text-[10px] font-mono tracking-[0.25em] text-amber-300 uppercase">
              AUTHENTIC WORDS
            </div>
            <h4 className="font-serif text-2xl sm:text-3xl text-white font-bold tracking-wide">
              A NOTE FROM THE AUTHOR
            </h4>
            <div className="space-y-3 text-sm sm:text-base font-serif italic text-neutral-200 font-light leading-relaxed">
              <p>“I know I am only beginning.</p>
              <p>I know there is still a lot I have to learn, and I know OTHERWISE will change many times as I grow.</p>
              <p>But I believe every great creation starts somewhere.</p>
              <p>I want to keep learning. I want to keep building. I want to create something that people can genuinely find useful in their lives.</p>
              <p>And I want to look back one day and remember that I started when the idea was still just an idea.”</p>
              <p className="font-semibold text-amber-100 text-lg pt-2 not-italic">
                “OTHERWISE is my beginning — not my ending.”
              </p>
            </div>
            <div className="pt-4 border-t border-white/[0.08] text-xs font-mono text-neutral-400">
              — David Bodunde, 15-Year-Old Creator of OTHERWISE (Student at Pottersville School)
            </div>
          </div>
        </div>

        {/* CTA to Join & Build */}
        <div className="mt-16 text-center max-w-xl mx-auto space-y-4">
          <h3 className="font-serif text-2xl text-white font-bold">
            Ready to Explore What's Possible?
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 font-light">
            Step into the workspace and see where your ideas can lead.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {!isAuthenticated ? (
              <button
                onClick={() => openAuthModal('signup')}
                className="h-12 px-7 rounded-xl bg-white text-neutral-950 font-serif font-bold text-xs uppercase tracking-[0.18em] hover:bg-neutral-200 cursor-pointer shadow-lg"
              >
                CREATE FREE ACCOUNT
              </button>
            ) : (
              <button
                onClick={() => setActiveNav('home')}
                className="h-12 px-7 rounded-xl bg-white text-neutral-950 font-serif font-bold text-xs uppercase tracking-[0.18em] hover:bg-neutral-200 cursor-pointer shadow-lg"
              >
                OPEN WORKSPACE
              </button>
            )}
            <button
              onClick={() => setActiveNav('otherwise')}
              className="h-12 px-6 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-white text-xs font-mono uppercase tracking-wider cursor-pointer"
            >
              EXPLORE OTHERWISE MODE
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
