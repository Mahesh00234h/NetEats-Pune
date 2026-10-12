// src/components/layout/FaultControlDrawer.tsx
import React from 'react';
import {
  X,
  Sliders,
  AlertOctagon,
  Wifi,
  WifiOff,
  Server,
  CreditCard,
  Gauge,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import { useSimulation } from '../../simulation/simulationContext';
import {
  PacketLossLevel,
  LatencyLevel,
  CongestionLevel,
  MobileSignalLevel,
  PaymentFailureScenario,
} from '../../types/network';

interface FaultControlDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FaultControlDrawer: React.FC<FaultControlDrawerProps> = ({ isOpen, onClose }) => {
  const { faultConfig, updateFault, toggleServerHealth } = useSimulation();

  if (!isOpen) return null;

  const lossOptions: PacketLossLevel[] = [0, 5, 10, 25];
  const latencyOptions: LatencyLevel[] = [20, 100, 300, 800];
  const congestionOptions: CongestionLevel[] = ['Normal', 'Moderate', 'High', 'Severe'];
  const mobileOptions: MobileSignalLevel[] = ['Connected', 'Weak Signal', 'Disconnected', 'Reconnected'];
  const paymentOptions: PaymentFailureScenario[] = [
    'Normal',
    'Delayed Confirmation',
    'Failed Request',
    'Success Timeout',
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md h-full bg-slate-950 border-l border-slate-800 p-6 overflow-y-auto flex flex-col justify-between shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Sliders className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">Network Fault Injection</h2>
                <p className="text-xs text-slate-400">Section 9 • Dynamic Network Condition Lab</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-5 space-y-6">
            {/* A. Packet Loss */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <AlertOctagon className="h-3.5 w-3.5 text-rose-400" />
                  A. Packet Loss Rate
                </span>
                <span className="font-mono text-cyan-400">{faultConfig.packetLoss}%</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {lossOptions.map((loss) => (
                  <button
                    key={loss}
                    onClick={() => updateFault('packetLoss', loss)}
                    className={`rounded-lg py-2 text-xs font-semibold border transition ${
                      faultConfig.packetLoss === loss
                        ? 'border-rose-500 bg-rose-950/40 text-rose-300'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {loss}%
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">
                {faultConfig.packetLoss === 0
                  ? 'Reliable transport: 100% of packets arrive intact.'
                  : `Injects ${faultConfig.packetLoss}% probabilistic drop. Causes TCP segment retransmissions.`}
              </p>
            </div>

            {/* B. Simulated Latency */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-cyan-400" />
                  B. Simulated Base Latency (RTT)
                </span>
                <span className="font-mono text-cyan-400">{faultConfig.latency} ms</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {latencyOptions.map((lat) => (
                  <button
                    key={lat}
                    onClick={() => updateFault('latency', lat)}
                    className={`rounded-lg py-2 text-xs font-semibold border transition ${
                      faultConfig.latency === lat
                        ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {lat} ms
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">
                Simulates fiber delay across Pune ISP metro rings and optical gateways.
              </p>
            </div>

            {/* C. Congestion / Bandwidth */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <Gauge className="h-3.5 w-3.5 text-amber-400" />
                  C. Congestion / Buffer Queuing
                </span>
                <span className="font-mono text-amber-400">{faultConfig.congestion}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {congestionOptions.map((cg) => (
                  <button
                    key={cg}
                    onClick={() => updateFault('congestion', cg)}
                    className={`rounded-lg py-2 text-xs font-semibold border transition ${
                      faultConfig.congestion === cg
                        ? 'border-amber-500 bg-amber-950/40 text-amber-300'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {cg}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">
                Higher queue pressure multiplies baseline round-trip time and causes bufferbloat.
              </p>
            </div>

            {/* D. Mobile Connectivity */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
                <span className="flex items-center gap-1.5">
                  {faultConfig.mobileSignal === 'Connected' ? (
                    <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <WifiOff className="h-3.5 w-3.5 text-rose-400" />
                  )}
                  D. Delivery Partner Mobile 4G/5G Signal
                </span>
                <span className="font-mono text-slate-200">{faultConfig.mobileSignal}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {mobileOptions.map((mob) => (
                  <button
                    key={mob}
                    onClick={() => updateFault('mobileSignal', mob)}
                    className={`rounded-lg py-2 px-2 text-xs font-semibold border transition text-center ${
                      faultConfig.mobileSignal === mob
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {mob}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">
                Disconnected mode queues rider GPS pings locally; Reconnection triggers batch sync.
              </p>
            </div>

            {/* E. Server Availability */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <Server className="h-3.5 w-3.5 text-cyan-400" />
                  E. Server Availability Controls
                </span>
                <span className="text-[11px] text-slate-400">
                  {faultConfig.offlineServers.length === 0
                    ? 'All 3 Online'
                    : `${faultConfig.offlineServers.length} Offline`}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {['node-server-1', 'node-server-2', 'node-server-3'].map((sid, idx) => {
                  const isOff = faultConfig.offlineServers.includes(sid);
                  return (
                    <button
                      key={sid}
                      onClick={() => toggleServerHealth(sid)}
                      className={`rounded-lg py-2 px-1 text-xs font-semibold border transition text-center ${
                        isOff
                          ? 'border-rose-500 bg-rose-950/40 text-rose-300'
                          : 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300 hover:bg-emerald-900/30'
                      }`}
                    >
                      Server {idx + 1}
                      <span className="block text-[10px] opacity-75">{isOff ? 'OFFLINE' : 'ONLINE'}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* F. Payment Communication */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-purple-400" />
                  F. Payment Gateway Webhook Scenario
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {paymentOptions.map((sc) => (
                  <button
                    key={sc}
                    onClick={() => updateFault('paymentScenario', sc)}
                    className={`rounded-lg p-2 text-xs font-semibold border transition text-left ${
                      faultConfig.paymentScenario === sc
                        ? 'border-purple-500 bg-purple-950/40 text-purple-200'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-medium">{sc}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {sc === 'Normal'
                        ? '200 OK Webhook'
                        : sc === 'Delayed Confirmation'
                        ? 'Async timeout'
                        : sc === 'Failed Request'
                        ? 'Bank 402 reject'
                        : 'Idempotency test'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Academic Consequence Explanation */}
        <div className="mt-6 rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 font-semibold text-cyan-400 mb-1">
            <Info className="h-3.5 w-3.5" />
            <span>Deterministic Network Model Notice</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Every fault modified here immediately impacts downstream simulated TCP/UDP packet drops,
            load balancer routing decisions, GPS update queues, and payment idempotency checks in real time.
          </p>
        </div>
      </div>
    </div>
  );
};
