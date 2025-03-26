import { Box } from '@mui/material';
import Sidebar from '@/components/global/Sidebar';
import Header from '@/components/global/Header';

const Wrapper = ({ children, onEdit, onAdd }: { children: React.ReactNode; onEdit: () => void; onAdd: () => void }) => {
  return (
    <Box display="flex">
      <Sidebar />
      <Box sx={{ flexGrow: 1 }}>
        <Header onEdit={onEdit} onAdd={onAdd} />
        <Box sx={{ padding: '20px' }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default Wrapper;
