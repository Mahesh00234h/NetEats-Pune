// src/App.tsx
import React, { useState } from 'react';
import { SimulationProvider, useSimulation } from './simulation/simulationContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavItemKey } from './components/layout/Sidebar';
import { FaultControlDrawer } from './components/layout/FaultControlDrawer';
import { ScenarioModal } from './components/modals/ScenarioModal';

// Pages
import { OverviewPage } from './components/pages/OverviewPage';
import { OrderFlowPage } from './components/pages/OrderFlowPage';
import { TopologyPage } from './components/pages/TopologyPage';
import { PacketSimulatorPage } from './components/pages/PacketSimulatorPage';
import { LoadBalancerPage } from './components/pages/LoadBalancerPage';
import { FailoverPage } from './components/pages/FailoverPage';
import { MonitoringPage } from './components/pages/MonitoringPage';
import { TrackingPage } from './components/pages/TrackingPage';
import { SecurityPage } from './components/pages/SecurityPage';
import { ConceptsLabPage } from './components/pages/ConceptsLabPage';
import { EventLogsPage } from './components/pages/EventLogsPage';
import { AboutPage } from './components/pages/AboutPage';

const MainAppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavItemKey>('overview');
  const [isFaultsOpen, setIsFaultsOpen] = useState<boolean>(false);
  const [isScenariosOpen, setIsScenariosOpen] = useState<boolean>(false);

  const { presentationMode } = useSimulation();

  const renderActivePage = () => {
    switch (currentTab) {
      case 'overview':
        return (
          <OverviewPage
            onNavigate={(tab) => setCurrentTab(tab)}
            onOpenFaults={() => setIsFaultsOpen(true)}
          />
        );
      case 'order':
        return (
          <OrderFlowPage
            onNavigateToTracking={() => setCurrentTab('tracking')}
            onNavigateToTopology={() => setCurrentTab('topology')}
          />
        );
      case 'topology':
        return <TopologyPage />;
      case 'packet_sim':
        return <PacketSimulatorPage />;
      case 'load_balancer':
        return <LoadBalancerPage />;
      case 'failover':
        return <FailoverPage />;
      case 'monitoring':
        return <MonitoringPage />;
      case 'tracking':
        return <TrackingPage />;
      case 'security':
        return <SecurityPage />;
      case 'concepts_lab':
        return <ConceptsLabPage />;
      case 'logs':
        return <EventLogsPage />;
      case 'about':
        return <AboutPage />;
      default:
        return <OverviewPage onNavigate={(tab) => setCurrentTab(tab)} onOpenFaults={() => setIsFaultsOpen(true)} />;
    }
  };

  return (
    <div className={`min-h-screen bg-[#030712] text-slate-100 flex flex-col ${presentationMode ? 'text-base font-medium' : ''}`}>
      {/* Top Navbar */}
      <Navbar
        onOpenFaults={() => setIsFaultsOpen(true)}
        onOpenScenarios={() => setIsScenariosOpen(true)}
      />

      {/* Main Container with Sidebar + Page View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar currentTab={currentTab} onSelectTab={(tab) => setCurrentTab(tab)} />

        {/* Page Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#040915]">
          <div className="max-w-7xl mx-auto">
            {renderActivePage()}
          </div>
        </main>
      </div>

      {/* Fault Control Drawer */}
      <FaultControlDrawer isOpen={isFaultsOpen} onClose={() => setIsFaultsOpen(false)} />

      {/* Academic Presentation Scenarios Modal */}
      <ScenarioModal
        isOpen={isScenariosOpen}
        onClose={() => setIsScenariosOpen(false)}
        onNavigateToTab={(tab) => setCurrentTab(tab)}
      />
    </div>
  );
};

export function App() {
  return (
    <SimulationProvider>
      <MainAppContent />
    </SimulationProvider>
  );
}

export default App;
