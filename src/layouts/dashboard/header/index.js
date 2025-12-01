import PropTypes from 'prop-types';
// @mui
import { styled } from '@mui/material/styles';
import { AppBar, Box, IconButton, Stack, Toolbar } from '@mui/material';
import { MenuOpen } from '@mui/icons-material';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
// utils
import { bgBlur } from '../../../utils/cssStyles';
import AccountPopover from './AccountPopover';
import { fetchCustomers, fetchProvinces, fetchStockRequests, fetchUsers } from '../../../store/slices/action';
import { useAuth } from '../../../hooks/useAuth';

// ----------------------------------------------------------------------

const NAV_WIDTH = 278;

const HEADER_MOBILE = 64;

const HEADER_DESKTOP = 92;

// const StyledRoot = styled(AppBar)(({ theme }) => ({
//   ...bgBlur({ color: theme.palette.background.default }),
//   boxShadow: 'none',
//   [theme.breakpoints.up('lg')]: {
//     width: `calc(100% - ${NAV_WIDTH + 1}px)`,
//   },
// }));
const StyledRoot = styled(AppBar)(({ theme }) => ({
  ...bgBlur({ color: theme.palette.background.default }),
  backgroundImage: 'linear-gradient( to bottom right, #408ee0 20%, #1c3c78 100%)',
  boxShadow: 'none',
  [theme.breakpoints.up('lg')]: {
    width: `calc(100% - ${NAV_WIDTH + 1}px)`,
  },
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  minHeight: HEADER_MOBILE,
  [theme.breakpoints.up('lg')]: {
    minHeight: HEADER_DESKTOP,
    padding: theme.spacing(0, 5),
  },
}));

// ----------------------------------------------------------------------

Header.propTypes = {
  onOpenNav: PropTypes.func,
};

export default function Header({ onOpenNav }) {
  const dispatch = useDispatch();
  const { tokens } = useAuth();

  useEffect(() => {
    const loadData = () => {
      dispatch(fetchProvinces(tokens.access.token));
      dispatch(fetchCustomers(tokens.access.token));
      dispatch(fetchUsers(tokens.access.token));
      dispatch(fetchStockRequests(tokens.access.token));
    };
    loadData();
  });

  return (
    <StyledRoot>
      <StyledToolbar>
        <IconButton
          onClick={onOpenNav}
          sx={{
            mr: 1,
            color: 'white',
            display: { lg: 'none' },
            backgroundColor: 'black',
          }}
        >
          <MenuOpen />
        </IconButton>

        <Box sx={{ flexGrow: 1 }} />

        <Stack
          direction="row"
          alignItems="center"
          spacing={{
            xs: 0.5,
            sm: 1,
          }}
        >
          <AccountPopover />
        </Stack>
      </StyledToolbar>
    </StyledRoot>
  );
}
