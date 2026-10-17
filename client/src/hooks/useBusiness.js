import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import businessService from '../services/businessService';
import useBusinessStore from '../store/businessStore';
import useToastStore from '../store/toastStore';
import useAuthStore from '../store/authStore';

export const useBusiness = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const { businesses, activeBusiness, activeRole, setBusinesses, setActiveBusiness, updateActiveBusiness } =
    useBusinessStore();
  const { addToast } = useToastStore();

  const businessId = activeBusiness?.id || activeBusiness?._id;

  // Query: My Workspaces
  const myBusinessesQuery = useQuery({
    queryKey: ['myBusinesses'],
    queryFn: async () => {
      const res = await businessService.getMyBusinesses();
      setBusinesses(res.data || []);
      return res.data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  // Query: Active Workspace Details
  const activeBusinessDetailsQuery = useQuery({
    queryKey: ['activeBusinessDetails', businessId],
    queryFn: async () => {
      const res = await businessService.getCurrentBusiness();
      return res.data;
    },
    enabled: isAuthenticated && !!businessId,
    staleTime: 2 * 60 * 1000,
  });

  // Query: Workspace Members
  const membersQuery = useQuery({
    queryKey: ['businessMembers', businessId],
    queryFn: async () => {
      const res = await businessService.getMembers();
      return res.data;
    },
    enabled: isAuthenticated && !!businessId,
    staleTime: 60 * 1000,
  });

  // Mutation: Create Business
  const createBusinessMutation = useMutation({
    mutationFn: (data) => businessService.createBusiness(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['myBusinesses'] });
      setActiveBusiness(res.data.business);
      addToast({
        type: 'success',
        title: 'Workspace Created',
        message: `Workspace "${res.data.business.name}" is ready!`,
      });
    },
    onError: (err) => {
      addToast({
        type: 'error',
        title: 'Workspace Creation Failed',
        message: err.message || 'Could not create workspace.',
      });
    },
  });

  // Mutation: Update Business
  const updateBusinessMutation = useMutation({
    mutationFn: (data) => businessService.updateCurrentBusiness(data),
    onSuccess: (res) => {
      updateActiveBusiness(res.data);
      queryClient.invalidateQueries({ queryKey: ['activeBusinessDetails', businessId] });
      addToast({
        type: 'success',
        title: 'Workspace Updated',
        message: 'Business settings saved successfully.',
      });
    },
    onError: (err) => {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message || 'Could not update workspace.',
      });
    },
  });

  // Mutation: Invite Member
  const inviteMemberMutation = useMutation({
    mutationFn: (data) => businessService.inviteMember(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['businessMembers', businessId] });
      addToast({
        type: 'success',
        title: 'Invitation Sent',
        message: res.message || 'User invited to workspace.',
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

  // Mutation: Update Member Role
  const updateMemberRoleMutation = useMutation({
    mutationFn: ({ memberId, data }) => businessService.updateMemberRole(memberId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessMembers', businessId] });
      addToast({
        type: 'success',
        title: 'Role Updated',
        message: 'Member permissions updated.',
      });
    },
    onError: (err) => {
      addToast({
        type: 'error',
        title: 'Update Role Failed',
        message: err.message || 'Could not update member role.',
      });
    },
  });

  // Mutation: Remove Member
  const removeMemberMutation = useMutation({
    mutationFn: (memberId) => businessService.removeMember(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessMembers', businessId] });
      addToast({
        type: 'success',
        title: 'Member Removed',
        message: 'User removed from workspace.',
      });
    },
    onError: (err) => {
      addToast({
        type: 'error',
        title: 'Remove Failed',
        message: err.message || 'Could not remove member.',
      });
    },
  });

  return {
    businesses,
    activeBusiness,
    activeRole,
    setActiveBusiness,
    members: membersQuery.data || [],
    isLoadingMembers: membersQuery.isLoading,
    workspaceDetails: activeBusinessDetailsQuery.data,
    isLoadingWorkspace: activeBusinessDetailsQuery.isLoading,
    createBusiness: createBusinessMutation.mutateAsync,
    updateBusiness: updateBusinessMutation.mutateAsync,
    inviteMember: inviteMemberMutation.mutateAsync,
    updateMemberRole: updateMemberRoleMutation.mutateAsync,
    removeMember: removeMemberMutation.mutateAsync,
    isCreatingBusiness: createBusinessMutation.isPending,
    isUpdatingBusiness: updateBusinessMutation.isPending,
  };
};

export default useBusiness;
