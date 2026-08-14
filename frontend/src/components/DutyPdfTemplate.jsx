import React, { forwardRef } from 'react';
import dayjs from 'dayjs';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const DutyPdfTemplate = forwardRef(({ date, roster, hotelName = 'Hotel Mumbai House', logoUrl = '' }, ref) => {
  const formattedDate = date ? dayjs(date).format('DD MMMM YYYY') : '';
  const dayOfWeek = date ? dayjs(date).format('dddd') : '';

  const getFullLogo = (url) => {
    if (!url) return '';
    if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) return url;
    const apiBase = import.meta.env.VITE_API_URL || 'https://daily-roster.onrender.com/api';
    const serverOrigin = apiBase.replace(/\/api\/?$/, '');
    return `${serverOrigin}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const fullLogoSrc = getFullLogo(logoUrl);

  // Categorize assignments
  const morningList = [];
  const secondList = [];
  const nightList = [];
  const offLeaveList = [];

  (roster || []).forEach((item) => {
    const empName = item.employee?.name || 'Unknown';
    const empCode = item.employee?.employeeCode ? ` (${item.employee.employeeCode})` : '';
    const fullEmp = `${empName}${empCode}`;

    if (item.status === 'OFF' || item.status === 'ABSENT') {
      offLeaveList.push({
        employee: fullEmp,
        status: item.status,
        remarks: item.remarks || '',
      });
    } else {
      // Format assigned areas (supports array of areas)
      let areaName = 'Unassigned';
      if (Array.isArray(item.areas) && item.areas.length > 0) {
        areaName = item.areas.map((a) => (typeof a === 'object' ? a.name : a)).join(', ');
      } else if (item.area && typeof item.area === 'object') {
        areaName = item.area.name;
      }

      const times = item.inTime && item.outTime ? `${item.inTime} - ${item.outTime}` : 'As Scheduled';

      const entry = {
        area: areaName,
        employee: fullEmp,
        inTime: item.inTime || '-',
        outTime: item.outTime || '-',
        shiftTimes: times,
        remarks: item.remarks || '',
      };

      const shiftName = item.shift?.name ? String(item.shift.name).toLowerCase() : '';

      if (shiftName.includes('morning')) {
        morningList.push(entry);
      } else if (shiftName.includes('second') || shiftName.includes('afternoon')) {
        secondList.push(entry);
      } else if (shiftName.includes('night')) {
        nightList.push(entry);
      } else {
        morningList.push(entry);
      }
    }
  });

  const renderSectionTable = (title, items) => (
    <Box sx={{ mb: 2.5 }}>
      <Box
        sx={{
          backgroundColor: '#2E7D32',
          color: '#ffffff',
          px: 2,
          py: 0.8,
          borderRadius: '4px 4px 0 0',
          fontWeight: 700,
          fontSize: '14px',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
        }}
      >
        {title}
      </Box>
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #2E7D32', borderRadius: '0 0 4px 4px' }}>
        <Table size="small" sx={{ minWidth: '100%' }}>
          <TableHead sx={{ backgroundColor: '#E8F5E9' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', width: '25%', color: '#1B5E20', borderBottom: '2px solid #2E7D32' }}>Area</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '35%', color: '#1B5E20', borderBottom: '2px solid #2E7D32' }}>Employee Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '18%', textAlign: 'center', color: '#1B5E20', borderBottom: '2px solid #2E7D32' }}>In Time</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '18%', textAlign: 'center', color: '#1B5E20', borderBottom: '2px solid #2E7D32' }}>Out Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ fontStyle: 'italic', py: 1.5, color: '#666' }}>
                  No employees assigned to this shift
                </TableCell>
              </TableRow>
            ) : (
              items.map((row, idx) => (
                <TableRow key={idx} sx={{ '&:nth-of-type(even)': { backgroundColor: '#F8FAFC' } }}>
                  <TableCell sx={{ fontWeight: 800, color: '#111', fontSize: '13px' }}>{row.area}</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#111', fontSize: '14px' }}>{row.employee}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#111', fontSize: '14px' }}>{row.inTime}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#111', fontSize: '14px' }}>{row.outTime}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <Box
      ref={ref}
      id="duty-pdf-container"
      sx={{
        width: '794px', // A4 Portrait width in px at 96 DPI
        minHeight: '1123px',
        backgroundColor: '#ffffff',
        p: 4,
        boxSizing: 'border-box',
        fontFamily: '"Roboto", sans-serif',
        color: '#222',
        position: 'absolute',
        left: '-9999px', // Render off-screen for canvas capture
        top: 0,
      }}
    >
      {/* Header */}
      <Box sx={{ borderBottom: '3px solid #2E7D32', pb: 2, mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {fullLogoSrc && (
            <Box
              component="img"
              src={fullLogoSrc}
              alt="Logo"
              sx={{ maxHeight: 55, maxWidth: 120, objectFit: 'contain' }}
            />
          )}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#2E7D32', textTransform: 'uppercase', letterSpacing: 0.5, lineHeight: 1.1 }}>
              {hotelName}
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#333', mt: 0.3 }}>
              DAILY DUTY ROSTER
            </Typography>
          </Box>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" sx={{ fontWeight: 800, color: '#333' }}>
            DATE: <span style={{ color: '#2E7D32' }}>{formattedDate}</span>
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 800, color: '#333' }}>
            DAY: <span style={{ color: '#2E7D32' }}>{dayOfWeek}</span>
          </Typography>
        </Box>
      </Box>

      {/* Shift Tables */}
      {renderSectionTable('Morning Shift', morningList)}
      {renderSectionTable('Afternoon Shift (Second Shift)', secondList)}
      {renderSectionTable('Night Shift', nightList)}

      {/* OFF / LEAVE Section */}
      <Box sx={{ mt: 3 }}>
        <Box
          sx={{
            backgroundColor: '#D32F2F',
            color: '#ffffff',
            px: 2,
            py: 0.8,
            borderRadius: '4px 4px 0 0',
            fontWeight: 700,
            fontSize: '14px',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}
        >
          OFF / LEAVE / ABSENT EMPLOYEES
        </Box>
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #D32F2F', borderRadius: '0 0 4px 4px' }}>
          <Table size="small" sx={{ minWidth: '100%' }}>
            <TableHead sx={{ backgroundColor: '#FFEBEE' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', width: '50%', color: '#C62828', borderBottom: '2px solid #D32F2F' }}>Employee Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '25%', textAlign: 'center', color: '#C62828', borderBottom: '2px solid #D32F2F' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '25%', color: '#C62828', borderBottom: '2px solid #D32F2F' }}>Remarks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {offLeaveList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ fontStyle: 'italic', py: 1.5, color: '#666' }}>
                    All employees are working today
                  </TableCell>
                </TableRow>
              ) : (
                offLeaveList.map((row, idx) => (
                  <TableRow key={idx} sx={{ '&:nth-of-type(even)': { backgroundColor: '#FFF5F5' } }}>
                    <TableCell sx={{ fontWeight: 800, fontSize: '14px', color: '#111' }}>{row.employee}</TableCell>
                    <TableCell align="center">
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 10px',
                          borderRadius: '12px',
                          fontWeight: 700,
                          fontSize: '12px',
                          color: '#fff',
                          backgroundColor:
                            row.status === 'OFF'
                              ? '#ED6C02'
                              : row.status === 'LEAVE'
                              ? '#0288D1'
                              : '#D32F2F',
                        }}
                      >
                        {row.status}
                      </span>
                    </TableCell>
                    <TableCell sx={{ color: '#555' }}>{row.remarks || '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* PDF Footer */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 5, pt: 3, borderTop: '1px solid #ddd' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{ width: '180px', borderBottom: '1px solid #000', mb: 1 }} />
          <Typography variant="caption" sx={{ fontWeight: 600 }}>Housekeeping Supervisor</Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{ width: '180px', borderBottom: '1px solid #000', mb: 1 }} />
          <Typography variant="caption" sx={{ fontWeight: 600 }}>General Manager Signature</Typography>
        </Box>
      </Box>
    </Box>
  );
});

export default DutyPdfTemplate;
