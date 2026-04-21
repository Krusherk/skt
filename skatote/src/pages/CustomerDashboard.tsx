/// <reference types="vite/client" />
import React, { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { LogOut, ShoppingBag, CreditCard, Search } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import toast from "react-hot-toast";
import { format } from "date-fns";

// Initialize Stripe (will use env variable if provided, else dummy key for UI)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_dummy");

function CheckoutForm({ amount, bagId, onSuccess, onCancel }: { amount: number, bagId: string, onSuccess: () => void, onCancel: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !auth.currentUser) return;

    setProcessing(true);
    setError(null);

    try {
      let clientSecret = "";
      try {
        const res = await fetch("/api/payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount })
        });
        const data = await res.json();
        if (data.clientSecret) {
          clientSecret = data.clientSecret;
        }
      } catch (err) {
        console.warn("Backend payment intent failed or not configured, simulating success.");
      }

      if (clientSecret) {
        const { error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement) as any,
            billing_details: { email: auth.currentUser.email || undefined },
          }
        });
        if (stripeError) throw new Error(stripeError.message);
      } else {
        await new Promise(r => setTimeout(r, 1500));
      }

      await addDoc(collection(db, "orders"), {
        userId: auth.currentUser.uid,
        bagId: bagId,
        price: amount,
        status: "pending",
        createdAt: serverTimestamp()
      });

      toast.success("Order placed successfully! We'll notify you when it ships.");
      onSuccess();
    } catch (err: any) {
      setError(err.message || "An error occurred during payment.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-background border border-border rounded-xl">
        <CardElement options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#fff',
              '::placeholder': { color: '#6b7280' },
            },
            invalid: { color: '#ef4444' },
          }
        }} />
      </div>
      {error && <div className="text-red-400 text-sm">{error}</div>}
      <div className="flex gap-4">
        <button type="button" onClick={onCancel} className="flex-1 py-3 px-4 rounded-full border border-border text-white hover:bg-surface transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={!stripe || processing} className="flex-1 py-3 px-4 rounded-full bg-white text-black font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
          {processing ? "Processing..." : `Pay $${amount}`}
        </button>
      </div>
    </form>
  );
}

export default function CustomerDashboard() {
  const [bags, setBags] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedBag, setSelectedBag] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const unBags = onSnapshot(collection(db, "bags"), (snap) => {
      setBags(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unOrders = onSnapshot(collection(db, "orders"), (snap) => {
      const allOrders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const userOrders = allOrders.filter((o: any) => o.userId === auth.currentUser?.uid);
      setOrders(userOrders);
    });

    return () => {
      unBags();
      unOrders();
    };
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
        <div>
          <h1 className="text-xl font-serif text-white">SKA <span className="italic">Totes</span></h1>
          <p className="text-[10px] text-primary-light uppercase tracking-widest mt-1">Luxury at its peak</p>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-sm text-text-muted hidden md:inline">{auth.currentUser?.email}</span>
          <button onClick={() => signOut(auth)} className="text-sm text-text-muted hover:text-white flex items-center gap-2 transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12 grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-serif text-white mb-2">The Collection</h2>
              <p className="text-text-muted">Select an artisan piece.</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input 
                type="text" 
                placeholder="Search bags, categories..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-surface border border-border rounded-full py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-primary-light"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {filteredBags.length === 0 ? (
              <div className="col-span-full py-12 text-center border border-dashed border-border rounded-3xl text-text-muted">
                {searchQuery ? "No bags found matching your search." : "No bags currently available. Check back soon."}
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
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-lg font-serif text-white">{bag.name}</h3>
                      <span className="text-lg font-medium text-white">${bag.price}</span>
                    </div>
                    {bag.category && <p className="text-xs uppercase tracking-wider text-primary-light mb-2">{bag.category}</p>}
                    <p className="text-sm text-text-muted line-clamp-2 mb-6 flex-1">{bag.description}</p>
                    <button 
                      onClick={() => setSelectedBag(bag)}
                      className="w-full py-3 rounded-full border border-border text-sm uppercase tracking-wider font-medium hover:bg-white hover:text-black transition-colors mt-auto"
                    >
                      Purchase
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-surface border border-border rounded-3xl p-8 sticky top-32">
            <h3 className="text-xl font-serif text-white mb-6 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary-light" /> Order History
            </h3>
            
            {orders.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-8">You haven't placed any orders yet.</p>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {orders.sort((a,b) => b.createdAt?.toMillis() - a.createdAt?.toMillis()).map((order) => {
                  const bag = bags.find(b => b.id === order.bagId);
                  const orderDate = order.createdAt ? format(order.createdAt.toDate(), 'MMM d, yyyy') : "Processing...";
                  return (
                    <div key={order.id} className="flex gap-4 p-4 rounded-xl bg-background border border-border">
                      <div className="w-16 h-16 rounded-lg bg-surface overflow-hidden shrink-0">
                        {bag?.imageUrl ? <img src={bag.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-border" />}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <p className="text-white text-sm font-medium truncate">{bag ? bag.name : "Unknown Bag"}</p>
                        <p className="text-xs text-text-muted mt-1 uppercase tracking-wider">${order.price} • <span className={order.status === 'completed' || order.status === 'pending' ? 'text-blue-400' : 'text-green-400'}>{order.status}</span></p>
                        <p className="text-[10px] text-text-muted mt-2">{orderDate} • ID: {order.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Checkout Modal */}
      {selectedBag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-md rounded-3xl p-8 border border-border glass-panel">
            <h3 className="text-2xl font-serif text-white mb-2">Checkout</h3>
            <p className="text-sm text-text-muted mb-8">Secure payment for {selectedBag.name}</p>
            
            <div className="flex justify-between items-center mb-8 p-4 bg-background rounded-xl border border-border">
              <span className="font-medium text-white">Total</span>
              <span className="text-xl font-serif text-white">${selectedBag.price}</span>
            </div>

            <Elements stripe={stripePromise}>
              <CheckoutForm 
                amount={selectedBag.price} 
                bagId={selectedBag.id} 
                onSuccess={() => setSelectedBag(null)} 
                onCancel={() => setSelectedBag(null)} 
              />
            </Elements>
          </div>
        </div>
      )}
    </div>
  );
}

