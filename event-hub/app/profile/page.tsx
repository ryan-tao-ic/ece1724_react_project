// app/profile/page.tsx
// This is a client component that allows users to view and edit their profile information.

"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Button, Container, Input } from "@/components/ui";
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
    try {
      const bioContent = richTextEditorRef.current?.getContent() || "";
      const result = await updateProfile({ ...data, bio: bioContent });
      const refreshed = await getProfile();
      setProfile(refreshed);
      setIsEditing(false);

      if (refreshed.role === "LECTURER") {
        alert("Profile updated. You are now a Lecturer!");
      } else {
        alert("Profile updated successfully.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
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
                            <FormLabel className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-1 border-l-4 border-[#002D72] pl-2">{field.label}</FormLabel>
                            <FormControl>
                              <RichTextEditor
                                ref={richTextEditorRef}
                                initialContent={form.getValues("bio")}
                                onChange={(content) => form.setValue("bio", content)}
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
