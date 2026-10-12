// src/components/layout/Navbar.tsx
import React from 'react';
import {
  Activity,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Tv,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react';
import { useSimulation } from '../../simulation/simulationContext';

interface NavbarProps {
  onOpenFaults: () => void;
  onOpenScenarios: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenFaults, onOpenScenarios }) => {
  const {
    metrics,
    faultConfig,
    presentationMode,
    setPresentationMode,
    resetSimulation,
  } = useSimulation();

  const getStatusBadge = () => {
    switch (metrics.overallStatus) {
      case 'Healthy':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Healthy Network
          </span>
        );
      case 'Degraded':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-950/40 px-3 py-1 text-xs font-semibold text-amber-300">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            Degraded Performance
          </span>
        );
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-950/40 px-3 py-1 text-xs font-semibold text-rose-300">
            <span className="h-2 w-2 rounded-full bg-rose-400 animate-ping" />
            Critical Network State
          </span>
        );
    }
  };

  const activeFaultCount =
    (faultConfig.packetLoss > 0 ? 1 : 0) +
    (faultConfig.latency > 20 ? 1 : 0) +
    (faultConfig.congestion !== 'Normal' ? 1 : 0) +
    (faultConfig.mobileSignal !== 'Connected' ? 1 : 0) +
    faultConfig.offlineServers.length +
    (faultConfig.paymentScenario !== 'Normal' ? 1 : 0);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-4 py-3 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Academic Info */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/20 text-slate-950">
            <Activity className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-slate-100 sm:text-lg">
                NetEats <span className="text-cyan-400">Pune</span>
              </h1>
              <span className="hidden rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-300 sm:inline-block">
                CN SIMULATOR
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden md:block">
              Reliable Communication for Pune Online Food Delivery • TSSM's BSCOER (2026–27)
            </p>
          </div>
        </div>

        {/* Global Live Indicators */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden lg:flex items-center gap-3 rounded-lg border border-slate-800/80 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Latency:</span>
              <span className="font-mono font-semibold text-cyan-400">{metrics.averageLatencyMs}ms</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Loss:</span>
              <span className={`font-mono font-semibold ${metrics.packetLossRate > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {metrics.packetLossRate}%
              </span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Signal:</span>
              <span className="font-semibold text-slate-200 flex items-center gap-1">
                {faultConfig.mobileSignal === 'Connected' ? (
                  <Wifi className="h-3 w-3 text-emerald-400" />
                ) : (
                  <WifiOff className="h-3 w-3 text-rose-400" />
                )}
                {faultConfig.mobileSignal}
              </span>
            </div>
          </div>

          {getStatusBadge()}

          {/* Quick Scenarios Button */}
          <button
            onClick={onOpenScenarios}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/30 px-2.5 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/40 transition shadow-sm shadow-cyan-950/30"
            title="Launch academic presentation scenarios"
          >
            <Zap className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Demo Scenarios</span>
          </button>

          {/* Fault Injection Button */}
          <button
            onClick={onOpenFaults}
            className="relative flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-950/30 px-2.5 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-900/40 transition"
            title="Network Fault Injection Panel"
          >
            <Sliders className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Fault Controls</span>
            {activeFaultCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-slate-950">
                {activeFaultCount}
              </span>
            )}
          </button>

          {/* Presentation Mode Toggle */}
          <button
            onClick={() => setPresentationMode(!presentationMode)}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
              presentationMode
                ? 'border-indigo-500 bg-indigo-950/70 text-indigo-200'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle high-contrast projector presentation mode"
          >
            <Tv className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Presentation</span>
          </button>

          {/* Reset Demo Button */}
          <button
            onClick={resetSimulation}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:bg-slate-800 transition"
            title="Reset all simulation parameters, logs and orders"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
