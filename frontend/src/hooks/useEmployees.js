import { useState, useEffect, useMemo, useCallback } from 'react';
import { getAccountingEmployees } from '../services/adminService';
import { getAllAttendance } from '../services/attendanceService';
import { getAllOvertime } from '../services/overtimeService';

const roleFilterMap = {
  Accounting: 'accounting',
  'Site Coordinator': 'site_coordinator',
  'Site Engineer': 'site_engineer',
  'BIM Specialist': 'bim_specialist',
  Interns: 'intern',
  'Junior Designer': 'junior_architect',
  'Studio Head': 'studio_head',
};

const normalizeRole = (value = '') => {
  const v = value.toLowerCase().trim();
  if (v === 'intern') return 'interns';
  if (v === 'junior architect') return 'junior designer';
  return v;
};

const timeToMinutes = (timeValue) => {
  if (!timeValue || typeof timeValue !== 'string' || !timeValue.includes(':')) return null;
  const [hourPart, minutePart] = timeValue.split(':');
  const hours = Number(hourPart);
  const minutes = Number(minutePart);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return (hours * 60) + minutes;
};

const getWorkedHours = (record) => {
  const inMinutes = timeToMinutes(record?.time_in);
  const outMinutes = timeToMinutes(record?.time_out);
  if (inMinutes === null || outMinutes === null || outMinutes < inMinutes) return 0;
  return (outMinutes - inMinutes) / 60;
};

