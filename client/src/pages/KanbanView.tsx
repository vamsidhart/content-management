import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import { FormattedContent } from "@/lib/types";
import { formatContents, groupContentsByStage } from "@/lib/utils";
import { contentStages } from "@shared/schema";
import PageHeader from "@/components/PageHeader";
import KanbanColumn from "@/components/KanbanColumn";
import AddContentDialog from "@/components/AddContentDialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function KanbanView() {
  const [contentTypeFilter, setContentTypeFilter] = useState<string>("All");
  const [sortOption, setSortOption] = useState<string>("lastModified");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch contents
  const { data: contents = [], isLoading } = useQuery({
    queryKey: ["/api/contents"],
  });

  // Format and filter contents
  const formattedContents = useMemo(() => {
    const formatted = formatContents(contents);
    
    if (contentTypeFilter !== "All") {
      return formatted.filter(content => content.contentType === contentTypeFilter);
    }
    
    return formatted;
  }, [contents, contentTypeFilter]);

  // Sort contents
  const sortedContents = useMemo(() => {
    const sorted = [...formattedContents];
    
    switch (sortOption) {
      case "titleAZ":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case "oldest":
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case "newest":
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "lastModified":
      default:
        return sorted;
    }
  }, [formattedContents, sortOption]);

  // Group contents by stage
  const contentsByStage = useMemo(() => {
    return groupContentsByStage(sortedContents);
  }, [sortedContents]);

  // Update content stage mutation
  const updateContentStageMutation = useMutation({
    mutationFn: async ({ id, stage }: { id: number; stage: string }) => {
      return await apiRequest("PATCH", `/api/contents/${id}`, { stage });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contents"] });
      toast({
        title: "Stage updated",
        description: "Content stage has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error("Error updating content stage:", error);
      toast({
        title: "Error",
        description: "Failed to update content stage.",
        variant: "destructive",
      });
    },
  });

  const handleContentAdded = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/contents"] });
  };

  const handleContentUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/contents"] });
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If there's no destination or if it's the same as source, do nothing
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Get the content that was dragged
    const contentId = parseInt(draggableId.split("-")[1]);
    const newStage = destination.droppableId;

    // Find the content item
    const contentItem = sortedContents.find(item => item.id === contentId);
    if (!contentItem) return;

    // If the stage hasn't changed, do nothing
    if (contentItem.stage === newStage) return;

    // Update the content stage
    updateContentStageMutation.mutate({ id: contentId, stage: newStage });
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
        title="Content Board" 
        onAddContent={() => setIsAddDialogOpen(true)}
        activeView="board"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <select
              className="block appearance-none bg-white border border-slate-300 text-slate-700 py-2 px-3 pr-8 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-indigo-500"
              value={contentTypeFilter}
              onChange={(e) => setContentTypeFilter(e.target.value)}
            >
              <option value="All">All Content</option>
              <option value="Short">Short Form</option>
              <option value="Long">Long Form</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div className="relative">
            <select
              className="block appearance-none bg-white border border-slate-300 text-slate-700 py-2 px-3 pr-8 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-indigo-500"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="lastModified">Last Modified</option>
              <option value="titleAZ">Title A-Z</option>
              <option value="oldest">Oldest First</option>
              <option value="newest">Newest First</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </PageHeader>

      <div className="mt-6">
        <h3 className="text-lg leading-6 font-medium text-slate-900 mb-4">
          Content by Stage
        </h3>
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {contentStages.map((stage) => (
              <Droppable key={stage} droppableId={stage}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="h-full"
                  >
                    <KanbanColumn
                      stage={stage}
                      contents={contentsByStage[stage] || []}
                      onContentUpdated={handleContentUpdated}
                    />
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>

      <AddContentDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        onContentAdded={handleContentAdded}
      />
    </div>
  );
}
