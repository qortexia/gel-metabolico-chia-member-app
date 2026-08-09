export interface Profile {
  id: string;
  nombre: string | null;
  peso: number;
  estatura: number;
  edad: number;
  horario_hambre: string | null;
  antojo_dulce: number;
  meta_peso: string | null;
  hora_despertar: string;
  protocol_start_date: string;
  last_reminder_sent_at: string | null;
  reminders_enabled: boolean;
  created_at: string;
}
