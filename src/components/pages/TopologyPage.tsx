// src/components/pages/TopologyPage.tsx
import React, { useState, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  MarkerType,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import {
  Activity,
  Server,
  Shield,
  Wifi,
  Database,
  CreditCard,
  MapPin,
  UtensilsCrossed,
  Bike,
  Smartphone,
  Globe,
  Sliders,
  Info,
  Power,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useSimulation } from '../../simulation/simulationContext';
import { NetworkDeviceNode } from '../../types/network';

// Custom Node Component for high visual impact
const CustomDeviceNode: React.FC<{ data: any }> = ({ data }) => {
  const isOffline = data.status === 'offline';
  const isDegraded = data.status === 'degraded';
  const isHighlighted = data.isHighlighted;

  const getIcon = () => {
    switch (data.type) {
      case 'customer':
        return <Smartphone className="h-4 w-4" />;
      case 'access_point':
        return <Wifi className="h-4 w-4" />;
      case 'dns':
        return <Globe className="h-4 w-4" />;
      case 'router':
        return <Layers className="h-4 w-4" />;
      case 'firewall':
        return <Shield className="h-4 w-4" />;
      case 'load_balancer':
        return <Activity className="h-4 w-4" />;
      case 'server':
        return <Server className="h-4 w-4" />;
      case 'database':
        return <Database className="h-4 w-4" />;
      case 'payment_gateway':
        return <CreditCard className="h-4 w-4" />;
      case 'maps':
        return <MapPin className="h-4 w-4" />;
      case 'restaurant':
        return <UtensilsCrossed className="h-4 w-4" />;
      case 'delivery':
        return <Bike className="h-4 w-4" />;
      default:
        return <Server className="h-4 w-4" />;
    }
  };

  return (
    <div
      className={`relative min-w-[190px] rounded-xl border p-3 shadow-xl backdrop-blur-md transition-all duration-300 ${
        isOffline
          ? 'border-rose-500/80 bg-rose-950/40 text-rose-300 shadow-rose-950/50'
          : isHighlighted
          ? 'border-cyan-400 bg-cyan-950/70 text-cyan-200 shadow-cyan-500/30 ring-2 ring-cyan-500/50'
          : 'border-slate-800 bg-slate-900/90 text-slate-200 hover:border-cyan-500/40'
      }`}
    >
      <Handle type="target" position={Position.Left} className="!bg-cyan-500 !w-2 !h-2" />

      <div className="flex items-center justify-between gap-2">
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-lg border ${
            isOffline
              ? 'border-rose-500/40 bg-rose-950/60 text-rose-400'
              : 'border-cyan-500/30 bg-cyan-950/50 text-cyan-400'
          }`}
        >
          {getIcon()}
        </div>
        <span
          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold ${
            isOffline
              ? 'bg-rose-500/20 text-rose-400'
              : isDegraded
              ? 'bg-amber-500/20 text-amber-400'
              : 'bg-emerald-500/20 text-emerald-400'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isOffline ? 'bg-rose-500' : isDegraded ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
            }`}
          />
          {data.status.toUpperCase()}
        </span>
      </div>

      <div className="mt-2">
        <div className="text-xs font-bold tracking-tight text-slate-100 truncate">{data.name}</div>
        <div className="font-mono text-[10px] text-cyan-400 mt-0.5">{data.ip}</div>
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-slate-800/80 pt-1.5 text-[10px] text-slate-400">
        <span className="truncate max-w-[120px]">{data.role?.slice(0, 22)}...</span>
        <span className="font-mono text-[9px] text-slate-500">{data.protocols?.[0]}</span>
      </div>

      <Handle type="source" position={Position.Right} className="!bg-cyan-500 !w-2 !h-2" />
    </div>
  );
};

const nodeTypes = {
  customDevice: CustomDeviceNode,
};

