import { MapPin, ExternalLink } from 'lucide-react';

interface VenueMapProps {
  address: string;
  city: string;
}

export function VenueMap({ address, city }: VenueMapProps) {
  const query = encodeURIComponent(`${address}, ${city}, Tunisia`);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
  const embedSrc = `https://maps.google.com/maps?q=${query}&output=embed&z=15`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <MapPin className="size-4" />
          Localisation
        </div>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          Ouvrir dans Maps <ExternalLink className="size-3" />
        </a>
      </div>
      <div className="overflow-hidden rounded-xl border bg-muted">
        <iframe
          title="Localisation du lieu"
          src={embedSrc}
          width="100%"
          height="240"
          className="w-full block"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <p className="text-sm text-muted-foreground flex items-center gap-1.5">
        <MapPin className="size-3.5 shrink-0" />
        {address}, {city}
      </p>
    </div>
  );
}
