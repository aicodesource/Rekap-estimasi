import React, { useState, useRef, useEffect } from "react";
import { format, parseISO, isValid } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { DayPicker, DateRange } from "react-day-picker";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";

interface DateRangePickerProps {
  from: string;
  to: string;
  onChange: (range: { from: string; to: string }) => void;
  className?: string;
}

export function DateRangePicker({ from, to, onChange, className }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedRange: DateRange | undefined = {
    from: from ? parseISO(from) : undefined,
    to: to ? parseISO(to) : undefined,
  };

  const handleSelect = (range: DateRange | undefined) => {
    if (range?.from) {
      const fromStr = format(range.from, "yyyy-MM-dd");
      const toStr = range.to ? format(range.to, "yyyy-MM-dd") : fromStr;
      onChange({ from: fromStr, to: toStr });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayDate = () => {
    if (!from) return "Pilih tanggal...";
    const fromDate = parseISO(from);
    const toDate = to ? parseISO(to) : fromDate;
    
    if (!isValid(fromDate)) return "Pilih tanggal...";
    
    if (from === to || !to) {
      return format(fromDate, "dd MMM yyyy");
    }
    return `${format(fromDate, "dd MMM")} - ${format(toDate, "dd MMM yyyy")}`;
  };

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Rentang Tanggal</label>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all w-full text-left"
        >
          <CalendarIcon className="w-4 h-4 text-neutral-400" />
          <span className={cn("flex-1", !from && "text-neutral-400")}>{displayDate()}</span>
          {from && (
            <X 
              className="w-3 h-3 text-neutral-400 hover:text-neutral-600 cursor-pointer" 
              onClick={(e) => {
                e.stopPropagation();
                onChange({ from: "", to: "" });
              }}
            />
          )}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-50 mt-2 p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl"
          >
            <DayPicker
              mode="range"
              selected={selectedRange}
              onSelect={handleSelect}
              numberOfMonths={2}
              className="rdp-custom"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-bold",
                nav: "space-x-1 flex items-center",
                nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-neutral-400 rounded-md w-9 font-normal text-[10px] uppercase",
                row: "flex w-full mt-2",
                cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-neutral-100/50 [&:has([aria-selected])]:bg-neutral-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 dark:[&:has([aria-selected])]:bg-neutral-800",
                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors",
                day_range_end: "day-range-end",
                day_selected: "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white",
                day_today: "bg-neutral-100 dark:bg-neutral-800 text-blue-600 font-bold",
                day_outside: "text-neutral-400 opacity-50",
                day_disabled: "text-neutral-400 opacity-50",
                day_range_middle: "aria-selected:bg-neutral-100 aria-selected:text-neutral-900 dark:aria-selected:bg-neutral-800 dark:aria-selected:text-neutral-100",
                day_hidden: "invisible",
                chevron: "fill-current w-4 h-4",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
