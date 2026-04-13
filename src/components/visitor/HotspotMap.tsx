"use client";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import type { HotspotResponse } from "@/types";

interface Props {
  hotspots: HotspotResponse[];
}

export default function HotspotMap({ hotspots }: Props) {
  const firstValid = hotspots.find(
    (h) => !isNaN(Number(h.latitude)) && !isNaN(Number(h.longitude))
  );

  const center: [number, number] = firstValid
    ? [Number(firstValid.latitude), Number(firstValid.longitude)]
    : [20.5937, 78.9629];
  const zoom = firstValid ? 10 : 5;

  return (
    <MapContainer
      key={`hotspot-map-${hotspots.length}`}
      center={center}
      zoom={zoom}
      style={{ height: "100%", width: "100%", background: "#0f2318" }}
      scrollWheelZoom
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {hotspots.map((h) => {
        const lat = Number(h.latitude);
        const lng = Number(h.longitude);
        if (isNaN(lat) || isNaN(lng)) return null;

        return (
          <CircleMarker
            key={h.id}
            center={[lat, lng]}
            radius={h.masked ? 14 : 10}
            pathOptions={{
              color: h.masked ? "#c9872f" : "#3da066",
              fillColor: h.masked ? "#c9872f" : "#3da066",
              fillOpacity: 0.75,
              weight: h.masked ? 3 : 2,
              dashArray: h.masked ? "5, 5" : undefined,
            }}
          >
            <Popup>
              <div style={{ fontFamily: "Inter, sans-serif", minWidth: 150 }}>
                <strong style={{ fontSize: 15, color: "#f0f5f2" }}>
                  {h.species}
                </strong>
                <div
                  style={{
                    fontSize: 12,
                    color: "#9ab5a3",
                    marginTop: 4,
                    marginBottom: 6,
                  }}
                >
                  Observed{" "}
                  {new Date(h.recorded_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
                {h.masked ? (
                  <div>
                    <span
                      style={{
                        background: "rgba(224,168,64,0.2)",
                        color: "#f0bc60",
                        border: "1px solid rgba(224,168,64,0.3)",
                        borderRadius: 999,
                        padding: "2px 8px",
                        fontSize: 11,
                        fontWeight: 600,
                        display: "inline-block",
                        marginBottom: 4,
                      }}
                    >
                      ⚠ Geomasked
                    </span>
                    <p style={{ color: "#c9872f", fontSize: 11, margin: 0 }}>
                      Location offset for species safety
                    </p>
                  </div>
                ) : (
                  <span
                    style={{
                      color: "#3da066",
                      fontSize: 12,
                      fontFamily: "monospace",
                    }}
                  >
                    {lat.toFixed(4)}, {lng.toFixed(4)}
                  </span>
                )}
                {h.notes && (
                  <p
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      color: "#9ab5a3",
                      borderTop: "1px solid rgba(61,160,102,0.2)",
                      paddingTop: 6,
                      marginBottom: 0,
                    }}
                  >
                    {h.notes}
                  </p>
                )}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
