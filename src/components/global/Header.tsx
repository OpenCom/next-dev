'use client';
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem } from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import { AccountCircle } from '@mui/icons-material';

const Header = ({ onEdit, onAdd }: { onEdit: () => void; onAdd: () => void }) => {

  const { isAuthenticated, logout, user } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar  position="sticky">
      <Toolbar>
        <Typography variant="h5" component="p" sx={{ flexGrow: 1 }}>
          PDM
        </Typography>
        <Box>
          { Boolean(isAuthenticated) ? (
              <div>
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <Typography variant="overline" sx={{ padding: '0 16px' }}>
                    Ciao, {user!.nome}
                  </Typography>
                  <MenuItem onClick={handleClose}>Account</MenuItem>
                  <MenuItem onClick={() => {
                    handleClose(); 
                    logout();}
                  }>Log Out</MenuItem>
                </Menu>
              </div>
          ) : (
            <Button color="inherit" href='/auth/login'>
              Log in
            </Button>    
          )}
        </Box>  
      </Toolbar>
    </AppBar>
  );
};

export default Header;
