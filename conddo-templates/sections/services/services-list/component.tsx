import type { SectionProps } from "../../../types";

/** Menu-style list. Same {@code title|price|description} contract as
 *  services-cards, but rendered as full-width rows with a dotted-leader
 *  price alignment — reads like a restaurant menu / logistics rate card. */
export function ServicesList({ variables, brand }: SectionProps) {
  const heading = String(variables.heading ?? "Menu");
  const raw = variables.services;
  const rows = Array.isArray(raw) ? raw : raw ? [String(raw)] : [];
  const services = rows.map(parseService).filter((s) => s.title);

  if (services.length === 0) return null;

  return (
    <section className="w-full py-20 px-6 bg-white">
      <h2
        style={{ color: brand.primaryColor }}
        className="mb-12 text-center text-3xl font-bold md:text-4xl"
      >
        {heading}
      </h2>
      <ul className="mx-auto max-w-3xl divide-y divide-gray-200">
        {services.map((s, i) => (
          <li key={`${s.title}-${i}`} className="py-5">
            <div className="flex items-baseline gap-4">
              <span className="text-lg font-semibold text-gray-900">
                {s.title}
              </span>
              <span className="flex-1 border-b border-dotted border-gray-300" />
              {s.price && (
                <span
                  style={{ color: brand.primaryColor }}
                  className="text-lg font-bold whitespace-nowrap"
                >
                  {s.price}
                </span>
              )}
            </div>
            {s.description && (
              <p className="mt-1.5 text-sm text-gray-600">{s.description}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function parseService(row: string): { title: string; price: string; description: string } {
  const [title = "", price = "", description = ""] = String(row).split("|").map((s) => s.trim());
  return { title, price, description };
}
