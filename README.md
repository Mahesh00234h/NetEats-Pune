# NetEats-Pune | Reliable Communication Simulator

> **An Interactive Computer Networks Case Study & Operations Dashboard**  
> **Academic Project — Third-Year Computer Engineering (AY 2026–2027)**  
> **Institution:** TSSM’s Bhivarabai Sawant College of Engineering & Research (BSCOER), Pune  
> **Subject:** Computer Networks (CN)

---

## 📌 Project Overview

**NetEats Pune** is an interactive, browser-based Computer Networks simulator and working food delivery prototype. Rather than just a static restaurant template, this application demonstrates real networking principles across Layers 1 through 7 of the OSI/TCP-IP reference models in the context of an online food delivery platform serving Pune neighborhoods (Kothrud, Baner, Hinjawadi, Wakad, Shivajinagar).

Every user action directly triggers deterministic network simulations: packet fragmentation, DNS lookups, TCP 3-way handshakes, routing across network hops, load balancing, server failover, GPS telemetry streaming, and security evaluations.

---

## 🚀 Key Modules & Features

1. **Operations Dashboard:** Live network health metrics, round-trip time (RTT), packet delivery rates, server load distribution, and deterministic event stream.
2. **Interactive Food Ordering Flow:** Multi-role workflow for Customer, Restaurant Kitchen POS, Delivery Partner Mobile (5G), and Network Administrator.
3. **18-Step Order Journey:** Step-by-step visual protocol pipeline from customer socket initialization through DNS, edge routing, SPI firewall, NGINX load balancer, PostgreSQL transactional commits, and TCP teardown (`FIN-ACK`).
4. **Interactive 14-Node Network Topology:** Interactive React Flow diagram with private RFC 1918 addressing, node inspectors, live route tracing, and node power failure toggles.
5. **Packet Simulator:** 9-step transmission pipeline showing sequence numbers, ACKs, hop latency, and bounded exponential retransmission upon packet drops.
6. **TCP vs. UDP Benchmark Lab:** Side-by-side comparative experiments showing reliable ordered delivery vs low-overhead datagram streaming under identical loss conditions.
7. **Layer 7 NGINX Load Balancer:** Round Robin, Least Connections, and Least Response Time routing with real-time CPU utilization metrics.
8. **Server Redundancy & Automatic Failover:** Reverse proxy health probes and zero-downtime traffic diversion when cluster instances crash.
9. **Real-Time Delivery Tracking:** Custom Pune map with arterial roads, GPS waypoints, and cellular disconnection handling with offline buffering.
10. **Network Security Center:** TLS 1.3 encryption, JWT token verification, SPI firewall filtering, and Role-Based Access Control (RBAC 403 Forbidden).
11. **CN Concepts Lab:** 10 academic modules including TCP/IP encapsulation, subnetting, DNS resolution, DHCP DORA handshake, WebSockets, Star topology switch failures, and network device exploration.
12. **Audit Event Logs:** Searchable, category/severity filterable logs with CSV export.
13. **Dynamic Fault Injection:** Real-time controls for packet loss (0–25%), latency (20–800ms), congestion, server outages, mobile dropouts, and payment timeouts.
14. **7 Ready-to-Run Presentation Scenarios:** 1-click evaluation experiments for faculty presentations.

---

## 🛠️ Technology Stack

- **Frontend & Logic:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS (Dark Navy & Slate Operations Palette)
- **Visualizations:** `@xyflow/react` (React Flow), Recharts, Lucide Icons
- **State Management:** React Context API with LocalStorage Persistence
- **Utilities:** `canvas-confetti`, `clsx`, `tailwind-merge`

---

## 💻 Getting Started Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Installation & Run

```bash
# 1. Clone the repository
git clone https://github.com/Mahesh00234h/NetEats-Pune.git
cd NetEats-Pune

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

# 4. Open in browser
# Visit http://localhost:5173
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 🏛️ Academic Citation

- **Project Title:** Reliable Communication for Pune Online Food Delivery
- **Course:** Computer Networks (Third Year B.E. / B.Tech)
- **Department:** Department of Computer Engineering
- **College:** TSSM's Bhivarabai Sawant College of Engineering & Research, Pune
- **Academic Year:** 2026–2027

---

## 📄 License
This project is created for educational and academic presentation purposes.
