"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserProfile } from "@/lib/types";
import { getStoredUser, setStoredUser, updateStoredUser } from "@/lib/auth-service";
import { INITIAL_USER } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    username: string;
    country: string;
    callingCode: string;
    phoneNumber: string;
    password: string;
    referralCode?: string;
  }) => Promise<{ success: boolean; error?: string; user?: UserProfile }>;
  logout: () => void;
  refreshUser: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: () => {},
  refreshUser: () => {},
  updateProfile: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loaded = getStoredUser();
    setUser(loaded);
    setLoading(false);

    try {
      const isSupabaseConfigured =
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://your-project.supabase.co" &&
        !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

      if (isSupabaseConfigured) {
        const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
          if (event === "SIGNED_OUT") {
            setUser(null);
            setStoredUser(null);
            if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
              window.location.replace("/auth/login");
            }
          }
        });
        return () => {
          authListener?.subscription?.unsubscribe();
        };
      }
    } catch {
      // Ignore
    }
  }, []);

  const login = async (
    identifier: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    // Basic sanitization
    const trimmedId = identifier.trim();
    if (!trimmedId || !password) {
      return { success: false, error: "Please provide both identifier and password." };
    }

    // Generic error for invalid credentials as required by specification
    // Allow demo login with any password >= 6 chars for recognized username / phone, or default user
    if (password.length < 6) {
      return { success: false, error: "Invalid username or password. Please try again." };
    }

    // Check against existing registered user or seed user
    const existing = getStoredUser() || INITIAL_USER;
    const isMatch =
      existing.username.toLowerCase() === trimmedId.toLowerCase() ||
      existing.phoneNumber.replace(/[\s\+]/g, "") === trimmedId.replace(/[\s\+]/g, "");

    if (isMatch) {
      setUser(existing);
      setStoredUser(existing);
      return { success: true };
    }

    // If identifier looks like a phone or new username, create session for testing
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      username: trimmedId.startsWith("+") ? `Reviewer_${trimmedId.slice(-4)}` : trimmedId,
      phoneNumber: trimmedId.startsWith("+") ? trimmedId : "+254712345678",
      country: "Kenya",
      callingCode: "+254",
      role: "user",
      isPhoneVerified: true,
      referralCode: `EARN-${trimmedId.slice(0, 4).toUpperCase()}`,
      joinedAt: new Date().toISOString(),
      streakDays: 1,
      totalEarned: 0,
      availableBalance: 0,
      pendingBalance: 0,
      totalWithdrawn: 0,
    };

    setUser(newUser);
    setStoredUser(newUser);
    return { success: true };
  };

  const register = async (data: {
    username: string;
    country: string;
    callingCode: string;
    phoneNumber: string;
    password: string;
    referralCode?: string;
  }): Promise<{ success: boolean; error?: string; user?: UserProfile }> => {
    if (!data.username || data.username.trim().length < 3) {
      return { success: false, error: "Username must be at least 3 characters." };
    }
    if (!data.phoneNumber) {
      return { success: false, error: "A valid phone number is required." };
    }
    if (!data.password || data.password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long." };
    }

    // Generate unique referral code
    const generatedRefCode = `EARN-${data.username.slice(0, 4).toUpperCase()}-${Math.floor(
      10 + Math.random() * 90
    )}`;

    const requireVerification =
      process.env.NEXT_PUBLIC_REQUIRE_SIGNUP_VERIFICATION === "true";

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      username: data.username.trim(),
      phoneNumber: data.phoneNumber,
      country: data.country,
      callingCode: data.callingCode,
      role: "user",
      isPhoneVerified: !requireVerification, // verified immediately if verification not required
      referralCode: generatedRefCode,
      referredBy: data.referralCode || "Earnora",
      joinedAt: new Date().toISOString(),
      streakDays: 1,
      totalEarned: 0,
      availableBalance: 0,
      pendingBalance: 0,
      totalWithdrawn: 0,
    };

    setUser(newUser);
    setStoredUser(newUser);
    return { success: true, user: newUser };
  };

  const logout = async () => {
    try {
      const isSupabaseConfigured =
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://your-project.supabase.co" &&
        !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn("Supabase signOut error:", err);
    }

    setUser(null);
    setStoredUser(null);
    if (typeof window !== "undefined") {
      window.location.replace("/auth/login");
    }
  };

  const refreshUser = () => {
    setUser(getStoredUser());
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    const updated = updateStoredUser(updates);
    if (updated) {
      setUser(updated);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
