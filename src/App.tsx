import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  doc, 
  setDoc 
} from 'firebase/firestore';
import { 
  Plus, 
  Trash2, 
  Lock, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Clock, 
  X, 
  Save, 
  Calendar,
  ChevronDown,
  ChevronUp,
  Pencil,
  Music,
  Users,
  Church,
  Printer,
  Download
} from 'lucide-react';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase safely
let app;
let auth;
let db;

try {
  // Only initialize if apiKey is present to avoid immediate crash
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } else {
    console.warn("Firebase config missing. App will run in demo/offline mode or fail to load data.");
  }
} catch (e) {
  console.error("Firebase initialization error:", e);
}

const appId = import.meta.env.VITE_APP_ID || 'church-calendar-if';
const initialAuthToken = import.meta.env.VITE_INITIAL_AUTH_TOKEN;

const sortAlphabetically = (arr) => [...arr].sort((a, b) => a.localeCompare(b, 'uk'));

// --- ПОЧАТКОВІ ДАНІ ---
const INITIAL_EVENT_GROUPS = [
  { label: "ОСНОВНІ ТА СВЯТА", items: ["Загальне зібрання", "П Р И Ч А С Т Я", "ВОДНЕ ХРЕЩЕННЯ", "П А С Х А", "Д Е Н Ь  50-і", "Р І З Д В О", "ЦЕРКОВНА РАДА"] },
  { label: "СЛУЖІННЯ ТА ГРУПИ", items: ["Молитовне", "Молодіжне", "Сестринське", "Лідерська", "Домашня група для жінок ВПО", "Домашня група Євстратова О.", "Сетр. група", "Підліткова група"] },
  { label: "ДІТИ ТА ШКОЛА", items: ["Клуб SineShine", "Уроки дітей клубу \"SunShine\"", "Біблійна Школа", "Денний центр роботи з дітьми"] },
  { label: "ОБЛАСНІ ЗАХОДИ", items: ["ОБЛАСНА РАДА СЛУЖИТЕЛІВ", "ОБЛАСНА ПРЕСВІТЕРСЬКА РАДА", "ОБЛАСНА КОНФЕРЕНЦІЯ", "ОБЛАСНА МОЛОДІЖНА КОНФЕРЕНЦІЯ", "ОБЛАСНА ЖІНОЧА КОНФЕРЕНЦІЯ"] },
  { label: "ГОСПОДАРСЬКІ", items: ["Прибирання сцени", "Прибирання залу"] }
];

const INITIAL_MUSIC_GROUPS = [
  { label: "ХОРИ ТА МУЗИКА", items: ["Хор центральний", "Хор молодіжний", "Хор підлітковий", "Хор дитячий", "Команда 1", "Команда 2", "Команда 3", "група \"BlessedTime\""] }
];

const INITIAL_STAFF_GROUPS = [
  { label: "НА ВСІ ДНІ", items: ["Веремій Юрій", "Бевзюк Вячеслав", "Черняк Валентин", "Карпюк Олег", "Черняк Василь", "Бурчак Юрій", "Галюк Богдан"] },
  { label: "ТІЛЬКИ НА БУДНІ", items: ["Вовчук Н.", "Дмитраш М.", "Євстратов О.", "Ліптуга Г.", "Марунчак В.", "Мельничук В.", "Несен Ю.", "Павлишак Ю.", "Решетило Р.", "Самелюк О.", "Скіцко І.", "Скіцко П.", "Скринник М.", "Стефурак Д.", "Шегда В.", "Федеркевич М.", "Фіцик Д.", "Черняк Віт.", "Черняк М."] },
  { label: "ХТО СПІВАЄ / ГРАЄ", items: ["Веремчук Т.", "Мельничук Х.", "Бабійчук А.", "Яців Х.", "Група прославлення №1", "Група прославлення №2", "Оркестр", "Квартет", "Соло"] }
];

const INITIAL_LOCATIONS = ["ЗАЛ", "ЇДАЛЬНЯ", "ЗАЛ + ЇДАЛЬНЯ", "КОНФЕРЕНЦ ЗАЛ", "ПРОСТІР", "МАЛИЙ ЗАЛ", "РЕП.БАЗА", "КЛАСИ НШ", "ОНЛАЙН"];

const INITIAL_TEXT_COLORS = [
  "#0077cc", "#dc2626", "#16a34a", "#9333ea", "#1e293b", "#991b1b", "#0ea5e9"
];

const getAutoColor = (eventTitle) => {
  if (eventTitle === "П Р И Ч А С Т Я" || eventTitle === "П А С Х А") return "#dc2626";
  if (eventTitle === "ВОДНЕ ХРЕЩЕННЯ") return "#003366";
  if (eventTitle === "Р І З Д В О") return "#0ea5e9";
  if (eventTitle === "Д Е Н Ь  50-і") return "#16a34a";
  if (eventTitle === "ЦЕРКОВНА РАДА") return "#991b1b";
  if (eventTitle.includes("ОБЛАСНА")) return "#003366";
  if (eventTitle.includes("SunShine") || eventTitle.includes("SineShine")) return "#9333ea";
  return "#0077cc";
};

const WEEKDAY_COLORS = { 1: "#E8E6D1", 2: "#E0E8D1", 3: "#F0F0F0", 4: "#E8DDD1", 5: "#E8D1D1", 6: "#D1E0E8", 0: "#D1E5E8" };
const BORDER_COLORS = { 1: "#F2C057", 2: "#A8D08D", 3: "#BFBFBF", 4: "#F4B083", 5: "#FF8080", 6: "#5B9BD5", 0: "#4BACC6" };
const SHORT_WEEKDAYS = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const FULL_WEEKDAYS = ["Неділя", "Понеділок", "Вівторок", "Середа", "Четвер", "П’ятниця", "Субота"];

