// components/Header.tsx
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

const Header = ({ onEdit, onAdd }: { onEdit: () => void; onAdd: () => void }) => {
  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Dashboard Aziendale
        </Typography>
        <Box>
          <Button color="inherit" onClick={onEdit}>
            Modifica
          </Button>
          <Button color="inherit" onClick={onAdd}>
            Aggiungi Nuovo
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
