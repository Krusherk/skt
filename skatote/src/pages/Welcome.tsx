import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Star, ArrowRight, ShieldCheck, Gem, Package } from "lucide-react";

export default function Welcome() {
  return (
    <div className="bg-background min-h-screen text-text font-sans">
      {/* Header */}
      <header className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between border-b border-border gap-4">
        <div>
          <h1 className="text-2xl font-serif tracking-tight text-white">SKA <span className="italic">Totes</span></h1>
          <p className="text-xs text-primary-light uppercase tracking-widest mt-1">Luxury at its peak</p>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/auth" className="text-sm font-medium hover:text-white transition-colors">Sign In</Link>
          <Link to="/auth" className="text-sm font-medium bg-white text-black px-6 py-2.5 rounded-full hover:bg-gray-200 transition-colors">
            Shop Now
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-8 py-24 lg:py-32 grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
        <div className="space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="text-sm uppercase tracking-[0.2em] text-primary-light mb-4">2026 Collection</p>
            <h2 className="text-5xl lg:text-7xl font-serif leading-[1.1] mb-6">
              Carry<br/>
              <span className="italic text-text-muted">Masterpieces.</span>
            </h2>
            <p className="text-lg text-text-muted max-w-md leading-relaxed">
              Discover artisan-crafted tote bags that blend timeless elegance with modern utility. For those who demand more from their carry.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }}>
            <Link to="/gallery" className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-medium hover:bg-gray-200 transition-colors group">
              Explore Collection
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
        <div className="relative">
          <div className="aspect-[4/5] rounded-[32px] overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1200&q=80" 
              alt="Model holding a black luxury tote" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute -bottom-8 -left-8 bg-surface p-6 rounded-2xl border border-border shadow-2xl glass-panel">
            <div className="flex gap-1 mb-2">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-primary text-primary" />)}
            </div>
            <p className="text-sm font-medium">"The ultimate luxury piece."</p>
            <p className="text-xs text-text-muted mt-1">— Vogue</p>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-y border-border py-12 bg-surface">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-border">
          <div className="flex flex-col items-center justify-center p-4">
            <ShieldCheck className="w-8 h-8 text-primary-light mb-4" />
            <h3 className="font-serif text-lg mb-2">Secure Payments</h3>
            <p className="text-sm text-text-muted">Encrypted processing via Paystack</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4">
            <Gem className="w-8 h-8 text-primary-light mb-4" />
            <h3 className="font-serif text-lg mb-2">Artisan Crafted</h3>
            <p className="text-sm text-text-muted">Premium Italian leather</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4">
            <Package className="w-8 h-8 text-primary-light mb-4" />
            <h3 className="font-serif text-lg mb-2">Global Shipping</h3>
            <p className="text-sm text-text-muted">Express delivery worldwide</p>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-24 px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif mb-4">Adored by <span className="italic">Visionaries</span></h2>
          <p className="text-text-muted">Join thousands of customers who have upgraded their daily carry.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: "Eleanor V.", role: "Creative Director", text: "I've owned bags ten times the price that don't match the craftsmanship of my SKA Totes bag. It is simply stunning.", rating: 5 },
            { name: "Marcus T.", role: "Architect", text: "The perfect intersection of form and function. Fits everything I need while looking incredibly sleek.", rating: 5 },
            { name: "Sophia L.", role: "Fashion Editor", text: "Finally, a brand that understands understated luxury. The materials are exceptional and the finish is flawless.", rating: 5 }
          ].map((review, i) => (
            <div key={i} className="bg-surface border border-border rounded-3xl p-8 glass-panel hover:-translate-y-2 transition-transform duration-300">
              <div className="flex gap-1 mb-6">
                {[...Array(review.rating)].map((_, idx) => <Star key={idx} className="w-4 h-4 fill-white text-white" />)}
              </div>
              <p className="text-base text-text-muted mb-8 leading-relaxed">"{review.text}"</p>
              <div>
                <p className="font-serif font-medium text-white">{review.name}</p>
                <p className="text-xs uppercase tracking-wider text-text-muted mt-1">{review.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-text-muted">&copy; 2026 SKA Totes. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-sm text-text-muted hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-sm text-text-muted hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
