// components/Sidebar.tsx
import { Box, List, ListItem, ListItemText, Divider } from '@mui/material';
import Link from 'next/link';

const Sidebar = () => {
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
        <ListItem as="button" component={Link} href="/trasferte">
          <ListItemText primary="Trasferte" />
        </ListItem>
        <ListItem as="button" component={Link} href="/spesa">
          <ListItemText primary="Spesa" />
        </ListItem>
        <ListItem as="button" component={Link} href="/dipendenti">
          <ListItemText primary="Dipendenti" />
        </ListItem>
        <ListItem as="button" component={Link} href="/report">
          <ListItemText primary="Report" />
        </ListItem>
      </List>
      <Divider />
    </Box>
  );
};

export default Sidebar;
