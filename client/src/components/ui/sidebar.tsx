import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutPanelLeft, 
  Calendar, 
  FileText, 
  BookOpen,
  Settings, 
  User
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();

  const navigation = [
    { name: "Kanban Board", path: "/", icon: LayoutPanelLeft },
    { name: "Calendar View", path: "/calendar", icon: Calendar },
    { name: "All Content", path: "/all", icon: FileText },
    { name: "Resources", path: "/resources", icon: BookOpen },
  ];

  const bottomNavigation = [];

  return (
    <div className={cn("flex md:flex-shrink-0", className)}>
      <div className="flex flex-col w-64 bg-white border-r border-slate-200">
        <div className="flex items-center justify-center h-16 px-4 bg-indigo-600">
          <h1 className="text-xl font-bold text-white">TVE</h1>
        </div>
        <div className="flex flex-col flex-grow px-4 py-4 overflow-y-auto">
          <nav className="flex-1 space-y-2">
            {navigation.map((item) => {
              const isActive = location === item.path;
              return (
                <Link 
                  key={item.name} 
                  href={item.path}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-md",
                    isActive 
                      ? "text-indigo-600 bg-indigo-50" 
                      : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          
        </div>
      </div>
    </div>
  );
}
