import { useQuery } from '@tanstack/react-query'
import { getUsers } from '../lib/api/endpoints'
import { queryKeys } from '../lib/queryKeys'

export function useUsers(enabled = true) {
  return useQuery({
    queryKey: queryKeys.users(),
    queryFn: ({ signal }) => getUsers({ signal }),
    staleTime: Infinity,
    enabled,
  })
}
