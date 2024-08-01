import { PartyPopperIcon } from 'lucide-react';
import { useEffect } from 'react';

import { toast } from './toaster';

export function useSuccessAlert(message?: string | null) {
  useEffect(() => {
    if (message) {
      toast.success('Success', {
        description: message,
        icon: <PartyPopperIcon />,
      });
    }
  }, [message]);
}
