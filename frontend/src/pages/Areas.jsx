import React, { useState, useEffect } from 'react';
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
  Chip,
  Grid,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Add, Edit, Delete, LocationCity } from '@mui/icons-material';
import API from '../api/axiosInstance';
import { useNotification } from '../context/NotificationContext';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function Areas() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editArea, setEditArea] = useState(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { showNotification } = useNotification();

  const fetchAreas = async () => {
    setLoading(true);
    try {
      const res = await API.get('/areas');
      setAreas(res.data);
    } catch (error) {
      showNotification('Failed to load hotel areas', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  const handleOpenDialog = (area = null) => {
    if (area) {
      setEditArea(area);
      setName(area.name);
      setDescription(area.description || '');
    } else {
      setEditArea(null);
      setName('');
      setDescription('');
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditArea(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editArea) {
        await API.put(`/areas/${editArea._id}`, { name, description });
        showNotification('Area updated successfully');
      } else {
        await API.post('/areas', { name, description });
        showNotification('Area added successfully');
      }
      handleCloseDialog();
      fetchAreas();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to save area', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/areas/${deleteId}`);
      showNotification('Area deleted successfully');
      setDeleteId(null);
      fetchAreas();
    } catch (error) {
      showNotification('Failed to delete area', 'error');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Hotel Areas Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage floors, public areas, and work sections for duty roster allocation.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 3, fontWeight: 700 }}
        >
          Add Area
        </Button>
      </Box>

      {loading ? (
        <LoadingSkeleton type="table" />
      ) : isMobile ? (
        <Grid container spacing={2}>
          {areas.map((area) => (
            <Grid item xs={12} key={area._id}>
              <Card sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationCity fontSize="small" /> {area.name}
                    </Typography>
                    <Box>
                      <IconButton color="primary" onClick={() => handleOpenDialog(area)}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton color="error" onClick={() => setDeleteId(area._id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  {area.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {area.description}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ backgroundColor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Area Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {areas.map((area) => (
                <TableRow key={area._id} hover>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationCity fontSize="small" />
                      {area.name}
                    </Box>
                  </TableCell>
                  <TableCell>{area.description || 'N/A'}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleOpenDialog(area)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton color="error" onClick={() => setDeleteId(area._id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Area Dialog Form */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <form onSubmit={handleSave}>
          <DialogTitle sx={{ fontWeight: 700 }}>
            {editArea ? 'Edit Area' : 'Add New Area'}
          </DialogTitle>
          <DialogContent sx={{ minWidth: { xs: 280, sm: 400 } }}>
            <TextField
              margin="dense"
              label="Area Name (e.g. 6th Floor / Pool Side)"
              fullWidth
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Description (optional)"
              fullWidth
              multiline
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseDialog} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Save Area
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete Area"
        message="Are you sure you want to remove this area?"
        confirmColor="error"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
}
