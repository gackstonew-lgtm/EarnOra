import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EarnOra — Sign In & Start Earning",
  description: "Sign in to EarnOra and turn your honest reviews into real M-Pesa earnings in Kenya.",
};

export default function RootPage() {
  redirect("/auth/login");
}