export const getBiMonthlyCutoffs = (date = new Date()) => {
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  let cutoff14_28 = {
    label: '',
    startDate: null,
    endDate: null,
  };
  let cutoff29_13 = {
    label: '',
    startDate: null,
    endDate: null,
  };

  if (day >= 14 && day <= 28) {
    // 14-28 is active (June 14 - June 28)
    cutoff14_28.startDate = new Date(year, month, 14);
    cutoff14_28.endDate = new Date(year, month, 28);
    
    // The alternative 29-13 cutoff is the previous one (May 29 - June 13)
    cutoff29_13.startDate = new Date(year, month - 1, 29);
    cutoff29_13.endDate = new Date(year, month, 13);
  } else if (day >= 29) {
    // 29-13 is active (June 29 - July 13)
    cutoff29_13.startDate = new Date(year, month, 29);
    cutoff29_13.endDate = new Date(year, month + 1, 13);

    // The alternative 14-28 cutoff is the current month's one (June 14 - June 28)
    cutoff14_28.startDate = new Date(year, month, 14);
    cutoff14_28.endDate = new Date(year, month, 28);
  } else {
    // day <= 13
    // 29-13 is active (May 29 - June 13)
    cutoff29_13.startDate = new Date(year, month - 1, 29);
    cutoff29_13.endDate = new Date(year, month, 13);

    // The alternative 14-28 cutoff is the previous month's one (May 14 - May 28)
    cutoff14_28.startDate = new Date(year, month - 1, 14);
    cutoff14_28.endDate = new Date(year, month - 1, 28);
  }

  const formatDateLabel = (start, end) => {
    const options = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} – ${end.toLocaleDateString('en-US', options)}`;
  };

  cutoff14_28.label = formatDateLabel(cutoff14_28.startDate, cutoff14_28.endDate);
  cutoff29_13.label = formatDateLabel(cutoff29_13.startDate, cutoff29_13.endDate);

  cutoff14_28.startDate.setHours(0, 0, 0, 0);
  cutoff14_28.endDate.setHours(23, 59, 59, 999);
  cutoff29_13.startDate.setHours(0, 0, 0, 0);
  cutoff29_13.endDate.setHours(23, 59, 59, 999);

  return { cutoff14_28, cutoff29_13 };
};

export const getPayPeriodDates = (periodType, customStart, customEnd) => {
  const { cutoff14_28, cutoff29_13 } = getBiMonthlyCutoffs(new Date());
  let startDate = null;
  let endDate = null;

  if (periodType === 'cutoff-14-28') {
    startDate = cutoff14_28.startDate;
    endDate = cutoff14_28.endDate;
  } else if (periodType === 'cutoff-29-13') {
    startDate = cutoff29_13.startDate;
    endDate = cutoff29_13.endDate;
  } else if (periodType === 'Last Month') {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    startDate = new Date(year, month - 1, 1);
    endDate = new Date(year, month, 0);
  } else if (periodType === 'Custom Range') {
    if (customStart) startDate = new Date(customStart);
    if (customEnd) endDate = new Date(customEnd);
  }

  if (startDate) startDate.setHours(0, 0, 0, 0);
  if (endDate) endDate.setHours(23, 59, 59, 999);

  return { startDate, endDate };
};

export function useEmployees(options = {}) {
  const defaultPeriod = (new Date().getDate() >= 14 && new Date().getDate() <= 28) ? 'cutoff-14-28' : 'cutoff-29-13';
  const {
    selectedDepartment = 'All',
    selectedStatus = 'All',
    searchTerm = '',
    selectedPeriod = defaultPeriod,
    customStartDate = null,
    customEndDate = null,
    selectedWageType = 'All',
    selectedSort = 'name-asc',
  } = options;

  const [employees, setEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAttendanceLoading, setIsAttendanceLoading] = useState(true);
  const [overtimeRequests, setOvertimeRequests] = useState([]);

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    try {
      const roleFilter = roleFilterMap[selectedDepartment] || undefined;
      const data = await getAccountingEmployees({
        active_only: true,
        ...(roleFilter ? { role: roleFilter } : {}),
      });
      setEmployees(data);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDepartment]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    let isActive = true;

    const fetchAttendanceRecords = async () => {
      setIsAttendanceLoading(true);
      try {
        const [attendanceData, otData] = await Promise.allSettled([
          getAllAttendance(),
          getAllOvertime({ force: true }),
        ]);
        if (!isActive) return;
        setAttendanceRecords(Array.isArray(attendanceData.value) ? attendanceData.value : []);
        setOvertimeRequests(Array.isArray(otData.value) ? otData.value : []);
      } catch (error) {
        console.error('Failed to fetch attendance/overtime records:', error);
        if (isActive) {
          setAttendanceRecords([]);
          setOvertimeRequests([]);
        }
      } finally {
        if (isActive) {
          setIsAttendanceLoading(false);
        }
      }
    };

    fetchAttendanceRecords();

    return () => {
      isActive = false;
    };
  }, []);

  const filteredAttendanceRecords = useMemo(() => {
    const { startDate, endDate } = getPayPeriodDates(selectedPeriod, customStartDate, customEndDate);
    if (!startDate && !endDate) return attendanceRecords;

    return attendanceRecords.filter((record) => {
      const recordDateStr = record?.date || (record?.created_at ? String(record.created_at).slice(0, 10) : null);
      if (!recordDateStr) return false;
      const rDate = new Date(recordDateStr);
      rDate.setHours(0, 0, 0, 0);

      if (startDate && rDate < startDate) return false;
      if (endDate && rDate > endDate) return false;
      return true;
    });
  }, [attendanceRecords, selectedPeriod, customStartDate, customEndDate]);

  const filteredOvertimeRequests = useMemo(() => {
    const { startDate, endDate } = getPayPeriodDates(selectedPeriod, customStartDate, customEndDate);
    if (!startDate && !endDate) return overtimeRequests;

    return overtimeRequests.filter((req) => {
      if (!req.date_completed) return false;
      const rDate = new Date(req.date_completed);
      rDate.setHours(0, 0, 0, 0);

      if (startDate && rDate < startDate) return false;
      if (endDate && rDate > endDate) return false;
      return true;
    });
  }, [overtimeRequests, selectedPeriod, customStartDate, customEndDate]);

  const employeeStats = useMemo(() => {
    let active = 0;
    let onLeave = 0;

    for (const employee of employees) {
      if (employee.status === 'Active') active += 1;
      if (employee.status === 'On Leave') onLeave += 1;
    }

    return {
      total: employees.length,
      active,
      onLeave,
    };
  }, [employees]);

  const employeeAttendanceStats = useMemo(() => {
    const byEmployee = new Map();

    filteredAttendanceRecords.forEach((record) => {
      const employeeId = record?.employee_id ?? record?.user_id;
      if (employeeId === undefined || employeeId === null) return;

      const key = String(employeeId);
      const status = String(record?.status || '').toLowerCase();
      const dateKey = record?.date || (record?.created_at ? String(record.created_at).slice(0, 10) : null);

      if (!byEmployee.has(key)) {
        byEmployee.set(key, {
          totalHours: 0,
          totalOvertimeHours: 0,
          totalLateHours: 0,
          dayMap: new Map(),
        });
      }

      const current = byEmployee.get(key);
      const workedHours = getWorkedHours(record);
      current.totalHours += workedHours;
      if (record?.session_type === 'overtime') {
        current.totalOvertimeHours += workedHours;
      }

      const lateHours = Number(record?.late_deduction_hours || 0);
      if (Number.isFinite(lateHours) && lateHours > 0) {
        current.totalLateHours += lateHours;
      }

      if (dateKey) {
        const dayStats = current.dayMap.get(dateKey) || {
          hasPresent: false,
          hasLate: false,
        };

        if (status === 'present' || status === 'late') {
          dayStats.hasPresent = true;
        }

        if (status === 'late' || Boolean(record?.is_late)) {
          dayStats.hasLate = true;
        }

        current.dayMap.set(dateKey, dayStats);
      }
    });

    const summary = new Map();

    byEmployee.forEach((data, employeeId) => {
      let totalDays = 0;
      let onTime = 0;
      let late = 0;

      data.dayMap.forEach((dayStats) => {
        if (!dayStats.hasPresent) return;
        totalDays += 1;
        if (dayStats.hasLate) {
          late += 1;
        } else {
          onTime += 1;
        }
      });

      summary.set(employeeId, {
        totalDays,
        totalHours: Number(data.totalHours.toFixed(2)),
        totalOvertime: Number(data.totalOvertimeHours.toFixed(2)),
        onTime,
        late,
        totalLate: Number(data.totalLateHours.toFixed(2)),
      });
    });

    return summary;
  }, [filteredAttendanceRecords]);

  const otRequestActualHoursMap = useMemo(() => {
    const map = new Map();
    for (const req of filteredOvertimeRequests) {
      if (!req.management_signature || req.actual_hours == null) continue;
      const empId = String(req.employee_id);
      const hrs = parseFloat(req.actual_hours) || 0;
      map.set(empId, (map.get(empId) || 0) + hrs);
    }
    return map;
  }, [filteredOvertimeRequests]);

  const otRequestCountMap = useMemo(() => {
    const map = new Map();
    for (const req of filteredOvertimeRequests) {
      if (!req.management_signature) continue;
      const empId = String(req.employee_id);
      const existing = map.get(empId) || { total: 0, withHours: 0 };
      existing.total += 1;
      if (req.actual_hours != null) existing.withHours += 1;
      map.set(empId, existing);
    }
    return map;
  }, [filteredOvertimeRequests]);

  const filteredEmployees = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    let result = employees.filter((employee) => {
      const name = String(employee.name || '').toLowerCase();
      const email = String(employee.email || '').toLowerCase();
      const department = String(employee.department || '').toLowerCase();

      const matchesSearch =
        !search ||
        name.includes(search) ||
        email.includes(search) ||
        department.includes(search);

      const matchesDepartment =
        selectedDepartment === 'All' ||
        normalizeRole(employee.position) === normalizeRole(selectedDepartment);

      const matchesStatus = selectedStatus === 'All' || employee.status === selectedStatus;

      const matchesWageType = selectedWageType === 'All' || employee.wage_type === selectedWageType;

      return matchesSearch && matchesDepartment && matchesStatus && matchesWageType;
    });

    result.sort((a, b) => {
      const nameA = String(a.name || '').toLowerCase();
      const nameB = String(b.name || '').toLowerCase();

      if (selectedSort === 'name-asc') {
        return nameA.localeCompare(nameB);
      }
      if (selectedSort === 'name-desc') {
        return nameB.localeCompare(nameA);
      }
      if (selectedSort === 'overtime-desc') {
        const otA = (otRequestActualHoursMap.get(String(a.id)) || 0) + (employeeAttendanceStats.get(String(a.id))?.totalOvertime || 0);
        const otB = (otRequestActualHoursMap.get(String(b.id)) || 0) + (employeeAttendanceStats.get(String(b.id))?.totalOvertime || 0);
        return otB - otA;
      }
      if (selectedSort === 'late-desc') {
        const lateA = employeeAttendanceStats.get(String(a.id))?.late || 0;
        const lateB = employeeAttendanceStats.get(String(b.id))?.late || 0;
        return lateB - lateA;
      }
      if (selectedSort === 'salary-desc') {
        const salA = Number(a.salary || 0);
        const salB = Number(b.salary || 0);
        return salB - salA;
      }
      if (selectedSort === 'salary-asc') {
        const salA = Number(a.salary || 0);
        const salB = Number(b.salary || 0);
        return salA - salB;
      }
      return 0;
    });

    return result;
  }, [
    employees,
    searchTerm,
    selectedDepartment,
    selectedStatus,
    selectedWageType,
    selectedSort,
    employeeAttendanceStats,
    otRequestActualHoursMap,
  ]);

  return {
    employees,
    attendanceRecords,
    isLoading,
    isAttendanceLoading,
    overtimeRequests,
    filteredEmployees,
    employeeStats,
    employeeAttendanceStats,
    otRequestActualHoursMap,
    otRequestCountMap,
    fetchEmployees
  };
}
