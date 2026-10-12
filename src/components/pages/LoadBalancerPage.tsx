// src/components/pages/LoadBalancerPage.tsx
import React, { useState } from 'react';
import {
  Scale,
  Server,
  Zap,
  Activity,
  Cpu,
  Clock,
  ArrowRight,
  RotateCcw,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useSimulation } from '../../simulation/simulationContext';
import { LOAD_BALANCING_STRATEGIES, RoutingDecision } from '../../simulation/loadBalancer';

export const LoadBalancerPage: React.FC = () => {
  const {
    servers,
    lbStrategy,
    setLbStrategy,
    runLoadBalancerBatch,
    toggleServerHealth,
    faultConfig,
  } = useSimulation();

  const [recentDecisions, setRecentDecisions] = useState<RoutingDecision[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDispatch = async (count: number) => {
    setIsProcessing(true);
    try {
      const decisions = await runLoadBalancerBatch(count);
      setRecentDecisions(decisions.slice(-6));
    } finally {
      setIsProcessing(false);
    }
  };

  const chartData = servers.map((s) => ({
    name: s.name.replace('Application Server', 'Server').replace('(Primary)', '(P)').replace('(Secondary)', '(S)').replace('(Burst Replica)', '(B)'),
    requests: s.totalRequests,
    cpu: s.cpuUtilization,
    latency: s.latencyMs,
  }));

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-100 sm:text-2xl">
              NGINX Layer 7 Load Balancer
            </h1>
            <span className="rounded-md border border-cyan-500/30 bg-cyan-950/40 px-2 py-0.5 text-xs font-semibold text-cyan-300">
              Section 11 • Reverse Proxy & Cluster Traffic Distribution
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            VIP 10.0.3.10 distributing Pune food orders and kitchen telemetry across 3 application servers.
          </p>
        </div>

        {/* Load Generator Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleDispatch(1)}
            disabled={isProcessing}
            className="rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-cyan-500 transition"
          >
            Send 1 Request
          </button>
          <button
            onClick={() => handleDispatch(10)}
            disabled={isProcessing}
            className="rounded-xl bg-cyan-500 hover:bg-cyan-400 px-3.5 py-2 text-xs font-bold text-slate-950 transition shadow-md shadow-cyan-500/20"
          >
            Send Batch (10 Requests)
          </button>
          <button
            onClick={() => handleDispatch(25)}
            disabled={isProcessing}
            className="rounded-xl border border-amber-500/50 bg-amber-950/30 px-3.5 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-900/40 transition"
          >
            Peak-Hour Spike (25 Requests)
          </button>
        </div>
      </div>

      {/* Strategy Selection Cards */}
      <div>
        <span className="text-xs font-semibold text-slate-400 block mb-2">
          Select Active Load Balancing Algorithm:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {LOAD_BALANCING_STRATEGIES.map((strat) => (
            <div
              key={strat.type}
              onClick={() => setLbStrategy(strat.type as any)}
              className={`cursor-pointer rounded-xl border p-4 transition-all ${
                lbStrategy === strat.type
                  ? 'border-cyan-500 bg-cyan-950/40 shadow-lg shadow-cyan-950/30'
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-100">{strat.label}</h3>
                {lbStrategy === strat.type && (
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                )}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{strat.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3 Application Server Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {servers.map((server, idx) => {
          const isOffline = faultConfig.offlineServers.includes(server.id);
          return (
            <div
              key={server.id}
              className={`rounded-xl border p-5 transition-all ${
                isOffline
                  ? 'border-rose-500/60 bg-rose-950/20 text-rose-300'
                  : 'border-slate-800 bg-slate-900/60 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2 rounded-lg ${
                      isOffline
                        ? 'bg-rose-950 text-rose-400 border border-rose-500/40'
                        : 'bg-cyan-950 text-cyan-400 border border-cyan-500/30'
                    }`}
                  >
                    <Server className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">Server {idx + 1}</h4>
                    <span className="font-mono text-[11px] text-cyan-400">{server.ip}</span>
                  </div>
                </div>

                <button
                  onClick={() => toggleServerHealth(server.id)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition ${
                    isOffline
                      ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                      : 'border-rose-500 bg-rose-950/40 text-rose-300'
                  }`}
                >
                  {isOffline ? 'Restore' : 'Simulate Crash'}
                </button>
              </div>

              {/* Server Metrics */}
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>CPU Utilization:</span>
                    <span className="font-mono text-slate-200">{isOffline ? '0%' : `${server.cpuUtilization}%`}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isOffline
                          ? 'w-0'
                          : server.cpuUtilization > 75
                          ? 'bg-rose-500'
                          : server.cpuUtilization > 50
                          ? 'bg-amber-400'
                          : 'bg-cyan-400'
                      }`}
                      style={{ width: isOffline ? '0%' : `${server.cpuUtilization}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Active Connections:</span>
                  <span className="font-mono font-bold text-slate-200">
                    {isOffline ? '0 (Draining)' : server.activeRequests}
                  </span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Total Serviced Requests:</span>
                  <span className="font-mono font-bold text-cyan-400">{server.totalRequests}</span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Measured Response Latency:</span>
                  <span className="font-mono text-slate-200">{isOffline ? 'N/A' : `${server.latencyMs} ms`}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Chart & Routing Decision Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Distribution Chart */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-cyan-400" />
            Cluster Request Distribution
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="requests" fill="#38bdf8" name="Total Requests" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Real-Time Routing Decision Log */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-4">
            <Scale className="h-4 w-4 text-emerald-400" />
            Reverse Proxy Decision Feed
          </h3>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 text-xs">
            {recentDecisions.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                Click "Send 1 Request" or "Send Batch" to observe load balancer decisions in real time.
              </div>
            ) : (
              recentDecisions.map((dec, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg border p-2.5 ${
                    dec.success
                      ? 'border-slate-800 bg-slate-950/60 text-slate-300'
                      : 'border-rose-500/60 bg-rose-950/30 text-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-cyan-300">{dec.serverName}</span>
                    <span className="font-mono text-[10px] text-slate-500">Strategy: {dec.strategy}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{dec.reason}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Academic Explanation Box (Section 11) */}
      <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 text-xs text-slate-300 space-y-1">
        <div className="font-bold text-cyan-400 flex items-center gap-1.5">
          <Info className="h-4 w-4" />
          Academic Networks Insight: Load Balancing vs High Availability
        </div>
        <p className="text-slate-400 text-[11px] leading-relaxed">
          A load balancer prevents single-server bottlenecks by spreading traffic across multiple instances. However,
          adding servers does not automatically guarantee fault tolerance if upstream components (e.g. database,
          firewall, edge router) are single points of failure.
        </p>
      </div>
    </div>
  );
};
