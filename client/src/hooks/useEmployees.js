import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import employeeService from '../services/employeeService';
import invitationService from '../services/invitationService';
import useToastStore from '../store/toastStore';
import useBusinessStore from '../store/businessStore';

export const useEmployeesList = (params = {}) => {
  const { activeBusiness } = useBusinessStore();
  const businessId = activeBusiness?.id || activeBusiness?._id;

  return useQuery({
    queryKey: ['employees', businessId, params],
    queryFn: async () => {
      const res = await employeeService.getEmployees(params);
      return res;
    },
    enabled: !!businessId,
  });
};

export const useEmployeeDetails = (employeeId) => {
  const { activeBusiness } = useBusinessStore();
  const businessId = activeBusiness?.id || activeBusiness?._id;

  return useQuery({
    queryKey: ['employee', businessId, employeeId],
    queryFn: async () => {
      const res = await employeeService.getEmployeeById(employeeId);
      return res.data;
    },
    enabled: !!businessId && !!employeeId,
  });
};

export const useInvitationsList = () => {
  const { activeBusiness } = useBusinessStore();
  const businessId = activeBusiness?.id || activeBusiness?._id;

  return useQuery({
    queryKey: ['invitations', businessId],
    queryFn: async () => {
      const res = await invitationService.getInvitations();
      return res.data;
    },
    enabled: !!businessId,
  });
};

export const useEmployeeMutations = () => {
  const queryClient = useQueryClient();
  const { activeBusiness } = useBusinessStore();
  const businessId = activeBusiness?.id || activeBusiness?._id;
  const { addToast } = useToastStore();

  const updateEmployeeMutation = useMutation({
    mutationFn: ({ employeeId, data }) => employeeService.updateEmployee(employeeId, data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees', businessId] });
      queryClient.invalidateQueries({ queryKey: ['employee', businessId, variables.employeeId] });
      queryClient.invalidateQueries({ queryKey: ['businessMembers', businessId] });
      addToast({
        type: 'success',
        title: 'Employee Updated',
        message: 'Employee profile updated successfully.',
      });
    },
    onError: (err) => {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message || 'Could not update employee.',
      });
    },
  });

  const inviteEmployeeMutation = useMutation({
    mutationFn: (data) => invitationService.inviteEmployee(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['invitations', businessId] });
      addToast({
        type: 'success',
        title: 'Invitation Dispatched',
        message: res.message || 'Invitation sent successfully.',
      });
    },
    onError: (err) => {
      addToast({
        type: 'error',
        title: 'Invite Failed',
        message: err.message || 'Could not send invitation.',
      });
    },
  });

  const resendInvitationMutation = useMutation({
    mutationFn: (invitationId) => invitationService.resendInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations', businessId] });
      addToast({
        type: 'success',
        title: 'Invitation Resent',
        message: 'New invitation link has been dispatched.',
      });
    },
    onError: (err) => {
      addToast({
        type: 'error',
        title: 'Resend Failed',
        message: err.message || 'Could not resend invitation.',
      });
    },
  });

  const revokeInvitationMutation = useMutation({
    mutationFn: (invitationId) => invitationService.revokeInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations', businessId] });
      addToast({
        type: 'info',
        title: 'Invitation Revoked',
        message: 'The invitation has been cancelled.',
      });
    },
    onError: (err) => {
      addToast({
        type: 'error',
        title: 'Revoke Failed',
        message: err.message || 'Could not revoke invitation.',
      });
    },
  });

  return {
    updateEmployee: updateEmployeeMutation.mutateAsync,
    inviteEmployee: inviteEmployeeMutation.mutateAsync,
    resendInvitation: resendInvitationMutation.mutateAsync,
    revokeInvitation: revokeInvitationMutation.mutateAsync,
    isUpdating: updateEmployeeMutation.isPending,
    isInviting: inviteEmployeeMutation.isPending,
  };
};
