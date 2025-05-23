import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useRouter } from 'next/navigation';

interface SubHeaderProps {
  pageType: string;
  title: string;
  breadcrumbs?: {
    label: string;
    href: string;
  }[];
}

export default function SubHeader({ pageType, title, breadcrumbs }: SubHeaderProps) {
  const router = useRouter();

  return (
    <Box sx={{ 
      mb: 3,
      display: 'flex',
      flexDirection: 'column',
      gap: 1
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6" component="span" sx={{ fontWeight: 'bold' }}>
          {pageType}
        </Typography>
        <Typography variant="h6" component="span" color="text.secondary">
          {title}
        </Typography>
      </Box>
      
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          {breadcrumbs.map((crumb, index) => (
            <Link
              key={index}
              underline="hover"
              color="inherit"
              href={crumb.href}
              onClick={(e) => {
                e.preventDefault();
                router.push(crumb.href);
              }}
              sx={{ cursor: 'pointer' }}
            >
              {crumb.label}
            </Link>
          ))}
        </Breadcrumbs>
      )}
    </Box>
  );
} 