/**
 * Formats a time string (e.g. "07:00", "15:30", "23:00", "7:00 AM") to 12-hour AM/PM format (e.g. "07:00 AM", "03:30 PM")
 */
export const format12Hour = (timeStr) => {
  if (!timeStr || timeStr === '-') return '-';
  const trimmed = String(timeStr).trim();
  if (trimmed.toUpperCase().includes('AM') || trimmed.toUpperCase().includes('PM')) {
    return trimmed.toUpperCase();
  }

  const parts = trimmed.split(':');
  if (parts.length < 2) return timeStr;

  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];

  if (isNaN(hours)) return timeStr;

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // hour 0 should be 12

  const formattedHours = hours < 10 ? `0${hours}` : hours;
  return `${formattedHours}:${minutes} ${ampm}`;
};

/**
 * List of standard 12-hour options for easy selection dropdowns (every 30 mins)
 */
export const generate12HourOptions = () => {
  const options = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hh24 = h < 10 ? `0${h}` : `${h}`;
      const mm = m < 10 ? `0${m}` : `${m}`;
      options.push(format12Hour(`${hh24}:${mm}`));
    }
  }
  return options;
};
