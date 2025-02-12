import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

export interface DateTimePickerProps {
  date?: Date;
  setDate: (date: Date | undefined) => void;
  placeholder?: string;
  "aria-label"?: string;
}

export function DateTimePicker({ 
  date, 
  setDate, 
  placeholder,
  "aria-label": ariaLabel,
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date);
  const [timeInput, setTimeInput] = React.useState(
    date ? format(date, "HH:mm") : ""
  );

  const handleDateSelect = (newDate: Date | undefined) => {
    setSelectedDate(newDate);
    if (newDate && timeInput) {
      const [hours, minutes] = timeInput.split(":").map(Number);
      const dateWithTime = new Date(newDate);
      dateWithTime.setHours(hours);
      dateWithTime.setMinutes(minutes);
      setDate(dateWithTime);
    } else {
      setDate(newDate);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimeInput(e.target.value);
    if (selectedDate && e.target.value) {
      const [hours, minutes] = e.target.value.split(":").map(Number);
      const dateWithTime = new Date(selectedDate);
      dateWithTime.setHours(hours);
      dateWithTime.setMinutes(minutes);
      setDate(dateWithTime);
    }
  };

  return (
    <div className="flex gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
            aria-label={ariaLabel}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : placeholder || "Sélectionner une date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
          />
          <div className="p-3 border-t">
            <Input
              type="time"
              value={timeInput}
              onChange={handleTimeChange}
              className="w-full"
              aria-label={`Heure pour ${ariaLabel}`}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
