import { client } from "@/lib/sanity";

interface Testimonial {
  _id: string;
  name: string;
  subject: string;
  targetGrade: string;
  quote: string;
  rating: number;
}

const featuredTestimonialsQuery = `
  *[_type == "testimonial" && isFeatured == true] | order(_createdAt desc) {
    _id,
    name,
    subject,
    targetGrade,
    quote,
    rating
  }
`;

async function getFeaturedTestimonials() {
  return client.fetch<Testimonial[]>(featuredTestimonialsQuery);
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => {
        const isFilled = index < rating;

        return (
          <span
            key={index}
            className={isFilled ? "text-amber-300" : "text-slate-600"}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

export default async function TestimonialsSection() {
  const testimonials = await getFeaturedTestimonials();

  if (!testimonials.length) {
    return null;
  }

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
            Curated Testimonials
          </p>
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            Trusted By Students Aiming High
          </h2>
          <p className="text-lg text-slate-300">
            Real feedback from students using Aurocy decks to revise faster, stay
            consistent, and push for top grades.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial._id}
              className="flex h-full flex-col rounded-2xl border border-slate-800 bg-[#121a2b] p-6 shadow-lg shadow-black/20"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{testimonial.name}</h3>
                  <p className="mt-1 text-sm text-slate-400">{testimonial.subject}</p>
                </div>
                <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-300">
                  {testimonial.targetGrade}
                </span>
              </div>

              <div className="mb-4">
                <StarRating rating={Math.max(1, Math.min(5, testimonial.rating || 5))} />
              </div>

              <blockquote className="flex-1 text-base leading-7 text-slate-200">
                "{testimonial.quote}"
              </blockquote>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export { featuredTestimonialsQuery };
