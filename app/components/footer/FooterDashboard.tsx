// E:\HealtRiskHub\app\components\footer\FooterDashboard.tsx
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

type Props = { className?: string };

const FALLBACK_LOGO = "/images/placeholder.png";

function normalizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("/")) return url;
  if (!/^https?:\/\//i.test(url)) return `https://${url}`;
  return url;
}

export default function FooterDashboard({ className = "" }: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch("/api/data-sources", { cache: "no-store", signal: ac.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as { items?: Item[] };
        setItems(json.items ?? []);
<<<<<<< HEAD
      } catch (e) {
=======
      } catch (e: unknown) {
>>>>>>> feature/Edit
        if (e instanceof DOMException && e.name === "AbortError") return;
        console.error("[FooterDashboard] fetch error:", e);
        setErr("ไม่สามารถโหลดแหล่งที่มาของข้อมูลได้");
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  if (loading) {
    return (
<<<<<<< HEAD
      <footer className={`border-t pt-3 text-sm text-gray-600 ${className}`}>
=======
      <footer className={`mt-3 text-sm text-gray-600 ${className}`}>
>>>>>>> feature/Edit
        <p className="text-gray-500">กำลังโหลดแหล่งที่มาของข้อมูล…</p>
      </footer>
    );
  }
  if (err) {
    return (
<<<<<<< HEAD
      <footer className={`border-t pt-3 text-sm ${className}`}>
=======
      <footer className={`mt-3 text-sm ${className}`}>
>>>>>>> feature/Edit
        <p className="text-red-600">{err}</p>
      </footer>
    );
  }
  if (!items.length) return null;

  return (
<<<<<<< HEAD
    <footer className={`border-t pt-3 text-sm text-gray-600 ${className}`}>
      <p className="mb-2 font-semibold">แหล่งที่มาของข้อมูล :</p>

      {/* ทำเป็น 2 คอลัมน์ (มือถือ = 1, จอ >= md = 2) */}
      <ul className="grid grid-cols-1 gap-x-8 gap-y-3 md:grid-cols-2">
=======
    // ไม่มีหัวข้อ/เส้นคั่น และป้องกันสกอลล์แนวนอน
    <footer className={`mt-3 text-sm text-gray-600 overflow-x-hidden ${className}`}>
      <ul className="space-y-3">
>>>>>>> feature/Edit
        {items.map((s) => {
          const logoSrc = normalizeUrl(s.logo_url) ?? FALLBACK_LOGO;
          const href = normalizeUrl(s.website_url);
          return (
            <li key={s.id} className="flex items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoSrc}
                alt={s.name ?? s.agency ?? "logo"}
                className="mt-0.5 h-6 w-6 shrink-0 rounded object-contain"
                loading="lazy"
                decoding="async"
                onError={(ev) => {
<<<<<<< HEAD
                  const img = ev.currentTarget;
=======
                  const img = ev.currentTarget as HTMLImageElement;
>>>>>>> feature/Edit
                  if (!img.src.endsWith(FALLBACK_LOGO)) img.src = FALLBACK_LOGO;
                }}
              />
              <div className="min-w-0">
<<<<<<< HEAD
                <div className="font-medium text-gray-800 truncate">
                  {s.name ?? s.slug ?? "ไม่ระบุชื่อ"}
                </div>
                {s.agency && <div className="text-xs text-gray-500 truncate">{s.agency}</div>}
=======
                <div className="font-medium text-gray-800 break-words">{s.name ?? s.slug ?? "ไม่ระบุชื่อ"}</div>
                {s.agency && <div className="text-xs text-gray-500 break-words">{s.agency}</div>}
>>>>>>> feature/Edit
                {href && (
                  <a
                    className="text-blue-600 underline break-words"
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {href}
                  </a>
                )}
<<<<<<< HEAD
                {s.description && (
                  <div className="mt-0.5 text-xs text-gray-500">{s.description}</div>
                )}
=======
                {s.description && <div className="mt-0.5 text-xs text-gray-500 break-words">{s.description}</div>}
>>>>>>> feature/Edit
              </div>
            </li>
          );
        })}
      </ul>
    </footer>
  );
}
