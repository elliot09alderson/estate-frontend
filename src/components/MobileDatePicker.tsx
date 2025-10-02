import React from 'react';
import { Calendar } from 'lucide-react';
import { format, addDays } from 'date-fns';

interface MobileDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  label?: string;
  className?: string;
}

const MobileDatePicker: React.FC<MobileDatePickerProps> = ({
  value,
  onChange,
  min = format(addDays(new Date(), 1), 'yyyy-MM-dd'),
  label,
  className = ''
}) => {
  // Generate next 30 days as quick select options
  const quickDates = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(), i + 1);
    return {
      value: format(date, 'yyyy-MM-dd'),
      label: format(date, 'EEE, MMM dd'),
      isWeekend: date.getDay() === 0 || date.getDay() === 6
    };
  });

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Quick select dates for mobile */}
      <div className="md:hidden">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {quickDates.map((date) => (
            <button
              key={date.value}
              type="button"
              onClick={() => onChange(date.value)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                value === date.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : date.isWeekend
                  ? 'bg-muted/50 text-muted-foreground border-border hover:border-primary'
                  : 'bg-background text-foreground border-border hover:border-primary'
              }`}
            >
              {date.label}
            </button>
          ))}
        </div>
      </div>

      {/* Regular date input */}
      <div className="relative">
        <input
          type="date"
          value={value}
          min={min}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-2.5 pr-10 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          required
        />
        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>

      {/* Display selected date */}
      {value && (
        <p className="text-xs text-muted-foreground">
          Selected: {format(new Date(value), 'EEEE, MMMM dd, yyyy')}
        </p>
      )}
    </div>
  );
};

export default MobileDatePicker;