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
  setDoc,
  deleteDoc,
  getDoc 
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
  Copy,
  Pencil,
  Music,
  Users,
  Church,
  Printer,
  Download,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Type,
  Settings,
  Minus,
  Pin
} from 'lucide-react';
import { PreacherAssignment } from './components/PreacherAssignment';

const SettingsModal = ({ appSettings, setAppSettings, setIsEditingSettings, handleSaveSettings, ColorPicker, X }: any) => {
  const [activeTab, setActiveTab] = useState<'name' | 'appearance' | 'access' | 'fields'>('name');
  const ALL_FIELDS = [
    { id: 'startTime', label: 'Час початку' },
    { id: 'endTime', label: 'Час закінчення' },
    { id: 'place', label: 'Місце' },
    { id: 'leads', label: 'Служителі' },
    { id: 'music', label: 'Музика' },
    { id: 'formatting', label: 'Форматування' },
    { id: 'colors', label: 'Кольори' }
  ];

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setIsEditingSettings(false)}>
      <div className="bg-slate-900 w-full max-w-sm rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
        <div className="px-4 py-3 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 shrink-0">
          <h3 className="text-white font-black uppercase text-[10px] tracking-widest">НАЛАШТУВАННЯ</h3>
          <button onClick={() => setIsEditingSettings(false)} className="text-slate-500 hover:text-white transition-colors p-1"><X size={16}/></button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-slate-800 shrink-0">
          <button onClick={() => setActiveTab('name')} className={`flex-1 py-2 text-[8px] font-black uppercase tracking-widest ${activeTab === 'name' ? 'text-white border-b-2 border-blue-500' : 'text-slate-500'}`}>Назва</button>
          <button onClick={() => setActiveTab('appearance')} className={`flex-1 py-2 text-[8px] font-black uppercase tracking-widest ${activeTab === 'appearance' ? 'text-white border-b-2 border-blue-500' : 'text-slate-500'}`}>Вигляд</button>
          <button onClick={() => setActiveTab('fields')} className={`flex-1 py-2 text-[8px] font-black uppercase tracking-widest ${activeTab === 'fields' ? 'text-white border-b-2 border-blue-500' : 'text-slate-500'}`}>Поля</button>
          <button onClick={() => setActiveTab('access')} className={`flex-1 py-2 text-[8px] font-black uppercase tracking-widest ${activeTab === 'access' ? 'text-white border-b-2 border-blue-500' : 'text-slate-500'}`}>Доступ</button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto hide-scrollbar flex-1">
          {activeTab === 'name' && (
            <>
              <div>
                <label className="text-[8px] font-black text-slate-500 uppercase block mb-1">Назва додатку</label>
                <input 
                  type="text" 
                  value={appSettings.name} 
                  onChange={(e) => setAppSettings((prev: any) => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-xs font-bold outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-[8px] font-black text-slate-500 uppercase block mb-1">Підзаголовок</label>
                <input 
                  type="text" 
                  value={appSettings.subtitle} 
                  onChange={(e) => setAppSettings((prev: any) => ({ ...prev, subtitle: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-[10px] font-bold outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </>
          )}
          {activeTab === 'appearance' && (
            <>
              <ColorPicker label="Колір фону" value={appSettings.backgroundColor} onChange={(c: string) => setAppSettings((prev: any) => ({ ...prev, backgroundColor: c }))} />
              <ColorPicker label="Колір назви" value={appSettings.titleColor} onChange={(c: string) => setAppSettings((prev: any) => ({ ...prev, titleColor: c }))} />
              <ColorPicker label="Колір підзаголовка" value={appSettings.subtitleColor} onChange={(c: string) => setAppSettings((prev: any) => ({ ...prev, subtitleColor: c }))} />
              <ColorPicker label="Колір логотипу" value={appSettings.logoColor} onChange={(c: string) => setAppSettings((prev: any) => ({ ...prev, logoColor: c }))} />
            </>
          )}
          {activeTab === 'fields' && (
            <div className="text-white text-[10px] space-y-4">
              <p className="text-slate-400 text-[8px] italic">Створіть шаблони з різним набором полів для різних типів подій.</p>
              {(appSettings.eventTemplates || []).map((template: any, tIdx: number) => (
                <div key={tIdx} className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={template.name} 
                      onChange={(e) => {
                        const newTemplates = [...appSettings.eventTemplates];
                        newTemplates[tIdx] = { ...newTemplates[tIdx], name: e.target.value };
                        setAppSettings((prev: any) => ({ ...prev, eventTemplates: newTemplates }));
                      }}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-bold outline-none focus:border-blue-500"
                      placeholder="Назва шаблону..."
                    />
                    <button 
                      onClick={() => {
                        const newTemplates = appSettings.eventTemplates.filter((_: any, i: number) => i !== tIdx);
                        setAppSettings((prev: any) => ({ ...prev, eventTemplates: newTemplates }));
                      }}
                      className="text-red-500 hover:bg-red-500/10 p-1 rounded"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {ALL_FIELDS.map(field => (
                      <label key={field.id} className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={template.fields.includes(field.id)}
                          onChange={(e) => {
                            const newTemplates = [...appSettings.eventTemplates];
                            const fields = e.target.checked 
                              ? [...template.fields, field.id]
                              : template.fields.filter((f: string) => f !== field.id);
                            newTemplates[tIdx] = { ...newTemplates[tIdx], fields };
                            setAppSettings((prev: any) => ({ ...prev, eventTemplates: newTemplates }));
                          }}
                          className="w-3 h-3 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-0 focus:ring-offset-0"
                        />
                        <span className="text-slate-400 group-hover:text-white transition-colors">{field.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button 
                onClick={() => {
                  const newTemplates = [...(appSettings.eventTemplates || []), { id: Date.now().toString(), name: 'Новий шаблон', fields: ['startTime', 'place'] }];
                  setAppSettings((prev: any) => ({ ...prev, eventTemplates: newTemplates }));
                }}
                className="w-full py-2 rounded-lg text-[8px] font-black uppercase tracking-widest bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all border border-slate-700"
              >
                + Додати шаблон
              </button>
            </div>
          )}
          {activeTab === 'access' && (
            <div className="text-white text-[10px] space-y-3">
              <div className="grid grid-cols-3 gap-2 font-black uppercase text-slate-500 mb-2">
                <span>Рівень</span>
                <span>Пароль</span>
                <span>Опис</span>
              </div>
              {(appSettings.accessLevels || [{ level: '', password: '', description: '' }]).map((item: any, index: number) => (
                <div key={index} className="grid grid-cols-3 gap-2">
                  <input 
                    type="text" 
                    value={item.level} 
                    onChange={(e) => {
                      const newLevels = [...(appSettings.accessLevels || [])];
                      newLevels[index] = { ...newLevels[index], level: e.target.value };
                      setAppSettings((prev: any) => ({ ...prev, accessLevels: newLevels }));
                    }}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-[10px] font-bold outline-none focus:border-blue-500 transition-colors"
                  />
                  <input 
                    type="text" 
                    value={item.password} 
                    onChange={(e) => {
                      const newLevels = [...(appSettings.accessLevels || [])];
                      newLevels[index] = { ...newLevels[index], password: e.target.value };
                      setAppSettings((prev: any) => ({ ...prev, accessLevels: newLevels }));
                    }}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-[10px] font-bold outline-none focus:border-blue-500 transition-colors"
                  />
                  <input 
                    type="text" 
                    value={item.description} 
                    onChange={(e) => {
                      const newLevels = [...(appSettings.accessLevels || [])];
                      newLevels[index] = { ...newLevels[index], description: e.target.value };
                      setAppSettings((prev: any) => ({ ...prev, accessLevels: newLevels }));
                    }}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-[10px] font-bold outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              ))}
              <button 
                onClick={() => {
                  const newLevels = [...(appSettings.accessLevels || []), { level: '', password: '', description: '' }];
                  setAppSettings((prev: any) => ({ ...prev, accessLevels: newLevels }));
                }}
                className="w-full py-2 rounded-lg text-[8px] font-black uppercase tracking-widest bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all"
              >
                + Додати рівень
              </button>
            </div>
          )}
        </div>
        <div className="p-3 border-t border-slate-800 bg-slate-900/50 flex gap-2 shrink-0">
          <button 
            onClick={() => setIsEditingSettings(false)}
            className="flex-1 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all"
          >
            Скасувати
          </button>
          <button 
            onClick={() => {
              handleSaveSettings(appSettings.name, appSettings.subtitle, appSettings.themeBackground, appSettings.backgroundColor, appSettings.titleColor, appSettings.subtitleColor, appSettings.logoColor, appSettings.accessLevels, appSettings.eventTemplates);
              setIsEditingSettings(false);
            }}
            className="flex-1 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest bg-blue-600 text-white hover:bg-blue-500 transition-all"
          >
            Зберегти
          </button>
        </div>
      </div>
    </div>
  );
};

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Helper to automatically reduce font size if text overflows 2 lines
const AutoFitText = ({ text, className, style, defaultSize = 11, minSize = 7 }: { text: string, className?: string, style?: React.CSSProperties, defaultSize?: number, minSize?: number }) => {
  const textRef = useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return;

    let currentSize = defaultSize;
    el.style.fontSize = `${currentSize}px`;

    // Force reflow and check if scrollHeight > clientHeight
    while (el.scrollHeight > el.clientHeight && currentSize > minSize) {
      currentSize -= 0.5;
      el.style.fontSize = `${currentSize}px`;
    }
  }, [text, defaultSize, minSize]);

  return (
    <div
      ref={textRef}
      className={className}
      style={{
        ...style,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        lineHeight: 1.2,
      }}
    >
      {text}
    </div>
  );
};

// Helper to move focus to the next focusable element
const focusNextElement = (currentElement: HTMLElement) => {
  const focusableElements = Array.from(document.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter(el => {
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden' && (el as HTMLElement).offsetWidth > 0;
  });
  const index = focusableElements.indexOf(currentElement);
  if (index > -1 && index < focusableElements.length - 1) {
    (focusableElements[index + 1] as HTMLElement).focus();
  }
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

const WEEKDAY_COLORS = { 1: "#E8E6D1", 2: "#E0E8D1", 3: "#F0F0F0", 4: "#D8CDBF", 5: "#E8D1D1", 6: "#CDE0F5", 0: "#C1D5D8" };
const BORDER_COLORS = { 1: "#F2C057", 2: "#A8D08D", 3: "#BFBFBF", 4: "#E4A073", 5: "#FF8080", 6: "#4A90E2", 0: "#3B9CB6" };
const SHORT_WEEKDAYS = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const FULL_WEEKDAYS = ["Неділя", "Понеділок", "Вівторок", "Середа", "Четвер", "П’ятниця", "Субота"];

const darkenHex = (hex: string, percent: number) => {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  r = Math.floor(r * (1 - percent));
  g = Math.floor(g * (1 - percent));
  b = Math.floor(b * (1 - percent));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

const CustomSelect = ({ value, options = [], onChange, placeholder, groups = null, onEditGroup = null, onAddItem = null, className = "w-full", title, disabled = false, onAssignPreachers = null, allowAppend = false }: {
  value: any;
  options?: string[];
  onChange: (val: any) => void;
  placeholder?: string;
  groups?: { label: string; items: string[] }[] | null;
  onEditGroup?: ((group: any) => void) | null;
  onAddItem?: ((item: string, groupIndex: number) => void) | null;
  className?: string;
  title?: string;
  disabled?: boolean;
  onAssignPreachers?: (() => void) | null;
  allowAppend?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const tabsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

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
      setSearchValue("");
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

  const currentItems = groups ? (groups[activeGroupIndex]?.items || []) : options;
  const filteredItems = searchValue 
    ? currentItems.filter(item => item.toLowerCase().includes(searchValue.toLowerCase()))
    : currentItems;

  const handleSelect = (opt: string, append: boolean = false) => {
    if (append && value) {
      onChange(`${value} + ${opt}`);
    } else {
      onChange(opt);
      setIsOpen(false);
      setTimeout(() => {
        if (triggerRef.current) focusNextElement(triggerRef.current);
      }, 50);
    }
  };

  const content = (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center px-4 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-150" onClick={() => setIsOpen(false)}>
      <div 
        className={`bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh] animate-in zoom-in-95 duration-150 ${(!groups || groups.length <= 1) ? 'w-auto min-w-[240px] max-w-[320px]' : 'w-full max-w-[320px]'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-3 py-1.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
           <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{title || "Виберіть значення"}</span>
           <div className="flex items-center gap-1">
             {onAssignPreachers && title === "СЛУЖІННЯ" && (
               <button onClick={() => { onAssignPreachers(); setIsOpen(false); }} className="px-2 py-0.5 bg-blue-600 text-white text-[9px] font-black uppercase rounded hover:bg-blue-700 transition-colors">ПРИЗНАЧЕННЯ ПРОПОВІДНИКІВ</button>
             )}
             <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-200 rounded-full transition-colors"><X size={14} className="text-slate-400"/></button>
           </div>
        </div>

        {/* Manual Input / Search */}
        <div className="p-2 border-b border-slate-100">
          <div className="relative flex flex-col gap-2">
            <textarea 
              autoFocus
              rows={2}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Tab') {
                  e.preventDefault();
                  if (searchValue.trim()) {
                    onChange(searchValue.trim());
                  }
                  setIsOpen(false);
                  setTimeout(() => {
                    if (triggerRef.current) focusNextElement(triggerRef.current);
                  }, 50);
                }
              }}
              placeholder="Введіть або виберіть..." 
              className="w-full bg-slate-100 border-none rounded-lg px-3 py-2 text-[11px] font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
            {searchValue.trim() && (
              <div className="flex gap-2">
                <button 
                  onClick={() => handleSelect(searchValue.trim())}
                  className="flex-1 bg-blue-600 text-white py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all active:scale-95"
                >
                  Підтвердити
                </button>
                {allowAppend && value && (
                  <button 
                    onClick={() => handleSelect(searchValue.trim(), true)}
                    className="flex-1 bg-amber-600 text-white py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-amber-700 shadow-md shadow-amber-600/20 transition-all active:scale-95 flex items-center justify-center gap-1"
                  >
                    <Plus size={10} /> Додати до існуючого
                  </button>
                )}
                {onAddItem && (groups || options.length > 0) && (
                  <button 
                    onClick={() => { 
                      onAddItem(searchValue.trim(), activeGroupIndex);
                      // After adding, we don't necessarily close the modal, 
                      // but maybe we should to show it's done or just clear search
                      // Let's just confirm it's added by selecting it
                      onChange(searchValue.trim());
                      setIsOpen(false);
                    }}
                    className="flex-1 bg-emerald-600 text-white py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center gap-1"
                  >
                    <Plus size={10} /> Додати в список
                  </button>
                )}
              </div>
            )}
          </div>
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
                      <ChevronLeft size={12} className="text-white" />
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
                      <ChevronRight size={12} className="text-white" />
                  </button>
                  )}
              </div>
              )}
              
              {/* Items List */}
              <div className="flex-1 overflow-y-auto bg-white">
                  <div className="flex flex-col">
                    {sortAlphabetically(filteredItems).map((opt) => (
                        <div
                            key={opt}
                            className={`px-3 py-[2px] text-[10px] font-bold cursor-pointer transition-colors border-b border-slate-50 last:border-0 text-left leading-tight flex items-center justify-between group ${
                                value === opt ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            <div className="flex-1 py-1" onClick={() => handleSelect(opt)}>
                              {opt}
                            </div>
                            {allowAppend && value && value !== opt && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleSelect(opt, true); }}
                                className="p-1 opacity-0 group-hover:opacity-100 hover:bg-amber-100 text-amber-600 rounded transition-all"
                                title="Додати до існуючого"
                              >
                                <Plus size={10} />
                              </button>
                            )}
                        </div>
                    ))}
                    {searchValue && filteredItems.length === 0 && (
                      <div className="p-4 text-center text-slate-400 text-[10px] italic">
                        Нічого не знайдено. Натисніть "ОК" вище, щоб використати введений текст.
                      </div>
                    )}
                  </div>
              </div>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[300px]">
            <div className="flex flex-col">
              {sortAlphabetically(filteredItems).map((opt) => (
                <div
                  key={opt}
                  className={`px-3 py-[2px] text-[10px] font-bold cursor-pointer transition-colors border-b border-slate-50 last:border-0 text-left leading-tight flex items-center justify-between group ${
                    value === opt ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex-1 py-1 truncate" onClick={() => handleSelect(opt)}>
                    {opt}
                  </div>
                  {allowAppend && value && value !== opt && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleSelect(opt, true); }}
                      className="p-1 opacity-0 group-hover:opacity-100 hover:bg-amber-100 text-amber-600 rounded transition-all"
                      title="Додати до існуючого"
                    >
                      <Plus size={10} />
                    </button>
                  )}
                </div>
              ))}
              {searchValue && filteredItems.length === 0 && (
                <div className="p-4 text-center text-slate-400 text-[10px] italic">
                  Нічого не знайдено. Натисніть "ОК" вище, щоб використати введений текст.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      <button 
        type="button"
        ref={triggerRef}
        onClick={() => !disabled && setIsOpen(true)}
        className={`w-full bg-white text-[9px] px-2 py-0 border border-slate-200 font-bold text-slate-900 flex justify-between items-center cursor-pointer hover:border-blue-400 h-6 shadow-sm rounded transition-colors text-left ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="truncate">{value || placeholder}</span>
        {!disabled && <ChevronDown size={10} className="text-slate-400 shrink-0 ml-1" />}
      </button>
      {isOpen && createPortal(content, document.body)}
    </div>
  );
};

const TimeInput = ({ value, onChange, label, disabled = false }) => {
  const [hh, mm] = (value || "").split(':');
  const mmRef = useRef(null);

  const handleHHChange = (e) => {
    if (disabled) return;
    let val = e.target.value.replace(/\D/g, '').slice(0, 2);
    if (parseInt(val) > 23) val = "23";
    onChange(`${val}:${mm || "00"}`);
    if (val.length === 2) mmRef.current?.focus();
  };

  const handleMMChange = (e) => {
    if (disabled) return;
    let val = e.target.value.replace(/\D/g, '').slice(0, 2);
    if (parseInt(val) > 59) val = "59";
    onChange(`${hh || "00"}:${val}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      focusNextElement(e.target as HTMLElement);
    }
  };

  return (
    <div className="flex flex-col">
      <label className="text-[7px] font-black text-slate-500 uppercase block mb-0.5 leading-none">{label}</label>
      <div className={`flex items-center bg-white border border-slate-200 px-1 h-6 shadow-sm ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <input type="text" disabled={disabled} value={hh || ""} onChange={handleHHChange} onKeyDown={handleKeyDown} placeholder="00" onFocus={(e) => e.target.select()} className="w-4 bg-transparent text-slate-900 text-[10px] text-center outline-none font-bold p-0" />
        <span className="text-slate-400 text-[10px] font-bold">:</span>
        <input ref={mmRef} type="text" disabled={disabled} value={mm || ""} onChange={handleMMChange} onKeyDown={handleKeyDown} placeholder="00" onFocus={(e) => e.target.select()} className="w-4 bg-transparent text-slate-900 text-[10px] text-center outline-none font-bold p-0" />
      </div>
    </div>
  );
};

const THEME_BACKGROUNDS = [
  { id: 'none', label: 'Без фону', url: null },
  { id: 'scroll1', label: 'Сувій 1', url: 'https://www.transparentpng.com/download/scroll-paper/old-scroll-paper-png-25.png' },
  { id: 'scroll2', label: 'Сувій 2', url: 'https://www.pngall.com/wp-content/uploads/2016/03/Scroll-PNG-HD.png' },
  { id: 'scroll3', label: 'Сувій 3', url: 'https://pngimg.com/uploads/scroll/scroll_PNG25.png' },
];

import { HexColorPicker } from "react-colorful";

const COLOR_PRESETS = ['#ffffff', '#f87171', '#fb923c', '#facc15', '#4ade80', '#22d3ee', '#818cf8', '#e879f9'];

const ColorPicker = ({ label, value, onChange }: { label: string, value: string, onChange: (c: string) => void }) => {
  const [showCustom, setShowCustom] = useState(false);
  return (
    <div>
      <label className="text-[8px] font-black text-slate-500 uppercase block mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <button onClick={() => setShowCustom(!showCustom)} className="w-8 h-8 rounded cursor-pointer border border-slate-700" style={{ backgroundColor: value }} />
        <div className="flex flex-wrap gap-1">
          {COLOR_PRESETS.map(c => (
            <button key={c} onClick={() => onChange(c)} className="w-5 h-5 rounded-sm" style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>
      {showCustom && (
        <div className="mt-2 p-2 bg-slate-800 rounded-lg">
          <HexColorPicker color={value} onChange={onChange} />
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('view');
  const [events, setEvents] = useState([]);
  const [pinnedEvents, setPinnedEvents] = useState([]);
  const [monthlyThemes, setMonthlyThemes] = useState({});
  const [appSettings, setAppSettings] = useState({ 
    name: "КАЛЕНДАРНИЙ ПЛАН", 
    subtitle: "УЦХВЄ м. Івано-Франківська", 
    logo: null,
    themeBackground: 'none',
    themeFontSize: 16,
    backgroundColor: '#0a1120',
    titleColor: '#ffffff',
    subtitleColor: '#3b82f6',
    logoColor: '#ffffff',
    eventTemplates: [
      { id: 'full', name: 'Повний набір', fields: ['startTime', 'endTime', 'place', 'leads', 'music', 'formatting', 'colors'] },
      { id: 'short', name: 'Скорочений', fields: ['startTime', 'place', 'leads'] },
      { id: 'title', name: 'Тільки назва', fields: [] }
    ]
  });
  const [isEditingTheme, setIsEditingTheme] = useState(false);
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [themeText, setThemeText] = useState("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'preacher_manager' | 'singer_manager' | null>(null);
  const [password, setPassword] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dayViewPivotDate, setDayViewPivotDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [selectedDayForEvent, setSelectedDayForEvent] = useState(null);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [pendingAssignmentCallback, setPendingAssignmentCallback] = useState<((val: string) => void) | null>(null);
  const [showPreacherTable, setShowPreacherTable] = useState(false);
  
  const updateThemeFontSize = async (delta: number) => {
    const newSize = Math.max(8, Math.min(48, (appSettings.themeFontSize || 16) + delta));
    setAppSettings(prev => ({ ...prev, themeFontSize: newSize }));
    if (isAdminAuthenticated && db) {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'general'), { themeFontSize: newSize }, { merge: true });
    }
  };

  // Динамічні довідники
  const [eventGroups, setEventGroups] = useState(INITIAL_EVENT_GROUPS);
  const [musicGroups, setMusicGroups] = useState(INITIAL_MUSIC_GROUPS);
  const [staffGroups, setStaffGroups] = useState(INITIAL_STAFF_GROUPS);
  const [locations, setLocations] = useState(INITIAL_LOCATIONS);
  const maxLocationLength = Math.max(...locations.map(l => l.length), 8);
  const [textColors, setTextColors] = useState(INITIAL_TEXT_COLORS);
  const [listsLoaded, setListsLoaded] = useState(false);
  const listsRef = useRef(null);
  
  const [editingGroup, setEditingGroup] = useState(null);
  const [confirmAction, setConfirmAction] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [editingEventIndex, setEditingEventIndex] = useState<number | null>(null);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);

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
        if (initialAuthToken && initialAuthToken.split('.').length === 3) {
          try {
            await signInWithCustomToken(auth, initialAuthToken);
          } catch (e) {
            console.error("Custom token auth failed", e);
            await signInAnonymously(auth);
          }
        } else {
          if (initialAuthToken) {
            console.warn("VITE_INITIAL_AUTH_TOKEN is set but invalid, falling back to anonymous auth.");
          }
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

    const unsubscribeSettings = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'general'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setAppSettings(prev => ({ ...prev, ...data }));
      }
    }, (err) => console.error(err));

    const qPinned = collection(db, 'artifacts', appId, 'public', 'data', 'pinned_events');
    const unsubscribePinned = onSnapshot(qPinned, (snapshot) => {
      setPinnedEvents(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.error(err));

    return () => {
      unsubscribe();
      unsubscribeThemes();
      unsubscribeLists();
      unsubscribeSettings();
      unsubscribePinned();
    };
  }, [db]);

  const togglePinEvent = async (event: any, weekday: number) => {
    if (!isAdminAuthenticated || !db) return;
    
    const docId = `${weekday}_${event.title}_${event.startTime}_${event.place}`.replace(/[^a-zA-Z0-9]/g, '_');
    const isPinned = pinnedEvents.some(p => p.id === docId);

    if (isPinned) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'pinned_events', docId));
    } else {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'pinned_events', docId), {
        weekday,
        title: event.title,
        startTime: event.startTime,
        endTime: event.endTime || "",
        place: event.place || "",
        leads: event.leads || [],
        music: event.music || "",
        textColor: event.textColor || "#0077cc",
        isBold: event.isBold !== false,
        isItalic: event.isItalic === true,
        isUnderline: event.isUnderline === true,
        isUppercase: event.isUppercase !== false,
        align: event.align || "left"
      });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAppSettings(prev => ({ ...prev, logo: result }));
        if (isAdminAuthenticated && db) {
          setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'general'), { logo: result }, { merge: true });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async (name: string, subtitle: string, themeBackground: string, backgroundColor: string, titleColor: string, subtitleColor: string, logoColor: string, accessLevels: any[], eventTemplates: any[]) => {
    setAppSettings(prev => ({ ...prev, name, subtitle, themeBackground, backgroundColor, titleColor, subtitleColor, logoColor, accessLevels, eventTemplates }));
    if (isAdminAuthenticated && db) {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'general'), { name, subtitle, themeBackground, backgroundColor, titleColor, subtitleColor, logoColor, accessLevels, eventTemplates }, { merge: true });
    }
  };

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

  const getDayEvents = (dateKey: string, date: Date) => {
    const dayData = events.find(e => e.id === dateKey);
    const weekday = date.getDay();
    const pinnedForThisDay = pinnedEvents.filter(p => p.weekday === weekday);
    
    const dayEvents = [...(dayData?.events || [])];
    
    // Merge pinned events that are not already in dayData.events
    pinnedForThisDay.forEach(p => {
      if (!dayEvents.some(e => e.title === p.title && e.startTime === p.startTime)) {
        dayEvents.push({ ...p, isFromTemplate: true });
      }
    });
    
    return dayEvents;
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
      const sortedEvents = [...dayEvents].sort((a, b) => (a.startTime || "99:99").localeCompare(b.startTime || "99:99"));
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'calendar_events', dateKey), { events: sortedEvents }, { merge: true });
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
    const [year, month, day] = dateKey.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayEvents = getDayEvents(dateKey, date);
    
    const newEvents = [...dayEvents];
    const updatedEvent = { ...newEvents[index], [field]: value };
    if (field === 'title' && !updatedEvent.isColorManuallySet) {
      updatedEvent.textColor = getAutoColor(value);
    }
    if (field === 'textColor') {
      updatedEvent.isColorManuallySet = true;
    }
    newEvents[index] = updatedEvent;

    setEvents(prev => {
      const existing = prev.find(d => d.id === dateKey);
      if (existing) return prev.map(d => d.id === dateKey ? { ...d, events: newEvents } : d);
      return [...prev, { id: dateKey, events: newEvents }];
    });
  };

  const handleAddValueToGroup = (item: string, groupIndex: number, type: 'staff' | 'music' | 'location' | 'event') => {
    if (!item.trim()) return;
    const val = item.trim();

    if (type === 'staff') {
      const filteredGroups = staffGroups.filter(g => g.label !== "Хто співає / грає");
      if (groupIndex >= filteredGroups.length) return;
      const targetGroupLabel = filteredGroups[groupIndex].label;
      setStaffGroups(prev => prev.map(g => {
        if (g.label === targetGroupLabel && !g.items.includes(val)) {
          return { ...g, items: [...g.items, val] };
        }
        return g;
      }));
    } else if (type === 'music') {
      if (groupIndex >= musicGroups.length) return;
      const targetGroupLabel = musicGroups[groupIndex].label;
      setMusicGroups(prev => prev.map(g => {
        if (g.label === targetGroupLabel && !g.items.includes(val)) {
          return { ...g, items: [...g.items, val] };
        }
        return g;
      }));
    } else if (type === 'event') {
      if (groupIndex >= eventGroups.length) return;
      const targetGroupLabel = eventGroups[groupIndex].label;
      setEventGroups(prev => prev.map(g => {
        if (g.label === targetGroupLabel && !g.items.includes(val)) {
          return { ...g, items: [...g.items, val] };
        }
        return g;
      }));
    } else if (type === 'location') {
      setLocations(prev => prev.includes(val) ? prev : [...prev, val]);
    }
  };

  const addEventToDay = (dateKey) => {
    const [year, month, day] = dateKey.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayEvents = getDayEvents(dateKey, date);
    const defaultTemplateId = appSettings.eventTemplates?.[0]?.id || 'full';
    const newEvents = [...dayEvents, { title: "", startTime: "", endTime: "", place: "", leads: [""], music: "", textColor: textColors[0] || "#0077cc", align: "left", isBold: true, isItalic: false, isUnderline: false, isUppercase: true, templateId: defaultTemplateId }];
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

  const handleDuplicateGroupTo = (targetType: 'event' | 'music' | 'staff') => {
    if (!editingGroup || editingGroup.type === 'location') return;
    
    const newGroup = { 
      label: editingGroup.label, 
      items: [...editingGroup.items] 
    };

    if (targetType === 'event') {
      setEventGroups(prev => {
        if (prev.some(g => g.label === newGroup.label)) return prev;
        return [...prev, newGroup];
      });
    } else if (targetType === 'music') {
      setMusicGroups(prev => {
        if (prev.some(g => g.label === newGroup.label)) return prev;
        return [...prev, newGroup];
      });
    } else if (targetType === 'staff') {
      setStaffGroups(prev => {
        if (prev.some(g => g.label === newGroup.label)) return prev;
        return [...prev, newGroup];
      });
    }
    
    setEditingGroup(null);
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
    
    // Update the group list
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

    // Update existing events
    setEvents(prev => prev.map(day => ({
      ...day,
      events: day.events.map(ev => {
        const updatedEvent = { ...ev };
        if (editingGroup.type === 'location' && updatedEvent.place === oldItem) updatedEvent.place = newItem.trim();
        if (editingGroup.type === 'music' && updatedEvent.music === oldItem) updatedEvent.music = newItem.trim();
        if (editingGroup.type === 'staff' && updatedEvent.leads) {
          updatedEvent.leads = updatedEvent.leads.map(l => l === oldItem ? newItem.trim() : l);
        }
        return updatedEvent;
      })
    })));
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
    
    if (showPreacherTable) {
      return days.filter(d => [3, 5, 0].includes(d.weekdayIndex));
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
  const isEditingTarget = !!selectedDayForEvent;
  const currentMonthKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`;
  const currentTheme = monthlyThemes[currentMonthKey] || "";

  const [showDiagnostics, setShowDiagnostics] = useState(false);

  return (
    <div className="min-h-screen text-slate-200 p-4 font-sans pb-24 text-[10px]" style={{ backgroundColor: appSettings.backgroundColor }}>
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
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Папка даних (App ID):</span>
                <span className="text-slate-300 font-mono text-xs">{appId}</span>
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
      {/* Database Connection Indicator (Fixed to top right) */}
      <div className="fixed top-1 right-1 z-50">
        <div 
          onClick={() => setShowDiagnostics(true)}
          className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-transform hover:scale-150 ${db ? 'bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`} 
          title="Статус бази даних"
        ></div>
      </div>

      <div className="mx-auto w-full max-w-[1600px] px-2 md:px-6">
        <header className="w-full flex flex-col gap-4 mb-4 md:mb-6">
          {/* Top Row: Logo, View Mode, Tabs */}
          <div className="w-full flex flex-row flex-nowrap items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center justify-between w-full md:w-auto">
          <div 
            className="flex items-center gap-2 md:gap-4 cursor-pointer group" 
            onClick={() => {
              setActiveTab('view');
              setViewMode('month');
            }}
          >
             <div className="group-hover:scale-105 transition-transform">
               <div className="h-8 md:h-12 w-8 md:w-12 flex items-center justify-center overflow-hidden">
                 {appSettings.logo ? (
                   <img src={appSettings.logo} alt="Logo" className="w-full h-full object-contain" />
                 ) : (
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
                     <path d="M50 12 L50 24 M46 16 L54 16" stroke={appSettings.logoColor} strokeWidth="2" strokeLinecap="round" />
                   </svg>
                 )}
               </div>
             </div>
             <div className="flex flex-col justify-center gap-0.5 md:gap-1.5 mt-0.5 md:mt-1">
               <h1 className="text-base md:text-3xl lg:text-4xl font-black uppercase leading-none tracking-tight group-hover:text-blue-400 transition-colors" style={{ color: appSettings.titleColor }}>
                 {appSettings.name}
               </h1>
               <span className="text-[6px] md:text-[10px] lg:text-xs font-bold tracking-[0.2em] md:tracking-[0.4em] uppercase" style={{ color: appSettings.subtitleColor }}>{appSettings.subtitle}</span>
             </div>
          </div>
          
          {/* Mobile Diagnostics */}
          <div className="hidden">
            <div 
              onClick={() => setShowDiagnostics(true)}
              className={`w-2 h-2 rounded-full cursor-pointer transition-transform hover:scale-150 ${db ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`} 
            ></div>
          </div>
        </div>


        {/* Right: Tabs and Settings */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-1 w-full md:w-auto order-2 md:order-3">
          <div className="flex flex-col gap-1">
            <button 
              onClick={() => {
                if (activeTab === 'admin') {
                  setIsSubMenuOpen(!isSubMenuOpen);
                } else {
                  setActiveTab('admin');
                  setIsSubMenuOpen(true);
                }
              }} 
              className={`px-2 py-1.5 rounded-md text-[8px] font-bold uppercase tracking-wider transition-all border border-slate-700 shrink-0 ${activeTab === 'admin' || activeTab === 'view' || activeTab === 'lists' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
            >
              Редактор
            </button>
            {isAdminAuthenticated && isSubMenuOpen && (
              <div className="flex flex-col gap-1 mt-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
                {userRole === 'admin' && (
                  <>
                    <button onClick={() => { setActiveTab('lists'); setShowPreacherTable(false); setIsSubMenuOpen(true); }} className={`px-2 py-1 rounded text-[8px] font-bold uppercase ${activeTab === 'lists' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Списки</button>
                    <button onClick={() => { setIsEditingSettings(true); setIsSubMenuOpen(true); }} className="px-2 py-1 rounded text-[8px] font-bold uppercase text-slate-400 hover:text-white">Налаштування</button>
                  </>
                )}
                <button onClick={() => { setActiveTab('view'); setShowPreacherTable(false); window.scrollTo({ top: 0, behavior: 'smooth' }); setIsSubMenuOpen(false); }} className={`px-2 py-1 rounded text-[8px] font-bold uppercase ${activeTab === 'view' && !showPreacherTable ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Графік</button>
                {(userRole === 'admin' || userRole === 'preacher_manager') && (
                  <button onClick={() => { 
                    setActiveTab('view'); 
                    setViewMode('month'); 
                    setShowPreacherTable(true);
                    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
                    setSelectedDate(nextMonth);
                    setIsSubMenuOpen(false); 
                  }} className="px-2 py-1 rounded text-[8px] font-bold uppercase text-blue-400 hover:text-white border border-blue-900/50 bg-blue-900/20">Призначення проповідників</button>
                )}
              </div>
            )}
          </div>
          
          {!isAdminAuthenticated && (activeTab === 'admin' || activeTab === 'lists') && (
            <div className="flex items-center gap-1 animate-in fade-in slide-in-from-top-2 shrink-0">
              <Lock size={8} className="text-slate-500 hidden md:block" />
              <input 
                type="password" 
                autoFocus
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Пароль..." 
                className="w-14 md:w-24 bg-slate-900/50 border border-slate-700 rounded-md px-1 md:px-2 py-0.5 md:py-1 text-white text-[7px] md:text-[9px] font-bold outline-none focus:border-blue-500 transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const enteredPassword = password.trim();
                    const adminPass = initialAuthToken || '2026';
                    
                    if (enteredPassword === adminPass) {
                      console.log("Logged in as Admin (Default Password)");
                      setIsAdminAuthenticated(true);
                      setUserRole('admin');
                      setPassword('');
                    } else {
                      const level = (appSettings.accessLevels || []).find((l: any) => (l.password || '').trim() === enteredPassword);
                      if (level) {
                        console.log("Logged in via Access Level:", level.level);
                        setIsAdminAuthenticated(true);
                        const levelName = (level.level || '').toLowerCase();
                        if (levelName.includes('проповід')) {
                          setUserRole('preacher_manager');
                        } else if (levelName.includes('співа')) {
                          setUserRole('singer_manager');
                        } else {
                          setUserRole('admin');
                        }
                        setPassword('');
                      } else {
                        console.log("Login failed: Invalid password");
                        alert('Невірний пароль');
                      }
                    }
                  }
                }}
              />
              <button 
                onClick={() => {
                  const enteredPassword = password.trim();
                  const adminPass = initialAuthToken || '2026';
                  
                  if (enteredPassword === adminPass) {
                    console.log("Logged in as Admin (Default Password)");
                    setIsAdminAuthenticated(true);
                    setUserRole('admin');
                    setPassword('');
                  } else {
                    const level = (appSettings.accessLevels || []).find((l: any) => (l.password || '').trim() === enteredPassword);
                    if (level) {
                      console.log("Logged in via Access Level:", level.level);
                      setIsAdminAuthenticated(true);
                      const levelName = (level.level || '').toLowerCase();
                      if (levelName.includes('проповід')) {
                        setUserRole('preacher_manager');
                      } else if (levelName.includes('співа')) {
                        setUserRole('singer_manager');
                      } else {
                        setUserRole('admin');
                      }
                      setPassword('');
                    } else {
                      console.log("Login failed: Invalid password");
                      alert('Невірний пароль');
                    }
                  }
                }}
                className="bg-blue-600 text-white px-1.5 md:px-2 py-0.5 md:py-1 rounded-md text-[6px] md:text-[9px] font-black uppercase hover:bg-blue-500 transition-colors"
              >
                Вхід
              </button>
            </div>
          )}
        </div>
      </div>

        {/* Dynamic Navigation Row */}
        {activeTab !== 'lists' && (
          <div className="w-full flex flex-col items-center gap-2">
            {activeTab === 'preachers' ? (
              <div className="w-full py-2 flex items-center justify-center">
                <span 
                  className="text-xl font-black uppercase tracking-widest"
                  style={{ 
                    color: parseInt(appSettings.backgroundColor.replace('#', ''), 16) > 0xffffff / 2 ? '#000000' : '#ffffff' 
                  }}
                >
                  ПРИЗНАЧЕННЯ ПРОПОВІДНИКІВ
                </span>
              </div>
            ) : (
                <div className="flex items-center justify-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
              <button onClick={() => setViewMode('day')} className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-wider transition-all ${viewMode === 'day' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>День</button>
              <button onClick={() => setViewMode('week')} className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-wider transition-all ${viewMode === 'week' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Тиждень</button>
              <button onClick={() => setViewMode('month')} className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-wider transition-all ${viewMode === 'month' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Місяць</button>
              <button onClick={() => setViewMode('year')} className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-wider transition-all ${viewMode === 'year' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Рік</button>
            </div>
          )}
          {viewMode === 'day' && (
            <div className="flex items-center justify-between w-full max-w-[500px] mx-auto px-2">
              <button 
                onClick={() => {
                  const d = new Date(dayViewPivotDate);
                  d.setDate(d.getDate() - 1);
                  setDayViewPivotDate(d);
                  setSelectedDate(new Date(d));
                }}
                className="p-4 text-blue-500 hover:bg-blue-500/10 rounded-full transition-colors"
              >
                <ChevronLeft size={32} className="text-white"/>
              </button>
              
              <div 
                className="flex items-center gap-2 cursor-ns-resize overflow-x-auto [&::-webkit-scrollbar]:hidden"
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
                      className={`w-10 h-10 flex items-center justify-center rounded-full text-[12px] font-black transition-all shrink-0 ${isSelected ? 'bg-blue-600 text-white shadow-lg scale-110' : 'text-slate-400 hover:text-slate-200'} ${isToday && !isSelected ? 'ring-2 ring-blue-500' : ''}`}
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
                className="p-4 text-blue-500 hover:bg-blue-500/10 rounded-full transition-colors"
              >
                <ChevronRight size={32} className="text-white"/>
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
                <ChevronLeft size={20} className="text-white"/>
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
                <ChevronRight size={20} className="text-white"/>
              </button>
            </div>
          )}

          {viewMode === 'year' && (
            <div className="flex items-center justify-center gap-2 w-full">
              <div className="flex items-center bg-slate-800/50 px-4 py-1.5 rounded-xl border border-slate-700/50 backdrop-blur-sm gap-0">
                <button 
                  onClick={() => {
                    const d = new Date(selectedDate);
                    d.setFullYear(d.getFullYear() - 1);
                    setSelectedDate(d);
                  }}
                  className="text-blue-500 hover:text-blue-400 transition-colors"
                >
                  <ChevronLeft size={20} className="text-white"/>
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
                  <ChevronRight size={20} className="text-white"/>
                </button>
              </div>
            </div>
          )}

          {viewMode === 'month' && (
            <div className="flex items-center justify-center gap-2 w-full">
              <div className="flex items-center px-4 py-1.5 gap-0">
                <button 
                  onClick={() => {
                    const d = new Date(selectedDate);
                    d.setMonth(d.getMonth() - 1);
                    setSelectedDate(d);
                  }}
                  className="text-blue-500 hover:text-blue-400 transition-colors"
                >
                  <ChevronLeft size={20} className="text-white"/>
                </button>
                <span className="text-[11px] font-black uppercase text-white tracking-wider min-w-[140px] text-center">
                  {selectedDate.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' })}
                </span>
                <button 
                  onClick={() => {
                    const d = new Date(selectedDate);
                    d.setMonth(d.getMonth() + 1);
                    setSelectedDate(d);
                  }}
                  className="text-blue-500 hover:text-blue-400 transition-colors"
                >
                  <ChevronRight size={20} className="text-white"/>
                </button>
              </div>
            </div>
          )}
        </div>
        )}
      </header>

        <main className="w-full print:max-w-none print:mx-0">
        {activeTab === 'lists' && (
          isAdminAuthenticated ? (
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
                    <div className="flex flex-col items-start mb-3 gap-2">
                      <h3 className="text-blue-400 font-bold text-sm uppercase leading-tight w-full">{g.label}</h3>
                      <div className="flex items-center gap-1 w-full justify-start bg-slate-900/50 p-1.5 rounded-lg border border-slate-700/50">
                        <button onClick={() => setEventGroups(prev => { const arr = [...prev]; if (idx > 0) [arr[idx-1], arr[idx]] = [arr[idx], arr[idx-1]]; return arr; })} disabled={idx === 0} className="text-slate-500 hover:text-white disabled:opacity-30 p-1"><ChevronUp size={14}/></button>
                        <button onClick={() => setEventGroups(prev => { const arr = [...prev]; if (idx < arr.length - 1) [arr[idx+1], arr[idx]] = [arr[idx], arr[idx+1]]; return arr; })} disabled={idx === eventGroups.length - 1} className="text-slate-500 hover:text-white disabled:opacity-30 p-1"><ChevronDown size={14}/></button>
                        <div className="h-4 w-[1px] bg-slate-700 mx-1" />
                        <button onClick={() => moveGroup(idx, 'event', 'music')} className="text-slate-500 hover:text-blue-400 p-1" title="Перемістити в Музику"><Music size={12}/></button>
                        <button onClick={() => moveGroup(idx, 'event', 'staff')} className="text-slate-500 hover:text-blue-400 p-1" title="Перемістити в Служителі"><Users size={12}/></button>
                        <div className="h-4 w-[1px] bg-slate-700 mx-1" />
                        <button onClick={() => setEditingGroup({...g, type: 'event'})} className="text-slate-500 hover:text-white ml-1 p-1"><Pencil size={14}/></button>
                        <button 
                          onClick={() => {
                            setConfirmAction({
                              title: "Видалення категорії",
                              message: `Ви впевнені, що хочете видалити категорію "${g.label}"?`,
                              onConfirm: () => {
                                setEventGroups(prev => prev.filter((_, i) => i !== idx));
                                setConfirmAction(null);
                              }
                            });
                          }} 
                          className="text-slate-500 hover:text-red-500 ml-auto p-1"
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
                    <div className="flex flex-col items-start mb-3 gap-2">
                      <h3 className="text-blue-400 font-bold text-sm uppercase leading-tight w-full">{g.label}</h3>
                      <div className="flex items-center gap-1 w-full justify-start bg-slate-900/50 p-1.5 rounded-lg border border-slate-700/50">
                        <button onClick={() => setMusicGroups(prev => { const arr = [...prev]; if (idx > 0) [arr[idx-1], arr[idx]] = [arr[idx], arr[idx-1]]; return arr; })} disabled={idx === 0} className="text-slate-500 hover:text-white disabled:opacity-30 p-1"><ChevronUp size={14}/></button>
                        <button onClick={() => setMusicGroups(prev => { const arr = [...prev]; if (idx < arr.length - 1) [arr[idx+1], arr[idx]] = [arr[idx], arr[idx+1]]; return arr; })} disabled={idx === musicGroups.length - 1} className="text-slate-500 hover:text-white disabled:opacity-30 p-1"><ChevronDown size={14}/></button>
                        <div className="h-4 w-[1px] bg-slate-700 mx-1" />
                        <button onClick={() => moveGroup(idx, 'music', 'event')} className="text-slate-500 hover:text-blue-400 p-1" title="Перемістити в Події"><Calendar size={12}/></button>
                        <button onClick={() => moveGroup(idx, 'music', 'staff')} className="text-slate-500 hover:text-blue-400 p-1" title="Перемістити в Служителі"><Users size={12}/></button>
                        <div className="h-4 w-[1px] bg-slate-700 mx-1" />
                        <button onClick={() => setEditingGroup({...g, type: 'music'})} className="text-slate-500 hover:text-white ml-1 p-1"><Pencil size={14}/></button>
                        <button 
                          onClick={() => {
                            setConfirmAction({
                              title: "Видалення категорії",
                              message: `Ви впевнені, що хочете видалити категорію "${g.label}"?`,
                              onConfirm: () => {
                                setMusicGroups(prev => prev.filter((_, i) => i !== idx));
                                setConfirmAction(null);
                              }
                            });
                          }} 
                          className="text-slate-500 hover:text-red-500 ml-auto p-1"
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
                    <div className="flex flex-col items-start mb-3 gap-2">
                      <h3 className="text-blue-400 font-bold text-sm uppercase leading-tight w-full">{g.label}</h3>
                      <div className="flex items-center gap-1 w-full justify-start bg-slate-900/50 p-1.5 rounded-lg border border-slate-700/50">
                        <button onClick={() => setStaffGroups(prev => { const arr = [...prev]; if (idx > 0) [arr[idx-1], arr[idx]] = [arr[idx], arr[idx-1]]; return arr; })} disabled={idx === 0} className="text-slate-500 hover:text-white disabled:opacity-30 p-1"><ChevronUp size={14}/></button>
                        <button onClick={() => setStaffGroups(prev => { const arr = [...prev]; if (idx < arr.length - 1) [arr[idx+1], arr[idx]] = [arr[idx], arr[idx+1]]; return arr; })} disabled={idx === staffGroups.length - 1} className="text-slate-500 hover:text-white disabled:opacity-30 p-1"><ChevronDown size={14}/></button>
                        <div className="h-4 w-[1px] bg-slate-700 mx-1" />
                        <button onClick={() => moveGroup(idx, 'staff', 'event')} className="text-slate-500 hover:text-blue-400 p-1" title="Перемістити в Події"><Calendar size={12}/></button>
                        <button onClick={() => moveGroup(idx, 'staff', 'music')} className="text-slate-500 hover:text-blue-400 p-1" title="Перемістити в Музику"><Music size={12}/></button>
                        <div className="h-4 w-[1px] bg-slate-700 mx-1" />
                        <button onClick={() => setEditingGroup({...g, type: 'staff'})} className="text-slate-500 hover:text-white ml-1 p-1"><Pencil size={14}/></button>
                        <button 
                          onClick={() => {
                            setConfirmAction({
                              title: "Видалення категорії",
                              message: `Ви впевнені, що хочете видалити категорію "${g.label}"?`,
                              onConfirm: () => {
                                setStaffGroups(prev => prev.filter((_, i) => i !== idx));
                                setConfirmAction(null);
                              }
                            });
                          }} 
                          className="text-slate-500 hover:text-red-500 ml-auto p-1"
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
          ) : (
            <div className="max-w-4xl mx-auto text-center py-12 text-slate-500 font-bold text-xs uppercase tracking-widest">
              Введіть пароль у правому верхньому куті для доступу
            </div>
          )
        )}

        {(activeTab === 'view' || activeTab === 'admin') && (
          <div className={showPreacherTable ? "flex flex-row gap-4 p-4 items-start h-[calc(100vh-120px)] overflow-hidden" : "flex flex-col gap-4"}>
            <div className={showPreacherTable ? "w-1/3 shrink-0 flex flex-col gap-4 h-full overflow-y-auto pr-2 custom-scrollbar" : "flex flex-col gap-4 w-full"}>
            {/* Theme of the Month Display */}
            {viewMode !== 'year' && (currentTheme || activeTab === 'admin') && (
              <div className={`${!showPreacherTable && (viewMode === 'month' || viewMode === 'week') ? 'max-w-[95%] md:max-w-[100%] lg:max-w-[85%] mx-auto' : 'max-w-full'} w-full py-1 relative group flex flex-col items-center`}>
                {appSettings.themeBackground && appSettings.themeBackground !== 'none' ? (
                  <div 
                    className="relative w-full flex items-center justify-center overflow-hidden shadow-xl"
                    style={{
                      background: '#f4e4bc',
                      borderLeft: '12px solid #d4b483',
                      borderRight: '12px solid #d4b483',
                      boxShadow: 'inset 0 0 30px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.3)'
                    }}
                  >
                    {/* Decorative Scroll Lines */}
                    <div className="absolute top-0 bottom-0 left-[-10px] w-[2px] bg-black/5" />
                    <div className="absolute top-0 bottom-0 right-[-10px] w-[2px] bg-black/5" />
                    
                    {/* Text Content */}
                    <div className="relative z-10 px-6 py-2 text-center flex flex-col items-center justify-center w-full">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h2 className="text-amber-950 font-black uppercase text-[7px] md:text-[9px] tracking-[0.5em] drop-shadow-sm">
                          ТЕКСТ МІСЯЦЯ
                        </h2>
                        {activeTab === 'admin' && isAdminAuthenticated && (
                          <div className="flex items-center gap-1 bg-amber-900/10 rounded-full px-1">
                            <button onClick={() => updateThemeFontSize(-1)} className="text-amber-900 hover:text-amber-700 p-0.5"><Minus size={10} /></button>
                            <span className="text-amber-900 text-[8px] font-bold min-w-[12px] text-center">{appSettings.themeFontSize || 16}</span>
                            <button onClick={() => updateThemeFontSize(1)} className="text-amber-900 hover:text-amber-700 p-0.5"><Plus size={10} /></button>
                          </div>
                        )}
                      </div>
                      {currentTheme ? (
                        <div className="min-h-[2.5em] flex items-center justify-center w-full">
                          <p className="text-amber-950 font-serif font-bold italic leading-tight whitespace-pre-wrap" style={{ fontSize: `${appSettings.themeFontSize || 16}px` }}>
                            {currentTheme}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div className="w-full text-center px-6 py-2 bg-red-600/5 border-y border-red-600/10 backdrop-blur-sm flex flex-col justify-center">
                    <div className="flex items-center justify-center gap-2 mb-0.5">
                      <h2 className="text-red-900 font-black uppercase text-[9px] md:text-[11px] tracking-widest drop-shadow-sm">ТЕКСТ МІСЯЦЯ:</h2>
                      {activeTab === 'admin' && isAdminAuthenticated && (
                        <div className="flex items-center gap-1 bg-red-600/10 rounded-full px-1">
                          <button onClick={() => updateThemeFontSize(-1)} className="text-red-600 hover:text-red-800 p-0.5"><Minus size={10} /></button>
                          <span className="text-red-600 text-[8px] font-bold min-w-[12px] text-center">{appSettings.themeFontSize || 10}</span>
                          <button onClick={() => updateThemeFontSize(1)} className="text-red-600 hover:text-red-800 p-0.5"><Plus size={10} /></button>
                        </div>
                      )}
                    </div>
                    {currentTheme ? (
                      <div className="min-h-[2.5em] flex items-center justify-center w-full">
                        <p className="text-red-500 font-bold italic leading-relaxed whitespace-pre-wrap text-[10px] md:text-[11px]" style={{ fontSize: `clamp(10px, ${(appSettings.themeFontSize || 10) + 1}px, 20px)` }}>
                          {currentTheme}
                        </p>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            )}
          <div className={`
            calendar-container-scaling
            ${viewMode === 'month' ? (showPreacherTable ? 'flex flex-col gap-3' : 'grid grid-cols-1 gap-3 print:grid-cols-1 print:gap-0') : ''}
            ${viewMode === 'week' ? 'grid grid-cols-1 lg:grid-cols-2 gap-3 w-full' : ''}
            ${viewMode === 'day' ? `flex flex-col gap-3 w-full ${showPreacherTable ? '' : 'mx-auto'}` : ''}
            ${viewMode === 'year' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 print:grid-cols-1 print:gap-0' : ''}
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
                  <div key={monthIdx} className={`bg-slate-900/40 rounded-2xl p-4 border border-slate-800/50 print:bg-white print:border-none print:p-0 ${monthIdx === 6 ? 'print:page-break-before' : ''} md:min-w-[320px]`}>
                    <div className="flex justify-between items-start border-b border-slate-800 pb-2 mb-4 print:text-black print:border-black/10">
                      <h3 className="text-white font-black uppercase text-[9px] tracking-widest print:text-black">
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
                        const dayEvents = getDayEvents(dateKey, d);
                        if (dayEvents.length === 0) return null;
                        
                        return (
                          <div key={dateKey} className="flex gap-2 items-start">
                            <div className="w-6 shrink-0 text-[7px] font-black text-slate-500">{d.getDate()}</div>
                            <div className="flex-1 flex flex-col gap-1">
                              {dayEvents.map((ev, i) => {
                                const isCleaning = ev.title?.toUpperCase().includes('ПРИБИРАННЯ');
                                return (
                                  <div key={i} className={`text-[9px] leading-tight flex gap-1 items-baseline px-1 rounded ${isCleaning ? 'bg-slate-200' : ''}`}>
                                    <span className="shrink-0 text-slate-500 font-bold text-[6px]">{ev.startTime}</span>
                                    <span className={`${ev.isBold !== false ? 'font-black' : 'font-medium'} ${ev.isItalic === true ? 'italic' : ''} ${ev.isUnderline === true ? 'underline' : ''} ${ev.isUppercase !== false ? 'uppercase' : ''}`} style={{ color: ev.textColor }}>
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
              const dayEvents = getDayEvents(d.dateKey, new Date(d.dateKey)).sort((a, b) => (a.startTime || "99:99").localeCompare(b.startTime || "99:99"));
              
              return (
                <div 
                  key={d.dateKey} 
                  onClick={() => {
                    setSelectedDate(new Date(d.dateKey));
                    if (viewMode === 'day') setDayViewPivotDate(new Date(d.dateKey));
                  }}
                  onDoubleClick={() => {
                    if (!isAdminAuthenticated) return;
                    const dateObj = new Date(d.dateKey);
                    setSelectedDate(dateObj);
                    setSelectedDayForEvent(d.dateKey);
                  }}
                  className={`relative flex flex-row overflow-hidden ${showPreacherTable ? 'border-l-[6px]' : 'border-l-[12px]'} shadow-md transition-all cursor-pointer ${showPreacherTable ? 'min-h-[60px]' : 'min-h-[100px] lg:min-h-[130px]'} ${showPreacherTable ? 'rounded-xl' : 'rounded-3xl lg:rounded-[2rem]'} w-full ${(viewMode === 'month' || viewMode === 'week') && !showPreacherTable ? 'max-w-[95%] md:max-w-[100%] lg:max-w-full mx-auto' : 'max-w-full'} ${d.isToday ? 'ring-4 ring-blue-500/30 ring-offset-4 ring-offset-[#0a1120]' : 'hover:shadow-xl hover:-translate-y-0.5'} ${d.dateKey === formatDateKey(selectedDate) ? 'ring-2 ring-blue-400/50 z-10' : ''} ${d.isOtherMonth && activeTab === 'view' ? 'opacity-60 grayscale-[0.4]' : ''} ${viewMode === 'month' && index > 0 && index % 7 === 0 ? 'print:page-break-before' : ''}`} 
                  style={{ 
                    borderLeftColor: (d.isOtherMonth && activeTab === 'view') ? '#f1f5f9' : BORDER_COLORS[d.weekdayIndex],
                    backgroundColor: (d.isOtherMonth && activeTab === 'view') ? '#f8fafc' : WEEKDAY_COLORS[d.weekdayIndex]
                  }}
                >
                  {/* Left Column: Date & Day */}
                  <div className={`${showPreacherTable ? 'w-5' : (viewMode === 'month' ? 'w-6 md:w-8' : 'w-8 md:w-10')} shrink-0 flex flex-col items-center justify-center border-r border-slate-100/50 bg-white/50 gap-0.5 md:gap-1 py-1 md:py-2`}>
                    <span className={`${showPreacherTable ? 'text-[7px]' : 'text-[11px] md:text-[13px]'} font-bold uppercase leading-none ${d.isToday ? 'text-blue-600' : 'text-slate-900'}`}>
                      {String(d.day).padStart(2, '0')}
                    </span>
                    <span className={`${showPreacherTable ? 'text-[3px]' : 'text-[4px] md:text-[5px]'} font-bold text-slate-500 uppercase leading-none tracking-tighter`}>
                      {d.monthName}
                    </span>
                    <span className={`${showPreacherTable ? 'text-[3px]' : 'text-[4px] md:text-[5px]'} font-bold text-slate-500 uppercase leading-none tracking-tighter`}>
                      {SHORT_WEEKDAYS[d.weekdayIndex]}
                    </span>
                  </div>

                  {activeTab === 'admin' && isAdminAuthenticated && (
                    <button 
                      onClick={() => setSelectedDayForEvent(d.dateKey)} 
                      className="absolute top-2 right-2 z-10 px-2 py-1 text-[7px] font-black uppercase transition-all shadow-sm bg-black/5 text-black/40 hover:bg-black/10 rounded-md"
                    >
                      Змінити
                    </button>
                  )}

                  {/* Right Column: Events */}
                  <div className={`flex-grow ${showPreacherTable ? 'pl-0.5 pr-1 py-1 space-y-0.5' : 'pl-1 pr-2 py-2 space-y-1'} min-h-[40px] min-w-0`}>
                    {dayEvents.length > 0 ? dayEvents.map((ev, i) => {
                      const isCleaning = ev.title?.toUpperCase().replace(/\s+/g, '').includes('ПРИБИРАННЯ');
                      const leadsCount = ev.leads?.filter(l => l).length || 0;
                      
                      return (
                          <div 
                            key={i} 
                            className={`grid ${showPreacherTable ? 'grid-cols-[auto_6.5fr_125px]' : 'grid-cols-[auto_7.5fr_105px] md:grid-cols-[auto_8.5fr_90px] lg:grid-cols-[180px_5fr_200px]'} items-stretch ${showPreacherTable ? 'gap-0.5' : 'gap-0.5 md:gap-2 lg:gap-4'} ${showPreacherTable ? 'py-px px-1 pl-1' : 'py-0.5 md:py-1 lg:py-3 pl-1 md:pl-1.5 lg:pl-3 pr-0.5 md:pr-1 lg:pr-3'} ${showPreacherTable ? 'rounded-lg' : 'rounded-xl md:rounded-2xl lg:rounded-2xl'} border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all relative group/event overflow-hidden ${isCleaning ? 'bg-slate-200' : 'bg-white'}`}
                          >
                          {/* Accent line - following the curve */}
                          <div className={`absolute left-0 top-0 bottom-0 ${showPreacherTable ? 'w-[1.5px]' : 'w-[2px] md:w-[2.5px]'} opacity-90`} style={{ backgroundColor: ev.textColor }} />
                          
                          {/* Col 1: Location & Time */}
                          <div className={`col-span-1 flex flex-col gap-0 border ${showPreacherTable ? 'rounded-md' : 'rounded-lg md:rounded-xl'} ${showPreacherTable ? 'px-0.5 py-0' : 'px-1 md:px-2 py-0.5 md:py-1'} min-w-0 phone-landscape-no-wrap`} style={{ borderColor: darkenHex(WEEKDAY_COLORS[d.weekdayIndex], 0.15) }}>
                            <div className={`flex items-center gap-0 md:gap-1 text-blue-600 font-normal ${showPreacherTable ? 'text-[3px]' : 'text-[4px] md:text-[6px] lg:text-[12px]'} uppercase tracking-tight`}>
                              <MapPin size={showPreacherTable ? 3 : 4} className="shrink-0 md:w-1.5 md:h-1.5 lg:w-1.5 lg:h-1.5" />
                              <span className="whitespace-nowrap min-w-0 flex-1">{ev.place || '—'}</span>
                            </div>
                            <div className={`flex items-center gap-0 md:gap-1 text-slate-600 font-bold ${showPreacherTable ? 'text-[3px]' : 'text-[4px] md:text-[6px] lg:text-[12px]'}`}>
                              <Clock size={showPreacherTable ? 3 : 4} className="text-blue-500 shrink-0 md:w-1.5 md:h-1.5 lg:w-1.5 lg:h-1.5" />
                              <span className="whitespace-nowrap">{ev.startTime}{ev.endTime ? `-${ev.endTime}` : ''}</span>
                            </div>
                          </div>

                          {/* Col 2: Event & Music */}
                          <div className={`${isCleaning ? 'col-span-2' : 'col-span-1'} flex flex-col gap-0.5 md:gap-1 border ${showPreacherTable ? 'rounded-md' : 'rounded-lg md:rounded-xl'} ${showPreacherTable ? 'px-1 py-0.5' : 'px-1.5 md:px-2 py-1 md:py-1.5'} min-w-0 ${ev.align === 'center' ? 'text-center items-center' : ev.align === 'right' ? 'text-right items-end' : 'text-left items-start'}`} style={{ borderColor: darkenHex(WEEKDAY_COLORS[d.weekdayIndex], 0.15) }}>
                            <div 
                              className={`${showPreacherTable ? 'text-[6px]' : 'text-[clamp(7px,1.5vw,14px)] lg:text-[18px]'} leading-tight tracking-tight group-hover/event:scale-[1.01] transition-transform w-full whitespace-pre-wrap break-words min-w-0 ${ev.isBold !== false ? 'font-black' : 'font-medium'} ${ev.isItalic === true ? 'italic' : ''} ${ev.isUnderline === true ? 'underline' : ''} ${ev.isUppercase !== false ? 'uppercase' : ''}`}
                              style={{ color: ev.textColor }}
                            >
                              {ev.title || ''}
                            </div>
                            {ev.music && (
                              <div className={`${showPreacherTable ? 'text-[4px]' : 'text-slate-500 italic text-[clamp(5px,1vw,10px)]'} leading-tight font-semibold flex items-center gap-0.5 md:gap-1 bg-blue-50/30 px-1 md:px-1.5 py-0.5 rounded-md md:rounded-lg w-fit max-w-full`}>
                                <Music size={showPreacherTable ? 4 : 6} className={`shrink-0 self-center ${showPreacherTable ? '' : 'text-blue-400 md:w-2 md:h-2 lg:w-2.5 lg:h-2.5'}`} />
                                <span className="break-words min-w-0 flex-1">{ev.music}</span>
                              </div>
                            )}
                          </div>

                          {/* Col 3: Ministers - Tight List */}
                          {!isCleaning && (
                            <div className={`col-span-1 flex flex-col gap-0.5 border ${showPreacherTable ? 'rounded-md' : 'rounded-lg md:rounded-xl lg:rounded-lg'} ${showPreacherTable ? 'px-0.5 pt-0.5' : 'px-1 md:px-2 lg:px-1 pt-0.5 md:pt-1 lg:pt-0.5'} min-w-0 phone-landscape-no-wrap`} style={{ borderColor: darkenHex(WEEKDAY_COLORS[d.weekdayIndex], 0.15) }}>
                              {ev.leads?.filter(l => l).map((lead, lIdx) => (
                                <div key={lIdx} className={`text-[#003366] font-medium ${showPreacherTable ? 'text-[7px]' : 'text-[6px] md:text-[11px] lg:text-[13px]'} leading-none flex items-start gap-1 md:gap-1.5 py-px min-w-0`}>
                                  <span className="min-w-0 flex-1">{lead}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }) : (
                      <div className="h-full flex items-center justify-center p-6 text-[10px] uppercase font-black text-black/5 tracking-[0.2em] italic">Порожньо</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          </div>
          {showPreacherTable && (
            <div className="w-2/3">
              <PreacherAssignment 
                staffGroups={staffGroups} 
                events={events} 
                db={db} 
                appId={appId} 
                doc={doc} 
                setDoc={setDoc} 
                backgroundColor={appSettings.backgroundColor} 
                isWaitingForTableSelection={false}
                selectedCalendarCell={null}
              />
            </div>
          )}
          </div>
        )}
        </main>
      </div>

      {/* Settings Modal */}
      {isEditingSettings && createPortal(
        <SettingsModal 
          appSettings={appSettings} 
          setAppSettings={setAppSettings} 
          setIsEditingSettings={setIsEditingSettings} 
          handleSaveSettings={handleSaveSettings}
          ColorPicker={ColorPicker}
          X={X}
        />,
        document.body
      )}

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
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-800/50">
              {(() => {
                const dayEvents = getDayEvents(selectedDayForEvent, floatingDate);
                return (
                  <>
                    {dayEvents.map((ev, i) => {
                      const isEditing = editingEventIndex === i;
                      const isMainEvent = eventGroups.find(g => g.items.includes(ev.title))?.label.includes('ОСНОВНІ ТА СВЯТА');
                      const isAssignmentDisabled = isAssignmentModalOpen && !isMainEvent;
                      
                      if (!isEditing) {
                        return (
                          <div key={i} className="relative group">
                            <div 
                              className={`flex flex-col overflow-hidden border border-slate-200 shadow-md rounded-xl bg-white/90 p-2 pl-1.5 space-y-1 relative ${isAssignmentDisabled ? 'opacity-50' : ''}`}
                            >
                              {/* Accent line - following the curve */}
                              <div className="absolute left-0 top-0 bottom-0 w-[2px] opacity-90" style={{ backgroundColor: ev.textColor || '#cbd5e1' }} />
                              
                              {/* Row 1: Place + Time */}
                              <div className="flex justify-between items-center gap-2">
                                <div className="flex flex-row flex-wrap gap-1.5 items-center">
                                  {ev.place && (
                                    <div className="text-slate-500 font-bold flex items-center gap-1 bg-white/50 px-1 text-[7px] break-words">
                                      <MapPin size={7} className="shrink-0"/> <span className="break-words min-w-0 flex-1">{ev.place}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1 text-[7px] font-bold text-slate-600 bg-black/5 px-1 py-0.5">
                                    <Clock size={8} className="text-blue-500"/> {ev.startTime}{ev.endTime ? ` - ${ev.endTime}` : ''}
                                  </div>
                                </div>
                                <div className="flex gap-1 ml-auto">
                                    <button 
                                      onClick={() => setEditingEventIndex(i)}
                                      className={`p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors ${isAssignmentDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                      disabled={isAssignmentDisabled}
                                    >
                                      <Pencil size={12}/>
                                    </button>
                                    <button 
                                      onClick={() => {
                                        const dayEvents = getDayEvents(selectedDayForEvent, floatingDate);
                                        const updated = dayEvents.filter((_, idx) => idx !== i);
                                        setEvents(prev => {
                                          const existing = prev.find(d => d.id === selectedDayForEvent);
                                          if (existing) return prev.map(d => d.id === selectedDayForEvent ? { ...d, events: updated } : d);
                                          return [...prev, { id: selectedDayForEvent, events: updated }];
                                        });
                                        commitToDB(selectedDayForEvent, updated, false);
                                      }}
                                      className={`p-1 text-red-600 hover:bg-red-50 rounded transition-colors ${isAssignmentDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                      disabled={isAssignmentDisabled}
                                    >
                                      <Trash2 size={12}/>
                                    </button>
                                </div>
                              </div>

                              {/* Row 2: Event Title */}
                              <div className={`text-[9px] leading-tight ${ev.isBold !== false ? 'font-black' : 'font-medium'} ${ev.isItalic === true ? 'italic' : ''} ${ev.isUnderline === true ? 'underline' : ''} ${ev.isUppercase !== false ? 'uppercase' : ''}`} style={{ color: ev.textColor }}>
                                {ev.title || 'Без назви'}
                              </div>

                              {/* Row 3: Participants */}
                              {ev.leads?.some(l => l) && (
                                <div className="text-[#003366] font-medium break-words text-[7px]">
                                  ● {ev.leads.filter(l => l).join(', ')}
                                </div>
                              )}

                              {/* Row 4: Music */}
                              {ev.music && (
                                <div className="text-slate-400 italic text-[7px]">
                                  ♫ {ev.music}
                                </div>
                              )}

                              {/* Pin Icon */}
                              {(() => {
                                const isPinned = pinnedEvents.some(p => 
                                  p.weekday === floatingDate.getDay() && 
                                  p.title === ev.title && 
                                  p.startTime === ev.startTime &&
                                  p.place === ev.place
                                );
                                return (
                                  <button 
                                    onClick={() => togglePinEvent(ev, floatingDate.getDay())}
                                    className={`absolute bottom-1 right-1 p-1 rounded-full transition-all ${isPinned ? 'text-red-600 bg-red-100 shadow-md' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-100'}`}
                                    title={isPinned ? "Відкріпити" : "Закріпити на кожен місяць"}
                                  >
                                    <Pin size={10} className={isPinned ? "fill-current" : ""}/>
                                  </button>
                                );
                              })()}
                            </div>
                          </div>
                        );
                      }

                      const currentTemplate = (appSettings.eventTemplates || []).find(t => t.id === ev.templateId) || (appSettings.eventTemplates || [])[0] || { fields: ['startTime', 'endTime', 'place', 'leads', 'music', 'formatting', 'colors'] };

                      return (
                        <div key={i} className="p-3 rounded-xl border border-black/20 relative space-y-2 shadow-lg bg-[#7c8f9b]">
                          <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-white/10">
                            <div className="flex items-center gap-1.5">
                              <label className="text-[7px] font-black text-white/50 uppercase tracking-tighter">Шаблон:</label>
                              <select 
                                value={ev.templateId || ''} 
                                onChange={(e) => updateLocalDetails(selectedDayForEvent, i, 'templateId', e.target.value)}
                                className="bg-black/30 text-white text-[8px] font-bold rounded-md px-1.5 py-0.5 outline-none border border-white/5 hover:bg-black/40 transition-colors"
                              >
                                {(appSettings.eventTemplates || []).map((t: any) => (
                                  <option key={t.id} value={t.id} className="bg-slate-800">{t.name}</option>
                                ))}
                              </select>
                            </div>
                            <button 
                              onClick={async () => {
                                const dayEvents = getDayEvents(selectedDayForEvent, floatingDate);
                                const updated = dayEvents.filter((_, idx) => idx !== i);
                                
                                const weekday = floatingDate.getDay();
                                const docId = `${weekday}_${ev.title}_${ev.startTime}_${ev.place}`.replace(/[^a-zA-Z0-9]/g, '_');
                                const isPinned = pinnedEvents.some(p => p.id === docId);
                                if (isPinned) {
                                  await togglePinEvent(ev, weekday);
                                }
                                
                                setEvents(prev => {
                                  const existing = prev.find(d => d.id === selectedDayForEvent);
                                  if (existing) return prev.map(d => d.id === selectedDayForEvent ? { ...d, events: updated } : d);
                                  return [...prev, { id: selectedDayForEvent, events: updated }];
                                });
                                setEditingEventIndex(null);
                              }} 
                              disabled={userRole === 'singer_manager'}
                              className={`bg-red-500/80 text-white p-1 rounded-full shadow-md hover:bg-red-500 transition-all ${userRole === 'singer_manager' ? 'opacity-0 pointer-events-none' : ''}`}
                            >
                              <Trash2 size={9}/>
                            </button>
                          </div>
                          
                          {currentTemplate.fields.some(f => ['colors', 'formatting'].includes(f)) && (
                            <div className="flex flex-col gap-2 pb-1.5 border-b border-black/10">
                                 {currentTemplate.fields.includes('colors') && (
                                   <div className="flex flex-wrap gap-1 justify-center">
                                     {textColors.map(c => (
                                       <button 
                                         key={c} 
                                         onClick={() => updateLocalDetails(selectedDayForEvent, i, 'textColor', c)} 
                                         disabled={userRole === 'singer_manager'}
                                         className={`w-3 h-3 rounded-full transition-all ${ev.textColor?.toLowerCase() === c.toLowerCase() ? 'scale-125 ring-2 ring-offset-1 ring-blue-400' : 'hover:scale-110'} ${userRole === 'singer_manager' ? 'opacity-50 cursor-not-allowed' : ''}`} 
                                         style={{ backgroundColor: c }} 
                                       />
                                     ))}
                                   </div>
                                 )}
                                 {currentTemplate.fields.includes('formatting') && (
                                   <div className="flex flex-wrap gap-2 items-center justify-center">
                                     <div className="flex gap-1 bg-black/10 p-0.5 rounded-lg">
                                       {[
                                         { id: 'left', icon: AlignLeft },
                                         { id: 'center', icon: AlignCenter },
                                         { id: 'right', icon: AlignRight }
                                       ].map(a => (
                                         <button
                                           key={a.id}
                                           onClick={() => updateLocalDetails(selectedDayForEvent, i, 'align', a.id)}
                                           disabled={userRole === 'singer_manager'}
                                           className={`p-1 rounded transition-colors ${ev.align === a.id ? 'bg-white text-blue-600 shadow-sm' : 'text-white/60 hover:text-white'} ${userRole === 'singer_manager' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                         >
                                           <a.icon size={12} />
                                         </button>
                                       ))}
                                     </div>
                                     <div className="w-px h-4 bg-black/10 mx-1" />
                                     <div className="flex gap-1 bg-black/10 p-0.5 rounded-lg">
                                       <button onClick={() => updateLocalDetails(selectedDayForEvent, i, 'isBold', ev.isBold === false ? true : false)} disabled={userRole === 'singer_manager'} className={`p-1 rounded transition-colors ${ev.isBold !== false ? 'bg-white text-blue-600 shadow-sm' : 'text-white/60 hover:text-white'} ${userRole === 'singer_manager' ? 'opacity-50 cursor-not-allowed' : ''}`}><Bold size={12} /></button>
                                       <button onClick={() => updateLocalDetails(selectedDayForEvent, i, 'isItalic', ev.isItalic === true ? false : true)} disabled={userRole === 'singer_manager'} className={`p-1 rounded transition-colors ${ev.isItalic === true ? 'bg-white text-blue-600 shadow-sm' : 'text-white/60 hover:text-white'} ${userRole === 'singer_manager' ? 'opacity-50 cursor-not-allowed' : ''}`}><Italic size={12} /></button>
                                       <button onClick={() => updateLocalDetails(selectedDayForEvent, i, 'isUnderline', ev.isUnderline === true ? false : true)} disabled={userRole === 'singer_manager'} className={`p-1 rounded transition-colors ${ev.isUnderline === true ? 'bg-white text-blue-600 shadow-sm' : 'text-white/60 hover:text-white'} ${userRole === 'singer_manager' ? 'opacity-50 cursor-not-allowed' : ''}`}><Underline size={12} /></button>
                                       <button onClick={() => updateLocalDetails(selectedDayForEvent, i, 'isUppercase', ev.isUppercase === false ? true : false)} disabled={userRole === 'singer_manager'} className={`p-1 rounded transition-colors ${ev.isUppercase !== false ? 'bg-white text-blue-600 shadow-sm' : 'text-white/60 hover:text-white'} ${userRole === 'singer_manager' ? 'opacity-50 cursor-not-allowed' : ''}`}><Type size={12} /></button>
                                     </div>
                                   </div>
                                 )}
                            </div>
                          )}

                          <div className="flex flex-col gap-2">
                             <div className="space-y-0.5">
                                <label className="text-[8px] font-black text-white uppercase ml-0.5">Подія</label>
                                <div className="flex items-center gap-1">
                                  <CustomSelect 
                                    title="ПОДІЯ"
                                    value={ev.title} 
                                    groups={eventGroups} 
                                    onEditGroup={(g) => setEditingGroup({...g, type: 'event'})}
                                    onAddItem={(item, idx) => handleAddValueToGroup(item, idx, 'event')}
                                    onChange={(v) => updateLocalDetails(selectedDayForEvent, i, 'title', v)} 
                                    placeholder="..." 
                                    className="flex-1"
                                    disabled={isAdminAuthenticated && userRole === 'singer_manager' || activeTab !== 'admin' || isAssignmentModalOpen}
                                    allowAppend={true}
                                  />
                                  {ev.title && <button onClick={() => updateLocalDetails(selectedDayForEvent, i, 'title', "")} disabled={userRole === 'singer_manager'} className={`text-white/50 hover:text-white transition-colors ${userRole === 'singer_manager' ? 'opacity-0 pointer-events-none' : ''}`}><X size={14}/></button>}
                                </div>
                             </div>
                             {currentTemplate.fields.includes('place') && (
                               <div className="space-y-0.5">
                                  <label className="text-[8px] font-black text-white uppercase ml-0.5">Місце</label>
                                  <div className="flex items-center gap-1">
                                    <CustomSelect title="МІСЦЕ" value={ev.place} options={locations} onAddItem={(item) => handleAddValueToGroup(item, 0, 'location')} onChange={(v) => updateLocalDetails(selectedDayForEvent, i, 'place', v)} placeholder="..." className="flex-1" disabled={isAdminAuthenticated && userRole === 'singer_manager' || activeTab !== 'admin' || isAssignmentModalOpen} allowAppend={true} />
                                    {ev.place && <button onClick={() => updateLocalDetails(selectedDayForEvent, i, 'place', "")} disabled={userRole === 'singer_manager'} className={`text-white/50 hover:text-white transition-colors ${userRole === 'singer_manager' ? 'opacity-0 pointer-events-none' : ''}`}><X size={14}/></button>}
                                  </div>
                               </div>
                             )}
                             {(currentTemplate.fields.includes('startTime') || currentTemplate.fields.includes('endTime')) && (
                               <div className="space-y-0.5">
                                  <label className="text-[8px] font-black text-white uppercase ml-0.5">Час</label>
                                  <div className="flex gap-2 w-full items-center">
                                    {currentTemplate.fields.includes('startTime') && (
                                      <div className="text-white flex-1 flex items-center gap-1">
                                        <TimeInput label="" value={ev.startTime} onChange={(v) => updateLocalDetails(selectedDayForEvent, i, 'startTime', v)} disabled={isAdminAuthenticated && userRole === 'singer_manager' || activeTab !== 'admin' || isAssignmentModalOpen} />
                                        {ev.startTime && <button onClick={() => updateLocalDetails(selectedDayForEvent, i, 'startTime', "")} disabled={userRole === 'singer_manager'} className={`text-white/50 hover:text-white transition-colors mt-2 ${userRole === 'singer_manager' ? 'opacity-0 pointer-events-none' : ''}`}><X size={12}/></button>}
                                      </div>
                                    )}
                                    {currentTemplate.fields.includes('startTime') && currentTemplate.fields.includes('endTime') && (
                                      <span className="text-white/50 font-bold self-center mt-2">-</span>
                                    )}
                                    {currentTemplate.fields.includes('endTime') && (
                                      <div className="text-white flex-1 flex items-center gap-1">
                                        <TimeInput label="" value={ev.endTime} onChange={(v) => updateLocalDetails(selectedDayForEvent, i, 'endTime', v)} disabled={isAdminAuthenticated && userRole === 'singer_manager' || activeTab !== 'admin' || isAssignmentModalOpen} />
                                        {ev.endTime && <button onClick={() => updateLocalDetails(selectedDayForEvent, i, 'endTime', "")} disabled={userRole === 'singer_manager'} className={`text-white/50 hover:text-white transition-colors mt-2 ${userRole === 'singer_manager' ? 'opacity-0 pointer-events-none' : ''}`}><X size={12}/></button>}
                                      </div>
                                    )}
                                  </div>
                               </div>
                             )}
                          </div>

                          {!ev.title?.toUpperCase().includes('ПРИБИРАННЯ') && (
                            <>
                              {currentTemplate.fields.includes('leads') && (
                                <div className="space-y-1 pt-1.5 border-t border-black/10">
                                   <label className="text-[8px] font-black text-white uppercase ml-0.5">Служителі (Хто)</label>
                                   <div className="flex flex-col gap-2">
                                     {ev.leads?.map((l, lIdx) => (
                                       <div key={lIdx} className="flex gap-1 items-center w-full">
                                          <CustomSelect title="СЛУЖІННЯ" value={l} groups={staffGroups.filter(g => g.label !== "Хто співає / грає")} onEditGroup={(g) => setEditingGroup({...g, type: 'staff'})} onAddItem={(item, idx) => handleAddValueToGroup(item, idx, 'staff')} onChange={(v) => { const nL = [...ev.leads]; nL[lIdx] = v; updateLocalDetails(selectedDayForEvent, i, 'leads', nL); }} placeholder="Хто..." className="flex-1" disabled={userRole === 'singer_manager'} allowAppend={true} onAssignPreachers={() => {
                                            setPendingAssignmentCallback(() => (val: string) => {
                                              const nL = [...ev.leads];
                                              nL[lIdx] = val;
                                              updateLocalDetails(selectedDayForEvent, i, 'leads', nL);
                                            });
                                            setIsAssignmentModalOpen(true);
                                          }} />
                                          {l && <button onClick={() => { const nL = [...ev.leads]; nL[lIdx] = ""; updateLocalDetails(selectedDayForEvent, i, 'leads', nL); }} disabled={userRole === 'singer_manager'} className={`text-white/50 hover:text-white transition-colors ${userRole === 'singer_manager' ? 'opacity-0 pointer-events-none' : ''}`}><X size={14}/></button>}
                                          {ev.leads.length > 1 && <button onClick={() => updateLocalDetails(selectedDayForEvent, i, 'leads', ev.leads.filter((_, idx) => idx !== lIdx))} className="text-red-200 p-0.5 hover:text-white" disabled={userRole === 'singer_manager'}><X size={14}/></button>}
                                       </div>
                                     ))}
                                     <button onClick={() => updateLocalDetails(selectedDayForEvent, i, 'leads', [...(ev.leads || []), ""])} className="text-[9px] text-white/80 font-black hover:text-white ml-0.5 tracking-wide flex items-center gap-1 h-6" disabled={userRole === 'singer_manager'}><Plus size={10}/> Додати</button>
                                   </div>
                                </div>
                              )}

                              {currentTemplate.fields.includes('music') && (
                                <div className="space-y-0.5">
                                   <label className="text-[8px] font-black text-white uppercase ml-0.5">Музика</label>
                                   <div className="flex items-center gap-1">
                                     <CustomSelect title="МУЗИКА" value={ev.music} groups={musicGroups} onEditGroup={(g) => setEditingGroup({...g, type: 'music'})} onAddItem={(item, idx) => handleAddValueToGroup(item, idx, 'music')} onChange={(v) => updateLocalDetails(selectedDayForEvent, i, 'music', v)} placeholder="..." className="flex-1" disabled={activeTab !== 'admin' || isAssignmentModalOpen} allowAppend={true} />
                                     {ev.music && <button onClick={() => updateLocalDetails(selectedDayForEvent, i, 'music', "")} className="text-white/50 hover:text-white transition-colors"><X size={14}/></button>}
                                   </div>
                                </div>
                              )}
                            </>
                          )}

                          <button 
                            onClick={() => {
                              commitToDB(selectedDayForEvent, dayEvents, false);
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
                disabled={userRole === 'singer_manager'}
                className={`w-full border-2 border-dashed border-slate-600 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 tracking-wider text-slate-400 hover:bg-slate-700/50 hover:text-white hover:border-slate-500 ${userRole === 'singer_manager' ? 'opacity-0 pointer-events-none' : ''}`}
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
                   const dayEvents = getDayEvents(selectedDayForEvent, floatingDate);
                   await commitToDB(selectedDayForEvent, dayEvents, false);
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
               {editingGroup.type !== 'location' && (
                 <div className="mb-3">
                   <span className="text-slate-500 text-[7px] font-bold uppercase tracking-widest leading-none mb-2 block">Копіювати до:</span>
                   <div className="flex gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
                     {editingGroup.type !== 'event' && (
                       <button onClick={() => handleDuplicateGroupTo('event')} className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded text-[7px] font-black uppercase tracking-wider transition-colors shrink-0">
                         <Copy size={8} /> Події
                       </button>
                     )}
                     {editingGroup.type !== 'music' && (
                       <button onClick={() => handleDuplicateGroupTo('music')} className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded text-[7px] font-black uppercase tracking-wider transition-colors shrink-0">
                         <Copy size={8} /> Музика
                       </button>
                     )}
                     {editingGroup.type !== 'staff' && (
                       <button onClick={() => handleDuplicateGroupTo('staff')} className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded text-[7px] font-black uppercase tracking-wider transition-colors shrink-0">
                         <Copy size={8} /> Служіння
                       </button>
                     )}
                   </div>
                 </div>
               )}
               <div className="flex gap-2 mb-3">
                 <input autoFocus type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddItemToGroup()} placeholder="Новий запис..." className="flex-1 bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-white text-[9px] font-bold outline-none focus:border-blue-500 transition-all" spellCheck={false} autoCorrect="off" autoComplete="off" autoCapitalize="off" />
                 <button onClick={handleAddItemToGroup} className="bg-blue-600 text-white px-3 rounded-md text-[8px] font-black uppercase"><Plus size={12}/></button>
               </div>
               <button onClick={() => setEditingGroup(null)} className="w-full bg-slate-700/50 text-slate-300 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-slate-700 transition-colors">Закрити</button>
            </div>
          </div>
        </div>
      )}
      {isAssignmentModalOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h3 className="text-white font-black uppercase text-sm">Призначення проповідників</h3>
              <button onClick={() => setIsAssignmentModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <div className="flex-1 overflow-auto pr-2">
              {/* Monthly Theme Input */}
              {isAdminAuthenticated && (
                <div className="mb-4 p-4 bg-slate-800 rounded-xl border border-slate-700">
                  <label className="text-blue-500 text-[9px] font-bold uppercase tracking-widest mb-2 block">Текст місяця</label>
                  <textarea
                    value={monthlyThemes[currentMonthKey] || ""}
                    onChange={(e) => {
                      setMonthlyThemes(prev => ({ ...prev, [currentMonthKey]: e.target.value }));
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onFocus={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onBlur={(e) => saveTheme(currentMonthKey, e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white font-serif italic outline-none focus:border-blue-500 transition-all resize-none"
                    rows={2}
                    placeholder="(Введіть текст місяця)"
                  />
                </div>
              )}

              <PreacherAssignment 
                staffGroups={staffGroups} 
                events={events} 
                db={db} 
                appId={appId} 
                doc={doc} 
                setDoc={setDoc} 
                backgroundColor={appSettings.backgroundColor} 
                isWaitingForTableSelection={true}
                selectedCalendarCell={{ dateKey: selectedDayForEvent }}
                onAssignmentComplete={(data) => {
                  if (pendingAssignmentCallback && data?.assignment) {
                    pendingAssignmentCallback(data.assignment);
                    setPendingAssignmentCallback(null);
                    setIsAssignmentModalOpen(false); // Close modal only after callback is executed
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-[320px] rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-5 text-center">
              <div className="w-12 h-12 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-white font-black uppercase text-xs mb-2 tracking-widest">{confirmAction.title}</h3>
              <p className="text-slate-400 text-[10px] font-medium leading-relaxed">{confirmAction.message}</p>
            </div>
            <div className="flex border-t border-slate-700">
              <button 
                onClick={() => setConfirmAction(null)}
                className="flex-1 px-4 py-3 text-slate-400 text-[9px] font-black uppercase tracking-widest hover:bg-slate-700/50 transition-colors border-r border-slate-700"
              >
                Скасувати
              </button>
              <button 
                onClick={confirmAction.onConfirm}
                className="flex-1 px-4 py-3 text-red-500 text-[9px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-colors"
              >
                Видалити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
