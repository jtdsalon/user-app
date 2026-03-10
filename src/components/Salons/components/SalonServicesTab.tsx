import React from 'react';
import { Box, Grid2, Paper, Stack, Typography } from '@mui/material';
import { Clock, ArrowRight } from 'lucide-react';
import type { Salon, SalonService } from '@/components/Home/types';
import { formatLKR } from '@/lib/utils/currency';

interface SalonServicesTabProps {
  salon: Salon;
  groupedServices: Record<string, SalonService[]>;
  onBook: (serviceId: string) => void;
}

/**
 * SalonServicesTab lists bookable services grouped by category.
 */
export const SalonServicesTab: React.FC<SalonServicesTabProps> = ({
  salon,
  groupedServices,
  onBook,
}) => {
  return (
    <Box>
      {Object.entries(groupedServices).map(([category, services]) => (
        <Box key={category} sx={{ mb: 8 }}>
          <Typography
            variant="h5"
            sx={theme => ({
              fontWeight: 900,
              color: 'text.primary',
              mb: 4,
              letterSpacing: '0.1em',
              borderLeft: `6px solid ${theme.palette.secondary.main}`,
              pl: 3,
              textTransform: 'uppercase',
            })}
          >
            {category}
          </Typography>
          <Grid2 container spacing={4}>
            {services.map(service => (
              <Grid2 size={{ xs: 12, md: 6 }} key={service.id}>
                <Paper
                  elevation={0}
                  sx={theme => ({
                    p: 4,
                    borderRadius: '32px',
                    border: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                    cursor: 'pointer',
                    bgcolor: 'background.paper',
                    '&:hover': {
                      borderColor: 'secondary.main',
                      bgcolor: 'action.hover',
                      transform: 'translateY(-6px)',
                    },
                  })}
                  onClick={() => onBook(service.id)}
                >
                  <Box sx={{ flex: 1, pr: 3 }}>
                    <Typography
                      sx={{
                        fontWeight: 900,
                        fontSize: '17px',
                        color: 'text.primary',
                        mb: 1,
                      }}
                    >
                      {service.name}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '13px',
                        color: 'text.secondary',
                        mb: 2.5,
                        fontWeight: 500,
                      }}
                    >
                      {service.description}
                    </Typography>
                    <Stack direction="row" spacing={3} alignItems="center">
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          color: 'text.secondary',
                        }}
                      >
                        <Clock size={14} />
                        <Typography sx={{ fontSize: '12px', fontWeight: 800 }}>
                          {service.duration}
                        </Typography>
                      </Box>
                      <Typography
                        sx={{
                          fontWeight: 900,
                          color: 'secondary.main',
                          fontSize: '18px',
                        }}
                      >
                        {formatLKR(service.price)}
                      </Typography>
                    </Stack>
                  </Box>
                  <Box
                    sx={theme => ({
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      border: `1px solid ${theme.palette.divider}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    })}
                  >
                    <ArrowRight size={20} />
                  </Box>
                </Paper>
              </Grid2>
            ))}
          </Grid2>
        </Box>
      ))}
    </Box>
  );
};

