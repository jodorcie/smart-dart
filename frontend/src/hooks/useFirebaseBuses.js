import { useEffect, useRef } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../services/firebase';
import useDartStore from '../store/dartStore';

const STALE_MS = 3 * 60 * 1000; // 3 minutes — same as backend

// Listens to Firebase Realtime DB at dart-buses/
// Activates buses when data arrives and marks them offline when stale.
// If Firebase is not configured this hook is a no-op.
export default function useFirebaseBuses() {
  const applyFirebaseOverlay = useDartStore(s => s.applyFirebaseOverlay);
  const updateBuses          = useDartStore(s => s.updateBuses);
  const storeRef             = useRef(null);

  // Keep a stable ref to the store getter so the interval below doesn't
  // capture a stale closure
  storeRef.current = { applyFirebaseOverlay, updateBuses };

  useEffect(() => {
    if (!database) return;

    const busesRef = ref(database, 'dart-buses');

    // Subscribe to live changes
    const unsubscribe = onValue(busesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        storeRef.current.applyFirebaseOverlay(data);
      }
      // If data is null (all nodes removed) buses will stay at their last
      // state; the stale interval below will clean them up after 3 minutes.
    });

    // Stale check — every 60 s mark buses offline if Firebase timestamp is old
    const staleInterval = setInterval(() => {
      const { buses } = useDartStore.getState();
      const now       = Date.now();
      let changed     = false;

      const updated = buses.map(bus => {
        if (bus.gpsSource === 'firebase' && bus.lastUpdate) {
          const age = now - new Date(bus.lastUpdate).getTime();
          if (age > STALE_MS) {
            changed = true;
            return {
              ...bus,
              status:    'offline',
              lat:       null,
              lng:       null,
              speed:     0,
              gpsSource: null,
              outOfArea: false,
            };
          }
        }
        return bus;
      });

      if (changed) storeRef.current.updateBuses(updated);
    }, 60_000);

    return () => {
      unsubscribe();
      clearInterval(staleInterval);
    };
  }, []); // runs once on mount
}
