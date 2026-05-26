'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '../lib/service-worker';

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    void registerServiceWorker();
  }, []);

  return null;
}
