import { MainLayout } from "@/components/layout/main-layout";
import { Container } from "@/components/ui";
import { RoleManagementActions } from "@/components/ui/role-management-actions";
import { getTokenForServerComponent } from '@/lib/auth/auth';
import { spacing, text } from "@/lib/theme";
import { assignStaffRole, getUserById, getUsersByRole, unassignStaffRole } from "@/lib/users/users";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

async function onAssign(formData: FormData): Promise<string> {
  'use server';
  const userId = formData.get('userId') as string;
  if (!userId) return '';
  await assignStaffRole(userId);
  return 'Staff role assigned successfully!';
}

async function onUnassign(formData: FormData): Promise<string> {
  'use server';
  const userId = formData.get('userId') as string;
  const currentUserId = formData.get('currentUserId') as string;
  if (!userId || !currentUserId) return '';
  if (userId === currentUserId) {
    return ''; // Prevent unassigning self
  }
  await unassignStaffRole(userId);
  return 'Staff role unassigned successfully!';
}

export default async function RoleManagementPage() {
  const token = await getTokenForServerComponent();
  const id = token.id;
  if (!id) {
    redirect("/login");
  }

  // Get current user to check role
  const currentUser = await getUserById(id);

  if (!currentUser || currentUser.role !== 'STAFF') {
    redirect("/");
  }

  // Get all users
  const staffUsers = await getUsersByRole(UserRole.STAFF);
  const lecturerUsers = await getUsersByRole(UserRole.LECTURER);
  const regularUsers = await getUsersByRole(UserRole.USER);
  const users = [...staffUsers, ...lecturerUsers, ...regularUsers].sort((a, b) => 
    a.createdAt.getTime() - b.createdAt.getTime()
  );

  return (
    <MainLayout>
      <Container className="py-10">
        <div className={`flex flex-col ${spacing.lg}`}>
          <div className="mb-6">
            <h1 className={`font-bold tracking-tight ${text["3xl"]}`}>
              Role Management
            </h1>
            <p className="text-muted-foreground">
              Manage user roles and permissions
            </p>
          </div>

          <div className="rounded-md border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[200px]">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[200px]">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[200px]">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[200px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap w-[200px]">
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap w-[200px]">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap w-[200px]">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'STAFF'
                          ? 'bg-green-100 text-green-800'
                          : user.role === 'LECTURER'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm w-[200px]">
                      {user.id === users[0].id ? (
                        <div className="text-gray-500">System Default</div>
                      ) : (
                        <RoleManagementActions
                          user={user}
                          currentUserId={id}
                          onAssign={onAssign}
                          onUnassign={onUnassign}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Container>
    </MainLayout>
  );
}