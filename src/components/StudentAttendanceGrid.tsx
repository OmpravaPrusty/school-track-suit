import React from 'react';
import { format, getDaysInMonth, startOfMonth } from 'date-fns';

interface Student {
  id: string;
  name: string;
}

interface AttendanceRecord {
  student_id: string;
  status: 'present' | 'absent';
  attendance_date: string;
}

interface StudentAttendanceGridProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  month: number;
  year: number;
}

const StudentAttendanceGrid = ({ students, attendanceRecords, month, year }: StudentAttendanceGridProps) => {
  const daysInMonth = getDaysInMonth(new Date(year, month));
  const dates = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));

  const attendanceMap = new Map<string, 'present' | 'absent'>();
  attendanceRecords.forEach(record => {
    const key = `${record.student_id}|${record.attendance_date}`;
    attendanceMap.set(key, record.status);
  });

  const getColor = (status: 'present' | 'absent' | undefined) => {
    if (status === 'present') return 'bg-green-500';
    if (status === 'absent') return 'bg-red-500';
    return 'bg-gray-300';
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Student Attendance Grid</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">Student</th>
              {dates.map(date => (
                <th key={date.toISOString()} className="border border-gray-300 p-2 text-center">
                  {format(date, 'd')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.id}>
                <td className="border border-gray-300 p-2 font-medium">{student.name}</td>
                {dates.map(date => {
                  const dateStr = format(date, 'yyyy-MM-dd');
                  const key = `${student.id}|${dateStr}`;
                  const status = attendanceMap.get(key);
                  const colorClass = getColor(status);
                  return (
                    <td key={date.toISOString()} className="border border-gray-300 p-0">
                      <div className={`w-full h-8 ${colorClass}`} title={`Status: ${status || 'N/A'}`} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentAttendanceGrid;
