'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { userApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { UserModal } from '@/components/dashboard/UserModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { toast } from '@/components/ui/toaster';
import { formatDate } from '@/lib/utils';
import {
  Users,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  Shield,
  ShieldCheck,
} from 'lucide-react';

export default function UsersPage() {
  const { user: currentUser, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (roleFilter && roleFilter !== 'all') params.role = roleFilter;

      const res = await userApi.getAll(params);
      setUsers(res.data?.users || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleOpenCreate = () => {
    setSelectedUser(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleOpenDelete = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      await userApi.delete(userToDelete._id);
      toast.success(`User "${userToDelete.name}" deleted successfully!`);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            User Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage registered accounts, roles, and permissions across the platform.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            className="gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {isAdmin && (
            <Button
              variant="gradient"
              size="sm"
              onClick={handleOpenCreate}
              className="gap-1.5 shadow-md shadow-blue-500/20"
            >
              <UserPlus className="h-4 w-4" />
              Add User
            </Button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="border-border/80 bg-card/60 backdrop-blur-sm p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search users by name or email..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-44">
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins</option>
              <option value="user">Standard Users</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="border-border/80 bg-card/70 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-12 w-full animate-pulse rounded bg-muted/40" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Users}
                title="No users found"
                description="No users matched your query or filter criteria."
                actionText="Reset Filters"
                onAction={() => {
                  setSearch('');
                  setRoleFilter('all');
                }}
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[35%]">User</TableHead>
                  <TableHead className="w-[30%]">Email Address</TableHead>
                  <TableHead className="w-[15%]">Role</TableHead>
                  <TableHead className="w-[20%] text-right">Registered / Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => {
                  const isSelf = currentUser?._id === u._id;
                  const canEdit = isAdmin || isSelf;
                  const canDelete = isAdmin && !isSelf;

                  return (
                    <TableRow key={u._id}>
                      <TableCell className="font-semibold text-foreground">
                        <div className="flex items-center space-x-3">
                          <Avatar name={u.name} size="default" />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="truncate">{u.name}</span>
                              {isSelf && (
                                <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                                  You
                                </Badge>
                              )}
                            </div>
                            <span className="text-[11px] font-normal text-muted-foreground">
                              ID: {u._id.slice(-6)}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm font-mono">
                        {u.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={u.role === 'admin' ? 'info' : 'secondary'}
                          className="capitalize gap-1 text-xs"
                        >
                          {u.role === 'admin' && <ShieldCheck className="h-3 w-3 text-sky-400" />}
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <span className="text-xs text-muted-foreground hidden sm:inline mr-2">
                            {formatDate(u.createdAt)}
                          </span>
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(u)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                              title="Edit User"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDelete(u)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                              title="Delete User"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* User Modal */}
      <UserModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        targetUser={selectedUser}
        onSaved={fetchUsers}
      />

      {/* Delete User Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete User Account"
        description={`Are you sure you want to permanently remove "${userToDelete?.name}" from the system?`}
        confirmText="Delete Account"
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
