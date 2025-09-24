// "use client";

// import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import { useEffect, useRef, useState } from "react";
// import type { GeoJsonObject, Feature } from "geojson";
// import L from "leaflet";

// const MapClient = () => {
//   const [geoData, setGeoData] = useState<GeoJsonObject | null>(null);
//   const [hoveredProvince, setHoveredProvince] = useState(null);
//   const mapContainerRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     // 🧹 แก้ปัญหา Leaflet ซ้อนกัน (Dev Mode / Hot Reload)
//     if (mapContainerRef.current) {
//       mapContainerRef.current.innerHTML = "";
//     }

//     fetch("/data/thailand-province-simple.json")
//       .then((res) => res.json())
//       .then((data) => setGeoData(data));
//   }, []);

//   const onEachFeature = (feature: Feature, layer: L.Layer) => {
//     const name = feature.properties?.NL_NAME_1 || feature.properties?.NAME_1;
//     if (!name) return;

//     const mockInfo = {
//       name,
//       disease: "ไข้เลือดออก",
//       patients: Math.floor(Math.random() * 10000),
//       riskLevel: ["ต่ำ", "ปานกลาง", "สูง"][Math.floor(Math.random() * 3)],
//     };

//     layer.on({
//       mouseover: () => {
//         setHoveredProvince(mockInfo);
//         (layer as L.Path).setStyle({ fillOpacity: 0.7, color: "#333" });
//       },
//       mouseout: () => {
//         setHoveredProvince(null);
//         (layer as L.Path).setStyle({ fillOpacity: 0.4, color: "#999" });
//       },
//     });

//     layer.bindTooltip(name, {
//       direction: "top",
//       sticky: true,
//     });
//   };

//   return (
//     <div ref={mapContainerRef} className="relative h-[600px] w-full">
//       {hoveredProvince && (
//         <div className="absolute top-4 right-4 z-[1000] w-64 rounded-lg bg-white p-4 shadow-md">
//           <h2 className="text-xl font-semibold">{hoveredProvince.name}</h2>
//           <p>โรคระบาด: {hoveredProvince.disease}</p>
//           <p>จำนวนผู้ป่วย: {hoveredProvince.patients}</p>
//           <p>ระดับความเสี่ยง: {hoveredProvince.riskLevel}</p>
//         </div>
//       )}

//       <MapContainer
//         center={[13.5, 100.5]}
//         zoom={6}
//         className="z-0"
//         style={{ width: "100%", height: "100%", zIndex: 0 }}
//       >
//         <TileLayer
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           attribution="© OpenStreetMap contributors"
//         />
//         {geoData && (
//           <GeoJSON
//             data={geoData}
//             onEachFeature={onEachFeature}
//             style={() => ({
//               color: "#999",
//               weight: 1,
//               fillColor: "#4F46E5",
//               fillOpacity: 0.4,
//             })}
//           />
//         )}
//       </MapContainer>
//     </div>
//   );
// };

// export default MapClient;
