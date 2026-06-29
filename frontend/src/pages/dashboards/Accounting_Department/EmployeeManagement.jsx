import React, { useState } from 'react';
import { toast } from 'sonner';
import { getAccountingEmployees } from '../../../services/adminService';
import {
  Card,
  CardContent,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
} from '../../../components/ui/accounting-ui';
import { Search, Download, Filter, SlidersHorizontal, X, RotateCcw } from 'lucide-react';

import { useEmployees, getBiMonthlyCutoffs } from '../../../hooks/useEmployees';
import { EmployeeStats } from './components/EmployeeStats';
import { EmployeeGrid } from './components/EmployeeGrid';
import { EmployeeAddDialog } from './components/EmployeeAddDialog';
import { EmployeeDetailsDialog } from './components/EmployeeDetailsDialog';

const roleFilters = ['All', 'Accounting', 'Site Coordinator', 'Site Engineer', 'BIM Specialist', 'Interns', 'Junior Designer', 'Studio Head'];
const statuses = ['All', 'Active', 'On Leave', 'Inactive'];

export function EmployeeManagement() {
  const today = new Date();
  const day = today.getDate();
  const defaultPeriod = (day >= 14 && day <= 28) ? 'cutoff-14-28' : 'cutoff-29-13';
  const { cutoff14_28, cutoff29_13 } = getBiMonthlyCutoffs(today);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPeriod, setSelectedPeriod] = useState(defaultPeriod);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedWageType, setSelectedWageType] = useState('All');
  const [selectedSort, setSelectedSort] = useState('name-asc');
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const {
    employees,
    filteredEmployees,
    employeeStats,
    employeeAttendanceStats,
    otRequestActualHoursMap,
    isAttendanceLoading,
    fetchEmployees
  } = useEmployees({
    selectedDepartment,
    selectedStatus,
    searchTerm,
    selectedPeriod,
    customStartDate,
    customEndDate,
    selectedWageType,
    selectedSort,
  });

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('All');
    setSelectedStatus('All');
    setSelectedPeriod(defaultPeriod);
    setCustomStartDate('');
    setCustomEndDate('');
    setSelectedWageType('All');
    setSelectedSort('name-asc');
  };

  const activeFilters = [];
  if (selectedDepartment !== 'All') {
    activeFilters.push({
      id: 'department',
      label: `Role: ${selectedDepartment}`,
      onRemove: () => setSelectedDepartment('All'),
    });
  }
  if (selectedStatus !== 'All') {
    activeFilters.push({
      id: 'status',
      label: `Status: ${selectedStatus}`,
      onRemove: () => setSelectedStatus('All'),
    });
  }
  if (selectedPeriod !== defaultPeriod) {
    let periodLabel = selectedPeriod;
    if (selectedPeriod === 'cutoff-14-28') periodLabel = cutoff14_28.label;
    if (selectedPeriod === 'cutoff-29-13') periodLabel = cutoff29_13.label;
    activeFilters.push({
      id: 'period',
      label: `Period: ${periodLabel}`,
      onRemove: () => {
        setSelectedPeriod(defaultPeriod);
        setCustomStartDate('');
        setCustomEndDate('');
      },
    });
  } else if (selectedPeriod === 'Custom Range' && (customStartDate || customEndDate)) {
    activeFilters.push({
      id: 'custom-date',
      label: `Dates: ${customStartDate || '...'} to ${customEndDate || '...'}`,
      onRemove: () => {
        setCustomStartDate('');
        setCustomEndDate('');
      },
    });
  }
  if (selectedWageType !== 'All') {
    activeFilters.push({
      id: 'wageType',
      label: `Wage: ${selectedWageType === 'daily' ? 'Daily Rate' : 'Monthly Salary'}`,
      onRemove: () => setSelectedWageType('All'),
    });
  }
  if (selectedSort !== 'name-asc') {
    let sortLabel = 'Sort: Name (A-Z)';
    if (selectedSort === 'name-desc') sortLabel = 'Sort: Name (Z-A)';
    if (selectedSort === 'overtime-desc') sortLabel = 'Sort: Most Overtime';
    if (selectedSort === 'late-desc') sortLabel = 'Sort: Most Late';
    if (selectedSort === 'salary-desc') sortLabel = 'Sort: Salary (High-Low)';
    if (selectedSort === 'salary-asc') sortLabel = 'Sort: Salary (Low-High)';
    activeFilters.push({
      id: 'sort',
      label: sortLabel,
      onRemove: () => setSelectedSort('name-asc'),
    });
  }

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
            <EmployeeAddDialog 
              isAddEmployeeOpen={isAddEmployeeOpen} 
              setIsAddEmployeeOpen={setIsAddEmployeeOpen} 
              fetchEmployees={fetchEmployees} 
            />
          </div>
        </div>
      </div>

      <EmployeeStats 
        employeeStats={employeeStats} 
        roleFiltersCount={roleFilters.length - 1} 
      />

      {/* Filters and Search */}
      <Card className="border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.22)] bg-[#001f35]/70 backdrop-blur-md rounded-2xl">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            {/* Top row: search & basic filters */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
              <div className="flex items-center gap-2 text-white/80 font-semibold shrink-0">
                <Filter className="w-4 h-4 text-[#FF7120]" />
                <span className="text-xs tracking-wider uppercase">Filters</span>
              </div>
              
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                <Input
                  placeholder="Search by name, email, department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[#00273C] border-white/10 text-white placeholder:text-white/40"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0 w-full lg:w-auto">
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-full sm:w-40 bg-[#00273C] border-white/10 text-white">
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
                  <SelectTrigger className="w-full sm:w-36 bg-[#00273C] border-white/10 text-white">
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

                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-full sm:w-[175px] bg-[#00273C] border-white/10 text-white">
                    <SelectValue>
                      {selectedPeriod === 'cutoff-14-28' && cutoff14_28.label}
                      {selectedPeriod === 'cutoff-29-13' && cutoff29_13.label}
                      {selectedPeriod === 'Custom Range' && 'Custom Range'}
                      {selectedPeriod === 'All Time' && 'All Time'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-[#001f35] border-white/10 text-white">
                    <SelectItem value="cutoff-14-28" className="text-white hover:bg-[#00273C]">{cutoff14_28.label}</SelectItem>
                    <SelectItem value="cutoff-29-13" className="text-white hover:bg-[#00273C]">{cutoff29_13.label}</SelectItem>
                    <SelectItem value="Custom Range" className="text-white hover:bg-[#00273C]">Custom Range</SelectItem>
                    <SelectItem value="All Time" className="text-white hover:bg-[#00273C]">All Time</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => setIsMoreFiltersOpen(!isMoreFiltersOpen)}
                  className={`w-full sm:w-auto gap-2 border-white/10 text-white transition-all ${isMoreFiltersOpen ? 'bg-[#FF7120]/20 hover:bg-[#FF7120]/30 border-[#FF7120]/30' : 'bg-[#00273C] hover:bg-[#00273C]/80'}`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>More</span>
                </Button>
              </div>
            </div>

            {/* Collapsible Panel for More Filters */}
            {isMoreFiltersOpen && (
              <div className="pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/60">Wage Type</label>
                  <Select value={selectedWageType} onValueChange={setSelectedWageType}>
                    <SelectTrigger className="bg-[#00273C] border-white/10 text-white">
                      <SelectValue>
                        {selectedWageType === 'All' ? 'All Wage Types' : selectedWageType === 'daily' ? 'Daily Rate' : 'Monthly Salary'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-[#001f35] border-white/10 text-white">
                      <SelectItem value="All" className="text-white hover:bg-[#00273C]">All Wage Types</SelectItem>
                      <SelectItem value="daily" className="text-white hover:bg-[#00273C]">Daily Rate</SelectItem>
                      <SelectItem value="monthly" className="text-white hover:bg-[#00273C]">Monthly Salary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/60">Sort By</label>
                  <Select value={selectedSort} onValueChange={setSelectedSort}>
                    <SelectTrigger className="bg-[#00273C] border-white/10 text-white">
                      <SelectValue>
                        {selectedSort === 'name-asc' && 'Name (A-Z)'}
                        {selectedSort === 'name-desc' && 'Name (Z-A)'}
                        {selectedSort === 'overtime-desc' && 'Most Overtime'}
                        {selectedSort === 'late-desc' && 'Most Late Occurrences'}
                        {selectedSort === 'salary-desc' && 'Salary (High to Low)'}
                        {selectedSort === 'salary-asc' && 'Salary (Low to High)'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-[#001f35] border-white/10 text-white">
                      <SelectItem value="name-asc" className="text-white hover:bg-[#00273C]">Name (A-Z)</SelectItem>
                      <SelectItem value="name-desc" className="text-white hover:bg-[#00273C]">Name (Z-A)</SelectItem>
                      <SelectItem value="overtime-desc" className="text-white hover:bg-[#00273C]">Most Overtime</SelectItem>
                      <SelectItem value="late-desc" className="text-white hover:bg-[#00273C]">Most Late Occurrences</SelectItem>
                      <SelectItem value="salary-desc" className="text-white hover:bg-[#00273C]">Salary (High to Low)</SelectItem>
                      <SelectItem value="salary-asc" className="text-white hover:bg-[#00273C]">Salary (Low to High)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedPeriod === 'Custom Range' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-white/60">Custom Date Range</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="bg-[#00273C] border-white/10 text-white text-sm"
                      />
                      <Input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="bg-[#00273C] border-white/10 text-white text-sm"
                        min={customStartDate}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bottom row: active chips & results count */}
            <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {activeFilters.length > 0 && (
                  <>
                    <span className="text-xs text-white/50 font-medium">Active Filters:</span>
                    {activeFilters.map((filter) => (
                      <Badge
                        key={filter.id}
                        variant="secondary"
                        className="bg-[#00273C] border border-white/10 text-white/90 hover:bg-[#00273C]/80 pr-1.5 pl-2.5 py-0.5 gap-1.5 flex items-center text-xs rounded-full"
                      >
                        <span>{filter.label}</span>
                        <button
                          onClick={filter.onRemove}
                          className="rounded-full p-0.5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                    <Button
                      variant="ghost"
                      onClick={handleResetFilters}
                      className="h-7 text-xs text-[#FF7120] hover:text-[#FF7120]/80 hover:bg-[#FF7120]/10 px-2 rounded-lg gap-1.5 font-semibold"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset All</span>
                    </Button>
                  </>
                )}
              </div>

              <div className="text-xs text-white/50 font-medium sm:ml-auto">
                Showing {filteredEmployees.length} of {employees.length} employees
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <EmployeeGrid 
        filteredEmployees={filteredEmployees}
        employeeAttendanceStats={employeeAttendanceStats}
        otRequestActualHoursMap={otRequestActualHoursMap}
        isAttendanceLoading={isAttendanceLoading}
        openEmployeeDetails={openEmployeeDetails}
      />

      <EmployeeDetailsDialog 
        selectedEmployee={selectedEmployee} 
        setSelectedEmployee={setSelectedEmployee} 
        fetchEmployees={fetchEmployees}
      />
    </div>
  );
}

export default EmployeeManagement;
