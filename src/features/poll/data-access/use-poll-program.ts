import { useSolana } from '@/components/solana/use-solana'
import { useMemo } from 'react'

export function usePollProgram() {
  const { account } = useSolana()
  
  const programId = useMemo(() => {
    return 'F3cGjvGtWfEFGsRTDwmTvD8LAiJ8h8MyXBxhDQc1hyEs'
  }, [])

  return { programId, account }
}
