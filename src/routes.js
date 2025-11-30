import { Navigate, useRoutes } from 'react-router-dom';
import MainDashboard from './layouts/dashboard';
import LoginPage from './sections/auth/login/LoginPage';
import Page404 from './pages/Page404';
import UsersPage from './sections/@dashboard/user/UserPage';
import { useAuth } from './hooks/useAuth';

// ----------------------------------------------------------------------

export default function Router() {
  const { user } = useAuth();

  const memberRoutes = useRoutes([
    {
      path: '/',
      element: <MainDashboard />,
      children: [{ path: 'users', element: <UsersPage /> }],
    },
    {
      path: 'login',
      element: <LoginPage />,
    },
    {
      path: '404',
      element: <Page404 />,
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);

  const guestRoutes = useRoutes([
    {
      path: '/',
      element: <Navigate to="/login" replace />,
    },
    {
      path: '/login',
      element: <LoginPage />,
    },
  ]);

  if (!user) {
    return guestRoutes;
  }
  return memberRoutes;
}
