import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const resolveImageUrl = (urlPath) => {
  if (!urlPath) return '';
  if (urlPath.startsWith('data:') || urlPath.startsWith('http://') || urlPath.startsWith('https://')) {
    return urlPath;
  }
  const apiBase = import.meta.env.VITE_API_URL || 'https://daily-roster.onrender.com/api';
  const serverOrigin = apiBase.replace(/\/api\/?$/, '');
  return `${serverOrigin}${urlPath.startsWith('/') ? '' : '/'}${urlPath}`;
};

export const generateDutyRosterPdf = async (
  date,
  roster,
  filename = 'Duty_Roster.pdf',
  allAreas = [],
  hotelName = '',
  logoUrl = ''
) => {
  // Create a visible temporary printable element on body
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.top = '-9999px';
  container.style.left = '0';
  container.style.width = '794px'; // A4 width at 96 DPI
  container.style.backgroundColor = '#ffffff';
  container.style.padding = '32px';
  container.style.boxSizing = 'border-box';
  container.style.fontFamily = 'Arial, sans-serif';

  const dayjs = (await import('dayjs')).default;
  const formattedDate = date ? dayjs(date).format('DD MMMM YYYY') : '';
  const dayOfWeek = date ? dayjs(date).format('dddd') : '';

  const displayHotelName = hotelName || 'HOTEL MUMBAI HOUSE';
  const fullLogoUrl = resolveImageUrl(logoUrl);

  // Helper function to format 24h time string (07:00, 15:30) to 12h AM/PM (07:00 AM, 03:30 PM)
  const format12Hour = (timeStr) => {
    if (!timeStr || timeStr === '-') return '-';
    if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    if (isNaN(hours)) return timeStr;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // hour '0' should be '12'
    const formattedHours = hours < 10 ? `0${hours}` : hours;
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  const morningList = [];
  const secondList = [];
  const nightList = [];
  const offLeaveList = [];

  (roster || []).forEach((item) => {
    const empName = item.employee?.name || 'Unknown';
    const fullEmp = empName; // Clean employee name without EMP code

    if (item.status === 'OFF' || item.status === 'ABSENT') {
      offLeaveList.push({
        employee: fullEmp,
        status: item.status,
        remarks: item.remarks || '',
      });
    } else {
      let areaName = '-';

      // Function to get area name from string or object or lookup
      const getAreaName = (a) => {
        if (!a) return null;
        if (typeof a === 'object' && a.name) return a.name;
        if (typeof a === 'string') {
          // If it's a string, check if areasList passed in contains this ID
          if (Array.isArray(allAreas)) {
            const found = allAreas.find((areaObj) => areaObj._id === a || areaObj._id?.toString() === a);
            if (found && found.name) return found.name;
          }
          return a; // Fallback
        }
        return null;
      };

      if (Array.isArray(item.areas) && item.areas.length > 0) {
        const names = item.areas.map(getAreaName).filter(Boolean);
        if (names.length > 0) areaName = names.join(', ');
      } else if (item.area) {
        const singleName = getAreaName(item.area);
        if (singleName) areaName = singleName;
      }

      const entry = {
        area: areaName,
        employee: fullEmp,
        inTime: format12Hour(item.inTime),
        outTime: format12Hour(item.outTime),
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

  const buildTableHtml = (title, items, titleColor = '#2E7D32', headerBg = '#E8F5E9') => `
    <div style="margin-bottom: 20px;">
      <div style="background-color: ${titleColor}; color: #ffffff; padding: 6px 12px; font-weight: bold; font-size: 13px; text-transform: uppercase;">
        ${title}
      </div>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid ${titleColor}; font-size: 12px;">
        <thead>
          <tr style="background-color: ${headerBg}; text-align: left;">
            <th style="padding: 8px; border-bottom: 2px solid ${titleColor}; width: 30%; color: #1B5E20;">Area</th>
            <th style="padding: 8px; border-bottom: 2px solid ${titleColor}; width: 40%; color: #1B5E20;">Employee Name</th>
            <th style="padding: 8px; border-bottom: 2px solid ${titleColor}; width: 15%; text-align: center; color: #1B5E20;">In Time</th>
            <th style="padding: 8px; border-bottom: 2px solid ${titleColor}; width: 15%; text-align: center; color: #1B5E20;">Out Time</th>
          </tr>
        </thead>
        <tbody>
          ${
            items.length === 0
              ? `<tr><td colspan="4" style="padding: 10px; text-align: center; font-style: italic; color: #666;">No employees assigned to this shift</td></tr>`
              : items
                  .map(
                    (row) => `
            <tr style="border-bottom: 1px solid #E0E0E0;">
              <td style="padding: 8px; font-weight: 800; color: #111111; font-size: 13px;">${row.area}</td>
              <td style="padding: 8px; font-weight: 800; color: #111111; font-size: 14px;">${row.employee}</td>
              <td style="padding: 8px; text-align: center; font-weight: 800; color: #111111; font-size: 14px;">${row.inTime}</td>
              <td style="padding: 8px; text-align: center; font-weight: 800; color: #111111; font-size: 14px;">${row.outTime}</td>
            </tr>
          `
                  )
                  .join('')
          }
        </tbody>
      </table>
    </div>
  `;

  const buildOffTableHtml = (items) => `
    <div style="margin-bottom: 20px;">
      <div style="background-color: #D32F2F; color: #ffffff; padding: 6px 12px; font-weight: bold; font-size: 13px; text-transform: uppercase;">
        OFF / ABSENT EMPLOYEES
      </div>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #D32F2F; font-size: 12px;">
        <thead>
          <tr style="background-color: #FFEBEE; text-align: left;">
            <th style="padding: 8px; border-bottom: 2px solid #D32F2F; width: 45%; color: #C62828;">Employee Name</th>
            <th style="padding: 8px; border-bottom: 2px solid #D32F2F; width: 25%; text-align: center; color: #C62828;">Status</th>
            <th style="padding: 8px; border-bottom: 2px solid #D32F2F; width: 30%; color: #C62828;">Remarks</th>
          </tr>
        </thead>
        <tbody>
          ${
            items.length === 0
              ? `<tr><td colspan="3" style="padding: 10px; text-align: center; font-style: italic; color: #666;">All employees are working today</td></tr>`
              : items
                  .map(
                    (row) => `
            <tr style="border-bottom: 1px solid #E0E0E0;">
              <td style="padding: 8px; font-weight: 800; color: #111111; font-size: 14px;">${row.employee}</td>
              <td style="padding: 8px; text-align: center;"><span style="background-color: ${row.status === 'OFF' ? '#ED6C02' : '#D32F2F'}; color: #fff; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 11px;">${row.status === 'OFF' ? 'WEEKLY OFF' : row.status}</span></td>
              <td style="padding: 8px; color: #555;">${row.remarks || '-'}</td>
            </tr>
          `
                  )
                  .join('')
          }
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #2E7D32; padding-bottom: 14px; margin-bottom: 24px;">
      <div style="display: flex; align-items: center; gap: 16px;">
        ${fullLogoUrl ? `<img src="${fullLogoUrl}" style="max-height: 55px; max-width: 120px; object-fit: contain;" />` : ''}
        <div>
          <h1 style="margin: 0; color: #2E7D32; font-size: 24px; text-transform: uppercase; font-weight: 800; line-height: 1.1;">${displayHotelName}</h1>
          <h2 style="margin: 3px 0 0 0; color: #333; font-size: 17px; font-weight: 700; letter-spacing: 0.5px;">DAILY DUTY ROSTER</h2>
        </div>
      </div>
      <div style="text-align: right; font-size: 15px; font-weight: 800; color: #333;">
        <div>DATE: <span style="color: #2E7D32;">${formattedDate}</span></div>
        <div>DAY: <span style="color: #2E7D32;">${dayOfWeek}</span></div>
      </div>
    </div>

    ${buildTableHtml('Morning Shift (First Shift)', morningList)}
    ${buildTableHtml('Afternoon Shift (Second Shift)', secondList)}
    ${buildTableHtml('Night Shift (Third Shift)', nightList)}
    ${buildOffTableHtml(offLeaveList)}
  `;

  document.body.appendChild(container);

  try {
    // Wait briefly for layout render
    await new Promise((res) => setTimeout(res, 100));

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: 794,
    });

    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

    // Trigger direct blob download link to prevent browser corrupt file errors
    const pdfBlob = pdf.output('blob');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(pdfBlob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(link.href), 5000);

    return true;
  } catch (error) {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
    console.error('PDF Generation Error:', error);
    throw error;
  }
};
