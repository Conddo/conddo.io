import type { SectionProps } from "../../../types";

/** Responsive image grid. Entries are either bare URLs or {@code url|caption}
 *  pairs. Slight aspect variety across the grid (2 tall, 4 square) creates a
 *  magazine feel without needing a masonry layout engine. */
export function GalleryGrid({ variables, brand }: SectionProps) {
  const heading = String(variables.heading ?? "Gallery");
  const raw = variables.images;
  const rows = Array.isArray(raw) ? raw : raw ? [String(raw)] : [];
  const images = rows.map(parseImage).filter((i) => i.url);

  if (images.length === 0) return null;

  return (
    <section className="w-full py-20 px-6 bg-white">
      <h2
        style={{ color: brand.primaryColor }}
        className="mb-12 text-center text-3xl font-bold md:text-4xl"
      >
        {heading}
      </h2>
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {images.map((img, i) => (
          <figure
            key={i}
            // Every 5th image spans two rows for a light magazine feel.
            className={`relative overflow-hidden rounded-xl bg-gray-100 ${
              i % 5 === 0 ? "row-span-2 aspect-[3/4]" : "aspect-square"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={img.caption || `Gallery image ${i + 1}`}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              loading="lazy"
            />
            {img.caption && (
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-[12px] font-medium text-white">
                {img.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  );
}

function parseImage(row: string): { url: string; caption: string } {
  const [url = "", caption = ""] = String(row).split("|").map((s) => s.trim());
  return { url, caption };
}
