// src/simulation/networkSimulation.ts
import { NetworkFaultConfig, NetworkHealthStatus, NetworkMetrics } from '../types/network';
import { deterministicRandom } from '../utils/helpers';

export const DEFAULT_FAULT_CONFIG: NetworkFaultConfig = {
  packetLoss: 0,
  latency: 20,
  congestion: 'Normal',
  mobileSignal: 'Connected',
  offlineServers: [],
  paymentScenario: 'Normal',
};

export function calculateEffectiveLatency(config: NetworkFaultConfig): number {
  let base: number = config.latency;
  switch (config.congestion) {
    case 'Moderate':
      base = Math.round(base * 1.5);
      break;
    case 'High':
      base = Math.round(base * 2.2);
      break;
    case 'Severe':
      base = Math.round(base * 3.5);
      break;
  }
  if (config.mobileSignal === 'Weak Signal') {
    base += 150;
  }
  return base;
}

export function shouldDropPacket(config: NetworkFaultConfig): boolean {
  if (config.packetLoss === 0) return false;
  const rand = deterministicRandom() * 100;
  return rand < config.packetLoss;
}

export function evaluateNetworkHealth(
  config: NetworkFaultConfig,
  metrics?: Partial<NetworkMetrics>
): NetworkHealthStatus {
  // Offline servers
  if (config.offlineServers.length >= 3) return 'Critical';
  if (config.packetLoss >= 25 || config.latency >= 800 || config.congestion === 'Severe') {
    return 'Critical';
  }
  if (
    config.offlineServers.length > 0 ||
    config.packetLoss >= 5 ||
    config.latency >= 100 ||
    config.congestion === 'High' ||
    config.mobileSignal === 'Weak Signal' ||
    config.mobileSignal === 'Disconnected'
  ) {
    return 'Degraded';
  }
  return 'Healthy';
}
