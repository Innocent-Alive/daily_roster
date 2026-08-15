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
  const [logo, setLogo] = useState(user?.logo || '');
  const [logoType, setLogoType] = useState(user?.logoType || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { name, hotelName, logo, logoType };
      if (password) payload.password = password;

      const res = await API.put('/auth/profile', payload);
      updateUserProfile(res.data);
      showNotification('Settings & Hotel Logo updated successfully');
      setPassword('');
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to update settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.name.toLowerCase().endsWith('.svg')) {
      showNotification('Please select a valid image or SVG file', 'error');
      return;
    }

    const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
    const reader = new FileReader();

    if (isSvg) {
      reader.onload = (event) => {
        const svgContent = event.target?.result;
        if (svgContent && typeof svgContent === 'string') {
          setLogo(svgContent);
          setLogoType('svg');
          showNotification('SVG logo loaded. Click "Save Settings" to apply.');
        }
      };
      reader.readAsText(file);
    } else {
      reader.onload = (event) => {
        const base64Data = event.target?.result;
        if (base64Data && typeof base64Data === 'string') {
          setLogo(base64Data);
          setLogoType('image');
          showNotification('Image logo loaded as Base64. Click "Save Settings" to apply.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = async () => {
    setLogo('');
    setLogoType('');
    try {
      const res = await API.put('/auth/profile', { name, hotelName, logo: '', logoType: '' });
      updateUserProfile(res.data);
      showNotification('Hotel logo removed');
    } catch (error) {
      showNotification('Failed to update settings', 'error');
    }
  };

  return (
    <Box sx={{ width: '100%', pb: { xs: 8, md: 2 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Settings & Hotel Branding
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure hotel name, custom logo branding (SVG / Base64 stored in MongoDB), and account settings.
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
              Upload your official SVG or image logo. Stored directly in database — fast, light, and 100% permanent across redeploys!
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
                borderColor: logo ? 'primary.main' : 'divider',
                borderRadius: 3,
                bgcolor: 'background.default',
                minHeight: 200,
                textAlign: 'center',
              }}
            >
              {logo ? (
                <Box sx={{ textAlign: 'center', width: '100%' }}>
                  {logoType === 'svg' ? (
                    <Box
                      dangerouslySetInnerHTML={{ __html: logo }}
                      sx={{
                        maxHeight: 120,
                        maxWidth: '100%',
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        '& svg': {
                          maxHeight: '110px',
                          maxWidth: '100%',
                          height: 'auto',
                          width: 'auto',
                        },
                      }}
                    />
                  ) : (
                    <Box
                      component="img"
                      src={logo.startsWith('data:') || logo.startsWith('http') ? logo : getImageUrl(logo)}
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
                  )}
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                    Type: <strong>{logoType === 'svg' ? 'Raw SVG Markup' : 'Base64 Encoded Image'}</strong>
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
                    SVG (recommended), PNG, JPG supported
                  </Typography>
                </Box>
              )}

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*,.svg"
                onChange={handleLogoSelect}
                style={{ display: 'none' }}
              />

              <Box sx={{ display: 'flex', gap: 1.5, mt: 3, width: '100%', justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ borderRadius: 2, fontWeight: 700 }}
                >
                  {logo ? 'Change Logo' : 'Upload Logo'}
                </Button>

                {logo && (
                  <IconButton color="error" onClick={handleRemoveLogo}>
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
