import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';

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

interface HeadingProps
  extends VariantProps<typeof headingVariants>,
    React.HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingTags;
  className?: string;
  children?: React.ReactNode;
}

const Heading = forwardRef<HTMLParagraphElement, HeadingProps>(function Heading(
  { as = 'h1', className, children },
  ref,
) {
  const Comp = as;

  return (
    <Comp ref={ref} className={cn(headingVariants({ className, type: as }))}>
      {children}
    </Comp>
  );
});

Heading.displayName = 'Heading';

export { Heading, type HeadingProps };
