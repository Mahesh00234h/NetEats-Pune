// src/components/pages/MonitoringPage.tsx
import React, { useState } from 'react';
import {
  BarChart3,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  Server,
  Zap,
  ShieldAlert,
  Info,
  RefreshCw,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useSimulation } from '../../simulation/simulationContext';
import { MetricCard } from '../common/MetricCard';

export const MonitoringPage: React.FC = () => {
  const { metrics, servers, faultConfig, events, orders, addEvent } = useSimulation();

  const [diagnosticReport, setDiagnosticReport] = useState<{
    timestamp: string;
    score: number;
    findings: string[];
    recommendations: string[];
  } | null>(null);

  const [isRunningCheck, setIsRunningCheck] = useState(false);

  // Time-series mock data based on current state
  const timeSeriesData = [
    { time: '12:00', latency: 22, errorRate: 0, requests: 12 },
    { time: '12:05', latency: 24, errorRate: 0, requests: 15 },
    { time: '12:10', latency: 21, errorRate: 0.2, requests: 18 },
    { time: '12:15', latency: 32, errorRate: 0.1, requests: 22 },
    { time: '12:20', latency: metrics.averageLatencyMs, errorRate: faultConfig.packetLoss / 10, requests: 28 },
  ];

  const runHealthCheck = async () => {
    setIsRunningCheck(true);
    await new Promise((r) => setTimeout(r, 600));

    const findings: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    if (faultConfig.packetLoss > 0) {
      score -= faultConfig.packetLoss * 2;
      findings.push(`Elevated packet loss: ${faultConfig.packetLoss}% probabilistic drop detected.`);
      recommendations.push('Enable TCP Selective Acknowledgment (SACK) or investigate bufferbloat on access links.');
    } else {
      findings.push('Packet loss at 0%: Ideal link quality across metro Pune links.');
    }

    if (metrics.averageLatencyMs > 150) {
      score -= 20;
      findings.push(`High Round-Trip Latency: ${metrics.averageLatencyMs}ms (Threshold: <100ms).`);
      recommendations.push('Inspect BGP routing hops between Hinjawadi Phase 1 and Kothrud.');
    } else {
      findings.push(`RTT within nominal tolerance (${metrics.averageLatencyMs}ms).`);
    }

    if (faultConfig.offlineServers.length > 0) {
      score -= faultConfig.offlineServers.length * 25;
      findings.push(`Cluster degradation: ${faultConfig.offlineServers.length} of 3 application servers offline.`);
      recommendations.push('Initiate automatic container respawn or failover to secondary cloud availability zone.');
    } else {
      findings.push('All 3 application servers responding to health checks.');
    }

    if (faultConfig.mobileSignal === 'Disconnected') {
      score -= 15;
      findings.push('Delivery partner smartphone offline. Cellular 5G link unreachable.');
      recommendations.push('Rely on device-side SQLite queueing until cellular reconnection.');
    }

    setDiagnosticReport({
      timestamp: new Date().toLocaleTimeString(),
      score: Math.max(10, score),
      findings,
      recommendations: recommendations.length > 0 ? recommendations : ['All network parameters operating at optimal peak.'],
    });

    addEvent(
      'Network',
      score > 70 ? 'info' : 'warning',
      'Diagnostic Agent',
      `Comprehensive Network Health Check completed. Network Quality Score: ${Math.max(10, score)}/100.`
    );

    setIsRunningCheck(false);
  };

  const failedOrdersCount = orders.filter((o) => o.status === 'Payment Failed').length;

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-100 sm:text-2xl">
              Real-Time Network Telemetry & Monitoring
            </h1>
            <span className="rounded-md border border-cyan-500/30 bg-cyan-950/40 px-2 py-0.5 text-xs font-semibold text-cyan-300">
              Section 15 • QoS & SLA Observability
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            End-to-end telemetry across transport layers, latency bounds, server response times, and connection pools.
          </p>
        </div>

        <button
          onClick={runHealthCheck}
          disabled={isRunningCheck}
          className="flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-4 py-2.5 text-xs font-bold text-slate-950 transition shadow-lg shadow-cyan-500/20"
        >
          {isRunningCheck ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Running Health Diagnostic...</span>
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              <span>Run Network Health Check</span>
            </>
          )}
        </button>
      </div>

      {/* Metric Cards (Section 15) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          title="Avg Latency"
          value={`${metrics.averageLatencyMs} ms`}
          subtitle="RTT over optical ring"
          status={metrics.averageLatencyMs > 200 ? 'critical' : metrics.averageLatencyMs > 80 ? 'warning' : 'good'}
          icon={<Clock className="h-4 w-4" />}
        />
        <MetricCard
          title="Packet Loss"
          value={`${metrics.packetLossRate}%`}
          subtitle={`${metrics.totalPacketsDropped} dropped frames`}
          status={metrics.packetLossRate > 10 ? 'critical' : metrics.packetLossRate > 0 ? 'warning' : 'good'}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <MetricCard
          title="Delivery Rate"
          value={`${metrics.totalPacketsSent > 0 ? Math.round((metrics.totalPacketsDelivered / metrics.totalPacketsSent) * 100) : 100}%`}
          subtitle="Transport success"
          status="good"
          icon={<Send className="h-4 w-4" />}
        />
        <MetricCard
          title="Retransmissions"
          value={metrics.totalRetransmissions}
          subtitle="TCP retry packets"
          status={metrics.totalRetransmissions > 5 ? 'warning' : 'good'}
          icon={<Activity className="h-4 w-4" />}
        />
        <MetricCard
          title="Active Conns"
          value={metrics.activeConnections}
          subtitle="TCP / WSS sockets"
          icon={<Activity className="h-4 w-4" />}
        />
        <MetricCard
          title="Failed Orders"
          value={failedOrdersCount}
          subtitle="Network dropouts"
          status={failedOrdersCount > 0 ? 'warning' : 'good'}
          icon={<ShieldAlert className="h-4 w-4" />}
        />
      </div>

      {/* Time-Series Graph */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-cyan-400" />
              Round-Trip Time & Error Rate Trends
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Continuous telemetry sampling over 1000ms intervals</p>
          </div>
          <span className="font-mono text-xs text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2.5 py-1 rounded">
            Overall: {metrics.overallStatus}
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend />
              <Line type="monotone" dataKey="latency" stroke="#06b6d4" strokeWidth={2} name="Latency (ms)" activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="errorRate" stroke="#f43f5e" strokeWidth={2} name="Error Rate (%)" />
              <Line type="monotone" dataKey="requests" stroke="#38bdf8" strokeWidth={1.5} name="Requests/sec" strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Diagnostic Report Panel (When Run) */}
      {diagnosticReport && (
        <div className="rounded-2xl border border-cyan-500/40 bg-slate-900/90 p-5 shadow-xl shadow-cyan-950/20 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-100">
                Network Health Diagnostic Report ({diagnosticReport.timestamp})
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Quality Score:</span>
              <span
                className={`text-sm font-extrabold font-mono ${
                  diagnosticReport.score >= 80
                    ? 'text-emerald-400'
                    : diagnosticReport.score >= 50
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {diagnosticReport.score} / 100
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-semibold text-slate-300 block mb-2">Diagnostic Findings:</span>
              <ul className="space-y-1.5 list-disc list-inside text-slate-400">
                {diagnosticReport.findings.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>

            <div>
              <span className="font-semibold text-cyan-300 block mb-2">Recommended Engineering Mitigations:</span>
              <ul className="space-y-1.5 list-disc list-inside text-slate-400">
                {diagnosticReport.recommendations.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Health Thresholds Reference Card (Section 15) */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-xs text-slate-400">
        <div className="font-bold text-slate-200 flex items-center gap-1.5 mb-2">
          <Info className="h-4 w-4 text-cyan-400" />
          Network Health Evaluation Thresholds (Engineering Reference)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
          <div className="rounded border border-emerald-500/30 bg-emerald-950/20 p-2.5">
            <span className="font-bold text-emerald-400 block mb-1">HEALTHY</span>
            <span>Latency &lt; 50ms • Packet Loss = 0% • All 3 App Servers Online • Connected 5G Signal</span>
          </div>
          <div className="rounded border border-amber-500/30 bg-amber-950/20 p-2.5">
            <span className="font-bold text-amber-400 block mb-1">DEGRADED</span>
            <span>Latency 50–300ms • Packet Loss 5–10% • 1–2 Servers Offline • Weak Mobile Signal</span>
          </div>
          <div className="rounded border border-rose-500/30 bg-rose-950/20 p-2.5">
            <span className="font-bold text-rose-400 block mb-1">CRITICAL</span>
            <span>Latency &gt; 300ms • Packet Loss &gt; 20% • All Servers Offline • Disconnected</span>
          </div>
        </div>
      </div>
    </div>
  );
};
