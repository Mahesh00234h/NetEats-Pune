// src/simulation/routingEngine.ts
import { DEFAULT_NETWORK_NODES } from './defaultData';

export interface RouteHop {
  nodeId: string;
  nodeName: string;
  ip: string;
  layer: string;
  description: string;
}

export function computeNetworkRoute(sourceNodeId: string, destNodeId: string, assignedServerId = 'node-server-1'): string[] {
  // Common routing topologies in the Pune Food Delivery architecture
  if (sourceNodeId === 'node-customer') {
    const route = ['node-customer', 'node-ap', 'node-router', 'node-firewall', 'node-lb', assignedServerId];
    if (destNodeId === assignedServerId) return route;
    if (destNodeId === 'node-db') return [...route, 'node-db'];
    if (destNodeId === 'node-payment') return [...route, 'node-payment'];
    if (destNodeId === 'node-maps') return [...route, 'node-maps'];
    if (destNodeId === 'node-restaurant') return [...route, 'node-restaurant'];
    if (destNodeId === 'node-delivery') return [...route, 'node-delivery'];
    if (destNodeId === 'node-dns') return ['node-customer', 'node-ap', 'node-dns'];
    return [...route, destNodeId];
  }

  if (sourceNodeId === 'node-restaurant') {
    return ['node-restaurant', assignedServerId, 'node-db'];
  }

  if (sourceNodeId === 'node-delivery') {
    return ['node-delivery', assignedServerId, 'node-maps'];
  }

  // Fallback: direct hop or through server
  return [sourceNodeId, assignedServerId, destNodeId].filter((v, i, a) => a.indexOf(v) === i);
}

export function getRouteHopsDetails(routeNodeIds: string[]): RouteHop[] {
  return routeNodeIds.map(id => {
    const node = DEFAULT_NETWORK_NODES.find(n => n.id === id);
    if (!node) {
      return {
        nodeId: id,
        nodeName: id,
        ip: 'Unknown',
        layer: 'Layer 3/4',
        description: 'Network Node',
      };
    }

    let layer = 'Layer 3 Network';
    if (node.type === 'customer' || node.type === 'restaurant' || node.type === 'delivery') {
      layer = 'Layer 7 Application End-Host';
    } else if (node.type === 'access_point') {
      layer = 'Layer 2 Data Link / Wi-Fi';
    } else if (node.type === 'router') {
      layer = 'Layer 3 IP Routing';
    } else if (node.type === 'firewall') {
      layer = 'Layer 4 Stateful Packet Filter';
    } else if (node.type === 'load_balancer') {
      layer = 'Layer 7 HTTP Reverse Proxy';
    } else if (node.type === 'server') {
      layer = 'Layer 7 Application Server';
    } else if (node.type === 'database') {
      layer = 'Layer 7 Data Store';
    }

    return {
      nodeId: node.id,
      nodeName: node.name,
      ip: node.ip,
      layer,
      description: node.role,
    };
  });
}
