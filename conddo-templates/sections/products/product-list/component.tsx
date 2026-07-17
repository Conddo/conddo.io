import type { SectionProps } from "../../../types";

/** Dense product list. Same {@code name|price|imageUrl|description}
 *  contract as product-grid-3col but the fourth field (description) is
 *  the star — image is optional and, when present, appears as a small
 *  left-anchored thumbnail rather than the headline visual. */
export function ProductList({ variables, brand }: SectionProps) {
  const heading = String(variables.heading ?? "Products");
  const raw = variables.products;
  const rows = Array.isArray(raw) ? raw : raw ? [String(raw)] : [];
  const products = rows.map(parseProduct).filter((p) => p.name);

  if (products.length === 0) return null;

  return (
    <section className="w-full py-20 px-6 bg-white">
      <h2
        style={{ color: brand.primaryColor }}
        className="mb-10 text-center text-3xl font-bold md:text-4xl"
      >
        {heading}
      </h2>
      <ul className="mx-auto max-w-3xl divide-y divide-gray-200">
        {products.map((p, i) => (
          <li key={`${p.name}-${i}`} className="flex gap-4 py-5">
            {p.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.imageUrl}
                alt={p.name}
                className="h-16 w-16 shrink-0 rounded-lg object-cover"
                loading="lazy"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="truncate text-base font-semibold text-gray-900">
                  {p.name}
                </h3>
                {p.price && (
                  <span
                    style={{ color: brand.primaryColor }}
                    className="whitespace-nowrap text-base font-bold"
                  >
                    {p.price}
                  </span>
                )}
              </div>
              {p.description && (
                <p className="mt-1 text-[13.5px] leading-relaxed text-gray-600">
                  {p.description}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function parseProduct(row: string): {
  name: string;
  price: string;
  imageUrl: string;
  description: string;
} {
  const [name = "", price = "", imageUrl = "", description = ""] = String(row)
    .split("|")
    .map((s) => s.trim());
  return { name, price, imageUrl, description };
}
