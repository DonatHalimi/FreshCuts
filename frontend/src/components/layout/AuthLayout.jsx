import barbershopPhoto from '../../assets/barbershop-interior.jpg';

export default function AuthLayout({ children }) {
  return (
    <section className="mx-auto mt-10 max-w-6xl px-5 py-8 sm:py-12">
      <div className="grid overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl shadow-black/20 md:min-h-[620px] md:grid-cols-[0.9fr_1.1fr]">
        <div className="relative min-h-48 overflow-hidden bg-surface-2 md:min-h-full">
          <img
            src={barbershopPhoto}
            alt="A barber giving a client a haircut in a modern barbershop"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-background/5 md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-background/20" />
          <div className="absolute bottom-0 left-0 max-w-lg p-6 sm:p-8 md:bottom-10 md:p-10">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-sage-bright">
              FreshCuts
            </div>
            <p className="mt-3 text-2xl font-semibold leading-tight text-white sm:text-3xl">
              Your chair is waiting.
            </p>
            <p className="mt-2 max-w-sm text-sm leading-6 text-white/75">
              Good cuts. Great barbers. Your time, booked just right.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center p-5 sm:p-8 md:p-10">
          <div className="w-full max-w-lg">{children}</div>
        </div>
      </div>
    </section>
  );
}
