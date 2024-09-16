'use client';
import { useRouter, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
// import { signOut } from '@/auth';

import { useContext, useState } from 'react';
import AuthContext from '@/stores/authContext';
import { login, logout } from '@/app/lib/actions';

import React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CasinoIcon from '@mui/icons-material/Casino';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ListItemText from '@mui/material/ListItemText';
import MailIcon from '@mui/icons-material/Mail';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import Button from '@mui/material/Button';
import AdbIcon from '@mui/icons-material/Adb';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import localizedFormat from 'dayjs/plugin/localizedFormat';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);

let getLocationPromise = (): Promise<GeolocationPosition> => {
  return new Promise(function (resolve, reject) {
    // Promisifying the geolocation API
    navigator.geolocation.getCurrentPosition(
      position => {
        resolve(position);
      },
      error => {
        console.error(error);
        reject(error);
      }
    );
  });
};

const drawerWidth = 240;

export default function Sidenav({ children }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [recordStatus, updateRecordStatus] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const { user, setUser } = React.useContext(AuthContext);
  console.log(user);
  let loggedIn = user;

  const router = useRouter();
  const onLogoutClick = () => {
    setUser(null);
    router.push('/auth/logout');
  };

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const recordLocation = async () => {
    const now = dayjs.utc();
    console.log(`before now: ${now}`);
    try {
      const position: GeolocationPosition = await getLocationPromise();
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      const formData = new FormData();
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          location: {
            latitude: latitude,
            longitude: longitude
          },
          time: {
            epoch: 123,
            timezone: ''
          }
        })
      });
      // Handle response if necessary
      const data = await response.json();
      console.log(data);
      const localNow = dayjs.utc().local().format('L LTS');
      updateRecordStatus({ message: `Location recorded at ${localNow}` });
    } catch (err) {
      console.log('ERRRRRRRRRRRRRRR');
    }
    console.log('location recorded');
  };

  const drawer = () => {
    const menu = [
      {
        text: 'Dashboard',
        icon: <DashboardIcon />,
        action: function (text) {
          console.log(`hello ${text}`);
          router.push('/dashboard');
        }
      },
      {
        text: 'Bets',
        icon: <ListAltIcon />,
        action: function (text) {
          console.log(`hello ${text}`);
          router.push('/dashboard/bets');
        }
      },
      {
        text: 'Create bet',
        icon: <CasinoIcon />,
        action: function (text) {
          console.log(`hello ${text}`);
          router.push('/dashboard/bets/create');
        }
      }
    ];
    return (
      <div>
        <Toolbar />
        <Divider />
        <List>
          {menu.map((data, index) => (
            <ListItem key={data.text} disablePadding>
              <ListItemButton onClick={() => data.action(data.text)}>
                <ListItemIcon>{data.icon}</ListItemIcon>
                <ListItemText primary={data.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <Button onClick={recordLocation}>Record Location</Button>
        <div>{recordStatus?.message}</div>
      </div>
    );
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography sx={{ minWidth: 100, flexGrow: 1 }} component="div">
            <AdbIcon />
          </Typography>
          {loggedIn ? (
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleClick}
                size="small"
                sx={{ ml: 2 }}
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
              >
                <Avatar alt={user.name} src={user.image} sx={{ width: 32, height: 32 }}></Avatar>
              </IconButton>
            </Tooltip>
          ) : (
            <Button color="inherit" onClick={() => login(new FormData())}>
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1
            },
            '&::before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0
            }
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          onClick={() => {
            handleClose();
            router.push('/account');
          }}
        >
          <Avatar /> My account
        </MenuItem>
        <Divider />
        <MenuItem onClick={onLogoutClick}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }} aria-label="mailbox folders">
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Drawer
          // container={container}
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
          }}
        >
          {drawer()}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
          }}
          open
        >
          {drawer()}
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
