import Image from 'next/image';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="mb-8 flex items-center gap-3">
        <Image
          src="/cs-logo.png"
          alt="CodeStarters"
          width={36}
          height={36}
          className="rounded-sm brightness-0 invert"
          priority
        />
        <span className="text-lg font-bold">CodeStarters</span>
      </div>
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-card p-8">
        {children}
      </div>
      <p className="mt-8 text-xs text-muted">A CodeStarters program.</p>
    </div>
  );
}
