import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { sendEmail, sendWhatsApp, type DispatchResult } from "@/lib/notifications/providers";

type NotificationKind = Database["public"]["Tables"]["notifications"]["Row"]["kind"];

type CreateNotificationInput = {
  userId: string;
  title: string;
  body?: string;
  kind?: NotificationKind;
  href?: string | null;
  /** Canales externos opcionales ademas de la notificacion in-app. */
  channels?: {
    email?: string;
    whatsapp?: string;
  };
};

/**
 * Crea una notificacion in-app y, si se indican canales, despacha tambien por
 * email/WhatsApp. La parte in-app respeta RLS: el usuario solo puede crear las
 * suyas; un admin (policy "Admin inserts notifications") puede crear para otros.
 */
export async function createNotification({
  userId,
  title,
  body = "",
  kind = "info",
  href = null,
  channels,
}: CreateNotificationInput): Promise<{ ok: boolean; dispatch: DispatchResult[] }> {
  const supabase = await createClient();

  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    title,
    body,
    kind,
    href,
  });

  if (error) console.warn("createNotification", error.message);

  const dispatch: DispatchResult[] = [];
  if (channels?.email) {
    dispatch.push(await sendEmail({ to: channels.email, subject: title, body }));
  }
  if (channels?.whatsapp) {
    dispatch.push(await sendWhatsApp({ to: channels.whatsapp, subject: title, body }));
  }

  return { ok: !error, dispatch };
}
