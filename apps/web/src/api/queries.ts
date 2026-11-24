import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, HealthResponse } from './client.js';
import type { AnyMachine, SavedMachineEntity } from '@automatalab/contracts';

export const MACHINE_KEYS = {
  all: ['machines'] as const,
  lists: () => [...MACHINE_KEYS.all, 'list'] as const,
  list: (type?: 'mealy' | 'moore') => [...MACHINE_KEYS.lists(), { type }] as const,
  details: () => [...MACHINE_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...MACHINE_KEYS.details(), id] as const,
};

export const SYSTEM_KEYS = {
  health: ['system', 'health'] as const,
};

export function useHealthQuery() {
  return useQuery<HealthResponse, Error>({
    queryKey: SYSTEM_KEYS.health,
    queryFn: () => api.getHealth(),
    refetchInterval: 30000,
    retry: 1,
  });
}

export function useMachinesQuery(type?: 'mealy' | 'moore') {
  return useQuery<SavedMachineEntity[], Error>({
    queryKey: MACHINE_KEYS.list(type),
    queryFn: () => api.listMachines(type),
  });
}

export function useMachineQuery(id: string | undefined) {
  return useQuery<SavedMachineEntity, Error>({
    queryKey: MACHINE_KEYS.detail(id || ''),
    queryFn: () => api.getMachine(id!),
    enabled: Boolean(id),
  });
}

export function useCreateMachineMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (machine: AnyMachine) => api.createMachine(machine),
    onSuccess: (created) => {
      queryClient.setQueryData(MACHINE_KEYS.detail(created.id), created);
      return queryClient.invalidateQueries({ queryKey: MACHINE_KEYS.lists() });
    },
  });
}

export function useDeleteMachineMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteMachine(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MACHINE_KEYS.lists() });
    },
  });
}
