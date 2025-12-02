import { createContext, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useLocalStorage } from './useLocalStorage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useLocalStorage('user', null);
  const [tokens, setTokens] = useLocalStorage('tokens', null);
  const navigate = useNavigate();

  const login = (data) => {
    const nextUser = data?.user;
    const nextTokens = data?.tokens;

    setUser(nextUser);
    setTokens(nextTokens);

    // Redirect based on the *new* user's role
    if (nextUser?.role === 'admin') {
      navigate('/users', { replace: true });
      return;
    }
    if (nextUser?.role === 'customer') {
      navigate('/stocks', { replace: true });
      return;
    }
    if (nextUser?.role === 'user') {
      navigate('/province-stocks', { replace: true });
      return;
    }

    // Fallback
    navigate('/users', { replace: true });
  };

  const logout = () => {
    // Clear both user and tokens so UI & API checks stay in sync
    setUser(null);
    setTokens(null);
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
