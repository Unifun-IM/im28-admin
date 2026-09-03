import FingerprintJS from '@fingerprintjs/fingerprintjs';

export const DEVICE_ID_STORAGE_KEY = 'device_id';

let pendingDeviceId: Promise<string> | null = null;

function createFallbackDeviceId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `web-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function resolveDeviceId() {
  try {
    const agent = await FingerprintJS.load({ monitoring: false });
    const result = await agent.get();
    if (result.visitorId) {
      return result.visitorId;
    }
  } catch {
    // A local stable ID keeps API requests usable when fingerprinting is unavailable.
  }

  return createFallbackDeviceId();
}

/** Returns one stable ID for the current browser installation. */
export async function getDeviceId() {
  const storedDeviceId = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
  if (storedDeviceId) {
    return storedDeviceId;
  }

  if (!pendingDeviceId) {
    pendingDeviceId = resolveDeviceId()
      .then((deviceId) => {
        localStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId);
        return deviceId;
      })
      .finally(() => {
        pendingDeviceId = null;
      });
  }

  return pendingDeviceId;
}
