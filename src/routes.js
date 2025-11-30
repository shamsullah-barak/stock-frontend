import { Navigate, useRoutes } from 'react-router-dom';
import MainDashboard from './layouts/dashboard';
import LoginPage from './sections/auth/login/LoginPage';
import Page404 from './pages/Page404';
import UsersPage from './sections/@dashboard/user/UserPage';
import { useAuth } from './hooks/useAuth';
import Stocks from './sections/@dashboard/stocks';
import ManageStocks from './sections/@dashboard/stocks/manageStocks';
import ProvincePage from './sections/@dashboard/provinces/ProvincePage';

// ----------------------------------------------------------------------

export default function Router() {
  const { user } = useAuth();

  const adminRoutes = useRoutes([
    {
      path: '/',
      element: <MainDashboard />,
      children: [
        { path: 'users', element: <UsersPage /> },
        { path: 'provinces', element: <ProvincePage /> },
        { path: 'manage-stocks', element: <Stocks /> },
      ],
    },
    {
      path: 'login',
      element: <LoginPage />,
    },
    {
      path: '404',
      element: <Page404 />,
    },
    // {
    //   path: '*',
    //   element: <Navigate to="/404" replace />,
    // },
  ]);

  const provinceUserRoutes = useRoutes([
    {
      path: '/',
      element: <MainDashboard />,

      children: [{ path: 'manage-stocks', element: <ManageStocks /> }],
    },
    {
      path: 'login',
      element: <LoginPage />,
    },
    {
      path: '404',
      element: <Page404 />,
    },
    // {
    //   path: '*',
    //   element: <Navigate to="/404" replace />,
    // },
  ]);

  const customerRoutes = useRoutes([
    {
      path: '/',
      element: <MainDashboard />,
      children: [{ path: 'stocks', element: <Stocks /> }],
    },
    {
      path: 'login',
      element: <LoginPage />,
    },
    {
      path: '404',
      element: <Page404 />,
    },
    // {
    //   path: '*',
    //   element: <Navigate to="/404" replace />,
    // },
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

  if (user.role === 'admin') {
    return adminRoutes;
  }

  if (user.role === 'user') {
    return provinceUserRoutes;
  }

  if (user.role === 'customer') {
    return customerRoutes;
  }
  // return adminRoutes;
}
