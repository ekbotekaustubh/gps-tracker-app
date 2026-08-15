import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Vite doesn't resolve Leaflet's default marker image URLs correctly out of the
// box - point the default icon at the bundled assets explicitly.
const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const sosIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'hue-rotate-[130deg] saturate-200', // tints the default blue marker red-ish for SOS
});

const PUNE_CENTER = [18.5204, 73.8567];

/** Keeps the map viewport fitted to whatever markers are currently visible. */
const FitBounds = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;

    if (points.length === 1) {
      map.setView(points[0], 15);
      return;
    }

    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
  }, [points, map]);

  return null;
};

/**
 * Renders a live map of employee locations.
 * @param {Object} props
 * @param {Array} props.locations - Rows from GET /locations/live (member_id, member_name, lat, lng, ...)
 * @param {number|string|null} props.selectedMemberId - Highlights/opens this member's popup
 */
const LiveLocationMap = ({ locations = [], selectedMemberId }) => {
  const withFix = useMemo(() => locations.filter((loc) => loc.has_fix), [locations]);
  const points = useMemo(() => withFix.map((loc) => [loc.lat, loc.lng]), [withFix]);

  return (
    <MapContainer
      center={points[0] || PUNE_CENTER}
      zoom={13}
      scrollWheelZoom
      className="h-full w-full rounded-xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds points={points} />
      {withFix.map((loc) => (
        <Marker
          key={loc.member_id}
          position={[loc.lat, loc.lng]}
          icon={loc.sos_button_pressed ? sosIcon : defaultIcon}
          ref={(marker) => {
            if (marker && loc.member_id === selectedMemberId) marker.openPopup();
          }}
        >
          <Popup>
            <div className="text-sm space-y-1">
              <p className="font-semibold text-slate-800">{loc.member_name}</p>
              {loc.sos_button_pressed ? (
                <p className="text-red-600 font-semibold">SOS ALERT</p>
              ) : null}
              <p className="text-slate-500">{loc.branch_name}</p>
              <p>Speed: {loc.speed ?? 0} km/h</p>
              <p>Battery: {loc.battery ?? '—'}%</p>
              <p className="text-slate-400 text-xs">
                {loc.is_stale ? 'Stale — ' : ''}
                {loc.timestamp ? new Date(loc.timestamp).toLocaleTimeString() : 'No fix yet'}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default LiveLocationMap;
