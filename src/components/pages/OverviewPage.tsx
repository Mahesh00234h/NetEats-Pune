// src/components/pages/OverviewPage.tsx
import React from 'react';
import {
  Activity,
  CheckCircle,
  AlertTriangle,
  Server,
  Clock,
  Send,
  Bike,
  ShieldAlert,
  ArrowUpRight,
  Zap,
  TrendingUp,
  Cpu,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useSimulation } from '../../simulation/simulationContext';
import { MetricCard } from '../common/MetricCard';

interface OverviewPageProps {
  onNavigate: (tabKey: any) => void;
  onOpenFaults: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate, onOpenFaults }) => {
  const {
    metrics,
    orders,
    servers,
    events,
    faultConfig,
    placeOrder,
    runLoadBalancerBatch,
    updateFault,
  } = useSimulation();

  const successfulOrders = orders.filter((o) => o.status !== 'Payment Failed' && o.status !== 'Cancelled').length;
  const failedOrders = orders.filter((o) => o.status === 'Payment Failed' || o.paymentStatus === 'Delayed Confirmation').length;
  const activeServersCount = servers.filter((s) => s.isHealthy && !faultConfig.offlineServers.includes(s.id)).length;

  // Chart data: Latency over time
  const latencyTrendData = [
    { time: '12:00', latency: 22, dropped: 0 },
    { time: '12:05', latency: 25, dropped: 0 },
    { time: '12:10', latency: 21, dropped: 1 },
    { time: '12:15', latency: 30, dropped: 0 },
    { time: '12:20', latency: metrics.averageLatencyMs, dropped: metrics.totalPacketsDropped },
  ];

  // Chart data: Server request distribution
  const serverDistributionData = servers.map((s) => ({
    name: s.name.replace('Application Server', 'Server').replace('(Primary)', '(P)').replace('(Secondary)', '(S)').replace('(Burst Replica)', '(B)'),
    requests: s.totalRequests,
    cpu: s.cpuUtilization,
  }));

  // Chart data: Packets comparison
  const packetStatsData = [
    { name: 'Delivered', count: metrics.totalPacketsDelivered, fill: '#10b981' },
    { name: 'Dropped', count: metrics.totalPacketsDropped, fill: '#f43f5e' },
    { name: 'Retransmitted', count: metrics.totalRetransmissions, fill: '#f59e0b' },
  ];

  // Order status distribution
  const orderPieData = [
    { name: 'Delivered / In Transit', value: Math.max(1, successfulOrders), color: '#06b6d4' },
    { name: 'Pending / Delayed', value: Math.max(0, failedOrders), color: '#f59e0b' },
    { name: 'Demo Baseline', value: orders.length === 0 ? 3 : 0, color: '#334155' },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-100 sm:text-2xl">
              Network Operations Dashboard
            </h1>
            <span className="rounded-md border border-cyan-500/30 bg-cyan-950/40 px-2 py-0.5 text-xs font-semibold text-cyan-300">
              Live Topology State
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry, packet transmission health, server load distribution, and Pune delivery state.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => placeOrder('UPI')}
            className="flex items-center gap-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-3.5 py-2 text-xs font-bold text-slate-950 transition shadow-md shadow-cyan-500/20"
          >
            <Zap className="h-4 w-4" />
            <span>Place Demo Order</span>
          </button>
          <button
            onClick={() => runLoadBalancerBatch(10)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition"
          >
            <Cpu className="h-4 w-4 text-cyan-400" />
            <span>Send 10 Requests</span>
          </button>
          <button
            onClick={onOpenFaults}
            className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-950/30 hover:bg-amber-900/40 px-3 py-2 text-xs font-semibold text-amber-300 transition"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Inject Faults</span>
          </button>
        </div>
      </div>

      {/* 8 Metric Cards (Section 5) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        <MetricCard
          title="Total Orders"
          value={orders.length}
          subtitle="Simulated sessions"
          icon={<Activity className="h-4 w-4" />}
          onClick={() => onNavigate('order')}
        />
        <MetricCard
          title="Successful"
          value={successfulOrders}
          subtitle="Confirmed orders"
          status="good"
          icon={<CheckCircle className="h-4 w-4" />}
          onClick={() => onNavigate('order')}
        />
        <MetricCard
          title="Failed / Delayed"
          value={failedOrders}
          subtitle="Timeout / dropped"
          status={failedOrders > 0 ? 'warning' : 'good'}
          icon={<AlertTriangle className="h-4 w-4" />}
          onClick={() => onNavigate('order')}
        />
        <MetricCard
          title="App Servers"
          value={`${activeServersCount}/3`}
          subtitle={activeServersCount < 3 ? 'Cluster degraded' : 'High availability'}
          status={activeServersCount < 3 ? 'warning' : 'good'}
          icon={<Server className="h-4 w-4" />}
          onClick={() => onNavigate('load_balancer')}
        />
        <MetricCard
          title="Avg Latency"
          value={`${metrics.averageLatencyMs}ms`}
          subtitle={metrics.averageLatencyMs > 200 ? 'Severe congestion' : 'Low latency'}
          status={metrics.averageLatencyMs > 200 ? 'critical' : metrics.averageLatencyMs > 80 ? 'warning' : 'good'}
          icon={<Clock className="h-4 w-4" />}
          onClick={() => onNavigate('monitoring')}
        />
        <MetricCard
          title="Delivery Rate"
          value={`${metrics.totalPacketsSent > 0 ? Math.round((metrics.totalPacketsDelivered / metrics.totalPacketsSent) * 100) : 100}%`}
          subtitle={`${metrics.totalPacketsDropped} dropped pkts`}
          status={metrics.totalPacketsDropped > 0 ? 'warning' : 'good'}
          icon={<Send className="h-4 w-4" />}
          onClick={() => onNavigate('packet_sim')}
        />
        <MetricCard
          title="Active Riders"
          value="1"
          subtitle="Ramesh (Baner)"
          icon={<Bike className="h-4 w-4" />}
          onClick={() => onNavigate('tracking')}
        />
        <MetricCard
          title="Network Status"
          value={metrics.overallStatus}
          subtitle="Simulation engine"
          status={metrics.overallStatus === 'Healthy' ? 'good' : metrics.overallStatus === 'Degraded' ? 'warning' : 'critical'}
          icon={<ShieldAlert className="h-4 w-4" />}
          onClick={() => onNavigate('monitoring')}
        />
      </div>

      {/* Visual Charts Grid (Section 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latency Over Time */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
                Network Latency & Dropped Packets Timeline
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Dynamic round-trip response time vs dropped frames across simulated Pune ISP hops
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2 py-1 rounded">
              RTT: {metrics.averageLatencyMs}ms
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={latencyTrendData}>
                <defs>
                  <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} unit="ms" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="latency" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#latencyGradient)" name="Latency (ms)" />
                <Bar dataKey="dropped" fill="#f43f5e" name="Dropped Packets" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Server Request Distribution */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Server className="h-4 w-4 text-cyan-400" />
                Server Request Distribution
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Application cluster load balance</p>
            </div>
            <button
              onClick={() => onNavigate('load_balancer')}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
            >
              Inspect <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serverDistributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="requests" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Requests" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live Event Stream & Network Status Explanation (Section 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Event Stream */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" />
                Live Deterministic Event Stream
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every event below is driven by actual network state, not hardcoded animations
              </p>
            </div>
            <button
              onClick={() => onNavigate('logs')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              All Logs ({events.length}) <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
            {events.slice(0, 8).map((evt) => (
              <div
                key={evt.id}
                className="flex items-start gap-3 rounded-lg border border-slate-800/80 bg-slate-950/60 p-2.5 text-xs transition hover:border-slate-700"
              >
                <div className="flex-shrink-0 font-mono text-[10px] text-slate-500 mt-0.5">{evt.timestamp}</div>
                <span
                  className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    evt.severity === 'error' || evt.severity === 'critical'
                      ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                      : evt.severity === 'warning'
                      ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                      : evt.severity === 'success'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                  }`}
                >
                  {evt.category}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-200 truncate">{evt.source}</div>
                  <div className="text-slate-400 text-[11px] leading-relaxed break-words">{evt.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Network Health Diagnostics & Architecture Summary */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-2">
              <ShieldAlert className="h-4 w-4 text-cyan-400" />
              Network State Assessment
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Real-time evaluation based on active packet loss, congestion, and server redundancy.
            </p>

            <div className="space-y-3">
              <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-400">Current Health:</span>
                  <span
                    className={`font-bold ${
                      metrics.overallStatus === 'Healthy'
                        ? 'text-emerald-400'
                        : metrics.overallStatus === 'Degraded'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {metrics.overallStatus.toUpperCase()}
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      metrics.overallStatus === 'Healthy'
                        ? 'w-full bg-emerald-500'
                        : metrics.overallStatus === 'Degraded'
                        ? 'w-2/3 bg-amber-500'
                        : 'w-1/3 bg-rose-500'
                    }`}
                  />
                </div>
              </div>

              <div className="text-xs space-y-1.5 text-slate-400">
                <div className="flex justify-between">
                  <span>Packet Drop Rate:</span>
                  <span className="font-mono text-slate-200">{faultConfig.packetLoss}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Effective Round-Trip Time:</span>
                  <span className="font-mono text-cyan-400">{metrics.averageLatencyMs} ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Cluster Redundancy:</span>
                  <span className="font-mono text-slate-200">{activeServersCount} of 3 Healthy</span>
                </div>
                <div className="flex justify-between">
                  <span>Mobile Telemetry Signal:</span>
                  <span className="font-mono text-slate-200">{faultConfig.mobileSignal}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <button
              onClick={() => onNavigate('topology')}
              className="w-full rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 py-2 text-xs font-bold text-cyan-300 transition flex items-center justify-center gap-2"
            >
              <span>Explore Interactive 14-Node Topology</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
