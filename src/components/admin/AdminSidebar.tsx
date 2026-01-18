import { 
  LayoutDashboard, 
  FileText, 
  Upload, 
  Briefcase, 
  Users, 
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSignOut: () => void;
  userEmail?: string;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "blog", label: "Blog Editor", icon: FileText },
  { id: "reports", label: "Reports", icon: Upload },
  { id: "manage", label: "Manage Content", icon: FileText },
  { id: "opportunities", label: "Careers", icon: Briefcase },
  { id: "partners", label: "Partners", icon: Users },
  { id: "security", label: "Security", icon: Shield },
];

export const AdminSidebar = ({ activeTab, onTabChange, onSignOut, userEmail }: AdminSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      <aside 
        className={cn(
          "fixed left-0 top-0 h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col transition-all duration-300 z-50 shadow-xl",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header */}
        <div className={cn(
          "flex items-center border-b border-gray-700/50 h-16 px-4",
          collapsed ? "justify-center" : "justify-between"
        )}>
          {!collapsed && (
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/aea9891e-d4df-4543-b771-163f7061a75c.png" 
                alt="AfroStrategia" 
                className="h-8 w-auto"
              />
              <span className="font-semibold text-sm">Admin</span>
            </div>
          )}
          {collapsed && (
            <img 
              src="/lovable-uploads/aea9891e-d4df-4543-b771-163f7061a75c.png" 
              alt="AfroStrategia" 
              className="h-8 w-auto"
            />
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-500 transition-colors shadow-lg"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        {/* User Info */}
        {!collapsed && userEmail && (
          <div className="px-4 py-3 border-b border-gray-700/50">
            <p className="text-xs text-gray-400">Logged in as</p>
            <p className="text-sm font-medium truncate text-gray-200">{userEmail}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              const button = (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    isActive 
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30" 
                      : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                  )}
                >
                  <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-white")} />
                  {!collapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </button>
              );

              if (collapsed) {
                return (
                  <li key={item.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {button}
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-gray-800 text-white border-gray-700">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  </li>
                );
              }

              return <li key={item.id}>{button}</li>;
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-700/50 p-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onSignOut}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-red-600/20 hover:text-red-400 transition-colors",
                  collapsed && "justify-center"
                )}
              >
                <LogOut className="h-5 w-5" />
                {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="bg-gray-800 text-white border-gray-700">
                Sign Out
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
};
