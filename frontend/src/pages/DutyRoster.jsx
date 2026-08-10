import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Stack,
  InputAdornment,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Save,
  ContentCopy,
  PictureAsPdf,
  Search,
  FilterList,
  CalendarToday,
  Person,
  Schedule,
  LocationOn,
  Info,
  ViewModule,
  TableChart,
  WhatsApp,
  Check,
} from '@mui/icons-material';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import dayjs from 'dayjs';
import API from '../api/axiosInstance';
import { useNotification } from '../context/NotificationContext';
import { generateDutyRosterPdf } from '../utils/pdfGenerator';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { format12Hour } from '../utils/timeFormat';

export default function DutyRoster() {
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [roster, setRoster] = useState([]);
  const [areas, setAreas] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Filters & Mobile Toggle
  const [searchQuery, setSearchQuery] = useState('');
  const [filterShift, setFilterShift] = useState('ALL');
  const [filterArea, setFilterArea] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [viewMode, setViewMode] = useState('card'); // 'card' (Mobile First) | 'table'

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { showNotification } = useNotification();
  const pdfTemplateRef = useRef();

  // Automatically default view mode to card on phones
  useEffect(() => {
    if (isMobile) {
      setViewMode('card');
    }
  }, [isMobile]);

  // Fetch areas, shifts & roster data
  const fetchData = async (dateStr) => {
    setLoading(true);
    try {
      const [areaRes, shiftRes, rosterRes] = await Promise.all([
        API.get('/areas'),
        API.get('/shifts'),
        API.get(`/duty-assignments?date=${dateStr}`),
      ]);

      setAreas(areaRes.data.filter((a) => a.isActive));
      setShifts(shiftRes.data.filter((s) => s.isActive));
      setRoster(rosterRes.data.roster || []);
    } catch (error) {
      console.error('Failed to load roster:', error);
      showNotification('Failed to load duty roster', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  // Update employee roster field state locally
  const handleFieldChange = (empId, field, value) => {
    setRoster((prevRoster) =>
      prevRoster.map((item) => {
        const itemEmpId = item.employee?._id || item.employee;
        if (itemEmpId === empId) {
          const updated = { ...item, [field]: value };

          // Status lock logic: If status is OFF or ABSENT, clear shift/area/times
          if (field === 'status') {
            if (value === 'OFF' || value === 'ABSENT') {
              updated.areas = [];
              updated.area = null;
              updated.shift = null;
              updated.inTime = '';
              updated.outTime = '';
            } else if (value === 'WORKING' && shifts.length > 0) {
              const defaultShift = shifts[0];
              updated.shift = defaultShift._id;
              updated.inTime = format12Hour(defaultShift.startTime);
              updated.outTime = format12Hour(defaultShift.endTime);
              if (areas.length > 0) {
                updated.areas = [areas[0]._id];
                updated.area = areas[0]._id;
              }
            }
          }

          // Auto-fill times in 12-hour format when Shift changes
          if (field === 'shift') {
            const selectedShiftObj = shifts.find((s) => s._id === value);
            if (selectedShiftObj) {
              updated.inTime = format12Hour(selectedShiftObj.startTime);
              updated.outTime = format12Hour(selectedShiftObj.endTime);
            }
          }

          return updated;
        }
        return item;
      })
    );
  };

  // Bulk Save Roster
  const handleSaveRoster = async () => {
    setSaving(true);
    try {
      const payload = roster.map((item) => {
        let areaIds = [];
        if (Array.isArray(item.areas)) {
          areaIds = item.areas.map((a) => (typeof a === 'object' ? a._id : a));
        } else if (item.area) {
          areaIds = [typeof item.area === 'object' ? item.area._id : item.area];
        }

        return {
          employee: item.employee?._id || item.employee,
          areas: areaIds,
          shift: item.shift?._id || item.shift || null,
          inTime: item.inTime || '',
          outTime: item.outTime || '',
          status: item.status || 'WORKING',
          remarks: item.remarks || '',
        };
      });

      await API.post('/duty-assignments/bulk', {
        date: selectedDate,
        assignments: payload,
      });

      showNotification('Duty roster saved successfully!');
      fetchData(selectedDate);
    } catch (error) {
      console.error('Save Roster Error:', error);
      showNotification(error.response?.data?.message || 'Failed to save duty roster', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Copy Previous Day
  const handleCopyPreviousDay = async () => {
    try {
      const res = await API.post('/duty-assignments/copy-previous', {
        targetDate: selectedDate,
      });
      showNotification(res.data.message || "Copied yesterday's roster!");
      fetchData(selectedDate);
    } catch (error) {
      showNotification(error.response?.data?.message || "Failed to copy yesterday's roster", 'error');
    }
  };

  // Generate & Download PDF
  const handleGeneratePdf = async () => {
    setGeneratingPdf(true);
    try {
      const filename = `Duty_Roster_${selectedDate}.pdf`;
      await generateDutyRosterPdf(selectedDate, roster, filename, areas);
      showNotification('PDF Duty Roster downloaded successfully!');
    } catch (error) {
      console.error('PDF Generation Error:', error);
      showNotification('Failed to generate PDF duty roster', 'error');
    } finally {
      setGeneratingPdf(false);
    }
  };

  // WhatsApp Share Message Generator
  const handleWhatsAppShare = () => {
    const formattedDate = dayjs(selectedDate).format('DD MMM YYYY (dddd)');
    let msg = `*HOTEL MUMBAI HOUSE*\n*DAILY DUTY ROSTER - ${formattedDate}*\n\n`;

    const workingStaff = roster.filter((r) => r.status === 'WORKING');
    const offStaff = roster.filter((r) => r.status === 'OFF' || r.status === 'ABSENT');

    if (workingStaff.length > 0) {
      msg += `*WORKING STAFF:*\n`;
      workingStaff.forEach((item) => {
        const empName = item.employee?.name || 'Staff';
        const areaName = item.area?.name || 'Unassigned';
        const shiftName = item.shift?.name || 'Duty';
        const timing = item.inTime && item.outTime ? `(${item.inTime} - ${item.outTime})` : '';
        msg += `• *${empName}*: ${areaName} | ${shiftName} ${timing}\n`;
      });
      msg += `\n`;
    }

    if (offStaff.length > 0) {
      msg += `*OFF / ABSENT STAFF:*\n`;
      offStaff.forEach((item) => {
        const empName = item.employee?.name || 'Staff';
        const displayStatus = item.status === 'OFF' ? 'WEEKLY OFF' : item.status;
        msg += `• *${empName}*: ${displayStatus}\n`;
      });
    }

    const encodedMsg = encodeURIComponent(msg);
    window.open(`https://api.whatsapp.com/send?text=${encodedMsg}`, '_blank');
  };

  // Filtered roster calculation
  const filteredRoster = roster.filter((item) => {
    const empName = item.employee?.name || '';
    const empCode = item.employee?.employeeCode || '';
    const matchesSearch =
      empName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      empCode.toLowerCase().includes(searchQuery.toLowerCase());

    const shiftId = item.shift?._id || item.shift;
    const matchesShift = filterShift === 'ALL' || shiftId === filterShift;

    const areaId = item.area?._id || item.area;
    const matchesArea = filterArea === 'ALL' || areaId === filterArea;

    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;

    return matchesSearch && matchesShift && matchesArea && matchesStatus;
  });

  return (
    <Box>
      {/* Overlay Loaders */}
      {saving && <LoadingSkeleton type="overlay" text="Saving Duty Roster..." />}
      {generatingPdf && <LoadingSkeleton type="overlay" text="Generating Roster PDF..." />}

      {/* Top Header & Actions Bar */}
      <Paper sx={{ p: { xs: 2, sm: 2.5 }, mb: 3, borderRadius: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', lg: 'center' },
            gap: 2,
          }}
        >
          {/* Title & Date Picker */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Duty Roster
            </Typography>
            <TextField
              type="date"
              size="small"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              InputProps={{
                startAdornment: <CalendarToday fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />,
              }}
              sx={{ width: { xs: '100%', sm: 180 }, backgroundColor: 'background.paper', borderRadius: 1.5 }}
            />
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
              justifyContent: { xs: 'stretch', sm: 'flex-end' },
            }}
          >
            <Button
              variant="outlined"
              color="success"
              startIcon={<PictureAsPdf />}
              onClick={handleGeneratePdf}
              disabled={generatingPdf}
              sx={{ borderRadius: 1.5, flexGrow: { xs: 1, sm: 0 } }}
            >
              {generatingPdf ? 'Generating...' : 'Generate PDF'}
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<WhatsApp />}
              onClick={handleWhatsAppShare}
              sx={{ borderRadius: 1.5, backgroundColor: '#25D366', '&:hover': { backgroundColor: '#128C7E' }, flexGrow: { xs: 1, sm: 0 }, fontWeight: 700 }}
            >
              WhatsApp
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Save />}
              onClick={handleSaveRoster}
              disabled={saving}
              sx={{ borderRadius: 1.5, px: 3, fontWeight: 700, flexGrow: { xs: 1, sm: 0 } }}
            >
              {saving ? 'Saving...' : 'Save Roster'}
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Filter Controls Bar */}
        <Grid container spacing={1.5} alignItems="center">
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search Employee / Code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter Area</InputLabel>
              <Select
                value={filterArea}
                label="Filter Area"
                onChange={(e) => setFilterArea(e.target.value)}
              >
                <MenuItem value="ALL">All Areas</MenuItem>
                {areas.map((a) => (
                  <MenuItem key={a._id} value={a._id}>
                    {a.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={4} md={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter Shift</InputLabel>
              <Select
                value={filterShift}
                label="Filter Shift"
                onChange={(e) => setFilterShift(e.target.value)}
              >
                <MenuItem value="ALL">All Shifts</MenuItem>
                {shifts.map((s) => (
                  <MenuItem key={s._id} value={s._id}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter Status</InputLabel>
              <Select
                value={filterStatus}
                label="Filter Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="ALL">All Status</MenuItem>
                <MenuItem value="WORKING">WORKING</MenuItem>
                <MenuItem value="OFF">WEEKLY OFF</MenuItem>
                <MenuItem value="ABSENT">ABSENT</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={6} md={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <ToggleButtonGroup
              size="small"
              value={viewMode}
              exclusive
              onChange={(e, val) => val && setViewMode(val)}
            >
              <ToggleButton value="card" aria-label="Card View">
                <Tooltip title="Mobile Card View"><ViewModule /></Tooltip>
              </ToggleButton>
              <ToggleButton value="table" aria-label="Table View">
                <Tooltip title="Table Grid View"><TableChart /></Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Roster Content View */}
      {loading ? (
        <LoadingSkeleton type="table" />
      ) : filteredRoster.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4 }}>
          <Info color="action" sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h6" color="text.secondary">
            No employees match the criteria
          </Typography>
        </Paper>
      ) : viewMode === 'card' ? (
        /* Mobile Touch Card View */
        <Grid container spacing={2}>
          {filteredRoster.map((item) => {
            const empId = item.employee?._id || item.employee;
            const empName = item.employee?.name || 'Employee';
            const empCode = item.employee?.employeeCode || 'EMP';
            const isOffOrAbsent = item.status === 'OFF' || item.status === 'ABSENT';

            const currentAreaId = item.area?._id || item.area || '';
            const currentShiftId = item.shift?._id || item.shift || '';

            return (
              <Grid item xs={12} sm={6} md={4} key={empId}>
                <Card
                  sx={{
                    borderRadius: 2,
                    borderLeft: '5px solid',
                    borderColor:
                      item.status === 'WORKING'
                        ? '#2E7D32'
                        : item.status === 'OFF'
                        ? '#ED6C02'
                        : '#D32F2F',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    {/* Employee Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person color="primary" />
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            {empName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Code: {empCode}
                          </Typography>
                        </Box>
                      </Box>
                      <FormControl size="small" sx={{ minWidth: 125 }}>
                        <Select
                          value={item.status || 'WORKING'}
                          onChange={(e) => handleFieldChange(empId, 'status', e.target.value)}
                          sx={{
                            borderRadius: 1.5,
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            color:
                              item.status === 'WORKING'
                                ? '#2E7D32'
                                : item.status === 'OFF'
                                ? '#ED6C02'
                                : '#D32F2F',
                          }}
                        >
                          <MenuItem value="WORKING">WORKING</MenuItem>
                          <MenuItem value="OFF">WEEKLY OFF</MenuItem>
                          <MenuItem value="ABSENT">ABSENT</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    {/* Area & Shift Controls */}
                    <Stack spacing={1.5}>
                      <FormControl fullWidth size="small" disabled={isOffOrAbsent}>
                        <InputLabel>Assigned Areas</InputLabel>
                        <Select
                          multiple
                          value={Array.isArray(item.areas) ? item.areas.map(a => typeof a === 'object' ? a._id : a) : item.area ? [typeof item.area === 'object' ? item.area._id : item.area] : []}
                          label="Assigned Areas"
                          onChange={(e) => handleFieldChange(empId, 'areas', e.target.value)}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((val) => {
                                const areaObj = areas.find((a) => a._id === val);
                                return <Chip key={val} label={areaObj ? areaObj.name : val} size="small" sx={{ height: 22, fontSize: '0.75rem' }} />;
                              })}
                            </Box>
                          )}
                        >
                          {areas.map((a) => {
                            const selectedArray = Array.isArray(item.areas)
                              ? item.areas.map((area) => (typeof area === 'object' ? area._id : area))
                              : item.area
                              ? [typeof item.area === 'object' ? item.area._id : item.area]
                              : [];
                            const isChecked = selectedArray.includes(a._id);

                            return (
                              <MenuItem key={a._id} value={a._id}>
                                <Checkbox checked={isChecked} size="small" />
                                <ListItemText primary={a.name} />
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth size="small" disabled={isOffOrAbsent}>
                        <InputLabel>Shift</InputLabel>
                        <Select
                          value={currentShiftId}
                          label="Shift"
                          onChange={(e) => handleFieldChange(empId, 'shift', e.target.value)}
                        >
                          {shifts.map((s) => (
                            <MenuItem key={s._id} value={s._id}>
                              {s.name} ({format12Hour(s.startTime)} - {format12Hour(s.endTime)})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {/* Timings (12-Hour AM/PM Format) */}
                      <Grid container spacing={1.5} sx={{ width: '100%', m: 0 }}>
                        <Grid item xs={6} sx={{ pl: '0!important' }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="In Time (12h)"
                            placeholder="07:00 AM"
                            value={item.inTime ? format12Hour(item.inTime) : ''}
                            disabled={isOffOrAbsent}
                            onChange={(e) => handleFieldChange(empId, 'inTime', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={6} sx={{ pr: '0!important' }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Out Time (12h)"
                            placeholder="03:30 PM"
                            value={item.outTime ? format12Hour(item.outTime) : ''}
                            disabled={isOffOrAbsent}
                            onChange={(e) => handleFieldChange(empId, 'outTime', e.target.value)}
                          />
                        </Grid>
                      </Grid>

                      {/* Remarks */}
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Remarks / Notes (optional)"
                        value={item.remarks || ''}
                        onChange={(e) => handleFieldChange(empId, 'remarks', e.target.value)}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        /* DataGrid Table View for Desktop / Tablet */
        <Paper sx={{ p: 2, borderRadius: 4, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E0E0E0', paddingBottom: '10px' }}>
                <th style={{ padding: '12px', fontWeight: 700 }}>Employee</th>
                <th style={{ padding: '12px', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '12px', fontWeight: 700 }}>Area</th>
                <th style={{ padding: '12px', fontWeight: 700 }}>Shift</th>
                <th style={{ padding: '12px', fontWeight: 700 }}>In Time</th>
                <th style={{ padding: '12px', fontWeight: 700 }}>Out Time</th>
                <th style={{ padding: '12px', fontWeight: 700 }}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoster.map((item) => {
                const empId = item.employee?._id || item.employee;
                const empName = item.employee?.name || 'Employee';
                const isOffOrAbsent = item.status === 'OFF' || item.status === 'ABSENT';
                const currentAreaId = item.area?._id || item.area || '';
                const currentShiftId = item.shift?._id || item.shift || '';

                return (
                  <tr key={empId} style={{ borderBottom: '1px solid #F0F0F0' }}>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{empName}</td>
                    <td style={{ padding: '12px' }}>
                      <Select
                        size="small"
                        value={item.status || 'WORKING'}
                        onChange={(e) => handleFieldChange(empId, 'status', e.target.value)}
                        sx={{ minWidth: 125, borderRadius: 2 }}
                      >
                        <MenuItem value="WORKING">WORKING</MenuItem>
                        <MenuItem value="OFF">WEEKLY OFF</MenuItem>
                        <MenuItem value="ABSENT">ABSENT</MenuItem>
                      </Select>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Select
                        multiple
                        size="small"
                        disabled={isOffOrAbsent}
                        value={Array.isArray(item.areas) ? item.areas.map(a => typeof a === 'object' ? a._id : a) : item.area ? [typeof item.area === 'object' ? item.area._id : item.area] : []}
                        onChange={(e) => handleFieldChange(empId, 'areas', e.target.value)}
                        sx={{ minWidth: 160, borderRadius: 1.5 }}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((val) => {
                              const areaObj = areas.find((a) => a._id === val);
                              return <Chip key={val} label={areaObj ? areaObj.name : val} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />;
                            })}
                          </Box>
                        )}
                      >
                        {areas.map((a) => {
                          const selectedArray = Array.isArray(item.areas)
                            ? item.areas.map((area) => (typeof area === 'object' ? area._id : area))
                            : item.area
                            ? [typeof item.area === 'object' ? item.area._id : item.area]
                            : [];
                          const isChecked = selectedArray.includes(a._id);

                          return (
                            <MenuItem key={a._id} value={a._id}>
                              <Checkbox checked={isChecked} size="small" />
                              <ListItemText primary={a.name} />
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Select
                        size="small"
                        disabled={isOffOrAbsent}
                        value={currentShiftId}
                        onChange={(e) => handleFieldChange(empId, 'shift', e.target.value)}
                        sx={{ minWidth: 130, borderRadius: 2 }}
                      >
                        {shifts.map((s) => (
                          <MenuItem key={s._id} value={s._id}>
                            {s.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <TextField
                        size="small"
                        disabled={isOffOrAbsent}
                        placeholder="07:00 AM"
                        value={item.inTime ? format12Hour(item.inTime) : ''}
                        onChange={(e) => handleFieldChange(empId, 'inTime', e.target.value)}
                        sx={{ width: 110 }}
                      />
                    </td>
                    <td style={{ padding: '12px' }}>
                      <TextField
                        size="small"
                        disabled={isOffOrAbsent}
                        placeholder="03:30 PM"
                        value={item.outTime ? format12Hour(item.outTime) : ''}
                        onChange={(e) => handleFieldChange(empId, 'outTime', e.target.value)}
                        sx={{ width: 110 }}
                      />
                    </td>
                    <td style={{ padding: '12px' }}>
                      <TextField
                        size="small"
                        value={item.remarks || ''}
                        onChange={(e) => handleFieldChange(empId, 'remarks', e.target.value)}
                        placeholder="Remarks"
                        sx={{ minWidth: 120 }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Paper>
      )}
    </Box>
  );
}