const CustomSelect = ({ value, options = [], onChange, placeholder, groups = null, onEditGroup = null, className = "w-full", title }: {
  value: any;
  options?: string[];
  onChange: (val: any) => void;
  placeholder?: string;
  groups?: { label: string; items: string[] }[] | null;
  onEditGroup?: ((group: any) => void) | null;
  className?: string;
  title?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setActiveGroupIndex(0);
      // Small delay to allow DOM to render
      setTimeout(checkScroll, 50);
    }
  }, [isOpen, groups]);

  useEffect(() => {
    if (isOpen && groups && value) {
        const idx = groups.findIndex(g => g.items.includes(value));
        if (idx !== -1) {
            setActiveGroupIndex(idx);
            // Scroll to active tab
            if (tabsRef.current) {
                const tabWidth = tabsRef.current.clientWidth / 2;
                tabsRef.current.scrollTo({ left: idx * tabWidth, behavior: 'auto' });
                setTimeout(checkScroll, 50);
            }
        }
    }
  }, [isOpen, groups, value]);

  const content = (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center px-4 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-150" onClick={() => setIsOpen(false)}>
      <div 
        className={`bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[60vh] animate-in zoom-in-95 duration-150 ${(!groups || groups.length <= 1) ? 'w-auto min-w-[200px] max-w-[300px]' : 'w-full max-w-[300px]'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-3 py-1.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
           <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{title || "Виберіть значення"}</span>
           <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-200 rounded-full transition-colors"><X size={14} className="text-slate-400"/></button>
        </div>
        
        {groups ? (
          <div className="flex flex-col min-h-[200px]">
              {/* Tabs Header */}
              {groups.length > 1 && (
              <div className="flex items-center bg-slate-50 border-b border-slate-200 shrink-0 relative">
                  {canScrollLeft && (
                  <button 
                      onClick={() => { tabsRef.current?.scrollBy({ left: -150, behavior: 'smooth' }); setTimeout(checkScroll, 300); }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors shrink-0 absolute left-0 z-10 bg-gradient-to-r from-slate-50 to-transparent"
                  >
                      <ChevronLeft size={12} />
                  </button>
                  )}
                  <div ref={tabsRef} onScroll={checkScroll} className="flex-1 flex overflow-x-auto [&::-webkit-scrollbar]:hidden snap-x">
                      {groups.map((group, idx) => (
                          <div 
                              key={idx}
                              onClick={() => setActiveGroupIndex(idx)}
                              className={`w-1/2 flex-shrink-0 px-2 py-2 text-[9px] font-black uppercase tracking-wider cursor-pointer whitespace-nowrap transition-colors border-b-2 flex items-center justify-center gap-1.5 snap-start ${activeGroupIndex === idx ? 'bg-white text-blue-600 border-blue-600' : 'text-slate-500 hover:bg-slate-100 border-transparent hover:border-slate-300'}`}
                          >
                              <span className="flex flex-col items-center justify-center leading-[1.1] w-full text-center">
                                {group.label.split(' ').length > 1 ? (
                                  <>
                                    <span className="truncate w-full">{group.label.split(' ')[0]}</span>
                                    <span className="truncate w-full">{group.label.split(' ').slice(1).join(' ')}</span>
                                  </>
                                ) : (
                                  <span className="truncate max-w-[90%]">{group.label}</span>
                                )}
                              </span>
                              {onEditGroup && activeGroupIndex === idx && (
                                  <button 
                                      onClick={(e) => { e.stopPropagation(); onEditGroup(group); setIsOpen(false); }}
                                      className="p-0.5 hover:bg-blue-50 rounded text-blue-500 transition-opacity"
                                  >
                                      <Pencil size={10} />
                                  </button>
                              )}
                          </div>
                      ))}
                  </div>
                  {canScrollRight && (
                  <button 
                      onClick={() => { tabsRef.current?.scrollBy({ left: 150, behavior: 'smooth' }); setTimeout(checkScroll, 300); }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors shrink-0 absolute right-0 z-10 bg-gradient-to-l from-slate-50 to-transparent"
                  >
                      <ChevronRight size={12} />
                  </button>
                  )}
              </div>
              )}
              
              {/* Items List */}
              <div className="flex-1 overflow-y-auto bg-white">
                  <div className="flex flex-col">
                    {sortAlphabetically(groups[activeGroupIndex]?.items || []).map((opt) => (
                        <div
                            key={opt}
                            onClick={() => { onChange(opt); setIsOpen(false); }}
                            className={`px-3 py-[2px] text-[10px] font-bold cursor-pointer transition-colors border-b border-slate-50 last:border-0 text-left leading-tight ${
                                value === opt ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            {opt}
                        </div>
                    ))}
                  </div>
              </div>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[300px]">
            <div className="flex flex-col">
              {sortAlphabetically(options).map((opt) => (
                <div
                  key={opt}
                  onClick={() => { onChange(opt); setIsOpen(false); }}
                  className={`px-3 py-[2px] text-[10px] font-bold cursor-pointer transition-colors border-b border-slate-50 last:border-0 text-left leading-tight ${
                    value === opt ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{opt}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      <div 
        onClick={() => setIsOpen(true)}
        className="w-full bg-white text-[9px] px-2 py-0 border border-slate-200 font-bold text-slate-900 flex justify-between items-center cursor-pointer hover:border-blue-400 h-6 shadow-sm rounded transition-colors"
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown size={10} className="text-slate-400 shrink-0 ml-1" />
      </div>
      {isOpen && createPortal(content, document.body)}
    </div>
  );
};

const TimeInput = ({ value, onChange, label }) => {
  const [hh, mm] = (value || "").split(':');
  const mmRef = useRef(null);

  const handleHHChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 2);
    if (parseInt(val) > 23) val = "23";
    onChange(`${val}:${mm || "00"}`);
    if (val.length === 2) mmRef.current?.focus();
  };

  const handleMMChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 2);
    if (parseInt(val) > 59) val = "59";
    onChange(`${hh || "00"}:${val}`);
  };

  return (
    <div className="flex flex-col">
      <label className="text-[7px] font-black text-slate-500 uppercase block mb-0.5 leading-none">{label}</label>
      <div className="flex items-center bg-white border border-slate-200 px-1 h-6 shadow-sm">
        <input type="text" value={hh || ""} onChange={handleHHChange} placeholder="00" onFocus={(e) => e.target.select()} className="w-4 bg-transparent text-slate-900 text-[10px] text-center outline-none font-bold p-0" />
        <span className="text-slate-400 text-[10px] font-bold">:</span>
        <input ref={mmRef} type="text" value={mm || ""} onChange={handleMMChange} placeholder="00" onFocus={(e) => e.target.select()} className="w-4 bg-transparent text-slate-900 text-[10px] text-center outline-none font-bold p-0" />
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('view');
  const [events, setEvents] = useState([]);
  const [monthlyThemes, setMonthlyThemes] = useState({});
  const [isEditingTheme, setIsEditingTheme] = useState(false);
  const [themeText, setThemeText] = useState("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dayViewPivotDate, setDayViewPivotDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [selectedDayForEvent, setSelectedDayForEvent] = useState(null);
  
  // Динамічні довідники
  const [eventGroups, setEventGroups] = useState(INITIAL_EVENT_GROUPS);
  const [musicGroups, setMusicGroups] = useState(INITIAL_MUSIC_GROUPS);
  const [staffGroups, setStaffGroups] = useState(INITIAL_STAFF_GROUPS);
  const [locations, setLocations] = useState(INITIAL_LOCATIONS);
  const [textColors, setTextColors] = useState(INITIAL_TEXT_COLORS);
  const [listsLoaded, setListsLoaded] = useState(false);
  const listsRef = useRef(null);
  
  const [editingGroup, setEditingGroup] = useState(null);
  const [newItemName, setNewItemName] = useState("");
  const [editingEventIndex, setEditingEventIndex] = useState<number | null>(null);

  useEffect(() => {
    if (viewMode === 'day') {
      setDayViewPivotDate(new Date(selectedDate));
    }
  }, [viewMode]);

  const today = new Date();
  
  useEffect(() => {
    if (!selectedDayForEvent) {
      setEditingEventIndex(null);
    }
  }, [selectedDayForEvent]);
  
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        if (initialAuthToken) {
          try {
            await signInWithCustomToken(auth, initialAuthToken);
          } catch (e) {
            console.error("Custom token auth failed", e);
            await signInAnonymously(auth);
          }
        } else {
          await signInAnonymously(auth);
        }
        setAuthError(null);
      } catch (e) {
        console.error("Auth failed:", e);
        setAuthError(e.message);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!db) return;
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'calendar_events');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.error(err));

    const qThemes = collection(db, 'artifacts', appId, 'public', 'data', 'monthly_themes');
    const unsubscribeThemes = onSnapshot(qThemes, (snapshot) => {
      const themes = {};
      snapshot.docs.forEach(d => {
        themes[d.id] = d.data().theme;
      });
      setMonthlyThemes(themes);
    }, (err) => console.error(err));

    const qLists = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'lists');
    const unsubscribeLists = onSnapshot(qLists, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const dataStr = JSON.stringify(data);
        if (listsRef.current !== dataStr) {
          listsRef.current = dataStr;
          if (data.eventGroups) setEventGroups(data.eventGroups);
          if (data.musicGroups) setMusicGroups(data.musicGroups);
          if (data.staffGroups) setStaffGroups(data.staffGroups);
          if (data.locations) setLocations(data.locations);
          if (data.textColors) setTextColors(data.textColors);
        }
      }
      setListsLoaded(true);
    }, (err) => console.error(err));

    return () => {
      unsubscribe();
      unsubscribeThemes();
      unsubscribeLists();
    };
  }, [db]);

  useEffect(() => {
    if (!listsLoaded || !isAdminAuthenticated || !db) return;
    const currentData = { eventGroups, musicGroups, staffGroups, locations, textColors };
    const currentDataStr = JSON.stringify(currentData);
    if (listsRef.current === currentDataStr) return;
    
    listsRef.current = currentDataStr;
    const saveLists = async () => {
      try {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'lists'), currentData, { merge: true });
      } catch (err) {
        console.error("Error saving lists: ", err);
      }
    };
    saveLists();
  }, [eventGroups, musicGroups, staffGroups, locations, textColors, listsLoaded, isAdminAuthenticated, db]);

  const saveTheme = async (monthKey, text) => {
    // Якщо ми не в режимі адміна або база не ініціалізована - попереджаємо
    if (!isAdminAuthenticated || !db) {
      setMonthlyThemes(prev => ({ ...prev, [monthKey]: text || "" }));
      setIsEditingTheme(false);
      alert("Увага: Ви не авторизовані або база не підключена. Зміни збережено лише тимчасово (до оновлення сторінки).");
      return;
    }

    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'monthly_themes', monthKey), { theme: text || "" }, { merge: true });
      setMonthlyThemes(prev => ({ ...prev, [monthKey]: text || "" }));
      setIsEditingTheme(false);
      alert("Текст збережено успішно!");
    } catch (err) {
      console.error("Error saving theme: ", err);
      alert("Помилка збереження на сервері: " + err.message);
    }
  };

  const moveGroup = (idx, fromType, toType) => {
    let group;
    if (fromType === 'event') {
      group = eventGroups[idx];
      setEventGroups(prev => prev.filter((_, i) => i !== idx));
    } else if (fromType === 'music') {
      group = musicGroups[idx];
      setMusicGroups(prev => prev.filter((_, i) => i !== idx));
    } else if (fromType === 'staff') {
      group = staffGroups[idx];
      setStaffGroups(prev => prev.filter((_, i) => i !== idx));
    }

    if (toType === 'event') {
      setEventGroups(prev => [...prev, group]);
    } else if (toType === 'music') {
      setMusicGroups(prev => [...prev, group]);
    } else if (toType === 'staff') {
      setStaffGroups(prev => [...prev, group]);
    }
  };

  const commitToDB = async (dateKey, dayEvents, closeAfter = true) => {
    if (!isAdminAuthenticated) {
      alert("Ви повинні увійти в режим редагування, щоб зберігати зміни.");
      return;
    }
    if (!db) {
      alert("База даних не підключена. Перевірте налаштування Firebase.");
      return;
    }
    
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'calendar_events', dateKey), { events: dayEvents }, { merge: true });
      if (closeAfter) {
        setSelectedDayForEvent(null);
      }
      // Додамо коротке сповіщення в консоль або легкий фідбек
      console.log("Дані збережено в Firebase");
    } catch (err) {
      console.error("Error saving document: ", err);
      alert("Помилка збереження подій: " + err.message);
    }
  };

  const updateLocalDetails = (dateKey, index, field, value) => {
    setEvents(prev => prev.map(day => {
      if (day.id === dateKey) {
        const newEvents = [...day.events];
        const updatedEvent = { ...newEvents[index], [field]: value };
        if (field === 'title') {
          updatedEvent.textColor = getAutoColor(value);
        }
        newEvents[index] = updatedEvent;
        return { ...day, events: newEvents };
      }
      return day;
    }));
  };

  const addEventToDay = (dateKey) => {
    const dayData = events.find(e => e.id === dateKey) || { id: dateKey, events: [] };
    const newEvents = [...dayData.events, { title: "", startTime: "", endTime: "", place: "", leads: [""], music: "", textColor: textColors[0] || "#0077cc" }];
    setEvents(prev => {
        const existing = prev.find(d => d.id === dateKey);
        if (existing) return prev.map(d => d.id === dateKey ? { ...d, events: newEvents } : d);
        return [...prev, { id: dateKey, events: newEvents }];
    });
    setEditingEventIndex(newEvents.length - 1);
  };

  const handleAddItemToGroup = () => {
    if (!newItemName.trim() || !editingGroup) return;
    if (editingGroup.type === 'location') {
      setLocations(prev => [...prev, newItemName.trim()]);
      setEditingGroup(prev => ({...prev, items: [...prev.items, newItemName.trim()]}));
    } else {
      const updateFn = (groups) => groups.map(g => g.label === editingGroup.label ? { ...g, items: [...g.items, newItemName.trim()] } : g);
      if (editingGroup.type === 'event') { setEventGroups(updateFn); } 
      else if (editingGroup.type === 'music') { setMusicGroups(updateFn); } 
      else if (editingGroup.type === 'staff') { setStaffGroups(updateFn); }
      setEditingGroup(prev => ({...prev, items: [...prev.items, newItemName.trim()]}));
    }
    setNewItemName("");
  };

  const handleRemoveItemFromGroup = (itemToRemove) => {
    if (editingGroup.type === 'location') {
      setLocations(prev => prev.filter(i => i !== itemToRemove));
      setEditingGroup(prev => ({...prev, items: prev.items.filter(i => i !== itemToRemove)}));
    } else {
      const updateFn = (groups) => groups.map(g => g.label === editingGroup.label ? { ...g, items: g.items.filter(item => item !== itemToRemove) } : g);
      if (editingGroup.type === 'event') { setEventGroups(updateFn); } 
      else if (editingGroup.type === 'music') { setMusicGroups(updateFn); } 
      else if (editingGroup.type === 'staff') { setStaffGroups(updateFn); }
      setEditingGroup(prev => ({...prev, items: prev.items.filter(i => i !== itemToRemove)}));
    }
  };

  const handleRenameGroup = (oldLabel, newLabel) => {
    if (!newLabel.trim() || oldLabel === newLabel || editingGroup?.type === 'location') return;
    const updateFn = (groups) => groups.map(g => g.label === oldLabel ? { ...g, label: newLabel.trim() } : g);
    if (editingGroup.type === 'event') { setEventGroups(updateFn); } 
    else if (editingGroup.type === 'music') { setMusicGroups(updateFn); } 
    else if (editingGroup.type === 'staff') { setStaffGroups(updateFn); }
    setEditingGroup(prev => prev ? ({ ...prev, label: newLabel.trim() }) : null);
  };

  const handleRenameItemInGroup = (oldItem, newItem) => {
    if (!newItem.trim() || oldItem === newItem || !editingGroup) return;
    if (editingGroup.type === 'location') {
      setLocations(prev => prev.map(i => i === oldItem ? newItem.trim() : i));
      setEditingGroup(prev => prev ? ({ ...prev, items: prev.items.map(i => i === oldItem ? newItem.trim() : i) }) : null);
    } else {
      const updateFn = (groups) => groups.map(g => g.label === editingGroup.label ? { ...g, items: g.items.map(i => i === oldItem ? newItem.trim() : i) } : g);
      if (editingGroup.type === 'event') { setEventGroups(updateFn); } 
      else if (editingGroup.type === 'music') { setMusicGroups(updateFn); } 
      else if (editingGroup.type === 'staff') { setStaffGroups(updateFn); }
      setEditingGroup(prev => prev ? ({ ...prev, items: prev.items.map(i => i === oldItem ? newItem.trim() : i) }) : null);
    }
  };

  const formatDateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const visibleDays = (() => {
    const days = [];
    const checkIsToday = (d: Date) => d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();

    if (viewMode === 'day') {
      const d = new Date(selectedDate);
      days.push({
        day: d.getDate(),
        weekdayShort: SHORT_WEEKDAYS[d.getDay()],
        weekdayIndex: d.getDay(),
        monthName: d.toLocaleDateString('uk-UA', { month: 'short' }),
        dateKey: formatDateKey(d),
        isToday: checkIsToday(d)
      });
    } else if (viewMode === 'week') {
      const d = new Date(selectedDate);
      const currentRealMonth = today.getMonth();
      const currentRealYear = today.getFullYear();
      const day = d.getDay();
      const diff = d.getDate() - (day === 0 ? 6 : day - 1);
      const monday = new Date(d.setDate(diff));
      
      for (let i = 0; i < 7; i++) {
        const current = new Date(monday);
        current.setDate(monday.getDate() + i);
        days.push({
          day: current.getDate(),
          weekdayShort: SHORT_WEEKDAYS[current.getDay()],
          weekdayIndex: current.getDay(),
          monthName: current.toLocaleDateString('uk-UA', { month: 'short' }),
          dateKey: formatDateKey(current),
          isToday: checkIsToday(current),
          isOtherMonth: current.getMonth() !== currentRealMonth || current.getFullYear() !== currentRealYear
        });
      }
    } else {
      const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const lastDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      let current = new Date(firstDay);
      while (current <= lastDay) {
        const d = new Date(current);
        days.push({
          day: d.getDate(),
          weekdayShort: SHORT_WEEKDAYS[d.getDay()],
          weekdayIndex: d.getDay(),
          monthName: d.toLocaleDateString('uk-UA', { month: 'short' }),
          dateKey: formatDateKey(d),
          isToday: checkIsToday(d)
        });
        current.setDate(current.getDate() + 1);
      }
    }
    return days;
  })();

  const dayViewDates = (() => {
    const dates = [];
    const pivot = viewMode === 'day' ? dayViewPivotDate : selectedDate;
    for (let i = -3; i <= 3; i++) {
      const d = new Date(pivot);
      d.setDate(pivot.getDate() + i);
      dates.push(d);
    }
    return dates;
  })();

  const weekRangeLabel = (() => {
    const d = new Date(selectedDate);
    const day = d.getDay();
    const diff = d.getDate() - (day === 0 ? 6 : day - 1);
    const start = new Date(d.setDate(diff));
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const f = (d: Date) => d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: '2-digit' });
    return `${f(start)} - ${f(end)}`;
  })();

  const getFloatingDate = () => {
    if (activeTab === 'admin' && selectedDayForEvent) {
      const [year, month, day] = selectedDayForEvent.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    return today;
  };

  const floatingDate = getFloatingDate();
  const isEditingTarget = activeTab === 'admin' && selectedDayForEvent;
  const currentMonthKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`;
  const currentTheme = monthlyThemes[currentMonthKey] || "";

  const [showDiagnostics, setShowDiagnostics] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a1120] text-slate-200 p-4 font-sans pb-24 text-[10px]">
      {showDiagnostics && (
        <div className="fixed inset-0 z-[3000] bg-black/90 backdrop-blur-md p-6 flex items-center justify-center" onClick={() => setShowDiagnostics(false)}>
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-[32px] max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-black uppercase tracking-widest mb-4">Діагностика підключення</h3>
            <div className="space-y-3 text-[11px]">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Firebase App:</span>
                <span className={app ? "text-green-400" : "text-red-400"}>{app ? "Ініціалізовано" : "Помилка"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">База даних (Firestore):</span>
                <span className={db ? "text-green-400" : "text-red-400"}>{db ? "Підключено" : "Відсутня"}</span>
              </div>
              <div className="flex flex-col border-b border-slate-800 pb-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Авторизація:</span>
                  <span className={user ? "text-green-400" : "text-red-400"}>{user ? `Увійшли (ID: ${user.uid.slice(0,5)}...)` : "Не авторизовано"}</span>
                </div>
                {authError && <div className="text-[9px] text-red-500/80 mt-1 italic">Помилка: {authError}</div>}
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Режим адміна:</span>
                <span className={isAdminAuthenticated ? "text-blue-400" : "text-slate-600"}>{isAdminAuthenticated ? "УВІМКНЕНО" : "ВИМКНЕНО"}</span>
              </div>
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-300 text-[10px] leading-relaxed">
                Порада: Якщо "Авторизація" червона, увімкніть <b>Anonymous Auth</b> у Firebase Console. Якщо все зелене, але не зберігає — перевірте <b>Firestore Rules</b>.
              </div>
            </div>
            <button onClick={() => setShowDiagnostics(false)} className="w-full mt-6 bg-slate-800 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-slate-700 transition-colors">Закрити</button>
          </div>
        </div>
      )}
      <header className="max-w-7xl mx-auto flex flex-col items-center mb-6 gap-4">
        <div className="flex items-center justify-between w-full">
          <div 
            className="flex items-center gap-3 md:gap-4 cursor-pointer group" 
            onClick={() => setActiveTab('view')}
          >
             <div className="group-hover:scale-105 transition-transform">
               <div className="w-12 h-12 md:w-20 md:h-20 flex items-center justify-center overflow-hidden">
                 <svg viewBox="0 0 100 100" className="w-full h-full">
                   {/* Outer Circle */}
                   <circle cx="50" cy="50" r="47" fill="none" stroke="white" strokeWidth="3" />
                   {/* Church Silhouette */}
                   <path 
                     d="
                       M50 22 L50 28
                       M47 28 L53 28 L53 30 L47 30 Z
                       M50 30 L42 48 L58 48 Z
                       M42 48 L42 68 L58 68 L58 48 Z
                       M42 68 L28 78 L28 97 L72 97 L72 78 L58 68 Z
                     " 
                     fill="white" 
                   />
                   {/* Arched Doorway */}
                   <path d="M44 97 A6 6 0 0 1 56 97 L56 97 L44 97 Z" fill="#0a1120" />
                   {/* Round Window */}
                   <circle cx="50" cy="78" r="4.5" fill="#0a1120" />
                   {/* Cross */}
                   <path d="M50 12 L50 24 M46 16 L54 16" stroke="white" strokeWidth="2" strokeLinecap="round" />
                 </svg>
               </div>
             </div>
             <div>
               <h1 className="text-lg md:text-3xl lg:text-4xl font-black uppercase text-white leading-none tracking-tight group-hover:text-blue-400 transition-colors">КАЛЕНДАРНИЙ ПЛАН</h1>
               <span className="text-blue-500 text-[8px] md:text-[10px] lg:text-xs font-bold tracking-[0.2em] md:tracking-[0.4em] uppercase">УЦХВЄ м. Івано-Франківська</span>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <div 
              onClick={() => setShowDiagnostics(true)}
              className={`w-2 h-2 rounded-full cursor-pointer transition-transform hover:scale-150 ${db ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'} mr-1`} 
              title="Натисніть для діагностики"
            ></div>
            {activeTab === 'admin' && (
              <button 
                onClick={() => {
                  setThemeText(currentTheme || "");
                  setIsEditingTheme(true);
                }}
                className="p-2 bg-red-600/20 text-red-500 hover:bg-red-600/30 rounded-lg transition-all border border-red-500/30 flex items-center gap-2"
              >
                <Pencil size={14}/>
                <span className="text-[8px] font-black uppercase hidden md:inline">Текст місяця</span>
              </button>
            )}
            {activeTab === 'view' ? (
              <button 
                onClick={() => isAdminAuthenticated ? setActiveTab('admin') : setActiveTab('login')} 
                className="px-3 py-1.5 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white border border-slate-800/60 rounded-xl transition-all hover:bg-slate-800/40"
              >
                Редагування
              </button>
            ) : activeTab !== 'login' ? (
              <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 gap-1">
                <button 
                  onClick={() => setActiveTab('view')} 
                  className={`px-3 py-1.5 rounded-lg text-[9px] md:text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'view' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                >
                  Графік
                </button>
                <button 
                  onClick={() => setActiveTab('admin')} 
                  className={`px-3 py-1.5 rounded-lg text-[9px] md:text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'admin' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                >
                  Редактор
                </button>
                <button 
                  onClick={() => setActiveTab('lists')} 
                  className={`px-3 py-1.5 rounded-lg text-[9px] md:text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'lists' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                >
                  Списки
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Theme of the Month Display */}
        {(currentTheme || activeTab === 'admin') && (
          <div className="w-full max-w-4xl text-center px-4 py-2 bg-red-600/5 border-y border-red-600/10 backdrop-blur-sm relative group">
            <h2 className="text-red-600 font-black uppercase text-[10px] md:text-xs tracking-widest mb-1">ТЕКСТ МІСЯЦЯ:</h2>
            {currentTheme ? (
              <p className="text-red-500 font-bold text-xs md:text-lg lg:text-xl italic leading-relaxed">
                {currentTheme}
              </p>
            ) : activeTab === 'admin' && (
              <p className="text-red-500/40 font-bold text-[10px] italic">
                (Натисніть олівець вгорі, щоб додати текст місяця)
              </p>
            )}
          </div>
        )}

        {/* View Mode Selector */}
        {activeTab !== 'lists' && (
          <div className="flex items-center gap-2 mx-auto">
            <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
              <button onClick={() => setViewMode('day')} className={`px-4 py-1 rounded-md text-[9px] font-bold transition-all ${viewMode === 'day' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}>ДЕНЬ</button>
              <button onClick={() => setViewMode('week')} className={`px-4 py-1 rounded-md text-[9px] font-bold transition-all ${viewMode === 'week' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}>ТИЖДЕНЬ</button>
              <button onClick={() => setViewMode('month')} className={`px-4 py-1 rounded-md text-[9px] font-bold transition-all ${viewMode === 'month' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}>МІСЯЦЬ</button>
              <button onClick={() => setViewMode('year')} className={`px-4 py-1 rounded-md text-[9px] font-bold transition-all ${viewMode === 'year' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}>РІК</button>
            </div>
            
            {(viewMode === 'month' || viewMode === 'year') && (
              <button 
                onClick={() => window.print()}
                className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all flex items-center gap-2"
                title="Друк в PDF"
              >
                <Printer size={16} />
                <span className="text-[9px] font-bold uppercase hidden md:inline">Друк</span>
              </button>
            )}
          </div>
        )}

        {/* Dynamic Navigation Row */}
        {activeTab !== 'lists' && (
          <div className="w-full flex flex-col items-center gap-2">
          {viewMode === 'day' && (
            <div className="flex items-center justify-center gap-4 w-full max-w-md">
              <button 
                onClick={() => {
                  const d = new Date(dayViewPivotDate);
                  d.setDate(d.getDate() - 1);
                  setDayViewPivotDate(d);
                  setSelectedDate(new Date(d));
                }}
                className="p-1 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
              >
                <ChevronLeft size={20}/>
              </button>
              <div 
                className="flex items-center gap-2 cursor-ns-resize"
                onWheel={(e) => {
                  const d = new Date(dayViewPivotDate);
                  if (e.deltaY > 0) {
                    d.setDate(d.getDate() + 1);
                  } else {
                    d.setDate(d.getDate() - 1);
                  }
                  setDayViewPivotDate(d);
                  setSelectedDate(new Date(d));
                }}
              >
                {dayViewDates.map((d, i) => {
                  const isSelected = d.toDateString() === selectedDate.toDateString();
                  const isToday = d.toDateString() === today.toDateString();
                  return (
                    <button 
                      key={i}
                      onClick={() => setSelectedDate(new Date(d))}
                      className={`w-8 h-8 flex items-center justify-center rounded-full text-[11px] font-black transition-all ${isSelected ? 'bg-blue-600 text-white shadow-lg scale-110' : 'text-slate-400 hover:text-slate-200'} ${isToday && !isSelected ? 'ring-2 ring-blue-500' : ''}`}
                    >
                      {String(d.getDate()).padStart(2, '0')}
                    </button>
                  );
                })}
              </div>
              <button 
                onClick={() => {
                  const d = new Date(dayViewPivotDate);
                  d.setDate(d.getDate() + 1);
                  setDayViewPivotDate(d);
                  setSelectedDate(new Date(d));
                }}
                className="p-1 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
              >
                <ChevronRight size={20}/>
              </button>
            </div>
          )}

          {viewMode === 'week' && (
            <div className="flex items-center justify-center gap-6 w-full max-w-md">
              <button 
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() - 7);
                  setSelectedDate(d);
                }}
                className="p-1 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
              >
                <ChevronLeft size={20}/>
              </button>
              <div className="text-[11px] font-black text-white tracking-widest uppercase">
                {weekRangeLabel}
              </div>
              <button 
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() + 7);
                  setSelectedDate(d);
                }}
                className="p-1 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
              >
                <ChevronRight size={20}/>
              </button>
            </div>
          )}

          {viewMode === 'year' && (
            <div className="flex items-center justify-center gap-2 w-full">
              <div className="flex items-center bg-slate-800/50 px-4 py-1.5 rounded-xl border border-slate-700/50 backdrop-blur-sm gap-4">
                <button 
                  onClick={() => {
                    const d = new Date(selectedDate);
                    d.setFullYear(d.getFullYear() - 1);
                    setSelectedDate(d);
                  }}
                  className="text-blue-500 hover:text-blue-400 transition-colors"
                >
                  <ChevronLeft size={20}/>
                </button>
                <span className="text-[11px] font-black uppercase text-white tracking-wider min-w-[140px] text-center">
                  {selectedDate.getFullYear()} РІК
                </span>
                <button 
                  onClick={() => {
                    const d = new Date(selectedDate);
                    d.setFullYear(d.getFullYear() + 1);
                    setSelectedDate(d);
                  }}
                  className="text-blue-500 hover:text-blue-400 transition-colors"
                >
                  <ChevronRight size={20}/>
                </button>
              </div>
            </div>
          )}

          {viewMode === 'month' && (
            <div className="flex items-center justify-center gap-2 w-full">
              <div className="flex items-center bg-slate-800/50 px-4 py-1.5 rounded-xl border border-slate-700/50 backdrop-blur-sm gap-4">
                <button 
                  onClick={() => {
                    const d = new Date(selectedDate);
                    if (viewMode === 'month') d.setMonth(d.getMonth() - 1);
                    else if (viewMode === 'week') d.setDate(d.getDate() - 7);
                    else d.setDate(d.getDate() - 1);
                    setSelectedDate(d);
                  }}
                  className="text-blue-500 hover:text-blue-400 transition-colors"
                >
                  <ChevronLeft size={20}/>
                </button>
                <span className="text-[11px] font-black uppercase text-white tracking-wider min-w-[140px] text-center">
                  {selectedDate.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' })}
                </span>
                <button 
                  onClick={() => {
                    const d = new Date(selectedDate);
                    if (viewMode === 'month') d.setMonth(d.getMonth() + 1);
                    else if (viewMode === 'week') d.setDate(d.getDate() + 7);
                    else d.setDate(d.getDate() + 1);
                    setSelectedDate(d);
                  }}
                  className="text-blue-500 hover:text-blue-400 transition-colors"
                >
                  <ChevronRight size={20}/>
                </button>
              </div>
            </div>
          )}
        </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto print:max-w-none print:mx-0">
        {activeTab === 'lists' && (
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
              <h2 className="text-white text-lg font-black uppercase mb-2">Кольори подій</h2>
              <p className="text-slate-400 text-xs mb-4">Палітра кольорів для виділення подій.</p>
              <div className="flex flex-wrap gap-2 items-center">
                {textColors.map((c, idx) => (
                  <div key={idx} className="relative group">
                    <div className="w-6 h-6 rounded-full border border-slate-600" style={{ backgroundColor: c }} />
                    <button onClick={() => setTextColors(prev => prev.filter((_, i) => i !== idx))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X size={10}/></button>
                  </div>
                ))}
                <label className="w-6 h-6 rounded-full border border-dashed border-slate-500 flex items-center justify-center cursor-pointer hover:border-white transition-colors">
                  <Plus size={12} className="text-slate-400" />
                  <input type="color" className="opacity-0 absolute w-0 h-0" onChange={(e) => setTextColors(prev => [...prev, e.target.value])} />
                </label>
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-white text-lg font-black uppercase mb-1">Поле "Подія"</h2>
                  <p className="text-slate-400 text-xs">Ці списки використовуються для вибору назви події.</p>
                </div>
                <button 
                  onClick={() => setEventGroups(prev => [...prev, { label: "НОВА КАТЕГОРІЯ", items: [] }])}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase rounded-lg transition-all"
                >
                  <Plus size={14} /> Категорія
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {eventGroups.map((g, idx) => (
                  <div key={idx} className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-blue-400 font-bold text-sm uppercase leading-tight">{g.label}</h3>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEventGroups(prev => { const arr = [...prev]; if (idx > 0) [arr[idx-1], arr[idx]] = [arr[idx], arr[idx-1]]; return arr; })} disabled={idx === 0} className="text-slate-500 hover:text-white disabled:opacity-30"><ChevronUp size={14}/></button>
                        <button onClick={() => setEventGroups(prev => { const arr = [...prev]; if (idx < arr.length - 1) [arr[idx+1], arr[idx]] = [arr[idx], arr[idx+1]]; return arr; })} disabled={idx === eventGroups.length - 1} className="text-slate-500 hover:text-white disabled:opacity-30"><ChevronDown size={14}/></button>
                        <div className="h-4 w-[1px] bg-slate-700 mx-1" />
                        <button onClick={() => moveGroup(idx, 'event', 'music')} className="text-slate-500 hover:text-blue-400" title="Перемістити в Музику"><Music size={12}/></button>
                        <button onClick={() => moveGroup(idx, 'event', 'staff')} className="text-slate-500 hover:text-blue-400" title="Перемістити в Служителі"><Users size={12}/></button>
                        <div className="h-4 w-[1px] bg-slate-700 mx-1" />
                        <button onClick={() => setEditingGroup({...g, type: 'event'})} className="text-slate-500 hover:text-white ml-1"><Pencil size={14}/></button>
                        <button 
                          onClick={() => {
                            if (window.confirm(`Видалити категорію "${g.label}"?`)) {
                              setEventGroups(prev => prev.filter((_, i) => i !== idx));
                            }
                          }} 
                          className="text-slate-500 hover:text-red-500 ml-1"
                        >
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {sortAlphabetically(g.items).map(item => (
                        <span key={item} className="bg-slate-900 text-slate-300 text-[9px] px-2 py-1 rounded border border-slate-700">{item}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-white text-lg font-black uppercase mb-1">Поле "Музика"</h2>
                  <p className="text-slate-400 text-xs">Ці списки використовуються для вибору музичного супроводу.</p>
                </div>
                <button 
                  onClick={() => setMusicGroups(prev => [...prev, { label: "НОВА КАТЕГОРІЯ", items: [] }])}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase rounded-lg transition-all"
                >
                  <Plus size={14} /> Категорія
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {musicGroups.map((g, idx) => (
                  <div key={idx} className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-blue-400 font-bold text-sm uppercase leading-tight">{g.label}</h3>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setMusicGroups(prev => { const arr = [...prev]; if (idx > 0) [arr[idx-1], arr[idx]] = [arr[idx], arr[idx-1]]; return arr; })} disabled={idx === 0} className="text-slate-500 hover:text-white disabled:opacity-30"><ChevronUp size={14}/></button>
                        <button onClick={() => setMusicGroups(prev => { const arr = [...prev]; if (idx < arr.length - 1) [arr[idx+1], arr[idx]] = [arr[idx], arr[idx+1]]; return arr; })} disabled={idx === musicGroups.length - 1} className="text-slate-500 hover:text-white disabled:opacity-30"><ChevronDown size={14}/></button>
                        <div className="h-4 w-[1px] bg-slate-700 mx-1" />
                        <button onClick={() => moveGroup(idx, 'music', 'event')} className="text-slate-500 hover:text-blue-400" title="Перемістити в Події"><Calendar size={12}/></button>
                        <button onClick={() => moveGroup(idx, 'music', 'staff')} className="text-slate-500 hover:text-blue-400" title="Перемістити в Служителі"><Users size={12}/></button>
                        <div className="h-4 w-[1px] bg-slate-700 mx-1" />
                        <button onClick={() => setEditingGroup({...g, type: 'music'})} className="text-slate-500 hover:text-white ml-1"><Pencil size={14}/></button>
                        <button 
                          onClick={() => {
                            if (window.confirm(`Видалити категорію "${g.label}"?`)) {
                              setMusicGroups(prev => prev.filter((_, i) => i !== idx));
                            }
                          }} 
                          className="text-slate-500 hover:text-red-500 ml-1"
                        >
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {sortAlphabetically(g.items).map(item => (
                        <span key={item} className="bg-slate-900 text-slate-300 text-[9px] px-2 py-1 rounded border border-slate-700">{item}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-white text-lg font-black uppercase mb-1">Поле "Служителі (Хто)"</h2>
                  <p className="text-slate-400 text-xs">Ці списки використовуються для призначення відповідальних осіб та служителів.</p>
                </div>
                <button 
                  onClick={() => setStaffGroups(prev => [...prev, { label: "НОВА КАТЕГОРІЯ", items: [] }])}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase rounded-lg transition-all"
                >
                  <Plus size={14} /> Категорія
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {staffGroups.map((g, idx) => (
                  <div key={idx} className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-blue-400 font-bold text-sm uppercase leading-tight">{g.label}</h3>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setStaffGroups(prev => { const arr = [...prev]; if (idx > 0) [arr[idx-1], arr[idx]] = [arr[idx], arr[idx-1]]; return arr; })} disabled={idx === 0} className="text-slate-500 hover:text-white disabled:opacity-30"><ChevronUp size={14}/></button>
                        <button onClick={() => setStaffGroups(prev => { const arr = [...prev]; if (idx < arr.length - 1) [arr[idx+1], arr[idx]] = [arr[idx], arr[idx+1]]; return arr; })} disabled={idx === staffGroups.length - 1} className="text-slate-500 hover:text-white disabled:opacity-30"><ChevronDown size={14}/></button>
                        <div className="h-4 w-[1px] bg-slate-700 mx-1" />
                        <button onClick={() => moveGroup(idx, 'staff', 'event')} className="text-slate-500 hover:text-blue-400" title="Перемістити в Події"><Calendar size={12}/></button>
                        <button onClick={() => moveGroup(idx, 'staff', 'music')} className="text-slate-500 hover:text-blue-400" title="Перемістити в Музику"><Music size={12}/></button>
                        <div className="h-4 w-[1px] bg-slate-700 mx-1" />
                        <button onClick={() => setStaffGroups(prev => { const arr = [...prev]; if (idx < arr.length - 1) [arr[idx+1], arr[idx]] = [arr[idx], arr[idx+1]]; return arr; })} disabled={idx === staffGroups.length - 1} className="text-slate-500 hover:text-white disabled:opacity-30"><ChevronDown size={14}/></button>
                        <button onClick={() => setEditingGroup({...g, type: 'staff'})} className="text-slate-500 hover:text-white ml-1"><Pencil size={14}/></button>
                        <button 
                          onClick={() => {
                            if (window.confirm(`Видалити категорію "${g.label}"?`)) {
                              setStaffGroups(prev => prev.filter((_, i) => i !== idx));
                            }
                          }} 
                          className="text-slate-500 hover:text-red-500 ml-1"
                        >
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {sortAlphabetically(g.items).map(item => (
                        <span key={item} className="bg-slate-900 text-slate-300 text-[9px] px-2 py-1 rounded border border-slate-700">{item}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-blue-400 font-bold text-sm uppercase leading-tight">Локації</h3>
                <button onClick={() => setEditingGroup({ label: 'ЛОКАЦІЇ', items: locations, type: 'location' })} className="text-slate-500 hover:text-white"><Pencil size={14}/></button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sortAlphabetically(locations).map(item => (
                  <span key={item} className="bg-slate-900 text-slate-300 text-[9px] px-2 py-1 rounded border border-slate-700">{item}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'view' || activeTab === 'admin') && activeTab !== 'login' && (
          <div className={`
            ${viewMode === 'month' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 print:grid-cols-1 print:gap-0' : ''}
            ${viewMode === 'week' ? 'flex flex-col gap-3 max-w-2xl mx-auto' : ''}
            ${viewMode === 'day' ? 'flex flex-col gap-3 max-w-2xl mx-auto' : ''}
            ${viewMode === 'year' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-1 print:gap-0' : ''}
          `}>
            {viewMode === 'year' ? (
              Array.from({ length: 12 }).map((_, monthIdx) => {
                const monthDate = new Date(selectedDate.getFullYear(), monthIdx, 1);
                const firstDay = new Date(selectedDate.getFullYear(), monthIdx, 1);
                const lastDay = new Date(selectedDate.getFullYear(), monthIdx + 1, 0);
                const monthDays = [];
                let curr = new Date(firstDay);
                while (curr <= lastDay) {
                  monthDays.push(new Date(curr));
                  curr.setDate(curr.getDate() + 1);
                }

                const monthKey = `${selectedDate.getFullYear()}-${String(monthIdx + 1).padStart(2, '0')}`;
                const monthTheme = monthlyThemes[monthKey];

                return (
                  <div key={monthIdx} className={`bg-slate-900/40 rounded-2xl p-4 border border-slate-800/50 print:bg-white print:border-none print:p-0 ${monthIdx === 6 ? 'print:page-break-before' : ''}`}>
                    <div className="flex justify-between items-start border-b border-slate-800 pb-2 mb-4 print:text-black print:border-black/10">
                      <h3 className="text-white font-black uppercase text-xs tracking-widest print:text-black">
                        {monthDate.toLocaleDateString('uk-UA', { month: 'long' })}
                      </h3>
                      {activeTab === 'admin' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDate(new Date(selectedDate.getFullYear(), monthIdx, 1));
                            setThemeText(monthTheme || "");
                            setIsEditingTheme(true);
                          }}
                          className="p-1 text-slate-500 hover:text-blue-400 transition-colors"
                        >
                          <Pencil size={10} />
                        </button>
                      )}
                    </div>
                    
                    {monthTheme && (
                      <div className="mb-4 px-2 py-1 bg-red-600/5 border-l-2 border-red-600/30">
                        <p className="text-red-500/80 text-[9px] italic leading-tight font-medium">
                          {monthTheme}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-col gap-2">
                      {monthDays.map((d) => {
                        const dateKey = formatDateKey(d);
                        const dayData = events.find(e => e.id === dateKey);
                        if (!dayData || dayData.events.length === 0) return null;
                        
                        return (
                          <div key={dateKey} className="flex gap-2 items-start">
                            <div className="w-6 shrink-0 text-[10px] font-black text-slate-500">{d.getDate()}</div>
                            <div className="flex-1 flex flex-col gap-1">
                              {dayData.events.map((ev, i) => {
                                const isCleaning = ev.title?.toUpperCase().includes('ПРИБИРАННЯ');
                                return (
                                  <div key={i} className="text-[9px] font-bold leading-tight flex gap-1 items-baseline">
                                    <span className="shrink-0 text-slate-500">{ev.startTime}</span>
                                    <span className={`px-1 rounded ${isCleaning ? 'bg-slate-400' : ''}`} style={{ color: ev.textColor }}>
                                      {ev.title}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            ) : visibleDays.map((d, index) => {
              const dayData = events.find(e => e.id === d.dateKey);
              const dayEvents = (dayData?.events || []).sort((a, b) => (a.startTime || "99:99").localeCompare(b.startTime || "99:99"));
              
              return (
                <div 
                  key={d.dateKey} 
                  onClick={() => {
                    setSelectedDate(new Date(d.dateKey));
                    if (viewMode === 'day') setDayViewPivotDate(new Date(d.dateKey));
                  }}
                  onDoubleClick={() => {
                    setSelectedDate(new Date(d.dateKey));
                    setDayViewPivotDate(new Date(d.dateKey));
                    setViewMode('day');
                  }}
                  className={`relative flex flex-row overflow-hidden border-[9px] bg-white shadow-sm transition-all cursor-pointer min-h-[100px] rounded-xl ${d.isToday ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#0a1120]' : 'hover:scale-[1.01]'} ${d.dateKey === formatDateKey(selectedDate) ? 'ring-2 ring-blue-400/50 z-10' : ''} ${d.isOtherMonth && activeTab === 'view' ? 'opacity-60 grayscale-[0.4]' : ''} ${viewMode === 'month' && index > 0 && index % 7 === 0 ? 'print:page-break-before' : ''}`} 
                  style={{ borderColor: (d.isOtherMonth && activeTab === 'view') ? '#f1f5f9' : BORDER_COLORS[d.weekdayIndex] }}
                >
                  {/* Left Column: Date & Day */}
                  <div className={`${viewMode === 'month' ? 'w-9' : 'w-12'} shrink-0 flex flex-col items-center pt-2.5 border-r border-black/5`}>
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${d.isToday ? 'bg-blue-600 text-white shadow-md' : ''}`}>
                      <span className={`text-xl font-black leading-none ${d.isToday ? 'text-white' : 'text-slate-900'}`}>
                        {String(d.day).padStart(2, '0')}
                      </span>
                    </div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter mt-1">{SHORT_WEEKDAYS[d.weekdayIndex]}</span>
                    {viewMode !== 'month' && (
                       <span className="text-[8px] font-bold text-slate-400 uppercase mt-auto pb-3">{d.monthName}</span>
                    )}
                  </div>

                  {activeTab === 'admin' && (
                    <button 
                      onClick={() => setSelectedDayForEvent(d.dateKey)} 
                      className="absolute top-2 right-2 z-10 px-2 py-1 text-[7px] font-black uppercase transition-all shadow-sm bg-black/10 text-black/60 hover:bg-black/20 rounded-md"
                    >
                      Змінити
                    </button>
                  )}

                  {/* Right Column: Events */}
                  <div className="flex-1 divide-y divide-black/5 min-h-[40px] overflow-y-auto">
                    {dayEvents.length > 0 ? dayEvents.map((ev, i) => {
                      const isCleaning = ev.title?.toUpperCase().includes('ПРИБИРАННЯ');
                      return (
                        <div key={i} className="py-3 space-y-1.5">
                          {/* Row 1: Place + Time */}
                          <div className="flex flex-row flex-wrap gap-2 items-center px-3">
                            {ev.place && (
                              <div className="text-slate-500 font-bold flex items-center gap-1 bg-white/50 px-1.5 py-0.5 text-[8px] rounded truncate">
                                <MapPin size={8}/> {ev.place}
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-[8px] font-bold text-slate-600 bg-black/5 px-1.5 py-0.5 rounded">
                              <Clock size={9} className="text-blue-500"/> {ev.startTime}{ev.endTime ? ` - ${ev.endTime}` : ''}
                            </div>
                          </div>

                          {/* Row 2: Event Title */}
                          <div className={`px-3 py-1 ${isCleaning ? 'bg-slate-300' : ''}`}>
                            <div className={`${viewMode === 'month' ? 'text-[9px]' : 'text-[11px]'} font-black uppercase leading-tight`} style={{ color: ev.textColor }}>
                              {ev.title}
                            </div>
                          </div>

                          {/* Row 3: Participants */}
                          {ev.leads?.some(l => l) && (
                            <div className="text-[#003366] font-extrabold truncate text-[8px] px-3">
                              ● {ev.leads.filter(l => l).join(', ')}
                            </div>
                          )}

                          {/* Row 4: Music */}
                          {ev.music && (
                            <div className="text-slate-400 italic text-[8px] px-3">
                              ♫ {ev.music}
                            </div>
                          )}
                        </div>
                      );
                    }) : (
                      <div className="h-full flex items-center justify-center p-4 text-[8px] uppercase font-black text-black/10 tracking-widest italic">Порожньо</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'login' && (
          <div className="max-w-xs mx-auto py-16 text-center">
            <div className="bg-slate-800 p-6 rounded-[32px] border border-slate-700 shadow-2xl">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-600/20"><Lock size={24} className="text-white"/></div>
              <h2 className="text-white text-base font-black uppercase mb-4 tracking-widest">Пароль</h2>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••" className="w-full bg-slate-900 p-3 rounded-xl mb-4 text-center text-white text-lg font-black border border-slate-700 outline-none focus:border-blue-500 transition-colors" />
              <button onClick={() => password === (initialAuthToken || '2026') ? (setIsAdminAuthenticated(true), setActiveTab('admin')) : alert('Невірний пароль')} className="w-full bg-blue-600 p-3 rounded-xl font-black text-[10px] text-white uppercase tracking-widest hover:bg-blue-500 transition-colors">Ввійти</button>
            </div>
          </div>
        )}
      </main>

      {/* Theme Editor Modal */}
      {isEditingTheme && createPortal(
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setIsEditingTheme(false)}>
          <div className="bg-slate-900 w-full max-w-2xl rounded-[32px] border border-slate-800 shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div>
                <h3 className="text-white font-black uppercase text-xs tracking-widest">ТЕКСТ МІСЯЦЯ</h3>
                <p className="text-slate-500 text-[10px] font-bold">{selectedDate.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' })}</p>
              </div>
              <button onClick={() => setIsEditingTheme(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400"><X size={20}/></button>
            </div>
            <div className="p-6">
              <textarea 
                autoFocus
                value={themeText} 
                onChange={(e) => setThemeText(e.target.value)}
                placeholder="Введіть текст місяця або цитату з Біблії..."
                className="w-full h-48 bg-white border border-slate-300 rounded-2xl p-4 text-slate-900 text-sm md:text-base font-medium outline-none focus:border-red-500/50 transition-colors resize-none shadow-inner"
              />
              <div className="mt-6 flex gap-3">
                <button 
                  onClick={() => setIsEditingTheme(false)}
                  className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                >
                  Скасувати
                </button>
                <button 
                  onClick={() => saveTheme(currentMonthKey, themeText)}
                  className="flex-[2] py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-red-600 text-white shadow-lg shadow-red-600/20 hover:bg-red-500 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={16}/> Зберегти текст
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal for editing day events */}
      {isEditingTarget && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-sm rounded-[24px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-4 py-3 border-b border-slate-700 flex justify-between items-center bg-slate-900">
               <div className="flex flex-col">
                  <span className="text-blue-500 text-[9px] font-bold uppercase tracking-widest leading-none">Редагування дня</span>
                  <h3 className="text-white text-lg font-semibold leading-tight capitalize">
                    {floatingDate.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', weekday: 'short' })}
                  </h3>
               </div>
               <button onClick={() => setSelectedDayForEvent(null)} className="text-slate-500 hover:text-white transition-colors p-1"><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-800/50">
              {(() => {
                const dayData = events.find(e => e.id === selectedDayForEvent) || { id: selectedDayForEvent, events: [] };
                return (
                  <>
                    {dayData.events.map((ev, i) => {
                      const isEditing = editingEventIndex === i;
                      
                      if (!isEditing) {
                        return (
                          <div key={i} className="relative group">
                            <div 
                              className="flex flex-col overflow-hidden border-[2px] shadow-md rounded-xl bg-white/90 p-2 space-y-1"
                              style={{ borderColor: ev.textColor || '#cbd5e1' }}
                            >
                              {/* Row 1: Place + Time */}
                              <div className="flex justify-between items-center gap-2">
                                <div className="flex flex-row flex-wrap gap-1.5 items-center">
                                  {ev.place && (
                                    <div className="text-slate-500 font-bold flex items-center gap-1 bg-white/50 px-1 text-[7px] truncate">
                                      <MapPin size={7}/> {ev.place}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1 text-[7px] font-bold text-slate-600 bg-black/5 px-1 py-0.5">
                                    <Clock size={8} className="text-blue-500"/> {ev.startTime}{ev.endTime ? ` - ${ev.endTime}` : ''}
                                  </div>
                                </div>
                                <div className="flex gap-1 ml-auto">
                                    <button 
                                      onClick={() => setEditingEventIndex(i)}
                                      className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    >
                                      <Pencil size={12}/>
                                    </button>
                                    <button 
                                      onClick={() => {
                                        const updated = dayData.events.filter((_, idx) => idx !== i);
                                        setEvents(prev => prev.map(d => d.id === selectedDayForEvent ? { ...d, events: updated } : d));
                                        commitToDB(selectedDayForEvent, updated, false);
                                      }}
                                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                    >
                                      <Trash2 size={12}/>
                                    </button>
                                </div>
                              </div>

                              {/* Row 2: Event Title */}
                              <div className="text-[9px] font-black uppercase leading-tight" style={{ color: ev.textColor }}>
                                {ev.title || 'Без назви'}
                              </div>

                              {/* Row 3: Participants */}
                              {ev.leads?.some(l => l) && (
                                <div className="text-[#003366] font-extrabold truncate text-[7px]">
                                  ● {ev.leads.filter(l => l).join(', ')}
                                </div>
                              )}

                              {/* Row 4: Music */}
                              {ev.music && (
                                <div className="text-slate-400 italic text-[7px]">
                                  ♫ {ev.music}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={i} className="p-3 rounded-xl border border-black/20 relative space-y-2 shadow-lg bg-[#7c8f9b]">
                          <button 
                            onClick={() => {
                              const updated = dayData.events.filter((_, idx) => idx !== i);
                              setEvents(prev => prev.map(d => d.id === selectedDayForEvent ? { ...d, events: updated } : d));
                              setEditingEventIndex(null);
                            }} 
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:scale-110 transition-transform z-10"
                          >
                            <Trash2 size={12}/>
                          </button>
                          
                          <div className="flex gap-1.5 items-center justify-center pb-1.5 border-b border-black/10">
                               {textColors.map(c => (
                                 <button 
                                   key={c} 
                                   onClick={() => updateLocalDetails(selectedDayForEvent, i, 'textColor', c)} 
                                   className={`w-4 h-4 rounded-full transition-all ${ev.textColor?.toLowerCase() === c.toLowerCase() ? 'scale-125 ring-2 ring-offset-2 ring-blue-400' : 'hover:scale-110'}`} 
                                   style={{ backgroundColor: c }} 
                                 />
                               ))}
                          </div>

                          <div className="flex flex-col gap-2">
                             <div className="space-y-0.5">
                                <label className="text-[8px] font-black text-white uppercase ml-0.5">Подія</label>
                                <CustomSelect 
                                  title="ПОДІЯ"
                                  value={ev.title} 
                                  groups={eventGroups} 
                                  onEditGroup={(g) => setEditingGroup({...g, type: 'event'})}
                                  onChange={(v) => updateLocalDetails(selectedDayForEvent, i, 'title', v)} 
                                  placeholder="..." 
                                  className="w-full"
                                />
                             </div>
                             <div className="space-y-0.5">
                                <label className="text-[8px] font-black text-white uppercase ml-0.5">Місце</label>
                                <CustomSelect title="МІСЦЕ" value={ev.place} options={locations} onChange={(v) => updateLocalDetails(selectedDayForEvent, i, 'place', v)} placeholder="..." className="w-full" />
                             </div>
                             <div className="space-y-0.5">
                                <label className="text-[8px] font-black text-white uppercase ml-0.5">Час</label>
                                <div className="flex gap-2 w-full">
                                  <div className="text-white flex-1"><TimeInput label="" value={ev.startTime} onChange={(v) => updateLocalDetails(selectedDayForEvent, i, 'startTime', v)} /></div>
                                  <span className="text-white/50 font-bold self-center">-</span>
                                  <div className="text-white flex-1"><TimeInput label="" value={ev.endTime} onChange={(v) => updateLocalDetails(selectedDayForEvent, i, 'endTime', v)} /></div>
                                </div>
                             </div>
                          </div>

                          {!ev.title?.toUpperCase().includes('ПРИБИРАННЯ') && (
                            <>
                              <div className="space-y-1 pt-1.5 border-t border-black/10">
                                 <label className="text-[8px] font-black text-white uppercase ml-0.5">Служителі (Хто)</label>
                                 <div className="flex flex-col gap-2">
                                   {ev.leads?.map((l, lIdx) => (
                                     <div key={lIdx} className="flex gap-1 items-center w-full">
                                        <CustomSelect title="СЛУЖІННЯ" value={l} groups={staffGroups.filter(g => g.label !== "Хто співає / грає")} onEditGroup={(g) => setEditingGroup({...g, type: 'staff'})} onChange={(v) => { const nL = [...ev.leads]; nL[lIdx] = v; updateLocalDetails(selectedDayForEvent, i, 'leads', nL); }} placeholder="Хто..." className="w-full" />
                                        {ev.leads.length > 1 && <button onClick={() => updateLocalDetails(selectedDayForEvent, i, 'leads', ev.leads.filter((_, idx) => idx !== lIdx))} className="text-red-200 p-0.5 hover:text-white"><X size={14}/></button>}
                                     </div>
                                   ))}
                                   <button onClick={() => updateLocalDetails(selectedDayForEvent, i, 'leads', [...(ev.leads || []), ""])} className="text-[9px] text-white/80 font-black hover:text-white ml-0.5 tracking-wide flex items-center gap-1 h-6"><Plus size={10}/> Додати</button>
                                 </div>
                              </div>

                              <div className="space-y-0.5">
                                 <label className="text-[8px] font-black text-white uppercase ml-0.5">Музика</label>
                                 <CustomSelect title="МУЗИКА" value={ev.music} groups={musicGroups} onEditGroup={(g) => setEditingGroup({...g, type: 'music'})} onChange={(v) => updateLocalDetails(selectedDayForEvent, i, 'music', v)} placeholder="..." className="w-full" />
                              </div>
                            </>
                          )}

                          <button 
                            onClick={() => {
                              commitToDB(selectedDayForEvent, dayData.events, false);
                              setEditingEventIndex(null);
                            }} 
                            className="w-full bg-slate-900 text-white py-1.5 text-[8px] font-black uppercase flex items-center justify-center gap-1.5 mt-1 hover:bg-black transition-colors active:scale-[0.98] shadow-md"
                          >
                            <Save size={12}/> Зберегти зміни
                          </button>
                        </div>
                      );
                    })}
                  </>
                );
              })()}
              
              <button 
                onClick={() => addEventToDay(selectedDayForEvent)} 
                className="w-full border-2 border-dashed border-slate-600 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 tracking-wider text-slate-400 hover:bg-slate-700/50 hover:text-white hover:border-slate-500"
              >
                <Plus size={14}/> ДОДАТИ ПОДІЮ
              </button>
            </div>

            <div className="p-4 bg-slate-900 border-t border-slate-700 flex gap-3">
               <button 
                 onClick={() => setSelectedDayForEvent(null)} 
                 className="flex-1 bg-slate-800 text-slate-300 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-slate-700 transition-colors"
               >
                 Скасувати
               </button>
               <button 
                 onClick={async () => {
                   const dayData = events.find(e => e.id === selectedDayForEvent);
                   if (dayData) {
                     await commitToDB(selectedDayForEvent, dayData.events, false);
                   }
                   setSelectedDayForEvent(null);
                 }} 
                 className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20"
               >
                 <Save size={14}/> ЗБЕРЕГТИ ЗМІНИ
               </button>
            </div>
          </div>
        </div>
      )}

      {editingGroup && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-[340px] rounded-[24px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-4 py-3 border-b border-slate-700 flex justify-between items-center">
               <div className="flex flex-col w-full pr-4">
                  <span className="text-blue-500 text-[7px] font-bold uppercase tracking-widest leading-none mb-1">Редагування категорії</span>
                  <input 
                    type="text" 
                    defaultValue={editingGroup.label} 
                    onBlur={(e) => handleRenameGroup(editingGroup.label, e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                    className="bg-transparent border-b border-transparent hover:border-slate-600 focus:border-blue-500 text-white text-[11px] font-black uppercase tracking-tight leading-tight outline-none w-full transition-colors"
                    spellCheck={false} autoCorrect="off" autoComplete="off" autoCapitalize="off"
                  />
               </div>
               <button onClick={() => setEditingGroup(null)} className="text-slate-500 hover:text-white transition-colors p-1 shrink-0"><X size={16}/></button>
            </div>
            <div className="flex-1 overflow-y-auto bg-slate-900/40 p-1.5">
               <div className="grid grid-cols-1 gap-0.5">
                 {sortAlphabetically(editingGroup.items).map((item) => (
                   <div key={item} className="flex items-center justify-between bg-slate-800/40 hover:bg-slate-800 px-2 py-0.5 rounded transition-all group">
                      <input 
                        type="text" 
                        defaultValue={item} 
                        onBlur={(e) => handleRenameItemInGroup(item, e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                        className="bg-transparent border-b border-transparent hover:border-slate-600 focus:border-blue-500 text-white text-[8px] font-bold truncate outline-none w-full mr-2 transition-colors"
                        spellCheck={false} autoCorrect="off" autoComplete="off" autoCapitalize="off"
                      />
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleRemoveItemFromGroup(item)} className="text-slate-600 hover:text-red-400 p-0.5 shrink-0"><Trash2 size={10} /></button>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
            <div className="p-3 bg-slate-800 border-t border-slate-700">
               <div className="flex gap-2 mb-3">
                 <input autoFocus type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddItemToGroup()} placeholder="Новий запис..." className="flex-1 bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-white text-[9px] font-bold outline-none focus:border-blue-500 transition-all" spellCheck={false} autoCorrect="off" autoComplete="off" autoCapitalize="off" />
                 <button onClick={handleAddItemToGroup} className="bg-blue-600 text-white px-3 rounded-md text-[8px] font-black uppercase"><Plus size={12}/></button>
               </div>
               <button onClick={() => setEditingGroup(null)} className="w-full bg-slate-700/50 text-slate-300 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-slate-700 transition-colors">Закрити</button>
            </div>
          </div>
        </div>
      )}

      {(activeTab === 'admin') && (
        <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl border shadow-2xl flex items-center gap-3 z-[100] transition-all duration-300 ${
          isEditingTarget ? 'bg-blue-600 border-blue-400 ring-4 ring-blue-500/10' : 'bg-slate-900/95 backdrop-blur-md border-slate-700/50'
        }`}>
          <div className={`flex flex-col items-center leading-none pr-3 border-r ${isEditingTarget ? 'border-white/20' : 'border-slate-700'}`}>
             <span className={`${isEditingTarget ? 'text-blue-100' : 'text-blue-500'} text-[7px] font-black uppercase mb-0.5 tracking-tighter`}>{SHORT_WEEKDAYS[floatingDate.getDay()]}</span>
             <span className="text-white text-base font-black leading-none">{floatingDate.getDate()}</span>
          </div>
          <div className="flex flex-col leading-tight">
             <span className={`${isEditingTarget ? 'text-blue-200' : 'text-slate-500'} text-[7px] font-black uppercase tracking-widest mb-0.5`}>{isEditingTarget ? 'РЕДАКТОР' : 'СЬОГОДНІ'}</span>
             <span className="text-white text-[10px] font-black uppercase tracking-tight">{floatingDate.toLocaleDateString('uk-UA', { month: 'short', year: 'numeric' })}</span>
          </div>
        </div>
      )}
    </div>
  );
}
