'use client';

import { useState } from 'react';

interface ShipmentFormProps {
  exporterId: string;
  onSuccess: () => void;
}

export function ShipmentForm({ exporterId, onSuccess }: ShipmentFormProps) {
  const [commodity, setCommodity] = useState('cocoa');
  const [destination, setDestination] = useState('NL');
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shipments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('culbridge_access_token')}`,
        },
        body: JSON.stringify({ exporterId, commodity, destination, weight: Number(weight) }),
      });
      if (res.ok) onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Commodity</label>
        <select value={commodity} onChange={(e) => setCommodity(e.target.value)} className="w-full border rounded px-3 py-2">
          <option value="cocoa">Cocoa</option>
          <option value="sesame">Sesame</option>
          <option value="ginger">Ginger</option>
          <option value="cashew">Cashew</option>
          <option value="beans">Beans</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Destination</label>
        <select value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full border rounded px-3 py-2">
          <option value="NL">Netherlands</option>
          <option value="DE">Germany</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Weight (kg)</label>
        <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full border rounded px-3 py-2" required />
      </div>
      <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50">
        {loading ? 'Submitting...' : 'Create Shipment'}
      </button>
    </form>
  );
}

interface CSFShipmentFormProps {
  onSuccess: () => void;
  isOpen?: boolean;
  onClose: () => void;
}

export function CSFShipmentForm({ onSuccess, isOpen, onClose }: CSFShipmentFormProps) {
  const [commodity, setCommodity] = useState('cocoa');
  const [destination, setDestination] = useState('NL');
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shipments/csf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('culbridge_access_token')}`,
        },
        body: JSON.stringify({ commodity, destination, weight: Number(weight) }),
      });
      if (res.ok) onSuccess();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Commodity</label>
        <select value={commodity} onChange={(e) => setCommodity(e.target.value)} className="w-full border rounded px-3 py-2">
          <option value="cocoa">Cocoa</option>
          <option value="sesame">Sesame</option>
          <option value="ginger">Ginger</option>
          <option value="cashew">Cashew</option>
          <option value="beans">Beans</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Destination</label>
        <select value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full border rounded px-3 py-2">
          <option value="NL">Netherlands</option>
          <option value="DE">Germany</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Weight (kg)</label>
        <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full border rounded px-3 py-2" required />
      </div>
      <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50">
        {loading ? 'Submitting...' : 'Submit CSF'}
      </button>
      <button type="button" onClick={onClose} className="w-full mt-2 border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50">
        Cancel
      </button>
    </form>
  );
}