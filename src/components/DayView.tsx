import React from 'react';
import { MapPin, Clock, Music } from 'lucide-react';

export const DayView = ({ events, date, onDateChange, backgroundColor, applyFilter }: { events: any[], date: Date, onDateChange: (d: Date) => void, backgroundColor: string, applyFilter?: boolean }) => {
  const formatDateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const dateKey = formatDateKey(date);
  const dayData = events.find(e => e.id === dateKey);
  
  let dayEvents = [...(dayData?.events || [])].sort((a, b) => (a.startTime || "99:99").localeCompare(b.startTime || "99:99"));

  if (applyFilter) {
    dayEvents = dayEvents.filter(ev => {
      // Функція для "м'якого" порівняння: прибирає зайві пробіли, крапки та ігнорує регістр
      const normalize = (str: string) => str?.toLowerCase().replace(/[.\s]/g, '');
      
      // Перевірка поля "ПОДІЯ" (або podia) або "title"
      const podiaValue = normalize(ev.ПОДІЯ || ev.podia || ev.title || '');
      const isTargetGroup = podiaValue.includes("основнітасвята") || 
                            podiaValue.includes("обласнізаходи");
      
      return isTargetGroup;
    });
  }

  const darkenHex = (hex: string, percent: number) => {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    r = Math.floor(r * (1 - percent));
    g = Math.floor(g * (1 - percent));
    b = Math.floor(b * (1 - percent));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-3 w-full" style={{ backgroundColor }}>
      <div className="flex justify-between items-center mb-2">
        <button onClick={() => { const d = new Date(date); d.setDate(d.getDate() - 1); onDateChange(d); }} className="text-blue-400">◀</button>
        <h3 className="text-white font-black uppercase text-sm">
          {date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', weekday: 'short' })}
        </h3>
        <button onClick={() => { const d = new Date(date); d.setDate(d.getDate() + 1); onDateChange(d); }} className="text-blue-400">▶</button>
      </div>
      
      <div className="flex-grow space-y-3">
        {dayEvents.length > 0 ? dayEvents.map((ev, i) => {
          const isCleaning = ev.title?.toUpperCase().replace(/\s+/g, '').includes('ПРИБИРАННЯ');
          
          return (
            <div key={i} className={`border border-slate-700 rounded-2xl p-4 shadow-sm mb-3 relative group/event ${isCleaning ? 'bg-slate-700' : 'bg-slate-800'}`}>
              <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl" style={{ backgroundColor: ev.textColor }} />
              
              <div className="font-black text-white text-sm mb-2">{ev.title}</div>
              <div className="flex items-center gap-2 text-slate-300 mb-1 text-xs">
                <span className="text-red-400">📍</span>
                <span>{ev.place || 'Не вказано'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300 text-xs">
                <span className="text-red-400">⏰</span>
                <span>{ev.startTime}{ev.endTime ? `-${ev.endTime}` : ''}</span>
              </div>
              {ev.music && (
                <div className="text-slate-400 italic text-xs mt-2 flex items-center gap-1">
                  <Music size={12} className="text-blue-400" />
                  <span>{ev.music}</span>
                </div>
              )}
            </div>
          );
        }) : (
          <div className="text-center text-slate-400 py-10 text-sm">Подій немає</div>
        )}
      </div>
    </div>
  );
};
