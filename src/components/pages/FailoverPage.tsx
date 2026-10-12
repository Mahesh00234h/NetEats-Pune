// src/components/pages/FailoverPage.tsx
import React, { useState } from 'react';
import {
  ServerCrash,
  Server,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Zap,
  CheckCircle2,
  Activity,
  Layers,
  Database,
  Info,
} from 'lucide-react';
import { useSimulation } from '../../simulation/simulationContext';

export const FailoverPage: React.FC = () => {
  const {
    servers,
    toggleServerHealth,
    faultConfig,
    setFaultConfig,
    runLoadBalancerBatch,
    addEvent,
  } = useSimulation();

  const [testLog, setTestLog] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const isServer1Offline = faultConfig.offlineServers.includes('node-server-1');
  const isServer2Offline = faultConfig.offlineServers.includes('node-server-2');
  const isServer3Offline = faultConfig.offlineServers.includes('node-server-3');
  const allOffline = isServer1Offline && isServer2Offline && isServer3Offline;

  const handleFailoverTest = async () => {
    setIsTesting(true);
    setTestLog([]);
    const logs: string[] = [];

    logs.push(`[${new Date().toLocaleTimeString()}] Health Check Probe: Pinging Server 1 (10.0.4.11)...`);
    setTestLog([...logs]);

    if (!isServer1Offline) {
      logs.push(`[${new Date().toLocaleTimeString()}] Injecting unplanned fault: Terminating Server 1 container process.`);
      toggleServerHealth('node-server-1');
      setTestLog([...logs]);
    }

    logs.push(`[${new Date().toLocaleTimeString()}] NGINX Health Monitor detected HTTP 502 / Connection Refused on Server 1.`);
    logs.push(`[${new Date().toLocaleTimeString()}] TRIGGERING AUTOMATIC FAILOVER: Server 1 marked OUT OF ROTATION.`);
    logs.push(`[${new Date().toLocaleTimeString()}] Upstream traffic seamlessly redirected to Server 2 (10.0.4.12) & Server 3 (10.0.4.13).`);
    setTestLog([...logs]);

    // Dispatch batch through load balancer to prove healthy servers take traffic
    const decisions = await runLoadBalancerBatch(6);
    decisions.forEach((d) => {
      logs.push(`[${new Date().toLocaleTimeString()}] New incoming client request routed: ${d.serverName} (${d.reason}).`);
    });
    logs.push(`[${new Date().toLocaleTimeString()}] Failover Test Complete: 100% Zero-Downtime Service Continuity Achieved.`);
    setTestLog([...logs]);
    setIsTesting(false);
  };

  const restoreAll = () => {
    setFaultConfig((prev) => ({ ...prev, offlineServers: [] }));
    setTestLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] All application servers restored to HEALTHY state.`]);
    addEvent('Server', 'success', 'Failover Manager', 'All cluster server nodes restored and returned to active upstream pool.');
  };

  const simulateTotalOutage = () => {
    setFaultConfig((prev) => ({
      ...prev,
      offlineServers: ['node-server-1', 'node-server-2', 'node-server-3'],
    }));
    setTestLog((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] CRITICAL OUTAGE: All 3 application servers disabled. 503 Service Unavailable returned.`,
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-100 sm:text-2xl">
              Server Redundancy & Automatic Failover Lab
            </h1>
            <span className="rounded-md border border-cyan-500/30 bg-cyan-950/40 px-2 py-0.5 text-xs font-semibold text-cyan-300">
              Section 12 • High Availability Cluster
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate unplanned server crashes and observe instantaneous health-probe failover without dropping customer orders.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleFailoverTest}
            disabled={isTesting}
            className="flex items-center gap-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-3.5 py-2 text-xs font-bold text-slate-950 transition shadow-md shadow-cyan-500/20"
          >
            <Zap className="h-4 w-4" />
            <span>Run Failover Test</span>
          </button>
          <button
            onClick={restoreAll}
            className="rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-emerald-500 transition"
          >
            Restore All Servers
          </button>
          <button
            onClick={simulateTotalOutage}
            className="rounded-xl border border-rose-500/40 bg-rose-950/30 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-900/40 transition"
          >
            Simulate 100% Outage
          </button>
        </div>
      </div>

      {/* Cluster Health Banner */}
      <div
        className={`rounded-2xl border p-4 backdrop-blur-md flex items-center justify-between gap-4 ${
          allOffline
            ? 'border-rose-500 bg-rose-950/40 text-rose-200'
            : isServer1Offline || isServer2Offline || isServer3Offline
            ? 'border-amber-500 bg-amber-950/30 text-amber-200'
            : 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl ${
              allOffline ? 'bg-rose-500 text-slate-950' : 'bg-slate-900 text-slate-100 border border-slate-800'
            }`}
          >
            <ServerCrash className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold">
              {allOffline
                ? 'CRITICAL: 503 SERVICE UNAVAILABLE (All Cluster Replicas Down)'
                : isServer1Offline || isServer2Offline || isServer3Offline
                ? 'DEGRADED: Cluster Failover Active (Healthy Replicas Handling Traffic)'
                : 'HEALTHY: All 3 Application Cluster Replicas Fully Operational'}
            </h3>
            <p className="text-xs opacity-80 mt-0.5">
              Health check intervals: 1000ms • Failure threshold: 2 consecutive missed SYN-ACKs • Recovery: Automatic
            </p>
          </div>
        </div>

        <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800">
          Uptime: {allOffline ? '0%' : isServer1Offline ? '99.9%' : '99.99%'}
        </span>
      </div>

      {/* Primary vs Secondary vs Burst Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Server 1 */}
        <div
          className={`rounded-xl border p-5 space-y-4 ${
            isServer1Offline
              ? 'border-rose-500/80 bg-rose-950/30 text-rose-200'
              : 'border-slate-800 bg-slate-900/60 text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Primary Node</span>
              <h4 className="text-sm font-bold text-slate-100">Server 1 (Primary)</h4>
              <span className="font-mono text-xs text-slate-400">10.0.4.11</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isServer1Offline
                  ? 'bg-rose-500 text-slate-950'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {isServer1Offline ? 'CRASHED' : 'ACTIVE'}
            </span>
          </div>

          <div className="text-xs space-y-1.5 text-slate-400">
            <div className="flex justify-between">
              <span>Health Ping:</span>
              <span className="font-mono text-slate-200">{isServer1Offline ? 'UNREACHABLE' : '200 OK (2ms)'}</span>
            </div>
            <div className="flex justify-between">
              <span>Traffic Pool:</span>
              <span className="font-semibold text-slate-200">{isServer1Offline ? 'Drained' : 'Receiving Traffic'}</span>
            </div>
          </div>

          <button
            onClick={() => toggleServerHealth('node-server-1')}
            className={`w-full rounded-lg py-2 text-xs font-semibold border transition ${
              isServer1Offline
                ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                : 'border-rose-500 bg-rose-950/40 text-rose-300'
            }`}
          >
            {isServer1Offline ? 'Restore Server 1' : 'Simulate Server 1 Failure'}
          </button>
        </div>

        {/* Server 2 */}
        <div
          className={`rounded-xl border p-5 space-y-4 ${
            isServer2Offline
              ? 'border-rose-500/80 bg-rose-950/30 text-rose-200'
              : 'border-slate-800 bg-slate-900/60 text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Hot Standby</span>
              <h4 className="text-sm font-bold text-slate-100">Server 2 (Secondary)</h4>
              <span className="font-mono text-xs text-slate-400">10.0.4.12</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isServer2Offline
                  ? 'bg-rose-500 text-slate-950'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {isServer2Offline ? 'CRASHED' : 'ACTIVE'}
            </span>
          </div>

          <div className="text-xs space-y-1.5 text-slate-400">
            <div className="flex justify-between">
              <span>Health Ping:</span>
              <span className="font-mono text-slate-200">{isServer2Offline ? 'UNREACHABLE' : '200 OK (3ms)'}</span>
            </div>
            <div className="flex justify-between">
              <span>Traffic Pool:</span>
              <span className="font-semibold text-slate-200">{isServer2Offline ? 'Drained' : 'Ready / Serving'}</span>
            </div>
          </div>

          <button
            onClick={() => toggleServerHealth('node-server-2')}
            className={`w-full rounded-lg py-2 text-xs font-semibold border transition ${
              isServer2Offline
                ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                : 'border-rose-500 bg-rose-950/40 text-rose-300'
            }`}
          >
            {isServer2Offline ? 'Restore Server 2' : 'Simulate Server 2 Failure'}
          </button>
        </div>

        {/* Server 3 */}
        <div
          className={`rounded-xl border p-5 space-y-4 ${
            isServer3Offline
              ? 'border-rose-500/80 bg-rose-950/30 text-rose-200'
              : 'border-slate-800 bg-slate-900/60 text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Burst Replica</span>
              <h4 className="text-sm font-bold text-slate-100">Server 3 (Burst)</h4>
              <span className="font-mono text-xs text-slate-400">10.0.4.13</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isServer3Offline
                  ? 'bg-rose-500 text-slate-950'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {isServer3Offline ? 'CRASHED' : 'ACTIVE'}
            </span>
          </div>

          <div className="text-xs space-y-1.5 text-slate-400">
            <div className="flex justify-between">
              <span>Health Ping:</span>
              <span className="font-mono text-slate-200">{isServer3Offline ? 'UNREACHABLE' : '200 OK (2ms)'}</span>
            </div>
            <div className="flex justify-between">
              <span>Traffic Pool:</span>
              <span className="font-semibold text-slate-200">{isServer3Offline ? 'Drained' : 'Ready / Serving'}</span>
            </div>
          </div>

          <button
            onClick={() => toggleServerHealth('node-server-3')}
            className={`w-full rounded-lg py-2 text-xs font-semibold border transition ${
              isServer3Offline
                ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                : 'border-rose-500 bg-rose-950/40 text-rose-300'
            }`}
          >
            {isServer3Offline ? 'Restore Server 3' : 'Simulate Server 3 Failure'}
          </button>
        </div>
      </div>

      {/* Failover Test Execution Console */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2 mb-3">
          <Activity className="h-4 w-4" />
          Failover Engine Event Execution Log
        </h3>
        <div className="space-y-1.5 font-mono text-xs max-h-52 overflow-y-auto pr-1">
          {testLog.length === 0 ? (
            <div className="text-slate-600 text-[11px] py-4">
              Click "Run Failover Test" to trigger an automated health probe failure and real-time load redistribution sequence.
            </div>
          ) : (
            testLog.map((line, idx) => (
              <div
                key={idx}
                className={
                  line.includes('FAILOVER') || line.includes('OUTAGE')
                    ? 'text-amber-400'
                    : line.includes('Complete') || line.includes('restored')
                    ? 'text-emerald-400'
                    : 'text-slate-300'
                }
              >
                {line}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Critical Academic Distinction: App Server vs Database Redundancy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-xs space-y-1.5">
          <div className="font-bold text-slate-200 flex items-center gap-2">
            <Server className="h-4 w-4 text-cyan-400" />
            Stateless Application Server Redundancy
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Application servers are stateless HTTP handlers. If Server 1 dies, any other instance (Server 2 or 3) can
            immediately process the next request because session tokens are JWT-based and state lives in the database.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-xs space-y-1.5">
          <div className="font-bold text-slate-200 flex items-center gap-2">
            <Database className="h-4 w-4 text-purple-400" />
            Stateful Database Redundancy (WAL Replication)
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Crucially, replicating application servers does NOT protect a single database from failure! True high
            availability requires primary-replica database streaming replication and automated Raft/Paxos consensus.
          </p>
        </div>
      </div>
    </div>
  );
};
