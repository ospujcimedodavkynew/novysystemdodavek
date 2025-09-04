
import React, { useState } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Fleet from './components/Fleet';
import Rentals from './components/Rentals';
import CalendarView from './components/CalendarView';
import Settings from './components/Settings';
import { ToastContainer } from './components/ui';
import { HomeIcon, TruckIcon, FileTextIcon, MenuIcon, XIcon, CalendarDaysIcon, SettingsIcon } from './components/Icons';

const App: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Nástěnka';
      case '/fleet':
        return 'Správa Vozového Parku';
      case '/rentals':
        return 'Archiv Smluv a Pronájmů';
      case '/calendar':
        return 'Kalendář a Plánovač';
      case '/settings':
        return 'Nastavení';
      default:
        return 'Půjčovna Dodávek';
    }
  };

  const navLinkClasses = "flex items-center px-4 py-3 text-lg font-medium rounded-lg transition-colors";
  const activeNavLinkClasses = "bg-accent text-white";
  const inactiveNavLinkClasses = "text-text-secondary hover:bg-surface hover:text-white";

  const sidebarContent = (
    <nav className="flex flex-col gap-4 p-4">
      <NavLink
        to="/"
        className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : inactiveNavLinkClasses}`}
        onClick={() => setSidebarOpen(false)}
      >
        <HomeIcon className="w-6 h-6 mr-3" />
        Nástěnka
      </NavLink>
      <NavLink
        to="/fleet"
        className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : inactiveNavLinkClasses}`}
        onClick={() => setSidebarOpen(false)}
      >
        <TruckIcon className="w-6 h-6 mr-3" />
        Vozový Park
      </NavLink>
       <NavLink
        to="/calendar"
        className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : inactiveNavLinkClasses}`}
        onClick={() => setSidebarOpen(false)}
      >
        <CalendarDaysIcon className="w-6 h-6 mr-3" />
        Kalendář
      </NavLink>
      <NavLink
        to="/rentals"
        className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : inactiveNavLinkClasses}`}
        onClick={() => setSidebarOpen(false)}
      >
        <FileTextIcon className="w-6 h-6 mr-3" />
        Smlouvy
      </NavLink>
      <NavLink
        to="/settings"
        className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : inactiveNavLinkClasses}`}
        onClick={() => setSidebarOpen(false)}
      >
        <SettingsIcon className="w-6 h-6 mr-3" />
        Nastavení
      </NavLink>
    </nav>
  );

  return (
    <div className="flex h-screen bg-background text-text-primary">
      <ToastContainer />
      {/* Static Sidebar for larger screens */}
      <aside className="hidden md:flex w-64 flex-col bg-gray-900 border-r border-gray-700">
        <div className="flex items-center justify-center h-20 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white">Půjčovna</h1>
        </div>
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-30 transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden`}>
          <div className="relative w-64 h-full bg-gray-900 shadow-lg">
              <div className="flex items-center justify-between h-20 p-4 border-b border-gray-700">
                <h1 className="text-2xl font-bold text-white">Půjčovna</h1>
                <button onClick={() => setSidebarOpen(false)} className="text-text-secondary">
                    <XIcon className="w-6 h-6" />
                </button>
              </div>
              {sidebarContent}
          </div>
          <div className="fixed inset-0 bg-black opacity-50" onClick={() => setSidebarOpen(false)}></div>
      </div>


      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between h-20 px-6 bg-surface border-b border-gray-700">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-text-secondary">
            <MenuIcon className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-semibold">{getPageTitle()}</h2>
          <div>
            {/* User profile or other header items can go here */}
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/fleet" element={<Fleet />} />
            <Route path="/rentals" element={<Rentals />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
