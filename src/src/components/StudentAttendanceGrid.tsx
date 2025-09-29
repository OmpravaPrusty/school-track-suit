import React from "react";
import { format, getDaysInMonth } from "date-fns";

interface Student {
  id: string;
  name: string;
}

interface AttendanceRecord {
  student_id: string;
  status: "present" | "absent" | "late" | "not_applicable";
  attendance_date: string;
}

interface StudentAttendanceGridProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  month: number;
  year: number;
}

const StudentAttendanceGrid = ({
  students,
  attendanceRecords,
  month,
  year,
}: StudentAttendanceGridProps) => {
  const daysInMonth = getDaysInMonth(new Date(year, month));
  const dates = Array.from(
    { length: daysInMonth },
    (_, i) => new Date(year, month, i + 1)
  );

  const attendanceMap = new Map<
    string,
    "present" | "absent" | "late" | "not_applicable"
  >();
  attendanceRecords.forEach((record) => {
    const key = `${record.student_id}|${record.attendance_date}`;
    attendanceMap.set(key, record.status);
  });

  const getColor = (
    status: "present" | "absent" | "late" | "not_applicable" | undefined
  ) => {
    if (status === "present") return "bg-green-500";
    if (status === "absent") return "bg-red-500";
    if (status === "late") return "bg-yellow-500";
    if (status === "not_applicable") return "bg-blue-500";
    return "bg-gray-300";
  };

  const getStatusText = (
    status: "present" | "absent" | "late" | "not_applicable" | undefined
  ) => {
    if (status === "present") return "P";
    if (status === "absent") return "A";
    if (status === "late") return "L";
    if (status === "not_applicable") return "NA";
    return "NM";
  };

  const getTextColor = (
    status: "present" | "absent" | "late" | "not_applicable" | undefined
  ) => {
    if (status === "late") return "text-black"; // Better contrast on yellow
    if (status === "not_applicable") return "text-white";
    return "text-white";
  };

  const getStatusTitle = (
    status: "present" | "absent" | "late" | "not_applicable" | undefined
  ) => {
    if (status === "present") return "Present";
    if (status === "absent") return "Absent";
    if (status === "late") return "Late";
    if (status === "not_applicable") return "Not Applicable";
    return "Not Marked";
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Student Attendance Grid</h3>
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
          <div className="w-4 h-4 bg-yellow-500 rounded-sm" />
          <span>L: Late</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded-sm" />
          <span>NA: Not Applicable</span>
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
              <th className="border border-gray-300 p-2">Student</th>
              {dates.map((date) => (
                <th
                  key={date.toISOString()}
                  className="border border-gray-300 p-2 text-center w-10"
                >
                  {format(date, "d")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td className="border border-gray-300 p-2 font-medium">
                  {student.name}
                </td>
                {dates.map((date) => {
                  const dateStr = format(date, "yyyy-MM-dd");
                  const key = `${student.id}|${dateStr}`;
                  const status = attendanceMap.get(key);
                  const colorClass = getColor(status);
                  const statusText = getStatusText(status);
                  const textColor = getTextColor(status);
                  const titleText = getStatusTitle(status);

                  return (
                    <td
                      key={date.toISOString()}
                      className="border border-gray-300 p-0 text-center"
                    >
                      <div
                        className={`w-full h-8 flex items-center justify-center ${textColor} font-bold text-xs ${colorClass}`}
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

export default StudentAttendanceGrid;
