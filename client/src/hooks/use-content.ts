import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { InsertContent, UpdateContent } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useCreateContent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (newContent: InsertContent) => 
      apiRequest("POST", "/api/contents", newContent)
        .then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contents"] });
      toast({
        title: "Content created",
        description: "Content has been created successfully.",
      });
    },
    onError: (error) => {
      console.error("Error creating content:", error);
      toast({
        title: "Error",
        description: "Failed to create content. Please try again.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateContent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, content }: { id: number; content: UpdateContent }) => 
      apiRequest("PATCH", `/api/contents/${id}`, content)
        .then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contents"] });
      toast({
        title: "Content updated",
        description: "Content has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error("Error updating content:", error);
      toast({
        title: "Error",
        description: "Failed to update content. Please try again.",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteContent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => 
      apiRequest("DELETE", `/api/contents/${id}`)
        .then(() => id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contents"] });
      toast({
        title: "Content deleted",
        description: "Content has been deleted successfully.",
      });
    },
    onError: (error) => {
      console.error("Error deleting content:", error);
      toast({
        title: "Error",
        description: "Failed to delete content. Please try again.",
        variant: "destructive",
      });
    },
  });
}
