import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { LayoutPanelLeft, Calendar, Plus } from "lucide-react";

interface PageHeaderProps {
  title: string;
  onAddContent: () => void;
  activeView?: "board" | "calendar";
  children?: React.ReactNode;
}

export default function PageHeader({ 
  title, 
  onAddContent, 
  activeView,
  children 
}: PageHeaderProps) {
  return (
    <div className="bg-white shadow">
      <div className="px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
        <div className="py-6 md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:text-3xl sm:leading-9 sm:truncate">
              {title}
            </h2>
          </div>
          <div className="mt-4 flex-shrink-0 flex md:mt-0 md:ml-4">
            <div className="flex items-center space-x-3">
              {activeView && (
                <div className="inline-flex shadow-sm rounded-md">
                  <Link href="/">
                    <Button
                      variant={activeView === "board" ? "default" : "outline"}
                      className={`rounded-r-none ${activeView === "board" ? "" : "text-slate-700"}`}
                    >
                      <LayoutPanelLeft className="mr-2 h-5 w-5" />
                      Board
                    </Button>
                  </Link>
                  <Link href="/calendar">
                    <Button
                      variant={activeView === "calendar" ? "default" : "outline"}
                      className={`rounded-l-none ${activeView === "calendar" ? "" : "text-slate-700"}`}
                    >
                      <Calendar className="mr-2 h-5 w-5" />
                      Calendar
                    </Button>
                  </Link>
                </div>
              )}
              {children}
              <Button onClick={onAddContent}>
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                New Content
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
