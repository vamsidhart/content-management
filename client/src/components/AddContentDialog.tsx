import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { contentStages, contentTypes, insertContentSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { FormattedContent } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface AddContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContentAdded: () => void;
  initialContent?: FormattedContent | null;
}

// Extend the insert schema with validation rules
const formSchema = insertContentSchema
  .extend({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().optional(),
    script: z.string().optional(),
    thumbnailIdea: z.string().optional(),
    resourcesLinks: z.string().optional(),
    plannedDate: z.string().optional(),
    youtubeLiveLink: z.string().url().optional().or(z.literal("")),
    instagramLiveLink: z.string().url().optional().or(z.literal("")),
    stage: z.enum(contentStages),
    contentType: z.enum(contentTypes),
  })
  .transform((data) => ({
    ...data,
    description: data.description || "",
    script: data.script || "",
    thumbnailIdea: data.thumbnailIdea || "",
    resourcesLinks: data.resourcesLinks || "",
    plannedDate: data.plannedDate || "",
    youtubeLiveLink: data.youtubeLiveLink || "",
    instagramLiveLink: data.instagramLiveLink || "",
  }));

export default function AddContentDialog({ 
  open, 
  onOpenChange, 
  onContentAdded,
  initialContent 
}: AddContentDialogProps) {
  const isEditing = !!initialContent;
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      script: "",
      thumbnailIdea: "",
      resourcesLinks: "",
      stage: "Idea",
      contentType: "Short",
      plannedDate: "",
      youtubeLiveLink: "",
      instagramLiveLink: "",
    },
  });

  // Set form values when editing
  useEffect(() => {
    if (initialContent) {
      form.reset({
        title: initialContent.title,
        description: initialContent.description || "",
        script: initialContent.script || "",
        thumbnailIdea: initialContent.thumbnailIdea || "",
        resourcesLinks: initialContent.resourcesLinks || "",
        stage: initialContent.stage,
        contentType: initialContent.contentType,
        plannedDate: initialContent.plannedDate || "",
        youtubeLiveLink: initialContent.youtubeLiveLink || "",
        instagramLiveLink: initialContent.instagramLiveLink || "",
      });
    } else {
      form.reset({
        title: "",
        description: "",
        script: "",
        thumbnailIdea: "",
        resourcesLinks: "",
        stage: "Idea",
        contentType: "Short",
        plannedDate: "",
        youtubeLiveLink: "",
        instagramLiveLink: "",
      });
    }
  }, [initialContent, form, open]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsPending(true);
      
      // Convert empty strings to null for optional fields
      const formattedData = {
        ...data,
        description: data.description || null,
        script: data.script || null,
        thumbnailIdea: data.thumbnailIdea || null,
        resourcesLinks: data.resourcesLinks || null,
        plannedDate: data.plannedDate || null,
        youtubeLiveLink: data.youtubeLiveLink || null,
        instagramLiveLink: data.instagramLiveLink || null,
      };
      
      if (isEditing && initialContent) {
        await apiRequest("PATCH", `/api/contents/${initialContent.id}`, formattedData);
        toast({
          title: "Content updated",
          description: "Content has been updated successfully.",
        });
      } else {
        await apiRequest("POST", "/api/contents", formattedData);
        toast({
          title: "Content added",
          description: "New content has been added successfully.",
        });
      }
      
      onContentAdded();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving content:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "add"} content. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? "Edit Content" : "Add New Content"}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Fill in the details for your content item
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter content title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter content description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="script"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Script</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter video script content" 
                      className="min-h-[150px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="thumbnailIdea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thumbnail Idea</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe thumbnail concept" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="resourcesLinks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resources & Links</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add any relevant resources or links" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stage</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a stage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {contentStages.map((stage) => (
                          <SelectItem key={stage} value={stage}>
                            {stage}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {contentTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type} Form
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="plannedDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Planned Date</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      value={field.value || ''} 
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      name={field.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="youtubeLiveLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YouTube Live Link</FormLabel>
                  <FormControl>
                    <Input placeholder="https://youtube.com/watch?v=..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="instagramLiveLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram Live Link</FormLabel>
                  <FormControl>
                    <Input placeholder="https://instagram.com/p/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <span className="mr-2 animate-spin">⏳</span>
                    {isEditing ? "Updating..." : "Saving..."}
                  </>
                ) : (
                  <>{isEditing ? "Update" : "Save"}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
