import type { SectionProps } from "../../../types";

/** Grid of service cards. Each service is a pipe-delimited triple:
 *  {@code title|price|description}. Keeps the wire shape flat so AI
 *  content generation doesn't need a nested schema per section. */
export function ServicesCards({ variables, brand }: SectionProps) {
  const heading = String(variables.heading ?? "What we do");
  const raw = variables.services;
  const rows = Array.isArray(raw) ? raw : raw ? [String(raw)] : [];
  const services = rows.map(parseService).filter((s) => s.title);

  if (services.length === 0) return null;

  return (
    <section className="w-full py-20 px-6 bg-white">
      <h2
        style={{ color: brand.primaryColor }}
        className="text-3xl md:text-4xl font-bold text-center mb-12"
      >
        {heading}
      </h2>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((s, i) => (
          <article
            key={`${s.title}-${i}`}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div
              className="mb-4 h-1 w-10 rounded-full"
              style={{ backgroundColor: brand.primaryColor }}
            />
            <h3 className="text-lg font-semibold text-gray-900">{s.title}</h3>
            {s.price && (
              <p
                style={{ color: brand.primaryColor }}
                className="mt-2 text-xl font-bold"
              >
                {s.price}
              </p>
            )}
            {s.description && (
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                {s.description}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function parseService(row: string): { title: string; price: string; description: string } {
  const [title = "", price = "", description = ""] = String(row).split("|").map((s) => s.trim());
  return { title, price, description };
}
