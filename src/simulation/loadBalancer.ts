// src/simulation/loadBalancer.ts
import { ServerMetric, LoadBalancerStrategy } from '../types/network';

export const INITIAL_SERVERS: ServerMetric[] = [
  {
    id: 'node-server-1',
    name: 'Application Server 1 (Primary)',
    ip: '10.0.4.11',
    isHealthy: true,
    isPrimary: true,
    activeRequests: 4,
    totalRequests: 42,
    cpuUtilization: 32,
    latencyMs: 24,
    requestHistory: [10, 14, 18, 22, 28, 35, 42],
  },
  {
    id: 'node-server-2',
    name: 'Application Server 2 (Secondary)',
    ip: '10.0.4.12',
    isHealthy: true,
    isPrimary: false,
    activeRequests: 2,
    totalRequests: 36,
    cpuUtilization: 24,
    latencyMs: 22,
    requestHistory: [8, 12, 16, 20, 26, 31, 36],
  },
  {
    id: 'node-server-3',
    name: 'Application Server 3 (Burst Replica)',
    ip: '10.0.4.13',
    isHealthy: true,
    isPrimary: false,
    activeRequests: 1,
    totalRequests: 28,
    cpuUtilization: 14,
    latencyMs: 20,
    requestHistory: [5, 9, 13, 17, 21, 24, 28],
  },
];

export const LOAD_BALANCING_STRATEGIES: LoadBalancerStrategy[] = [
  {
    type: 'round_robin',
    label: 'Round Robin',
    description: 'Sequentially distributes incoming client requests across all online servers in a cyclic queue.',
  },
  {
    type: 'least_connections',
    label: 'Least Connections',
    description: 'Directs the new connection to the healthy server instance currently handling the fewest active concurrent requests.',
  },
  {
    type: 'least_response_time',
    label: 'Simulated Least Response Time',
    description: 'Routes traffic to the healthy server instance demonstrating lowest latency and CPU utilization.',
  },
];

let roundRobinIndex = 0;

export interface RoutingDecision {
  serverId: string;
  serverName: string;
  strategy: string;
  reason: string;
  success: boolean;
}

export function selectServer(
  servers: ServerMetric[],
  strategyType: 'round_robin' | 'least_connections' | 'least_response_time',
  offlineServers: string[]
): RoutingDecision {
  // Filter servers that are healthy and not in offline list
  const healthyServers = servers.filter(
    (s) => s.isHealthy && !offlineServers.includes(s.id)
  );

  if (healthyServers.length === 0) {
    return {
      serverId: '',
      serverName: 'None Available',
      strategy: strategyType,
      reason: 'CRITICAL FAILURE: 503 Service Unavailable. All application servers are offline or unresponsive to health probes.',
      success: false,
    };
  }

  if (strategyType === 'round_robin') {
    roundRobinIndex = roundRobinIndex % healthyServers.length;
    const selected = healthyServers[roundRobinIndex];
    roundRobinIndex = (roundRobinIndex + 1) % healthyServers.length;
    return {
      serverId: selected.id,
      serverName: selected.name,
      strategy: 'Round Robin',
      reason: `Assigned sequentially to ${selected.name} (cyclic slot ${roundRobinIndex} of ${healthyServers.length} healthy replicas).`,
      success: true,
    };
  }

  if (strategyType === 'least_connections') {
    // Sort by activeRequests ascending
    const sorted = [...healthyServers].sort((a, b) => a.activeRequests - b.activeRequests);
    const selected = sorted[0];
    return {
      serverId: selected.id,
      serverName: selected.name,
      strategy: 'Least Connections',
      reason: `Assigned to ${selected.name} as it has the lowest active concurrent connection count (${selected.activeRequests} active vs others).`,
      success: true,
    };
  }

  // least_response_time
  const sorted = [...healthyServers].sort(
    (a, b) => a.latencyMs + a.cpuUtilization * 0.5 - (b.latencyMs + b.cpuUtilization * 0.5)
  );
  const selected = sorted[0];
  return {
    serverId: selected.id,
    serverName: selected.name,
    strategy: 'Least Response Time',
    reason: `Assigned to ${selected.name} based on lowest composite metric (Latency: ${selected.latencyMs}ms, CPU: ${selected.cpuUtilization}%).`,
    success: true,
  };
}
