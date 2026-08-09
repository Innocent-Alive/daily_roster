import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  TextField,
  Button,
  Chip,
  Paper,
  Divider,
} from '@mui/material';
import {
  People as PeopleIcon,
  CheckCircle as WorkingIcon,
  DoNotDisturbOn as OffIcon,
  EventBusy as LeaveIcon,
  WbSunny as MorningIcon,
  Brightness6 as SecondIcon,
  NightsStay as NightIcon,
  CalendarToday,
  ArrowForward,
  AssignmentTurnedIn,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import API from '../api/axiosInstance';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchDashboardStats = async (dateStr) => {
    setLoading(true);
    try {
      const res = await API.get(`/dashboard/stats?date=${dateStr}`);
      setStats(res.data);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats(selectedDate);
  }, [selectedDate]);

  if (loading || !stats) {
    return (
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          Dashboard Overview
        </Typography>
        <LoadingSkeleton type="stats" />
      </Box>
    );
  }

  const isToday = selectedDate === dayjs().format('YYYY-MM-DD');

  const statCards = [
    {
      title: 'Morning Shift',
      value: stats.shiftCounts['Morning'] || 0,
      icon: <MorningIcon />,
      bgGradient: 'linear-gradient(135deg, #FF7E5F 0%, #FEB47B 100%)', // Vibrant Sunrise Gradient
      textColor: '#FFFFFF',
      iconBg: 'rgba(255, 255, 255, 0.25)',
      badgeBg: 'rgba(255, 255, 255, 0.25)',
    },
    {
      title: 'Second Shift',
      value: stats.shiftCounts['Second'] || 0,
      icon: <SecondIcon />,
      bgGradient: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)', // Dusk Purple Gradient
      textColor: '#FFFFFF',
      iconBg: 'rgba(255, 255, 255, 0.25)',
      badgeBg: 'rgba(255, 255, 255, 0.25)',
    },
    {
      title: 'Night Shift',
      value: stats.shiftCounts['Night'] || 0,
      icon: <NightIcon />,
      bgGradient: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)', // Deep Midnight Blue Gradient
      textColor: '#FFFFFF',
      iconBg: 'rgba(255, 255, 255, 0.25)',
      badgeBg: 'rgba(255, 255, 255, 0.25)',
    },
    {
      title: isToday ? "Today's Working" : "Working",
      value: stats.workingCount,
      icon: <WorkingIcon />,
      bgGradient: 'linear-gradient(135deg, #11998E 0%, #38EF7D 100%)', // Fresh Emerald Green Gradient
      textColor: '#FFFFFF',
      iconBg: 'rgba(255, 255, 255, 0.25)',
      badgeBg: 'rgba(255, 255, 255, 0.25)',
    },
    {
      title: isToday ? "Today's OFF / ABSENT" : "OFF / ABSENT",
      value: (stats.offCount || 0) + (stats.absentCount || 0),
      icon: <OffIcon />,
      bgGradient: 'linear-gradient(135deg, #F2994A 0%, #F2C94C 100%)', // Warm Amber Sunset Gradient
      textColor: '#FFFFFF',
      iconBg: 'rgba(255, 255, 255, 0.25)',
      badgeBg: 'rgba(255, 255, 255, 0.25)',
    },
    {
      title: 'Total Active Employees',
      value: stats.totalEmployees,
      icon: <PeopleIcon />,
      bgGradient: 'linear-gradient(135deg, #2193B0 0%, #6DD5ED 100%)', // Sky Blue Gradient
      textColor: '#FFFFFF',
      iconBg: 'rgba(255, 255, 255, 0.25)',
      badgeBg: 'rgba(255, 255, 255, 0.25)',
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
            Dashboard Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {dayjs(selectedDate).format('dddd, MMMM D, YYYY')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
          <TextField
            type="date"
            size="small"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputProps={{
              startAdornment: <CalendarToday fontSize="small" sx={{ mr: 0.5, color: 'primary.main' }} />,
            }}
            sx={{
              flex: { xs: '1 1 140px', sm: '0 0 160px' },
              backgroundColor: 'background.paper',
              borderRadius: 1.5,
              '& .MuiInputBase-input': { px: 1, py: 0.8, fontSize: '0.85rem' },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            size="small"
            endIcon={<ArrowForward />}
            onClick={() => navigate('/roster')}
            sx={{ whiteSpace: 'nowrap', borderRadius: 1.5, flex: { xs: '1 1 auto', sm: '0 0 auto' }, py: 0.9, fontWeight: 700 }}
          >
            Manage Roster
          </Button>
        </Box>
      </Box>

      {/* Grid Cards (2 per row on mobile xs=6, 3 per row on desktop md=4) */}
      <Grid container spacing={{ xs: 1.5, sm: 2.5 }}>
        {statCards.map((card, idx) => {
          const percentage = stats.totalEmployees > 0 ? Math.round((card.value / stats.totalEmployees) * 100) : 0;
          return (
            <Grid item xs={6} sm={6} md={4} key={idx}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 2,
                  background: card.bgGradient,
                  color: card.textColor,
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 25px rgba(0,0,0,0.18)',
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 1.8, sm: 2.2 }, '&:last-child': { pb: { xs: 1.8, sm: 2.2 } } }}>
                  {/* Top Bar: Glassmorphism Icon & Badge */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 1.5, sm: 2 } }}>
                    <Box
                      sx={{
                        bgcolor: card.iconBg,
                        backdropFilter: 'blur(4px)',
                        color: '#FFFFFF',
                        width: { xs: 36, sm: 42 },
                        height: { xs: 36, sm: 42 },
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {card.icon}
                    </Box>
                    <Chip
                      label={card.title === 'Total Active Employees' ? '100%' : `${percentage}%`}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        fontSize: { xs: '0.65rem', sm: '0.72rem' },
                        bgcolor: card.badgeBg,
                        backdropFilter: 'blur(4px)',
                        color: '#FFFFFF',
                        borderRadius: '6px',
                        height: { xs: 20, sm: 22 },
                        px: 0.5,
                      }}
                    />
                  </Box>

                  {/* Body: Value and Title */}
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#FFFFFF', lineHeight: 1, mb: 0.8, fontSize: { xs: '1.6rem', sm: '2.1rem' } }}>
                    {card.value}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.92)', fontSize: { xs: '0.75rem', sm: '0.85rem' }, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {card.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Quick Action & Roster Distribution Summary Section */}
      <Paper sx={{ mt: 3, p: { xs: 2.5, sm: 3 }, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Quick Roster Summary
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Staff duty distribution for {dayjs(selectedDate).format('DD MMMM YYYY')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              onClick={() => navigate('/roster')}
              sx={{ borderRadius: 1.5, fontWeight: 700 }}
            >
              Manage Roster
            </Button>
          </Box>
        </Box>

        {/* Visual Shift & Attendance Distribution Progress Chart (Visible on Mobile & Desktop) */}
        <Box sx={{ mb: 3, p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.secondary' }}>
            Roster Status Breakdown Chart
          </Typography>
          
          {/* Stacked Percentage Bar Chart */}
          {stats.totalEmployees > 0 && (
            <Box sx={{ display: 'flex', height: 16, borderRadius: 8, overflow: 'hidden', mb: 2, bgcolor: '#E2E8F0' }}>
              <Box sx={{ width: `${(stats.workingCount / stats.totalEmployees) * 100}%`, bgcolor: '#2E7D32', transition: 'width 0.5s' }} />
              <Box sx={{ width: `${(stats.offCount / stats.totalEmployees) * 100}%`, bgcolor: '#ED6C02', transition: 'width 0.5s' }} />
              <Box sx={{ width: `${(stats.absentCount / stats.totalEmployees) * 100}%`, bgcolor: '#D32F2F', transition: 'width 0.5s' }} />
            </Box>
          )}

          {/* Chart Legend */}
          <Grid container spacing={1}>
            <Grid item xs={4} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#2E7D32' }} />
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  Working ({stats.workingCount})
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ED6C02' }} />
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  Weekly Off ({stats.offCount})
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#D32F2F' }} />
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  Absent ({stats.absentCount})
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Detailed Staff Roster Table (Hidden on Mobile, Visible on Desktop mdUp) */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
            Detailed Staff Duty Assignment
          </Typography>
          {(!stats.roster || stats.roster.length === 0) ? (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 2, textAlign: 'center' }}>
              No duty assignments recorded for this date yet.
            </Typography>
          ) : (
            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F1F5F9', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>
                    <th style={{ padding: '10px 16px', textAlign: 'left' }}>Staff Member</th>
                    <th style={{ padding: '10px 16px', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '10px 16px', textAlign: 'left' }}>Assigned Area(s)</th>
                    <th style={{ padding: '10px 16px', textAlign: 'left' }}>Shift</th>
                    <th style={{ padding: '10px 16px', textAlign: 'center' }}>Timings</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.roster.map((row, idx) => {
                    const empName = row.employee?.name || 'Staff Member';
                    const empCode = row.employee?.employeeCode ? ` (${row.employee.employeeCode})` : '';
                    let areaNames = '-';
                    if (Array.isArray(row.areas) && row.areas.length > 0) {
                      areaNames = row.areas.map((a) => (typeof a === 'object' ? a.name : a)).join(', ');
                    } else if (row.area && typeof row.area === 'object') {
                      areaNames = row.area.name;
                    }
                    const shiftName = row.shift?.name || '-';
                    const timing = row.inTime && row.outTime ? `${row.inTime} - ${row.outTime}` : '-';

                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#1E293B' }}>
                          {empName}<span style={{ fontWeight: 500, color: '#64748B' }}>{empCode}</span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <Chip
                            label={row.status === 'OFF' ? 'WEEKLY OFF' : row.status}
                            size="small"
                            sx={{
                              fontWeight: 800,
                              fontSize: '0.7rem',
                              bgcolor: row.status === 'WORKING' ? '#E8F5E9' : row.status === 'OFF' ? '#FFF3E0' : '#FFEBEE',
                              color: row.status === 'WORKING' ? '#2E7D32' : row.status === 'OFF' ? '#ED6C02' : '#D32F2F',
                            }}
                          />
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: '#334155' }}>
                          {row.status === 'WORKING' ? areaNames : '-'}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: '#334155' }}>
                          {row.status === 'WORKING' ? shiftName : '-'}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#475569' }}>
                          {row.status === 'WORKING' ? timing : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Paper>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