export const TopologyPage: React.FC = () => {
  const {
    nodes: rawNodes,
    toggleNodeStatus,
    activePacketRoute,
    setActivePacketRoute,
    faultConfig,
  } = useSimulation();

  const [selectedNode, setSelectedNode] = useState<NetworkDeviceNode | null>(rawNodes[0]);
  const [highlightScenario, setHighlightScenario] = useState<string>('all');

  // Build React Flow nodes
  const rfNodes: Node[] = useMemo(() => {
    return rawNodes.map((n) => {
      const isHighlighted = activePacketRoute.includes(n.id) || highlightScenario === 'all';
      return {
        id: n.id,
        type: 'customDevice',
        position: n.position,
        data: {
          ...n,
          isHighlighted,
        },
      };
    });
  }, [rawNodes, activePacketRoute, highlightScenario]);

  // Build React Flow edges with animated glowing packet flow
  const rfEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    rawNodes.forEach((src) => {
      src.connections.forEach((targetId) => {
        const targetNode = rawNodes.find((n) => n.id === targetId);
        const isOffline = src.status === 'offline' || targetNode?.status === 'offline';
        const isOnActiveRoute =
          activePacketRoute.includes(src.id) && activePacketRoute.includes(targetId);

        edges.push({
          id: `edge-${src.id}-${targetId}`,
          source: src.id,
          target: targetId,
          animated: !isOffline,
          style: {
            stroke: isOffline ? '#f43f5e' : isOnActiveRoute ? '#38bdf8' : '#0284c7',
            strokeWidth: isOnActiveRoute ? 3 : 1.8,
            strokeDasharray: isOffline ? '4 4' : isOnActiveRoute ? '5 5' : undefined,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isOffline ? '#f43f5e' : isOnActiveRoute ? '#38bdf8' : '#0284c7',
          },
        });
      });
    });
    return edges;
  }, [rawNodes, activePacketRoute]);

  const [nodes, , onNodesChange] = useNodesState(rfNodes);
  const [edges, , onEdgesChange] = useEdgesState(rfEdges);

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const found = rawNodes.find((n) => n.id === node.id);
      if (found) {
        setSelectedNode(found);
      }
    },
    [rawNodes]
  );

  const traceOrderPath = () => {
    setActivePacketRoute([
      'node-customer',
      'node-ap',
      'node-router',
      'node-firewall',
      'node-lb',
      'node-server-1',
      'node-restaurant',
      'node-delivery',
    ]);
  };

  const clearPath = () => {
    setActivePacketRoute([]);
  };

  return (
    <div className="space-y-6">
      {/* Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-100 sm:text-2xl">
              Interactive 14-Node Network Topology
            </h1>
            <span className="rounded-md border border-cyan-500/30 bg-cyan-950/40 px-2 py-0.5 text-xs font-semibold text-cyan-300">
              React Flow • RFC 1918 Private Addressing
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Hybrid Star & Hierarchical Edge Architecture: Client ➔ AP ➔ DNS ➔ Router ➔ Firewall ➔ Load Balancer ➔ App Clusters ➔ Databases & Webhooks.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={traceOrderPath}
            className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/40 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/40 transition"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Trace Active Order Route</span>
          </button>
          <button
            onClick={clearPath}
            className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
          >
            Clear Route
          </button>
        </div>
      </div>

      {/* Main Diagram Area with Side Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[640px]">
        {/* React Flow Canvas (3 Columns) */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-800 bg-slate-950/90 overflow-hidden relative shadow-2xl">
          <ReactFlow
            nodes={rfNodes}
            edges={rfEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.2}
            maxZoom={1.8}
            defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
          >
            <Background color="#1e293b" gap={20} size={1} />
            <Controls className="!border-slate-800 !bg-slate-900 !rounded-lg" />
            <MiniMap
              nodeColor={(n: any) => (n.data?.status === 'offline' ? '#f43f5e' : '#0ea5e9')}
              maskColor="rgba(3, 7, 18, 0.7)"
            />
          </ReactFlow>

          {/* Floating Canvas Legend */}
          <div className="absolute bottom-3 left-3 rounded-xl border border-slate-800/90 bg-slate-950/90 p-2.5 text-[10px] text-slate-400 backdrop-blur-md space-y-1">
            <div className="font-bold text-slate-200">Topology Legend:</div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> Healthy Node
              <span className="h-2 w-2 rounded-full bg-rose-500 ml-2" /> Offline / Severed Link
              <span className="h-2 w-2 rounded-full bg-cyan-400 ml-2" /> Active Packet Route
            </div>
          </div>
        </div>

        {/* Node Inspector & Academic Details (1 Column) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm flex flex-col justify-between overflow-y-auto">
          {selectedNode ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  Node Inspector
                </span>
                <button
                  onClick={() => toggleNodeStatus(selectedNode.id)}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold border transition ${
                    selectedNode.status === 'offline'
                      ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                      : 'border-rose-500 bg-rose-950/40 text-rose-300'
                  }`}
                >
                  <Power className="h-3 w-3" />
                  <span>{selectedNode.status === 'offline' ? 'Bring Online' : 'Knock Offline'}</span>
                </button>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-100">{selectedNode.name}</h3>
                <div className="mt-1 font-mono text-xs text-cyan-400">{selectedNode.ip}</div>
                <div className="font-mono text-[10px] text-slate-500">MAC: {selectedNode.mac}</div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 text-xs space-y-2">
                <div>
                  <span className="text-slate-500 block text-[10px]">Architectural Role:</span>
                  <span className="text-slate-200 leading-relaxed">{selectedNode.role}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Supported Protocols:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedNode.protocols.map((p) => (
                      <span key={p} className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-cyan-300">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Health Condition:</span>
                  <span
                    className={`font-semibold ${
                      selectedNode.status === 'online' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {selectedNode.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Connected Peers */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  Direct Downstream Links:
                </span>
                <div className="space-y-1">
                  {selectedNode.connections.length === 0 ? (
                    <span className="text-xs text-slate-500">Terminal Leaf Node (No downstream edges)</span>
                  ) : (
                    selectedNode.connections.map((c) => (
                      <div
                        key={c}
                        className="rounded border border-slate-800/80 bg-slate-950/50 px-2 py-1 text-[11px] font-mono text-slate-300 flex items-center justify-between"
                      >
                        <span>{c.replace('node-', '')}</span>
                        <span className="text-cyan-400">➔ Active</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500">Click any topology node to inspect its hardware profile and traffic.</div>
          )}

          {/* Academic Architecture Concept Note */}
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            <div className="font-semibold text-slate-300 flex items-center gap-1 mb-1">
              <Info className="h-3.5 w-3.5 text-cyan-400" /> Star & Hybrid Topology
            </div>
            <p className="leading-relaxed text-slate-500">
              The internal data center utilizes a Star Topology connected to the NGINX Load Balancer. The metropolitan delivery network uses a Hybrid topology connecting mobile 5G riders and Wi-Fi clients across Pune.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
