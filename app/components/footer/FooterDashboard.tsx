"use client";

import { useEffect, useState } from "react";

type Item = {
  id: number;
  slug: string | null;
  name: string | null;
  agency: string | null;
  logo_url: string | null;
  website_url: string | null;
  description: string | null;
};

export default function FooterDashboardClient({ className = "" }: { className?: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch("/api/data-sources", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as { items?: Item[] };
        if (!cancelled) setItems(json.items ?? []);
      } catch (e) {
        if (!cancelled) setErr("ไม่สามารถโหลดแหล่งที่มาของข้อมูลได้");
        console.error("[FooterDashboardClient] fetch error:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <footer className={`mt-8 border-t pt-4 text-sm text-gray-600 ${className}`}>
        <p className="text-gray-500">กำลังโหลดแหล่งที่มาของข้อมูล…</p>
      </footer>
    );
  }

  if (err) {
    return (
      <footer className={`mt-8 border-t pt-4 text-sm ${className}`}>
        <p className="text-red-600">{err}</p>
      </footer>
    );
  }

  if (!items.length) return null;

  return (
    <footer className={`mt-8 border-t pt-4 text-sm text-gray-600 ${className}`}>
      <p className="mb-2 font-semibold">แหล่งที่มาของข้อมูล :</p>
      <ul className="space-y-3">
        {items.map((s) => (
          <li key={s.id} className="flex items-start gap-3">
            {s.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={s.logo_url}
                alt={s.name ?? s.agency ?? "logo"}
                className="mt-0.5 h-6 w-6 rounded object-contain"
                loading="lazy"
              />
            ) : (
              <span className="mt-0.5 inline-block h-6 w-6 rounded bg-gray-200" />
            )}

            <div>
              <div className="font-medium text-gray-800">
                {s.name ?? s.slug ?? "ไม่ระบุชื่อ"}
              </div>

              {s.agency && <div className="text-xs text-gray-500">{s.agency}</div>}

              {s.website_url && (
                <a
                  className="break-all text-blue-600 underline"
                  href={s.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {s.website_url}
                </a>
              )}

              {s.description && (
                <div className="mt-0.5 text-xs text-gray-500">{s.description}</div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </footer>
  );
}
