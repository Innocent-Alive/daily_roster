import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  History as HistoryIcon,
  CalendarToday,
  PictureAsPdf,
  Visibility,
  Print,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import API from '../api/axiosInstance';
import { useNotification } from '../context/NotificationContext';
import { AuthContext } from '../context/AuthContext';
import { generateDutyRosterPdf } from '../utils/pdfGenerator';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { format12Hour } from '../utils/timeFormat';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';

export default function History() {
  const { user } = useContext(AuthContext);
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedRoster, setSelectedRoster] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const { showNotification } = useNotification();

  const fetchHistoryList = async () => {
    setLoading(true);
    try {
      const res = await API.get('/duty-assignments/history');
      setHistoryList(res.data || []);
    } catch (error) {
      console.error('Failed to load history:', error);
      showNotification('Failed to load history list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryList();
  }, []);

  const handleOpenRosterDetails = async (dateStr) => {
    setSelectedDate(dateStr);
    setOpenModal(true);
    setLoadingRoster(true);
    try {
      const res = await API.get(`/duty-assignments?date=${dateStr}`);
      setSelectedRoster(res.data.roster || []);
    } catch (error) {
      console.error('Error fetching roster history details:', error);
      showNotification('Failed to load roster details', 'error');
    } finally {
      setLoadingRoster(false);
    }
  };

  const handleDownloadPdf = async (dateStr) => {
    setGeneratingPdf(true);
    try {
      const [rosterRes, areaRes] = await Promise.all([
        API.get(`/duty-assignments?date=${dateStr}`),
        API.get('/areas'),
      ]);
      const targetRoster = rosterRes.data.roster || [];
      const areasList = areaRes.data || [];
      await generateDutyRosterPdf(
        dateStr,
        targetRoster,
        `Duty_Roster_${dateStr}.pdf`,
        areasList,
        user?.hotelName || 'Hotel Mumbai House',
        user?.logoUrl || ''
      );
      showNotification(`PDF for ${dateStr} downloaded successfully!`);
    } catch (error) {
      console.error('Download PDF error:', error);
      showNotification('Failed to generate PDF', 'error');
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Roster History & Archive
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View past daily rosters, print or re-download WhatsApp-ready PDF rosters.
        </Typography>
      </Box>

      {loading ? (
        <LoadingSkeleton type="stats" />
      ) : historyList.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4 }}>
          <HistoryIcon color="action" sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h6" color="text.secondary">
            No duty roster history recorded yet
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {historyList.map((item) => {
            const isSelected = selectedDate === item._id && openModal;
            return (
              <Grid item xs={12} sm={6} md={4} key={item._id}>
                <Card
                  sx={{
                    borderRadius: 2,
                    border: isSelected ? '2px solid #1565C0' : '1px solid #E0E0E0',
                    boxShadow: isSelected ? '0 6px 20px rgba(21,101,192,0.15)' : 'none',
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday color="primary" fontSize="small" />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {dayjs(item._id).format('DD MMM YYYY')}
                        </Typography>
                      </Box>
                      <Chip label={dayjs(item._id).format('dddd')} size="small" color="primary" variant="outlined" />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, my: 1.5, flexWrap: 'wrap' }}>
                      <Chip label={`Working: ${item.workingCount}`} size="small" color="success" />
                      <Chip label={`Weekly Off: ${item.offCount}`} size="small" color="warning" />
                      <Chip label={`Absent: ${item.absentCount || 0}`} size="small" color="error" />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button
                        fullWidth
                        variant={isSelected ? 'contained' : 'outlined'}
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => handleOpenRosterDetails(item._id)}
                        sx={{ borderRadius: 1.5 }}
                      >
                        View Roster
                      </Button>
                      <Button
                        fullWidth
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<PictureAsPdf />}
                        onClick={() => handleDownloadPdf(item._id)}
                        disabled={generatingPdf}
                        sx={{ borderRadius: 1.5 }}
                      >
                        PDF
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Roster Details Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #E2E8F0' }}>
          Duty Roster Details — {selectedDate ? dayjs(selectedDate).format('DD MMMM YYYY (dddd)') : ''}
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {loadingRoster ? (
            <Box sx={{ p: 4 }}>
              <LoadingSkeleton type="table" />
            </Box>
          ) : selectedRoster.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ p: 4, textAlign: 'center' }}>
              No employee assignments found for this date.
            </Typography>
          ) : (
            <Table>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>Employee</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Assigned Area(s)</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Shift</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800 }}>Timings</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedRoster.map((row, idx) => {
                  const empName = row.employee?.name || 'Employee';
                  const empCode = row.employee?.employeeCode ? ` (${row.employee.employeeCode})` : '';
                  let areaNames = '-';
                  if (Array.isArray(row.areas) && row.areas.length > 0) {
                    areaNames = row.areas.map((a) => (typeof a === 'object' ? a.name : a)).join(', ');
                  } else if (row.area && typeof row.area === 'object') {
                    areaNames = row.area.name;
                  }
                  const shiftName = row.shift?.name || '-';
                  const timing = row.inTime && row.outTime ? `${format12Hour(row.inTime)} - ${format12Hour(row.outTime)}` : '-';

                  return (
                    <TableRow key={idx} hover>
                      <TableCell sx={{ fontWeight: 700 }}>
                        {empName}<span style={{ fontWeight: 500, color: '#64748B' }}>{empCode}</span>
                      </TableCell>
                      <TableCell align="center">
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
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{row.status === 'WORKING' ? areaNames : '-'}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{row.status === 'WORKING' ? shiftName : '-'}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>{row.status === 'WORKING' ? timing : '-'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #E2E8F0' }}>
          <Button
            variant="contained"
            color="success"
            startIcon={<PictureAsPdf />}
            onClick={() => handleDownloadPdf(selectedDate)}
            disabled={generatingPdf}
            sx={{ borderRadius: 1.5 }}
          >
            Download PDF
          </Button>
          <Button onClick={() => setOpenModal(false)} variant="outlined" sx={{ borderRadius: 1.5 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
