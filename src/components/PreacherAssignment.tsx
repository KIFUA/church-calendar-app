import React from 'react';
import { DayView } from './DayView';

export const PreacherAssignment = ({ staffGroups, events, db, appId, doc, setDoc, backgroundColor }: { staffGroups: any[], events: any[], db: any, appId: string, doc: any, setDoc: any, backgroundColor: string }) => {
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const days = [];
  const firstDay = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1);
  const lastDay = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0);
  
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    if ([3, 5, 0].includes(d.getDay())) {
      days.push(new Date(d));
    }
  }

  const preachersOnly = staffGroups.filter(g => g.label === "НА ВСІ ДНІ" || g.label === "ТІЛЬКИ НА БУДНІ");
  const [localAssignments, setLocalAssignments] = React.useState<Record<string, string>>({});
  const [selectedCell, setSelectedCell] = React.useState<{ preacher: string, date: Date } | null>(null);
  const [selectedFunction, setSelectedFunction] = React.useState('');
  const [participationNumber, setParticipationNumber] = React.useState(1);
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [applyFilter, setApplyFilter] = React.useState(false);

  React.useEffect(() => {
    if (selectedFunction !== 'пр.') {
      setParticipationNumber(1);
    }
  }, [selectedFunction]);

  const handleCellDoubleClick = (preacher: string, date: Date, event: React.MouseEvent) => {
    setSelectedCell({ preacher, date });
    setSelectedDate(date);
  };

  const handleAssign = async () => {
    if (!selectedCell) return;

    const dateKey = selectedCell.date.toISOString().split('T')[0];
    const assignmentString = `${selectedFunction === 'пр.' ? participationNumber : ''} ${selectedFunction}`.trim();
    
    setLocalAssignments(prev => ({ ...prev, [`${dateKey}_${selectedCell.preacher}`]: assignmentString }));

    const event = events.find(e => e.id === dateKey);
    if (event) {
      const updatedLeads = [...(event.leads || []), `${assignmentString} ${selectedCell.preacher}`];
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'calendar_events', dateKey), { leads: updatedLeads }, { merge: true });
    }

    setSelectedCell(null);
  };

  const getDayStyle = (day: number) => {
    if (day === 0) return '#C1D5D8'; // Нд
    if (day === 5) return '#E8D1D1'; // Пт
    if (day === 3) return '#F0F0F0'; // Ср
    return '#ffffff'; // Default
  };

  return (
    <div className="w-full bg-white rounded-2xl p-6 border border-slate-300 shadow-lg">
      <h2 className="text-black text-lg font-black uppercase mb-4">Призначення проповідників ({nextMonth.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' })})</h2>
      
      <div className="flex gap-4">
        <div className={selectedDate ? "w-3/4" : "w-full"}>
          {/* Таблиця */}
          <div className="text-black text-xs overflow-x-auto">
            <table className="w-full border-collapse border-2 border-slate-400">
              <thead>
                <tr>
                  <th className="border-2 border-slate-400 p-2 bg-slate-200 sticky left-0 z-20">№</th>
                  <th className="border-2 border-slate-400 p-2 bg-slate-200 sticky left-[36px] z-20">Прізвище, ім'я</th>
                  {days.map((d) => (
                    <th 
                      key={d.toISOString()} 
                      className={`border-2 border-slate-400 p-2 text-[9px] cursor-pointer hover:bg-slate-300 ${d.getDay() === 0 ? 'border-blue-500 border-4' : ''}`} 
                      style={{ backgroundColor: getDayStyle(d.getDay()) }}
                      onClick={() => setSelectedDate(d)}
                    >
                      {d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' })}
                      <br />
                      {['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][d.getDay()]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preachersOnly.map((group) => (
                  <React.Fragment key={group.label}>
                    <tr>
                      <td colSpan={2 + days.length} className="bg-slate-300 font-bold p-2 border-2 border-slate-400 text-black">{group.label}</td>
                    </tr>
                    {group.items.map((item: string, iIdx: number) => (
                      <tr key={item}>
                        <td className="border-2 border-slate-400 p-2 text-center sticky left-0 z-10 bg-white">{iIdx + 1}</td>
                        <td className="border-2 border-slate-400 p-2 sticky left-[36px] z-10 bg-white whitespace-nowrap">{item}</td>
                        {days.map((d) => {
                          const dateKey = d.toISOString().split('T')[0];
                          const event = events.find(e => e.id === dateKey);
                          const assignment = event?.leads?.find((l: string) => l.includes(item));
                          const functionOnly = assignment ? assignment.split(' ').slice(0, 2).join(' ') : (localAssignments[`${dateKey}_${item}`] || '');
                          
                          return (
                            <td 
                              key={d.toISOString()} 
                              className={`border-2 border-slate-400 p-2 min-w-[50px] cursor-pointer hover:bg-slate-100`} 
                              style={{ backgroundColor: getDayStyle(d.getDay()) }} 
                              onDoubleClick={(e) => handleCellDoubleClick(item, d, e)}
                              onClick={(e) => handleCellDoubleClick(item, d, e)}
                            >
                              {functionOnly}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedDate && (
          <div className="w-1/4 p-4 rounded-2xl" style={{ backgroundColor }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-black uppercase text-sm">
                {selectedDate.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })}
              </h3>
              <button onClick={() => setSelectedDate(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="mb-4">
              <label className="flex items-center text-white text-xs cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={applyFilter} 
                  onChange={(e) => setApplyFilter(e.target.checked)} 
                  className="mr-2"
                />
                Фільтрувати події
              </label>
            </div>
            <DayView events={events} date={selectedDate} onDateChange={setSelectedDate} backgroundColor={backgroundColor} applyFilter={applyFilter} />
          </div>
        )}
      </div>
    </div>
  );
};
