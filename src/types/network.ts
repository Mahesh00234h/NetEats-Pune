// src/types/network.ts

export type ProtocolType = 'TCP' | 'UDP' | 'HTTPS' | 'DNS' | 'DHCP' | 'WebSocket';

export type PacketState =
  | 'Created'
  | 'Queued'
  | 'In Transit'
  | 'Delivered'
  | 'Acknowledged'
  | 'Lost'
  | 'Retransmitting'
  | 'Failed';

export interface SimulatedPacket {
  id: string;
  sourceId: string;
  sourceName: string;
  sourceIP: string;
  destId: string;
  destName: string;
  destIP: string;
  protocol: ProtocolType;
  payload: string;
  sequenceNumber: number;
  ackNumber?: number;
  isAck: boolean;
  attempts: number;
  maxAttempts: number;
  latencyMs: number;
  state: PacketState;
  timestamp: string;
  route: string[]; // Node IDs
  currentStepIndex: number;
  orderId?: string;
}

export type NetworkHealthStatus = 'Healthy' | 'Degraded' | 'Critical';

export type PacketLossLevel = 0 | 5 | 10 | 25; // percentage
export type LatencyLevel = 20 | 100 | 300 | 800; // ms
export type CongestionLevel = 'Normal' | 'Moderate' | 'High' | 'Severe';
export type MobileSignalLevel = 'Connected' | 'Weak Signal' | 'Disconnected' | 'Reconnected';
export type PaymentFailureScenario = 'Normal' | 'Delayed Confirmation' | 'Failed Request' | 'Success Timeout';

export interface NetworkFaultConfig {
  packetLoss: PacketLossLevel;
  latency: LatencyLevel;
  congestion: CongestionLevel;
  mobileSignal: MobileSignalLevel;
  offlineServers: string[]; // e.g. ['server-1']
  paymentScenario: PaymentFailureScenario;
}

export interface NetworkDeviceNode {
  id: string;
  name: string;
  type:
    | 'customer'
    | 'access_point'
    | 'dns'
    | 'router'
    | 'firewall'
    | 'load_balancer'
    | 'server'
    | 'database'
    | 'payment_gateway'
    | 'maps'
    | 'restaurant'
    | 'delivery';
  ip: string;
  mac: string;
  status: 'online' | 'degraded' | 'offline';
  role: string;
  protocols: ProtocolType[];
  connections: string[]; // target node IDs
  position: { x: number; y: number };
  cpuUsage?: number;
  activeRequests?: number;
  latencyMs?: number;
}

export interface LoadBalancerStrategy {
  type: 'round_robin' | 'least_connections' | 'least_response_time';
  label: string;
  description: string;
}

export interface ServerMetric {
  id: string;
  name: string;
  ip: string;
  isHealthy: boolean;
  isPrimary: boolean;
  activeRequests: number;
  totalRequests: number;
  cpuUtilization: number; // 0 - 100
  latencyMs: number;
  requestHistory: number[];
}

export interface NetworkMetrics {
  averageLatencyMs: number;
  packetLossRate: number; // percentage
  deliverySuccessRate: number; // percentage
  totalPacketsSent: number;
  totalPacketsDelivered: number;
  totalPacketsDropped: number;
  totalRetransmissions: number;
  activeConnections: number;
  overallStatus: NetworkHealthStatus;
  requestRatePerSec: number;
  errorRate: number;
}
