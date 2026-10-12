// src/components/pages/ConceptsLabPage.tsx
import React, { useState } from 'react';
import {
  BookOpen,
  Layers,
  Globe,
  Radio,
  Lock,
  Zap,
  Activity,
  Network,
  Cpu,
  Server,
  Shield,
  CheckCircle2,
  Play,
  RotateCcw,
  Info,
  ArrowRight,
} from 'lucide-react';
import { useSimulation } from '../../simulation/simulationContext';

export const ConceptsLabPage: React.FC = () => {
  const { addEvent } = useSimulation();
  const [selectedTopic, setSelectedTopic] = useState<string>('tcp_ip');

  // Mini-simulation states
  // 1. DNS Lab state
  const [dnsQuery, setDnsQuery] = useState('api.neteats.pune');
  const [dnsSteps, setDnsSteps] = useState<string[]>([]);
  const [isDnsResolving, setIsDnsResolving] = useState(false);

  // 2. DHCP Lab state
  const [dhcpStep, setDhcpStep] = useState<number>(0);

  // 3. TLS Handshake state
  const [tlsStep, setTlsStep] = useState<number>(0);

  // 4. Star Topology Central Switch state
  const [switchOnline, setSwitchOnline] = useState<boolean>(true);

  // 5. Network Device Explorer state
  const [selectedDevice, setSelectedDevice] = useState<string>('router');

  const topics = [
    { id: 'tcp_ip', label: '1. TCP/IP Protocol Stack', icon: <Layers className="h-4 w-4" /> },
    { id: 'ip_addressing', label: '2. IP Addressing & Subnetting', icon: <Network className="h-4 w-4" /> },
    { id: 'dns', label: '3. DNS Resolution Lab', icon: <Globe className="h-4 w-4" /> },
    { id: 'dhcp', label: '4. DHCP DORA Handshake', icon: <Radio className="h-4 w-4" /> },
    { id: 'https_tls', label: '5. HTTPS & TLS Handshake', icon: <Lock className="h-4 w-4" /> },
    { id: 'udp', label: '6. UDP Datagram Streaming', icon: <Zap className="h-4 w-4" /> },
    { id: 'websockets', label: '7. WebSocket Full-Duplex', icon: <Activity className="h-4 w-4" /> },
    { id: 'star_topology', label: '8. Star Topology & Switch Failure', icon: <Cpu className="h-4 w-4" /> },
    { id: 'hybrid', label: '9. Hybrid Cloud Architecture', icon: <Server className="h-4 w-4" /> },
    { id: 'devices', label: '10. Network Devices Explorer', icon: <Shield className="h-4 w-4" /> },
  ];

  // DNS Resolver Simulation
  const runDnsResolution = async () => {
    setIsDnsResolving(true);
    setDnsSteps([]);
    const steps = [
      `[1/4] Client checks local OS DNS Resolver Cache for '${dnsQuery}'... Cache Miss.`,
      `[2/4] Query UDP port 53 dispatched to ISP Recursive Resolver (10.0.0.53).`,
      `[3/4] Recursive Resolver queries Authoritative TLD (.pune) Nameserver.`,
      `[4/4] Authoritative Answer received: '${dnsQuery}' IN A 10.0.3.10 (Load Balancer VIP). Cached for TTL=300s.`,
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 250));
      setDnsSteps((prev) => [...prev, steps[i]]);
    }
    setIsDnsResolving(false);
    addEvent('Network', 'info', 'DNS Resolver', `Domain ${dnsQuery} resolved to VIP 10.0.3.10 via UDP port 53.`);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-100 sm:text-2xl">
              Computer Networks (CN) Concepts Laboratory
            </h1>
            <span className="rounded-md border border-cyan-500/30 bg-cyan-950/40 px-2 py-0.5 text-xs font-semibold text-cyan-300">
              Section 17 • 10 Interactive Engineering Modules
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Academic deep dives directly connected to the Pune food delivery system architecture.
          </p>
        </div>
      </div>

      {/* Main Container: Topic Tabs on Left, Interactive Workspace on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Topic Selector (1 Col) */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 pb-2 block">
            Select Concept Module
          </span>
          {topics.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTopic(t.id)}
              className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition text-left ${
                selectedTopic === t.id
                  ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 font-semibold shadow-sm'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <span className={selectedTopic === t.id ? 'text-cyan-400' : 'text-slate-500'}>{t.icon}</span>
              <span className="truncate">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Right Topic Interactive Workspace (3 Cols) */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm min-h-[500px]">
          {/* 1. TCP/IP PROTOCOL STACK */}
          {selectedTopic === 'tcp_ip' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-100">1. TCP/IP Protocol Stack & Data Encapsulation</h3>
                <p className="text-xs text-slate-400 mt-1">
                  How a food order in Kothrud is encapsulated into packets as it travels down the 4-layer TCP/IP model.
                </p>
              </div>

              {/* Interactive Layer Breakdown */}
              <div className="space-y-3">
                <div className="rounded-xl border border-cyan-500/40 bg-cyan-950/20 p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-cyan-300 text-xs uppercase tracking-wider">
                      Layer 4: Application Layer (HTTP / HTTPS / WSS / DNS)
                    </span>
                    <span className="font-mono text-[11px] text-cyan-400">Data Payload</span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono bg-slate-950 p-2 rounded border border-slate-800">
                    POST /orders/checkout &#123; items: ["Puneri Misal Pav"], total: 220, idempotencyKey: "PUN-99" &#125;
                  </p>
                </div>

                <div className="rounded-xl border border-purple-500/40 bg-purple-950/20 p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-purple-300 text-xs uppercase tracking-wider">
                      Layer 3: Transport Layer (TCP / UDP)
                    </span>
                    <span className="font-mono text-[11px] text-purple-400">TCP Segment (Header: 20 Bytes)</span>
                  </div>
                  <div className="text-xs text-slate-300 grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono bg-slate-950 p-2 rounded border border-slate-800 text-[11px]">
                    <div>Src Port: 54122</div>
                    <div>Dst Port: 443 (HTTPS)</div>
                    <div>Seq Num: 1001</div>
                    <div>Flags: [ACK, PSH]</div>
                  </div>
                </div>

                <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-amber-300 text-xs uppercase tracking-wider">
                      Layer 2: Internet / Network Layer (IPv4 / IPv6)
                    </span>
                    <span className="font-mono text-[11px] text-amber-400">IP Packet (Header: 20 Bytes)</span>
                  </div>
                  <div className="text-xs text-slate-300 grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono bg-slate-950 p-2 rounded border border-slate-800 text-[11px]">
                    <div>Src IP: 192.168.1.45</div>
                    <div>Dst IP: 10.0.3.10</div>
                    <div>TTL: 64</div>
                    <div>Protocol: 6 (TCP)</div>
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-emerald-300 text-xs uppercase tracking-wider">
                      Layer 1: Network Access / Data Link Layer (IEEE 802.11ax / Ethernet)
                    </span>
                    <span className="font-mono text-[11px] text-emerald-400">Frame (Header + FCS Trailer)</span>
                  </div>
                  <div className="text-xs text-slate-300 grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono bg-slate-950 p-2 rounded border border-slate-800 text-[11px]">
                    <div>Src MAC: 74:D4:35:E1:9A:01</div>
                    <div>Dst MAC: 00:14:22:01:23:45</div>
                    <div>FCS Checksum: 0x8F92A1</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. IP ADDRESSING & SUBNETTING */}
          {selectedTopic === 'ip_addressing' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-100">2. IP Addressing, Subnet Masks & Default Gateways</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Private RFC 1918 address allocation across Pune local Wi-Fi and the Cloud VPC.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[10px] uppercase">
                    <tr>
                      <th className="p-3">Network Zone</th>
                      <th className="p-3">Subnet (CIDR)</th>
                      <th className="p-3">Subnet Mask</th>
                      <th className="p-3">Default Gateway</th>
                      <th className="p-3">Demonstration Nodes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    <tr>
                      <td className="p-3 font-semibold text-cyan-300">Customer Home LAN (Kothrud)</td>
                      <td className="p-3 font-mono">192.168.1.0/24</td>
                      <td className="p-3 font-mono">255.255.255.0</td>
                      <td className="p-3 font-mono text-emerald-400">192.168.1.1</td>
                      <td className="p-3">Customer Phone (192.168.1.45)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-purple-300">Cloud VPC DMZ (Edge)</td>
                      <td className="p-3 font-mono">10.0.1.0/24</td>
                      <td className="p-3 font-mono">255.255.255.0</td>
                      <td className="p-3 font-mono text-emerald-400">10.0.1.1</td>
                      <td className="p-3">Edge Router (10.0.1.1), Firewall (10.0.2.1)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-amber-300">Internal Application Subnet</td>
                      <td className="p-3 font-mono">10.0.4.0/24</td>
                      <td className="p-3 font-mono">255.255.255.0</td>
                      <td className="p-3 font-mono text-emerald-400">10.0.4.1</td>
                      <td className="p-3">App Servers 1, 2, 3 (10.0.4.11-13)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-emerald-300">Secure Database Subnet</td>
                      <td className="p-3 font-mono">10.0.5.0/24</td>
                      <td className="p-3 font-mono">255.255.255.0</td>
                      <td className="p-3 font-mono text-emerald-400">10.0.5.1</td>
                      <td className="p-3">PostgreSQL DB Cluster (10.0.5.20)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. DNS RESOLUTION LAB */}
          {selectedTopic === 'dns' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-100">3. Interactive Domain Name System (DNS) Resolution</h3>
                <p className="text-xs text-slate-400 mt-1">
                  RFC 1035 UDP Port 53 iterative resolution from human-readable domain name to 32-bit IPv4 address.
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={dnsQuery}
                  onChange={(e) => setDnsQuery(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
                  placeholder="Enter demonstration domain..."
                />
                <button
                  onClick={runDnsResolution}
                  disabled={isDnsResolving}
                  className="rounded-xl bg-cyan-500 hover:bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950 transition flex items-center gap-1.5"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Resolve Hostname</span>
                </button>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2 min-h-36 font-mono text-xs">
                {dnsSteps.length === 0 ? (
                  <div className="text-slate-600 text-center py-6">
                    Click "Resolve Hostname" to trace root, TLD, and authoritative resolution steps.
                  </div>
                ) : (
                  dnsSteps.map((s, idx) => (
                    <div key={idx} className={idx === 3 ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                      {s}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 4. DHCP LAB */}
          {selectedTopic === 'dhcp' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-100">4. Dynamic Host Configuration Protocol (DHCP) DORA Exchange</h3>
                <p className="text-xs text-slate-400 mt-1">
                  How a customer in Kothrud turns on Wi-Fi and automatically receives IP, Gateway, and DNS server.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                {[
                  { step: 1, name: '1. DISCOVER', desc: 'Broadcast from 0.0.0.0:68 ➔ 255.255.255.255:67 (Who is DHCP server?)' },
                  { step: 2, name: '2. OFFER', desc: 'Server offers IP 192.168.1.45, Mask: 255.255.255.0, Lease: 86400s' },
                  { step: 3, name: '3. REQUEST', desc: 'Client requests the offered IP: "I accept 192.168.1.45"' },
                  { step: 4, name: '4. ACKNOWLEDGE', desc: 'Server acknowledges lease, assigns Gateway: 192.168.1.1, DNS: 10.0.0.53' },
                ].map((d) => (
                  <div
                    key={d.step}
                    onClick={() => setDhcpStep(d.step)}
                    className={`cursor-pointer rounded-xl border p-3 transition ${
                      dhcpStep === d.step
                        ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-100">{d.name}</div>
                    <p className="text-[11px] mt-1 text-slate-400">{d.desc}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setDhcpStep((s) => (s < 4 ? s + 1 : 1))}
                  className="rounded-xl bg-cyan-500 hover:bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950 transition"
                >
                  Step DORA Sequence ({dhcpStep}/4)
                </button>
              </div>
            </div>
          )}

          {/* 5. HTTPS & TLS HANDSHAKE */}
          {selectedTopic === 'https_tls' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-100">5. HTTPS & TLS 1.3 Cryptographic Handshake</h3>
                <p className="text-xs text-slate-400 mt-1">
                  1-RTT session establishment negotiating cipher suite TLS_AES_256_GCM_SHA384 and Diffie-Hellman keys.
                </p>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-slate-300">
                  <span className="text-cyan-400 font-bold block mb-1">1. ClientHello (1-RTT)</span>
                  Client offers supported Cipher Suites, TLS Version 1.3, and Diffie-Hellman Key Share public key.
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-slate-300">
                  <span className="text-purple-400 font-bold block mb-1">2. ServerHello + Certificate + Finished</span>
                  Server selects cipher (TLS_AES_256_GCM), presents X.509 Certificate issued to api.neteats.pune, and derives Master Secret.
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-slate-300">
                  <span className="text-emerald-400 font-bold block mb-1">3. Symmetric Application Data Flow</span>
                  Both endpoints switch to symmetric AES-256 session keys. HTTP order payload is completely encrypted.
                </div>
              </div>
            </div>
          )}

          {/* 6. UDP STREAMING */}
          {selectedTopic === 'udp' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-100">6. User Datagram Protocol (UDP) Real-Time Telemetry</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Why food delivery GPS tracking uses UDP: Zero connection overhead, fixed 8-byte headers, and no head-of-line blocking.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <span className="font-bold text-slate-100 block">8-Byte UDP Fixed Header Structure:</span>
                  <div className="grid grid-cols-2 gap-1.5 font-mono text-cyan-300 text-[11px]">
                    <div className="bg-slate-900 p-2 rounded">Source Port (16 bits)</div>
                    <div className="bg-slate-900 p-2 rounded">Destination Port (16 bits)</div>
                    <div className="bg-slate-900 p-2 rounded">Length (16 bits)</div>
                    <div className="bg-slate-900 p-2 rounded">Checksum (16 bits)</div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <span className="font-bold text-emerald-400 block">Why Low-Latency Wins over TCP Retransmit:</span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    If Rider Ramesh's phone drops a GPS datagram at Pashan Circle, retransmitting it 500ms later is useless
                    because a newer coordinate at Ganeshkhind Road has already been emitted!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 7. WEBSOCKETS */}
          {selectedTopic === 'websockets' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-100">7. WebSocket Protocol (RFC 6455)</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Persistent full-duplex TCP channel keeping restaurant kitchen and customer phone synchronized without polling.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs space-y-2">
                <div className="text-cyan-400 font-bold">HTTP 101 Switching Protocols Handshake:</div>
                <div className="text-slate-400 text-[11px]">
                  GET /ws/orders HTTP/1.1<br />
                  Host: api.neteats.pune<br />
                  Upgrade: websocket<br />
                  Connection: Upgrade<br />
                  Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==<br />
                  Sec-WebSocket-Version: 13
                </div>
                <div className="text-emerald-400 pt-2 border-t border-slate-800 text-[11px]">
                  HTTP/1.1 101 Switching Protocols ➔ Persistent Bidirectional Socket Open!
                </div>
              </div>
            </div>
          )}

          {/* 8. STAR TOPOLOGY & SWITCH FAILURE */}
          {selectedTopic === 'star_topology' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-100">8. Star Topology & Central Switch Single Point of Failure</h3>
                <p className="text-xs text-slate-400 mt-1">
                  All local data center server nodes connect directly to a central Layer 2 switch. Simulate central switch outage!
                </p>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div>
                  <span className="font-bold text-slate-200 text-xs">Central Data Center Switch (Cisco Nexus)</span>
                  <p className="text-xs text-slate-400 mt-0.5">Controls all internal links between App Servers & PostgreSQL DB</p>
                </div>
                <button
                  onClick={() => setSwitchOnline(!switchOnline)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    switchOnline
                      ? 'bg-rose-600 hover:bg-rose-500 text-slate-100'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950'
                  }`}
                >
                  {switchOnline ? 'Sever Central Switch' : 'Restore Switch'}
                </button>
              </div>

              <div
                className={`rounded-xl border p-4 text-xs ${
                  switchOnline
                    ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200'
                    : 'border-rose-500 bg-rose-950/40 text-rose-200'
                }`}
              >
                <span className="font-bold block mb-1">
                  {switchOnline ? 'Star Topology Active: All Nodes Communicating' : 'SINGLE POINT OF FAILURE TRIGGERED!'}
                </span>
                <p className="text-[11px] leading-relaxed opacity-90">
                  {switchOnline
                    ? 'In a star network, node failures are isolated (e.g. Server 1 dying does not disrupt Server 2). However, the central switch is the single point of failure.'
                    : 'The central switch has failed! Even though all 3 servers and the database are individually powered on, ALL inter-node packet transmission has ceased.'}
                </p>
              </div>
            </div>
          )}

          {/* 9. HYBRID CLOUD ARCHITECTURE */}
          {selectedTopic === 'hybrid' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-100">9. Hybrid Architecture: LAN + Metro WAN + Cloud VPC</h3>
                <p className="text-xs text-slate-400 mt-1">
                  How local Pune devices, city ISPs, and cloud servers work together in a unified network.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1.5">
                  <span className="font-bold text-cyan-400 block">1. Local Edge LAN</span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Customer home Wi-Fi in Kothrud and restaurant kitchen POS in Baner operating on private RFC 1918 class C subnets.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1.5">
                  <span className="font-bold text-amber-400 block">2. Metro WAN Backbone</span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Fiber rings and BGP autonomous systems routing traffic across Pune ISPs (BSNL, Airtel, Jio) with NAT gateways.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1.5">
                  <span className="font-bold text-purple-400 block">3. Cloud Virtual Private Cloud</span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Private cloud VPC hosting reverse proxy load balancers, container clusters, and multi-AZ databases behind stateful firewalls.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 10. NETWORK DEVICES EXPLORER */}
          {selectedTopic === 'devices' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-100">10. Network Devices Interactive Explorer</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Select any fundamental networking device to inspect its OSI operating layer and function.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'router', name: 'Router' },
                  { id: 'switch', name: 'Switch' },
                  { id: 'modem', name: 'Modem' },
                  { id: 'firewall', name: 'Firewall' },
                  { id: 'access_point', name: 'Access Point' },
                  { id: 'gateway', name: 'Gateway' },
                  { id: 'load_balancer', name: 'Load Balancer' },
                ].map((dev) => (
                  <button
                    key={dev.id}
                    onClick={() => setSelectedDevice(dev.id)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold border transition ${
                      selectedDevice === dev.id
                        ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {dev.name}
                  </button>
                ))}
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-2 text-xs">
                <span className="text-cyan-400 font-bold uppercase tracking-wider block text-[11px]">
                  Device Specification:
                </span>
                <p className="text-slate-200 text-sm font-semibold">
                  {selectedDevice === 'router'
                    ? 'Router (Layer 3 Network Layer)'
                    : selectedDevice === 'switch'
                    ? 'Switch (Layer 2 Data Link Layer)'
                    : selectedDevice === 'modem'
                    ? 'Modem (Layer 1 Physical Layer)'
                    : selectedDevice === 'firewall'
                    ? 'Firewall (Layer 3/4/7 Stateful Filter)'
                    : selectedDevice === 'access_point'
                    ? 'Access Point (Layer 2 802.11 Wireless Bridge)'
                    : selectedDevice === 'gateway'
                    ? 'Default Gateway (Protocol Translation / NAT)'
                    : 'Load Balancer (Layer 7 HTTP Reverse Proxy)'}
                </p>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  {selectedDevice === 'router'
                    ? 'Inspects destination IP addresses and consults routing tables to forward packets across different autonomous networks and metropolitan Pune ISP links.'
                    : selectedDevice === 'switch'
                    ? 'Uses MAC address tables (CAM tables) to forward Ethernet frames directly to specific switch ports within the local data center LAN.'
                    : selectedDevice === 'modem'
                    ? 'Modulates digital binary data into analog optical/radio carrier signals for transmission over optical fiber cable or coax.'
                    : selectedDevice === 'firewall'
                    ? 'Inspects TCP state tables and applies Access Control Lists (ACLs) to drop unauthorized incoming probe connections (e.g. blocking ports 22/3389).'
                    : selectedDevice === 'access_point'
                    ? 'Transceives 802.11 radio frequencies to bridge wireless smartphone clients in Kothrud to the wired local area network.'
                    : selectedDevice === 'gateway'
                    ? 'Performs Network Address Translation (NAT) allowing dozens of private RFC 1918 IPs to share a single public routable WAN IP address.'
                    : 'Distributes incoming application HTTP/HTTPS requests across multiple redundant server replicas to prevent overload and ensure zero-downtime failover.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
