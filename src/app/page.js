'use client';
import LatLng from '@/lib/geo/lat_lng';
import Point from '@mapbox/point-geometry';
import GoogleMapReact from 'google-map-react';
import { useRef } from 'react';

function Page() {
  const mapRef = useRef();

  const handleMapChange = ({ center, bounds, size }) => {
    const newB = getBounds(size, center, 2);
    const newBounds = {
      ne: {
        lat: newB[6],
        lng: newB[7],
      },
      nw: {
        lat: newB[0],
        lng: newB[1],
      },
      se: {
        lat: newB[2],
        lng: newB[3],
      },
      sw: {
        lat: newB[4],
        lng: newB[5],
      },
    };
    console.log('Bounds at minZoom:', bounds, newBounds);
  };

  function centerPoint() {
    return new Point(0, 0);
  }

  function lngX(lon, worldSize) {
    return ((180 + lon) * worldSize) / 360;
  }

  // latitude to absolute y coord
  function latY(lat, worldSize) {
    const y =
      (180 / Math.PI) * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
    return ((180 - y) * worldSize) / 360;
  }

  function xLng(x, worldSize) {
    return (x * 360) / (worldSize || 512) - 180;
  }

  function yLat(y, worldSize) {
    const y2 = 180 - (y * 360) / worldSize;
    return (360 / Math.PI) * Math.atan(Math.exp((y2 * Math.PI) / 180)) - 90;
  }

  function x(center, worldSize) {
    return lngX(center.lng, worldSize);
  }

  function y(center, worldSize) {
    return latY(center.lat, worldSize);
  }

  function unproject(point, worldSize) {
    return new LatLng(yLat(point.y, worldSize), xLng(point.x, worldSize));
  }

  function pointLocation(p, center, worldSize) {
    const p2 = centerPoint()._sub(p)._rotate(-0);
    const point = new Point(x(center, worldSize), y(center, worldSize));
    return unproject(point.sub(p2), worldSize);
  }

  function getBounds(size, center, zoom) {
    const zoomV = Math.min(Math.max(zoom, 2), 15);
    const scale = Math.pow(2, zoomV);
    const worldSize = 256 * scale;
    if (size.width > 0 && size.height > 0) {
      const topLeftCorner = pointLocation(
        Point.convert({
          x: -size.width / 2,
          y: -size.height / 2,
        }),
        center,
        worldSize
      );
      const bottomRightCorner = pointLocation(
        Point.convert({
          x: size.width / 2,
          y: size.height / 2,
        }),
        center,
        worldSize
      );

      let res = [
        topLeftCorner.lat,
        topLeftCorner.lng, // NW
        bottomRightCorner.lat,
        bottomRightCorner.lng, // SE
        bottomRightCorner.lat,
        topLeftCorner.lng, // SW
        topLeftCorner.lat,
        bottomRightCorner.lng, // NE
      ];
      return res;
    }

    return [0, 0, 0, 0];
  }

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: '' }}
        defaultCenter={{ lat: 48.8566, lng: 2.3522 }}
        options={{
          minZoom: 2,
          maxZoom: 15,
        }}
        defaultZoom={2}
        yesIWantToUseGoogleMapApiInternals
        onGoogleApiLoaded={({ map }) => {
          mapRef.current = map;
        }}
        onChange={handleMapChange}
      />
    </div>
  );
}

export default Page;
