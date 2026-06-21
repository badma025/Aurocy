import Link from "next/link";

export default function SuccessPage() {
  return (
    <section className="min-h-screen bg-[#0B1120] px-4 py-20 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-3xl items-center justify-center">
        <div className="w-full rounded-3xl border border-white/10 bg-[#111827] p-8 shadow-2xl shadow-black/30 sm:p-12">
          <div className="mb-6 inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1 text-sm font-medium text-emerald-300">
            Payment confirmed
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Payment Successful!
          </h1>

          <p className="mt-6 text-lg text-slate-300">
            Thank you for your purchase. Your order is complete and your download is on the
            way.
          </p>

          <p className="mt-4 text-base text-slate-400 sm:text-lg">
            Check your inbox (and spam folder) for your flashcard download link.
          </p>

          <div className="mt-10">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0B1120] transition hover:bg-slate-200"
            >
              Return to Shop
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
