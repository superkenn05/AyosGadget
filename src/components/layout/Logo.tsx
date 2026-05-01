import Link from 'next/link';
import { Terminal } from 'lucide-react';

type LogoProps = {
  compact?: boolean;
  className?: string;
  textClassName?: string;
  showSubtitle?: boolean;
  withLink?: boolean;
};

export default function Logo({
  compact = false,
  className = '',
  textClassName = '',
  showSubtitle = true,
  withLink = false,
}: LogoProps) {
  const logo = (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_10px_hsla(190,100%,40%,0.3)]">
        <Terminal className="w-4 h-4 text-primary-foreground" />
      </div>
      {!compact ? (
        <div className={`flex flex-col ${textClassName}`}>
          <span className="text-sm font-black tracking-tight text-foreground uppercase leading-none">
            Ayos<span className="text-primary">Gadget</span>
          </span>
          {showSubtitle ? (
            <span className="text-[7px] font-black tracking-[0.2em] text-muted-foreground/60 uppercase leading-none mt-0.5">
              Neural Engine
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  if (withLink) {
    return (
      <Link href="/" className="group active:scale-95 transition-transform">
        {logo}
      </Link>
    );
  }

  return logo;
}
