import { useRef } from 'react';

export function DragMeter({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const setFromX = (clientX: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect || disabled) return;
    const next = Math.round(Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)) * 100);
    onChange(next);
  };

  return (
    <div
      ref={ref}
      className={disabled ? 'meter locked' : 'meter'}
      role="slider"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      tabIndex={0}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        setFromX(event.clientX);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) setFromX(event.clientX);
      }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') onChange(Math.min(100, value + 8));
        if (event.key === 'ArrowLeft') onChange(Math.max(0, value - 8));
      }}
    >
      <div className="meter-fill" style={{ width: `${value}%` }} />
      <div className="meter-thumb" style={{ left: `${value}%` }} />
    </div>
  );
}
