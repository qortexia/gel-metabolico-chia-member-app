create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- Run this select once, replacing the placeholder, before the cron.schedule call below —
-- it stores the service role key in Supabase Vault so it never appears in plain text in
-- cron.job or pg_stat_statements. Do NOT commit a real key into this file.
-- select vault.create_secret('<your-service-role-key>', 'reminders_service_role_key');

select cron.schedule(
  'send-daily-reminders',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := 'https://<your-project-ref>.supabase.co/functions/v1/send-daily-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        select decrypted_secret from vault.decrypted_secrets where name = 'reminders_service_role_key'
      )
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);
