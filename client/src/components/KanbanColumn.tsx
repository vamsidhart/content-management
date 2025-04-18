import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContentCard from "@/components/ContentCard";
import { FormattedContent } from "@/lib/types";
import { useState } from "react";
import AddContentDialog from "@/components/AddContentDialog";
import { Draggable, DroppableStateSnapshot } from "react-beautiful-dnd";

interface KanbanColumnProps {
  stage: string;
  contents: FormattedContent[];
  onContentUpdated: () => void;
}

export default function KanbanColumn({
  stage,
  contents,
  onContentUpdated,
}: KanbanColumnProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddContent = () => {
    onContentUpdated();
  };

  return (
    <div className="bg-slate-50 rounded-lg shadow p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">{stage}</h3>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          {contents.length}
        </span>
      </div>

      <div className="space-y-3 min-h-[200px] transition-all">
        {contents.map((content, index) => (
          <Draggable
            key={`content-${content.id}`}
            draggableId={`content-${content.id}`}
            index={index}
          >
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className={`${snapshot.isDragging ? "cursor-grabbing" : "cursor-grab"} transition-transform`}
                style={{
                  ...provided.draggableProps.style,
                  opacity: snapshot.isDragging ? 0.8 : 1,
                  transform: snapshot.isDragging
                    ? `${provided.draggableProps.style?.transform} rotate(1deg)`
                    : provided.draggableProps.style?.transform,
                }}
              >
                <ContentCard
                  key={content.id}
                  content={content}
                  onContentUpdated={onContentUpdated}
                />
              </div>
            )}
          </Draggable>
        ))}

        {contents.length === 0 && (
          <div className="py-8 text-center text-slate-500 text-sm border border-dashed border-slate-300 rounded-lg hover:bg-slate-100 transition-colors">
            <p>No content items</p>
            <p className="text-xs mt-1 text-slate-400">Drop content here</p>
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
      />
    </div>
  );
}
