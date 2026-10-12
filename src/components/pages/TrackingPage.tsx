// src/components/pages/TrackingPage.tsx
import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Bike,
  Wifi,
  WifiOff,
  Navigation,
  RefreshCw,
  Clock,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { useSimulation } from '../../simulation/simulationContext';
import { PUNE_DELIVERY_ROUTE_BANER_TO_KOTHRUD } from '../../simulation/trackingSimulator';

export const TrackingPage: React.FC = () => {
  const {
    deliveryPartner,
    partnerRouteIndex,
    advancePartnerLocation,
    flushQueuedGPSUpdates,
    faultConfig,
    updateFault,
  } = useSimulation();

  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);

  // Auto-play interval
  useEffect(() => {
    let timer: any;
    if (isAutoPlaying) {
      timer = setInterval(() => {
        advancePartnerLocation();
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [isAutoPlaying, advancePartnerLocation]);

  const currentWaypoint = PUNE_DELIVERY_ROUTE_BANER_TO_KOTHRUD[partnerRouteIndex];
  const isDisconnected = faultConfig.mobileSignal === 'Disconnected';
  const isWeak = faultConfig.mobileSignal === 'Weak Signal';

  // Major Pune Landmark Hubs for the SVG Map
  const puneLandmarks = [
    { name: 'Hinjawadi IT Park', x: 75, y: 22, type: 'tech' },
    { name: 'Wakad Bridge', x: 60, y: 30, type: 'junction' },
    { name: 'Baner (Restaurant)', x: 42, y: 35, type: 'restaurant' },
    { name: 'Pune University Circle', x: 45, y: 56, type: 'junction' },
    { name: 'Shivajinagar Station', x: 50, y: 70, type: 'city' },
    { name: 'Kothrud (Customer)', x: 25, y: 65, type: 'customer' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-100 sm:text-2xl">
              Real-Time Pune Delivery Tracking & GPS Telemetry
            </h1>
            <span className="rounded-md border border-cyan-500/30 bg-cyan-950/40 px-2 py-0.5 text-xs font-semibold text-cyan-300">
              Section 14 • Spatial Telemetry & Mobile IP Lab
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tracking rider Ramesh Pawar along Baner High Street ➔ University Flyover ➔ Paud Road ➔ Kothrud.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold border transition ${
              isAutoPlaying
                ? 'border-amber-500 bg-amber-950/40 text-amber-300'
                : 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300 hover:bg-cyan-900/40'
            }`}
          >
            {isAutoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isAutoPlaying ? 'Pause Telemetry' : 'Auto Stream GPS'}</span>
          </button>

          <button
            onClick={advancePartnerLocation}
            className="flex items-center gap-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-3.5 py-2 text-xs font-bold text-slate-950 transition shadow-md shadow-cyan-500/20"
          >
            <Navigation className="h-4 w-4" />
            <span>Next GPS Ping</span>
          </button>
        </div>
      </div>

      {/* Connectivity Alert Banner */}
      {isDisconnected && (
        <div className="rounded-xl border border-rose-500/50 bg-rose-950/30 p-4 text-xs text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <WifiOff className="h-5 w-5 text-rose-400 flex-shrink-0 animate-pulse" />
            <div>
              <span className="font-bold">Cellular 5G Signal Severed: Rider in RF Dead Zone</span>
              <p className="text-[11px] text-rose-300/80 mt-0.5">
                Location updates are paused. {deliveryPartner.queuedUpdatesCount} GPS telemetry points buffered in local SQLite store.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              updateFault('mobileSignal', 'Connected');
              flushQueuedGPSUpdates();
            }}
            className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 transition"
          >
            Reconnect 5G & Sync Queue
          </button>
        </div>
      )}

      {/* Main Grid: Interactive Map + Rider Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Custom SVG Map of Pune (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-950 p-4 relative overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-bold text-slate-200 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-cyan-400" />
              Pune Metropolitan Arterial Delivery Map
            </span>
            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
              <span>Lat: 18.5590° N</span>
              <span>Lng: 73.7868° E</span>
            </div>
          </div>

          {/* SVG Map Canvas */}
          <div className="relative w-full h-[460px] rounded-xl bg-[#030914] border border-slate-900 overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                {/* Road styling */}
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#0f172a" strokeWidth="0.5" />
                </pattern>
                <linearGradient id="routeGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>

              {/* Grid Background */}
              <rect width="100" height="100" fill="url(#grid)" />

              {/* Simulated Pune River / Mula-Mutha */}
              <path
                d="M 15 20 Q 40 45 55 50 T 95 65"
                fill="none"
                stroke="#0369a1"
                strokeWidth="2.5"
                strokeOpacity="0.3"
              />

              {/* Arterial Road Network (Bypass / Karve Rd / Baner Rd) */}
              <path
                d="M 75 22 L 60 30 L 42 35 L 45 56 L 25 65 L 50 70"
                fill="none"
                stroke="#1e293b"
                strokeWidth="1.2"
                strokeDasharray="2 2"
              />

              {/* Active Delivery Route Polyline */}
              <polyline
                points={PUNE_DELIVERY_ROUTE_BANER_TO_KOTHRUD.map((w) => `${w.x},${w.y}`).join(' ')}
                fill="none"
                stroke="url(#routeGradient)"
                strokeWidth="1.5"
                strokeDasharray="3 2"
                className="packet-flow-edge"
              />

              {/* Waypoints along route */}
              {PUNE_DELIVERY_ROUTE_BANER_TO_KOTHRUD.map((wp, idx) => (
                <circle
                  key={idx}
                  cx={wp.x}
                  cy={wp.y}
                  r="1.2"
                  fill="#0284c7"
                  stroke="#38bdf8"
                  strokeWidth="0.5"
                />
              ))}

              {/* Landmark Hubs */}
              {puneLandmarks.map((lm) => (
                <g key={lm.name} transform={`translate(${lm.x}, ${lm.y})`}>
                  <circle
                    r={lm.type === 'customer' || lm.type === 'restaurant' ? '2.5' : '1.8'}
                    fill={lm.type === 'restaurant' ? '#f59e0b' : lm.type === 'customer' ? '#10b981' : '#334155'}
                    stroke="#0f172a"
                    strokeWidth="0.8"
                  />
                  <text
                    x="3"
                    y="1"
                    fontSize="2.5"
                    fill={lm.type === 'restaurant' ? '#fbbf24' : lm.type === 'customer' ? '#34d399' : '#94a3b8'}
                    fontWeight="bold"
                  >
                    {lm.name}
                  </text>
                </g>
              ))}

              {/* Dynamic Animated Rider Position */}
              <g
                transform={`translate(${deliveryPartner.currentCoords.x}, ${deliveryPartner.currentCoords.y})`}
                className="transition-all duration-700 ease-out"
              >
                <circle
                  r="4"
                  fill={isDisconnected ? 'rgba(244, 63, 94, 0.3)' : 'rgba(6, 182, 212, 0.4)'}
                  className="animate-ping"
                />
                <circle
                  r="2.5"
                  fill={isDisconnected ? '#f43f5e' : '#06b6d4'}
                  stroke="#ffffff"
                  strokeWidth="0.6"
                />
                <text x="3.5" y="-1.5" fontSize="2.8" fill="#38bdf8" fontWeight="bold">
                  🏍 Ramesh (Rider)
                </text>
              </g>
            </svg>

            {/* Bottom floating legend */}
            <div className="absolute bottom-3 right-3 bg-slate-950/90 border border-slate-800 rounded-lg p-2 text-[10px] text-slate-400 space-y-1 backdrop-blur-md">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400" /> Restaurant: Baner
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> Destination: Kothrud
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-cyan-400" /> Rider Telemetry: Active
              </div>
            </div>
          </div>
        </div>

        {/* Rider Status & Mobile Connectivity Panel (1 Col) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Bike className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-100">Rider Telemetry Profile</h3>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isDisconnected
                  ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                  : isWeak
                  ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {faultConfig.mobileSignal.toUpperCase()}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px]">Assigned Rider:</span>
              <span className="font-semibold text-slate-200">{deliveryPartner.name}</span>
              <span className="text-[11px] text-slate-400 block">{deliveryPartner.vehicle}</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px]">Current Waypoint:</span>
              <span className="font-semibold text-cyan-300">{currentWaypoint?.label}</span>
              <span className="text-[11px] text-slate-400 block">Road: {currentWaypoint?.roadName}</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px]">Mobile IP & Radio Link:</span>
              <span className="font-mono text-slate-200">{deliveryPartner.ipAddress} (Jio 5G NR)</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px]">Local Device Offline Queue:</span>
              <span className="font-mono font-bold text-amber-400">
                {deliveryPartner.queuedUpdatesCount} buffered pings
              </span>
            </div>
          </div>

          {/* Signal Controls */}
          <div className="border-t border-slate-800 pt-4">
            <span className="text-[11px] font-semibold text-slate-400 block mb-2">
              Simulate Mobile Signal Change:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {(['Connected', 'Weak Signal', 'Disconnected', 'Reconnected'] as const).map((sig) => (
                <button
                  key={sig}
                  onClick={() => updateFault('mobileSignal', sig)}
                  className={`rounded-lg py-1.5 px-2 text-xs font-semibold border transition text-center ${
                    faultConfig.mobileSignal === sig
                      ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {sig}
                </button>
              ))}
            </div>
          </div>

          {/* Academic Mobile IP Explanation */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-[11px] text-slate-400 space-y-1">
            <div className="font-bold text-slate-300 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-cyan-400" />
              Mobile Disconnection Handling
            </div>
            <p className="leading-relaxed text-slate-500 text-[10px]">
              Mobile telemetry uses UDP datagrams for lightweight continuous updates. When signal is lost, the client
              caches locations in an offline buffer. When 5G connectivity is restored, the buffer flushes via a
              persistent WebSocket frame to prevent data loss.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
