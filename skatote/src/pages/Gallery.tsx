import React, { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Search, ArrowRight } from "lucide-react";

export default function Gallery() {
  const [bags, setBags] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unBags = onSnapshot(collection(db, "bags"), (snap) => {
      setBags(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unBags();
  }, []);

  const filteredBags = useMemo(() => {
    if (!searchQuery.trim()) return bags;
    const lowerQ = searchQuery.toLowerCase();
    return bags.filter(b => 
      b.name.toLowerCase().includes(lowerQ) || 
      b.description.toLowerCase().includes(lowerQ) ||
      (b.category && b.category.toLowerCase().includes(lowerQ))
    );
  }, [bags, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-text font-sans">
      <header className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-40 gap-4">
        <Link to="/" className="flex flex-col">
          <h1 className="text-xl font-serif text-white hover:text-primary-light transition-colors">SKA <span className="italic">Totes</span></h1>
          <p className="text-[10px] text-primary-light uppercase tracking-widest mt-1">Luxury at its peak</p>
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/auth" className="text-sm text-text-muted hover:text-white transition-colors">Sign In</Link>
          <Link to="/auth" className="text-sm font-medium bg-white text-black px-6 py-2.5 rounded-full hover:bg-gray-200 transition-colors">
            Create Account
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.2em] text-primary-light mb-4">The Complete Archive</p>
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">Our Collection</h2>
            <p className="text-text-muted text-lg">Browse our exclusive selection of artisan-crafted luxury bags. Sign in to secure yours today.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search styles, categories..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border rounded-full py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-primary-light transition-colors"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBags.length === 0 ? (
            <div className="col-span-full py-20 text-center border border-dashed border-border rounded-3xl text-text-muted bg-surface/30">
              {searchQuery ? "No bags found matching your search." : "The collection is currently being curated. Check back soon."}
            </div>
          ) : (
            filteredBags.map((bag) => (
              <div key={bag.id} className="group bg-surface border border-border rounded-3xl overflow-hidden hover:border-primary-light transition-colors flex flex-col">
                <div className="aspect-square bg-black overflow-hidden relative">
                  {bag.imageUrl ? (
                    <img src={bag.imageUrl} alt={bag.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted"><ShoppingBag className="w-12 h-12 opacity-20" /></div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-serif text-white">{bag.name}</h3>
                    <span className="text-lg font-medium text-white">${bag.price}</span>
                  </div>
                  {bag.category && <p className="text-xs uppercase tracking-wider text-primary-light mb-3">{bag.category}</p>}
                  <p className="text-sm text-text-muted line-clamp-3 mb-8 flex-1 leading-relaxed">{bag.description}</p>
                  <button 
                    onClick={() => navigate('/auth')}
                    className="w-full py-4 rounded-full bg-white text-black text-sm uppercase tracking-wider font-medium hover:bg-gray-200 transition-colors mt-auto flex items-center justify-center gap-2 group-hover:gap-3"
                  >
                    Sign in to Purchase <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
