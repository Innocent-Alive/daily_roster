import React from 'react';
import { Box, Card, Skeleton, Grid, Stack, CircularProgress, Typography, LinearProgress } from '@mui/material';

export default function LoadingSkeleton({ type = 'card', text = 'Loading...' }) {
  if (type === 'overlay') {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(3px)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <CircularProgress size={52} thickness={4} color="primary" />
        <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>
          {text}
        </Typography>
      </Box>
    );
  }

  if (type === 'stats') {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress color="primary" sx={{ mb: 2, borderRadius: 1 }} />
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Grid item xs={6} sm={4} md={3} key={i}>
              <Card sx={{ borderRadius: 2, p: 2 }}>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="40%" height={40} />
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (type === 'table') {
    return (
      <Stack spacing={2} sx={{ width: '100%' }}>
        <LinearProgress color="primary" sx={{ mb: 1, borderRadius: 1 }} />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} variant="rounded" height={60} sx={{ borderRadius: 2 }} />
        ))}
      </Stack>
    );
  }

  return (
    <Card sx={{ p: 3, borderRadius: 2, width: '100%' }}>
      <LinearProgress color="primary" sx={{ mb: 2, borderRadius: 1 }} />
      <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
      <Box sx={{ pt: 2 }}>
        <Skeleton variant="text" width="80%" height={30} />
        <Skeleton variant="text" width="40%" height={20} />
      </Box>
    </Card>
  );
}
