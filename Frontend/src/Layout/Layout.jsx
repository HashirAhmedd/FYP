import { useState } from "react";
import Dashboard from "../Pages/Dashboard";
import Prediction from "../Pages/Prediction";
import UserHistory from "../Pages/UserHistory";
import DataDownload from "../Pages/DataDownload"; 
import { apiFetch } from "../utils/api";

export default function Layout({ userEmail, onLogout }) {
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const handleLogout = async () => {
    try {
      await apiFetch("/api/v1/user/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      onLogout();
    }
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      component: <Dashboard userEmail={userEmail} />,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      id: "prediction",
      label: "Prediction",
      component: <Prediction userEmail={userEmail} />,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      id: "history",
      label: "User History",
      component: <UserHistory userEmail={userEmail} />,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      id: "download",
      label: "Data Download",
      component: <DataDownload userEmail={userEmail} />,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
      ),
    },
  ];

  // ... rest of your component remains the same

  const utilityItems = [
    {
      id: "logout",
      label: "Logout",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Fixed Header (Navbar) */}
      <header className="fixed top-0 left-0 right-0 h-16 shadow-sm z-40 bg-white">
        <div className="h-full px-6 flex items-center justify-between">
          {/* Left Side - Branding */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center">
              <h1 className="text-xl font-bold text-black">ClimaX-AI</h1>
            </div>
          </div>

          {/* Right Side - User Area */}
          <div className="flex items-center space-x-4">
            {/* User Avatar */}
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {userEmail?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Fixed Sidebar */}
      <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 flex flex-col z-30">
        {/* Main Navigation */}
        <div className="flex-1 px-4 py-6 overflow-y-auto">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-4">
            Navigation
          </h2>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors cursor-pointer ${
                  activeMenu === item.id
                    ? "bg-green-50 text-green-700 border border-green-100"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span
                  className={
                    activeMenu === item.id ? "text-green-600" : "text-gray-400"
                  }
                >
                  {item.icon}
                </span>
                <span className="font-medium text-sm">{item.label}</span>
                {activeMenu === item.id && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-green-500"></div>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom Utility Section */}
        <div className="border-t border-gray-100 p-4">
          <nav className="space-y-1">
            {utilityItems.map((item) => (
              <button
                key={item.id}
                onClick={item.id === "logout" ? handleLogout : undefined}
                className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <span className="text-gray-400">{item.icon}</span>
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="pt-16 pl-64">
        <div className="p-6 space-y-8">
          {menuItems.find((item) => item.id === activeMenu)?.component}
        </div>
      </main>
    </div>
  );
}
