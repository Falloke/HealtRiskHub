// app/features/admin/adminDashboardPage/component/WebInfo.tsx
"use client";

import { useEffect, useState, type FormEvent } from "react";

export type WebInfoInitial = {
  siteName: string;
  tagline: string;
  contactEmail: string;
  logoUrl: string;
};

type Props = {
  /** ถ้าไม่ส่งมา จะดึงจาก /api/admin/webinfo อัตโนมัติ */
  initial?: WebInfoInitial;
};

export default function WebInfo({ initial }: Props) {
  // state หลัก
  const [siteName, setSiteName] = useState(initial?.siteName ?? "");
  const [tagline, setTagline] = useState(initial?.tagline ?? "");
  const [contactEmail, setContactEmail] = useState(initial?.contactEmail ?? "");
  const [logoUrl, setLogoUrl] = useState(initial?.logoUrl ?? "");

  // state โหลด/ผิดพลาด/บันทึก
  const [loading, setLoading] = useState(!initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ถ้าไม่ได้ส่ง initial มาก็โหลดจาก API
  useEffect(() => {
    if (initial) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/admin/webinfo", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as Partial<WebInfoInitial> | null;

        if (!cancelled && json) {
          setSiteName(json.siteName ?? "");
          setTagline(json.tagline ?? "");
          setContactEmail(json.contactEmail ?? "");
          setLogoUrl(json.logoUrl ?? "");
        }
      } catch (e) {
        if (!cancelled) setError("โหลดข้อมูลเว็บไม่สำเร็จ");
        console.error("[WebInfo] fetch failed:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initial]);

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const res = await fetch("/api/admin/webinfo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteName, tagline, contactEmail, logoUrl }),
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `HTTP ${res.status}`);
      }
      alert("บันทึกสำเร็จ");
    } catch (err) {
      console.error("[WebInfo] save failed:", err);
      setError("บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-sm text-gray-500">กำลังโหลดข้อมูล…</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">Site name</label>
        <input
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
          className="w-full rounded-md border px-3 py-2"
          placeholder="HealthRisk Hub"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Tagline</label>
        <input
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          className="w-full rounded-md border px-3 py-2"
          placeholder="ระบบวิเคราะห์ความเสี่ยงด้านสุขภาพ"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Contact email</label>
        <input
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          className="w-full rounded-md border px-3 py-2"
          placeholder="contact@example.com"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Logo URL</label>
        <input
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          className="w-full rounded-md border px-3 py-2"
          placeholder="/images/logo.png"
        />
        {logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt="logo preview"
            className="mt-2 h-10 w-auto rounded border bg-white object-contain p-1"
          />
        )}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-pink-600 px-4 py-2 text-white transition hover:bg-pink-700 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
