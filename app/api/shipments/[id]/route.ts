import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function getToken(req: NextRequest) {
  return req.cookies.get('auth-token')?.value || req.headers.get('authorization')?.replace('Bearer ', '');
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await getToken(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;

    // Try to fetch from backend first
    try {
      const response = await fetch(`${API_BASE}/api/v1/shipments/${id}`, {
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
    const mockShipment = generateMockShipment(id);
    return NextResponse.json(mockShipment, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch shipment' }, { status: 500 });
  }
}

function generateMockShipment(id: string) {
  const statuses = ['PASS', 'WARNING', 'BLOCK'] as const;
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const score = status === 'PASS' ? 92 : status === 'WARNING' ? 72 : 45;
  const confidence = 0.89;

  const commodities = ['Cocoa Beans', 'Sesame Seeds', 'Ginger', 'Cashew Nuts', 'Soybeans'];
  const destinations = ['Netherlands', 'Germany', 'UK', 'France', 'Belgium'];
  const commodity = commodities[Math.floor(Math.random() * commodities.length)];
  const destination = destinations[Math.floor(Math.random() * destinations.length)];

  const rulesTriggered = [
    {
      ruleId: 'EUDR-001',
      category: 'Deforestation',
      status: status === 'BLOCK' ? 'BLOCK' : 'PASS' as 'PASS' | 'WARNING' | 'BLOCK',
      reason: status === 'BLOCK'
        ? 'GPS coordinates indicate plot partially overlaps with 2023 deforestation alert polygon.'
        : 'All plots verified as deforestation-free per satellite imagery.',
      inputsUsed: ['geojson', 'satellite_date'],
    },
    {
      ruleId: 'EUDR-002',
      category: 'Legality',
      status: 'PASS' as const,
      reason: 'Land title documentation verified against national registry.',
      inputsUsed: ['land_title', 'registry_check'],
    },
    {
      ruleId: 'MRL-001',
      category: 'Pesticide Residue',
      status: status === 'WARNING' ? 'WARNING' : 'PASS' as 'PASS' | 'WARNING' | 'BLOCK',
      reason: status === 'WARNING'
        ? 'Chlorpyrifos detected at 0.08 mg/kg — exceeds EU MRL of 0.05 mg/kg.'
        : 'All pesticide residues below EU MRL thresholds.',
      inputsUsed: ['lab_report', 'mrl_threshold'],
    },
    {
      ruleId: 'TRACE-001',
      category: 'Traceability',
      status: 'PASS' as const,
      reason: 'Full chain of custody documented from farm to export point.',
      inputsUsed: ['farm_id', 'processing_id', 'export_id'],
    },
    {
      ruleId: 'DOC-001',
      category: 'Documentation',
      status: status === 'BLOCK' ? 'BLOCK' : 'PASS' as 'PASS' | 'WARNING' | 'BLOCK',
      reason: status === 'BLOCK'
        ? 'Phytosanitary certificate missing required EU import declaration.'
        : 'All required export documentation complete and valid.',
      inputsUsed: ['phytosanitary_cert', 'coa', 'invoice'],
    },
  ];

  const humanSummary = {
    blocking: status === 'BLOCK'
      ? [
          'Shipment blocked due to deforestation risk — GPS coordinates overlap with 2023 alert.',
          'Phytosanitary certificate incomplete — missing EU import declaration.',
        ]
      : [],
    warnings: status === 'WARNING'
      ? [
          'Chlorpyrifos residue exceeds EU MRL by 60% — requires remediation or alternative market.',
        ]
      : [],
    passed: [
      'Land title documentation verified against national registry.',
      'Full chain of custody documented from farm to export point.',
      'All required export documentation complete and valid.',
    ],
  };

  const nextActions = status === 'BLOCK'
    ? [
        'Submit revised GPS plot data excluding deforested area for re-evaluation.',
        'Obtain updated phytosanitary certificate with EU import declaration from NPPO.',
        'Request satellite imagery review from third-party verifier.',
      ]
    : status === 'WARNING'
      ? [
          'Source replacement batch with compliant pesticide residue levels.',
          'Submit alternative lab report showing remediation within 14 days.',
        ]
      : [
          'No actions required — shipment cleared for export.',
        ];

  return {
    id,
    product: commodity,
    destination,
    status,
    score,
    confidence,
    evaluatedAt: new Date().toISOString(),
    rulesTriggered,
    humanSummary,
    nextActions,
  };
}

