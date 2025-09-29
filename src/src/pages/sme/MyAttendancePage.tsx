import { useAuth } from "@/components/AuthProvider";
import MyAttendance from "@/components/MyAttendance";

const SMEMyAttendancePage = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading user information...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Attendance</h1>
          <p className="text-muted-foreground">View your monthly attendance record.</p>
        </div>
      </div>
      <MyAttendance userId={user.id} userRole="sme" />
    </div>
  );
};

export default SMEMyAttendancePage;
