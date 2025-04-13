import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MoreVertical, Link, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddContentDialog from "@/components/AddContentDialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FormattedContent } from "@/lib/types";
import { cn, formatDateForDisplay, getContentTypeColor, getStageBorderColor } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ContentCardProps {
  content: FormattedContent;
  onContentUpdated: () => void;
}

export default function ContentCard({ content, onContentUpdated }: ContentCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      await apiRequest("DELETE", `/api/contents/${content.id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/contents"] });
      toast({
        title: "Content deleted",
        description: "Content item has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting content:", error);
      toast({
        title: "Error",
        description: "Failed to delete content item.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className={cn("border-l-4 cursor-move", getStageBorderColor(content.stage))}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-sm font-medium text-slate-900">{content.title}</h4>
            <Badge className={getContentTypeColor(content.contentType)} variant="outline">
              {content.contentType}
            </Badge>
          </div>
          
          <p className="text-sm text-slate-500 mb-3 line-clamp-2">
            {content.description || "No description provided."}
          </p>
          
          {content.finalLiveLink && (
            <div className="flex items-center mb-2 text-xs text-blue-600">
              <Link className="mr-1.5 h-4 w-4" />
              <a href={content.finalLiveLink} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                {content.finalLiveLink}
              </a>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-slate-500">
              <Calendar className="mr-1.5 h-4 w-4" />
              {content.plannedDate ? formatDateForDisplay(content.plannedDate) : "Not scheduled"}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  Edit
                </DropdownMenuItem>
                {content.finalLiveLink && (
                  <DropdownMenuItem asChild>
                    <a href={content.finalLiveLink} target="_blank" rel="noopener noreferrer">
                      <Eye className="mr-2 h-4 w-4" />
                      View Live
                    </a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600" 
                  onClick={handleDelete}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
      
      <AddContentDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        initialContent={content}
        onContentAdded={onContentUpdated}
      />
    </>
  );
}
