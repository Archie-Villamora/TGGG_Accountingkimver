import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Switch } from './ui/switch';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from './ui/sidebar';
import alviProfile from '@/assets/4db478d5344f83406043f453643082ef14ec3b86.png';
import tripleGLogo from '@/assets/18705286721879dd5e9e4c3fe85f4aede934da35.png';
import { 
  Home, 
  Users, 
  Clock, 
  DollarSign, 
  UserPlus, 
  TrendingUp, 
  Settings, 
  MessageCircle,
  Award,
  Calendar,
  FileText,
  ChevronRight,
  Bell,
  Search,
  Menu,
  Moon,
  Sun,
  Plus,
  Filter,
  BarChart3,
  CheckCircle,
  AlertCircle,
  UserCheck,
  Zap
} from 'lucide-react';

interface DashboardLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  children: React.ReactNode;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'employees', label: 'Employees', icon: Users },
  { id: 'attendance', label: 'Attendance', icon: Clock },
  { id: 'payroll', label: 'Payroll', icon: DollarSign },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function DashboardLayout({ activeTab, setActiveTab, isDarkMode, toggleDarkMode, children }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 flex w-full">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden lg:flex border-r border-border/50 backdrop-blur-xl bg-background/80">
          <SidebarHeader className="p-6 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                <img src={tripleGLogo} alt="Triple G" className="w-full h-full object-contain" />
              </div>
              <div>
                <h2 className="font-medium">Triple G</h2>
                <p className="text-xs text-muted-foreground">Accounting Management</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-4">
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full justify-start gap-3 transition-all duration-200 ${
                        isActive 
                          ? 'bg-gradient-to-r from-primary/10 to-chart-1/10 text-primary border-l-2 border-primary' 
                          : 'hover:bg-accent/50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={isActive ? 'font-medium' : ''}>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b border-border/50 backdrop-blur-xl bg-background/80 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Mobile Menu Trigger */}
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-72 p-0">
                    <div className="p-6 border-b border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={tripleGLogo} alt="Triple G" className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <h2 className="font-medium">Triple G</h2>
                          <p className="text-xs text-muted-foreground">Accounting Flow</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <nav className="space-y-2">
                        {menuItems.map((item) => {
                          const Icon = item.icon;
                          const isActive = activeTab === item.id;
                          return (
                            <Button
                              key={item.id}
                              variant={isActive ? "secondary" : "ghost"}
                              className="w-full justify-start gap-3"
                              onClick={() => {
                                setActiveTab(item.id);
                                setIsMobileMenuOpen(false);
                              }}
                            >
                              <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                              {item.label}
                            </Button>
                          );
                        })}
                      </nav>
                    </div>
                  </SheetContent>
                </Sheet>

                <SidebarTrigger className="hidden lg:flex" />
                
                <div className="hidden sm:flex items-center gap-2">
                  <h1 className="text-xl font-medium capitalize">{activeTab.replace('-', ' ')}</h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="hidden md:flex items-center gap-2 bg-accent/50 rounded-lg px-3 py-2 min-w-64">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="Search employees, tasks..." 
                    className="bg-transparent border-none outline-none text-sm flex-1"
                  />
                </div>

                {/* Dark Mode Toggle */}
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4" />
                  <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
                  <Moon className="w-4 h-4" />
                </div>

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></div>
                </Button>

                {/* User Avatar */}
                <Avatar className="cursor-pointer ring-2 ring-primary/20">
                  <AvatarImage src={alviProfile} />
                  <AvatarFallback>AL</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}