// src/simulation/simulationContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  NetworkDeviceNode,
  NetworkFaultConfig,
  ServerMetric,
  NetworkMetrics,
  ProtocolType,
  SimulatedPacket,
} from '../types/network';
import {
  DeliveryOrder,
  Restaurant,
  CartItem,
  DeliveryPartner,
  OrderStatus,
  OrderJourneyStep,
} from '../types/order';
import { SimulationEvent } from '../types/events';
import {
  DEFAULT_NETWORK_NODES,
  DEFAULT_RESTAURANTS,
  DEFAULT_DELIVERY_PARTNER,
  ORDER_JOURNEY_STEPS_DEFINITION,
} from './defaultData';
import { DEFAULT_FAULT_CONFIG, evaluateNetworkHealth, calculateEffectiveLatency } from './networkSimulation';
import { INITIAL_SERVERS, selectServer, RoutingDecision } from './loadBalancer';
import { processSimulatedPayment } from './paymentSimulator';
import { simulatePacketTransmission, PacketSimulationRunResult } from './packetEngine';
import { PUNE_DELIVERY_ROUTE_BANER_TO_KOTHRUD, generateGPSPacket } from './trackingSimulator';
import { generateId, formatTimestamp, sleep } from '../utils/helpers';

interface SimulationContextType {
  // Faults & Network Config
  faultConfig: NetworkFaultConfig;
  setFaultConfig: React.Dispatch<React.SetStateAction<NetworkFaultConfig>>;
  updateFault: <K extends keyof NetworkFaultConfig>(key: K, value: NetworkFaultConfig[K]) => void;

  // Topology & Nodes
  nodes: NetworkDeviceNode[];
  toggleNodeStatus: (nodeId: string) => void;
  activePacketRoute: string[];
  setActivePacketRoute: (route: string[]) => void;

  // Servers & Load Balancing
  servers: ServerMetric[];
  lbStrategy: 'round_robin' | 'least_connections' | 'least_response_time';
  setLbStrategy: (strategy: 'round_robin' | 'least_connections' | 'least_response_time') => void;
  toggleServerHealth: (serverId: string) => void;
  runLoadBalancerBatch: (count: number) => Promise<RoutingDecision[]>;

