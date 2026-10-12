// src/components/pages/PacketSimulatorPage.tsx
import React, { useState } from 'react';
import {
  Send,
  RefreshCw,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  Activity,
  FileCode,
  Info,
  Scale,
} from 'lucide-react';
import { useSimulation } from '../../simulation/simulationContext';
import { ProtocolType, SimulatedPacket } from '../../types/network';
import { ProtocolComparisonResult } from '../../types/events';
import { DEFAULT_NETWORK_NODES } from '../../simulation/defaultData';

export const PacketSimulatorPage: React.FC = () => {
  const {
    runPacketSimulation,
    lastPacketRun,
    isPacketSimulating,
    faultConfig,
  } = useSimulation();

  const [sourceId, setSourceId] = useState<string>('node-customer');
  const [destId, setDestId] = useState<string>('node-restaurant');
  const [protocol, setProtocol] = useState<ProtocolType>('TCP');
  const [payload, setPayload] = useState<string>('POST /api/v1/orders/pune { orderId: "PUN-849102", total: 475 }');
  const [selectedPacket, setSelectedPacket] = useState<SimulatedPacket | null>(null);

  // Tab: Standard Simulator vs TCP vs UDP Lab
  const [activeTab, setActiveTab] = useState<'simulator' | 'comparison'>('simulator');

  // TCP vs UDP Comparison State (Section 10)
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [comparisonResults, setComparisonResults] = useState<{
    tcp: ProtocolComparisonResult;
    udp: ProtocolComparisonResult;
  } | null>(null);

  const handleSend = async () => {
    const result = await runPacketSimulation(sourceId, destId, protocol, payload);
    if (result.packets.length > 0) {
      setSelectedPacket(result.packets[result.packets.length - 1]);
    }
  };

  const runComparisonExperiment = async () => {
    setIsComparing(true);
    try {
      const tcpRun = await runPacketSimulation(sourceId, destId, 'TCP', payload);
      const udpRun = await runPacketSimulation(sourceId, destId, 'UDP', payload);

      setComparisonResults({
        tcp: {
          protocol: 'TCP',
          packetsSent: tcpRun.totalPackets,
          packetsDelivered: tcpRun.deliveredCount,
          packetsDropped: tcpRun.droppedCount,
          retransmissions: tcpRun.retransmissionCount,
          acknowledgments: tcpRun.acknowledgmentsCount,
          completionTimeMs: tcpRun.totalTimeMs,
          reliability: 'Guaranteed (Connection-Oriented with Retransmit)',
          deliveryRatePercent:
            tcpRun.totalPackets > 0
              ? Math.round((tcpRun.deliveredCount / (tcpRun.totalPackets - tcpRun.retransmissionCount)) * 100)
              : 100,
          overhead: 'High (3-Way Handshake + 20-60 Byte Headers + ACKs)',
        },
        udp: {
          protocol: 'UDP',
          packetsSent: udpRun.totalPackets,
          packetsDelivered: udpRun.deliveredCount,
          packetsDropped: udpRun.droppedCount,
          retransmissions: 0,
          acknowledgments: 0,
          completionTimeMs: udpRun.totalTimeMs,
          reliability: 'Best-Effort (Connectionless, No Retransmit)',
          deliveryRatePercent:
            udpRun.totalPackets > 0 ? Math.round((udpRun.deliveredCount / udpRun.totalPackets) * 100) : 100,
          overhead: 'Low (No Handshake + 8 Byte Fixed Header)',
        },
      });
    } finally {
      setIsComparing(false);
    }
  };

  const payloadTemplates = [
    { label: 'New Food Order', proto: 'TCP' as ProtocolType, text: 'POST /orders { item: "Misal Pav", qty: 2, addr: "Kothrud" }' },
    { label: 'Rider GPS Telemetry', proto: 'UDP' as ProtocolType, text: 'DATAGRAM { partnerId: "Ramesh-4021", lat: 18.5590, lng: 73.7868 }' },
    { label: 'Payment Webhook', proto: 'HTTPS' as ProtocolType, text: 'POST /webhook/payment { txnId: "TXN-902", status: "SUCCESS" }' },
    { label: 'DNS Domain Resolution', proto: 'DNS' as ProtocolType, text: 'QUERY api.neteats.pune IN A' },
    { label: 'WebSocket Push', proto: 'WebSocket' as ProtocolType, text: 'FRAME: { type: "ORDER_ACCEPTED", prepTime: 20 }' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-100 sm:text-2xl">
              Packet Transmission & Transport Layer Simulator
            </h1>
            <span className="rounded-md border border-cyan-500/30 bg-cyan-950/40 px-2 py-0.5 text-xs font-semibold text-cyan-300">
              Section 8 & 10
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Observe connection handshakes, sequence numbers, packet drops, acknowledgments, and TCP vs UDP reliability differences.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold border transition ${
              activeTab === 'simulator'
                ? 'border-cyan-500 bg-cyan-950/50 text-cyan-300'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            Packet Simulator
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold border transition ${
              activeTab === 'comparison'
                ? 'border-cyan-500 bg-cyan-950/50 text-cyan-300'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            TCP vs UDP Lab
          </button>
        </div>
      </div>

      {activeTab === 'simulator' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls & Configuration (1 Col) */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Send className="h-4 w-4 text-cyan-400" />
              Configure Transmission
            </h3>

            {/* Quick Templates */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                Load Quick Template:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {payloadTemplates.map((tpl) => (
                  <button
                    key={tpl.label}
                    onClick={() => {
                      setProtocol(tpl.proto);
                      setPayload(tpl.text);
                    }}
                    className="rounded-lg border border-slate-800 bg-slate-950/60 px-2 py-1 text-[11px] font-medium text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition"
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Source Node */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Source Node:</label>
              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                {DEFAULT_NETWORK_NODES.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name} ({n.ip})
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Node */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Destination Node:</label>
              <select
                value={destId}
                onChange={(e) => setDestId(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                {DEFAULT_NETWORK_NODES.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name} ({n.ip})
                  </option>
                ))}
              </select>
            </div>

            {/* Protocol */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Transport Protocol:</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['TCP', 'UDP', 'HTTPS', 'DNS', 'DHCP', 'WebSocket'] as ProtocolType[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setProtocol(p)}
                    className={`rounded-lg py-1.5 px-2 text-xs font-semibold border transition text-center ${
                      protocol === p
                        ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Payload description */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Application Payload:</label>
              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 font-mono text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Send Action Button */}
            <button
              onClick={handleSend}
              disabled={isPacketSimulating}
              className="w-full rounded-xl bg-cyan-500 hover:bg-cyan-400 py-3 text-xs font-bold text-slate-950 transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              {isPacketSimulating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Transmitting Across Hops...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Packet ({protocol})</span>
                </>
              )}
            </button>

            {/* Current Network Condition Notice */}
            <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3 text-xs space-y-1 text-slate-400">
              <div className="flex justify-between">
                <span>Active Packet Loss:</span>
                <span className={`font-mono font-bold ${faultConfig.packetLoss > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {faultConfig.packetLoss}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Simulated Latency:</span>
                <span className="font-mono text-cyan-400">{faultConfig.latency}ms</span>
              </div>
            </div>
          </div>

          {/* Stepper Timeline & Packet Inspector (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timeline */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-400" />
                  Transmission Timeline & Hop Inspection
                </h3>
                {lastPacketRun && (
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                      lastPacketRun.success
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {lastPacketRun.success ? 'DELIVERY CONFIRMED' : 'PACKET LOSS / TIMEOUT'}
                  </span>
                )}
              </div>

              {!lastPacketRun ? (
                <div className="py-16 text-center text-xs text-slate-500">
                  Select source, destination, protocol and click "Send Packet" to trace 9-step transmission.
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {lastPacketRun.steps.map((st) => (
                    <div
                      key={st.step}
                      onClick={() => setSelectedPacket(st.packet)}
                      className={`cursor-pointer rounded-xl border p-3 transition text-xs ${
                        st.isLoss
                          ? 'border-rose-500/60 bg-rose-950/30 text-rose-200'
                          : st.isRetransmission
                          ? 'border-amber-500/60 bg-amber-950/30 text-amber-200'
                          : 'border-slate-800 bg-slate-950/60 hover:border-cyan-500/40 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-500">#{st.step}</span>
                          <span className="font-bold text-slate-100">{st.label}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-500">{st.timestamp}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">{st.detail}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Packet Inspector (Section 8) */}
            {selectedPacket && (
              <div className="rounded-xl border border-cyan-500/30 bg-slate-900/80 p-5 shadow-lg shadow-cyan-950/20">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <FileCode className="h-4 w-4" />
                    Layer 4 / Layer 3 Packet Inspector
                  </h4>
                  <span className="font-mono text-xs text-slate-400">ID: {selectedPacket.id}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Source IP:</span>
                    <span className="font-mono font-semibold text-slate-200">{selectedPacket.sourceIP}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Destination IP:</span>
                    <span className="font-mono font-semibold text-slate-200">{selectedPacket.destIP}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Protocol:</span>
                    <span className="font-mono font-semibold text-cyan-400">{selectedPacket.protocol}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Packet State:</span>
                    <span
                      className={`font-semibold ${
                        selectedPacket.state === 'Delivered' || selectedPacket.state === 'Acknowledged'
                          ? 'text-emerald-400'
                          : selectedPacket.state === 'Lost' || selectedPacket.state === 'Failed'
                          ? 'text-rose-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {selectedPacket.state}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Seq Number:</span>
                    <span className="font-mono text-slate-300">{selectedPacket.sequenceNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">ACK Status:</span>
                    <span className="font-mono text-slate-300">
                      {selectedPacket.ackNumber !== undefined ? `Ack=${selectedPacket.ackNumber}` : 'N/A (No ACK)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Transmission Attempts:</span>
                    <span className="font-mono text-slate-300">{selectedPacket.attempts} / {selectedPacket.maxAttempts}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Hop Latency:</span>
                    <span className="font-mono text-slate-300">{selectedPacket.latencyMs} ms</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800 text-xs">
                  <span className="text-slate-500 block text-[10px] mb-1">Payload Fragment:</span>
                  <div className="font-mono bg-slate-950 p-2 rounded text-cyan-300 text-[11px] break-all border border-slate-800">
                    {selectedPacket.payload}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* SECTION 10: TCP VERSUS UDP COMPARISON LAB */
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Scale className="h-5 w-5 text-cyan-400" />
                Interactive TCP vs UDP Benchmark Comparison
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Transmit identical message under identical packet loss ({faultConfig.packetLoss}%) and compare reliability, completion time, and overhead.
              </p>
            </div>

            <button
              onClick={runComparisonExperiment}
              disabled={isComparing}
              className="flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-4 py-2.5 text-xs font-bold text-slate-950 transition shadow-lg shadow-cyan-500/20"
            >
              {isComparing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Benchmarking Both Protocols...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Run Comparison</span>
                </>
              )}
            </button>
          </div>

          {/* Results Comparison Table (Section 10) */}
          {comparisonResults ? (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Metric</th>
                      <th className="p-3 text-cyan-400">TCP (Transmission Control Protocol)</th>
                      <th className="p-3 text-purple-400">UDP (User Datagram Protocol)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/40 text-slate-300">
                    <tr>
                      <td className="p-3 font-semibold text-slate-200">Packets Sent</td>
                      <td className="p-3 font-mono text-cyan-300">{comparisonResults.tcp.packetsSent}</td>
                      <td className="p-3 font-mono text-purple-300">{comparisonResults.udp.packetsSent}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-200">Packets Delivered</td>
                      <td className="p-3 font-mono text-emerald-400">{comparisonResults.tcp.packetsDelivered}</td>
                      <td className="p-3 font-mono text-emerald-400">{comparisonResults.udp.packetsDelivered}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-200">Packets Dropped</td>
                      <td className="p-3 font-mono text-rose-400">{comparisonResults.tcp.packetsDropped}</td>
                      <td className="p-3 font-mono text-rose-400">{comparisonResults.udp.packetsDropped}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-200">Automatic Retransmissions</td>
                      <td className="p-3 font-mono text-amber-400">{comparisonResults.tcp.retransmissions} (Automatic retry)</td>
                      <td className="p-3 font-mono text-slate-500">0 (No retransmission)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-200">Receiver Acknowledgments</td>
                      <td className="p-3 font-mono text-cyan-400">{comparisonResults.tcp.acknowledgments} ACKs received</td>
                      <td className="p-3 font-mono text-slate-500">0 (Connectionless)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-200">Simulated Completion Time</td>
                      <td className="p-3 font-mono text-slate-200">{comparisonResults.tcp.completionTimeMs} ms</td>
                      <td className="p-3 font-mono text-emerald-400 font-bold">{comparisonResults.udp.completionTimeMs} ms (Faster)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-200">Reliability Guarantee</td>
                      <td className="p-3 text-cyan-300">{comparisonResults.tcp.reliability}</td>
                      <td className="p-3 text-purple-300">{comparisonResults.udp.reliability}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-200">Protocol Overhead</td>
                      <td className="p-3 text-slate-400">{comparisonResults.tcp.overhead}</td>
                      <td className="p-3 text-slate-400">{comparisonResults.udp.overhead}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Academic takeaway banner */}
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-4 text-xs text-slate-300 space-y-1.5">
                <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <Info className="h-4 w-4" />
                  Academic Concept Takeaway: Why Pune Food Delivery uses both!
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  <strong>TCP</strong> is strictly used for checkout, payment authorization, and order state commits where zero data loss can be tolerated.
                  In contrast, <strong>UDP</strong> is used for continuous rider GPS telemetry updates where losing one coordinate packet is acceptable because a fresher coordinate arrives 1 second later without blocking the socket.
                </p>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-slate-500">
              Click "Run Comparison" above to execute both protocols side-by-side.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
