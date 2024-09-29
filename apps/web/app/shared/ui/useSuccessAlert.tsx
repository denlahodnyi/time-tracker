import { PartyPopperIcon } from 'lucide-react';
import { useEffect } from 'react';

import { toast } from './toaster';

export function showSuccessToast(message: string) {
  return toast.success('Success', {
    description: message,
    icon: <PartyPopperIcon />,
  });
}

export function useSuccessAlert(message?: string | null) {
  useEffect(() => {
    if (message) {
      showSuccessToast(message);
    }
  }, [message]);
}
