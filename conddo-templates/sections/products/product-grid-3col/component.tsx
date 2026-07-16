import type { SectionProps } from "../../../types";

/** Three-column product grid.
 *
 *  Products come in as a string[] where each entry is
 *  {@code name|price|imageUrl} — a pipe-delimited triple. This keeps the
 *  wire shape flat so the AI Provisioning Service can generate content
 *  without needing a nested schema per section. Missing fields render as
 *  empty rather than breaking the grid. */
export function ProductGrid3Col({ variables, brand }: SectionProps) {
  const heading = String(variables.heading ?? "Featured products");
  const raw = variables.products;
  const rows = Array.isArray(raw) ? raw : raw ? [String(raw)] : [];
  const products = rows.map(parseProduct).filter((p) => p.name);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-20 px-6 bg-white">
      <h2
        style={{ color: brand.primaryColor }}
        className="text-3xl md:text-4xl font-bold text-center mb-12"
      >
        {heading}
      </h2>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
        {products.map((p, i) => (
          <article
            key={`${p.name}-${i}`}
            className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            {p.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.imageUrl}
                alt={p.name}
                className="h-56 w-full object-cover"
              />
            ) : (
              <div
                className="h-56 w-full"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${brand.primaryColor}22, ${brand.secondaryColor}11)`,
                }}
              />
            )}
            <div className="flex flex-1 flex-col p-5">
              <h3 className="text-base font-semibold text-gray-900">
                {p.name}
              </h3>
              {p.price && (
                <p
                  style={{ color: brand.primaryColor }}
                  className="mt-2 text-lg font-bold"
                >
                  {p.price}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function parseProduct(row: string): { name: string; price: string; imageUrl: string } {
  const [name = "", price = "", imageUrl = ""] = String(row).split("|").map((s) => s.trim());
  return { name, price, imageUrl };
}
