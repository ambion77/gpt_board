import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";

const mapApiKey = import.meta.env.VITE_MAP_API_KEY;

const RecenterMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(position, 16, { animate: true });
  }, [position, map]);
  return null;
};

const MapComponent = () => {
  const [position, setPosition] = useState([37.5665, 126.9780]); // 기본값: 서울
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          setLoaded(true);
        },
        (error) => {
          console.error("위치 정보를 가져올 수 없습니다:", error);
          setLoaded(true);
        }
      );
    } else {
      console.log("이 브라우저에서는 Geolocation을 지원하지 않습니다.");
      setLoaded(true);
    }
  }, []);

  return (
    <MapContainer center={position} zoom={14} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        url={`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${mapApiKey}`}
        attribution='&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>'
      />
      {loaded && (
        <>
          <Marker position={position}>
            <Popup>현재 위치</Popup>
          </Marker>
          <RecenterMap position={position} />
        </>
      )}
    </MapContainer>
  );
};

export default MapComponent;