  // Orders & Food Delivery Flow
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant;
  setSelectedRestaurant: (r: Restaurant) => void;
  cart: CartItem[];
  addToCart: (item: any) => void;
  updateCartQty: (itemId: string, qty: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  orders: DeliveryOrder[];
  activeOrder: DeliveryOrder | null;
  setActiveOrder: (order: DeliveryOrder | null) => void;
  placeOrder: (paymentMethod: DeliveryOrder['paymentMethod']) => Promise<DeliveryOrder>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  reconcilePayment: (orderId: string) => Promise<void>;

  // Roles
  userRole: 'customer' | 'restaurant' | 'delivery' | 'admin';
  setUserRole: (role: 'customer' | 'restaurant' | 'delivery' | 'admin') => void;

  // Delivery Partner & Tracking
  deliveryPartner: DeliveryPartner;
  partnerRouteIndex: number;
  advancePartnerLocation: () => void;
  flushQueuedGPSUpdates: () => void;

  // Order Journey Step Simulation
  orderJourneySteps: OrderJourneyStep[];
  activeJourneyStepIndex: number;
  runStepByStepJourney: (orderId?: string) => Promise<void>;
  advanceSingleJourneyStep: () => void;
  resetJourney: () => void;

  // Packet Simulator
  lastPacketRun: PacketSimulationRunResult | null;
  isPacketSimulating: boolean;
  runPacketSimulation: (
    sourceId: string,
    destId: string,
    protocol: ProtocolType,
    payload: string
  ) => Promise<PacketSimulationRunResult>;

  // Metrics & Events
  metrics: NetworkMetrics;
  events: SimulationEvent[];
  addEvent: (
    category: SimulationEvent['category'],
    severity: SimulationEvent['severity'],
    source: string,
    description: string,
    details?: string,
    orderId?: string,
    destination?: string
  ) => void;
  clearEvents: () => void;

  // Scenarios & Presentation
  presentationMode: boolean;
  setPresentationMode: React.Dispatch<React.SetStateAction<boolean>>;
  runScenario: (scenarioId: string) => Promise<void>;
  resetSimulation: () => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

const STORAGE_KEY = 'neteats_pune_sim_v1';

export const SimulationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Fault Config
  const [faultConfig, setFaultConfig] = useState<NetworkFaultConfig>(DEFAULT_FAULT_CONFIG);

  // Topology Nodes
  const [nodes, setNodes] = useState<NetworkDeviceNode[]>(DEFAULT_NETWORK_NODES);
  const [activePacketRoute, setActivePacketRoute] = useState<string[]>([]);

  // Servers
  const [servers, setServers] = useState<ServerMetric[]>(INITIAL_SERVERS);
  const [lbStrategy, setLbStrategy] = useState<'round_robin' | 'least_connections' | 'least_response_time'>('round_robin');

  // Food ordering
  const [restaurants] = useState<Restaurant[]>(DEFAULT_RESTAURANTS);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant>(DEFAULT_RESTAURANTS[1]); // Baner Biryani default
  const [cart, setCart] = useState<CartItem[]>([
    { menuItem: DEFAULT_RESTAURANTS[1].menu[0], quantity: 2 },
    { menuItem: DEFAULT_RESTAURANTS[1].menu[3], quantity: 2 },
  ]);
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [activeOrder, setActiveOrder] = useState<DeliveryOrder | null>(null);
  const [userRole, setUserRole] = useState<'customer' | 'restaurant' | 'delivery' | 'admin'>('customer');

  // Delivery tracking
  const [deliveryPartner, setDeliveryPartner] = useState<DeliveryPartner>(DEFAULT_DELIVERY_PARTNER);
  const [partnerRouteIndex, setPartnerRouteIndex] = useState<number>(0);

  // Order Journey Steps
  const [orderJourneySteps, setOrderJourneySteps] = useState<OrderJourneyStep[]>(
    ORDER_JOURNEY_STEPS_DEFINITION.map((s) => ({
      ...s,
      status: 'pending',
      delayMs: 25,
    }))
  );
  const [activeJourneyStepIndex, setActiveJourneyStepIndex] = useState<number>(0);

  // Packet Simulator
  const [lastPacketRun, setLastPacketRun] = useState<PacketSimulationRunResult | null>(null);
  const [isPacketSimulating, setIsPacketSimulating] = useState<boolean>(false);

  // Events & Logs
  const [events, setEvents] = useState<SimulationEvent[]>([
    {
      id: generateId('EVT'),
      timestamp: formatTimestamp(),
      category: 'Network',
      severity: 'info',
      source: 'System Kernel',
      description: 'NetEats Pune Network Operations Simulator initialized. All 14 topology nodes operational.',
    },
    {
      id: generateId('EVT'),
      timestamp: formatTimestamp(),
      category: 'Server',
      severity: 'info',
      source: 'NGINX Load Balancer (10.0.3.10)',
      description: 'Upstream health check probe passed for Server 1, Server 2, Server 3.',
    },
  ]);

  // Metrics
  const [metrics, setMetrics] = useState<NetworkMetrics>({
    averageLatencyMs: 24,
    packetLossRate: 0,
    deliverySuccessRate: 100,
    totalPacketsSent: 48,
    totalPacketsDelivered: 48,
    totalPacketsDropped: 0,
    totalRetransmissions: 0,
    activeConnections: 6,
    overallStatus: 'Healthy',
    requestRatePerSec: 12.4,
    errorRate: 0,
  });

  // Presentation Mode
  const [presentationMode, setPresentationMode] = useState<boolean>(false);

  // Helper to add events
  const addEvent = useCallback(
    (
      category: SimulationEvent['category'],
      severity: SimulationEvent['severity'],
      source: string,
      description: string,
      details?: string,
      orderId?: string,
      destination?: string
    ) => {
      const newEvt: SimulationEvent = {
        id: generateId('EVT'),
        timestamp: formatTimestamp(),
        category,
        severity,
        source,
        destination,
        description,
        technicalDetails: details,
        orderId,
      };
      setEvents((prev) => [newEvt, ...prev.slice(0, 499)]); // keep max 500
    },
    []
  );

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  // Update specific fault
  const updateFault = useCallback(
    <K extends keyof NetworkFaultConfig>(key: K, value: NetworkFaultConfig[K]) => {
      setFaultConfig((prev) => {
        const next = { ...prev, [key]: value };
        addEvent(
          'Network',
          'warning',
          'Fault Injector',
          `Network parameter modified: ${String(key)} set to ${JSON.stringify(value)}.`
        );
        return next;
      });
    },
    [addEvent]
  );

  // Sync health status and latency to metrics whenever faultConfig changes
  useEffect(() => {
    const effectiveLat = calculateEffectiveLatency(faultConfig);
    const health = evaluateNetworkHealth(faultConfig);
    setMetrics((prev) => ({
      ...prev,
      averageLatencyMs: effectiveLat,
      packetLossRate: faultConfig.packetLoss,
      overallStatus: health,
    }));
  }, [faultConfig]);

  // Toggle node status
  const toggleNodeStatus = useCallback(
    (nodeId: string) => {
      setNodes((prev) =>
        prev.map((n) => {
          if (n.id === nodeId) {
            const nextStatus = n.status === 'online' ? 'offline' : 'online';
            addEvent(
              'Network',
              nextStatus === 'offline' ? 'error' : 'success',
              n.name,
              `Node administrative state changed to ${nextStatus.toUpperCase()} (IP: ${n.ip}).`
            );
            return { ...n, status: nextStatus };
          }
          return n;
        })
      );
    },
    [addEvent]
  );

  // Toggle server health
  const toggleServerHealth = useCallback(
    (serverId: string) => {
      setServers((prev) =>
        prev.map((s) => {
          if (s.id === serverId) {
            const nextHealthy = !s.isHealthy;
            return { ...s, isHealthy: nextHealthy };
          }
          return s;
        })
      );

      setFaultConfig((prev) => {
        const isOffline = prev.offlineServers.includes(serverId);
        const nextOffline = isOffline
          ? prev.offlineServers.filter((id) => id !== serverId)
          : [...prev.offlineServers, serverId];

        addEvent(
          'Server',
          isOffline ? 'success' : 'error',
          'Health Monitor',
          `Server ${serverId.replace('node-', '')} marked ${isOffline ? 'HEALTHY / ONLINE' : 'OFFLINE / FAILED'}.`
        );

        return { ...prev, offlineServers: nextOffline };
      });

      setNodes((prev) =>
        prev.map((n) => (n.id === serverId ? { ...n, status: n.status === 'online' ? 'offline' : 'online' } : n))
      );
    },
    [addEvent]
  );

  // Cart operations
  const addToCart = useCallback((item: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItem.id === item.id);
      if (existing) {
        return prev.map((i) => (i.menuItem.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  }, []);

  const updateCartQty = useCallback((itemId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.menuItem.id !== itemId));
    } else {
      setCart((prev) => prev.map((i) => (i.menuItem.id === itemId ? { ...i, quantity: qty } : i)));
    }
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart((prev) => prev.filter((i) => i.menuItem.id !== itemId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Run Load Balancer Batch
  const runLoadBalancerBatch = useCallback(
    async (count: number): Promise<RoutingDecision[]> => {
      const results: RoutingDecision[] = [];
      for (let i = 0; i < count; i++) {
        const decision = selectServer(servers, lbStrategy, faultConfig.offlineServers);
        results.push(decision);
        if (decision.success) {
          setServers((prev) =>
            prev.map((s) =>
              s.id === decision.serverId
                ? {
                    ...s,
                    activeRequests: s.activeRequests + 1,
                    totalRequests: s.totalRequests + 1,
                    cpuUtilization: Math.min(95, s.cpuUtilization + 3),
                  }
                : s
            )
          );
        }
      }

      addEvent(
        'Server',
        results.some((r) => !r.success) ? 'warning' : 'info',
        'Load Balancer',
        `Dispatched batch of ${count} requests using ${lbStrategy.replace('_', ' ').toUpperCase()} strategy. Successful: ${results.filter((r) => r.success).length}/${count}.`
      );

      return results;
    },
    [servers, lbStrategy, faultConfig.offlineServers, addEvent]
  );

  // Place Order
  const placeOrder = useCallback(
    async (paymentMethod: DeliveryOrder['paymentMethod']): Promise<DeliveryOrder> => {
      const subtotal = cart.reduce((acc, curr) => acc + curr.menuItem.price * curr.quantity, 0);
      const deliveryFee = 35;
      const tax = Math.round(subtotal * 0.05);
      const total = subtotal + deliveryFee + tax;
      const orderId = `PUN-${Math.floor(100000 + Math.random() * 900000)}`;
      const idempotencyKey = `IDEMP-${orderId}-${Date.now()}`;

      addEvent('Order', 'info', 'Customer Device (192.168.1.45)', `Initiated checkout for Order #${orderId} (₹${total}). Idempotency Key: ${idempotencyKey}.`, undefined, orderId);

      // Route through Load Balancer
      const routing = selectServer(servers, lbStrategy, faultConfig.offlineServers);
      const assignedServerId = routing.success ? routing.serverId : 'node-server-1';

      if (!routing.success) {
        addEvent('Server', 'error', 'NGINX Load Balancer', `Could not route order #${orderId}: All upstream application servers down!`, undefined, orderId);
      } else {
        addEvent('Server', 'info', 'NGINX Load Balancer', `Order #${orderId} assigned to ${routing.serverName}. Reason: ${routing.reason}`, undefined, orderId);
        // Highlight route on topology
        setActivePacketRoute(['node-customer', 'node-ap', 'node-router', 'node-firewall', 'node-lb', assignedServerId, 'node-db']);
      }

      // Process Simulated Payment
      const paymentResult = await processSimulatedPayment(
        orderId,
        idempotencyKey,
        total,
        paymentMethod,
        faultConfig.paymentScenario,
        calculateEffectiveLatency(faultConfig)
      );

      let initialStatus: OrderStatus = 'Created';
      if (paymentResult.status === 'Successful') {
        initialStatus = 'Payment Confirmed';
        addEvent('Payment', 'success', 'Payment Gateway (10.0.6.30)', `Payment confirmed (Txn: ${paymentResult.transactionId}) for Order #${orderId}. Webhook received by App Server.`, undefined, orderId);
      } else if (paymentResult.status === 'Delayed Confirmation') {
        initialStatus = 'Payment Pending';
        addEvent('Payment', 'warning', 'Payment Gateway (10.0.6.30)', `Payment status delayed for Order #${orderId}: Webhook queued due to simulated network delay.`, undefined, orderId);
      } else if (paymentResult.status === 'Timeout Pending') {
        initialStatus = 'Payment Pending';
        addEvent('Payment', 'warning', 'Payment Gateway (10.0.6.30)', `Payment succeeded at bank, but ACK timed out. Order #${orderId} saved with Idempotency Key to avoid duplicate debit.`, undefined, orderId);
      } else {
        initialStatus = 'Payment Failed';
        addEvent('Payment', 'error', 'Payment Gateway (10.0.6.30)', `Payment failed for Order #${orderId}. HTTP 402/504 rejection.`, undefined, orderId);
      }

      const newOrder: DeliveryOrder = {
        id: orderId,
        idempotencyKey,
        customerId: 'cust-pune-88',
        customerName: 'Aniket Deshmukh',
        customerLocation: 'Kothrud',
        customerAddress: 'Flat 402, Mayur Colony, Near Karve Statue, Kothrud, Pune',
        customerCoords: { x: 25, y: 65 },
        customerIP: '192.168.1.45',
        restaurantId: selectedRestaurant.id,
        restaurantName: selectedRestaurant.name,
        restaurantLocation: selectedRestaurant.location,
        items: [...cart],
        subtotal,
        deliveryFee,
        tax,
        total,
        paymentMethod,
        paymentStatus: paymentResult.status === 'Successful' ? 'Successful' : paymentResult.status === 'Delayed Confirmation' ? 'Delayed Confirmation' : paymentResult.status === 'Timeout Pending' ? 'Pending' : 'Failed',
        paymentTxnId: paymentResult.transactionId,
        status: initialStatus,
        assignedPartner: DEFAULT_DELIVERY_PARTNER,
        assignedServerId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        currentJourneyStep: initialStatus === 'Payment Confirmed' ? 9 : 2,
        totalJourneySteps: 18,
      };

      setOrders((prev) => [newOrder, ...prev]);
      setActiveOrder(newOrder);

      // Update metrics
      setMetrics((prev) => ({
        ...prev,
        totalPacketsSent: prev.totalPacketsSent + 12,
        totalPacketsDelivered: prev.totalPacketsDelivered + (initialStatus === 'Payment Failed' ? 6 : 12),
        totalPacketsDropped: prev.totalPacketsDropped + (initialStatus === 'Payment Failed' ? 4 : 0),
      }));

      return newOrder;
    },
    [cart, selectedRestaurant, servers, lbStrategy, faultConfig, addEvent]
  );

  // Update order status
  const updateOrderStatus = useCallback(
    (orderId: string, status: OrderStatus) => {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === orderId) {
            const updated = { ...o, status, updatedAt: new Date().toISOString() };
            if (status === 'Accepted by Restaurant') {
              updated.currentJourneyStep = 12;
              addEvent('Order', 'info', `Restaurant POS (${o.restaurantLocation})`, `Order #${orderId} accepted by kitchen. Preparing fresh food.`, undefined, orderId);
            } else if (status === 'Preparing') {
              updated.currentJourneyStep = 12;
              addEvent('Order', 'info', `Restaurant POS (${o.restaurantLocation})`, `Chef started cooking Order #${orderId}. Estimated time: 20 mins.`, undefined, orderId);
            } else if (status === 'Ready for Pickup') {
              updated.currentJourneyStep = 13;
              addEvent('Order', 'success', `Restaurant POS (${o.restaurantLocation})`, `Order #${orderId} packed and ready for pickup. Waiting for rider dispatch.`, undefined, orderId);
            } else if (status === 'Partner Assigned') {
              updated.currentJourneyStep = 14;
              addEvent('Order', 'info', 'Dispatch Gateway', `Delivery partner Ramesh Pawar assigned to Order #${orderId}. Push notification sent.`, undefined, orderId);
            } else if (status === 'Picked Up' || status === 'Out for Delivery') {
              updated.currentJourneyStep = 17;
              addEvent('Order', 'info', 'Delivery Partner (Mobile)', `Rider picked up Order #${orderId} from ${o.restaurantName}. Heading towards Kothrud.`, undefined, orderId);
            } else if (status === 'Delivered') {
              updated.currentJourneyStep = 18;
              addEvent('Order', 'success', 'Delivery Partner (Mobile)', `Order #${orderId} successfully delivered to customer in Kothrud. Connection terminated.`, undefined, orderId);
            }
            return updated;
          }
          return o;
        })
      );
    },
    [addEvent]
  );

