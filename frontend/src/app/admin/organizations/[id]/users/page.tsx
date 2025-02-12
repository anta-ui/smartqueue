"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useCache } from "@/hooks/cache/useCache";
import { Card, CardHeader, CardContent } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/common/Table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/common/Dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/common/DropdownMenu";
import {
  UserPlusIcon,
  MagnifyingGlassIcon,
  EllipsisHorizontalIcon,
  EnvelopeIcon,
  KeyIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import type { User, UserInvitation, UserRole, UserStatus } from "@/types/user";

const roleColors: Record<UserRole, string> = {
  admin: "bg-red-100 text-red-800",
  manager: "bg-blue-100 text-blue-800",
  agent: "bg-green-100 text-green-800",
  viewer: "bg-gray-100 text-gray-800",
};

const statusColors: Record<UserStatus, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
  blocked: "bg-red-100 text-red-800",
};

export default function UsersPage() {
  const params = useParams();
  const [search, setSearch] = useState("");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: "",
    role: "agent" as UserRole,
  });

  const { data: users, loading, refresh } = useCache<{
    users: User[];
    invitations: UserInvitation[];
  }>({
    key: `organization_${params.id}_users`,
    fetchData: async () => {
      const response = await fetch(
        `/api/admin/organizations/${params.id}/users?search=${search}`
      );
      return response.json();
    },
  });

  const handleInviteUser = async () => {
    try {
      const response = await fetch(
        `/api/admin/organizations/${params.id}/users/invite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(inviteData),
        }
      );

      if (response.ok) {
        refresh();
        setShowInviteDialog(false);
        setInviteData({ email: "", role: "agent" });
      }
    } catch (error) {
      console.error("Failed to invite user:", error);
    }
  };

  const handleAction = async (action: string, user: User) => {
    try {
      let endpoint = "";
      let method = "POST";

      switch (action) {
        case "reset-password":
          endpoint = `/api/admin/organizations/${params.id}/users/${user.id}/reset-password`;
          break;
        case "block":
          endpoint = `/api/admin/organizations/${params.id}/users/${user.id}/block`;
          break;
        case "unblock":
          endpoint = `/api/admin/organizations/${params.id}/users/${user.id}/unblock`;
          break;
        case "delete":
          endpoint = `/api/admin/organizations/${params.id}/users/${user.id}`;
          method = "DELETE";
          break;
      }

      const response = await fetch(endpoint, { method });
      if (response.ok) {
        refresh();
      }
    } catch (error) {
      console.error("Failed to perform action:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users</h1>
        <Button onClick={() => setShowInviteDialog(true)}>
          <UserPlusIcon className="h-5 w-5 mr-2" />
          Invite User
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {users?.invitations.map((invitation) => (
                    <TableRow key={invitation.id} className="bg-gray-50">
                      <TableCell>
                        <div>
                          <div className="font-medium">{invitation.email}</div>
                          <div className="text-sm text-gray-500">Invited</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            roleColors[invitation.role]
                          }`}
                        >
                          {invitation.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      </TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            // Renvoyer l'invitation
                          }}
                        >
                          <EnvelopeIcon className="h-5 w-5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users?.users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt=""
                              className="h-8 w-8 rounded-full mr-3"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
                              <span className="text-gray-500 font-medium">
                                {user.firstName[0]}
                                {user.lastName[0]}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            roleColors[user.role]
                          }`}
                        >
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            statusColors[user.status]
                          }`}
                        >
                          {user.status}
                        </span>
                      </TableCell>
                      <TableCell>{user.department || "-"}</TableCell>
                      <TableCell>
                        {user.lastLoginAt
                          ? new Date(user.lastLoginAt).toLocaleDateString()
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <EllipsisHorizontalIcon className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleAction("reset-password", user)
                              }
                            >
                              <KeyIcon className="h-4 w-4 mr-2" />
                              Reset Password
                            </DropdownMenuItem>
                            {user.status !== "blocked" ? (
                              <DropdownMenuItem
                                onClick={() => handleAction("block", user)}
                                className="text-red-600"
                              >
                                <NoSymbolIcon className="h-4 w-4 mr-2" />
                                Block User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleAction("unblock", user)}
                              >
                                Unblock User
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal d'invitation */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite New User</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleInviteUser();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-1">
                Email Address
              </label>
              <Input
                type="email"
                value={inviteData.email}
                onChange={(e) =>
                  setInviteData((prev) => ({ ...prev, email: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <Select
                value={inviteData.role}
                onChange={(e) =>
                  setInviteData((prev) => ({
                    ...prev,
                    role: e.target.value as UserRole,
                  }))
                }
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="agent">Agent</option>
                <option value="viewer">Viewer</option>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowInviteDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Send Invitation</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
