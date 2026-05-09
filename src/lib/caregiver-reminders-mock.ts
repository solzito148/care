import { CaregiverReminderStatus } from "@/lib/cuidadores-types";
import { careMockData } from "@/lib/mock-data";

export const WHATSAPP_UPDATE_REMINDER_TEXT =
  "Hola, desde CARE te recordamos actualizar tu perfil de cuidador. Verifica zonas donde trabajas, disponibilidad, modalidad con retiro/sin retiro, sabados, domingos, feriados, telefono, email y referencias laborales. Ingresa a tu perfil para confirmar o actualizar tus datos.";

export const EMAIL_UPDATE_REMINDER_SUBJECT =
  "Recordatorio mensual para actualizar tu perfil de cuidador en CARE";

export const EMAIL_UPDATE_REMINDER_BODY =
  "Te recordamos actualizar tu perfil de cuidador en CARE. Revisa zonas de trabajo, disponibilidad, modalidades, datos de contacto y referencias laborales, y confirma tu perfil actualizado.";

export const caregiverReminderStatusMock: CaregiverReminderStatus[] =
  careMockData.cuidadores.recordatoriosActualizacion;

export async function sendCaregiverUpdateReminderWhatsAppMock(caregiverId: string) {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return {
    caregiverId,
    channel: "whatsapp",
    status: "enviado",
    message: WHATSAPP_UPDATE_REMINDER_TEXT,
    sentAt: new Date().toISOString(),
  };
}

export async function sendCaregiverUpdateReminderEmailMock(caregiverId: string) {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return {
    caregiverId,
    channel: "email",
    status: "enviado",
    subject: EMAIL_UPDATE_REMINDER_SUBJECT,
    body: EMAIL_UPDATE_REMINDER_BODY,
    sentAt: new Date().toISOString(),
  };
}
