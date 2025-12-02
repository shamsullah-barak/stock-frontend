import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Container, Typography } from '@mui/material';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

import { LoginForm } from './index';

// ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
}));

const StyledContent = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

export default function LoginPage() {
  const { login, user } = useAuth();
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [timer, setTimer] = useState(0);
  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    // Load previous state if it exists
    const storedTime = localStorage.getItem('disableTime');
    if (storedTime) {
      const diff = Date.now() - parseInt(storedTime, 10);
      if (diff < 15 * 60 * 1000) {
        setIsButtonDisabled(true);
        setTimer(Math.ceil((15 * 60 * 1000 - diff) / 1000));
        const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);

        // Automatically re-enable after timer ends
        setTimeout(() => {
          clearInterval(interval);
          setIsButtonDisabled(false);
          localStorage.removeItem('disableTime');
        }, 15 * 60 * 1000 - diff);
      }
    }
  }, []);

  if (user) {
    if (user.role === 'admin') {
      return <Navigate to={'/users'} replace />;
    }

    if (user.role === 'customer') {
      return <Navigate to={'/stocks'} replace />;
    }

    if (user.role === 'user') return <Navigate to={'/province-stocks'} replace />;
  }

  const loginUser = (email, password) => {
    if (email === '' || password === '') {
      toast.error('Please enter email and password');
    } else {
      axios
        .post(`http://localhost:5000/api/auth/login`, { email, password })
        .then((response) => {
          // handle success
          if (response.status === 200) {
            toast.success(`Successfully logged in as ${response.data.user.name}`);
            login(response.data);
          }
        })
        .catch((error) => {
          toast.error(error.response.data.message);

          if (error.response.status === 429) {
            setIsButtonDisabled(true);
            setTimer(15 * 60);
            localStorage.setItem('disableTime', Date.now().toString());

            const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);

            setTimeout(() => {
              clearInterval(interval);
              setIsButtonDisabled(false);
              setRequestCount(0);
              localStorage.removeItem('disableTime');
            }, 15 * 60 * 1000);
          }
        });
    }
  };

  return (
    <>
      <StyledRoot>
        <Container maxWidth="sm" sx={{ marginTop: '80px' }}>
          <StyledContent>
            <Typography variant="h3" textAlign="center" gutterBottom paddingBottom={3}>
              Sign in
            </Typography>

            <div style={{ marginTop: '20px', marginBottom: '20px', fontSize: '20px', textAlign: 'center' }}>
              {isButtonDisabled
                ? `To Many requests. Try again in ${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, '0')}`
                : ''}
            </div>
            <LoginForm loginUser={loginUser} isDisabled={isButtonDisabled} />
          </StyledContent>
        </Container>
      </StyledRoot>
    </>
  );
}
