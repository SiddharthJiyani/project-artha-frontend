"use client"

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, MoreHorizontal, Clock, DollarSign, FileText, Zap, TrendingUp, Settings, Bell, Filter } from "lucide-react";
import { useState, useMemo } from "react";

type CalendarEvent = {
    id: string;
    date: Date;
    title: string;
    type: 'payment' | 'investment' | 'filing' | 'custom';
    time?: string;
    amount?: string;
    priority?: 'low' | 'medium' | 'high';
};

const initialEvents: CalendarEvent[] = [
    { id: '1', date: new Date(new Date().setDate(new Date().getDate() + 3)), title: 'Credit Card Payment Due', type: 'payment', time: '09:00', amount: '$2,450', priority: 'high' },
    { id: '2', date: new Date(new Date().setDate(new Date().getDate() + 5)), title: 'SIP Investment - NIFTY 50', type: 'investment', time: '14:30', amount: '$500', priority: 'medium' },
    { id: '3', date: new Date(new Date().getFullYear(), new Date().getMonth(), 15), title: 'Quarterly Tax Filing', type: 'filing', time: '11:00', priority: 'high' },
    { id: '4', date: new Date(), title: 'Portfolio Review', type: 'custom', time: '16:00', priority: 'low' },
];

const eventTypeStyles = {
    payment: {
        bg: 'bg-destructive/10 dark:bg-destructive/20',
        border: 'border-l-destructive',
        text: 'text-destructive',
        dot: 'bg-destructive',
        icon: DollarSign,
        gradient: 'bg-destructive'
    },
    investment: {
        bg: 'bg-success/10 dark:bg-success/20', 
        border: 'border-l-success',
        text: 'text-success',
        dot: 'bg-success',
        icon: TrendingUp,
        gradient: 'bg-success'
    },
    filing: {
        bg: 'bg-primary/10 dark:bg-primary/20',
        border: 'border-l-primary',
        text: 'text-primary',
        dot: 'bg-primary',
        icon: FileText,
        gradient: 'bg-primary'
    },
    custom: {
        bg: 'bg-accent/10 dark:bg-accent/20',
        border: 'border-l-accent',
        text: 'text-accent-foreground',
        dot: 'bg-accent',
        icon: CalendarIcon as any,
        gradient: 'bg-accent'
    },
};

const priorityStyles = {
    high: 'ring-2 ring-destructive/20',
    medium: 'ring-2 ring-warning/20',
    low: 'ring-2 ring-muted/20'
};

