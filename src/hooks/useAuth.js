import { createContext, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useLocalStorage } from './useLocalStorage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useLocalStorage('user', null);
  const [tokens, setTokens] = useLocalStorage('tokens', null);
  const navigate = useNavigate();

  const login = async (data) => {
    setUser(data?.user);
    setTokens(data?.tokens);
    // navigate('/users', { replace: true });
    if (user) {
      if (user.role === 'admin') {
        return navigate('/users', { replace: true });
      }

      if (user.role === 'customer') {
        // return <Navigate to={'/stocks'} replace />;
        return navigate('/stocks', { replace: true });
      }

      if (user.role === 'user') {
        // return <Navigate to={'/manage-stocks'} replace />;
        navigate('/manage-stocks', { replace: true });
      }
    }

    navigate('/users', { replace: true });
  };

  const logout = () => {
    setUser(null);
    navigate('/login', { replace: true });
  };

  const value = useMemo(
    () => ({
      user,
      tokens,
      login,
      logout,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, tokens]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node,
};

export const useAuth = () => useContext(AuthContext);
