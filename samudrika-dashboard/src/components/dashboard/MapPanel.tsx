import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import { CardFrame } from '../common/CardFrame'
import { useTheme } from '../../hooks/useTheme'

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

export const MapPanel = () => {
  const { theme } = useTheme()
  const tile =
    theme === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

  return (
    <CardFrame className="h-full">
      <h3 className="mb-2 text-lg">OPERATIONAL ZONE - INDIAN OCEAN REGION</h3>
      <div className="relative h-56 overflow-hidden rounded">
        <MapContainer center={[17.6868, 83.2185]} zoom={4} className="h-full w-full">
          <TileLayer url={tile} />
          <Marker position={[17.6868, 83.2185]} icon={markerIcon}>
            <Popup>Visakhapatnam Naval Base</Popup>
          </Marker>
        </MapContainer>
        <div className="absolute right-2 top-2 rounded bg-black/50 px-2 py-1 text-[10px] ui-label">
          LIVE FEED INTEGRATION PENDING
        </div>
      </div>
    </CardFrame>
  )
}
