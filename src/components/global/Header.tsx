'use client';
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Link } from '@mui/material';
import { AccountCircle, Menu as MenuIcon } from '@mui/icons-material';
import { useSession, signOut } from 'next-auth/react';
import Logo from '../brand/Logo';

const Header = () => {

  const { data: session, status } = useSession();
  const [menuState, setMenuState] = React.useState<{
    mainMenu: HTMLElement | null;
    accountMenu: HTMLElement | null;
  }>({
    mainMenu: null,
    accountMenu: null
  });

  const handleMenu = (menuType: 'main' | 'account') => (event: React.MouseEvent<HTMLElement>) => {
    setMenuState(prev => ({
      ...prev,
      [menuType === 'main' ? 'mainMenu' : 'accountMenu']: event.currentTarget
    }));
  };

  const handleClose = (menuType: 'main' | 'account') => {
    setMenuState(prev => ({
      ...prev,
      [menuType === 'main' ? 'mainMenu' : 'accountMenu']: null
    }));
  };

  return (
    <AppBar position="sticky" sx={{ padding: '0 20px' }}>
      <Toolbar>
        <Logo />
        <Box display="flex" justifyContent="flex-end" alignItems="center" width="100%">
        <div>
                <IconButton
                  size="large"
                  aria-label="main menu"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu('main')}
                  color="inherit"
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  id="main-menu-appbar"
                  anchorEl={menuState.mainMenu}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(menuState.mainMenu)}
                  onClose={() => handleClose('main')}
                >
                  <Typography variant="overline" sx={{ padding: '0 16px' }}>
                    MENU
                  </Typography>
                  <MenuItem color='inherit' onClick={() => handleClose('main')}>
                      <Link href="/dashboard">Dashboard</Link>
                  </MenuItem>
                  <MenuItem color='inherit' onClick={() => handleClose('main')}>
                      <Link href="/trasferte">Trasferte</Link>
                  </MenuItem>
                  <MenuItem color='inherit' onClick={() => handleClose('main')}>
                      <Link href="/progetti">Progetti</Link>
                  </MenuItem>
                </Menu>
              </div>
          { status === 'authenticated' ? (
              <div>
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu('account')}
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>
                <Menu
                  id="account-menu-appbar"
                  anchorEl={menuState.accountMenu}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(menuState.accountMenu)}
                  onClose={() => handleClose('account')}
                >
                  <Typography variant="overline" sx={{ padding: '0 16px' }}>
                    Ciao, {session.user?.nome}
                  </Typography>
                  <MenuItem onClick={() => handleClose('account')}>
                    <Link href="/auth/account">Account</Link>
                  </MenuItem>
                  <MenuItem onClick={() => {
                    handleClose('account');
                    signOut({ 
                      callbackUrl: process.env.NEXT_PUBLIC_APP_URL || '/',
                      redirect: true 
                    });
                  }}>
                    Log Out
                  </MenuItem>
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
