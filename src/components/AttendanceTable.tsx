import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";

interface AttendanceTableProps {
  viewType: string;
  dates: Date[];
  data: Array<{
    id: string;
    name: string;
    identifier: string;
    identifierLabel: string;
  }>;
  attendance: Record<string, 'present' | 'absent'>;
  onAttendanceToggle: (id: string, date: Date) => void;
  isDateInFuture: (date: Date) => boolean;
  formatDateAsUTC: (date: Date) => string;
}

export function AttendanceTable({
  viewType,
  dates,
  data,
  attendance,
  onAttendanceToggle,
  isDateInFuture,
  formatDateAsUTC,
}: AttendanceTableProps) {
  return (
    <div className="w-full border rounded-lg bg-card">
      <div className="overflow-x-auto">
        <div className="min-w-full inline-block align-middle">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/30">
              <tr>
                <th className="sticky left-0 z-20 bg-muted/30 px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[200px] border-r border-border shadow-[2px_0_4px_rgba(0,0,0,0.1)]">
                  Name
                </th>
                <th className="sticky left-[200px] z-20 bg-muted/30 px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[120px] border-r border-border shadow-[2px_0_4px_rgba(0,0,0,0.1)]">
                  {data[0]?.identifierLabel || 'ID'}
                </th>
                {dates.map((date) => {
                  const dayOfWeek = date.getUTCDay();
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                  return (
                    <th 
                      key={date.toISOString()} 
                      className={`px-3 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[100px] ${
                        isWeekend && viewType === 'month' ? 'bg-muted/10' : ''
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        {viewType === 'month' ? (
                          <>
                            <span className="text-xs font-semibold">{format(date, 'E')}</span>
                            <span className="text-lg font-bold text-foreground">{date.getUTCDate()}</span>
                          </>
                        ) : (
                          <span className="text-xs">{formatDateAsUTC(date)}</span>
                        )}
                        {isDateInFuture(date) && (
                          <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                            Future
                          </Badge>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {data.map((item, index) => (
                <tr 
                  key={item.id} 
                  className={`hover:bg-muted/20 transition-colors ${
                    index % 2 === 0 ? 'bg-card' : 'bg-muted/5'
                  }`}
                >
                  <td className="sticky left-0 z-10 bg-inherit px-4 py-3 text-sm font-medium text-foreground border-r border-border shadow-[2px_0_4px_rgba(0,0,0,0.05)]">
                    {item.name}
                  </td>
                  <td className="sticky left-[200px] z-10 bg-inherit px-4 py-3 text-sm text-muted-foreground border-r border-border shadow-[2px_0_4px_rgba(0,0,0,0.05)]">
                    {item.identifier}
                  </td>
                  {dates.map((date) => {
                    const dateStr = formatDateAsUTC(date);
                    const key = `${item.id}|${dateStr}`;
                    const status = attendance[key] || 'absent';
                    const isPresent = status === 'present';
                    const future = isDateInFuture(date);
                    const dayOfWeek = date.getUTCDay();
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                    
                    return (
                      <td 
                        key={dateStr} 
                        className={`px-3 py-3 text-center ${
                          isWeekend && viewType === 'month' ? 'bg-muted/10' : ''
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Switch
                            checked={isPresent}
                            onCheckedChange={() => onAttendanceToggle(item.id, date)}
                            disabled={future}
                            className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-200 h-5 w-9"
                          />
                          <span className={`text-xs font-medium ${
                            future 
                              ? 'text-muted-foreground' 
                              : isPresent 
                                ? 'text-emerald-600' 
                                : 'text-slate-500'
                          }`}>
                            {future ? '-' : (isPresent ? 'Present' : 'Absent')}
                          </span>
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
    </div>
  );
}