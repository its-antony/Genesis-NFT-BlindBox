'use client';

import { ReactNode } from 'react';
import { getPageTopPadding } from '@/utils/layout';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export function PageContainer({ children, className = '', id }: PageContainerProps) {
  const topPadding = getPageTopPadding();
  
  return (
    <section 
      id={id}
      className={`${topPadding} pb-20 ${className}`}
    >
      <div className="container mx-auto px-4">
        {children}
      </div>
    </section>
  );
}
