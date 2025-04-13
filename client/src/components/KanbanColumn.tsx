import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContentCard from "@/components/ContentCard";
import { FormattedContent } from "@/lib/types";
import { useState } from "react";
import AddContentDialog from "@/components/AddContentDialog";

interface KanbanColumnProps {
  stage: string;
  contents: FormattedContent[];
  onContentUpdated: () => void;
}

export default function KanbanColumn({ 
  stage, 
  contents, 
  onContentUpdated 
}: KanbanColumnProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddContent = () => {
    onContentUpdated();
  };

  return (
    <div className="bg-slate-50 rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">{stage}</h3>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          {contents.length}
        </span>
      </div>
      
      <div className="space-y-3">
        {contents.map((content) => (
          <ContentCard 
            key={content.id} 
            content={content} 
            onContentUpdated={onContentUpdated}
          />
        ))}
        
        {contents.length === 0 && (
          <div className="py-8 text-center text-slate-500 text-sm border border-dashed border-slate-300 rounded-lg">
            No content items
          </div>
        )}
      </div>
      
      <div className="mt-3 text-center">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="w-5 h-5 mx-auto" />
        </Button>
      </div>

      <AddContentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onContentAdded={handleAddContent}
        initialContent={{
          id: 0,
          title: "",
          description: "",
          thumbnailIdea: "",
          resourcesLinks: "",
          stage: stage,
          contentType: "Short",
          plannedDate: "",
          finalLiveLink: "",
          createdAt: "",
        }}
      />
    </div>
  );
}
