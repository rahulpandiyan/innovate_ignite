'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg data-[type=success]:!bg-[#1a3a8b] data-[type=success]:!text-white data-[type=error]:!bg-[#7f1d1d] data-[type=error]:!text-white data-[type=info]:!bg-[#1a3a8b] data-[type=info]:!text-white',
          description: 'group-[.toast]:!text-white/80 group-data-[type=success]:!text-white/80 group-data-[type=error]:!text-white/80',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
        style: {
          background: '#1a3a8b',
          color: '#ffffff',
          border: '1px solid #2362ec',
        } as React.CSSProperties,
      }}
      {...props}
    />
  );
};

export { Toaster };
