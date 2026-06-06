import { useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../services/firebase';
import useDartStore from '../store/dartStore';

// Listens to Firebase Realtime DB at dart-buses/{busId}
// and overlays real GPS coordinates on top of the simulation.
// If Firebase is not configured, this hook is a no-op.
export default function useFirebaseBuses() {
  const applyFirebaseOverlay = useDartStore(s => s.applyFirebaseOverlay);

  useEffect(() => {
    if (!database) return;

    const busesRef = ref(database, 'dart-buses');
    const unsubscribe = onValue(busesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) applyFirebaseOverlay(data);
    });

    return () => unsubscribe();
  }, [applyFirebaseOverlay]);
}
