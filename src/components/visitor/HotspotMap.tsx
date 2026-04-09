"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import type { HotspotResponse } from "@/types";
import "leaflet/dist/leaflet.css";

interface Props {
  hotspots: HotspotResponse[];
}

export default function HotspotMap({ hotspots }: Props) {
  const center: [number, number] = hotspots.length > 0
    ? [hotspots[0].latitude, hotspots[0].longitude]
    : [20.5937, 78.9629];

  return (
    <MapContainer
      key={`${center[0]}-${center[1]}-${hotspots.length}`}
      center={center}
      zoom={hotspots.length > 0 ? 10 : 5}
      style={{ height: "100%", width: "100%", background: "#0f2318" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {hotspots.map((h) => (
        <CircleMarker
          key={h.id}
          center={[h.latitude, h.longitude]}
          radius={h.masked ? 18 : 12}
          pathOptions={{
            color: h.masked ? "#c9872f" : "#3da066",
            fillColor: h.masked ? "rgba(201,135,47,0.3)" : "rgba(61,160,102,0.3)",
            fillOpacity: 0.8,
            weight: 2,
          }}
        >
          <Popup>
            <div style={{ fontFamily: "Inter, sans-serif", minWidth: 140 }}>
              <strong style={{ fontSize: 15 }}>{h.species}</strong>
              <br />
              {h.masked ? (
                <span style={{ color: "#c9872f", fontSize: 12 }}>⚠ Geomasked location</span>
              ) : (
                <span style={{ color: "#3da066", fontSize: 12 }}>
                  {h.latitude.toFixed(4)}, {h.longitude.toFixed(4)}
                </span>
              )}
              {h.notes && <p style={{ marginTop: 6, fontSize: 12, color: "#555" }}>{h.notes}</p>}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
