import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/ads/rate-limit";
import { sanitizeText } from "@/lib/ads/validation";
import { getAuthenticatedUserForSupport } from "@/lib/support/tools";

export interface SupportTicketRecord {
  id: string;
  userId: string;
  username: string;
  contact: string;
  subject: string;
  message: string;
  transcript: Array<{ role: string; content: string }>;
  status: "open" | "in_progress" | "resolved";
  createdAt: string;
}

const memorySupportTickets: SupportTicketRecord[] = [];

export async function POST(req: NextRequest) {
  try {
    const sessionUser = getAuthenticatedUserForSupport(req);
    const clientIp = req.headers.get("x-forwarded-for") || "local";

    const rate = checkRateLimit(`support_ticket_${sessionUser.id}_${clientIp}`, 5, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: `Too many ticket requests. Please wait ${rate.retryAfterSeconds}s.` },
        { status: 429 }
      );
    }

    const body = (await req.json()) as {
      subject?: string;
      message?: string;
      contact?: string;
      transcript?: Array<{ role: string; content: string }>;
    };

    const subject = sanitizeText(body.subject || "Support Escalation from AI Assistant", 160);
    const message = sanitizeText(
      body.message || "User requested human support escalation.",
      1500
    );
    const contact = sanitizeText(body.contact || sessionUser.phoneNumber || "", 120);

    const ticket: SupportTicketRecord = {
      id: `TKT-${Date.now().toString().slice(-6)}`,
      userId: sessionUser.id,
      username: sessionUser.username,
      contact,
      subject,
      message,
      transcript: Array.isArray(body.transcript) ? body.transcript.slice(-15) : [],
      status: "open",
      createdAt: new Date().toISOString(),
    };

    memorySupportTickets.unshift(ticket);

    return NextResponse.json({
      success: true,
      ticket,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to create support ticket right now. Please email support@earnora.co.ke." },
      { status: 500 }
    );
  }
}
