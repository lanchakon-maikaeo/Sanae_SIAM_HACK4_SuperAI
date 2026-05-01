/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { 
  X, 
  ChevronRight, 
  ArrowLeft, 
  MessageSquare, 
  Send, 
  Search, 
  Menu,
  MapPin, 
  Map,
  ShieldCheck, 
  History, 
  Utensils, 
  Info,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Gem
} from 'lucide-react';
import culturalData from './data.json';

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
const GEMINI_SYSTEM_PROMPT = "You are Thai Cultural Guide AI for Sanaé SIAM web app. Answer questions about Thai destinations, food, and tips in warm precise English. For destinations: cover dress code, customs, activities, timing, fees. For food: cover region, allergens, dietary tags, spice level, price in THB. Keep answers to 3–4 short paragraphs. End with one follow-up question.";

// --- TYPES ---

type Region = 'Central' | 'North' | 'Northeast' | 'South' | 'East' | 'West' | 'All';

interface Destination {
  id: string;
  name: string;
  region: Region;
  province?: string;
  image: string;
  poeticDescription: string;
  pills: string[];
  dressCode: string[];
  customs: string[];
  activities: string[];
  googleMapsUrl?: string;
  quote: string;
}

interface Festival {
  name: string;
  month: string;
  image: string;
  description: string;
  sensitivity: 'Low' | 'Medium' | 'High';
}

interface Dish {
  name: string;
  region: string;
  image: string;
  spice: number;
  allergens: string[];
  dietary: string[];
  color: string;
  isVegan?: boolean;
}

interface Tip {
  topic: string;
  sensitivity: 'Low' | 'Medium' | 'High';
  dos: string[];
  donts: string[];
}

interface Message {
  role: 'user' | 'ai';
  content: string;
}

// --- DATA ---

const DESTINATIONS: Destination[] = culturalData.destinations as Destination[];
const FESTIVALS: Festival[] = culturalData.festivals as Festival[];
const DISHES: Dish[] = culturalData.dishes as Dish[];
const TIPS_LIST: Tip[] = culturalData.tips as Tip[];

interface HeritageArt {
  title: string;
  origin: string;
  image: string;
  description: string;
}

interface ArchitectureStyle {
  style: string;
  region: string;
  feature: string;
  description: string;
}

const HERITAGE_ARTS: HeritageArt[] = (culturalData as any).heritage_arts || [];
const ARCHITECTURE: ArchitectureStyle[] = (culturalData as any).architecture || [];

// --- COMPONENTS ---

