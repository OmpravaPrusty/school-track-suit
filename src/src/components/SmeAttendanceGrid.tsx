import React from 'react';
import { format, getDaysInMonth } from 'date-fns';

interface SME {
  id: string;
  name: string;
}

interface AttendanceRecord {
  sme_id: string;
  status: 'present' | 'absent';
  attendance_date: string;
}

interface SmeAttendanceGridProps {
  smes: SME[];
  attendanceRecords: AttendanceRecord[];
  month: number;
  year: number;
}

const SmeAttendanceGrid = ({ smes, attendanceRecords, month, year }: SmeAttendanceGridProps) => {
  const daysInMonth = getDaysInMonth(new Date(year, month));
  const dates = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));

  const attendanceMap = new Map<string, 'present' | 'absent'>();
  if (attendanceRecords) {
    attendanceRecords.forEach(record => {
      const key = `${record.sme_id}|${record.attendance_date}`;
      attendanceMap.set(key, record.status);
    });
  }

  const getColor = (status: 'present' | 'absent' | undefined) => {
    if (status === 'present') return 'bg-green-500';
    if (status === 'absent') return 'bg-red-500';
    return 'bg-gray-300';
  };

  const getStatusText = (status: 'present' | 'absent' | undefined) => {
    if (status === 'present') return 'P';
    if (status === 'absent') return 'A';
    return 'NM';
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">SME Attendance Grid</h3>
      <div className="flex items-center space-x-4 mb-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded-sm" />
          <span>P: Present</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded-sm" />
          <span>A: Absent</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-300 rounded-sm" />
          <span>NM: Not Marked</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">SME</th>
              {dates.map(date => (
                <th key={date.toISOString()} className="border border-gray-300 p-2 text-center w-10">
                  {format(date, 'd')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {smes.map(sme => (
              <tr key={sme.id}>
                <td className="border border-gray-300 p-2 font-medium">{sme.name}</td>
                {dates.map(date => {
                  const dateStr = format(date, 'yyyy-MM-dd');
                  const key = `${sme.id}|${dateStr}`;
                  const status = attendanceMap.get(key);
                  const colorClass = getColor(status);
                  const statusText = getStatusText(status);
                  const titleText = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Not Marked';

                  return (
                    <td key={date.toISOString()} className="border border-gray-300 p-0 text-center">
                      <div
                        className={`w-full h-8 flex items-center justify-center text-white font-bold text-xs ${colorClass}`}
                        title={`Status: ${titleText}`}
                      >
                        {statusText}
                      </div>
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

export default SmeAttendanceGrid;
