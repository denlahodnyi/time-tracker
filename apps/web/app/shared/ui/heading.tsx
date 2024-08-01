import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../lib';

const headingVariants = cva('', {
  variants: {
    type: {
      h1: 'text-5xl',
      h2: 'text-4xl',
      h3: 'text-3xl',
      h4: 'text-2xl',
      h5: 'text-xl',
      h6: 'text-lg',
    },
  },
});

type HeadingTags = `h${1 | 2 | 3 | 4 | 5 | 6}`;

interface HeadingProps extends VariantProps<typeof headingVariants> {
  as?: HeadingTags;
  className?: string;
  children?: React.ReactNode;
}

function Heading({ as = 'h1', className, children }: HeadingProps) {
  const Comp = as;

  return (
    <Comp className={cn(headingVariants({ className, type: as }))}>
      {children}
    </Comp>
  );
}

export { Heading, type HeadingProps };
