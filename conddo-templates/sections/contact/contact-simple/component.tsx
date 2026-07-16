import type { SectionProps } from "../../../types";

/** Address / phone / email / optional map link on a neutral background.
 *  Labels use the primary colour so the section reads as branded even
 *  though the surface stays quiet. */
export function ContactSimple({ variables, brand }: SectionProps) {
  const address = variables.address ? String(variables.address) : null;
  const phone = variables.phone ? String(variables.phone) : null;
  const email = variables.email ? String(variables.email) : null;
  const mapLink = variables.mapLink ? String(variables.mapLink) : null;

  const hasAnything = address || phone || email || mapLink;
  if (!hasAnything) return null;

  return (
    <section className="w-full py-20 px-10 bg-gray-50">
      <h2
        style={{ color: brand.primaryColor }}
        className="text-3xl font-bold mb-10 text-center"
      >
        Get in touch
      </h2>
      <div className="mx-auto max-w-xl space-y-4">
        {address && (
          <Row label="Address" color={brand.primaryColor}>
            <span className="text-gray-700">{address}</span>
          </Row>
        )}
        {phone && (
          <Row label="Phone" color={brand.primaryColor}>
            <a href={`tel:${phone}`} className="text-gray-700 hover:underline">
              {phone}
            </a>
          </Row>
        )}
        {email && (
          <Row label="Email" color={brand.primaryColor}>
            <a
              href={`mailto:${email}`}
              className="text-gray-700 hover:underline"
            >
              {email}
            </a>
          </Row>
        )}
        {mapLink && (
          <div className="pt-2 text-center">
            <a
              href={mapLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ backgroundColor: brand.primaryColor }}
              className="inline-block rounded-full px-6 py-3 font-bold text-white transition-opacity hover:opacity-90"
            >
              View on map
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

function Row({
  label,
  color,
  children,
}: {
  label: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <span style={{ color }} className="w-24 shrink-0 font-bold">
        {label}
      </span>
      {children}
    </div>
  );
}
