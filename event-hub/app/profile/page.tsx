"use client";

import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import { Button, Container, Input } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import t from "@/lib/i18n";
import { useSession } from "next-auth/react";
import { useState } from "react";

const profileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  affiliation: z.string(),
  occupation: z.string(),
  bio: z.string(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const formFields = [
  {
    name: "firstName",
    label: "First Name",
    type: "text",
    editable: true,
    gridCol: true,
  },
  {
    name: "lastName",
    label: "Last Name",
    type: "text",
    editable: true,
    gridCol: true,
  },
  {
    name: "affiliation",
    label: "Affiliation",
    type: "text",
    editable: true,
    gridCol: false,
  },
  {
    name: "occupation",
    label: "Occupation",
    type: "text",
    editable: true,
    gridCol: false,
  },
  {
    name: "bio",
    label: "Personal Bio",
    type: "text",
    editable: true,
    gridCol: false,
  },
] as const;

export default function ProfilePage() {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: session?.user?.firstName || "",
      lastName: session?.user?.lastName || "",
      affiliation: session?.user?.affiliation || "",
      occupation: session?.user?.occupation || "",
      bio: session?.user?.bio || "",
    },
  });

  function onSubmit(data: ProfileFormValues) {
    console.log(data);
    setIsEditing(false);
  }

  if (!session) {
    return (
      <MainLayout>
        <Container className="py-12 md:py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold">
              Please login to view your profile
            </h1>
            <Button className="mt-4" asChild>
              <Link href="/login">Login</Link>
            </Button>
          </div>
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
              <CardTitle className="text-2xl font-bold">
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      {formFields
                        .filter((field) => field.gridCol)
                        .map((field) => (
                          <FormField
                            key={field.name}
                            control={form.control}
                            name={field.name}
                            render={({ field: fieldProps }) => (
                              <FormItem>
                                <FormLabel>{field.label}</FormLabel>
                                <FormControl>
                                  <Input
                                    type={field.type}
                                    placeholder={field.label}
                                    {...fieldProps}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        ))}
                    </div>

                    <div>
                      <div className="font-medium text-sm">Email</div>
                      <div className="mt-1">{session.user?.email}</div>
                    </div>

                    <hr className="my-4 border-gray-200" />

                    {formFields
                      .filter((field) => !field.gridCol)
                      .map((field) => (
                        <FormField
                          key={field.name}
                          control={form.control}
                          name={field.name}
                          render={({ field: fieldProps }) => (
                            <FormItem>
                              <FormLabel>{field.label}</FormLabel>
                              <FormControl>
                                <Input
                                  type={field.type}
                                  placeholder={field.label}
                                  {...fieldProps}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      ))}

                    <div className="flex gap-4">
                      <Button type="submit" className="flex-1">
                        Update Profile
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="font-medium text-sm">First Name</div>
                      <div className="mt-1">
                        {session.user?.firstName || "Not specified"}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-sm">Last Name</div>
                      <div className="mt-1">
                        {session.user?.lastName || "Not specified"}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="font-medium text-sm">Email</div>
                    <div className="mt-1 flex items-center justify-between">
                      <span>{session.user?.email}</span>
                      <Button className="w-50">Change Email Preference</Button>
                    </div>
                  </div>

                  <hr className="my-4 border-gray-200" />

                  <div>
                    <div className="font-medium text-sm">Affiliation</div>
                    <div className="mt-1">
                      {session.user?.affiliation || "Not specified"}
                    </div>
                  </div>

                  <div>
                    <div className="font-medium text-sm">Occupation</div>
                    <div className="mt-1">
                      {session.user?.occupation || "Not specified"}
                    </div>
                  </div>

                  <div>
                    <div className="font-medium text-sm">Personal Bio</div>
                    <div className="mt-1">
                      {session.user?.bio || "Not specified"}
                    </div>
                  </div>

                  <Button onClick={() => setIsEditing(true)} className="w-full">
                    Edit Profile
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Container>
    </MainLayout>
  );
}
