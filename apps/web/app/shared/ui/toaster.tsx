import { Toaster as Sonner, toast } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="top-right"
      theme="system"
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            'group base-group bg-background text-foreground border-border shadow-lg [&.error-group]:border-1 [&.error-group]:border-destructive',
          title: 'group-[.error-group]:text-destructive',
          description: 'group-[.base-group]:text-muted-foreground',
          actionButton:
            'group-[.base-group]:bg-primary group-[.base-group]:text-primary-foreground',
          cancelButton:
            'group-[.base-group]:bg-muted group-[.base-group]:text-muted-foreground',
          icon: 'w-auto text-primary group-[.error-group]:text-destructive',
          error: 'error-group',
          success: 'success-group',
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
