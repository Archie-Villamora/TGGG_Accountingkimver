import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getAccountingEmployees, addAccountingEmployee, updateAccountingEmployee } from '../../../services/adminService';
import { getAllAttendance } from '../../../services/attendanceService';
import { getAllOvertime } from '../../../services/overtimeService';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/accounting-ui';
import { formatDurationFromHours } from '../../../utils/attendanceFormatters';
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  UserCheck,
  UserX,
  Building,
  Briefcase,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';


const roleFilters = ['All', 'Accounting', 'Site Coordinator', 'Site Engineer', 'BIM Specialist', 'Interns', 'Junior Designer', 'Studio Head'];
const statuses = ['All', 'Active', 'On Leave', 'Inactive'];
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

export function EmployeeManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEditingEmployee, setIsEditingEmployee] = useState(false);
  const [isUpdatingEmployee, setIsUpdatingEmployee] = useState(false);
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    startDate: '',
    status: 'Active',
    salary: '',
  });
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);

  const [employees, setEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAttendanceLoading, setIsAttendanceLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [showTemporaryPassword, setShowTemporaryPassword] = useState(false);
  const [overtimeRequests, setOvertimeRequests] = useState([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    startDate: '',
    temporary_password: '',
  });



  const fetchEmployees = async () => {
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
  };

  useEffect(() => {
    fetchEmployees();
  }, [selectedDepartment]);

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

  const handleAddEmployee = async () => {
    const firstName = formData.first_name.trim();
    const lastName = formData.last_name.trim();
    const email = formData.email.trim();
    const temporaryPassword = formData.temporary_password;

    if (!firstName || !lastName || !email) {
      toast.error('Validation Error', {
        description: 'First name, last name, and email are required.',
      });
      return;
    }

    if (!temporaryPassword || temporaryPassword.length < 8) {
      toast.error('Validation Error', {
        description: 'Temporary password is required and must be at least 8 characters.',
      });
      return;
    }

    const confirmed = window.confirm(
      'Confirm employee creation?\n\nThe account will be submitted for Studio Head/Admin approval before login is allowed.'
    );
    if (!confirmed) return;

    setIsAddingEmployee(true);
    try {
      await addAccountingEmployee({
        first_name: firstName,
        last_name: lastName,
        email,
        startDate: formData.startDate,
        temporary_password: temporaryPassword,
      });
      setIsAddEmployeeOpen(false);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        startDate: '',
        temporary_password: '',
      });
      fetchEmployees();
      toast.success('Employee Submitted', {
        description: 'The account is pending Studio Head/Admin approval and a confirmation email has been sent.',
      });
    } catch (error) {
      toast.error('Addition Failed', {
        description: error.response?.data?.error || error.message,
      });
    } finally {
      setIsAddingEmployee(false);
    }
  };

  const handleExportEmployees = async () => {
    setIsExporting(true);
    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ]);

      const allEmployees = await getAccountingEmployees({ active_only: true });
      if (!allEmployees?.length) {
        toast.error('Export Failed', { description: 'No employees available to export.' });
        return;
      }

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const now = new Date();

      doc.setFontSize(16);
      doc.text('Employee Details Report', 14, 14);
      doc.setFontSize(10);
      doc.text(`Generated: ${now.toLocaleString()}`, 14, 20);
      doc.text(`Total Employees: ${allEmployees.length}`, 14, 26);

      autoTable(doc, {
        startY: 32,
        head: [[
          'Name',
          'Email',
          'Phone',
          'Department',
          'Position',
          'Status',
          'Join Date',
          'Salary',
          'Location',
          'Manager',
        ]],
        body: allEmployees.map((employee) => ([
          employee.name || '',
          employee.email || '',
          employee.phone || '',
          employee.department || '',
          employee.position || '',
          employee.status || '',
          employee.joinDate || '',
          employee.salary ? `$${Number(employee.salary).toLocaleString()}` : '',
          employee.location || '',
          employee.manager || '',
        ])),
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [2, 27, 44],
          textColor: [255, 255, 255],
        },
      });

      doc.save(`employees-${now.toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      toast.error('Export Failed', {
        description: error.response?.data?.error || error.message,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const openEmployeeDetails = (employee) => {
    setSelectedEmployee(employee);
    setIsEditingEmployee(false);
  };

  const startEditEmployee = () => {
    if (!selectedEmployee) return;
    const parts = String(selectedEmployee.name || '').trim().split(/\s+/).filter(Boolean);
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ');
    setEditFormData({
      first_name: firstName,
      last_name: lastName,
      email: selectedEmployee.email || '',
      startDate: selectedEmployee.joinDate || '',
      status: selectedEmployee.status || 'Active',
      salary: selectedEmployee.salary || '',
    });
    setIsEditingEmployee(true);
  };

  const closeEmployeeDialog = () => {
    setSelectedEmployee(null);
    setIsEditingEmployee(false);
  };

  const handleUpdateEmployee = async () => {
    if (!selectedEmployee) return;

    const firstName = editFormData.first_name.trim();
    const lastName = editFormData.last_name.trim();
    const email = editFormData.email.trim();

    if (!firstName || !lastName || !email) {
      toast.error('Validation Error', {
        description: 'First name, last name, and email are required.',
      });
      return;
    }

    setIsUpdatingEmployee(true);
    try {
      await updateAccountingEmployee(selectedEmployee.id, {
        first_name: firstName,
        last_name: lastName,
        email,
        startDate: editFormData.startDate || null,
        status: editFormData.status,
        salary: editFormData.salary || null,
      });

      toast.success('Employee Updated', { description: 'Employee updated successfully.' });
      setIsEditingEmployee(false);
      closeEmployeeDialog();
      fetchEmployees();
    } catch (error) {
      toast.error('Update Failed', {
        description: error.response?.data?.error || error.message,
      });
    } finally {
      setIsUpdatingEmployee(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return employees.filter((employee) => {
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

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [employees, searchTerm, selectedDepartment, selectedStatus]);

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

    attendanceRecords.forEach((record) => {
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
  }, [attendanceRecords]);

  // Build per-employee sum of actual_hours from approved OT requests logged by accounting
  const otRequestActualHoursMap = useMemo(() => {
    const map = new Map();
    for (const req of overtimeRequests) {
      if (!req.management_signature || req.actual_hours == null) continue;
      const empId = String(req.employee_id);
      const hrs = parseFloat(req.actual_hours) || 0;
      map.set(empId, (map.get(empId) || 0) + hrs);
    }
    return map;
  }, [overtimeRequests]);

  // Count of approved OT requests per employee (with and without actual hours entered)
  const otRequestCountMap = useMemo(() => {
    const map = new Map();
    for (const req of overtimeRequests) {
      if (!req.management_signature) continue;
      const empId = String(req.employee_id);
      const existing = map.get(empId) || { total: 0, withHours: 0 };
      existing.total += 1;
      if (req.actual_hours != null) existing.withHours += 1;
      map.set(empId, existing);
    }
    return map;
  }, [overtimeRequests]);

  const getStatusBadge = (status) => {
    const variants = {
      'Active': 'bg-primary/10 text-primary border-primary',
      'On Leave': 'bg-primary/10 text-primary border-primary',
      'Inactive': 'bg-red-500/10 text-red-500 border-red-500',
    };

    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="rounded-2xl border border-white/10 bg-[#001f35]/70 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
        <div className="p-6 sm:p-8 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#FF7120]/80">Accounting Department</p>
            <h1 className="mt-3 text-3xl sm:text-4xl font-semibold text-white">Employee Management</h1>
            <p className="mt-3 text-sm text-white/60 max-w-2xl">
              Manage employee profiles, join dates, role assignments, and salary details.
            </p>
          </div>
          <div className="flex flex-row items-center gap-3 shrink-0">
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleExportEmployees}
              disabled={isExporting}
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Exporting...' : 'Export PDF'}
            </Button>
            <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-[#FF7120] hover:bg-[#FF7120]/90 text-white border-0">
                  <Plus className="w-4 h-4" />
                  Add Employee
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#001f35] border-white/10 text-white">
                <DialogHeader>
                  <DialogTitle className="text-white">Add New Employee</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-white/80">First Name</Label>
                    <Input id="firstName" className="bg-[#00273C] border-white/10 text-white" value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} placeholder="Enter first name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-white/80">Last Name</Label>
                    <Input id="lastName" className="bg-[#00273C] border-white/10 text-white" value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} placeholder="Enter last name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/80">Email</Label>
                    <Input id="email" className="bg-[#00273C] border-white/10 text-white" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="Enter email address" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-white/80">Start Date</Label>
                    <Input id="startDate" className="bg-[#00273C] border-white/10 text-white" type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="temporaryPassword" className="text-white/80">Temporary Password</Label>
                    <div className="relative">
                      <Input
                        id="temporaryPassword"
                        className="bg-[#00273C] border-white/10 text-white pr-10"
                        type={showTemporaryPassword ? 'text' : 'password'}
                        value={formData.temporary_password}
                        onChange={e => setFormData({ ...formData, temporary_password: e.target.value })}
                        placeholder="Set a temporary password (min. 8 characters)"
                      />
                      <button
                        type="button"
                        onClick={() => setShowTemporaryPassword(prev => !prev)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                        aria-label={showTemporaryPassword ? 'Hide temporary password' : 'Show temporary password'}
                      >
                        {showTemporaryPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" className="border-white/10 hover:bg-white/10 text-white" onClick={() => setIsAddEmployeeOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddEmployee} disabled={isAddingEmployee} className="bg-[#FF7120] hover:bg-[#FF7120]/90 text-white border-0">
                    {isAddingEmployee ? 'Adding...' : 'Add Employee'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Employees */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#001f35]/70 backdrop-blur-md shadow-lg p-6 transition-all duration-300 hover:scale-[1.02] hover:border-[#FF7120]/30 hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)] group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60 font-medium">Total Employees</p>
              <p className="text-2xl font-bold mt-2 text-white">{employeeStats.total}</p>
            </div>
            <Users className="w-8 h-8 text-[#FF7120] transition-transform duration-300 group-hover:scale-110" />
          </div>
        </div>

        {/* Active */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#001f35]/70 backdrop-blur-md shadow-lg p-6 transition-all duration-300 hover:scale-[1.02] hover:border-[#FF7120]/30 hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)] group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60 font-medium">Active</p>
              <p className="text-2xl font-bold mt-2 text-white">{employeeStats.active}</p>
            </div>
            <UserCheck className="w-8 h-8 text-[#FF7120] transition-transform duration-300 group-hover:scale-110" />
          </div>
        </div>

        {/* On Leave */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#001f35]/70 backdrop-blur-md shadow-lg p-6 transition-all duration-300 hover:scale-[1.02] hover:border-[#FF7120]/30 hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)] group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60 font-medium">On Leave</p>
              <p className="text-2xl font-bold mt-2 text-white">{employeeStats.onLeave}</p>
            </div>
            <UserX className="w-8 h-8 text-[#FF7120] transition-transform duration-300 group-hover:scale-110" />
          </div>
        </div>

        {/* Roles */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#001f35]/70 backdrop-blur-md shadow-lg p-6 transition-all duration-300 hover:scale-[1.02] hover:border-[#FF7120]/30 hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)] group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60 font-medium">Roles</p>
              <p className="text-2xl font-bold mt-2 text-white">{roleFilters.length - 1}</p>
            </div>
            <Building className="w-8 h-8 text-[#FF7120] transition-transform duration-300 group-hover:scale-110" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.22)] bg-[#001f35]/70 backdrop-blur-md rounded-2xl">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#00273C] border-white/10 text-white placeholder:text-white/40"
              />
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-full sm:w-48 bg-[#00273C] border-white/10 text-white">
                <SelectValue>
                  {selectedDepartment === 'All' ? 'All Roles' : selectedDepartment}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-[#001f35] border-white/10 text-white">
                {roleFilters.map(dept => (
                  <SelectItem key={dept} value={dept} className="text-white hover:bg-[#00273C]">{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-48 bg-[#00273C] border-white/10 text-white">
                <SelectValue>
                  {selectedStatus === 'All' ? 'All Statuses' : selectedStatus}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-[#001f35] border-white/10 text-white">
                {statuses.map(status => (
                  <SelectItem key={status} value={status} className="text-white hover:bg-[#00273C]">{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Employee Cards */}
      <div className="max-h-[calc(100vh-270px)] overflow-y-auto pr-1">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredEmployees.map((employee) => {
          const attendanceMetrics = employeeAttendanceStats.get(String(employee.id)) || {
            totalDays: 0,
            totalHours: 0,
            totalOvertime: 0,
            onTime: 0,
            late: 0,
            totalLate: 0,
          };

          return (
          <Card key={employee.id} className="border border-white/10 shadow-md bg-[#021B2C] hover:shadow-lg transition-shadow cursor-pointer flex flex-col rounded-2xl" onClick={() => openEmployeeDetails(employee)}>
            <CardContent className="p-3 flex flex-col h-full gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <Avatar className="w-11 h-11 shrink-0">
                    <AvatarImage src={employee.avatar} alt={employee.name} />
                    <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-sm truncate text-white">{employee.name || '---'}</h3>
                    <p className="text-[11px] text-white/60 truncate">{employee.position || '---'}</p>
                  </div>
                </div>
                <div className="shrink-0">
                  {getStatusBadge(employee.status)}
                </div>
              </div>

              <div className="w-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-2.5 border border-green-200/30">
                <p className="text-[10px] text-white/60">Monthly Salary</p>
                <p className="text-lg font-semibold tracking-tight text-green-400 truncate">
                  {employee.salary ? `₱${Number(employee.salary).toLocaleString('en-PH')}` : '---'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 auto-rows-fr">
                <div className="bg-[#001f35] rounded-lg px-2.5 py-2 h-16">
                  <p className="text-[10px] text-white/60">Total Days</p>
                  <p className="mt-1 text-lg font-semibold tracking-tight leading-none text-[#FF6B00] truncate">{isAttendanceLoading ? '...' : attendanceMetrics.totalDays}</p>
                </div>
                <div className="bg-[#001f35] rounded-lg px-2.5 py-2 h-16">
                  <p className="text-[10px] text-white/60">Total Hours</p>
                  <p className="mt-1 text-lg font-semibold tracking-tight leading-none text-[#FF6B00] truncate" title={isAttendanceLoading ? '...' : formatDurationFromHours(attendanceMetrics.totalHours)}>{isAttendanceLoading ? '...' : formatDurationFromHours(attendanceMetrics.totalHours)}</p>
                </div>
                <div className="bg-[#001f35] rounded-lg px-2.5 py-2 h-16">
                  <p className="text-[10px] text-white/60">On-Time</p>
                  <p className="mt-1 text-lg font-semibold tracking-tight leading-none text-[#FF6B00] truncate">{isAttendanceLoading ? '...' : attendanceMetrics.onTime}</p>
                </div>
                <div className="bg-[#001f35] rounded-lg px-2.5 py-2 h-16">
                  <p className="text-[10px] text-white/60">Late</p>
                  <p className="mt-1 text-lg font-semibold tracking-tight leading-none text-[#FF6B00] truncate">{isAttendanceLoading ? '...' : attendanceMetrics.late}</p>
                </div>
                <div className="bg-[#001f35] rounded-lg px-2.5 py-2 h-16">
                  <p className="text-[10px] text-white/60">Total Late</p>
                  <p className="mt-1 text-lg font-semibold tracking-tight leading-none text-[#FF6B00] truncate" title={isAttendanceLoading ? '...' : formatDurationFromHours(attendanceMetrics.totalLate)}>{isAttendanceLoading ? '...' : formatDurationFromHours(attendanceMetrics.totalLate)}</p>
                </div>
                <div className="bg-[#001f35] rounded-lg px-2.5 py-2 h-16">
                  <p className="text-[10px] text-white/60">Total Overtime</p>
                  {(() => {
                    const otFromRequests = otRequestActualHoursMap.get(String(employee.id)) || 0;
                    const otFromAttendance = attendanceMetrics.totalOvertime || 0;
                    const combined = otFromRequests + otFromAttendance;
                    const display = combined > 0
                      ? formatDurationFromHours(combined)
                      : formatDurationFromHours(otFromAttendance);
                    return (
                      <p
                        className="mt-1 text-lg font-semibold tracking-tight leading-none text-[#FF6B00] truncate"
                        title={isAttendanceLoading ? '...' : display}
                      >
                        {isAttendanceLoading ? '...' : display}
                      </p>
                    );
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>
        );
        })}
      </div>
      </div>

      {/* Employee Detail Dialog */}
      <Dialog open={!!selectedEmployee} onOpenChange={() => closeEmployeeDialog()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#001f35] border-white/10 text-white">
          {selectedEmployee && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16 border border-white/10">
                    <AvatarImage src={selectedEmployee.avatar} alt={selectedEmployee.name} />
                    <AvatarFallback>{selectedEmployee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-white">{selectedEmployee.name || '---'}</DialogTitle>
                    <p className="text-white/60 text-sm mt-0.5">{selectedEmployee.position || '---'}</p>
                    <div className="mt-2">
                      {getStatusBadge(selectedEmployee.status)}
                    </div>
                  </div>
                </div>
              </DialogHeader>
              {!isEditingEmployee ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-white/80 mb-2">Contact Information</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-white/70">
                          <Mail className="w-4 h-4 text-[#FF7120]/80" />
                          {selectedEmployee.email || '---'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/70">
                          <MapPin className="w-4 h-4 text-[#FF7120]/80" />
                          {selectedEmployee.location || '---'}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white/80 mb-2">Employment Details</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-white/70">
                          <Building className="w-4 h-4 text-[#FF7120]/80" />
                          {selectedEmployee.department || '---'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/70">
                          <Briefcase className="w-4 h-4 text-[#FF7120]/80" />
                          {selectedEmployee.position || '---'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/70">
                          <Calendar className="w-4 h-4 text-[#FF7120]/80" />
                          Joined {selectedEmployee.joinDate ? new Date(selectedEmployee.joinDate).toLocaleDateString() : '---'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-white/80 mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedEmployee.skills && selectedEmployee.skills.length > 0 ? selectedEmployee.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="bg-[#00273C] border-white/10 text-white/80">{skill}</Badge>
                        )) : <span className="text-sm text-white/60">---</span>}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white/80 mb-2">Manager</h4>
                      <p className="text-sm text-white/70">{selectedEmployee.manager || '---'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white/80 mb-2">Salary</h4>
                      <p className="text-sm font-semibold text-green-400">{selectedEmployee.salary ? `₱${Number(selectedEmployee.salary).toLocaleString('en-PH')}` : '---'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="editFirstName" className="text-white/80">First Name</Label>
                    <Input
                      id="editFirstName"
                      className="bg-[#00273C] border-white/10 text-white"
                      value={editFormData.first_name}
                      onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editLastName" className="text-white/80">Last Name</Label>
                    <Input
                      id="editLastName"
                      className="bg-[#00273C] border-white/10 text-white"
                      value={editFormData.last_name}
                      onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="editEmail" className="text-white/80">Email</Label>
                    <Input
                      id="editEmail"
                      type="email"
                      className="bg-[#00273C] border-white/10 text-white"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editStartDate" className="text-white/80">Start Date</Label>
                    <Input
                      id="editStartDate"
                      type="date"
                      className="bg-[#00273C] border-white/10 text-white"
                      value={editFormData.startDate}
                      onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="editStatus" className="text-white/80">Status</Label>
                    <Select
                      value={editFormData.status}
                      onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}
                    >
                      <SelectTrigger id="editStatus" className="bg-[#00273C] border-white/10 text-white">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#001f35] border-white/10 text-white">
                        <SelectItem value="Active" className="text-white hover:bg-[#00273C]">Active</SelectItem>
                        <SelectItem value="Inactive" className="text-white hover:bg-[#00273C]">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="editSalary" className="text-white/80">Monthly Salary (₱)</Label>
                    <Input
                      id="editSalary"
                      type="number"
                      className="bg-[#00273C] border-white/10 text-white"
                      value={editFormData.salary}
                      onChange={(e) => setEditFormData({ ...editFormData, salary: e.target.value })}
                      placeholder="Enter monthly salary"
                      min="0"
                      step="100"
                    />
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" className="border-white/10 hover:bg-white/10 text-white" onClick={() => (isEditingEmployee ? setIsEditingEmployee(false) : closeEmployeeDialog())}>
                  {isEditingEmployee ? 'Cancel' : 'Close'}
                </Button>
                {!isEditingEmployee ? (
                  <Button onClick={startEditEmployee} className="bg-[#FF7120] hover:bg-[#FF7120]/90 text-white border-0">Edit Employee</Button>
                ) : (
                  <Button onClick={handleUpdateEmployee} disabled={isUpdatingEmployee} className="bg-[#FF7120] hover:bg-[#FF7120]/90 text-white border-0">
                    {isUpdatingEmployee ? 'Saving...' : 'Save Changes'}
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
