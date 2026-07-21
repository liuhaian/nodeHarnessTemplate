import { lazy, Suspense } from 'react';
import { Spin } from 'antd';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';

const HomePage = lazy(() =>
  import('@/features/home').then((m) => ({ default: m.HomePage })),
);
const UsersPage = lazy(() =>
  import('@/features/users').then((m) => ({ default: m.UsersPage })),
);

function withSuspense(node: React.ReactNode): React.ReactElement {
  return (
    <Suspense
      fallback={
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Spin />
        </div>
      }
    >
      {node}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: withSuspense(<HomePage />) },
      { path: 'users', element: withSuspense(<UsersPage />) },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