export default function ModernFinancialCalendar() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
    const [isAddEventDialogOpen, setAddEventDialogOpen] = useState(false);

    const selectedDayEvents = useMemo(() => {
        if (!date) return [];
        return events
            .filter(event => format(event.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
            .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    }, [date, events]);

    const currentMonth = date ? format(date, 'MMMM yyyy') : format(new Date(), 'MMMM yyyy');
    const today = new Date();

    const navigateMonth = (direction: 'prev' | 'next') => {
        const currentDate = date || new Date();
        const newDate = new Date(currentDate);
        if (direction === 'prev') {
            newDate.setMonth(newDate.getMonth() - 1);
        } else {
            newDate.setMonth(newDate.getMonth() + 1);
        }
        setDate(newDate);
    };

    const handleAddEvent = (title: string, type: CalendarEvent['type'], time: string, amount: string, priority: CalendarEvent['priority']) => {
        if (title && date) {
            const newEvent: CalendarEvent = {
                id: Date.now().toString(),
                date: date,
                title: title,
                type: type || 'custom',
                time: time || undefined,
                amount: amount || undefined,
                priority: priority || 'medium',
            };
            setEvents(prev => [...prev, newEvent]);
            setAddEventDialogOpen(false);
        }
    };
    
    return (
        <div className="p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Enhanced Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-3">
                         <h1 className="text-3xl font-bold font-headline">
                            Financial Calendar
                        </h1>
                        <p className="text-muted-foreground text-lg mt-1">
                            Stay ahead of your financial commitments
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="bg-elevated">
                            <Filter className="mr-2 h-4 w-4" />
                            Filter
                        </Button>
                        <Dialog open={isAddEventDialogOpen} onOpenChange={setAddEventDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                                    <Plus className="mr-2 h-4 w-4" /> Add Event
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md bg-background/80 backdrop-blur-xl">
                                <DialogHeader className="pb-4">
                                    <DialogTitle className="text-xl">
                                        Add New Event
                                    </DialogTitle>
                                    <DialogDescription className="text-muted-foreground">
                                        Schedule a new financial event for {date ? format(date, 'EEEE, MMMM do') : ''}.
                                    </DialogDescription>
                                </DialogHeader>
                                <AddEventForm onSubmit={handleAddEvent} />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Enhanced Main Calendar Card */}
                <Card className="shadow-2xl border-0 bg-card backdrop-blur-xl overflow-hidden">
                    <CardContent className="p-0">
                        <div className="grid lg:grid-cols-[450px_1fr]">
                            {/* Enhanced Calendar Section */}
                            <div className="p-8 border-r border-border">
                                {/* Calendar Header */}
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-3xl font-bold">
                                        {currentMonth}
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => navigateMonth('prev')}
                                            className="h-10 w-10 p-0 hover:bg-muted rounded-xl transition-all duration-200 hover:shadow-lg"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => setDate(new Date())}
                                            className="px-4 h-10 text-sm hover:bg-muted rounded-xl transition-all duration-200 hover:shadow-lg font-medium"
                                        >
                                            Today
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => navigateMonth('next')}
                                            className="h-10 w-10 p-0 hover:bg-muted rounded-xl transition-all duration-200 hover:shadow-lg"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>

                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    className="rounded-2xl"
                                    classNames={{
                                        months: "space-y-6",
                                        month: "space-y-6",
                                        caption: "flex justify-center pt-1 relative items-center hidden",
                                        table: "w-full border-collapse space-y-2",
                                        head_row: "flex mb-4",
                                        head_cell: "text-muted-foreground rounded-xl w-12 font-semibold text-sm flex items-center justify-center",
                                        row: "flex w-full mt-3",
                                        cell: "relative p-0.5 text-center text-sm focus-within:relative focus-within:z-20",
                                        day: "h-12 w-12 p-0 font-medium text-foreground hover:bg-muted rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105",
                                        day_selected: "bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg",
                                        day_today: "bg-muted text-foreground font-bold rounded-xl ring-2 ring-primary/30",
                                        day_outside: "text-muted-foreground opacity-40",
                                        day_disabled: "text-muted-foreground opacity-30",
                                    }}
                                    components={{
                                        DayContent: ({ date: dayDate }) => {
                                            const dayEvents = events.filter(e => format(e.date, 'yyyy-MM-dd') === format(dayDate, 'yyyy-MM-dd'));
                                            const isToday = format(dayDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
                                            
                                            return (
                                                <div className="relative h-full w-full flex flex-col items-center justify-center">
                                                    <span className={`text-sm ${isToday ? 'font-bold' : 'font-medium'}`}>
                                                        {format(dayDate, 'd')}
                                                    </span>
                                                    {dayEvents.length > 0 && (
                                                        <div className="absolute -bottom-1 flex items-center gap-1">
                                                            {dayEvents.slice(0, 3).map((event, index) => (
                                                                <div 
                                                                    key={event.id} 
                                                                    className={`h-1.5 w-1.5 rounded-full ${eventTypeStyles[event.type].dot}`} 
                                                                />
                                                            ))}
                                                            {dayEvents.length > 3 && (
                                                                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }
                                    }}
                                />
                            </div>

                            {/* Enhanced Events Section */}
                            <div className="flex flex-col">
                                <div className="p-8 border-b border-border">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-2xl font-bold">
                                                {date ? format(date, 'EEEE, MMMM do, yyyy') : 'Select a date'}
                                            </h3>
                                            <p className="text-muted-foreground mt-2 text-base">
                                                {selectedDayEvents.length} {selectedDayEvents.length === 1 ? 'event' : 'events'} scheduled
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex-1 p-8">
                                    <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-hide">
                                        {selectedDayEvents.length > 0 ? selectedDayEvents.map((event, index) => {
                                            const styles = eventTypeStyles[event.type];
                                            const IconComponent = styles.icon;
                                            
                                            return (
                                                <div 
                                                    key={event.id} 
                                                    className={`p-5 rounded-2xl border-l-4 ${styles.bg} ${styles.border} ${event.priority ? priorityStyles[event.priority] : ''} transition-all duration-300 hover:shadow-xl group cursor-pointer`}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-start gap-4">
                                                            <div className={`mt-1 p-3 rounded-xl ${styles.gradient} shadow-lg`}>
                                                                <IconComponent className="h-5 w-5 text-primary-foreground" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <p className={`font-bold ${styles.text} text-lg`}>
                                                                        {event.title}
                                                                    </p>
                                                                    {event.priority && (
                                                                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                                                            event.priority === 'high' ? 'bg-destructive/10 text-destructive' :
                                                                            event.priority === 'medium' ? 'bg-warning/10 text-warning' :
                                                                            'bg-muted text-muted-foreground'
                                                                        }`}>
                                                                            {event.priority}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-4 text-sm">
                                                                    {event.time && (
                                                                        <div className={`flex items-center gap-1 ${styles.text} opacity-80`}>
                                                                            <Clock className="h-4 w-4" />
                                                                            <span className="font-medium">
                                                                                {format(new Date(`2000-01-01T${event.time}`), 'h:mm a')}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                    {event.amount && (
                                                                        <div className={`flex items-center gap-1 ${styles.text} opacity-80`}>
                                                                            <DollarSign className="h-4 w-4" />
                                                                            <span className="font-medium">{event.amount}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm"
                                                            className={`opacity-0 group-hover:opacity-100 transition-all duration-300 h-10 w-10 p-0 rounded-xl hover:shadow-lg ${styles.text}`}
                                                        >
                                                            <MoreHorizontal className="h-5 w-5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        }) : (
                                            <div className="text-center py-16">
                                                <div className="mx-auto h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6 shadow-xl">
                                                    <CalendarIcon className="h-10 w-10 text-muted-foreground" />
                                                </div>
                                                <p className="text-muted-foreground text-xl font-semibold mb-2">
                                                    No events scheduled
                                                </p>
                                                <p className="text-muted-foreground text-base">
                                                    Add an event to get started
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function AddEventForm({ onSubmit }: { onSubmit: (title: string, type: CalendarEvent['type'], time: string, amount: string, priority: CalendarEvent['priority']) => void }) {
    const [title, setTitle] = useState('');
    const [type, setType] = useState<CalendarEvent['type']>('custom');
    const [time, setTime] = useState('');
    const [amount, setAmount] = useState('');
    const [priority, setPriority] = useState<CalendarEvent['priority']>('medium');

    const handleSubmit = () => {
        if (title) {
            onSubmit(title, type, time, amount, priority);
            setTitle('');
            setTime('');
            setAmount('');
            setPriority('medium');
        }
    };

    return (
        <div className="space-y-6 py-4">
            <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold">Event Title</Label>
                <Input 
                    id="title" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Credit card payment"
                    className="h-12 rounded-xl" 
                    required 
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="type" className="text-sm font-semibold">Category</Label>
                    <Select value={type} onValueChange={(value) => setType(value as CalendarEvent['type'])}>
                        <SelectTrigger className="h-12 rounded-xl">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="custom">Custom</SelectItem>
                            <SelectItem value="payment">Payment</SelectItem>
                            <SelectItem value="investment">Investment</SelectItem>
                            <SelectItem value="filing">Filing</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="priority" className="text-sm font-semibold">Priority</Label>
                    <Select value={priority} onValueChange={(value) => setPriority(value as CalendarEvent['priority'])}>
                        <SelectTrigger className="h-12 rounded-xl">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="time" className="text-sm font-semibold">Time</Label>
                    <Input 
                        id="time" 
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        type="time"
                        className="h-12 rounded-xl" 
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="amount" className="text-sm font-semibold">Amount (optional)</Label>
                    <Input 
                        id="amount" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="$0.00"
                        className="h-12 rounded-xl" 
                    />
                </div>
            </div>
            <DialogFooter className="pt-4">
                <DialogClose asChild>
                    <Button type="button" variant="outline" className="rounded-xl">Cancel</Button>
                </DialogClose>
                <Button 
                    type="button" 
                    className="bg-primary hover:bg-primary/90 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={handleSubmit}
                >
                    Save Event
                </Button>
            </DialogFooter>
        </div>
    );
}
