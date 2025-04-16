// components/Sidebar.tsx
import { Box, List, ListItem, ListItemText, Divider } from '@mui/material';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const isAdmin = user?.is_admin;

  return (
    <Box
      sx={{
        width: 250,
        height: '100vh',
        backgroundColor: '#f4f4f4',
        paddingTop: '16px',
      }}
    >
      <List>
        <ListItem as="button" component={Link} href="/dashboard/trasferte">
          <ListItemText primary="Trasferte" />
        </ListItem>
        <ListItem as="button" component={Link} href="/dashboard/spesa">
          <ListItemText primary="Spesa" />
        </ListItem>
        <ListItem as="button" component={Link} href="/dashboard/report">
          <ListItemText primary="Report" />
        </ListItem>
      </List>
      <Divider />
      {
        Boolean(isAdmin) && (
          <List>
            <ListItem as="button" component={Link} href="/admin/dipendenti">
              <ListItemText primary="Dipendenti" />
            </ListItem>
          </List>
        )}
    </Box>
  );
};

export default Sidebar;
