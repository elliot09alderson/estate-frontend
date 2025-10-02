import React, { useState, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface Option {
  value: string;
  label: string;
}

interface MobileSelectProps {
  options: Option[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}

const MobileSelect: React.FC<MobileSelectProps> = ({
  options,
  value,
  onValueChange,
  placeholder = 'Select an option',
  label,
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  // Prevent body scroll when modal is open on mobile
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  const handleSelect = (option: Option) => {
    onValueChange(option.value);
    setIsOpen(false);
  };

  // Mobile bottom sheet for small screens
  const MobileSheet = () => {
    return createPortal(
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-[100] md:hidden"
              onClick={() => setIsOpen(false)}
              style={{ touchAction: 'manipulation' }}
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-background rounded-t-2xl z-[101] md:hidden max-h-[80vh] overflow-hidden shadow-2xl"
              style={{ touchAction: 'manipulation' }}
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-lg">{label || placeholder}</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-3 hover:bg-muted rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  style={{ touchAction: 'manipulation' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto max-h-[60vh]">
                {options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option)}
                    className={`w-full px-6 py-4 text-left border-b border-border hover:bg-muted/50 active:bg-muted transition-colors flex items-center justify-between min-h-[56px] ${
                      option.value === value
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-foreground'
                    }`}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <span>{option.label}</span>
                    {option.value === value && (
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body
    );
  };

  // Desktop dropdown
  const DesktopDropdown = () => {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 z-[50] mt-1 bg-background border border-border rounded-md shadow-lg overflow-hidden hidden md:block"
            style={{ maxHeight: '240px', overflowY: 'auto' }}
          >
            <div className="py-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`w-full px-4 py-2.5 text-left hover:bg-muted/50 transition-colors ${
                    option.value === value
                      ? 'bg-muted text-foreground font-medium'
                      : 'text-foreground'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <>
      <div className={`relative ${className}`}>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full min-h-[48px] h-12 px-4 rounded-md border border-input bg-background text-left flex items-center justify-between transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:bg-muted/30 ${
            disabled
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:border-foreground/50'
          }`}
          style={{ touchAction: 'manipulation' }}
        >
          <span className={selectedOption ? 'text-foreground' : 'text-muted-foreground'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Desktop dropdown */}
        <DesktopDropdown />
      </div>

      {/* Mobile bottom sheet */}
      <MobileSheet />
    </>
  );
};

export default MobileSelect;