
import React from 'react';
import { Bell, Menu, Search, User } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, sidebarOpen }) => {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center border-b border-bank-gray-light bg-white/80 backdrop-blur-sm">
      <div className="flex w-full items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="rounded-lg p-2 text-bank-dark hover:bg-bank-gray-light"
          >
            <Menu size={20} />
          </button>
          
          <div className="relative hidden md:flex">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search size={16} className="text-bank-gray" />
            </div>
            <input
              type="text"
              placeholder="Rechercher..."
              className="h-10 w-64 rounded-lg border-0 bg-bank-gray-light pl-10 pr-4 text-sm text-bank-dark focus:outline-none focus:ring-1 focus:ring-bank-primary"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="relative rounded-lg p-2 text-bank-dark hover:bg-bank-gray-light">
            <Bell size={20} />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-bank-primary text-xs font-medium text-white">
              3
            </span>
          </button>
          
          <div className="relative">
            <button className="flex items-center space-x-2 rounded-full text-bank-dark hover:bg-bank-gray-light">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-bank-primary/10">
                <User size={18} className="text-bank-primary" />
              </div>
              <span className="hidden font-medium md:inline-block">
                Jean Dupont
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
