import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import customerService from '../services/customerService';
import useToastStore from '../store/toastStore';
import useBusinessStore from '../store/businessStore';

export const useCustomersList = (params = {}) => {
  const { activeBusiness } = useBusinessStore();
  const businessId = activeBusiness?.id || activeBusiness?._id;

  return useQuery({
    queryKey: ['customers', businessId, params],
    queryFn: async () => {
      const res = await customerService.getCustomers(params);
      return res;
    },
    enabled: !!businessId,
    placeholderData: (previousData) => previousData,
  });
};

export const useCustomerDetails = (customerId) => {
  const { activeBusiness } = useBusinessStore();
  const businessId = activeBusiness?.id || activeBusiness?._id;

  return useQuery({
    queryKey: ['customer', businessId, customerId],
    queryFn: async () => {
      const res = await customerService.getCustomerById(customerId);
      return res.data;
    },
    enabled: !!businessId && !!customerId,
  });
};

export const useCustomerNotes = (customerId) => {
  const { activeBusiness } = useBusinessStore();
  const businessId = activeBusiness?.id || activeBusiness?._id;

  return useQuery({
    queryKey: ['customerNotes', businessId, customerId],
    queryFn: async () => {
      const res = await customerService.getNotes(customerId);
      return res.data;
    },
    enabled: !!businessId && !!customerId,
  });
};

export const useCustomerActivity = (customerId) => {
  const { activeBusiness } = useBusinessStore();
  const businessId = activeBusiness?.id || activeBusiness?._id;

  return useQuery({
    queryKey: ['customerActivity', businessId, customerId],
    queryFn: async () => {
      const res = await customerService.getActivityTimeline(customerId);
      return res.data;
    },
    enabled: !!businessId && !!customerId,
  });
};

export const useCustomerMutations = () => {
  const queryClient = useQueryClient();
  const { activeBusiness } = useBusinessStore();
  const businessId = activeBusiness?.id || activeBusiness?._id;
  const { addToast } = useToastStore();

  const createCustomerMutation = useMutation({
    mutationFn: (data) => customerService.createCustomer(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['customers', businessId] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats', businessId] });
      addToast({
        type: 'success',
        title: 'Customer Added',
        message: `${res.data.firstName} ${res.data.lastName} added to CRM.`,
      });
    },
    onError: (err) => {
      addToast({
        type: 'error',
        title: 'Failed to Add Customer',
        message: err.message || 'Could not save customer.',
      });
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: ({ customerId, data }) => customerService.updateCustomer(customerId, data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers', businessId] });
      queryClient.invalidateQueries({ queryKey: ['customer', businessId, variables.customerId] });
      queryClient.invalidateQueries({ queryKey: ['customerActivity', businessId, variables.customerId] });
      addToast({
        type: 'success',
        title: 'Customer Updated',
        message: 'Changes saved successfully.',
      });
    },
    onError: (err) => {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message || 'Could not update customer.',
      });
    },
  });

  const archiveCustomerMutation = useMutation({
    mutationFn: (customerId) => customerService.archiveCustomer(customerId),
    onSuccess: (res, customerId) => {
      queryClient.invalidateQueries({ queryKey: ['customers', businessId] });
      queryClient.invalidateQueries({ queryKey: ['customer', businessId, customerId] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats', businessId] });
      addToast({
        type: 'info',
        title: 'Customer Archived',
        message: 'Customer moved to archives.',
      });
    },
    onError: (err) => {
      addToast({
        type: 'error',
        title: 'Archive Failed',
        message: err.message || 'Could not archive customer.',
      });
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: ({ customerId, data }) => customerService.addNote(customerId, data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customerNotes', businessId, variables.customerId] });
      queryClient.invalidateQueries({ queryKey: ['customerActivity', businessId, variables.customerId] });
      addToast({
        type: 'success',
        title: 'Note Added',
        message: 'Note logged to customer profile.',
      });
    },
    onError: (err) => {
      addToast({
        type: 'error',
        title: 'Note Failed',
        message: err.message || 'Could not save note.',
      });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: ({ customerId, noteId }) => customerService.deleteNote(customerId, noteId),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customerNotes', businessId, variables.customerId] });
      queryClient.invalidateQueries({ queryKey: ['customerActivity', businessId, variables.customerId] });
      addToast({
        type: 'info',
        title: 'Note Deleted',
        message: 'Note removed from customer profile.',
      });
    },
    onError: (err) => {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.message || 'Could not delete note.',
      });
    },
  });

  return {
    createCustomer: createCustomerMutation.mutateAsync,
    updateCustomer: updateCustomerMutation.mutateAsync,
    archiveCustomer: archiveCustomerMutation.mutateAsync,
    addNote: addNoteMutation.mutateAsync,
    deleteNote: deleteNoteMutation.mutateAsync,
    isCreating: createCustomerMutation.isPending,
    isUpdating: updateCustomerMutation.isPending,
    isArchiving: archiveCustomerMutation.isPending,
    isAddingNote: addNoteMutation.isPending,
  };
};
