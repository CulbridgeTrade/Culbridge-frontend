export interface ShipmentData {
  exporterId?: string;
  commodity: string;
  destination: string;
  weight: number;
}

export async function createShipment(data: ShipmentData): Promise<void> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('culbridge_access_token') : null;
  
const res = await fetch(`/api/shipments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || 'Failed to create shipment');
  }
}

export async function createCSF(data: Omit<ShipmentData, 'exporterId'>): Promise<void> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('culbridge_access_token') : null;
  
const res = await fetch(`/api/csf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || 'Failed to create CSF');
  }
}

