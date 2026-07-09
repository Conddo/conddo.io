"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Plus, MapPin, Bed, Loader2 } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/States";
import { useApiQuery } from "@/hooks/useApiQuery";
import { naira } from "@/lib/format";
import { CreatePropertyModal } from "@/components/app/CreatePropertyModal";
import {
  propertiesQuery,
  listingTypeLabel,
  propertyStatusLabel,
  propertyStatusTone,
  propertyTypeLabel,
  type PropertyPage,
  type PropertyRow,
} from "@/lib/api/properties";

const PAGE_SIZE = 20;

/**
 * Real Estate module — properties list. Card grid, live counts, quick
 * create modal. Deals + viewings live on their own routes; the "Add to deal"
 * shortcut on each card jumps to the kanban with the property pre-selected.
 */
export default function PropertiesPage() {
  const [page, setPage] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);

  const q = useApiQuery<PropertyPage>(() => propertiesQuery(page, PAGE_SIZE), [page]);
  const rows = q.data?.content ?? [];
  const total = q.data?.total ?? 0;

  return (
    <AppShell
      title="Properties"
      subtitle={total > 0 ? `${total} listing${total === 1 ? "" : "s"}` : undefined}
      actions={
        <Button onClick={() => setCreateOpen(true)} variant="primary" size="md">
          <Plus size={16} strokeWidth={2.25} />
          New listing
        </Button>
      }
    >
      {q.loading && rows.length === 0 && <PropertiesSkeleton />}

      {!q.loading && rows.length === 0 && (
        <EmptyState
          icon={Building2}
          title="No properties yet"
          description="Add your first listing and it'll appear here + on your website's featured section."
          action={
            <Button onClick={() => setCreateOpen(true)} variant="primary" size="md">
              <Plus size={16} strokeWidth={2.25} />
              New listing
            </Button>
          }
        />
      )}

      {rows.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((p) => <PropertyCard key={p.id} row={p} />)}
        </div>
      )}

      {q.loading && rows.length > 0 && (
        <div className="mt-6 flex items-center justify-center text-white/45">
          <Loader2 size={16} className="mr-2 animate-spin" /> Refreshing…
        </div>
      )}

      <CreatePropertyModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false);
          q.refetch();
        }}
      />
    </AppShell>
  );
}

function PropertyCard({ row }: { row: PropertyRow }) {
  return (
    <Link
      href={`/properties/${row.id}`}
      className="group block overflow-hidden rounded-2xl border border-white/[0.08] bg-cinema-elev transition-colors hover:border-white/[0.15]"
    >
      <div className="relative aspect-[16/10] w-full bg-cinema-base">
        {row.primaryImageUrl ? (
          // Server-fetched, tenant-supplied; no next/image because Cloudinary
          // handles the CDN + responsive resize.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={row.primaryImageUrl} alt={row.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-white/25">
            <Building2 size={40} strokeWidth={1.25} />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <Chip tone={propertyStatusTone(row.status)}>{propertyStatusLabel(row.status)}</Chip>
        </div>
        {row.featured && (
          <div className="absolute right-3 top-3">
            <Chip tone="warning">Featured</Chip>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="mb-1 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.06em] text-white/50">
          <span>{propertyTypeLabel(row.propertyType)}</span>
          <span aria-hidden>·</span>
          <span>{listingTypeLabel(row.listingType)}</span>
        </div>
        <h3 className="line-clamp-1 text-[15px] font-medium text-white">{row.title}</h3>
        <p className="mt-1.5 text-[17px] font-medium tracking-tight text-white">
          {naira(row.price)}
        </p>
        <div className="mt-3 flex items-center gap-3 text-[12.5px] text-white/55">
          {row.estateName && (
            <span className="inline-flex items-center gap-1">
              <MapPin size={13} strokeWidth={2} />
              {row.estateName}
              {row.state ? `, ${row.state}` : ""}
            </span>
          )}
          {row.bedrooms != null && (
            <span className="inline-flex items-center gap-1">
              <Bed size={13} strokeWidth={2} />
              {row.bedrooms} bed
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function PropertiesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-white/[0.08] bg-cinema-elev">
          <div className="aspect-[16/10] w-full animate-pulse bg-white/[0.04]" />
          <div className="space-y-2 p-4">
            <div className="h-3 w-16 animate-pulse rounded bg-white/[0.06]" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-white/[0.06]" />
            <div className="h-5 w-1/2 animate-pulse rounded bg-white/[0.08]" />
          </div>
        </div>
      ))}
    </div>
  );
}
