import { Card, CardContent } from "@/components/ui/card";

export function AuditResultsSkeleton() {
  return (
    <div
      className="w-full rounded-2xl border border-[#e7e5e4] bg-white p-6 sm:p-10 animate-pulse shadow-[0_12px_40px_-12px_rgba(28,25,23,0.1)]"
      aria-busy="true"
      aria-label="Loading audit results"
    >
      <div className="mx-auto max-w-2xl space-y-12">
        <section className="flex flex-col items-center space-y-6 pt-2">
          <div className="h-7 w-36 rounded-full bg-[#f5f4f0]" />
          <div className="space-y-3 w-full flex flex-col items-center">
            <div className="h-4 w-32 rounded bg-[#f5f4f0]" />
            <div className="h-20 w-64 rounded-xl bg-[#f5f4f0]" />
            <div className="h-5 w-48 rounded bg-[#f5f4f0]" />
          </div>
        </section>

        <section className="space-y-5">
          <div className="h-4 w-40 rounded bg-[#f5f4f0] mx-auto" />
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-[#e7e5e4] shadow-none">
              <CardContent className="p-6">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-[#f5f4f0]" />
                  <div className="h-4 w-40 rounded bg-[#f5f4f0]" />
                  <div className="h-3 w-56 rounded bg-[#f5f4f0]" />
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <div className="h-32 rounded-2xl bg-[#f5f4f0] max-w-md mx-auto" />
      </div>
    </div>
  );
}
