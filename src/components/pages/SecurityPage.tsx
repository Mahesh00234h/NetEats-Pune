// src/components/pages/SecurityPage.tsx
import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Key,
  FileKey,
  CheckCircle2,
  AlertOctagon,
  Play,
  ArrowRight,
  Info,
  Server,
  Code,
} from 'lucide-react';
import { useSimulation } from '../../simulation/simulationContext';
import { SecurityScenario } from '../../types/events';

export const SecurityPage: React.FC = () => {
  const { addEvent } = useSimulation();

  const securityScenarios: SecurityScenario[] = [
    {
      id: 'sec-1',
      title: 'Unauthorized Role Access Attempt (RBAC Test)',
      threatType: 'Unauthorized Role',
      sourceIp: '192.168.1.45 (Customer Device)',
      targetEndpoint: 'GET /api/v1/restaurant/baner/pos-orders',
      description: 'Customer JWT tries accessing restaurant kitchen terminal management API.',
      expectedOutcome: 'Blocked',
      securityLayer: 'RBAC Authorization',
      reason: 'HTTP 403 Forbidden: Caller has role: "customer". Endpoint requires role: "restaurant_manager". Request terminated at Gateway.',
    },
    {
      id: 'sec-2',
      title: 'Unauthenticated API Resource Access',
      threatType: 'Unauthenticated Request',
      sourceIp: '192.168.1.99 (Unknown Host)',
      targetEndpoint: 'POST /api/v1/admin/cluster/reboot',
      description: 'HTTP request arrives without Authorization: Bearer <token> header.',
      expectedOutcome: 'Blocked',
      securityLayer: 'JWT Authentication',
      reason: 'HTTP 401 Unauthorized: Missing or malformed JSON Web Token. Signature verification failed.',
    },
    {
      id: 'sec-3',
      title: 'Firewall Port Scan / SYN Flood Probe',
      threatType: 'Firewall Blocked Port Scan',
      sourceIp: '203.0.113.88 (External WAN)',
      targetEndpoint: 'TCP SYN on Port 22 (SSH) & Port 3389 (RDP)',
      description: 'Port sweep probe targeting infrastructure management ports.',
      expectedOutcome: 'Blocked',
      securityLayer: 'Stateful Firewall (SPI)',
      reason: 'SPI Firewall Drop: ACL rule permits incoming traffic exclusively on Port 443 (HTTPS) and Port 80 (HTTP 301 Redirect). All other ports silently dropped.',
    },
    {
      id: 'sec-4',
      title: 'Valid Authenticated Customer Order Request',
      threatType: 'Valid Authorized Request',
      sourceIp: '192.168.1.45 (Customer Kothrud)',
      targetEndpoint: 'POST /api/v1/orders/create (TLS 1.3)',
      description: 'Legitimate customer ordering food with valid JWT token over HTTPS.',
      expectedOutcome: 'Allowed',
      securityLayer: 'TLS 1.3 / HTTPS',
      reason: 'HTTP 200 OK: Valid ECDHE-RSA-AES256-GCM cipher session, authenticated customer identity, order schema validated.',
    },
  ];

  const [activeScenario, setActiveScenario] = useState<SecurityScenario>(securityScenarios[0]);
  const [simulationResult, setSimulationResult] = useState<{
    scenario: SecurityScenario;
    timestamp: string;
    allowed: boolean;
  } | null>(null);

  const [isSimulating, setIsSimulating] = useState(false);

  const runSecurityProbe = async (sc: SecurityScenario) => {
    setActiveScenario(sc);
    setIsSimulating(true);
    await new Promise((r) => setTimeout(r, 450));

    const isAllowed = sc.expectedOutcome === 'Allowed';
    setSimulationResult({
      scenario: sc,
      timestamp: new Date().toLocaleTimeString(),
      allowed: isAllowed,
    });

    addEvent(
      'Security',
      isAllowed ? 'success' : 'error',
      sc.securityLayer,
      `Security Evaluation [${sc.threatType}]: ${isAllowed ? 'REQUEST PERMITTED' : 'ACCESS DENIED / BLOCKED'}. ${sc.reason}`
    );

    setIsSimulating(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-100 sm:text-2xl">
              Network Security Center & Threat Evaluation
            </h1>
            <span className="rounded-md border border-cyan-500/30 bg-cyan-950/40 px-2 py-0.5 text-xs font-semibold text-cyan-300">
              Section 16 • TLS 1.3, SPI Firewall & RBAC
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate and verify stateful packet inspection, role-based access control, cryptographic TLS ciphers, and API authorization.
          </p>
        </div>
      </div>

      {/* 4 Core Security Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400">
            <Lock className="h-4 w-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">TLS 1.3 Encryption</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            All customer, restaurant, and rider communications encrypted via AES-256-GCM. Prevents man-in-the-middle sniffing over public Wi-Fi.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
          <div className="flex items-center gap-2 text-purple-400">
            <Key className="h-4 w-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">JWT Authentication</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Stateless JSON Web Tokens signed with HMAC-SHA256. Verified at the NGINX Reverse Proxy before routing to backend microservices.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-400">
            <ShieldAlert className="h-4 w-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Stateful Firewall (SPI)</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Stateful packet inspection gateway (10.0.2.1) enforcing strict access control lists (ACL) blocking ports other than 443/WSS.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <FileKey className="h-4 w-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Idempotency & Tokenization</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Payment transactions require unique UUID idempotency keys. Re-submitting the same payload due to network retries never double charges.
          </p>
        </div>
      </div>

      {/* Security Event Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenarios List (1 Col) */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-100 mb-2">Simulate Threat Scenarios</h3>
          <p className="text-xs text-slate-400 mb-3">
            Click any educational security scenario to fire an illustrative test request against the network defense perimeter:
          </p>

          <div className="space-y-2.5">
            {securityScenarios.map((sc) => (
              <div
                key={sc.id}
                onClick={() => setActiveScenario(sc)}
                className={`cursor-pointer rounded-xl border p-3 transition ${
                  activeScenario.id === sc.id
                    ? 'border-cyan-500 bg-cyan-950/40 shadow-md'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200">{sc.threatType}</h4>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      sc.expectedOutcome === 'Blocked'
                        ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {sc.expectedOutcome}
                  </span>
                </div>
                <div className="mt-1 font-mono text-[10px] text-cyan-400 truncate">{sc.targetEndpoint}</div>
                <p className="mt-1 text-[11px] text-slate-400 line-clamp-2">{sc.description}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => runSecurityProbe(activeScenario)}
            disabled={isSimulating}
            className="w-full mt-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 py-2.5 text-xs font-bold text-slate-950 transition shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>Execute Selected Probe ({activeScenario.threatType})</span>
          </button>
        </div>

        {/* Live Security Inspector & Output (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Probe Inspector Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Code className="h-4 w-4 text-cyan-400" />
                Selected Request Inspector
              </h3>
              <span className="font-mono text-xs text-slate-400">Target Layer: {activeScenario.securityLayer}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Source IP / Client Identity:</span>
                <span className="font-mono text-slate-200 font-semibold">{activeScenario.sourceIp}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Destination Endpoint / Port:</span>
                <span className="font-mono text-cyan-300 font-semibold">{activeScenario.targetEndpoint}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500 block text-[10px]">Simulated Payload Intent:</span>
                <span className="text-slate-300">{activeScenario.description}</span>
              </div>
            </div>

            {/* Execution Result Banner */}
            {simulationResult && (
              <div
                className={`mt-4 rounded-xl border p-4 ${
                  simulationResult.allowed
                    ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-200'
                    : 'border-rose-500/50 bg-rose-950/30 text-rose-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold flex items-center gap-2 text-sm">
                    {simulationResult.allowed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <AlertOctagon className="h-5 w-5 text-rose-400" />
                    )}
                    Outcome: {simulationResult.allowed ? 'REQUEST AUTHORIZED (200 OK)' : 'ACCESS BLOCKED / DROPPED'}
                  </span>
                  <span className="font-mono text-[10px] opacity-75">{simulationResult.timestamp}</span>
                </div>

                <p className="text-xs opacity-90 leading-relaxed font-mono">
                  {simulationResult.scenario.reason}
                </p>
              </div>
            )}
          </div>

          {/* Educational Disclaimer */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-xs text-slate-400 space-y-1">
            <div className="font-bold text-slate-300 flex items-center gap-1.5">
              <Info className="h-4 w-4 text-cyan-400" />
              Academic Disclaimer
            </div>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              This dashboard provides an educational simulation of computer network security concepts (TLS handshakes,
              access control lists, RBAC roles, and token authentication). It demonstrates how application requests
              are evaluated at the perimeter, without creating real raw network vulnerability probes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
