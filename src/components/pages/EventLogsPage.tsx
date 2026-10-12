// src/components/pages/EventLogsPage.tsx
import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Download,
  Trash2,
  Filter,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
} from 'lucide-react';
import { useSimulation } from '../../simulation/simulationContext';
import { EventCategory, EventSeverity } from '../../types/events';
import { exportToCSV } from '../../utils/helpers';

export const EventLogsPage: React.FC = () => {
  const { events, clearEvents } = useSimulation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');

  const categories: (EventCategory | 'All')[] = [
    'All',
    'Network',
    'Packet',
    'Order',
    'Payment',
    'Server',
    'Security',
    'GPS',
    'Recovery',
  ];

  const severities: (EventSeverity | 'All')[] = ['All', 'info', 'success', 'warning', 'error', 'critical'];

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const matchesSearch =
        searchQuery === '' ||
        evt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (evt.orderId && evt.orderId.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'All' || evt.category === selectedCategory;
      const matchesSeverity = selectedSeverity === 'All' || evt.severity === selectedSeverity;

      return matchesSearch && matchesCategory && matchesSeverity;
    });
  }, [events, searchQuery, selectedCategory, selectedSeverity]);

  const handleExportCSV = () => {
    const rows = filteredEvents.map((e) => ({
      ID: e.id,
      Timestamp: e.timestamp,
      Category: e.category,
      Severity: e.severity,
      Source: e.source,
      Destination: e.destination || 'N/A',
      OrderID: e.orderId || 'N/A',
      Description: e.description,
      TechnicalDetails: e.technicalDetails || '',
    }));
    exportToCSV(`neteats_pune_network_events_${Date.now()}.csv`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-100 sm:text-2xl">
              Audit Logs & Telemetry Stream
            </h1>
            <span className="rounded-md border border-cyan-500/30 bg-cyan-950/40 px-2 py-0.5 text-xs font-semibold text-cyan-300">
              Section 18 • Filterable Event Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Searchable log of all simulation actions, TCP socket events, firewall drops, and transaction reconciliations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-3.5 py-2 text-xs font-bold text-slate-950 transition shadow-md shadow-cyan-500/20"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV ({filteredEvents.length})</span>
          </button>
          <button
            onClick={clearEvents}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search description, source, or Order ID..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Severity:</span>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
            >
              {severities.map((s) => (
                <option key={s} value={s}>
                  {s.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Event Logs Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold uppercase text-[10px]">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Category</th>
                <th className="p-3">Source Node</th>
                <th className="p-3">Order ID</th>
                <th className="p-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-900/40 text-slate-300">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No simulation events match current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-900/80 transition">
                    <td className="p-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {evt.timestamp}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          evt.severity === 'error' || evt.severity === 'critical'
                            ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                            : evt.severity === 'warning'
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                            : evt.severity === 'success'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                        }`}
                      >
                        {evt.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-200 whitespace-nowrap">{evt.category}</td>
                    <td className="p-3 font-mono text-[11px] text-cyan-400 max-w-[140px] truncate">
                      {evt.source}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {evt.orderId || '-'}
                    </td>
                    <td className="p-3 text-slate-300 text-xs leading-relaxed max-w-md">
                      {evt.description}
                      {evt.technicalDetails && (
                        <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                          {evt.technicalDetails}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
