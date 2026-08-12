"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AdminContext = createContext({
  session: null,
  isAdmin: false,
  isSuperAdmin: false,
  adminProfile: null,
  loading: true,
  logout: () => {},
});

export function AdminProvider({ children }) {
  const [session, setSession] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function checkAdmin(currentSession) {
    if (!currentSession) {
      setAdminProfile(null);
      return;
    }
    const { data } = await supabase
      .from("admins")
      .select("*")
      .eq("id", currentSession.user.id)
      .maybeSingle();
    // RLS + is_admin() sudah otomatis menolak baris untuk admin yang
    // is_active = false, jadi `data` akan null untuk mereka.
    setAdminProfile(data || null);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      checkAdmin(s).finally(() => setLoading(false));
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      checkAdmin(s);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const isAdmin = Boolean(adminProfile);
  const isSuperAdmin = adminProfile?.role === "super_admin";

  return (
    <AdminContext.Provider
      value={{ session, isAdmin, isSuperAdmin, adminProfile, loading, logout }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
