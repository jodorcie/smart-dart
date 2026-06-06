/**
 * useGeolocation
 * Continuously watches the browser's GPS position.
 * Returns { location, error, loading, supported }
 * location = { lat, lng, accuracy, heading, speed }
 */
import { useState, useEffect } from 'react';

export default function useGeolocation() {
  const supported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  const [location, setLocation] = useState(null);  // { lat, lng, accuracy, heading, speed }
  const [error,    setError]    = useState(null);
  const [loading,  setLoading]  = useState(supported);

  useEffect(() => {
    if (!supported) {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation({
          lat:      pos.coords.latitude,
          lng:      pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          heading:  pos.coords.heading  ?? null,
          speed:    pos.coords.speed    ?? null,
        });
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, maximumAge: 4000, timeout: 12000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [supported]);

  return { location, error, loading, supported };
}
