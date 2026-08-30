'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { resourceApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ResourceModal } from '@/components/dashboard/ResourceModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { toast } from '@/components/ui/toaster';
import { formatDate } from '@/lib/utils';
import {
  FolderKanban,
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  Filter,
  Eye,
} from 'lucide-react';

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;

      const res = await resourceApi.getAll(params);
      setResources(res.data?.resources || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResources();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchResources]);

  const handleOpenCreate = () => {
    setSelectedResource(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (resource) => {
    setSelectedResource(resource);
    setModalOpen(true);
  };

  const handleOpenDelete = (resource) => {
    setResourceToDelete(resource);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!resourceToDelete) return;
    setDeleting(true);
    try {
      await resourceApi.delete(resourceToDelete._id);
      toast.success(`Resource "${resourceToDelete.name}" deleted successfully!`);
      setDeleteDialogOpen(false);
      setResourceToDelete(null);
      fetchResources();
    } catch (err) {
      toast.error(err.message || 'Failed to delete resource');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'inactive':
        return <Badge variant="destructive">Inactive</Badge>;
      case 'archived':
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Resource Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create, view, update, and delete generic resources mapped to MongoDB collections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchResources}
            className="gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="gradient"
            size="sm"
            onClick={handleOpenCreate}
            className="gap-1.5 shadow-md shadow-blue-500/20"
          >
            <Plus className="h-4 w-4" />
            Add Resource
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="border-border/80 bg-card/60 backdrop-blur-sm p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Bar */}
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search resources by name or description..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-48">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Resources Table */}
      <Card className="border-border/80 bg-card/70 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-12 w-full animate-pulse rounded bg-muted/40" />
              ))}
            </div>
          ) : resources.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={FolderKanban}
                title={search || statusFilter !== 'all' ? 'No matching resources' : 'No resources yet'}
                description={
                  search || statusFilter !== 'all'
                    ? 'Try clearing your search query or changing the status filter.'
                    : 'Create your first generic resource using the button below.'
                }
                actionText={search || statusFilter !== 'all' ? 'Clear Filters' : 'Add First Resource'}
                onAction={() => {
                  if (search || statusFilter !== 'all') {
                    setSearch('');
                    setStatusFilter('all');
                  } else {
                    handleOpenCreate();
                  }
                }}
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">Resource Name</TableHead>
                  <TableHead className="w-[30%]">Description</TableHead>
                  <TableHead className="w-[12%]">Status</TableHead>
                  <TableHead className="w-[13%]">Created By</TableHead>
                  <TableHead className="w-[15%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resources.map((res) => (
                  <TableRow key={res._id}>
                    <TableCell className="font-semibold text-foreground">
                      <div className="flex items-center space-x-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                          <FolderKanban className="h-4 w-4" />
                        </div>
                        <span className="truncate">{res.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      <span className="line-clamp-2">{res.description || '—'}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(res.status)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <div className="font-medium text-foreground">{res.createdBy?.name || 'System'}</div>
                      <div className="text-[10px] text-muted-foreground">{formatDate(res.createdAt)}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(res)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                          title="Edit Resource"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDelete(res)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          title="Delete Resource"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <ResourceModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        resource={selectedResource}
        onSaved={fetchResources}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Resource"
        description={`Are you sure you want to permanently delete "${resourceToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete Resource"
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
