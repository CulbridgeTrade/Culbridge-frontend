import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function getToken(req: NextRequest) {
  return req.cookies.get('auth-token')?.value || req.headers.get('authorization')?.replace('Bearer ', '');
}

function generateMockShipments(count: number = 12) {
  const commodities = ['Cocoa Beans', 'Sesame Seeds', 'Ginger', 'Cashew Nuts', 'Soybeans', 'Groundnuts'];
  const destinations = ['Netherlands', 'Germany', 'UK', 'France', 'Belgium', 'Spain'];
  const statuses = ['OK', 'WARNING', 'BLOCKED', 'PENDING'] as const;
  const exporters = ['GreenField Exports Ltd', 'AgroTrade NG', 'West African Commodities', 'Nigerian Export Co', 'FarmGate Logistics'];

  return Array.from({ length: count }, (_, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const confidenceScore = status === 'OK' ? 0.92 : status === 'WARNING' ? 0.72 : status === 'BLOCKED' ? 0.45 : 0.0;
    return {
      shipmentId: `SHP-${2024001 + i}`,
      commodity: commodities[Math.floor(Math.random() * commodities.length)],
      destination: destinations[Math.floor(Math.random() * destinations.length)],
      complianceStatus: status,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      confidenceScore,
      weight: Math.floor(Math.random() * 20000) + 5000,
      exporter_name: exporters[Math.floor(Math.random() * exporters.length)],
    };
  });
}

export async function GET(req: NextRequest) {
  try {
    const token = await getToken(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const query = searchParams.toString();

    // Try to fetch from backend first
    try {
      const response = await fetch(`${API_BASE}/api/v1/shipments?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
      }
    } catch {
      // Backend not available, fall through to mock
    }

    // Mock data for demo purposes
    const mockShipments = generateMockShipments();
    const statusFilter = searchParams.get('status');
    const filtered = statusFilter
      ? mockShipments.filter((s) => s.complianceStatus === statusFilter)
      : mockShipments;

    return NextResponse.json({ shipments: filtered }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch shipments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    const response = await fetch(`${API_BASE}/shipments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create shipment' }, { status: 500 });
  }
}
