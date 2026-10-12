import { Container } from '@/components/ui/Container';

export default function Loading() {
  return (
    <Container>
      <div className="max-w-3xl">
        <div className="h-4 w-48 animate-pulse rounded bg-white/5" />
        <div className="mt-3 h-10 w-96 max-w-full animate-pulse rounded-2xl bg-white/5" />
        <div className="mt-8 aspect-video animate-pulse rounded-2xl bg-white/5" />
        <div className="mt-8 space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-white/5" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-white/5" />
        </div>
      </div>
    </Container>
  );
}
