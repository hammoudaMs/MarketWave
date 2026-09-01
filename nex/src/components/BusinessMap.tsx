"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Business } from "@/lib/types";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapCenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 15);
  }, [lat, lng, map]);
  return null;
}

type Props = {
  center: { lat: number; lng: number };
  businesses: Business[];
  selectedId?: string;
  onSelect: (business: Business) => void;
};

export default function BusinessMap({ center, businesses, selectedId, onSelect }: Props) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={15}
      className="h-full w-full rounded-xl"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapCenter lat={center.lat} lng={center.lng} />
      <Marker position={[center.lat, center.lng]} icon={markerIcon}>
        <Popup>You are here</Popup>
      </Marker>
      {businesses.map((biz) => (
        <Marker
          key={biz.id}
          position={[biz.lat, biz.lng]}
          icon={markerIcon}
          eventHandlers={{ click: () => onSelect(biz) }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{biz.name}</p>
              <p className="text-gray-600">{biz.category}</p>
              {biz.rating && <p>★ {biz.rating.toFixed(1)}</p>}
              <button
                type="button"
                onClick={() => onSelect(biz)}
                className="mt-1 text-indigo-600 underline"
              >
                Select
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
