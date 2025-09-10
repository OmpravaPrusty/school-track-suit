import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts
// Note: In a real app, you would need to provide the font files.
// For this example, we'll rely on default fonts but show how to register them.
Font.register({
  family: 'Oswald',
  src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf'
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Oswald',
    color: '#1E40AF', // A blue color
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280', // A gray color
  },
  summarySection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    border: '1pt solid #E5E7EB',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#F9FAFB',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 10,
    color: '#4B5563',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  table: {
    display: "flex",
    flexDirection: "column",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    width: "20%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F3F4F6',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableCol: {
    width: "20%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableCell: {
    fontSize: 9,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: 'grey',
    fontSize: 10,
  },
});

interface ReportData {
  students: {
    name: string;
    id: string;
    present: number;
    absent: number;
    percentage: number;
  }[];
  batchName: string;
  month: string;
  totalPresent: number;
  totalAbsent: number;
  overallPercentage: number;
}

interface AttendancePDFProps {
  data: ReportData;
}

const AttendancePDF = ({ data }: AttendancePDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Attendance Report</Text>
        <Text style={styles.subtitle}>{data.batchName} - {data.month}</Text>
      </View>

      <View style={styles.summarySection}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{data.totalPresent}</Text>
          <Text style={styles.summaryLabel}>Total Present Days</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{data.totalAbsent}</Text>
          <Text style={styles.summaryLabel}>Total Absent Days</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{data.overallPercentage}%</Text>
          <Text style={styles.summaryLabel}>Overall Attendance</Text>
        </View>
      </View>

      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableRow}>
          <View style={{...styles.tableColHeader, width: '35%'}}><Text style={styles.tableCellHeader}>Student Name</Text></View>
          <View style={{...styles.tableColHeader, width: '25%'}}><Text style={styles.tableCellHeader}>Student ID</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Present</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Absent</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Attendance %</Text></View>
        </View>
        {/* Table Body */}
        {data.students.map((student, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={{...styles.tableCol, width: '35%'}}><Text style={styles.tableCell}>{student.name}</Text></View>
            <View style={{...styles.tableCol, width: '25%'}}><Text style={styles.tableCell}>{student.id}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{student.present}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{student.absent}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{student.percentage}%</Text></View>
          </View>
        ))}
      </View>

      <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
        `Page ${pageNumber} of ${totalPages}`
      )} fixed />
    </Page>
  </Document>
);

export default AttendancePDF;
