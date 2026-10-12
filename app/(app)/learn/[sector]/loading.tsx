import { Container } from '@/components/ui/Container';

export default function Loading() {
  return (
    <Container>
      <div className="h-4 w-24 animate-pulse rounded bg-white/5" />
      <div className="mt-4 h-10 w-64 animate-pulse rounded-2xl bg-white/5" />
      <div className="mt-12 space-y-14">
        {[0, 1].map((i) => (
          <div key={i}>
            <div className="h-8 w-56 animate-pulse rounded bg-white/5" />
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[0, 1].map((j) => (
                <div key={j} className="h-36 animate-pulse rounded-2xl bg-white/5" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
