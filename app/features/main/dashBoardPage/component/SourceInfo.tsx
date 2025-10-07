"use client";

import { useEffect, useState } from "react";

type DataSource = {
  id: number;
  slug: string | null;
  name: string | null;
  agency: string | null;
  logo_url: string | null;
  website_url: string | null;
  description: string | null;
};

const SourceInfo = () => {
  const [items, setItems] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch("/api/data-sources", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: DataSource[] = await res.json();
        setItems(data);
      } catch (e) {
        console.error(e);
        setErr("ไม่สามารถโหลดแหล่งที่มาข้อมูลได้");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="text-sm text-gray-600">กำลังโหลดแหล่งข้อมูล...</div>;
  if (err) return <div className="text-sm text-red-600">{err}</div>;
  if (items.length === 0)
    return (
      <div className="text-sm text-gray-600">
        <p className="font-semibold">แหล่งที่มาของข้อมูล :</p>
        <p>- ไม่พบรายการ -</p>
      </div>
    );

  return (
    <div className="text-sm text-gray-600">
      <p className="mb-2 font-semibold">แหล่งที่มาของข้อมูล :</p>
      <ul className="space-y-3">
        {items.map((s) => (
          <li key={s.id} className="flex items-start gap-3">
            {/* logo (ถ้ามี) */}
            {s.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={s.logo_url}
                alt={s.name ?? s.agency ?? "logo"}
                className="mt-0.5 h-6 w-6 rounded object-contain"
                loading="lazy"
              />
            ) : (
              <div className="mt-0.5 h-6 w-6 rounded bg-gray-200" />
            )}

            <div>
              <div className="font-medium text-gray-800">
                {s.name ?? s.slug ?? "ไม่ระบุชื่อ"}
              </div>
              {s.agency && <div className="text-xs text-gray-500">{s.agency}</div>}

              {s.website_url && (
                <a
                  className="break-all text-blue-500 underline"
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
    </div>
  );
};

export default SourceInfo;
