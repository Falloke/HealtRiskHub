"use client";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { GeoJsonObject, Feature } from "geojson";

interface ProvinceInfo {
  name: string;
  disease: string;
  patients: number;
  riskLevel: string;
}

const HomeMapInner = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [geoData, setGeoData] = useState<GeoJsonObject | null>(null);
  const [hoveredProvince, setHoveredProvince] = useState<ProvinceInfo | null>(
    null
  );

  // โหลด GeoJSON
  useEffect(() => {
    fetch("/data/thailand-province-simple.json")
      .then((res) => res.json())
      .then((data) => setGeoData(data));
  }, []);

  // สร้างแผนที่
  useEffect(() => {
    if (!geoData || !mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([13.5, 100.5], 6);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    const geoJsonLayer = L.geoJSON(geoData, {
      style: {
        color: "#999",
        weight: 1,
        fillColor: "#4F46E5",
        fillOpacity: 0.4,
      },
      onEachFeature: (feature: Feature, layer: L.Layer) => {
        const name =
          feature.properties?.NL_NAME_1 || feature.properties?.NAME_1;
        if (!name) return;

        const info: ProvinceInfo = {
          name,
          disease: "ไข้เลือดออก",
          patients: Math.floor(Math.random() * 10000),
          riskLevel: ["ต่ำ", "ปานกลาง", "สูง"][Math.floor(Math.random() * 3)],
        };

        layer.on({
          mouseover: () => {
            setHoveredProvince(info);
            (layer as L.Path).setStyle({ fillOpacity: 0.7, color: "#333" });
          },
          mouseout: () => {
            setHoveredProvince(null);
            (layer as L.Path).setStyle({ fillOpacity: 0.4, color: "#999" });
          },
        });

        layer.bindTooltip(name, {
          direction: "top",
          sticky: true,
        });
      },
    });

    geoJsonLayer.addTo(map);
    mapInstanceRef.current = map;

    // cleanup ตอน unmount
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [geoData]);

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
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
};

export default HomeMapInner;