const ScrollFadeIn = ({ children }: { children: React.ReactNode; key?: React.Key }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

export default function App() {
  const [activeSection, setActiveSection] = useState('thailand');
  const [regionFilter, setRegionFilter] = useState<Region>('All');
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['thailand', 'festivals', 'cuisine', 'tips', 'culture'];
      const scrollPos = window.scrollY + 100;
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element && scrollPos >= element.offsetTop && scrollPos < element.offsetTop + element.offsetHeight) {
          setActiveSection(sectionId);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  };

  const filteredDestinations = regionFilter === 'All' 
    ? DESTINATIONS 
    : DESTINATIONS.filter(d => d.region === regionFilter);

  const sendMessage = async (preset?: string) => {
    const text = preset || userInput;
    if (!text.trim()) return;

    const newMessages: Message[] = [...chatMessages, { role: 'user', content: text }];
    setChatMessages(newMessages);
    setUserInput('');
    setIsTyping(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: text,
        config: {
          systemInstruction: GEMINI_SYSTEM_PROMPT
        }
      });
      
      const responseText = response.text;
      
      if (responseText) {
        setChatMessages([...newMessages, { role: 'ai', content: responseText }]);
      } else {
        setChatMessages([...newMessages, { role: 'ai', content: "I encountered an error. Please try again later." }]);
      }
    } catch (error) {
      console.error("Gemini Error:", error);
      setChatMessages([...newMessages, { role: 'ai', content: "Failed to connect to the advisor. Please ensure your environment is configured correctly." }]);
    } finally {
      setIsTyping(false);
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen selection:bg-terracotta selection:text-white">
      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 left-0 w-full h-20 bg-cream/90 backdrop-blur-sm z-50 border-b border-terracotta/10 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-terracotta flex items-center justify-center text-cream italic font-bold text-sm md:text-base">S</div>
          <span className="serif italic text-xl md:text-2xl text-terracotta font-medium tracking-tight whitespace-nowrap">Sanaé SIAM</span>
        </div>
        
        <div className="flex md:hidden items-center gap-4">
          <button 
            onClick={() => setIsChatOpen(true)}
            className="w-10 h-10 rounded-full bg-[#1a1a1a] text-cream flex items-center justify-center hover:bg-terracotta transition-colors"
          >
            <MessageSquare size={16} />
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="relative z-[100] text-terracotta p-2"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {['Thailand', 'Festivals', 'Cuisine', 'Tips', 'Culture'].map((link) => (
            <button
              key={link}
              onClick={() => scrollToSection(link.toLowerCase())}
              className={`text-sm uppercase tracking-widest font-medium transition-all duration-300 hover:text-terracotta relative pb-1
                ${activeSection === link.toLowerCase() ? 'text-terracotta border-b border-terracotta' : 'text-gray-500'}`}
            >
              {link}
            </button>
          ))}
        </div>

        <button 
          onClick={() => setIsChatOpen(true)}
          className="hidden md:flex bg-[#1a1a1a] text-cream px-6 py-2.5 rounded-full text-xs uppercase tracking-widest font-semibold hover:bg-terracotta transition-colors items-center gap-2"
        >
          <MessageSquare size={14} />
          THAI AI ADVISOR
        </button>
      </nav>

      {/* --- MOBILE MENU OVERLAY --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-cream z-[35] pt-32 px-8 flex flex-col gap-8 md:hidden"
          >
            {['Thailand', 'Festivals', 'Cuisine', 'Tips', 'Culture'].map((link, idx) => (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={link}
                onClick={() => {
                  scrollToSection(link.toLowerCase());
                  setIsMobileMenuOpen(false);
                }}
                className={`text-4xl serif italic text-left pb-4 border-b border-terracotta/10 flex justify-between items-center
                  ${activeSection === link.toLowerCase() ? 'text-terracotta' : 'text-gray-400'}`}
              >
                {link}
                <ChevronRight size={24} className={activeSection === link.toLowerCase() ? 'opacity-100' : 'opacity-0'} />
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- CONTENT --- */}
      <main className="pt-20">
        
        {/* SECTION 1: THAILAND */}
        <section id="thailand" className="py-12 md:py-24 px-6 md:px-8 max-w-7xl mx-auto">
          <header className="mb-12 md:mb-16">
            <h2 className="serif text-6xl sm:text-8xl md:text-9xl font-light mb-8 leading-tight">Thailand</h2>
            
            <div className="flex flex-wrap gap-2 md:gap-4 border-b border-terracotta/10 pb-4 overflow-x-auto no-scrollbar">
              {['All', 'Central', 'East', 'West', 'North', 'Northeast', 'South'].map((region) => (
                <button
                  key={region}
                  onClick={() => setRegionFilter(region as Region)}
                  className={`px-4 py-1 text-sm uppercase tracking-widest font-medium transition-all
                    ${regionFilter === region ? 'text-terracotta border-b border-terracotta' : 'text-gray-400 hover:text-terracotta'}`}
                >
                  {region}
                </button>
              ))}
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
            {filteredDestinations.map((dest) => (
              <motion.div 
                layoutId={dest.id}
                key={dest.id}
                className="group cursor-pointer"
                onClick={() => setSelectedDestination(dest)}
              >
                <div className="aspect-[3/4] bg-cream-dark mb-6 relative overflow-hidden flex items-center justify-center border border-terracotta/5 group-hover:scale-[1.01] transition-transform duration-500">
                  <img 
                    src={dest.image} 
                    alt={dest.name} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
                  <div className="absolute inset-x-8 bottom-8">
                     <div className="bg-cream/90 backdrop-blur-md p-4 border border-white/20 shadow-xl">
                        <span className="text-[10px] uppercase tracking-widest text-terracotta font-bold block mb-1">
                          {dest.province ? `${dest.province} • ` : ''}{dest.region}
                        </span>
                        <h3 className="serif text-3xl mb-2 line-clamp-1">{dest.name}</h3>
                        <p className="italic text-sm text-gray-600 leading-relaxed line-clamp-1">{dest.poeticDescription}</p>
                     </div>
                  </div>
                </div>
                
                <div className="flex flex-nowrap overflow-hidden gap-2 mb-4 no-scrollbar">
                  {dest.pills.map(pill => (
                    <span key={pill} className="text-[9px] uppercase tracking-widest border border-terracotta/30 text-terracotta px-2 py-1 rounded-full whitespace-nowrap">{pill}</span>
                  ))}
                  {dest.googleMapsUrl && (
                    <a 
                      href={dest.googleMapsUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[9px] uppercase tracking-widest bg-terracotta/10 text-terracotta px-2 py-1 rounded-full flex items-center gap-1 hover:bg-terracotta hover:text-cream transition-colors whitespace-nowrap"
                    >
                      <Map size={8} /> Google Map
                    </a>
                  )}
                </div>
                
                <button className="text-sm font-semibold uppercase tracking-widest flex items-center gap-1 group-hover:gap-3 transition-all text-terracotta">
                  Explore <ChevronRight size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SECTION 2: FESTIVALS */}
        <section id="festivals" className="bg-cream-dark/30 py-24 md:py-32 border-y border-terracotta/10 px-6 md:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16">
            <div className="lg:col-span-5">
              <h2 className="serif text-5xl sm:text-7xl md:text-8xl font-light mb-8 leading-tight">Festivals</h2>
              <p className="serif italic text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed">
                "In Thailand, the past is not a museum. It is a river, flowing through every gesture and festival, keeping the spirit of Thailand alive."
              </p>
            </div>
            
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8">
              {FESTIVALS.map((fest) => (
                <ScrollFadeIn key={fest.name}>
                  <div className="bg-cream h-full border border-terracotta/10 hover:border-terracotta/30 transition-colors flex flex-col group overflow-hidden">
                    <div className="aspect-[16/9] overflow-hidden">
                      <img 
                        src={fest.image} 
                        alt={fest.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-8 flex flex-col justify-between flex-1">
                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border 
                            ${fest.sensitivity === 'High' ? 'border-red-400 text-red-500' : 
                              fest.sensitivity === 'Medium' ? 'border-amber-400 text-amber-500' : 
                              'border-green-400 text-green-500'}`}>
                            {fest.sensitivity} Sensitivity
                          </span>
                          <span className="serif italic text-sm">{fest.month}</span>
                        </div>
                        <h3 className="serif text-3xl mb-4 leading-tight line-clamp-1">{fest.name}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed mb-6 line-clamp-1">{fest.description}</p>
                      </div>
                      <button 
                        onClick={() => setSelectedFestival(fest)}
                        className="text-[10px] uppercase tracking-[0.2em] font-bold text-terracotta flex items-center gap-1 hover:underline"
                      >
                        Details <ExternalLink size={10}/>
                      </button>
                    </div>
                  </div>
                </ScrollFadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 3: CUISINE */}
        <section id="cuisine" className="py-24 md:py-32 px-6 md:px-8 max-w-7xl mx-auto">
           <header className="mb-16 md:mb-20 text-center">
            <h2 className="serif text-6xl sm:text-8xl font-light">Cuisine</h2>
            <div className="mt-6 w-16 md:w-24 h-px bg-terracotta/30 mx-auto"></div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {DISHES.map((dish) => (
              <ScrollFadeIn key={dish.name}>
                <div className="group">
                  <div 
                    className="aspect-square mb-6 flex items-center justify-center relative overflow-hidden transition-transform duration-500 group-hover:scale-[1.02] border border-terracotta/10"
                  >
                    <img 
                      src={dish.image} 
                      alt={dish.name} 
                      className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <span className="absolute bottom-4 left-4 serif text-xl font-medium tracking-tight text-white">{dish.name}</span>
                  </div>
                  
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="serif text-2xl font-medium">{dish.name}</h3>
                    <span className="text-[10px] italic text-gray-400">{dish.region}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-1.5 h-1.5 rounded-full ${i < dish.spice ? 'bg-terracotta' : 'border border-terracotta/20'}`}
                      />
                    ))}
                    <span className="text-[9px] uppercase tracking-tighter text-gray-400 ml-2">Heat</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {dish.allergens.map(a => (
                      <span key={a} className="text-[8px] uppercase tracking-widest border border-red-200 text-red-400 px-1.5 py-0.5">{a}</span>
                    ))}
                    {dish.dietary.map(d => (
                      <span key={d} className="text-[8px] uppercase tracking-widest border border-gray-200 text-gray-400 px-1.5 py-0.5">{d}</span>
                    ))}
                  </div>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </section>

        {/* SECTION 4: TIPS */}
        <section id="tips" className="relative py-24 md:py-32 px-6 md:px-8 bg-cream border-t border-terracotta/10">
          <div className="max-w-7xl mx-auto">
            <header className="mb-20 md:mb-32 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="serif text-6xl md:text-[7rem] lg:text-[8rem] text-terracotta leading-none mb-8 tracking-tighter">Tips</h2>
                <div className="w-20 h-px bg-terracotta/20 mx-auto mb-10" />
                <p className="text-gray-600 text-lg md:text-2xl leading-relaxed font-light max-w-3xl mx-auto text-balance">
                  Understanding the refined social codes of Thailand—where respect, spatial awareness, and emotional composure create communal harmony.
                </p>
              </motion.div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
               {TIPS_LIST.map((item, idx) => (
                 <ScrollFadeIn key={item.topic}>
                    <div 
                      onClick={() => setSelectedTip(item)}
                      className="group bg-cream-dark/20 border border-terracotta/10 p-10 md:p-12 relative flex flex-col h-full hover:bg-cream-dark/30 transition-all duration-500 shadow-sm cursor-pointer"
                    >
                      {/* Sensitivity Badge */}
                      <div className="flex justify-between items-start mb-10">
                        <div className="w-12 h-px bg-terracotta/30" />
                        <span className={`text-[9px] uppercase tracking-[0.2em] font-bold px-3 py-1 border 
                          ${item.sensitivity === 'High' ? 'border-red-900/30 text-red-700' : 
                            item.sensitivity === 'Medium' ? 'border-amber-900/30 text-amber-700' : 
                            'border-green-900/30 text-green-700'}`}>
                          {item.sensitivity} Priority
                        </span>
                      </div>
                      
                      <h3 className="serif text-4xl mb-8 group-hover:text-terracotta transition-colors">{item.topic}</h3>
                      <button className="text-[10px] uppercase tracking-[0.2em] font-bold text-terracotta flex items-center gap-1 hover:underline mt-auto">Details <ExternalLink size={10}/></button>
                    </div>
                 </ScrollFadeIn>
               ))}
            </div>
          </div>
        </section>

        {/* SECTION 05: CULTURE */}
        <section id="culture" className="py-24 md:py-32 bg-cream max-w-7xl mx-auto px-6 md:px-8 border-t border-terracotta/10">
           <header className="mb-20">
              <h2 className="serif text-6xl md:text-8xl font-light mb-8">Culture</h2>
              <p className="text-gray-600 text-lg md:text-xl font-light max-w-2xl leading-relaxed">
                Beyond the landscape lies the pulse of Thai identity—expressed through masters of masks, martial paths, and the geometry of sacred timber.
              </p>
           </header>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
              {/* HERITAGE ARTS */}
              <div className="space-y-12">
                 <h3 className="serif italic text-4xl text-terracotta">Living Heritage</h3>
                 {HERITAGE_ARTS.map((art) => (
                   <ScrollFadeIn key={art.title}>
                     <div className="group flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-full md:w-48 aspect-square overflow-hidden border border-terracotta/10 bg-cream-dark">
                           <img src={art.image} alt={art.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1">
                           <span className="text-[10px] uppercase tracking-widest text-terracotta/50 font-bold mb-2 block">{art.origin}</span>
                           <h4 className="serif text-3xl mb-4 group-hover:text-terracotta transition-colors line-clamp-1">{art.title}</h4>
                           <p className="text-sm text-gray-500 leading-relaxed line-clamp-1">{art.description}</p>
                        </div>
                     </div>
                   </ScrollFadeIn>
                 ))}
              </div>

              {/* ARCHITECTURE */}
              <div className="space-y-12 border-l border-terracotta/10 pl-0 lg:pl-16">
                 <h3 className="serif italic text-4xl text-terracotta">Sacred Timber</h3>
                 <div className="space-y-10">
                    {ARCHITECTURE.map((style) => (
                      <ScrollFadeIn key={style.style}>
                        <div className="bg-cream-dark/20 p-8 border border-terracotta/10 hover:bg-cream-dark/30 transition-colors">
                           <div className="flex justify-between items-center mb-4">
                              <h4 className="serif text-3xl line-clamp-1">{style.style}</h4>
                              <span className="text-[10px] uppercase tracking-widest bg-terracotta/10 text-terracotta px-3 py-1 rounded-full whitespace-nowrap">{style.region}</span>
                           </div>
                           <p className="text-sm font-medium text-terracotta/80 mb-3 uppercase tracking-tighter line-clamp-1">{style.feature}</p>
                           <p className="text-sm text-gray-600 leading-relaxed font-light line-clamp-1">{style.description}</p>
                        </div>
                      </ScrollFadeIn>
                    ))}
                 </div>
              </div>
           </div>

           <div className="bg-[#0a0a0a] text-cream p-12 md:p-20 relative overflow-hidden flex flex-col md:flex-row items-center gap-12">
              <div className="relative z-10 flex-1">
                 <h3 className="serif text-4xl md:text-6xl mb-6 text-terracotta">Muay Thai</h3>
                 <p className="text-white/60 text-lg font-light leading-relaxed mb-8 max-w-xl text-pretty">
                    More than a martial art, it is the 'Art of Eight Limbs'—a rhythmic dialogue of elbows, knees, shins, and fists, grounded in spiritual respect and ancestral discipline.
                 </p>
                 <button 
                  onClick={() => {
                    setIsChatOpen(true);
                    sendMessage("Explain the spiritual significance of the Wai Kru in Muay Thai");
                  }}
                  className="px-8 py-3 border border-terracotta/40 text-terracotta text-xs md:text-sm uppercase tracking-[0.3em] hover:bg-terracotta hover:text-black transition-all"
                  >
                   Inquire Expertise
                 </button>
              </div>
              <div className="relative z-10 w-full md:w-1/3 aspect-[4/5] bg-cream-dark overflow-hidden border border-white/10">
                 <img 
                    src="https://mpics.mgronline.com/pics/Images/553000001301901.JPEG" 
                    alt="Muay Thai Training" 
                    className="w-full h-full object-cover grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-1000"
                    referrerPolicy="no-referrer"
                 />
              </div>
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-terracotta/5 to-transparent pointer-events-none" />
           </div>

           <div className="mt-40 flex flex-col md:flex-row justify-between items-center gap-8 text-black/80 font-medium">
               <span className="text-[10px] uppercase tracking-[0.6em] whitespace-nowrap">Thailand Tips Guide</span>
               <div className="flex gap-6 items-center">
                  <div className="w-px h-12 bg-black/20 hidden md:block" />
                  <div className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full border border-current" />
                    <div className="w-1.5 h-1.5 rounded-full border border-current bg-current" />
                    <div className="w-1.5 h-1.5 rounded-full border border-current" />
                  </div>
                  <div className="w-px h-12 bg-black/20 hidden md:block" />
               </div>
               <span className="text-[10px] uppercase tracking-[0.6em] whitespace-nowrap">Sanaé SIAM Editorial</span>
            </div>
        </section>


      </main>

      {/* --- FOOTER --- */}
      <footer className="py-20 px-8 border-t border-terracotta/10 max-w-7xl mx-auto text-center">
        <h2 className="serif italic text-4xl text-terracotta mb-8">Sa-wat-dee</h2>
        <div className="flex justify-center gap-12 mb-12 text-sm text-gray-400 uppercase tracking-widest">
            <button className="hover:text-terracotta transition-colors">Instagram</button>
            <button className="hover:text-terracotta transition-colors">Editorial</button>
            <button className="hover:text-terracotta transition-colors">Archive</button>
        </div>
        <p className="text-[10px] text-gray-400 uppercase tracking-[0.5em]">&copy; 2026 Sanaé SIAM Cultural Guide</p>
      </footer>

      {/* --- DETAIL OVERLAY --- */}
      <AnimatePresence>
        {selectedDestination && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-cream z-50 overflow-y-auto px-6 py-12 md:p-12"
          >
            <div className="max-w-7xl mx-auto">
              <button 
                onClick={() => setSelectedDestination(null)}
                className="flex items-center gap-2 text-xs md:text-sm uppercase tracking-widest font-bold text-terracotta mb-8 md:mb-12 hover:gap-4 transition-all"
              >
                <ArrowLeft size={16} /> Return to Thailand Map
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-start mb-16 md:mb-24">
                <div className="lg:col-span-1 order-2 lg:order-1">
                   <motion.span 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="italic text-terracotta serif text-xl md:text-2xl mb-4 block"
                  >
                    {selectedDestination.province ? `${selectedDestination.province}, ` : ''}{selectedDestination.region}
                  </motion.span>
                  <motion.h1 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light mb-8 md:mb-12 leading-[1.1] md:leading-[1] tracking-tighter break-words"
                  >
                    {selectedDestination.name}
                  </motion.h1>
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="serif italic text-2xl md:text-3xl text-gray-600 leading-relaxed max-w-md mb-8"
                  >
                   "{selectedDestination.quote}"
                  </motion.p>

                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    className="text-gray-500 text-sm md:text-base leading-relaxed mb-10 max-w-xl"
                  >
                    {selectedDestination.poeticDescription}
                  </motion.p>

                  {selectedDestination.googleMapsUrl && (
                    <motion.a
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      href={selectedDestination.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 bg-white border border-terracotta/20 text-terracotta px-6 md:px-8 py-3 md:py-4 rounded-full text-xs md:text-sm uppercase tracking-[0.2em] font-bold hover:bg-terracotta hover:text-cream transition-all duration-500 shadow-sm"
                    >
                      <Map size={18} /> Google Map
                    </motion.a>
                  )}
                </div>

                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="lg:col-span-1 aspect-video md:aspect-[3/4] lg:aspect-[16/10] bg-cream-dark relative overflow-hidden border border-terracotta/10 shadow-2xl order-1 lg:order-2"
                >
                   <img 
                    src={selectedDestination.image} 
                    alt={selectedDestination.name} 
                    className="absolute inset-0 w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                   />
                </motion.div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-24">
                <div className="bg-[#1a1a1a] text-cream p-10 border border-white/5">
                  <div className="flex items-center gap-4 mb-8">
                    <ShieldCheck className="text-terracotta" />
                    <h3 className="serif text-3xl">{selectedDestination.name} Dress Code</h3>
                  </div>
                  <ul className="space-y-4">
                    {selectedDestination.dressCode.map(item => (
                      <li key={item} className="text-sm text-white/70 border-b border-white/10 pb-2">{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white p-10 border border-terracotta/10">
                  <div className="flex items-center gap-4 mb-8">
                    <Info className="text-terracotta" />
                    <h3 className="serif text-3xl">Local Customs</h3>
                  </div>
                   <ul className="space-y-4">
                    {selectedDestination.customs.map(item => (
                      <li key={item} className="text-sm text-gray-600 border-b border-terracotta/5 pb-2">{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-cream-dark/30 p-10 border border-terracotta/10">
                  <div className="flex items-center gap-4 mb-8">
                    <MapPin className="text-terracotta" />
                    <h3 className="serif text-3xl">Signature Activities</h3>
                  </div>
                  <ol className="space-y-4">
                    {selectedDestination.activities.map((item, i) => (
                      <li key={item} className="text-sm text-gray-700 flex gap-4 border-b border-terracotta/10 pb-2">
                        <span className="serif italic text-terracotta font-bold">{i + 1}.</span> {item}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="text-center pb-32">
                 <button 
                  onClick={() => {
                    setSelectedDestination(null);
                    setIsChatOpen(true);
                    setUserInput(`Tell me more about exploring ${selectedDestination.name}`);
                  }}
                  className="bg-terracotta text-cream px-12 py-6 rounded-full serif text-2xl italic hover:bg-[#1a1a1a] transition-all duration-300"
                >
                  Ask AI Advisor about {selectedDestination.name} →
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- TIPS OVERLAY --- */}
      <AnimatePresence>
        {selectedTip && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTip(null)}
            className="fixed inset-0 bg-cream z-[100] flex items-center justify-center p-4 md:p-12 overflow-y-auto"
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed top-8 right-8 text-terracotta hover:text-black transition-colors z-[110]"
              onClick={() => setSelectedTip(null)}
            >
              <X size={32} />
            </motion.button>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl w-full bg-white p-12 md:p-20 shadow-2xl border border-terracotta/10"
              onClick={(e) => e.stopPropagation()}
            >
              <span className={`text-[10px] uppercase tracking-[0.3em] font-bold px-4 py-1 border mb-8 inline-block
                ${selectedTip.sensitivity === 'High' ? 'border-red-900/30 text-red-700' : 
                  selectedTip.sensitivity === 'Medium' ? 'border-amber-900/30 text-amber-700' : 
                  'border-green-900/30 text-green-700'}`}>
                {selectedTip.sensitivity} Priority
              </span>
              <h2 className="serif text-5xl md:text-7xl mb-12 text-terracotta">{selectedTip.topic}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                   <span className="text-xs uppercase tracking-[0.4em] font-bold text-green-700 mb-6 block border-b border-green-700/10 pb-2">Guidelines (Dos)</span>
                   <ul className="space-y-4">
                     {selectedTip.dos.map(item => (
                       <li key={item} className="text-sm md:text-base text-gray-700 flex items-start gap-3">
                         <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                         {item}
                       </li>
                     ))}
                   </ul>
                </div>
                <div>
                   <span className="text-xs uppercase tracking-[0.4em] font-bold text-red-700 mb-6 block border-b border-red-700/10 pb-2">Precautions (Don'ts)</span>
                   <ul className="space-y-4">
                     {selectedTip.donts.map(item => (
                       <li key={item} className="text-sm md:text-base text-gray-700 flex items-start gap-3">
                         <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                         {item}
                       </li>
                     ))}
                   </ul>
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedTip(null)}
                className="mt-16 w-full py-4 border border-terracotta/20 text-terracotta uppercase tracking-widest text-xs font-bold hover:bg-terracotta hover:text-white transition-all"
              >
                Return to Tips
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- FESTIVAL IMAGE OVERLAY --- */}
      <AnimatePresence>
        {selectedFestival && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedFestival(null)}
            className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed top-8 right-8 text-white hover:text-terracotta transition-colors z-[110]"
              onClick={() => setSelectedFestival(null)}
            >
              <X size={32} />
            </motion.button>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="max-w-5xl w-full h-fit bg-[#1a1a1a] p-1 md:p-2 relative shadow-2xl overflow-y-auto max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedFestival.image}
                alt={selectedFestival.name}
                className="w-full h-auto max-h-[50vh] md:max-h-[80vh] object-contain"
                referrerPolicy="no-referrer"
              />
              <div className="p-6 md:p-8 bg-[#1a1a1a] text-cream">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-4">
                  <div className="flex-1">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-terracotta font-bold block mb-2">{selectedFestival.month}</span>
                    <h2 className="serif text-3xl md:text-4xl mb-4 leading-tight">{selectedFestival.name}</h2>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">{selectedFestival.description}</p>
                  </div>
                  <div className={`text-[10px] uppercase tracking-[0.2em] px-3 py-1 border h-fit whitespace-nowrap
                    ${selectedFestival.sensitivity === 'High' ? 'border-red-900 text-red-500' : 
                      selectedFestival.sensitivity === 'Medium' ? 'border-amber-900 text-amber-500' : 
                      'border-green-900 text-green-500'}`}>
                    {selectedFestival.sensitivity} Sensitivity
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- AI CHAT PANEL --- */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 w-full md:w-[480px] h-full bg-cream z-[60] border-l border-terracotta/10 shadow-2xl flex flex-col"
          >
            <div className="p-8 border-b border-terracotta/10 flex items-center justify-between">
              <div>
                <h2 className="serif text-4xl font-light text-terracotta">Advisor</h2>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="w-10 h-10 rounded-full border border-terracotta/20 flex items-center justify-center text-terracotta hover:bg-terracotta/10"
              >
                <X size={20} />
              </button>
            </div>



            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {chatMessages.length === 0 && (
                <div className="text-center py-12">
                   <div className="w-16 h-16 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MessageSquare className="text-terracotta" />
                   </div>
                   <h3 className="serif text-2xl italic mb-6">"How may I guide your journey?"</h3>
                   <div className="flex flex-wrap justify-center gap-2">
                     {[
                       "Visiting Wat Pho tomorrow",
                       "Is Pad Thai safe for peanut allergy?",
                       "What to wear at Grand Palace?",
                       "Explain the Wai greeting"
                      ].map(preset => (
                        <button 
                          key={preset}
                          onClick={() => sendMessage(preset)}
                          className="bg-white border border-terracotta/10 px-4 py-2 rounded-full text-xs hover:border-terracotta hover:text-terracotta transition-all"
                        >
                          {preset}
                        </button>
                      ))}
                   </div>
                </div>
              )}

              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed
                    ${msg.role === 'user' 
                      ? 'bg-terracotta text-cream rounded-tr-none' 
                      : 'bg-white border border-terracotta/10 text-gray-800 rounded-tl-none shadow-sm'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                   <div className="bg-white border border-terracotta/10 p-4 rounded-2xl rounded-tl-none flex gap-1">
                      <div className="w-1.5 h-1.5 bg-terracotta rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-terracotta rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-terracotta rounded-full animate-bounce"></div>
                   </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-8 bg-white border-t border-terracotta/10">
              <form 
                onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                className="relative"
              >
                <input 
                  type="text"
                  placeholder="Ask a question..."
                  className="w-full bg-cream-dark/30 border border-terracotta/10 rounded-full pl-6 pr-12 py-4 text-sm focus:outline-none focus:border-terracotta transition-all"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                />
                <button 
                  type="submit"
                  disabled={!userInput.trim()}
                  className="absolute right-2 top-2 w-10 h-10 bg-terracotta text-cream rounded-full flex items-center justify-center hover:bg-[#1a1a1a] disabled:bg-gray-300 transition-colors"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
