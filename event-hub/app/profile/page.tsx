// app/profile/page.tsx
// This is a client component that allows users to view and edit their profile information.

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getProfile } from "@/lib/profile/profile";
import { updateProfile } from "@/lib/profile/update";
import { MainLayout } from "@/components/layout/main-layout";
import { Container, Input, Button } from "@/components/ui";
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
    });
  }, [form]);

  async function onSubmit(data: ProfileFormValues) {
    try {
      const result = await updateProfile(data);
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
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing && profile ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {formFields.filter(f => f.gridCol).map(field => (
                        <FormField
                          key={field.name}
                          control={form.control}
                          name={field.name as keyof ProfileFormValues}
                          render={({ field: fieldProps }) => (
                            <FormItem>
                              <FormLabel>{field.label}</FormLabel>
                              <FormControl>
                                <Input type="text" {...fieldProps} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>

                    <div className="text-sm">
                      <FormLabel>Email</FormLabel>
                      <div>{profile.email || "Not specified"}</div>
                    </div>

                    <hr className="my-4 border-gray-200" />

                    {formFields.filter(f => !f.gridCol).map(field => (
                      <FormField
                        key={field.name}
                        control={form.control}
                        name={field.name as keyof ProfileFormValues}
                        render={({ field: fieldProps }) => (
                          <FormItem>
                            <FormLabel>{field.label}</FormLabel>
                            <FormControl>
                              <Input type="text" {...fieldProps} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    ))}

                    <div className="flex gap-4">
                      <Button type="submit" className="flex-1">Update Profile</Button>
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="flex-1">Cancel</Button>
                    </div>
                  </form>
                </Form>
              ) : profile ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium">First Name</div>
                      <div>{profile.firstName || "Not specified"}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Last Name</div>
                      <div>{profile.lastName || "Not specified"}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium">Email</div>
                    <div>{profile.email || "Not specified"}</div>
                  </div>

                  <hr className="my-4 border-gray-200" />

                  <div>
                    <div className="text-sm font-medium">Affiliation</div>
                    <div>{profile.affiliation || "Not specified"}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium">Occupation</div>
                    <div>{profile.occupancy || "Not specified"}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium">Personal Bio</div>
                    <div>{profile.expertise || "Not specified"}</div>
                  </div>

                  {profile.role === "LECTURER" && (
                    <div className="text-green-600 font-semibold">
                      ✓ You are a Lecturer
                    </div>
                  )}

                  <Button onClick={() => setIsEditing(true)} className="w-full">
                    Edit Profile
                  </Button>
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
