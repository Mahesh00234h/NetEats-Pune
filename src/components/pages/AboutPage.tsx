// src/components/pages/AboutPage.tsx
import React from 'react';
import {
  GraduationCap,
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  Server,
  Zap,
  Cpu,
  Wifi,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const caseStudyMappings = [
    {
      problem: 'Packet Loss on Congested Wi-Fi & 4G/5G Links',
      solution: 'Layer 4 TCP Reliable Transport & Bounded Retransmission',
      description: 'Selective acknowledgments (SACK) and sequence tracking retransmit dropped food order requests without corruption.',
    },
    {
      problem: 'Application Server Outages & Dinner Hour Spikes',
      solution: 'Layer 7 NGINX Load Balancing & Automatic Server Failover',
      description: 'Reverse proxy health probes detect unresponsive replicas and seamlessly divert traffic to healthy server instances.',
    },
    {
      problem: 'Metropolitan Network Congestion in High-Density Pune Hubs',
      solution: 'Continuous QoS Observability & Round-Trip Telemetry Monitoring',
      description: 'Synthetic probes monitor jitter, error rates, and bufferbloat to evaluate network health states (Healthy / Degraded / Critical).',
    },
    {
      problem: 'Mobile Rider Cell Dropouts & Cellular Shadow Zones',
      solution: 'Edge SQLite Store-and-Forward Buffering & WebSocket Batch Sync',
      description: 'Delivery mobile app caches GPS datagrams locally during disconnection and synchronizes them upon 5G reconnect.',
    },
    {
      problem: 'Payment Gateway Webhook Delays & Duplicate Debits',
      solution: 'UUID Idempotency Protection & Two-Phase Transaction Reconciliation',
      description: 'Order servers reconcile transactions without double-charging the customer when confirmation responses timeout.',
    },
    {
      problem: 'Public Network Sniffing & Unauthorized Access',
      solution: 'TLS 1.3 Encryption, Stateful Packet Inspection (SPI) & RBAC',
      description: 'Stateful firewall blocks unauthorized ports, while JWT and TLS 1.3 encrypt sensitive customer data end-to-end.',
    },
  ];

  const presentationScript = [
    {
      minute: 'Minute 1: Architecture & Topology',
      action: 'Open Module 3 (Network Topology)',
      script: 'Present the 14-node architecture spanning Customer Wi-Fi in Kothrud, Pune ISP edge routers, stateful firewall, NGINX load balancer, and 3-node app server cluster.',
    },
    {
      minute: 'Minute 2: Food Checkout & Packet Simulator',
      action: 'Open Module 2 & Module 4',
      script: 'Place an order for Misal Pav. Trace the 18-step network journey. Switch to Packet Simulator, inject 10% packet loss, and demonstrate TCP retransmission vs UDP loss.',
    },
    {
      minute: 'Minute 3: High Availability Failover & Defense',
      action: 'Open Module 6 & Module 9',
      script: 'Simulate the abrupt failure of Server 1. Demonstrate that healthy servers continue serving requests. Conclude with transaction reconciliation and RBAC security defense.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 p-6 sm:p-8 backdrop-blur-md shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-cyan-500/20 border border-cyan-500/40 px-2.5 py-0.5 text-xs font-bold text-cyan-300">
                Third-Year Computer Engineering • Academic Project
              </span>
              <span className="rounded-md bg-slate-800 px-2.5 py-0.5 text-xs font-mono text-slate-300">
                AY 2026–2027
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
              NetEats <span className="text-cyan-400">Pune</span>: Reliable Communication Simulator
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              An Interactive Computer Networks Case Study on High Availability, Packet Resilience, Fault Tolerance,
              and Secure Protocol Design for Online Food Delivery in Pune.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 text-xs space-y-1 sm:text-right">
            <div className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Academic Institution</div>
            <div className="font-bold text-slate-100 text-sm">TSSM's Bhivarabai Sawant College of Engineering & Research</div>
            <div className="text-cyan-400 font-medium">Department of Computer Engineering, Pune</div>
            <div className="text-slate-500 text-[11px]">Subject: Computer Networks (CN)</div>
          </div>
        </div>
      </div>

      {/* Case Study Mapping Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-cyan-400" />
            Case Study: Networking Problem Statements & Implemented Engineering Solutions
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Every simulation module is strictly linked to core Computer Networks syllabus competencies:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {caseStudyMappings.map((item, idx) => (
            <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-rose-300">Issue: {item.problem}</span>
                <span className="h-5 w-5 flex-shrink-0 rounded-full bg-slate-800 text-[10px] font-bold text-slate-400 flex items-center justify-center">
                  #{idx + 1}
                </span>
              </div>
              <div className="text-xs font-bold text-emerald-400">Solution: {item.solution}</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3-Minute Classroom Presentation Sequence Guide (Section 22) */}
      <div className="rounded-xl border border-cyan-500/40 bg-slate-900/80 p-6 space-y-4 shadow-xl shadow-cyan-950/20">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-cyan-400" />
            Suggested 3-Minute Faculty Presentation Sequence (Viva / Evaluation Script)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Follow this chronological walkthrough to demonstrate all required CN concepts in front of professors:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {presentationScript.map((ps, idx) => (
            <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-400 text-xs font-mono">{ps.minute}</span>
                <span className="rounded bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 text-[10px] text-cyan-300 font-semibold">
                  Step {idx + 1}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-200">{ps.action}</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{ps.script}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Footnote & Integrity Declaration */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-xs text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-cyan-400 flex-shrink-0" />
          <span>
            Designed strictly for educational simulation and academic demonstration at TSSM's BSCOER, Pune.
          </span>
        </div>
        <div className="font-mono text-[11px] text-slate-500">NetEats Pune Simulator v1.0.0</div>
      </div>
    </div>
  );
};
