import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App, ConfigProvider } from 'antd';
import { MemoryRouter } from 'react-router-dom';

interface TestProvidersProps {
  readonly children: ReactNode;
  readonly initialEntries?: readonly string[];
}

export function TestProviders({ children, initialEntries }: TestProvidersProps): JSX.Element {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity, gcTime: Infinity },
      mutations: { retry: false },
    },
  });

  return (
    <ConfigProvider>
      <App>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter {...(initialEntries ? { initialEntries: [...initialEntries] } : {})}>
            {children}
          </MemoryRouter>
        </QueryClientProvider>
      </App>
    </ConfigProvider>
  );
}
