import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormattedContent } from "@/lib/types";

interface CalendarEventProps {
  content: FormattedContent;
}

export default function CalendarEvent({ content }: CalendarEventProps) {
  const typeClass = content.contentType === "Short" 
    ? "bg-blue-100 text-blue-800" 
    : "bg-purple-100 text-purple-800";
    
  return (
    <Card className="mb-1 shadow-sm border-l-2 border-indigo-500">
      <CardContent className="p-1">
        <div className="flex items-center justify-between text-xs">
          <span className="truncate">{content.title}</span>
          <Badge variant="outline" className={typeClass}>{content.contentType}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
