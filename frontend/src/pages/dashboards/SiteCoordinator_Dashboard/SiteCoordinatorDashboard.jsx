import React, { useState } from 'react';
import {
  Calendar,
  ShieldCheck,
  User,
} from 'lucide-react';
import PublicNavigation from '../Public_Dashboard/PublicNavigation';
import SiteCoordinatorSidebar from './components/SiteCoordinatorSidebar';
import LocationAttendance from '../../../components/attendance/LocationAttendance';
import WorkDocCard from '../../../components/attendance/WorkDocCard';
import useMyAttendance from '../../../hooks/useMyAttendance';
import { TableSkeleton } from '../../../components/SkeletonLoader';

const formatTime12 = (t) => {
  if (!t) return '-';
  const [h, m] = t.split(':').map(Number);
  if (Number.isNaN(h)) return t;
  const period = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${period}`;
};

const calcMinutes = (timeIn, timeOut) => {
  if (!timeIn || !timeOut) return 0;
  const [inH, inM] = timeIn.split(':').map(Number);
  const [outH, outM] = timeOut.split(':').map(Number);
  if ([inH, inM, outH, outM].some((v) => Number.isNaN(v))) return 0;
  const m = outH * 60 + outM - (inH * 60 + inM);
  return m > 0 ? m : 0;
};
const formatLateDeduction = (decimalHours) => {
  if (!decimalHours || decimalHours === 0) return '0';
  const hours = Math.floor(decimalHours);
  const mins = Math.round((decimalHours - hours) * 60);
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

const buildLateBreakdown = (am, pm, ot) => {
  const parts = [];
  if (am?.is_late) parts.push(`AM: -${formatLateDeduction(am.late_deduction_hours)}`);
  if (pm?.is_late) parts.push(`PM: -${formatLateDeduction(pm.late_deduction_hours)}`);
  if (ot?.is_late) parts.push(`OT: -${formatLateDeduction(ot.late_deduction_hours)}`);
  return parts.join(' | ');
};
const groupByDate = (rows) => {
  const groups = {};
  rows.forEach((row) => {
    const d = row.date;
    if (!groups[d]) groups[d] = { date: d, morning: null, afternoon: null, overtime: null };
    if (row.session_type === 'morning') groups[d].morning = row;
    else if (row.session_type === 'afternoon') groups[d].afternoon = row;
    else if (row.session_type === 'overtime') groups[d].overtime = row;
    else if (!groups[d].morning) groups[d].morning = row;
  });
  return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date));
};

export default function SiteCoordinatorDashboard({ user, onNavigate }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [workDoc, setWorkDoc] = useState('');
  const [attendanceReady, setAttendanceReady] = useState(false);
  const [expandedWorkIdx, setExpandedWorkIdx] = useState(null);
  const {
    records: attendanceRows,
    loading: attendanceLoading,
    error: attendanceError,
    refresh: refreshAttendance,
  } = useMyAttendance();

  const cardClass = 'rounded-2xl border border-white/10 bg-[#001f35]/70 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.22)]';

  const renderAttendance = () => (
    <div className="space-y-5 sm:space-y-8">
      <div className={cardClass}>
        <div className="p-4 sm:p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-2 border-[#FF7120]/70 bg-[#00273C] grid place-items-center overflow-hidden">
              {user?.profile_picture ? <img src={user.profile_picture} alt="Profile" className="h-full w-full object-cover" /> : <User className="h-8 w-8 sm:h-10 sm:w-10 text-[#FF7120]" />}
            </div>
            <div>
              <h2 className="text-white font-semibold text-[clamp(1rem,3.5vw,1.5rem)]">Welcome, {user?.first_name || 'Site'} {user?.last_name || 'Coordinator'}</h2>
              <p className="text-white/60 text-sm">Role: <span className="text-white/80">{user?.role || 'site_coordinator'}</span></p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border bg-white/5 text-white/70 border-white/10"><ShieldCheck className="h-3.5 w-3.5 mr-1" />Attendance &amp; Work Logs</span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border ${attendanceReady ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' : 'bg-[#FF7120]/10 text-[#FF7120] border-[#FF7120]/30'}`}>
              {attendanceReady ? 'Location Ready' : 'Location Needed'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <LocationAttendance
          role={user?.role}
          className={`${cardClass} p-4 sm:p-6`}
          onStatusChange={({ ready }) => setAttendanceReady(ready)}
          onRecordSaved={refreshAttendance}
        />

        <WorkDocCard value={workDoc} onChange={setWorkDoc} cardClass={cardClass} />
      </div>

      <div className={cardClass}>
        <div className="p-4 sm:p-6 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-white font-semibold flex-1 min-w-[200px] text-lg tracking-tight">My Attendance History</h3>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#001a2b] px-3 py-2 w-full sm:w-auto">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-white/80 text-sm outline-none w-full cursor-pointer [&::-webkit-calendar-picker-indicator]:invert-[0.6]"
            />
          </div>
        </div>
        <div className="max-h-[520px] overflow-auto">
          <table className="w-full min-w-[1200px] border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#001a2b] border-b border-white/10">
                {[
                  "DATE",
                  "AM IN",
                  "AM OUT",
                  "PM IN",
                  "PM OUT",
                  "OT IN",
                  "OT OUT",
                  "TOTAL HOURS",
                  "LATE DEDUCTION",
                  "LOCATION",
                  "WORK DONE",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/50 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attendanceLoading && (
                <tr>
                  <td colSpan={11} className="px-6 py-4">
                    <TableSkeleton />
                  </td>
                </tr>
              )}
              {!attendanceLoading && attendanceRows.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-6 py-4 text-white/60 text-sm text-center">
                    No attendance records yet.
                  </td>
                </tr>
              )}
              {(() => {
                const daily = groupByDate(attendanceRows);
                return daily.map((day, index) => {
                  const am = day.morning;
                  const pm = day.afternoon;
                  const ot = day.overtime;

                  const totalMins =
                    calcMinutes(am?.time_in, am?.time_out) +
                    calcMinutes(pm?.time_in, pm?.time_out) +
                    calcMinutes(ot?.time_in, ot?.time_out);
                  const totalHours = totalMins > 0 ? `${Math.floor(totalMins / 60)}h ${totalMins % 60}m` : '-';

                  const totalDeduction =
                    parseFloat(am?.late_deduction_hours || 0) +
                    parseFloat(pm?.late_deduction_hours || 0) +
                    parseFloat(ot?.late_deduction_hours || 0);
                  const anyLate = am?.is_late || pm?.is_late || ot?.is_late;

                  const address = am?.clock_in_address || pm?.clock_in_address || ot?.clock_in_address ||
                    am?.location || pm?.location || ot?.location || '-';

                  const allNotes = [am?.notes, pm?.notes, ot?.notes].filter(Boolean).join(' | ');

                  return (
                    <React.Fragment key={day.date}>
                      <tr
                        className={[
                          "border-b border-white/5",
                          index % 2 === 0 ? "bg-[#00273C]" : "bg-[#001f35]",
                          "hover:bg-[#FF7120]/5 transition",
                        ].join(" ")}
                      >
                        <td className="px-4 py-4 text-white/90 text-sm whitespace-nowrap">{day.date}</td>
                        <td className="px-4 py-4 text-white/85 text-sm whitespace-nowrap">{formatTime12(am?.time_in)}</td>
                        <td className="px-4 py-4 text-white/85 text-sm whitespace-nowrap">{formatTime12(am?.time_out)}</td>
                        <td className="px-4 py-4 text-white/85 text-sm whitespace-nowrap">{formatTime12(pm?.time_in)}</td>
                        <td className="px-4 py-4 text-white/85 text-sm whitespace-nowrap">{formatTime12(pm?.time_out)}</td>
                        <td className="px-4 py-4 text-white/85 text-sm whitespace-nowrap">{formatTime12(ot?.time_in)}</td>
                        <td className="px-4 py-4 text-white/85 text-sm whitespace-nowrap">{formatTime12(ot?.time_out)}</td>
                        <td className="px-4 py-4 text-emerald-400 text-sm font-semibold whitespace-nowrap">{totalHours}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold">
                          {anyLate ? (
                            <div className="flex flex-col gap-1">
                              <span className="text-[#FF7120] font-bold">-{formatLateDeduction(totalDeduction)}</span>
                              <span className="text-white/50 text-xs">{buildLateBreakdown(am, pm, ot)}</span>
                            </div>
                          ) : (
                            <span className="text-emerald-300">On time</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-white/70 text-sm max-w-[180px]">
                          <span className="truncate block" title={address}>{address}</span>
                        </td>
                        <td className="px-4 py-4 text-white/85 text-sm max-w-[180px]">
                          <div className="flex items-center gap-2">
                            <span className="truncate">{allNotes || '-'}</span>
                            {allNotes && (
                              <button
                                className="shrink-0 p-1 px-2 text-[10px] rounded bg-[#FF7120] text-white hover:bg-[#e0611b] transition"
                                onClick={() => setExpandedWorkIdx((v) => (v === index ? null : index))}
                                type="button"
                                aria-label="Toggle work done details"
                              >
                                ...
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {expandedWorkIdx === index && (
                        <tr className="border-b border-white/5 bg-[#001a2b]">
                          <td colSpan={11} className="px-6 py-4">
                            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">WORK DONE (FULL)</p>
                              <p className="mt-2 text-white/90 text-sm leading-relaxed whitespace-pre-line">{allNotes}</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                });
              })()}
            </tbody>
          </table>
          {attendanceError && <p className="mt-3 text-xs text-red-200">{attendanceError}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#00273C] relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-40 -right-40 h-[520px] w-[520px] rounded-full bg-cyan-400/10 blur-[90px]" />
      </div>

      <PublicNavigation onNavigate={onNavigate} currentPage="attendance" user={user} />

      <div className="relative pt-40 sm:pt-28 px-3 sm:px-6 pb-10">
        <div className="max-w-[1600px] mx-auto flex gap-6">
          <aside className="w-64 shrink-0 hidden lg:block">
            <SiteCoordinatorSidebar currentPage="attendance" onNavigate={onNavigate} activeSection="attendance" onSelectSection={() => { }} />
          </aside>

          <main className="flex-1 min-w-0">
            {renderAttendance()}
          </main>
        </div>
      </div>
    </div>
  );
}
