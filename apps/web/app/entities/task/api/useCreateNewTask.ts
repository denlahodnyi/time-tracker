import { useMutation } from '@tanstack/react-query';

function useCreateNewTask() {
  const {} = useMutation({
    mutationFn: () => {},
  });
}

export default useCreateNewTask;
