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
  Switch,
  FormControlLabel,
  Chip,
  Grid,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Add, Edit, Delete, PersonAdd, Phone, Badge, Person } from '@mui/icons-material';
import API from '../api/axiosInstance';
import { useNotification } from '../context/NotificationContext';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);

  // Form State
  const [employeeCode, setEmployeeCode] = useState('');
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [designation, setDesignation] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Confirm Delete
  const [deleteId, setDeleteId] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { showNotification } = useNotification();

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await API.get('/employees');
      setEmployees(res.data);
    } catch (error) {
      showNotification('Failed to load employees', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOpenDialog = (emp = null) => {
    if (emp) {
      setEditEmployee(emp);
      setEmployeeCode(emp.employeeCode);
      setName(emp.name);
      setMobileNumber(emp.mobileNumber);
      setDesignation(emp.designation);
      setIsActive(emp.isActive);
    } else {
      setEditEmployee(null);
      setEmployeeCode(`EMP${String(employees.length + 1).padStart(3, '0')}`);
      setName('');
      setMobileNumber('');
      setDesignation('Room Attendant');
      setIsActive(true);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditEmployee(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editEmployee) {
        await API.put(`/employees/${editEmployee._id}`, {
          employeeCode,
          name,
          mobileNumber,
          designation,
          isActive,
        });
        showNotification('Employee updated successfully');
      } else {
        await API.post('/employees', {
          employeeCode,
          name,
          mobileNumber,
          designation,
          isActive,
        });
        showNotification('Employee created successfully');
      }
      handleCloseDialog();
      fetchEmployees();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to save employee', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/employees/${deleteId}`);
      showNotification('Employee removed successfully');
      setDeleteId(null);
      fetchEmployees();
    } catch (error) {
      showNotification('Failed to remove employee', 'error');
    }
  };

  return (
    <Box sx={{ pb: { xs: 8, md: 2 } }}>
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
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Employee Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add, update, or set active status for hotel staff members.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 1.5, fontWeight: 700, width: { xs: '100%', sm: 'auto' } }}
        >
          Add Employee
        </Button>
      </Box>

      {loading ? (
        <LoadingSkeleton type="table" />
      ) : isMobile ? (
        /* Mobile Responsive Card View */
        <Grid container spacing={2}>
          {employees.map((emp) => (
            <Grid item xs={12} key={emp._id}>
              <Card sx={{ borderRadius: 2, borderLeft: '4px solid', borderColor: emp.isActive ? 'success.main' : 'text.disabled' }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: '0.9rem', fontWeight: 700 }}>
                        {emp.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                          {emp.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Code: {emp.employeeCode}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={emp.isActive ? 'Active' : 'Inactive'}
                      color={emp.isActive ? 'success' : 'default'}
                      size="small"
                      sx={{ fontWeight: 700, height: 24 }}
                    />
                  </Box>

                  <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid #F0F0F0', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Badge fontSize="small" color="action" /> Designation: <b>{emp.designation}</b>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone fontSize="small" color="action" /> Mobile: <b>{emp.mobileNumber}</b>
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1.5 }}>
                    <Button size="small" variant="outlined" color="primary" startIcon={<Edit />} onClick={() => handleOpenDialog(emp)}>
                      Edit
                    </Button>
                    <Button size="small" variant="outlined" color="error" startIcon={<Delete />} onClick={() => setDeleteId(emp._id)}>
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        /* Desktop Table View */
        <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ backgroundColor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Mobile</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Designation</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((emp) => (
                <TableRow key={emp._id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{emp.employeeCode}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{emp.name}</TableCell>
                  <TableCell>{emp.mobileNumber}</TableCell>
                  <TableCell>{emp.designation}</TableCell>
                  <TableCell>
                    <Chip
                      label={emp.isActive ? 'Active' : 'Inactive'}
                      color={emp.isActive ? 'success' : 'default'}
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleOpenDialog(emp)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton color="error" onClick={() => setDeleteId(emp._id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Employee Dialog Form */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <form onSubmit={handleSave}>
          <DialogTitle sx={{ fontWeight: 700 }}>
            {editEmployee ? 'Edit Employee' : 'Add New Employee'}
          </DialogTitle>
          <DialogContent sx={{ minWidth: { xs: 280, sm: 400 } }}>
            <TextField
              margin="dense"
              label="Employee Code"
              fullWidth
              required
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Full Name"
              fullWidth
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Mobile Number"
              fullWidth
              required
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
              <InputLabel id="designation-label" required>Designation</InputLabel>
              <Select
                labelId="designation-label"
                label="Designation *"
                required
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              >
                <MenuItem value="Room Attendant">Room Attendant</MenuItem>
                <MenuItem value="Supervisor">Supervisor</MenuItem>
                <MenuItem value="Senior Supervisor">Senior Supervisor</MenuItem>
                <MenuItem value="Executive HouseKeeper">Executive HouseKeeper</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  color="success"
                />
              }
              label="Active for Roster Assignment"
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseDialog} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Save Employee
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete Employee"
        message="Are you sure you want to remove this employee?"
        confirmColor="error"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
}
