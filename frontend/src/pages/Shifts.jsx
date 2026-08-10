import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Add, Edit, Delete, AccessTime } from '@mui/icons-material';
import API from '../api/axiosInstance';
import { useNotification } from '../context/NotificationContext';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { format12Hour, generate12HourOptions } from '../utils/timeFormat';

export default function Shifts() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editShift, setEditShift] = useState(null);

  const timeOptions = useMemo(() => generate12HourOptions(), []);

  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('07:00');
  const [endTime, setEndTime] = useState('15:30');
  const [deleteId, setDeleteId] = useState(null);

  const { showNotification } = useNotification();

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const res = await API.get('/shifts');
      setShifts(res.data);
    } catch (error) {
      showNotification('Failed to load shifts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleOpenDialog = (shift = null) => {
    if (shift) {
      setEditShift(shift);
      setName(shift.name);
      setStartTime(shift.startTime);
      setEndTime(shift.endTime);
    } else {
      setEditShift(null);
      setName('');
      setStartTime('07:00');
      setEndTime('15:30');
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditShift(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editShift) {
        await API.put(`/shifts/${editShift._id}`, { name, startTime, endTime });
        showNotification('Shift updated successfully');
      } else {
        await API.post('/shifts', { name, startTime, endTime });
        showNotification('Shift created successfully');
      }
      handleCloseDialog();
      fetchShifts();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to save shift', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/shifts/${deleteId}`);
      showNotification('Shift deleted successfully');
      setDeleteId(null);
      fetchShifts();
    } catch (error) {
      showNotification('Failed to delete shift', 'error');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Shifts Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure duty shifts (Morning, Second, Night) and work hours.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 3, fontWeight: 700 }}
        >
          Add Shift
        </Button>
      </Box>

      {loading ? (
        <LoadingSkeleton type="table" />
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ backgroundColor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Shift Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Start Time</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>End Time</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {shifts.map((shift) => (
                <TableRow key={shift._id} hover>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTime fontSize="small" />
                      {shift.name}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{format12Hour(shift.startTime)}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{format12Hour(shift.endTime)}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleOpenDialog(shift)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton color="error" onClick={() => setDeleteId(shift._id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Shift Form Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <form onSubmit={handleSave}>
          <DialogTitle sx={{ fontWeight: 700 }}>
            {editShift ? 'Edit Shift' : 'Add New Shift'}
          </DialogTitle>
          <DialogContent sx={{ minWidth: { xs: 280, sm: 400 } }}>
            <TextField
              margin="dense"
              label="Shift Name (e.g. Morning / Night)"
              fullWidth
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel id="start-time-label">Start Time</InputLabel>
                  <Select
                    labelId="start-time-label"
                    label="Start Time"
                    value={format12Hour(startTime)}
                    onChange={(e) => setStartTime(e.target.value)}
                    MenuProps={{ PaperProps: { sx: { maxHeight: 220 } } }}
                  >
                    {(() => {
                      const formatted = format12Hour(startTime);
                      const opts = formatted && !timeOptions.includes(formatted) ? [formatted, ...timeOptions] : timeOptions;
                      return opts.map((t) => (
                        <MenuItem key={t} value={t}>
                          {t}
                        </MenuItem>
                      ));
                    })()}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel id="end-time-label">End Time</InputLabel>
                  <Select
                    labelId="end-time-label"
                    label="End Time"
                    value={format12Hour(endTime)}
                    onChange={(e) => setEndTime(e.target.value)}
                    MenuProps={{ PaperProps: { sx: { maxHeight: 220 } } }}
                  >
                    {(() => {
                      const formatted = format12Hour(endTime);
                      const opts = formatted && !timeOptions.includes(formatted) ? [formatted, ...timeOptions] : timeOptions;
                      return opts.map((t) => (
                        <MenuItem key={t} value={t}>
                          {t}
                        </MenuItem>
                      ));
                    })()}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseDialog} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Save Shift
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete Shift"
        message="Are you sure you want to remove this shift?"
        confirmColor="error"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
}
