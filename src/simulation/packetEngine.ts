// src/simulation/packetEngine.ts
import { ProtocolType, SimulatedPacket, PacketState, NetworkFaultConfig } from '../types/network';
import { generateId, formatTimestamp, sleep } from '../utils/helpers';
import { calculateEffectiveLatency, shouldDropPacket } from './networkSimulation';
import { computeNetworkRoute } from './routingEngine';
import { DEFAULT_NETWORK_NODES } from './defaultData';

export interface PacketTransmissionStep {
  step: number;
  label: string;
  packet: SimulatedPacket;
  detail: string;
  isLoss: boolean;
  isRetransmission: boolean;
  timestamp: string;
}

export interface PacketSimulationRunResult {
  success: boolean;
  protocol: ProtocolType;
  steps: PacketTransmissionStep[];
  totalPackets: number;
  deliveredCount: number;
  droppedCount: number;
  retransmissionCount: number;
  acknowledgmentsCount: number;
  totalTimeMs: number;
  packets: SimulatedPacket[];
}

export async function simulatePacketTransmission(
  sourceId: string,
  destId: string,
  protocol: ProtocolType,
  payload: string,
  faultConfig: NetworkFaultConfig,
  assignedServerId = 'node-server-1',
  onStep?: (step: PacketTransmissionStep) => void
): Promise<PacketSimulationRunResult> {
  const steps: PacketTransmissionStep[] = [];
  const packets: SimulatedPacket[] = [];
  const route = computeNetworkRoute(sourceId, destId, assignedServerId);
  const latency = calculateEffectiveLatency(faultConfig);
  const startTime = Date.now();

  const sourceNode = DEFAULT_NETWORK_NODES.find((n) => n.id === sourceId) || DEFAULT_NETWORK_NODES[0];
  const destNode = DEFAULT_NETWORK_NODES.find((n) => n.id === destId) || DEFAULT_NETWORK_NODES[12];

  let stepCounter = 1;
  let deliveredCount = 0;
  let droppedCount = 0;
  let retransmissionCount = 0;
  let acknowledgmentsCount = 0;

  const emitStep = (label: string, pkt: SimulatedPacket, detail: string, isLoss = false, isRetrans = false) => {
    const stepRecord: PacketTransmissionStep = {
      step: stepCounter++,
      label,
      packet: { ...pkt },
      detail,
      isLoss,
      isRetransmission: isRetrans,
      timestamp: formatTimestamp(),
    };
    steps.push(stepRecord);
    if (onStep) onStep(stepRecord);
  };

  // 1. Data Prep
  const basePkt: SimulatedPacket = {
    id: generateId('PKT'),
    sourceId: sourceNode.id,
    sourceName: sourceNode.name,
    sourceIP: sourceNode.ip,
    destId: destNode.id,
    destName: destNode.name,
    destIP: destNode.ip,
    protocol,
    payload,
    sequenceNumber: 1001,
    isAck: false,
    attempts: 1,
    maxAttempts: 3,
    latencyMs: latency,
    state: 'Created',
    timestamp: formatTimestamp(),
    route,
    currentStepIndex: 0,
  };
  packets.push(basePkt);
  emitStep('Application Data Preparation', basePkt, `Application buffer formulated. Segment payload: "${payload}".`);

  // 2. DNS Resolution if protocol is HTTPS or TCP to domain
  if (protocol === 'HTTPS' || protocol === 'TCP') {
    emitStep(
      'DNS Resolution (RFC 1035)',
      basePkt,
      `Resolving api.neteats.pune via DNS Resolver (10.0.0.53). A Record returned: 10.0.3.10 (Load Balancer VIP).`
    );
  }

  // 3. Handshake for TCP / HTTPS
  if (protocol === 'TCP' || protocol === 'HTTPS' || protocol === 'WebSocket') {
    const synPkt: SimulatedPacket = {
      ...basePkt,
      id: generateId('SYN'),
      payload: 'TCP [SYN] Seq=0 Win=64240 MSS=1460',
      sequenceNumber: 0,
      state: 'In Transit',
      timestamp: formatTimestamp(),
    };
    emitStep('TCP 3-Way Handshake: SYN', synPkt, `Client initiates TCP socket connection to ${destNode.ip}:443 with SYN flag set.`);

    const synAckPkt: SimulatedPacket = {
      ...synPkt,
      id: generateId('SYN-ACK'),
      sourceId: destNode.id,
      sourceName: destNode.name,
      sourceIP: destNode.ip,
      destId: sourceNode.id,
      destName: sourceNode.name,
      destIP: sourceNode.ip,
      payload: 'TCP [SYN, ACK] Seq=0 Ack=1 Win=65160',
      sequenceNumber: 0,
      ackNumber: 1,
      isAck: true,
      state: 'Acknowledged',
      timestamp: formatTimestamp(),
    };
    emitStep('TCP 3-Way Handshake: SYN-ACK', synAckPkt, `Server returns SYN-ACK confirming socket buffer allocation.`);

    const ackPkt: SimulatedPacket = {
      ...synAckPkt,
      id: generateId('ACK'),
      sourceId: sourceNode.id,
      sourceName: sourceNode.name,
      sourceIP: sourceNode.ip,
      destId: destNode.id,
      destName: destNode.name,
      destIP: destNode.ip,
      payload: 'TCP [ACK] Seq=1 Ack=1',
      sequenceNumber: 1,
      ackNumber: 1,
      isAck: true,
      state: 'Delivered',
      timestamp: formatTimestamp(),
    };
    emitStep('TCP 3-Way Handshake: ESTABLISHED', ackPkt, `Client acknowledges. Full-Duplex TCP connection ESTABLISHED.`);
    acknowledgmentsCount++;
  }

  // 4. Transmission of Data Segments
  const segments = [
    { seq: 101, payload: `[Part 1] ${payload.slice(0, Math.ceil(payload.length / 2))}` },
    { seq: 102, payload: `[Part 2] ${payload.slice(Math.ceil(payload.length / 2))}` },
  ];

  for (const seg of segments) {
    let delivered = false;
    let attempt = 1;
    const maxAttempts = protocol === 'UDP' ? 1 : 3;

    while (!delivered && attempt <= maxAttempts) {
      const dataPkt: SimulatedPacket = {
        ...basePkt,
        id: generateId('DAT'),
        payload: `${seg.payload} (Len=${seg.payload.length})`,
        sequenceNumber: seg.seq,
        attempts: attempt,
        maxAttempts,
        state: 'In Transit',
        timestamp: formatTimestamp(),
      };
      packets.push(dataPkt);

      const isRetrans = attempt > 1;
      emitStep(
        isRetrans ? `Packet Retransmission (Attempt ${attempt}/${maxAttempts})` : `IP Forwarding Segment Seq=${seg.seq}`,
        dataPkt,
        `Forwarding packet via route: [${route.map((r) => r.replace('node-', '')).join(' -> ')}]. Transport: ${protocol}.`,
        false,
        isRetrans
      );

      // Check packet drop
      const dropped = shouldDropPacket(faultConfig);

      if (dropped) {
        droppedCount++;
        dataPkt.state = 'Lost';
        emitStep(
          `Packet Dropped in Transit (Loss Rate: ${faultConfig.packetLoss}%)`,
          dataPkt,
          `Packet Seq=${seg.seq} lost at congested hop or dropped by firewall buffer queue.`,
          true,
          false
        );

        if (protocol === 'UDP') {
          // UDP does not retransmit!
          dataPkt.state = 'Failed';
          emitStep(
            'UDP Unreliable Datagram: No Retransmission',
            dataPkt,
            `UDP is connectionless with no delivery guarantee. Lost datagram is permanently dropped without ACK or retry.`,
            true,
            false
          );
          break;
        } else {
          // TCP: Retransmit
          retransmissionCount++;
          attempt++;
          if (attempt > maxAttempts) {
            dataPkt.state = 'Failed';
            emitStep(
              'TCP Max Retries Exceeded (Socket Timeout)',
              dataPkt,
              `TCP connection timed out after ${maxAttempts} transmission attempts. Destination unreachable.`,
              true,
              false
            );
            break;
          }
        }
      } else {
        // Delivered!
        delivered = true;
        deliveredCount++;
        dataPkt.state = 'Delivered';
        emitStep(
          `Segment Delivered Seq=${seg.seq}`,
          dataPkt,
          `Receiver network buffer received segment. Checksum verified.`
        );

        if (protocol !== 'UDP') {
          // Send ACK
          const ackResp: SimulatedPacket = {
            ...dataPkt,
            id: generateId('ACK'),
            sourceId: destNode.id,
            sourceName: destNode.name,
            sourceIP: destNode.ip,
            destId: sourceNode.id,
            destName: sourceNode.name,
            destIP: sourceNode.ip,
            payload: `TCP [ACK] Ack=${seg.seq + 1}`,
            sequenceNumber: 1,
            ackNumber: seg.seq + 1,
            isAck: true,
            state: 'Acknowledged',
            timestamp: formatTimestamp(),
          };
          acknowledgmentsCount++;
          emitStep(
            `Receiver ACK Sent (Ack=${seg.seq + 1})`,
            ackResp,
            `Cumulative acknowledgment returned to sender.`
          );
        }
      }
    }
  }

  const finalSuccess = deliveredCount > 0 && (protocol === 'UDP' || droppedCount === 0 || deliveredCount === segments.length);
  const totalTime = Date.now() - startTime + latency;

  return {
    success: finalSuccess,
    protocol,
    steps,
    totalPackets: packets.length,
    deliveredCount,
    droppedCount,
    retransmissionCount,
    acknowledgmentsCount,
    totalTimeMs: totalTime,
    packets,
  };
}
