import React, { useState, useContext, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Avatar,
  IconButton,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { Save, Hotel, CloudUpload, Delete, Image as ImageIcon } from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import API from '../api/axiosInstance';

export const getImageUrl = (urlPath) => {
  if (!urlPath) return '';
  if (urlPath.startsWith('data:') || urlPath.startsWith('http://') || urlPath.startsWith('https://')) {
    return urlPath;
  }
  const apiBase = import.meta.env.VITE_API_URL || 'https://daily-roster.onrender.com/api';
  const serverOrigin = apiBase.replace(/\/api\/?$/, '');
  return `${serverOrigin}${urlPath.startsWith('/') ? '' : '/'}${urlPath}`;
};

export default function Settings() {
  const { user, updateUserProfile } = useContext(AuthContext);
  const { showNotification } = useNotification();

  const [name, setName] = useState(user?.name || '');
  const [hotelName, setHotelName] = useState(user?.hotelName || 'Hotel Mumbai House');
  const [logoUrl, setLogoUrl] = useState(user?.logoUrl || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const fileInputRef = useRef(null);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { name, hotelName, logoUrl };
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

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification('Please select a valid image file', 'error');
      return;
    }

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append('logo', file);

    try {
      const res = await API.post('/auth/upload-logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setLogoUrl(res.data.logoUrl);
      if (res.data.user) {
        updateUserProfile(res.data.user);
      }
      showNotification('Hotel logo uploaded successfully!');
    } catch (error) {
      console.error('Logo upload error:', error);
      showNotification(error.response?.data?.message || 'Failed to upload logo', 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    setLogoUrl('');
    try {
      const res = await API.put('/auth/profile', { name, hotelName, logoUrl: '' });
      updateUserProfile(res.data);
      showNotification('Hotel logo removed');
    } catch (error) {
      showNotification('Failed to update settings', 'error');
    }
  };

  const fullLogoSrc = getImageUrl(logoUrl);

  return (
    <Box sx={{ width: '100%', pb: { xs: 8, md: 2 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Settings & Hotel Branding
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure hotel name, custom logo branding, and account settings for generated PDFs and reports.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Hotel Branding & Logo Section */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Hotel color="primary" /> Hotel Logo Branding
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Upload your official hotel/resort logo. It will be printed side-by-side with your hotel name on generated PDFs.
            </Typography>

            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 3,
                border: '2px dashed',
                borderColor: logoUrl ? 'primary.main' : 'divider',
                borderRadius: 3,
                bgcolor: 'background.default',
                minHeight: 200,
                textAlign: 'center',
              }}
            >
              {uploadingLogo ? (
                <Box sx={{ textAlign: 'center' }}>
                  <CircularProgress size={40} sx={{ mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">Uploading logo...</Typography>
                </Box>
              ) : logoUrl ? (
                <Box sx={{ textAlign: 'center', width: '100%' }}>
                  <Box
                    component="img"
                    src={fullLogoSrc}
                    alt="Hotel Logo"
                    sx={{
                      maxHeight: 120,
                      maxWidth: '100%',
                      objectFit: 'contain',
                      borderRadius: 1,
                      mb: 2,
                      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                    Relative Path: <code>{logoUrl}</code>
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.light', color: 'primary.main', mx: 'auto', mb: 1.5 }}>
                    <ImageIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    No Logo Uploaded
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    PNG, JPG, SVG up to 5MB supported
                  </Typography>
                </Box>
              )}

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleLogoUpload}
                style={{ display: 'none' }}
              />

              <Box sx={{ display: 'flex', gap: 1.5, mt: 3, width: '100%', justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingLogo}
                  sx={{ borderRadius: 2, fontWeight: 700 }}
                >
                  {logoUrl ? 'Change Logo' : 'Upload Logo'}
                </Button>

                {logoUrl && (
                  <IconButton color="error" onClick={handleRemoveLogo} disabled={uploadingLogo}>
                    <Delete />
                  </IconButton>
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Manager Profile & Hotel Details Form */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Manager & Hotel Details
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
                label="Hotel / Resort Name (Appears on Duty PDF Header)"
                value={hotelName}
                onChange={(e) => setHotelName(e.target.value)}
                helperText="This exact name will be printed at the top of generated PDFs and reports"
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
                sx={{ borderRadius: 2, px: 4, py: 1.2, fontWeight: 700 }}
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </Button>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
