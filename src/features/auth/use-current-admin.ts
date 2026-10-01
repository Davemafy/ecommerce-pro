import { useQuery } from '@tanstack/react-query';
import { authService, unwrapData } from '../../api/services';

export function useCurrentAdmin() {
  return useQuery({
    queryKey: ['current-admin'],
    queryFn: async () => unwrapData<any>(await authService.me()),
    staleTime: 60_000,
    retry: false,
  });
}
