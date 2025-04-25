import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'blue',
  primaryShade: 6,
  fontFamily: 'Inter, sans-serif',
  components: {
    AppShell: {
      styles: {
        main: {
          background: '#f8f9fa',
        },
        navbar: {
          background: 'linear-gradient(180deg, rgba(34, 139, 230, 0.05) 0%, rgba(34, 139, 230, 0.02) 100%)',
          borderRight: '1px solid rgba(34, 139, 230, 0.1)',
        },
      },
    },
    NavLink: {
      styles: {
        root: {
          borderRadius: '8px',
          marginBottom: '4px',
          transition: 'all 0.2s ease',
          '&:hover': {
            background: 'linear-gradient(135deg, rgba(34, 139, 230, 0.1) 0%, rgba(21, 170, 191, 0.1) 100%) !important',
            transform: 'translateX(4px)',
            '& .mantine-NavLink-body': {
              background: 'transparent !important',
            },
          },
          '&[dataActive]': {
            background: 'linear-gradient(135deg, rgba(34, 139, 230, 0.2) 0%, rgba(21, 170, 191, 0.2) 100%)',
            color: '#228be6',
            fontWeight: 600,
            transform: 'translateX(4px)',
            '& .mantine-NavLink-label': {
              fontWeight: 600,
              color: '#228be6',
            },
            '& .mantine-NavLink-icon': {
              color: '#228be6',
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '4px',
              background: '#228be6',
              borderRadius: '4px 0 0 4px',
            },
          },
        },
      },
    },
  },
}); 