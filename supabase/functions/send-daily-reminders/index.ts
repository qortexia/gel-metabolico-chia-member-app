import { createClient } from 'npm:@supabase/supabase-js@2.45.4';
import { isEligibleForReminder, getMexicoCityDate, type ReminderCandidate } from '../../../src/lib/reminders.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const CRON_SECRET = Deno.env.get('REMINDERS_CRON_SECRET')!;

const APP_URL = 'https://www.protocologelmetabolicodechia.com/app';
const FROM_EMAIL = 'Protocolo Gel Metabólico de Chía <protocolo@protocologelmetabolicodechia.com>';

function buildEmailHtml(nombre: string | null, horaDespertar: string): string {
  const saludo = nombre ? `¡Hola, ${nombre}!` : '¡Hola!';
  return `
    <div style="background-color:#FAF6EE;padding:24px;font-family:sans-serif;color:#2B2013;">
      <p style="font-size:18px;font-weight:bold;">${saludo}</p>
      <p>Es hora de tu dosis de hoy — <strong>${horaDespertar}</strong>, 30 minutos antes de tu comida.</p>
      <p style="text-align:center;margin:24px 0;">
        <a href="${APP_URL}" style="background-color:#C9A227;color:#2B2013;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:bold;">VER MI PROTOCOLO</a>
      </p>
      <p>💡 Consejo del Dr. Renan: la constancia es lo que hace la diferencia — un día a la vez.</p>
      <p style="font-size:13px;color:#6b6b6b;">¿Ya no quieres recibir este recordatorio? Puedes desactivarlo desde tu app, en Inicio.</p>
    </div>
  `;
}

async function sendReminderEmail(email: string, nombre: string | null, horaDespertar: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: email,
        subject: 'Es hora de tu dosis de hoy 🌱',
        html: buildEmailHtml(nombre, horaDespertar),
      }),
    });
    return response.ok;
  } catch (err) {
    console.error('Resend fetch threw a network-level error', err);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.headers.get('x-reminders-secret') !== CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const now = new Date();
  const todayMx = getMexicoCityDate(now);

  // Coarse pre-filters to keep the working set under PostgREST's default 1000-row cap.
  // These are intentionally wider than the exact eligibility boundary — the authoritative
  // per-user check still happens via isEligibleForReminder() in the loop below.
  const cutoffDate = new Date(now.getTime() - 22 * 86400000).toISOString().slice(0, 10);

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, nombre, hora_despertar, reminders_enabled, last_reminder_sent_at, protocol_start_date')
    .eq('reminders_enabled', true)
    .gte('protocol_start_date', cutoffDate)
    .or(`last_reminder_sent_at.is.null,last_reminder_sent_at.neq.${todayMx}`);

  if (error) {
    console.error('Failed to fetch profiles for reminders', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  let sent = 0;
  let failed = 0;

  for (const profile of profiles ?? []) {
    const candidate: ReminderCandidate = {
      horaDespertar: profile.hora_despertar,
      remindersEnabled: profile.reminders_enabled,
      lastReminderSentAt: profile.last_reminder_sent_at,
      protocolStartDate: profile.protocol_start_date,
    };

    if (!isEligibleForReminder(candidate, now)) continue;

    try {
      // Claim the dedup slot BEFORE sending, so a concurrent invocation near a tick
      // boundary can't also pass eligibility for the same profile on the same day.
      const { data: claimed, error: claimError } = await supabase
        .from('profiles')
        .update({ last_reminder_sent_at: todayMx })
        .eq('id', profile.id)
        .neq('last_reminder_sent_at', todayMx)
        .select('id');

      if (claimError || !claimed || claimed.length === 0) {
        // Either the update failed, or another concurrent invocation already claimed this profile today.
        continue;
      }

      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(profile.id);
      if (userError || !userData?.user?.email) {
        console.error(`No email found for profile ${profile.id}`, userError);
        failed += 1;
        continue;
      }

      const ok = await sendReminderEmail(userData.user.email, profile.nombre, profile.hora_despertar);
      if (!ok) {
        console.error(`Resend request failed for profile ${profile.id}`);
        failed += 1;
        continue;
      }

      sent += 1;
    } catch (err) {
      console.error(`Unexpected error processing profile ${profile.id}`, err);
      failed += 1;
    }
  }

  return new Response(JSON.stringify({ sent, failed }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
