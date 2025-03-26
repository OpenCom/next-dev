import { Box, Card, CardContent, Typography } from '@mui/material';

const Summary = ({ totalTrasferte, totalSpese }: { totalTrasferte: number; totalSpese: number }) => {
  return (
    <Box display="flex" gap={2}>
      <Card sx={{ flexGrow: 1 }}>
        <CardContent>
          <Typography variant="h6">Totale Trasferte</Typography>
          <Typography variant="h4">{totalTrasferte}</Typography>
        </CardContent>
      </Card>
      <Card sx={{ flexGrow: 1 }}>
        <CardContent>
          <Typography variant="h6">Totale Spese</Typography>
          <Typography variant="h4">{totalSpese} €</Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Summary;
