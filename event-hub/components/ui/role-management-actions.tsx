"use client";

import { Button } from "@/components/ui/button";

interface RoleManagementActionsProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  currentUserId: string;
  onAssign: (formData: FormData) => Promise<string>;
  onUnassign: (formData: FormData) => Promise<string>;
}

export function RoleManagementActions({
  user,
  currentUserId,
  onAssign,
  onUnassign,
}: RoleManagementActionsProps) {
  const handleSubmit = async (formData: FormData, action: (formData: FormData) => Promise<string>) => {
    const result = await action(formData);
    if (result) {
      alert(result);
    }
  };

  if (user.role === "STAFF") {
    if (user.id === currentUserId) {
      return (
        <div className="flex flex-col gap-1 w-[150px]">
          <Button variant="destructive" size="sm" disabled className="w-full">
            Unassign Staff Role
          </Button>
          <p className="text-xs text-muted-foreground">
            You cannot unassign yourself from this role
          </p>
        </div>
      );
    }

    return (
      <form className="w-[150px]">
        <input type="hidden" name="userId" value={user.id} />
        <input type="hidden" name="currentUserId" value={currentUserId} />
        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={async (e) => {
            e.preventDefault();
            const form = e.currentTarget.form;
            if (form) {
              await handleSubmit(new FormData(form), onUnassign);
            }
          }}
        >
          Unassign Staff Role
        </Button>
      </form>
    );
  }

  return (
    <form className="w-[120px]">
      <input type="hidden" name="userId" value={user.id} />
      <Button
        variant="default"
        size="sm"
        className="w-full"
        onClick={async (e) => {
          e.preventDefault();
          const form = e.currentTarget.form;
          if (form) {
            await handleSubmit(new FormData(form), onAssign);
          }
        }}
      >
        Assign Staff Role
      </Button>
    </form>
  );
} 