import React, { useState, useEffect, useMemo, useRef } from "react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { LogOut, Plus, Edit2, Trash2, X, Image as ImageIcon, Search, Package, DollarSign, ShoppingBag, Clock } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [bags, setBags] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<Record<string, any>>({});
  
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const isInitialOrdersLoad = useRef(true);
  
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    const unBags = onSnapshot(collection(db, "bags"), (snap) => {
      setBags(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    
    const unOrders = onSnapshot(collection(db, "orders"), (snap) => {
      if (!isInitialOrdersLoad.current) {
        snap.docChanges().forEach((change) => {
          if (change.type === "added") {
            const data = change.doc.data();
            toast.success(`New order received for $${data.price}!`, {
              icon: '🚨',
            });
          }
        });
      }
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      isInitialOrdersLoad.current = false;
    });

    const unUsers = onSnapshot(collection(db, "users"), (snap) => {
      const userMap: Record<string, any> = {};
      snap.docs.forEach(d => {
        userMap[d.id] = d.data();
      });
      setUsers(userMap);
    });

    return () => {
      unBags();
      unOrders();
      unUsers();
    };
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategory("");
    setPrice("");
    setImageUrl("");
    setIsEditing(null);
  };

  const handleEdit = (bag: any) => {
    setName(bag.name);
    setDescription(bag.description);
    setCategory(bag.category || "");
    setPrice(bag.price.toString());
    setImageUrl(bag.imageUrl);
    setIsEditing(bag.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name,
        description,
        category: category || "Uncategorized",
        price: parseFloat(price),
        imageUrl
      };

      if (isEditing) {
        await updateDoc(doc(db, "bags", isEditing), data);
        toast.success("Bag updated successfully");
      } else {
        await addDoc(collection(db, "bags"), {
          ...data,
          createdAt: serverTimestamp()
        });
        toast.success("Bag added successfully");
      }
      resetForm();
    } catch (err: any) {
      toast.error("Error saving bag: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this bag?")) {
      try {
        await deleteDoc(doc(db, "bags", id));
        toast.success("Bag deleted");
      } catch (err: any) {
        toast.error("Error deleting bag: " + err.message);
      }
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
    } catch (err: any) {
      toast.error("Error updating order: " + err.message);
    }
  };

  const filteredBags = useMemo(() => {
    if (!searchQuery.trim()) return bags;
    const lowerQ = searchQuery.toLowerCase();
    return bags.filter(b => 
      b.name.toLowerCase().includes(lowerQ) || 
      b.description.toLowerCase().includes(lowerQ) ||
      (b.category && b.category.toLowerCase().includes(lowerQ))
    );
  }, [bags, searchQuery]);

  const stats = useMemo(() => {
    return {
      revenue: orders.reduce((sum, o) => sum + (o.price || 0), 0),
      total: orders.length,
      pending: orders.filter(o => o.status === 'completed' || o.status === 'pending').length
    };
  }, [orders]);

  return (
    <div className="min-h-screen bg-background text-text font-sans">
      <header className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between border-b border-border bg-surface gap-4">
        <div>
          <h1 className="text-xl font-serif text-white">SKA <span className="italic">Admin</span></h1>
          <p className="text-[10px] text-primary-light uppercase tracking-widest mt-1">Luxury at its peak</p>
        </div>
        <button onClick={() => signOut(auth)} className="text-sm text-text-muted hover:text-white flex items-center gap-2 transition-colors">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12 grid lg:grid-cols-3 gap-12">
        {/* Form Column */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-surface border border-border rounded-3xl p-8 sticky top-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif text-white">{isEditing ? "Edit Bag" : "Add New Bag"}</h2>
              {isEditing && (
                <button onClick={resetForm} className="text-text-muted hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-text-muted mb-2">Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-background border border-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary-light" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-text-muted mb-2">Category</label>
                <input required type="text" placeholder="e.g. Leather, Canvas, Evening..." value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-background border border-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary-light" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-text-muted mb-2">Description</label>
                <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-background border border-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary-light min-h-[100px]" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-text-muted mb-2">Price ($)</label>
                <input required type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-background border border-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary-light" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-text-muted mb-2">Image URL</label>
                <input required type="url" placeholder="https://..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full bg-background border border-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary-light" />
                {imageUrl && (
                  <div className="mt-4 aspect-video rounded-lg overflow-hidden border border-border">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>
              <button type="submit" className="w-full py-4 rounded-xl bg-white text-black font-medium hover:bg-gray-200 transition-colors mt-8 flex items-center justify-center gap-2">
                {isEditing ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {isEditing ? "Update Bag" : "Add Bag"}
              </button>
            </form>
          </div>
        </div>

        {/* Management Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Stats Row */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-surface border border-border rounded-3xl p-6 flex flex-col justify-between">
              <div className="text-text-muted mb-4"><DollarSign className="w-5 h-5 text-primary-light" /></div>
              <div>
                <p className="text-xs uppercase tracking-widest text-text-muted mb-1">Total Revenue</p>
                <p className="text-3xl font-serif text-white">${stats.revenue.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-surface border border-border rounded-3xl p-6 flex flex-col justify-between">
              <div className="text-text-muted mb-4"><ShoppingBag className="w-5 h-5 text-primary-light" /></div>
              <div>
                <p className="text-xs uppercase tracking-widest text-text-muted mb-1">Total Orders</p>
                <p className="text-3xl font-serif text-white">{stats.total}</p>
              </div>
            </div>
            <div className="bg-surface border border-border rounded-3xl p-6 flex flex-col justify-between">
              <div className="text-text-muted mb-4"><Clock className="w-5 h-5 text-yellow-500" /></div>
              <div>
                <p className="text-xs uppercase tracking-widest text-text-muted mb-1">Pending Orders</p>
                <p className="text-3xl font-serif text-white">{stats.pending}</p>
              </div>
            </div>
          </section>

          {/* Orders Section */}
          <section className="bg-surface border border-border rounded-3xl p-8">
            <h2 className="text-2xl font-serif text-white mb-8 flex items-center gap-2">
              <Package className="w-6 h-6 text-primary-light" /> Manage Orders
            </h2>
            
            {orders.length === 0 ? (
              <p className="text-center text-text-muted py-8">No orders have been placed yet.</p>
            ) : (
              <div className="space-y-4">
                {orders.sort((a,b) => b.createdAt?.toMillis() - a.createdAt?.toMillis()).map(order => {
                  const customerEmail = users[order.userId]?.email || "Unknown User";
                  const bag = bags.find(b => b.id === order.bagId);
                  
                  return (
                    <div key={order.id} className="p-5 border border-border rounded-2xl bg-background flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-surface rounded-xl overflow-hidden shrink-0 border border-border">
                          {bag?.imageUrl ? <img src={bag.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <div className="w-full h-full" />}
                        </div>
                        <div>
                          <p className="font-medium text-white">{bag?.name || "Deleted Bag"}</p>
                          <p className="text-sm text-text-muted">{customerEmail}</p>
                          <p className="text-xs uppercase tracking-wider text-text-muted mt-1">Paid: ${order.price}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 text-xs font-medium uppercase tracking-wider rounded-full border ${order.status === 'completed' || order.status === 'pending' ? 'bg-blue-900/30 text-blue-400 border-blue-900' : 'bg-green-900/30 text-green-400 border-green-900'}`}>
                          {order.status}
                        </span>
                        
                        {(order.status === 'completed' || order.status === 'pending') && (
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'shipped')}
                            className="px-4 py-2 bg-white text-black text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            Mark Shipped
                          </button>
                        )}
                        {order.status === 'shipped' && (
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                            className="px-4 py-2 bg-surface text-white border border-border text-xs font-medium rounded-lg hover:bg-white hover:text-black transition-colors"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Inventory Section */}
          <section className="pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h2 className="text-2xl font-serif text-white">Inventory</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input 
                  type="text" 
                  placeholder="Search bags..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 bg-surface border border-border rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary-light"
                />
              </div>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {filteredBags.map(bag => (
                <div key={bag.id} className="bg-surface border border-border rounded-2xl overflow-hidden flex flex-col">
                  <div className="aspect-video bg-black relative">
                    {bag.imageUrl ? (
                      <img src={bag.imageUrl} className="w-full h-full object-cover" alt={bag.name} referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8 text-text-muted opacity-50" /></div>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-serif text-white text-lg">{bag.name}</h3>
                      <span className="font-medium text-white">${bag.price}</span>
                    </div>
                    {bag.category && <p className="text-xs uppercase tracking-wider text-primary-light mb-2">{bag.category}</p>}
                    <p className="text-sm text-text-muted mb-6 flex-1 line-clamp-2">{bag.description}</p>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(bag)} className="flex-1 py-2 rounded-lg bg-background border border-border text-sm font-medium hover:text-white transition-colors flex items-center justify-center gap-2">
                        <Edit2 className="w-4 h-4" /> Edit
                      </button>
                      <button onClick={() => handleDelete(bag.id)} className="px-4 py-2 rounded-lg bg-red-950/30 border border-red-900 text-red-400 text-sm font-medium hover:bg-red-900/50 transition-colors flex items-center justify-center">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredBags.length === 0 && (
                <div className="col-span-full py-12 text-center text-text-muted border border-dashed border-border rounded-3xl">
                  {searchQuery ? "No bags found matching your search." : "No inventory available. Add a bag to get started."}
                </div>
              )}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
