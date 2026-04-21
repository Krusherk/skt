/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Auth from "./pages/Auth";
import CustomerDashboard from "./pages/CustomerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Gallery from "./pages/Gallery";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "./lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Toaster } from "react-hot-toast";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const adminDoc = await getDoc(doc(db, "admins", u.uid));
          setIsAdmin(adminDoc.exists());
        } catch (e) {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-text">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#1A1A1A',
            color: '#fff',
            border: '1px solid #333',
            fontFamily: 'Inter, sans-serif'
          }
        }} 
      />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <Auth />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route
          path="/dashboard"
          element={user ? (isAdmin ? <Navigate to="/admin" /> : <CustomerDashboard />) : <Navigate to="/auth" />}
        />
        <Route
          path="/admin"
          element={user && isAdmin ? <AdminDashboard /> : <Navigate to={user ? "/dashboard" : "/auth"} />}
        />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>
    </BrowserRouter>
  );
}

