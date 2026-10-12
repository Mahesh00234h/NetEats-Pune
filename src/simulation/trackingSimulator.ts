// src/simulation/trackingSimulator.ts
import { PuneLocation } from '../types/order';
import { MobileSignalLevel } from '../types/network';

export interface GPSWaypoint {
  x: number; // percentage on SVG map
  y: number;
  label: string;
  roadName: string;
  area: PuneLocation;
}

export const PUNE_DELIVERY_ROUTE_BANER_TO_KOTHRUD: GPSWaypoint[] = [
  { x: 42, y: 35, label: 'Baner Restaurant (High Street)', roadName: 'Baner Main Road', area: 'Baner' },
  { x: 40, y: 44, label: 'Baner-Pashan Link Road', roadName: 'Pashan Link Rd', area: 'Baner' },
  { x: 36, y: 52, label: 'Pashan Circle', roadName: 'Sus-Pashan Road', area: 'Baner' },
  { x: 38, y: 58, label: 'Pune University Flyover Junction', roadName: 'Ganeshkhind Road', area: 'Shivajinagar' },
  { x: 32, y: 62, label: 'Paud Phata Overbridge', roadName: 'Paud Road', area: 'Kothrud' },
  { x: 28, y: 64, label: 'Karve Statue Chowk', roadName: 'Karve Road', area: 'Kothrud' },
  { x: 25, y: 65, label: 'Customer Residence (Kothrud)', roadName: 'Mayur Colony', area: 'Kothrud' },
];

export interface GPSUpdatePacket {
  id: string;
  partnerId: string;
  coords: { x: number; y: number };
  timestamp: string;
  accuracyMeters: number;
  batteryPercent: number;
  speedKmph: number;
  protocol: 'UDP' | 'WebSocket';
  signalStatus: MobileSignalLevel;
}

export function generateGPSPacket(
  partnerId: string,
  coords: { x: number; y: number },
  signalStatus: MobileSignalLevel,
  seq = 1
): GPSUpdatePacket {
  return {
    id: `GPS-DATAGRAM-${seq}-${Date.now().toString().slice(-4)}`,
    partnerId,
    coords,
    timestamp: new Date().toISOString(),
    accuracyMeters: signalStatus === 'Weak Signal' ? 45 : 4,
    batteryPercent: 88,
    speedKmph: 32,
    protocol: 'UDP', // GPS telemetry typically uses UDP for low-latency datagrams
    signalStatus,
  };
}
