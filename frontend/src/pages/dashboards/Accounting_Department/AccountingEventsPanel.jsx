import { useEffect, useState } from 'react';
import { getEvents, createEvent } from '../../../services/attendanceService';
import { CalendarDays, Plus, AlertCircle, Info, Home } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Textarea,
  Switch,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/accounting-ui';
import { ImageWithFallback } from '../../../components/figma/ImageWithFallback';

export default function AccountingEventsPanel() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    date: '',
    event_type: 'event',
    is_holiday: false,
    description: '',
  });
  const [error, setError] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getEvents({ upcoming: true });
      setEvents(data || []);
    } catch {
      setError('Unable to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date) {
      setError('Title and date are required');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await createEvent(form);
      setForm({
        title: '',
        date: '',
        event_type: 'event',
        is_holiday: false,
        description: '',
      });
      fetchEvents();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to save event';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const upcomingCount = events.length;

  return (
    <div className="space-y-6">
      {/* Welcome Section / Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-card via-secondary to-muted p-6 text-primary-foreground" style={{ boxShadow: '0 8px 32px #001F35' }}>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays className="w-6 h-6" />
            <h1 className="text-2xl font-semibold">Calendar & Events</h1>
          </div>
          <p className="text-primary-foreground/80 mb-4">Manage company dates, holidays, and important schedules for the entire organization.</p>
          <div className="flex flex-wrap gap-4">
            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary">
              <Info className="w-4 h-4 mr-2" />
              {upcomingCount} Upcoming Events
            </Badge>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-32 opacity-20">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWxlbmRhciUyMGRlc2slMjBvZmZpY2V8ZW58MXx8fHwxNzU4NzY4MDI1fDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Calendar background"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Creation Form */}
        <Card className="lg:col-span-1 border-0 shadow-lg bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Plus className="w-5 h-5 text-primary" />
              Add New Event
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-white">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-white/80 text-sm">Event Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Company Outing"
                  required
                  className="bg-white/5 border-white/10"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-white/80 text-sm">Date</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                  className="bg-white/5 border-white/10"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-white/80 text-sm">Type</Label>
                <Select
                  value={form.event_type}
                  onValueChange={(val) => setForm({ ...form, event_type: val })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#002035] border-white/10">
                    <SelectItem value="event" className="text-white hover:bg-white/5">Event</SelectItem>
                    <SelectItem value="holiday" className="text-white hover:bg-white/5">Holiday</SelectItem>
                    <SelectItem value="downtime" className="text-white hover:bg-white/5">No Work Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Switch
                  id="is_holiday"
                  checked={form.is_holiday || form.event_type === 'holiday' || form.event_type === 'downtime'}
                  onCheckedChange={(checked) => setForm({ ...form, is_holiday: checked })}
                />
                <Label htmlFor="is_holiday" className="text-white/80 text-sm cursor-pointer">Mark as Holiday / No Work</Label>
              </div>

              <div className="space-y-1.5">
                <Label className="text-white/80 text-sm">Description (Optional)</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Additional details..."
                  rows={3}
                  className="bg-white/5 border-white/10"
                />
              </div>

              <Button type="submit" disabled={saving} className="w-full bg-[#FF7120] hover:bg-[#FF7120]/90 text-white">
                {saving ? 'Saving...' : 'Create Scheduled Event'}
              </Button>

              {error && (
                <div className="flex items-center gap-2 text-sm text-rose-300 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Existing Events List */}
        <Card className="lg:col-span-2 border-0 shadow-lg bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <CalendarDays className="w-5 h-5 text-primary" />
              Upcoming Events & Holidays
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading && (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                <p className="text-sm text-white/60 font-medium">Loading events...</p>
              </div>
            )}
            
            {!loading && events.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                  <CalendarDays className="w-6 h-6 text-white/20" />
                </div>
                <p className="text-sm text-white/60 font-medium">No events scheduled.</p>
                <p className="text-xs text-white/40 mt-1">Start by adding a new event in the sidebar.</p>
              </div>
            )}

            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="flex items-start gap-4 p-4 rounded-xl border border-white/10 transition-all hover:bg-white/5 group">
                  <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-primary/10 font-bold text-primary group-hover:scale-105 transition-transform shrink-0 border border-primary/20">
                    <span className="text-base leading-none">{new Date(event.date).getDate()}</span>
                    <span className="text-[10px] uppercase tracking-wider mt-0.5 opacity-70">
                      {new Date(event.date).toLocaleString('default', { month: 'short' })}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-white truncate">{event.title}</p>
                      <Badge
                        variant="outline"
                        className={
                          event.event_type === 'holiday' || event.is_holiday ? 'border-rose-400/30 text-rose-400 bg-rose-400/5' :
                            'border-primary/30 text-primary bg-primary/5'
                        }
                      >
                        {event.event_type || (event.is_holiday ? 'holiday' : 'event')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm text-white/50 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5" />
                        {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    {event.description && (
                      <p className="mt-2 text-sm text-white/60 bg-white/5 p-2 rounded-lg border border-white/5 leading-relaxed italic">
                        "{event.description}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}