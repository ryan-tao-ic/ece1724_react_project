// app/profile/page.tsx

/**
 * This file represents the profile page component.
 * It is used to display the user's profile information.
 */
"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Button, Container, Input } from "@/components/ui";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import RichTextEditor, { RichTextEditorHandle } from "@/components/ui/rich-text-editor";
import { getProfile } from "@/lib/profile/profile";
import { updateProfile } from "@/lib/profile/update";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const profileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  affiliation: z.string(),
  occupation: z.string(),
  bio: z.string(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const formFields = [
  { name: "firstName", label: "First Name", gridCol: true },
  { name: "lastName", label: "Last Name", gridCol: true },
  { name: "affiliation", label: "Affiliation", gridCol: false },
  { name: "occupation", label: "Occupation", gridCol: false },
  { name: "bio", label: "Personal Bio", gridCol: false },
] as const;

export default function ProfilePage() {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const richTextEditorRef = useRef<RichTextEditorHandle>(null);
  const [error, setError] = useState(""); 
  const [success, setSuccess] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isProfessionalizing, setIsProfessionalizing] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      affiliation: "",
      occupation: "",
      bio: "",
    },
  });

  useEffect(() => {
    getProfile().then((profile) => {
      setProfile(profile);
      form.reset({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        affiliation: profile.affiliation || "",
        occupation: profile.occupancy || "",
        bio: profile.expertise || "",
      });
      if (richTextEditorRef.current) {
        richTextEditorRef.current.setContent(profile.expertise || "");
      }
    });
  }, [form]);

  async function onSubmit(data: ProfileFormValues) {
    setError("");
    setSuccess("");

    try {
      const bioContent = richTextEditorRef.current?.getContent() || "";
      const result = await updateProfile({ ...data, bio: bioContent });
      const refreshed = await getProfile();
      setProfile(refreshed);
      setIsEditing(false);

      if (refreshed.role === "LECTURER") {
        setSuccess("Profile updated. You are now a Lecturer!");
      } else {
        setSuccess("Profile updated successfully.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to update profile.");
    }
  }

  if (!session) {
    return (
      <MainLayout>
        <Container className="py-12 md:py-20 text-center">
          <h1 className="text-2xl font-bold">Please login to view your profile</h1>
          <Button className="mt-4" asChild>
            <Link href="/login">Login</Link>
          </Button>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container className="py-12 md:py-20">
        <div className="mx-auto flex justify-center">
          <Card className="w-full max-w-3xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl font-bold">Profile Information</CardTitle>
              {!isEditing && profile ? (
                <Button onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              ) : profile && (
                <div className="flex gap-2">
                  <Button onClick={form.handleSubmit(onSubmit)}>Update Profile</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-4">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              
              {isEditing && profile ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {formFields.filter(f => f.gridCol).map(field => (
                        <FormField
                          key={field.name}
                          control={form.control}
                          name={field.name as keyof ProfileFormValues}
                          render={({ field: fieldProps }) => (
                            <FormItem className="bg-white p-3 rounded-md">
                              <FormLabel className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-1 border-l-4 border-[#002D72] pl-2">{field.label}</FormLabel>
                              <FormControl>
                                <Input type="text" {...fieldProps} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>

                    <div className="bg-white p-3 rounded-md">
                      <div className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-1 border-l-4 border-[#002D72] pl-2">Email</div>
                      <div className="text-gray-900">{profile.email || "Not specified"}</div>
                    </div>

                    {formFields.filter(f => !f.gridCol).map(field => {
                      if (field.name === "bio") {
                        return (
                          <FormItem key={field.name} className="bg-white p-3 rounded-md">
                            <div className="flex items-center justify-between">
                              <FormLabel className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-1 border-l-4 border-[#002D72] pl-2">{field.label}</FormLabel>
                              <div className="flex flex-col items-end">
                                <div className="flex gap-2">
                                  <Button 
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-8 gap-1 text-xs"
                                    disabled={isEnhancing || isProfessionalizing}
                                    onClick={async () => {
                                      try {
                                        // Get current content from rich text editor
                                        const currentContent = richTextEditorRef.current?.getContent() || "";
                                        
                                        if (!currentContent.trim()) {
                                          toast.warning("Empty bio", {
                                            description: "Please add some content to your bio first."
                                          });
                                          return;
                                        }
                                        
                                        // Set enhancing state to true
                                        setIsEnhancing(true);
                                        
                                        toast.info("Enhancing bio...", {
                                          description: "Using AI to improve your bio, please wait..."
                                        });
                                        
                                        // Send to API endpoint
                                        const response = await fetch("/api/enhance-bio", {
                                          method: "POST",
                                          headers: {
                                            "Content-Type": "application/json",
                                          },
                                          body: JSON.stringify({
                                            content: currentContent,
                                          }),
                                        });
                                        
                                        if (!response.ok) {
                                          const error = await response.json();
                                          throw new Error(error.error || "Failed to enhance bio");
                                        }
                                        
                                        const { enhancedContent } = await response.json();
                                        
                                        // Update the rich text editor with enhanced content
                                        if (richTextEditorRef.current) {
                                          richTextEditorRef.current.setContent(enhancedContent);
                                          
                                          // Also update the form value
                                          form.setValue("bio", enhancedContent);
                                        }
                                        
                                        toast.success("Bio enhanced!", {
                                          description: "Your bio has been professionally improved."
                                        });
                                      } catch (error) {
                                        console.error("Error enhancing bio:", error);
                                        toast.error("Enhancement failed", {
                                          description: error instanceof Error 
                                            ? error.message 
                                            : "Failed to enhance bio. Please try again."
                                        });
                                      } finally {
                                        // Reset enhancing state
                                        setIsEnhancing(false);
                                      }
                                    }}
                                  >
                                    {isEnhancing ? (
                                      <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Enhancing...
                                      </>
                                    ) : (
                                      <>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M3 5h4"/><path d="M19 17v4"/><path d="M17 19h4"/></svg>
                                        Enhance Bio
                                      </>
                                    )}
                                  </Button>
                                  
                                  <Button 
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-8 gap-1 text-xs"
                                    disabled={isEnhancing || isProfessionalizing}
                                    onClick={async () => {
                                      try {
                                        // Get current content from rich text editor
                                        const currentContent = richTextEditorRef.current?.getContent() || "";
                                        
                                        if (!currentContent.trim()) {
                                          toast.warning("Empty bio", {
                                            description: "Please add some content to your bio first."
                                          });
                                          return;
                                        }
                                        
                                        // Set professionalizing state to true
                                        setIsProfessionalizing(true);
                                        
                                        toast.info("Making professional...", {
                                          description: "Using AI to make your bio more professional, please wait..."
                                        });
                                        
                                        // Send to API endpoint with mode parameter
                                        const response = await fetch("/api/enhance-bio", {
                                          method: "POST",
                                          headers: {
                                            "Content-Type": "application/json",
                                          },
                                          body: JSON.stringify({
                                            content: currentContent,
                                            mode: "professional"
                                          }),
                                        });
                                        
                                        if (!response.ok) {
                                          const error = await response.json();
                                          throw new Error(error.error || "Failed to professionalize bio");
                                        }
                                        
                                        const { enhancedContent } = await response.json();
                                        
                                        // Update the rich text editor with enhanced content
                                        if (richTextEditorRef.current) {
                                          richTextEditorRef.current.setContent(enhancedContent);
                                          
                                          // Also update the form value
                                          form.setValue("bio", enhancedContent);
                                        }
                                        
                                        toast.success("Bio professionalized!", {
                                          description: "Your bio now has a more professional tone."
                                        });
                                      } catch (error) {
                                        console.error("Error professionalizing bio:", error);
                                        toast.error("Professionalization failed", {
                                          description: error instanceof Error 
                                            ? error.message 
                                            : "Failed to make your bio professional. Please try again."
                                        });
                                      } finally {
                                        // Reset professionalizing state
                                        setIsProfessionalizing(false);
                                      }
                                    }}
                                  >
                                    {isProfessionalizing ? (
                                      <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                      </>
                                    ) : (
                                      <>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-briefcase"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                                        Make Professional
                                      </>
                                    )}
                                  </Button>
                                </div>
                                <span className="text-xs text-gray-500 italic mt-1">powered by deepseek</span>
                              </div>
                            </div>
                            <FormControl>
                              <RichTextEditor
                                ref={richTextEditorRef}
                                initialContent={form.getValues("bio")}
                                onChange={(content) => form.setValue("bio", content)}
                                disabled={isEnhancing || isProfessionalizing}
                              />
                            </FormControl>
                          </FormItem>
                        );
                      }
                      return (
                        <FormField
                          key={field.name}
                          control={form.control}
                          name={field.name as keyof ProfileFormValues}
                          render={({ field: fieldProps }) => (
                            <FormItem className="bg-white p-3 rounded-md">
                              <FormLabel className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-1 border-l-4 border-[#002D72] pl-2">{field.label}</FormLabel>
                              <FormControl>
                                <Input type="text" {...fieldProps} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      );
                    })}
                  </form>
                </Form>
              ) : profile ? (
                <div className="space-y-2">
                  {profile.role === "LECTURER" && (
                    <div className="text-green-600 font-semibold flex items-center bg-green-50 p-3 rounded-md">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      You are a Lecturer
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white p-3 rounded-md">
                      <div className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-1 border-l-4 border-[#002D72] pl-2">First Name</div>
                      <div className="text-gray-900">{profile.firstName || "Not specified"}</div>
                    </div>
                    <div className="bg-white p-3 rounded-md">
                      <div className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-1 border-l-4 border-[#002D72] pl-2">Last Name</div>
                      <div className="text-gray-900">{profile.lastName || "Not specified"}</div>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-md">
                    <div className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-1 border-l-4 border-[#002D72] pl-2">Email</div>
                    <div className="text-gray-900">{profile.email || "Not specified"}</div>
                  </div>

                  <div className="bg-white p-3 rounded-md">
                    <div className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-1 border-l-4 border-[#002D72] pl-2">Affiliation</div>
                    <div className="text-gray-900">{profile.affiliation || "Not specified"}</div>
                  </div>

                  <div className="bg-white p-3 rounded-md">
                    <div className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-1 border-l-4 border-[#002D72] pl-2">Occupation</div>
                    <div className="text-gray-900">{profile.occupancy || "Not specified"}</div>
                  </div>

                  <div className="bg-white p-3 rounded-md">
                    <div className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-1 border-l-4 border-[#002D72] pl-2">Personal Bio</div>
                    <div 
                      className="prose max-w-none text-gray-900 [&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-800 [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:text-xl [&_h3]:font-bold [&_p]:mb-4 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6"
                      dangerouslySetInnerHTML={{ __html: profile.expertise || "Not specified" }}
                    />
                  </div>
                </div>
              ) : (
                <div>Loading profile...</div>
              )}
            </CardContent>
          </Card>
        </div>
      </Container>
    </MainLayout>
  );
}
