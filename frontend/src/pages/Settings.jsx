import React, { useState, useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
} from '@mui/material';
import { Save, Hotel, Brightness4, Brightness7 } from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import { ColorModeContext } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import API from '../api/axiosInstance';

export default function Settings() {
  const { user, updateUserProfile } = useContext(AuthContext);
  const colorMode = useContext(ColorModeContext);
  const { showNotification } = useNotification();

  const [name, setName] = useState(user?.name || 'Arundas');
  const [hotelName, setHotelName] = useState(user?.hotelName || 'Hotel Mumbai House');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { name, hotelName };
      if (password) payload.password = password;

      const res = await API.put('/auth/profile', payload);
      updateUserProfile(res.data);
      showNotification('Settings & Branding updated successfully');
      setPassword('');
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to update settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
        Settings & Hotel Branding
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage system branding (which appears on generated PDFs and WhatsApp reports) and theme preferences.
      </Typography>

      <Paper sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: 4, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Hotel & Manager Details
        </Typography>

        <form onSubmit={handleSaveProfile}>
          <TextField
            fullWidth
            label="Manager Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2.5 }}
          />

          <TextField
            fullWidth
            label="Hotel / Resort Name (Appears on Duty PDF)"
            value={hotelName}
            onChange={(e) => setHotelName(e.target.value)}
            sx={{ mb: 2.5 }}
          />

          <TextField
            fullWidth
            type="password"
            label="New Password (leave blank to keep current)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={<Save />}
            sx={{ borderRadius: 1.5, px: 3, fontWeight: 700 }}
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
