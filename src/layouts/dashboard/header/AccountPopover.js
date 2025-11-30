import { useState } from 'react';
import { alpha } from '@mui/material/styles';
import { Avatar, Box, Divider, IconButton, MenuItem, Popover, Typography } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';

export default function AccountPopover() {
  const { user, tokens } = useAuth();
  const { logout } = useAuth();
  const [open, setOpen] = useState(null);

  const logoutUser = () => {
    handleClose();
    axios
      .post(`http://localhost:5000/api/auth/logout`, { refreshToken: tokens.refresh.token })
      .then((response) => {
        logout();
      })
      .catch((error) => {
        // handle error
        alert(error);
      });
  };

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  return (
    <>
      <IconButton
        onClick={handleOpen}
        sx={{
          p: 0,
          ...(open && {
            '&:before': {
              zIndex: 1,
              content: "''",
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              position: 'absolute',
            },
          }),
        }}
      >
        <Avatar src={user.photoUrl} alt={user.name} style={{ backgroundColor: 'black' }} />
      </IconButton>

      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 0,
            mt: 1.5,
            ml: 0.75,
            width: 180,
            '& .MuiMenuItem-root': {
              typography: 'body2',
              borderRadius: 0.75,
            },
          },
        }}
      >
        <Box sx={{ my: 1.5, px: 2.5 }}>
          <Typography variant="subtitle2" noWrap>
            {user.name}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {user.email}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        {/* <Stack sx={{ p: 1 }}> */}
        {/*  {MENU_OPTIONS.map((option) => ( */}
        {/*    <MenuItem key={option.label} onClick={handleClose}> */}
        {/*      {option.label} */}
        {/*    </MenuItem> */}
        {/*  ))} */}
        {/* </Stack> */}

        {/* <Divider sx={{ borderStyle: 'dashed' }} /> */}

        <MenuItem onClick={logoutUser} sx={{ m: 1 }}>
          Logout
        </MenuItem>
      </Popover>
    </>
  );
}
