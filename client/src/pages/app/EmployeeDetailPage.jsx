import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  IconArrowLeft,
  IconMail,
  IconPhone,
  IconBriefcase,
  IconBuildingSkyscraper,
  IconCalendar,
  IconShield,
  IconEdit,
} from '@tabler/icons-react';
import { Button, Badge, Spinner, Avatar, Alert, Input } from '../../components/ui';
import { useEmployeeDetails, useEmployeeMutations } from '../../hooks/useEmployees';
import useBusiness from '../../hooks/useBusiness';
import { MOCK_EMPLOYEES } from '../../data/mockData';

const EmployeeDetailPage = () => {
  const { employeeId } = useParams();
  const { activeRole } = useBusiness();
  const { data: employeeData, isLoading } = useEmployeeDetails(employeeId);
  const { updateEmployee, isUpdating } = useEmployeeMutations();

  const fallbackEmployee = MOCK_EMPLOYEES.find((e) => e._id === employeeId || e.id === employeeId) || MOCK_EMPLOYEES[0];
  const employee = employeeData || fallbackEmployee;

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: '',
    department: '',
    phone: '',
    bio: '',
    role: '',
    status: '',
  });

  const isOwner = activeRole === 'owner';
  const isManager = activeRole === 'manager';
  const canEdit = isOwner || isManager;

  const openEditModal = () => {
    setFormData({
      jobTitle: employee.jobTitle || '',
      department: employee.department || '',
      phone: employee.phone || '',
      bio: employee.bio || '',
      role: employee.role || 'employee',
      status: employee.status || 'ACTIVE',
    });
    setIsEditOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await updateEmployee({
      employeeId,
      data: formData,
    });
    setIsEditOpen(false);
  };

  if (isLoading && !employee) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-xs text-[var(--text-muted)]">Loading employee profile...</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <Alert variant="danger">
          Employee profile not found or access denied.
        </Alert>
        <Link to="/app/employees" className="inline-flex items-center gap-2 text-xs text-[#2563EB]">
          <IconArrowLeft size={16} stroke={1.75} /> Back to Team
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/app/employees"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <IconArrowLeft size={16} stroke={1.75} />
          <span>Back to Team</span>
        </Link>

        {canEdit && (
          <Button
            variant="secondary"
            size="sm"
            onClick={openEditModal}
            leftIcon={IconEdit}
          >
            Edit profile
          </Button>
        )}
      </div>

      {/* Profile Overview */}
      <div className="bg-[var(--surface-primary)] rounded-lg p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={employee.fullName} size="lg" src={employee.avatar} />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-[var(--text-primary)]">
                  {employee.fullName}
                </h1>
                <span className="text-xs capitalize text-[var(--text-secondary)] font-medium">
                  {employee.role}
                </span>
                <Badge variant={employee.status === 'ACTIVE' ? 'success' : 'default'}>
                  {employee.status}
                </Badge>
              </div>

              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {employee.jobTitle || 'Team Collaborator'}
                {employee.department && ` • ${employee.department}`}
              </p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-transparent text-xs">
          <div className="space-y-1">
            <span className="text-[var(--text-muted)] flex items-center gap-1.5">
              <IconMail size={14} stroke={1.75} className="text-[#2563EB]" />
              Work email
            </span>
            <span className="font-medium text-[var(--text-primary)] block truncate">
              {employee.email}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[var(--text-muted)] flex items-center gap-1.5">
              <IconPhone size={14} stroke={1.75} className="text-[#2563EB]" />
              Phone number
            </span>
            <span className="font-medium text-[var(--text-primary)] block">
              {employee.phone || '—'}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[var(--text-muted)] flex items-center gap-1.5">
              <IconShield size={14} stroke={1.75} className="text-[#2563EB]" />
              Employee code
            </span>
            <span className="font-medium text-[var(--text-primary)] block font-mono">
              {employee.employeeCode || '—'}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[var(--text-muted)] flex items-center gap-1.5">
              <IconCalendar size={14} stroke={1.75} className="text-[#2563EB]" />
              Joined workspace
            </span>
            <span className="font-medium text-[var(--text-primary)] block">
              {new Date(employee.joiningDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Professional Bio */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Professional Summary
          </h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {employee.bio ||
              'No professional summary provided.'}
          </p>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="max-w-md w-full rounded-lg bg-[var(--surface-primary)] p-6 shadow-2xl relative border-0">
            <h3 className="text-base font-semibold text-[var(--text-primary)] mb-0.5">
              Edit Employee Profile
            </h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Update employment details for {employee.fullName}.
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Job title"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                />
                <Input
                  label="Department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>

              <Input
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />

              {isOwner && employee.role !== 'owner' && (
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                    Role permission
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full h-9 px-3 text-xs rounded-md bg-[var(--surface-secondary)] border-0 text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Employment status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full h-9 px-3 text-xs rounded-md bg-[var(--surface-secondary)] border-0 text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Bio / Responsibilities
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-md bg-[var(--surface-secondary)] border-0 text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#2563EB] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" loading={isUpdating}>
                  Save changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetailPage;