  // Reconcile delayed / timed out payment
  const reconcilePayment = useCallback(
    async (orderId: string) => {
      addEvent('Payment', 'info', 'Reconciliation Engine', `Running transactional reconciliation query for Order #${orderId} using Idempotency Key...`, undefined, orderId);
      await sleep(400);

      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === orderId) {
            addEvent('Payment', 'success', 'Reconciliation Engine', `Transaction reconciled: Payment matched at Bank Gateway for #${orderId}. Status updated to 'Payment Confirmed'. Duplicate order prevented.`, undefined, orderId);
            return {
              ...o,
              paymentStatus: 'Successful',
              status: 'Payment Confirmed',
              currentJourneyStep: 10,
              updatedAt: new Date().toISOString(),
            };
          }
          return o;
        })
      );
    },
    [addEvent]
  );

  // Tracking operations
  const advancePartnerLocation = useCallback(() => {
    setPartnerRouteIndex((prev) => {
      const nextIdx = (prev + 1) % PUNE_DELIVERY_ROUTE_BANER_TO_KOTHRUD.length;
      const waypoint = PUNE_DELIVERY_ROUTE_BANER_TO_KOTHRUD[nextIdx];

      setDeliveryPartner((partner) => {
        if (faultConfig.mobileSignal === 'Disconnected') {
          // Packet loss / disconnected: queue locally on mobile device
          addEvent(
            'GPS',
            'warning',
            'Delivery Partner Mobile',
            `Device offline! GPS ping at ${waypoint.label} queued in local device buffer (Queued: ${partner.queuedUpdatesCount + 1}).`
          );
          return {
            ...partner,
            queuedUpdatesCount: partner.queuedUpdatesCount + 1,
            signalStatus: 'Disconnected',
          };
        }

        // Online or weak signal: send telemetry datagram
        const pkt = generateGPSPacket(partner.id, { x: waypoint.x, y: waypoint.y }, faultConfig.mobileSignal, nextIdx);
        addEvent(
          'GPS',
          faultConfig.mobileSignal === 'Weak Signal' ? 'warning' : 'info',
          'Delivery Partner Mobile',
          `GPS Telemetry: Rider at ${waypoint.roadName} (${waypoint.area}) [${waypoint.x}%, ${waypoint.y}%]. ${pkt.protocol} Datagram transmitted.`
        );

        return {
          ...partner,
          currentLocationName: waypoint.area,
          currentCoords: { x: waypoint.x, y: waypoint.y },
          signalStatus: faultConfig.mobileSignal === 'Weak Signal' ? 'Weak Signal' : 'Connected',
        };
      });

      return nextIdx;
    });
  }, [faultConfig.mobileSignal, addEvent]);

  // Flush queued GPS updates when reconnected
  const flushQueuedGPSUpdates = useCallback(() => {
    if (deliveryPartner.queuedUpdatesCount > 0) {
      addEvent(
        'GPS',
        'success',
        'Delivery Partner Mobile',
        `Network Reconnected! Flushing ${deliveryPartner.queuedUpdatesCount} buffered GPS location pings to Server via WebSocket batch synchronization.`
      );
      setDeliveryPartner((prev) => ({
        ...prev,
        queuedUpdatesCount: 0,
        signalStatus: 'Connected',
      }));
    }
  }, [deliveryPartner.queuedUpdatesCount, addEvent]);

  // Auto flush if mobileSignal changes back to Connected or Reconnected
  useEffect(() => {
    if (
      (faultConfig.mobileSignal === 'Connected' || faultConfig.mobileSignal === 'Reconnected') &&
      deliveryPartner.queuedUpdatesCount > 0
    ) {
      flushQueuedGPSUpdates();
    }
  }, [faultConfig.mobileSignal, deliveryPartner.queuedUpdatesCount, flushQueuedGPSUpdates]);

  // Packet Simulator runner
  const runPacketSimulation = useCallback(
    async (
      sourceId: string,
      destId: string,
      protocol: ProtocolType,
      payload: string
    ): Promise<PacketSimulationRunResult> => {
      setIsPacketSimulating(true);
      addEvent(
        'Packet',
        'info',
        sourceId,
        `Beginning simulated packet transmission: ${protocol} payload "${payload}" to ${destId}.`,
        undefined,
        undefined,
        destId
      );

      const assignedServer = faultConfig.offlineServers.includes('node-server-1')
        ? faultConfig.offlineServers.includes('node-server-2')
          ? 'node-server-3'
          : 'node-server-2'
        : 'node-server-1';

      const result = await simulatePacketTransmission(
        sourceId,
        destId,
        protocol,
        payload,
        faultConfig,
        assignedServer,
        (step) => {
          if (step.isLoss) {
            addEvent('Packet', 'error', step.packet.sourceName, `${step.label}: ${step.detail}`);
          }
        }
      );

      setLastPacketRun(result);
      setIsPacketSimulating(false);

      // Update metrics
      setMetrics((prev) => ({
        ...prev,
        totalPacketsSent: prev.totalPacketsSent + result.totalPackets,
        totalPacketsDelivered: prev.totalPacketsDelivered + result.deliveredCount,
        totalPacketsDropped: prev.totalPacketsDropped + result.droppedCount,
        totalRetransmissions: prev.totalRetransmissions + result.retransmissionCount,
      }));

      addEvent(
        'Packet',
        result.success ? 'success' : 'error',
        'Packet Engine',
        `Transmission Complete: ${protocol} - Sent: ${result.totalPackets}, Delivered: ${result.deliveredCount}, Dropped: ${result.droppedCount}, Retransmissions: ${result.retransmissionCount}.`
      );

      return result;
    },
    [faultConfig, addEvent]
  );

  // Step by step journey
  const runStepByStepJourney = useCallback(
    async (orderId?: string) => {
      resetJourney();
      for (let i = 0; i < ORDER_JOURNEY_STEPS_DEFINITION.length; i++) {
        setActiveJourneyStepIndex(i);
        setOrderJourneySteps((prev) =>
          prev.map((step, idx) =>
            idx === i
              ? { ...step, status: 'in_progress' }
              : idx < i
              ? { ...step, status: 'completed' }
              : step
          )
        );

        const currentDef = ORDER_JOURNEY_STEPS_DEFINITION[i];
        addEvent('Network', 'info', currentDef.source, `Step ${i + 1}/${ORDER_JOURNEY_STEPS_DEFINITION.length}: ${currentDef.title} (${currentDef.protocol})`, currentDef.description, orderId, currentDef.destination);

        await sleep(Math.max(120, calculateEffectiveLatency(faultConfig)));

        // Check for server fault at step 6
        if (i === 5 && faultConfig.offlineServers.length >= 3) {
          setOrderJourneySteps((prev) =>
            prev.map((step, idx) => (idx === i ? { ...step, status: 'failed', notes: 'All application servers offline!' } : step))
          );
          addEvent('Server', 'error', 'NGINX Load Balancer', 'Journey Halted: 503 No healthy application servers available.', undefined, orderId);
          return;
        }

        setOrderJourneySteps((prev) =>
          prev.map((step, idx) => (idx === i ? { ...step, status: 'completed' } : step))
        );
      }
    },
    [faultConfig, addEvent]
  );

  const advanceSingleJourneyStep = useCallback(() => {
    setActiveJourneyStepIndex((curr) => {
      if (curr >= orderJourneySteps.length - 1) return curr;
      const next = curr + 1;
      setOrderJourneySteps((prev) =>
        prev.map((s, idx) =>
          idx === next ? { ...s, status: 'in_progress' } : idx < next ? { ...s, status: 'completed' } : s
        )
      );
      return next;
    });
  }, [orderJourneySteps.length]);

  const resetJourney = useCallback(() => {
    setActiveJourneyStepIndex(0);
    setOrderJourneySteps(
      ORDER_JOURNEY_STEPS_DEFINITION.map((s) => ({
        ...s,
        status: 'pending',
        delayMs: 20,
      }))
    );
  }, []);

  // Pre-built Presentation Scenarios (Section 19)
  const runScenario = useCallback(
    async (scenarioId: string) => {
      addEvent('Network', 'info', 'Scenario Manager', `Loading Scenario: ${scenarioId}...`);

      switch (scenarioId) {
        case 'scenario-a': // Normal Order
          setFaultConfig({
            packetLoss: 0,
            latency: 20,
            congestion: 'Normal',
            mobileSignal: 'Connected',
            offlineServers: [],
            paymentScenario: 'Normal',
          });
          setServers(INITIAL_SERVERS);
          setNodes(DEFAULT_NETWORK_NODES);
          addEvent('Order', 'info', 'Scenario A', 'Scenario A Active: Baseline conditions (0% loss, 20ms latency, all servers healthy). Placing demo order...');
          await placeOrder('UPI');
          break;

        case 'scenario-b': // Packet Loss & Retransmission
          setFaultConfig({
            packetLoss: 10,
            latency: 100,
            congestion: 'Moderate',
            mobileSignal: 'Connected',
            offlineServers: [],
            paymentScenario: 'Normal',
          });
          addEvent('Packet', 'warning', 'Scenario B', 'Scenario B Active: 10% Packet Loss injected. Running TCP packet stream with retransmission...');
          await runPacketSimulation('node-customer', 'node-restaurant', 'TCP', 'POST /orders/create { items: 2, addr: "Kothrud" }');
          break;

        case 'scenario-c': // Server Failure & Failover
          toggleServerHealth('node-server-1');
          addEvent('Server', 'error', 'Scenario C', 'Scenario C Active: Server 1 knocked offline. Sending batch requests through Load Balancer to prove automatic failover...');
          await runLoadBalancerBatch(12);
          break;

        case 'scenario-d': // Peak-Hour Congestion
          setFaultConfig({
            packetLoss: 5,
            latency: 300,
            congestion: 'Severe',
            mobileSignal: 'Connected',
            offlineServers: [],
            paymentScenario: 'Normal',
          });
          addEvent('Network', 'warning', 'Scenario D', 'Scenario D Active: Severe peak-hour congestion simulated across Pune core routers. Distributing high request volume...');
          await runLoadBalancerBatch(25);
          break;

        case 'scenario-e': // Poor Mobile Connectivity
          setFaultConfig((prev) => ({ ...prev, mobileSignal: 'Disconnected' }));
          addEvent('GPS', 'error', 'Scenario E', 'Scenario E Active: Delivery rider entered cell dead-zone (Disconnected). Advancing rider GPS to show offline queueing...');
          advancePartnerLocation();
          advancePartnerLocation();
          await sleep(800);
          addEvent('GPS', 'info', 'Scenario E', 'Restoring 5G cellular link (Reconnected)...');
          setFaultConfig((prev) => ({ ...prev, mobileSignal: 'Connected' }));
          flushQueuedGPSUpdates();
          break;

        case 'scenario-f': // Payment Confirmation Failure & Reconciliation
          setFaultConfig((prev) => ({ ...prev, paymentScenario: 'Delayed Confirmation' }));
          addEvent('Payment', 'warning', 'Scenario F', 'Scenario F Active: Simulating payment confirmation network timeout. Placing order...');
          const delayedOrder = await placeOrder('UPI');
          await sleep(600);
          addEvent('Payment', 'info', 'Scenario F', 'Invoking Idempotent Transaction Reconciliation to recover order state without double billing...');
          await reconcilePayment(delayedOrder.id);
          break;

        case 'scenario-g': // UDP vs TCP Comparison
          addEvent('Network', 'info', 'Scenario G', 'Scenario G Active: Side-by-side TCP vs UDP comparative transmission with 10% packet loss.');
          setFaultConfig((prev) => ({ ...prev, packetLoss: 10 }));
          await runPacketSimulation('node-customer', 'node-restaurant', 'TCP', 'High Reliability Financial Telemetry');
          await sleep(500);
          await runPacketSimulation('node-customer', 'node-maps', 'UDP', 'Low Latency GPS Location Datagram');
          break;

        default:
          break;
      }
    },
    [placeOrder, runLoadBalancerBatch, runPacketSimulation, toggleServerHealth, advancePartnerLocation, flushQueuedGPSUpdates, reconcilePayment, addEvent]
  );

  // Complete Reset Simulation
  const resetSimulation = useCallback(() => {
    setFaultConfig(DEFAULT_FAULT_CONFIG);
    setNodes(DEFAULT_NETWORK_NODES);
    setServers(INITIAL_SERVERS);
    setLbStrategy('round_robin');
    setCart([
      { menuItem: DEFAULT_RESTAURANTS[1].menu[0], quantity: 2 },
      { menuItem: DEFAULT_RESTAURANTS[1].menu[3], quantity: 2 },
    ]);
    setOrders([]);
    setActiveOrder(null);
    setDeliveryPartner(DEFAULT_DELIVERY_PARTNER);
    setPartnerRouteIndex(0);
    resetJourney();
    setLastPacketRun(null);
    setActivePacketRoute([]);
    setEvents([
      {
        id: generateId('EVT'),
        timestamp: formatTimestamp(),
        category: 'Recovery',
        severity: 'success',
        source: 'Simulator System',
        description: 'Demo state reset to pristine default values. All fault parameters restored.',
      },
    ]);
    setMetrics({
      averageLatencyMs: 20,
      packetLossRate: 0,
      deliverySuccessRate: 100,
      totalPacketsSent: 48,
      totalPacketsDelivered: 48,
      totalPacketsDropped: 0,
      totalRetransmissions: 0,
      activeConnections: 6,
      overallStatus: 'Healthy',
      requestRatePerSec: 12.4,
      errorRate: 0,
    });
    localStorage.removeItem(STORAGE_KEY);
  }, [resetJourney]);

  return (
    <SimulationContext.Provider
      value={{
        faultConfig,
        setFaultConfig,
        updateFault,
        nodes,
        toggleNodeStatus,
        activePacketRoute,
        setActivePacketRoute,
        servers,
        lbStrategy,
        setLbStrategy,
        toggleServerHealth,
        runLoadBalancerBatch,
        restaurants,
        selectedRestaurant,
        setSelectedRestaurant,
        cart,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        orders,
        activeOrder,
        setActiveOrder,
        placeOrder,
        updateOrderStatus,
        reconcilePayment,
        userRole,
        setUserRole,
        deliveryPartner,
        partnerRouteIndex,
        advancePartnerLocation,
        flushQueuedGPSUpdates,
        orderJourneySteps,
        activeJourneyStepIndex,
        runStepByStepJourney,
        advanceSingleJourneyStep,
        resetJourney,
        lastPacketRun,
        isPacketSimulating,
        runPacketSimulation,
        metrics,
        events,
        addEvent,
        clearEvents,
        presentationMode,
        setPresentationMode,
        runScenario,
        resetSimulation,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = (): SimulationContextType => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
