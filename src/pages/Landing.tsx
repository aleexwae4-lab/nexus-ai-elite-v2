import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Crown, ArrowRight, MessageSquare, Image as ImageIcon, Video, Music, Mic, 
  BrainCircuit, Users, ShieldAlert, FileText, Scale, ShieldCheck, 
  BadgeCheck, CheckCircle2, Star, Quote, ChevronDown, Mail, Search, 
  Podcast, Library, Wand2 
} from 'lucide-react';

const ServiceCard = ({ icon: Icon, title, desc, details, delay }: { icon: any, title: string, desc: string, details: string[], delay: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className="group relative p-8 bg-[#050505] border border-orange-500/10 rounded-xl hover:border-orange-500/50 transition-all duration-500 overflow-hidden"
    >
      <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/5 transition-colors duration-500" />
      
      <div className="relative z-10">
        <div className="w-14 h-14 rounded-lg bg-[#0a0a0a] border border-orange-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_15px_rgba(249,115,22,0)] group-hover:shadow-[0_0_30px_rgba(249,115,22,0.2)]">
          <Icon className="w-6 h-6 text-orange-500" />
        </div>
        <h3 className="text-2xl font-black italic tracking-wide mb-4 text-white uppercase">{title}</h3>
        <p className="text-zinc-400 text-sm leading-relaxed font-medium mb-6">{desc}</p>
        
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase text-orange-500 hover:text-orange-400 transition-colors"
        >
          {isExpanded ? 'Ocultar Detalles' : 'Ver Detalles'}
          <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <ul className="mt-6 space-y-3 border-t border-orange-500/10 pt-6">
                {details.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-[11px] text-zinc-500 font-bold tracking-wider uppercase">
                    <div className="w-1 h-1 bg-orange-500 rounded-full mt-1.5 shrink-0" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const PricingCard = ({ title, price, features, isPopular, delay }: { title: string, price: string, features: string[], isPopular?: boolean, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    className={`relative p-8 rounded-2xl bg-[#050505] border ${isPopular ? 'border-orange-500/50 shadow-[0_0_50px_rgba(249,115,22,0.15)] scale-105 z-10' : 'border-white/5'} flex flex-col`}
  >
    {isPopular && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-orange-500 text-black text-[10px] font-black tracking-widest uppercase rounded-sm">
        Dominación Total
      </div>
    )}
    <h3 className="text-xl font-black italic tracking-wide mb-2 text-white uppercase">{title}</h3>
    <div className="mb-6">
      <span className="text-4xl font-black italic text-orange-500">${price}</span>
      <span className="text-zinc-500 text-xs font-bold tracking-widest uppercase ml-2">/mes</span>
    </div>
    <ul className="space-y-4 mb-8 flex-1">
      {features.map((feat, idx) => (
        <li key={idx} className="flex items-start gap-3 text-sm text-zinc-300 font-medium">
          <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0" />
          <span>{feat}</span>
        </li>
      ))}
    </ul>
    <Link to="/login" className={`w-full py-4 font-bold tracking-widest uppercase text-xs transition-all duration-300 text-center block ${isPopular ? 'bg-orange-600 text-white hover:bg-orange-500 shadow-[0_0_20px_rgba(234,88,12,0.4)]' : 'bg-transparent border border-white/10 text-white hover:border-orange-500/50 hover:text-orange-500'}`}>
      Iniciar Protocolo
    </Link>
  </motion.div>
);

const TestimonialCard = ({ name, role, quote, delay }: { name: string, role: string, quote: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    className="p-8 bg-[#050505] border border-white/5 rounded-xl hover:border-orange-500/20 transition-colors relative"
  >
    <Quote className="absolute top-6 right-6 w-8 h-8 text-orange-500/10" />
    <div className="flex gap-1 mb-6">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className="w-4 h-4 text-orange-500 fill-orange-500" />
      ))}
    </div>
    <p className="text-zinc-300 text-sm leading-relaxed font-medium mb-8 italic">"{quote}"</p>
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 font-black">
        {name.charAt(0)}
      </div>
      <div>
        <h4 className="text-white font-bold text-sm uppercase tracking-wider">{name}</h4>
        <p className="text-orange-500 text-[10px] uppercase tracking-widest">{role}</p>
      </div>
    </div>
  </motion.div>
);

export const Landing = () => {
  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-orange-500/30 overflow-x-hidden font-sans">
      {/* Background Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center opacity-30">
        <div className="w-full h-full max-w-5xl border-x border-orange-500/10 relative">
          <div className="absolute top-1/4 left-0 right-0 h-px bg-orange-500/10" />
          <div className="absolute top-3/4 left-0 right-0 h-px bg-orange-500/10" />
          <div className="absolute top-0 left-0 w-64 h-64 bg-orange-500/5 blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px]" />
        </div>
      </div>

      {/* Hero Section */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-6 min-h-screen flex flex-col items-center justify-center text-center pt-20 pb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center w-full"
        >
          <div className="mb-12 relative">
            <div className="absolute inset-0 bg-orange-500 blur-[60px] opacity-20 animate-pulse" />
            <div className="w-24 h-24 rounded-2xl border border-orange-500/40 bg-[#050505] flex items-center justify-center relative z-10 shadow-[0_0_50px_rgba(249,115,22,0.2)]">
              <Crown className="w-12 h-12 text-orange-500" strokeWidth={1.5} />
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black italic tracking-tighter leading-[0.95] mb-12 uppercase max-w-4xl">
            <span className="text-white">Nexus Elite</span> <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-orange-400 to-orange-600 drop-shadow-[0_0_30px_rgba(249,115,22,0.3)]">
              Modo Dios Activado
            </span>
          </h1>

          <div className="mb-12">
            <div className="inline-block px-6 py-2 border border-orange-500/30 bg-orange-500/5 backdrop-blur-sm">
              <p className="text-orange-500 text-xs md:text-sm font-bold tracking-[0.4em] uppercase">
                Sistema Operativo de Dominación Digital
              </p>
            </div>
          </div>

          <p className="text-zinc-500 text-xs md:text-sm font-bold tracking-[0.2em] uppercase max-w-lg mx-auto leading-relaxed mb-16">
            Chat inteligente, estudio visual, producción de video, laboratorio musical, despacho legal, automatización y análisis profundo. Todo en un solo núcleo.
          </p>

          <Link 
            to="/login" 
            className="group relative inline-flex items-center justify-center gap-4 px-14 py-6 bg-orange-600 text-white overflow-hidden rounded-sm hover:scale-105 transition-all duration-500 shadow-[0_0_40px_rgba(234,88,12,0.4)] hover:shadow-[0_0_60px_rgba(234,88,12,0.6)]"
          >
            <div className="absolute inset-0 w-full h-full bg-orange-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1]" />
            <span className="relative font-black text-sm tracking-[0.2em] uppercase">
              Acceder al Sistema
            </span>
            <ArrowRight className="relative w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </Link>
        </motion.div>
      </main>

      {/* Verified Plaques Section */}
      <section className="relative z-10 py-12 px-6 border-y border-orange-500/10 bg-[#020202]/50 backdrop-blur-md">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-amber-500/10 to-orange-600/5 border border-amber-500/20 rounded-lg shadow-[0_0_30px_rgba(245,158,11,0.05)]"
          >
            <ShieldCheck className="w-8 h-8 text-amber-500" />
            <div>
              <p className="text-amber-500 font-black italic tracking-widest uppercase text-sm">Seguridad Grado Militar</p>
              <p className="text-zinc-500 text-[10px] tracking-widest uppercase">Encriptación End-to-End</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-orange-600/5 to-amber-500/10 border border-amber-500/20 rounded-lg shadow-[0_0_30px_rgba(245,158,11,0.05)]"
          >
            <BadgeCheck className="w-8 h-8 text-amber-500" />
            <div>
              <p className="text-amber-500 font-black italic tracking-widest uppercase text-sm">Arquitectura Verificada</p>
              <p className="text-zinc-500 text-[10px] tracking-widest uppercase">Uptime Garantizado 99.9%</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="relative z-10 py-32 px-6 bg-[#020202]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-black italic uppercase tracking-tight mb-6"
            >
              Arsenal de <span className="text-orange-500">Dominación</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-zinc-500 font-bold tracking-widest uppercase text-xs"
            >
              Módulos de ejecución autónoma
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ServiceCard 
              delay={0.1} 
              icon={MessageSquare} 
              title="Chat Inteligente" 
              desc="El cerebro del sistema: multimodal, con memoria y comandos rápidos." 
              details={[
                "Soporte GPT-4, Gemini, Claude",
                "Multimodal (texto, voz, imagen, video)",
                "Memoria de estilo y objetivos",
                "Copiloto en tiempo real"
              ]}
            />
            <ServiceCard 
              delay={0.2} 
              icon={ImageIcon} 
              title="Estudio Visual" 
              desc="Generación y edición avanzada de imagen y video profesional." 
              details={[
                "Generación por prompt",
                "Editor tipo Photoshop (quitar fondo, upscale)",
                "Branding automático",
                "Análisis de viralidad de video"
              ]}
            />
            <ServiceCard 
              delay={0.3} 
              icon={Music} 
              title="Laboratorio Musical" 
              desc="Producción musical de nivel estudio con IA." 
              details={[
                "Generación de beats y melodías",
                "Voces sintéticas realistas",
                "Mezcla automática",
                "Exportación lista para plataformas"
              ]}
            />
            <ServiceCard 
              delay={0.4} 
              icon={FileText} 
              title="Despacho Digital" 
              desc="Creación de documentos legales y comerciales de alto nivel." 
              details={[
                "Contratos y propuestas",
                "Corrector avanzado",
                "Exportación .docx y PDF",
                "Plantillas de lujo"
              ]}
            />
            <ServiceCard 
              delay={0.5} 
              icon={Mail} 
              title="Automatización" 
              desc="Dinero en piloto automático con campañas inteligentes." 
              details={[
                "Campañas de correo",
                "Seguimiento inteligente",
                "Triggers de interacción",
                "Integración multicanal"
              ]}
            />
            <ServiceCard 
              delay={0.6} 
              icon={Mic} 
              title="Estudio de Podcast" 
              desc="Grabación y producción de audio profesional con IA." 
              details={[
                "Mejora de audio automática",
                "Voces IA ultra realistas",
                "Eliminación de ruido",
                "Intros/outros automáticas"
              ]}
            />
            <ServiceCard 
              delay={0.7} 
              icon={Search} 
              title="Investigación" 
              desc="Análisis profundo y reportes ejecutivos." 
              details={[
                "Búsqueda inteligente con contexto",
                "Resúmenes ejecutivos",
                "Análisis de competencia",
                "Reportes listos para contenido"
              ]}
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 py-32 px-6 bg-[#030303] border-t border-orange-500/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-black italic uppercase tracking-tight mb-6"
            >
              El Círculo <span className="text-orange-500">Interno</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-zinc-500 font-bold tracking-widest uppercase text-xs"
            >
              Arquitectos que ya dominan el mercado
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TestimonialCard 
              delay={0.1}
              name="Alex R." 
              role="CEO, TechScale" 
              quote="Nexus Elite reemplazó a un equipo de 5 personas. La velocidad de ejecución es absurda. No es una herramienta, es una ventaja desleal." 
            />
            <TestimonialCard 
              delay={0.2}
              name="Sarah M." 
              role="Directora de Operaciones" 
              quote="La integración de modelos y los agentes autónomos nos permitieron escalar la producción de contenido un 1000% en dos semanas." 
            />
            <TestimonialCard 
              delay={0.3}
              name="David K." 
              role="Founder, GrowthX" 
              quote="Por $19.99 al mes, el ROI es infinito. La arquitectura de este sistema está a años luz de cualquier otra plataforma comercial." 
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 py-32 px-6 border-t border-orange-500/10 bg-[#020202]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-black italic uppercase tracking-tight mb-6"
            >
              Inversión <span className="text-orange-500">Estratégica</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-zinc-500 font-bold tracking-widest uppercase text-xs max-w-2xl mx-auto leading-relaxed"
            >
              Precios absurdamente competitivos. Diseñados para destruir a la competencia y escalar tu imperio sin fricción financiera.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-5xl mx-auto">
            <PricingCard 
              delay={0.1}
              title="Iniciado" 
              price="4.99" 
              features={[
                "Acceso a Nexus Chat",
                "10 Documentos con IA",
                "Campañas de Correo Básicas",
                "1,000 Créditos mensuales",
                "Generación de Imágenes",
                "Soporte Comunitario"
              ]} 
            />
            <PricingCard 
              delay={0.2}
              title="Élite" 
              price="9.99" 
              isPopular={true}
              features={[
                "Acceso Total al Arsenal",
                "Documentos Ilimitados",
                "Campañas de Correo Ilimitadas",
                "Investigación Profunda (Copilot)",
                "Generador de Podcast",
                "Análisis de Video AI",
                "Galería de Creaciones",
                "5,000 Créditos mensuales"
              ]} 
            />
            <PricingCard 
              delay={0.3}
              title="Imperio" 
              price="19.99" 
              features={[
                "Todo lo de Élite",
                "Acceso a API Comercial",
                "Créditos Ilimitados (Fair Use)",
                "Modelos Externos (GPT-4, Claude)",
                "Ejecutivo de Cuenta Dedicado"
              ]} 
            />
          </div>
        </div>
      </section>

      {/* Referrals Section */}
      <section className="relative z-10 py-32 px-6 bg-[#030303] border-t border-orange-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-12 bg-gradient-to-b from-[#0a0a0a] to-[#050505] border border-orange-500/20 rounded-2xl relative overflow-hidden shadow-[0_0_50px_rgba(249,115,22,0.05)]"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50" />
            <Users className="w-16 h-16 text-orange-500 mx-auto mb-8" />
            <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tight mb-6">
              Expande el <span className="text-orange-500">Imperio</span>
            </h2>
            <p className="text-zinc-400 text-lg mb-10 leading-relaxed max-w-2xl mx-auto">
              El poder se multiplica cuando se comparte. Invita a otros arquitectos al sistema Nexus Elite y obtén créditos de ejecución ilimitados por cada alianza forjada.
            </p>
            <Link to="/login" className="inline-block px-8 py-4 bg-transparent border border-orange-500 text-orange-500 font-bold tracking-widest uppercase text-xs hover:bg-orange-500 hover:text-white transition-all duration-300">
              Generar Código de Alianza
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Legal Footer */}
      <footer className="relative z-10 bg-[#020202] border-t border-white/5 pt-20 pb-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <Crown className="w-6 h-6 text-orange-500" />
                <span className="font-black italic tracking-widest uppercase text-white">Nexus Elite</span>
              </div>
              <p className="text-zinc-600 text-xs leading-relaxed max-w-sm">
                Sistema de inteligencia artificial de grado industrial. Diseñado exclusivamente para la optimización, escalabilidad y dominación de mercados digitales.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold tracking-widest uppercase text-xs mb-6 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-orange-500" /> Legal
              </h4>
              <ul className="space-y-4 text-zinc-500 text-xs font-medium">
                <li><Link to="/login" className="hover:text-orange-500 transition-colors">Políticas de Privacidad</Link></li>
                <li><Link to="/login" className="hover:text-orange-500 transition-colors">Términos de Servicio</Link></li>
                <li><Link to="/login" className="hover:text-orange-500 transition-colors">Protección de Datos</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold tracking-widest uppercase text-xs mb-6 flex items-center gap-2">
                <Scale className="w-4 h-4 text-orange-500" /> Cumplimiento
              </h4>
              <ul className="space-y-4 text-zinc-500 text-xs font-medium">
                <li><Link to="/login" className="hover:text-orange-500 transition-colors">Responsabilidad del Usuario</Link></li>
                <li><Link to="/login" className="hover:text-orange-500 transition-colors">Uso Ético de IA</Link></li>
                <li><Link to="/login" className="hover:text-orange-500 transition-colors">Licencias Comerciales</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-zinc-700 text-[10px] tracking-widest uppercase">
              &copy; {new Date().getFullYear()} Nexus Elite. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-2 text-zinc-700 text-[10px] tracking-widest uppercase">
              <FileText className="w-3 h-3" />
              <span>Protocolo Seguro V2.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
