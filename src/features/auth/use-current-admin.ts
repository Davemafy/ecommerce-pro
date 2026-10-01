import { useQuery } from '@tanstack/react-query';
import { authService, unwrapData } from '../../api/services';

export function useCurrentAdmin() {
  return useQuery({
    queryKey: ['current-admin'],
    queryFn: async () => {
      const data: any = unwrapData<any>(await authService.me());
      return data?.user || data?.admin || data;
    },
    staleTime: 60_000,
    retry: false,
  });
}
