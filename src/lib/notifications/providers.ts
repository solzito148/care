// Dispatch a canales externos (email / WhatsApp). Cuando no hay credenciales
// configuradas, los providers loguean en consola en lugar de enviar (modo dev),
// asi el resto de la app funciona igual y la integracion real es un drop-in.

export type DispatchResult = {
  channel: "email" | "whatsapp";
  ok: boolean;
  delivered: boolean;
  detail: string;
};

type OutboundMessage = {
  to: string;
  subject: string;
  body: string;
};

function devSimulateLog(channel: string, message: OutboundMessage) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[${channel}:dev] -> ${message.to} :: ${message.subject}`);
  }
}

export async function sendEmail(message: OutboundMessage): Promise<DispatchResult> {
  const apiKey = process.env.EMAIL_PROVIDER_API_KEY;
  const from = process.env.EMAIL_FROM_ADDRESS ?? "CARE <no-reply@care.app>";

  if (!apiKey) {
    devSimulateLog("email", message);
    return {
      channel: "email",
      ok: true,
      delivered: false,
      detail: "Sin EMAIL_PROVIDER_API_KEY: simulado en consola.",
    };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [message.to],
        subject: message.subject,
        text: message.body,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return { channel: "email", ok: false, delivered: false, detail };
    }
    return { channel: "email", ok: true, delivered: true, detail: "Enviado." };
  } catch (err) {
    return {
      channel: "email",
      ok: false,
      delivered: false,
      detail: err instanceof Error ? err.message : "Error de red.",
    };
  }
}

export async function sendWhatsApp(message: OutboundMessage): Promise<DispatchResult> {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    devSimulateLog("whatsapp", message);
    return {
      channel: "whatsapp",
      ok: true,
      delivered: false,
      detail: "Sin credenciales WHATSAPP_*: simulado en consola.",
    };
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: message.to,
        type: "text",
        text: { body: `${message.subject}\n\n${message.body}` },
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return { channel: "whatsapp", ok: false, delivered: false, detail };
    }
    return { channel: "whatsapp", ok: true, delivered: true, detail: "Enviado." };
  } catch (err) {
    return {
      channel: "whatsapp",
      ok: false,
      delivered: false,
      detail: err instanceof Error ? err.message : "Error de red.",
    };
  }
}
