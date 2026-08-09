import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer';
import dayjs from 'dayjs';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#1565C0',
    borderBottomStyle: 'solid',
    paddingBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1565C0',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  metaText: {
    fontSize: 11,
    color: '#555555',
    fontWeight: 'bold',
  },
  metaValue: {
    color: '#1565C0',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    backgroundColor: '#1565C0',
    color: '#FFFFFF',
    padding: 5,
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  offSectionTitle: {
    backgroundColor: '#D32F2F',
    color: '#FFFFFF',
    padding: 5,
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  table: {
    width: 'auto',
    borderWidth: 1,
    borderColor: '#1565C0',
    borderStyle: 'solid',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    borderBottomStyle: 'solid',
    minHeight: 22,
    alignItems: 'center',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderBottomWidth: 1.5,
    borderBottomColor: '#1565C0',
    borderBottomStyle: 'solid',
    minHeight: 24,
    alignItems: 'center',
  },
  colArea: {
    width: '30%',
    paddingLeft: 6,
    fontSize: 9,
    fontWeight: 'bold',
    color: '#333333',
  },
  colEmp: {
    width: '40%',
    paddingLeft: 6,
    fontSize: 9,
    color: '#111111',
  },
  colIn: {
    width: '15%',
    textAlign: 'center',
    fontSize: 9,
    fontWeight: 'bold',
  },
  colOut: {
    width: '15%',
    textAlign: 'center',
    fontSize: 9,
    fontWeight: 'bold',
  },
  colStatus: {
    width: '25%',
    textAlign: 'center',
    fontSize: 9,
    fontWeight: 'bold',
  },
  colRemarks: {
    width: '35%',
    paddingLeft: 6,
    fontSize: 9,
    color: '#555555',
  },
  emptyCell: {
    width: '100%',
    textAlign: 'center',
    fontSize: 9,
    fontStyle: 'italic',
    padding: 6,
    color: '#666666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#DDDDDD',
    borderTopStyle: 'solid',
  },
  sigBox: {
    textAlign: 'center',
  },
  sigLine: {
    width: 150,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid',
    marginBottom: 4,
  },
  sigLabel: {
    fontSize: 9,
    fontWeight: 'bold',
  },
});

export const DutyRosterDocument = ({ date, roster, hotelName = 'Hotel Mumbai House' }) => {
  const formattedDate = date ? dayjs(date).format('DD MMMM YYYY') : '';
  const dayOfWeek = date ? dayjs(date).format('dddd') : '';

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
      let areaName = 'Unassigned';
      if (Array.isArray(item.areas) && item.areas.length > 0) {
        areaName = item.areas.map((a) => (typeof a === 'object' ? a.name : a)).join(', ');
      } else if (item.area && typeof item.area === 'object') {
        areaName = item.area.name;
      }

      const entry = {
        area: areaName,
        employee: fullEmp,
        inTime: item.inTime || '-',
        outTime: item.outTime || '-',
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

  const renderShiftSection = (title, items) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.table}>
        <View style={styles.tableHeaderRow}>
          <Text style={styles.colArea}>Area</Text>
          <Text style={styles.colEmp}>Employee Name</Text>
          <Text style={styles.colIn}>In Time</Text>
          <Text style={styles.colOut}>Out Time</Text>
        </View>
        {items.length === 0 ? (
          <View style={styles.tableRow}>
            <Text style={styles.emptyCell}>No employees assigned to this shift</Text>
          </View>
        ) : (
          items.map((row, idx) => (
            <View style={styles.tableRow} key={idx}>
              <Text style={styles.colArea}>{row.area}</Text>
              <Text style={styles.colEmp}>{row.employee}</Text>
              <Text style={styles.colIn}>{row.inTime}</Text>
              <Text style={styles.colOut}>{row.outTime}</Text>
            </View>
          ))
        )}
      </View>
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{hotelName}</Text>
          <Text style={styles.subtitle}>DAILY DUTY ROSTER</Text>
          <View style={styles.metaContainer}>
            <Text style={styles.metaText}>
              DATE: <Text style={styles.metaValue}>{formattedDate}</Text>
            </Text>
            <Text style={styles.metaText}>
              DAY: <Text style={styles.metaValue}>{dayOfWeek}</Text>
            </Text>
          </View>
        </View>

        {/* Shift Sections */}
        {renderShiftSection('Morning Shift', morningList)}
        {renderShiftSection('Afternoon Shift (Second Shift)', secondList)}
        {renderShiftSection('Night Shift', nightList)}

        {/* OFF / ABSENT Section */}
        <View style={styles.section}>
          <Text style={styles.offSectionTitle}>OFF / ABSENT EMPLOYEES</Text>
          <View style={{ ...styles.table, borderColor: '#D32F2F' }}>
            <View style={{ ...styles.tableHeaderRow, backgroundColor: '#FFEBEE', borderBottomColor: '#D32F2F' }}>
              <Text style={{ ...styles.colEmp, width: '40%' }}>Employee Name</Text>
              <Text style={styles.colStatus}>Status</Text>
              <Text style={styles.colRemarks}>Remarks</Text>
            </View>
            {offLeaveList.length === 0 ? (
              <View style={styles.tableRow}>
                <Text style={styles.emptyCell}>All employees are working today</Text>
              </View>
            ) : (
              offLeaveList.map((row, idx) => (
                <View style={styles.tableRow} key={idx}>
                  <Text style={{ ...styles.colEmp, width: '40%' }}>{row.employee}</Text>
                  <Text style={styles.colStatus}>{row.status}</Text>
                  <Text style={styles.colRemarks}>{row.remarks || '-'}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Footer Signatures */}
        <View style={styles.footer}>
          <View style={styles.sigBox}>
            <View style={styles.sigLine} />
            <Text style={styles.sigLabel}>Housekeeping Supervisor</Text>
          </View>
          <View style={styles.sigBox}>
            <View style={styles.sigLine} />
            <Text style={styles.sigLabel}>General Manager Signature</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export const downloadReactPdf = async (date, roster, filename = 'Duty_Roster.pdf') => {
  const doc = <DutyRosterDocument date={date} roster={roster} />;
  const blob = await pdf(doc).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
