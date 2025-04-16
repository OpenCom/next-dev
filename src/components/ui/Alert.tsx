import React from 'react'
import { Alert as MuiAlert, Box, Fade, IconButton, AlertTitle} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

type AlertProps = {
    maxWidth?: number;
    title?: string;
    children: React.ReactNode;
    closable?: boolean;
} & React.ComponentProps<typeof MuiAlert>;

function Alert({children, maxWidth = 400, closable = false, ...props}: AlertProps) {
  const [open, setOpen] = React.useState(true);
  const action = closable ? (
    <IconButton
      aria-label="close"
      color="inherit"
      size="small"
      onClick={() => {
        setOpen(false);
      }}
    >
      <CloseIcon fontSize="inherit" />
    </IconButton> 
    ) : undefined

  return open 
  ? (
    <Box maxWidth={maxWidth} width='100%'>
        <Fade in={open} timeout={300} unmountOnExit>
        <MuiAlert
          severity={props.severity || "info"}
          action={action}
          sx={{ mb: 2 }}
          {...props}>
            {props.title && <AlertTitle>{props.title}</AlertTitle>}
            {children}
          </MuiAlert>
        </Fade>
    </Box>
  ) : null
}

export default Alert