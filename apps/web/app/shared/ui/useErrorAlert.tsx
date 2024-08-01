import { BadgeAlert } from 'lucide-react';
import { useEffect } from 'react';

import { toast } from './toaster';

export function useErrorAlert(error?: string | null) {
  useEffect(() => {
    if (error) {
      toast.error('Error', {
        description: error,
        icon: <BadgeAlert />,
      });
    }
  }, [error]);
}
