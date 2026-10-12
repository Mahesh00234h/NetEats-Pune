// src/components/layout/Sidebar.tsx
import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Network,
  Send,
  Scale,
  ServerCrash,
  BarChart3,
  MapPin,
  ShieldCheck,
  BookOpen,
  FileText,
  Info,
  User,
  UtensilsCrossed,
  Bike,
  Shield,
} from 'lucide-react';
import { useSimulation } from '../../simulation/simulationContext';

export type NavItemKey =
  | 'overview'
  | 'order'
  | 'topology'
  | 'packet_sim'
  | 'load_balancer'
  | 'failover'
  | 'monitoring'
  | 'tracking'
  | 'security'
  | 'concepts_lab'
  | 'logs'
  | 'about';

interface SidebarProps {
  currentTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { userRole, setUserRole, orders } = useSimulation();

  const navItems: { key: NavItemKey; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { key: 'overview', label: '1. Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
    {
      key: 'order',
      label: '2. Place an Order',
      icon: <ShoppingBag className="h-4 w-4" />,
      badge: orders.length > 0 ? orders.length : undefined,
    },
    { key: 'topology', label: '3. Network Topology', icon: <Network className="h-4 w-4" /> },
    { key: 'packet_sim', label: '4. Packet Simulator', icon: <Send className="h-4 w-4" /> },
    { key: 'load_balancer', label: '5. Load Balancer', icon: <Scale className="h-4 w-4" /> },
    { key: 'failover', label: '6. Server Failover', icon: <ServerCrash className="h-4 w-4" /> },
    { key: 'monitoring', label: '7. Network Monitoring', icon: <BarChart3 className="h-4 w-4" /> },
    { key: 'tracking', label: '8. Delivery Tracking', icon: <MapPin className="h-4 w-4" /> },
    { key: 'security', label: '9. Security Center', icon: <ShieldCheck className="h-4 w-4" /> },
    { key: 'concepts_lab', label: '10. CN Concepts Lab', icon: <BookOpen className="h-4 w-4" /> },
    { key: 'logs', label: '11. Event Logs', icon: <FileText className="h-4 w-4" /> },
    { key: 'about', label: '12. About the Project', icon: <Info className="h-4 w-4" /> },
  ];

  const roleOptions: { role: 'customer' | 'restaurant' | 'delivery' | 'admin'; label: string; icon: React.ReactNode }[] = [
    { role: 'customer', label: 'Customer', icon: <User className="h-3.5 w-3.5" /> },
    { role: 'restaurant', label: 'Restaurant', icon: <UtensilsCrossed className="h-3.5 w-3.5" /> },
    { role: 'delivery', label: 'Rider', icon: <Bike className="h-3.5 w-3.5" /> },
    { role: 'admin', label: 'NetAdmin', icon: <Shield className="h-3.5 w-3.5" /> },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-800/80 bg-slate-950/80 flex flex-col justify-between p-3 select-none">
      <div>
        {/* Navigation list */}
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-3 pb-2">
          Simulation Modules
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onSelectTab(item.key)}
                className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition ${
                  isActive
                    ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950/30 font-semibold'
                    : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="rounded-full bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-bold text-cyan-300">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Role Switcher & Academic Details Card */}
      <div className="mt-4 space-y-3 pt-3 border-t border-slate-800/80">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-1">
            Active Demo Role
          </span>
          <div className="grid grid-cols-2 gap-1.5 mt-1.5">
            {roleOptions.map((opt) => (
              <button
                key={opt.role}
                onClick={() => setUserRole(opt.role)}
                className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-medium transition ${
                  userRole === opt.role
                    ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                    : 'bg-slate-900/70 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                }`}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Academic Card */}
        <div className="rounded-lg border border-slate-800/80 bg-slate-900/40 p-2.5 text-[11px] text-slate-400">
          <div className="font-semibold text-slate-200">TSSM's BSCOER, Pune</div>
          <div className="text-slate-500 text-[10px]">Computer Networks Case Study</div>
          <div className="text-cyan-400/90 text-[10px] mt-0.5 font-mono">Academic Year 2026–2027</div>
        </div>
      </div>
    </aside>
  );
};
