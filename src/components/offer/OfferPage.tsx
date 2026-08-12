import Image from 'next/image';
import Link from 'next/link';

type OfferPageProps = {
  title: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  priceLabel: string;
  benefits: string[];
  acceptHref: string;
  acceptLabel: string;
  declineHref: string;
  declineLabel: string;
};

export function OfferPage({
  title,
  subtitle,
  imageSrc,
  imageAlt,
  imageWidth,
  imageHeight,
  priceLabel,
  benefits,
  acceptHref,
  acceptLabel,
  declineHref,
  declineLabel,
}: OfferPageProps) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-6 py-10 text-center">
      <h1 className="font-serif text-3xl font-bold text-foreground">{title}</h1>
      <p className="mt-3 text-neutral-600">{subtitle}</p>
      <Image
        src={imageSrc}
        alt={imageAlt}
        width={imageWidth}
        height={imageHeight}
        className="mt-6 h-auto w-full max-w-xs rounded-card"
      />
      <ul className="mt-6 w-full max-w-xs list-none text-left text-neutral-600">
        {benefits.map((benefit) => (
          <li key={benefit} className="mt-2">
            {benefit}
          </li>
        ))}
      </ul>
      <p className="mt-6 text-2xl font-bold text-brand">{priceLabel}</p>
      <Link
        href={acceptHref}
        className="mt-4 flex min-h-[44px] w-full max-w-xs items-center justify-center rounded-full bg-brand px-6 py-3 text-lg font-bold text-foreground"
      >
        {acceptLabel}
      </Link>
      <Link href={declineHref} className="mt-3 text-sm text-neutral-500 underline">
        {declineLabel}
      </Link>
    </div>
  );
}
