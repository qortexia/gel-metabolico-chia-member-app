'use client';

import dynamic from 'next/dynamic';

const OnboardingFunnel = dynamic(
  () => import('@/components/onboarding/OnboardingFunnel').then((mod) => mod.OnboardingFunnel),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-brand" />
      </div>
    ),
  }
);

export default function Home() {
  return <OnboardingFunnel />;
}
