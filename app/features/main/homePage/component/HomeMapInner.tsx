"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { GeoJsonObject, Feature } from "geojson";
import { useDashboardStore } from "@/store/useDashboardStore";

type ProvinceItem = {
  ProvinceNo: number;
  ProvinceNameThai: string;
  Region_VaccineRollout_MOPH?: string | null;
};

interface ProvinceInfo {
  name: string;
  disease: string;
  patients: number | null;
  riskLevel: string;
}

const normalizeThai = (s: string) =>
  s
    .replace(/^จังหวัด/, "")
    .replace(/\(.*?\)/g, "")
    .replace(/\s+/g, "")
    .replace(/[^\u0E00-\u0E7F]/g, "")
    .trim();

const hasThai = (s: string) => /[\u0E00-\u0E7F]/.test(s);
const normalizeEng = (s: string) => s.toLowerCase().trim();

export default function HomeMapInner() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const [geoData, setGeoData] = useState<GeoJsonObject | null>(null);
  const [provinceList, setProvinceList] = useState<string[]>([]);
  const [provErr, setProvErr] = useState<string | null>(null);
  const [hoveredProvince, setHoveredProvince] = useState<ProvinceInfo | null>(
    null
  );

  const diseaseCode = useDashboardStore((s) => s.diseaseCode);
  const diseaseNameTh = useDashboardStore((s) => s.diseaseNameTh);
  const start_date = useDashboardStore((s) => s.start_date);
  const end_date = useDashboardStore((s) => s.end_date);

  const countsCache = useRef<Map<string, number>>(new Map());
  useEffect(() => {
    countsCache.current.clear();
  }, [start_date, end_date, diseaseCode]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/data/thailand-province-simple.json", {
          cache: "force-cache",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setGeoData(await res.json());
      } catch (e) {
        console.error("load geojson failed:", e);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setProvErr(null);
        const res = await fetch("/data/Thailand-ProvinceName.json", {
          cache: "force-cache",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ProvinceItem[] = await res.json();
        const names = data.map((p) => p.ProvinceNameThai).filter(Boolean);
        if (!names.length) throw new Error("empty province list");
        setProvinceList(names);
      } catch (e) {
        console.error("load provinces failed:", e);
        setProvErr("ไม่สามารถโหลดรายชื่อจังหวัด");
      }
    })();
  }, []);

  const { thaiMap, engMap } = useMemo(() => {
    const t = new Map<string, string>();
    provinceList.forEach((th) => {
      const key = normalizeThai(th);
      if (key) t.set(key, th);
    });
    const e = new Map<string, string>([["bangkok", "กรุงเทพมหานคร"]]);
    return { thaiMap: t, engMap: e };
  }, [provinceList]);

  const ready = !!geoData && provinceList.length > 0;

  const getThaiOfficialName = (feature: Feature): string => {
    const props = (feature.properties || {}) as Record<string, unknown>;
    const nl = (props.NL_NAME_1 as string | undefined) ?? undefined;
    const en = (props.NAME_1 as string | undefined) ?? undefined;

    if (nl && hasThai(nl)) {
      const key = normalizeThai(nl);
      const hit = key && thaiMap.get(key);
      if (hit) return hit;
      const hit2 = thaiMap.get(normalizeThai(nl.replace(/\(.*?\)/g, "")));
      if (hit2) return hit2;
      return nl.replace(/^จังหวัด/, "").trim();
    }
    if (en && !hasThai(en)) {
      const hit = engMap.get(normalizeEng(en));
      if (hit) return hit;
    }
    return "ไม่ทราบจังหวัด";
  };

  const fetchPatientsForProvince = async (
    provinceName: string
  ): Promise<number> => {
    if (diseaseCode !== "D01") return 0; // ตอนนี้ DB มีจริงเฉพาะ D01
    const key = `${provinceName}|${start_date}|${end_date}|${diseaseCode}`;
    if (countsCache.current.has(key)) return countsCache.current.get(key)!;

    const url = `/api/dashBoard/patients-summary?start_date=${encodeURIComponent(
      start_date
    )}&end_date=${encodeURIComponent(end_date)}&province=${encodeURIComponent(provinceName)}`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as { totalPatients: number };
    const n = Number(json?.totalPatients || 0);
    countsCache.current.set(key, n);
    return n;
  };

  useEffect(() => {
    if (!ready || !mapRef.current) return;

    // เคลียร์ของเดิมก่อน
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapRef.current).setView([13.5, 100.5], 6);

    // ✨ แก้ปัญหา “แผนที่ทับเมนู” — บังคับ z-index ของทุก pane ให้ต่ำ
    const panes = map.getPanes();
    panes.mapPane.style.zIndex = "0";
    panes.tilePane.style.zIndex = "100";
    panes.overlayPane.style.zIndex = "150";
    panes.shadowPane.style.zIndex = "160";
    panes.markerPane.style.zIndex = "170";
    panes.tooltipPane.style.zIndex = "180";
    panes.popupPane.style.zIndex = "190";

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    const geoJsonLayer = L.geoJSON(geoData as GeoJsonObject, {
      style: {
        color: "#999",
        weight: 1,
        fillColor: "#4F46E5",
        fillOpacity: 0.4,
      },
      onEachFeature: (feature: Feature, layer: L.Layer) => {
        const nameTH = getThaiOfficialName(feature);

        const info: ProvinceInfo = {
          name: nameTH,
          disease: diseaseNameTh || "—",
          patients: null,
          riskLevel: ["ต่ำ", "ปานกลาง", "สูง"][Math.floor(Math.random() * 3)],
        };

        layer.on({
          mouseover: async () => {
            setHoveredProvince(info);
            try {
              const p = await fetchPatientsForProvince(nameTH);
              setHoveredProvince((prev) =>
                prev && prev.name === nameTH ? { ...prev, patients: p } : prev
              );
            } catch {
              setHoveredProvince((prev) =>
                prev && prev.name === nameTH ? { ...prev, patients: 0 } : prev
              );
            }
            (layer as L.Path).setStyle({ fillOpacity: 0.7, color: "#333" });
            (layer as any).bringToFront?.();
          },
          mouseout: () => {
            setHoveredProvince(null);
            (layer as L.Path).setStyle({ fillOpacity: 0.4, color: "#999" });
          },
        });

        layer.bindTooltip(nameTH, { direction: "top", sticky: true });
      },
    });

    geoJsonLayer.addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [
    ready,
    geoData,
    thaiMap,
    engMap,
    diseaseNameTh,
    diseaseCode,
    start_date,
    end_date,
  ]);

  return (
    // ✨ ให้ container เป็นตำแหน่ง/เลเยอร์ต่ำสุดเสมอ
    <div className="relative z-0 h-[600px] w-full">
      {hoveredProvince && (
        <div className="absolute top-4 right-4 z-[300] w-72 rounded-lg bg-white p-4 shadow-md">
          <h2 className="text-xl font-semibold">{hoveredProvince.name}</h2>
          <p>โรคระบาด: {hoveredProvince.disease}</p>
          <p>
            จำนวนผู้ป่วย:{" "}
            {hoveredProvince.patients === null
              ? "กำลังโหลด…"
              : hoveredProvince.patients}
          </p>
          <p>ระดับความเสี่ยง: {hoveredProvince.riskLevel}</p>
          {provErr && <p className="mt-1 text-xs text-red-600">{provErr}</p>}
        </div>
      )}
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
}
