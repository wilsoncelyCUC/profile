import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID")!;

serve(async (req: Request) => {
  try {
    const payload = await req.json();
    const record = payload.record;

    const lines = [
      "🔔 New Lead",
      `👤 ${record.name}`,
      `📧 ${record.email}`,
      `🏢 ${record.company_name || "—"} — ${record.role || "—"}`,
      `🌐 ${record.company_website || "—"}`,
      `💬 "${record.description || "No description provided"}"`,
    ];

    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: lines.join("\n"),
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("Telegram API error:", err);
      return new Response(JSON.stringify({ ok: false, error: err }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Edge Function error:", e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
