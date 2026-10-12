// src/components/modals/ScenarioModal.tsx
import React, { useState } from 'react';
import {
  X,
  Zap,
  Play,
  CheckCircle2,
  AlertTriangle,
  Server,
  TrendingUp,
  WifiOff,
  CreditCard,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useSimulation } from '../../simulation/simulationContext';

interface ScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tabKey: any) => void;
}

export const ScenarioModal: React.FC<ScenarioModalProps> = ({ isOpen, onClose, onNavigateToTab }) => {
  const { runScenario } = useSimulation();
  const [runningId, setRunningId] = useState<string | null>(null);

  if (!isOpen) return null;

  const scenarios = [
    {
      id: 'scenario-a',
      letter: 'A',
      title: 'Normal Order Journey',
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
      concept: 'Standard TCP/IP & REST Client-Server Pipeline',
      description:
        'All application servers online, baseline 20ms fiber latency, 0% packet loss. Complete checkout from customer in Kothrud to Baner restaurant.',
      actionTab: 'order',
    },
    {
      id: 'scenario-b',
      letter: 'B',
      title: 'Packet Loss & TCP Retransmission',
      icon: <AlertTriangle className="h-5 w-5 text-amber-400" />,
      concept: 'Reliable Transport Layer / Bounded Exponential Backoff',
      description:
        'Injects 10% packet loss. Shows segment drops in transit, sequence number tracking, and receiver ACK generation upon retransmission.',
      actionTab: 'packet_sim',
    },
    {
      id: 'scenario-c',
      letter: 'C',
      title: 'Server Failure & Automatic Failover',
      icon: <Server className="h-5 w-5 text-rose-400" />,
      concept: 'High Availability & Health-Check Reverse Proxying',
      description:
        'Simulates abrupt failure of Server 1. Load balancer health probes detect 500/timeout and seamlessly shifts all eligible client traffic to Server 2 and 3.',
      actionTab: 'failover',
    },
    {
      id: 'scenario-d',
      letter: 'D',
      title: 'Peak-Hour Congestion & Load Balancing',
      icon: <TrendingUp className="h-5 w-5 text-cyan-400" />,
      concept: 'Congestion Control & Traffic Distribution Algorithms',
      description:
        'Simulates dinner peak in Pune. Request volume increases, network latency jumps to 300ms, and load balancer distributes load via Least Connections.',
      actionTab: 'load_balancer',
    },
    {
      id: 'scenario-e',
      letter: 'E',
      title: 'Poor Mobile Connectivity & GPS Reconnection',
      icon: <WifiOff className="h-5 w-5 text-purple-400" />,
      concept: 'Mobile IP Disconnection / Edge Store-and-Forward Buffering',
      description:
        'Rider enters a cellular shadow zone. Live GPS stream pauses and telemetry is buffered locally. Upon 5G reconnection, queued packets synchronize in a batch.',
      actionTab: 'tracking',
    },
    {
      id: 'scenario-f',
      letter: 'F',
      title: 'Payment Confirmation Failure & Reconciliation',
      icon: <CreditCard className="h-5 w-5 text-emerald-400" />,
      concept: 'Transaction Idempotency & Two-Phase Reconciliation',
      description:
        'Simulates payment clearance at gateway while confirmation webhook is dropped. System relies on Idempotency Keys to avoid duplicate food ordering.',
      actionTab: 'order',
    },
    {
      id: 'scenario-g',
      letter: 'G',
      title: 'UDP vs TCP Comparative Stress Test',
      icon: <Layers className="h-5 w-5 text-blue-400" />,
      concept: 'Transport Layer Tradeoffs: Reliability vs Low Overhead',
      description:
        'Transmits identical payload over TCP (connection setup, ACK, retransmission) and UDP (lightweight datagram, no ACK, best effort) under 10% loss.',
      actionTab: 'packet_sim',
    },
  ];

  const handleRun = async (scenario: typeof scenarios[0]) => {
    setRunningId(scenario.id);
    try {
      await runScenario(scenario.id);
      if (onNavigateToTab) {
        onNavigateToTab(scenario.actionTab);
      }
      onClose();
    } finally {
      setRunningId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl max-h-[90vh] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Academic Presentation Scenarios</h2>
              <p className="text-xs text-slate-400">
                Section 19 • 7 One-Click Network Engineering Experiments for Faculty Evaluation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-3.5 divide-y divide-slate-800/60">
          {scenarios.map((sc) => (
            <div
              key={sc.id}
              className="pt-3.5 first:pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="flex-shrink-0 mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-cyan-400">
                  {sc.letter}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-100">{sc.title}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                      {sc.concept}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{sc.description}</p>
                </div>
              </div>
              <button
                onClick={() => handleRun(sc)}
                disabled={runningId !== null}
                className={`flex-shrink-0 flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold border transition ${
                  runningId === sc.id
                    ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 animate-pulse'
                    : 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 shadow-sm'
                }`}
              >
                {runningId === sc.id ? (
                  <>Running...</>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Run Test</span>
                    <ArrowRight className="h-3 w-3 opacity-60" />
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/40 border-t border-slate-800 text-center text-xs text-slate-400">
          Tip: Running any scenario dynamically updates the React Flow topology, live event stream, and network metrics.
        </div>
      </div>
    </div>
  );
};
