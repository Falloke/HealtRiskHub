// E:\HealtRiskHub\app\features\main\dashBoardPage\component\HomeMapInner.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { GeoJsonObject, Feature } from "geojson";

type ProvinceItem = {
  ProvinceNo: number;
  ProvinceNameThai: string;
  Region_VaccineRollout_MOPH?: string | null;
};

type Disease = { code: string; name_th: string; name_en: string };

interface ProvinceInfo {
  name: string;
  disease: string;
  patients: number;
  riskLevel: string;
}

// ตัด “จังหวัด”, วงเล็บ, เว้นวรรค และคงไว้เฉพาะอักษรไทย
const normalizeThai = (s: string) =>
  s.replace(/^จังหวัด/, "").replace(/\(.*?\)/g, "").replace(/\s+/g, "").replace(/[^\u0E00-\u0E7F]/g, "").trim();

const hasThai = (s: string) => /[\u0E00-\u0E7F]/.test(s);
const normalizeEng = (s: string) => s.toLowerCase().trim();

const HomeMapInner = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const [geoData, setGeoData] = useState<GeoJsonObject | null>(null);
  const [provinceList, setProvinceList] = useState<string[]>([]);
  const [provErr, setProvErr] = useState<string | null>(null);

  // โรคจากฐานข้อมูล
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [diseaseErr, setDiseaseErr] = useState<string | null>(null);

  const [hoveredProvince, setHoveredProvince] = useState<ProvinceInfo | null>(null);

  // 1) โหลดขอบเขตจังหวัด (GeoJSON)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/data/thailand-province-simple.json", { cache: "force-cache" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setGeoData(await res.json());
      } catch (e) {
        console.error("load geojson failed:", e);
      }
    })();
  }, []);

  // 2) โหลดรายชื่อจังหวัดมาตรฐาน
  useEffect(() => {
    (async () => {
      try {
        setProvErr(null);
        const res = await fetch("/data/Thailand-ProvinceName.json", { cache: "force-cache" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ProvinceItem[] = await res.json();
        const names = data.map((p) => p.ProvinceNameThai).filter(Boolean);
        if (!names.length) throw new Error("empty province list");
        setProvinceList(names);
      } catch (e) {
        console.error("load provinces failed:", e);
        setProvinceList([]);
        setProvErr("ไม่สามารถโหลดรายชื่อจังหวัด");
      }
    })();
  }, []);

  // 3) โหลดรายชื่อโรคจาก DB
  useEffect(() => {
    (async () => {
      try {
        setDiseaseErr(null);
        const res = await fetch("/api/diseases", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Disease[] = await res.json();
        setDiseases(data);
      } catch (e) {
        console.error("load diseases failed:", e);
        setDiseaseErr("ไม่สามารถโหลดรายชื่อโรค");
      }
    })();
  }, []);

  // 4) ดัชนีสำหรับแมตช์ชื่อจังหวัด
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
    const nl = (props.NL_NAME_1 as string | undefined) ?? undefined; // ไทย
    const en = (props.NAME_1 as string | undefined) ?? undefined; // อังกฤษ (สำรอง)

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

  // 5) วาดแผนที่
  useEffect(() => {
    if (!ready || !mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([13.5, 100.5], 6);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    const geoJsonLayer = L.geoJSON(geoData as GeoJsonObject, {
      style: { color: "#999", weight: 1, fillColor: "#4F46E5", fillOpacity: 0.4 },
      onEachFeature: (feature: Feature, layer: L.Layer) => {
        const nameTH = getThaiOfficialName(feature);

        // เลือกชื่อโรคจาก DB (สุ่ม 1 โรค ถ้าไม่มีให้เป็น “—”)
        const chosenDisease = diseases.length
          ? diseases[Math.floor(Math.random() * diseases.length)].name_th
          : "—";

        const info: ProvinceInfo = {
          name: nameTH,
          disease: chosenDisease,
          patients: Math.floor(Math.random() * 10000),
          riskLevel: ["ต่ำ", "ปานกลาง", "สูง"][Math.floor(Math.random() * 3)],
        };

        layer.on({
          mouseover: () => {
            setHoveredProvince(info);
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
  }, [ready, geoData, thaiMap, engMap, diseases]);

  return (
    <div className="relative h-[600px] w-full">
      {hoveredProvince && (
        <div className="absolute top-4 right-4 z-[1000] w-64 rounded-lg bg-white p-4 shadow-md">
          <h2 className="text-xl font-semibold">{hoveredProvince.name}</h2>
          <p>โรคระบาด: {hoveredProvince.disease}</p>
          <p>จำนวนผู้ป่วย: {hoveredProvince.patients}</p>
          <p>ระดับความเสี่ยง: {hoveredProvince.riskLevel}</p>
        </div>
      )}
      {(provErr || diseaseErr) && (
        <div className="absolute left-4 top-4 z-[1000] rounded bg-white px-3 py-2 text-xs text-red-600 shadow">
          {provErr || diseaseErr}
        </div>
      )}
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
};  

export default HomeMapInner;
