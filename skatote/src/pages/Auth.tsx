import React, { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, User as UserIcon, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";

const BG_IMAGES = [
  "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1590666287711-2eeb2c0b4ebf?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1614170366187-8dcbab2ec222?auto=format&fit=crop&q=80&w=800"
];

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!isLogin) {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }
      if (!agreeTerms) {
        setError("You must agree to the Privacy Policy and Terms of Service.");
        setLoading(false);
        return;
      }
    }
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", cred.user.uid), {
          email,
          username: username.trim(),
          createdAt: serverTimestamp()
        });
      }
    } catch (err: any) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      if (!isLogin) {
        // Only set this to false if there's an error and we are staying on page
        // Otherwise wait for React router redirection to prevent flicker
        setLoading(false);
      } else {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background relative overflow-hidden">
      {/* Visual Side */}
      <div className="hidden lg:flex relative bg-black items-center justify-center overflow-hidden">
        {/* Circling Bags Background */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          className="absolute w-[200vh] h-[200vh] flex items-center justify-center opacity-40"
        >
          {BG_IMAGES.map((src, i) => {
            const angle = (i * (360 / BG_IMAGES.length)) * (Math.PI / 180);
            const radius = 600; // pixels
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            return (
              <div 
                key={i} 
                className="absolute w-[400px] h-[500px] rounded-3xl overflow-hidden glass-panel"
                style={{ 
                  transform: `translate(${x}px, ${y}px) rotate(${i * 60 + 45}deg)`
                }}
              >
                <img src={src} className="w-full h-full object-cover" alt="Tote bag" referrerPolicy="no-referrer" />
              </div>
            );
          })}
        </motion.div>

        {/* Gradient Overlay & Text overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10 flex flex-col justify-end p-20">
          <h2 className="text-6xl font-serif font-light text-white mb-2">
            SKA <span className="italic">Totes</span>
          </h2>
          <p className="text-primary-light uppercase tracking-[0.3em] text-sm font-medium mb-6">
            Luxury at its peak
          </p>
          <p className="text-text-muted max-w-md leading-relaxed text-lg">
            Curated elegance. Define your signature look with our exclusive collection of artisan totes.
          </p>
        </div>
      </div>

      {/* Auth Form Side */}
      <div className="flex items-center justify-center p-8 z-10">
        <div className="w-full max-w-md glass-panel p-10 rounded-3xl relative shadow-2xl">
          
          <div className="mb-10 text-center lg:hidden">
            <h2 className="text-4xl font-serif font-light text-white mb-2">
              SKA <span className="italic">Totes</span>
            </h2>
            <p className="text-primary-light uppercase tracking-[0.2em] text-xs font-medium mb-8">
              Luxury at its peak
            </p>
          </div>

          <div className="mb-10 text-center">
            <h1 className="text-3xl font-serif mb-2 text-white">{isLogin ? "Welcome Back" : "Join the Elite"}</h1>
            <p className="text-text-muted text-sm uppercase tracking-widest">{isLogin ? "Sign in to continue" : "Create your account"}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-900/30 border border-red-500/20 text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {!isLogin && (
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                    className="w-full bg-surface border border-border rounded-full py-4 pl-12 pr-6 text-white placeholder-gray-500 focus:outline-none focus:border-primary-light transition-colors"
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  required
                  className="w-full bg-surface border border-border rounded-full py-4 pl-12 pr-6 text-white placeholder-gray-500 focus:outline-none focus:border-primary-light transition-colors"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full bg-surface border border-border rounded-full py-4 pl-12 pr-14 text-white placeholder-gray-500 focus:outline-none focus:border-primary-light transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {!isLogin && (
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    required
                    className="w-full bg-surface border border-border rounded-full py-4 pl-12 pr-14 text-white placeholder-gray-500 focus:outline-none focus:border-primary-light transition-colors"
                  />
                </div>
              )}
            </div>

            {!isLogin && (
              <div className="flex items-start gap-3 mt-4">
                <input 
                  type="checkbox" 
                  id="terms" 
                  checked={agreeTerms} 
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded appearance-none border border-gray-600 bg-surface checked:bg-primary-light checked:border-primary-light flex-shrink-0 cursor-pointer relative checked:before:content-['✓'] checked:before:text-background checked:before:absolute checked:before:left-[3px] checked:before:-top-[1px] checked:before:text-[10px]"
                />
                <label htmlFor="terms" className="text-xs text-text-muted leading-relaxed cursor-pointer select-none border-l-2 border-transparent hover:text-gray-300 transition-colors">
                  I agree to the <Link to="/privacy" className="text-white hover:text-primary-light underline underline-offset-2 transition-colors">Privacy Policy</Link> and <Link to="/terms" className="text-white hover:text-primary-light underline underline-offset-2 transition-colors">Terms of Service</Link>.
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-4 rounded-full font-medium tracking-wide hover:bg-gray-200 transition-colors disabled:opacity-50 mt-8"
            >
              {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
            </button>
          </form>

          <div className="mt-8 text-center text-text-muted text-sm">
            {isLogin ? "New to SKA Totes?" : "Already a member?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setAgreeTerms(false);
              }}
              className="text-white underline underline-offset-4 hover:text-primary-light transition-colors"
            >
              {isLogin ? "Create an account" : "Sign in here"}
            </button>
          </div>
          
          <div className="mt-12 text-center text-xs text-border pt-6 border-t border-border">
            Admin access requires matching credentials and role assignments. <br/>
            Contact system administrator to elevate roles.
          </div>
        </div>
      </div>
    </div>
  );
}
