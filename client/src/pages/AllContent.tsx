import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Pencil, Trash2, Link, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/PageHeader";
import AddContentDialog from "@/components/AddContentDialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatContents, formatDateForDisplay, getContentTypeColor } from "@/lib/utils";
import { FormattedContent } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function AllContent() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<FormattedContent | null>(null);
  const { toast } = useToast();

  const { data: contents = [], isLoading } = useQuery({
    queryKey: ["/api/contents"],
  });

  const formattedContents = useMemo(() => {
    return formatContents(contents);
  }, [contents]);

  const handleAddOrEdit = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/contents"] });
    setEditingContent(null);
  };

  const handleEdit = (content: FormattedContent) => {
    setEditingContent(content);
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/contents/${id}`);
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
        title="All Content" 
        onAddContent={() => {
          setEditingContent(null);
          setIsAddDialogOpen(true);
        }}
      />

      <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Planned Date</TableHead>
                <TableHead>Live Link</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formattedContents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    No content items found. Start by adding a new content item.
                  </TableCell>
                </TableRow>
              ) : (
                formattedContents.map((content) => (
                  <TableRow key={content.id}>
                    <TableCell className="font-medium">{content.title}</TableCell>
                    <TableCell>
                      <Badge className={getContentTypeColor(content.contentType)} variant="outline">
                        {content.contentType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{content.stage}</Badge>
                    </TableCell>
                    <TableCell>
                      {content.plannedDate ? (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-slate-400" />
                          {formatDateForDisplay(content.plannedDate)}
                        </div>
                      ) : (
                        <span className="text-slate-400">Not scheduled</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {content.finalLiveLink ? (
                        <a 
                          href={content.finalLiveLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center"
                        >
                          <Link className="h-4 w-4 mr-1" />
                          View
                        </a>
                      ) : (
                        <span className="text-slate-400">Not published</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(content)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(content.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AddContentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onContentAdded={handleAddOrEdit}
        initialContent={editingContent}
      />
    </div>
  );
}
