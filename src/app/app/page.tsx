import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function AppPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('nombre')
    .eq('id', user?.id ?? '')
    .single();

  if (!profile) {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <h1 className="font-serif text-2xl font-bold text-foreground">
        ¡Hola, {profile?.nombre ?? ''}! 👋
      </h1>
      <p className="mt-2 text-neutral-600">
        Tu protocolo está guardado. El panel completo (receta, check-ins, progreso) llega en la
        próxima fase.
      </p>
    </div>
  );
}
