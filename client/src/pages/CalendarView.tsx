import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar as BigCalendar, Views, DateLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addDays, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import PageHeader from "@/components/PageHeader";
import AddContentDialog from "@/components/AddContentDialog";
import { formatContents } from "@/lib/utils";
import { queryClient } from "@/lib/queryClient";

// Create date-fns localizer for react-big-calendar
const locales = {
  'en-US': enUS,
};

const localizer = {
  format: (date: Date, formatStr: string) => format(date, formatStr, { locale: locales["en-US"] }),
  parse: (str: string, formatStr: string) => parse(str, formatStr, new Date(), { locale: locales["en-US"] }),
  startOfWeek: (date: Date) => startOfWeek(date, { locale: locales["en-US"] }),
  getDay: (date: Date) => getDay(date),
  locales,
} as DateLocalizer;

export default function CalendarView() {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState(Views.MONTH);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Fetch contents
  const { data: contents = [], isLoading } = useQuery({
    queryKey: ["/api/contents"],
  });

  // Format content for calendar display
  const calendarEvents = useMemo(() => {
    const formattedContents = formatContents(contents);
    
    return formattedContents
      .filter(content => content.plannedDate) // Only include content with planned dates
      .map(content => ({
        id: content.id,
        title: content.title,
        start: new Date(content.plannedDate!),
        end: new Date(content.plannedDate!),
        allDay: true,
        resource: content,
      }));
  }, [contents]);

  // Handle content added
  const handleContentAdded = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/contents"] });
  };

  // Custom event component
  const EventComponent = ({ event }: any) => {
    const content = event.resource;
    const typeClass = content.contentType === "Short" 
      ? "bg-blue-100 text-blue-800" 
      : "bg-purple-100 text-purple-800";
      
    return (
      <div className={`text-xs p-1 rounded overflow-hidden flex items-center`}>
        <div className={`w-2 h-2 rounded-full mr-1 ${content.contentType === "Short" ? "bg-blue-500" : "bg-purple-500"}`}></div>
        <div className="truncate">{content.title}</div>
      </div>
    );
  };

  // Custom day cell component
  const DayComponent = ({ date, children }: any) => {
    const today = new Date();
    const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
    
    return (
      <div className={`h-full min-h-[100px] p-1 ${isToday ? 'bg-indigo-50' : ''}`}>
        {children}
      </div>
    );
  };

  // Handle navigating between months
  const handleNavigate = (newDate: Date, view: string) => {
    setDate(newDate);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8 pb-12">
      <PageHeader 
        title="Content Calendar" 
        onAddContent={() => setIsAddDialogOpen(true)}
        activeView="calendar"
      />

      <div className="mt-6 bg-white rounded-lg shadow p-4">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <button 
              onClick={() => setDate(subMonths(date, 1))}
              className="px-3 py-1 rounded-md border border-slate-300 mr-2"
            >
              ◀ Previous
            </button>
            <button 
              onClick={() => setDate(new Date())}
              className="px-3 py-1 rounded-md border border-slate-300 mr-2"
            >
              Today
            </button>
            <button 
              onClick={() => setDate(addMonths(date, 1))}
              className="px-3 py-1 rounded-md border border-slate-300"
            >
              Next ▶
            </button>
          </div>
          <h3 className="text-lg font-medium">
            {format(date, 'MMMM yyyy')}
          </h3>
        </div>
        
        <div className="h-[700px]">
          <BigCalendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            date={date}
            onNavigate={handleNavigate}
            view={view}
            onView={(newView) => setView(newView as any)}
            views={["month"]}
            components={{
              event: EventComponent,
              dateCellWrapper: DayComponent,
            }}
            popup
            eventPropGetter={(event) => {
              const content = event.resource;
              return {
                className: `calendar-event border-l-2 ${content.contentType === "Short" ? "border-blue-500" : "border-purple-500"}`,
              };
            }}
            dayPropGetter={(date) => {
              const currentMonth = date.getMonth() === new Date().getMonth();
              return {
                className: `calendar-day ${currentMonth ? "" : "bg-slate-50 text-slate-400"}`,
              };
            }}
          />
        </div>
      </div>

      <AddContentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onContentAdded={handleContentAdded}
      />
    </div>
  );
}
