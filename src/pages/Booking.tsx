import { useNavigate } from 'react-router-dom';

import { 
  ArrowLeft, Plus, Trash2, CheckCircle2, Copy, Send, 
  User, Bed, Home, FileText
} from 'lucide-react';
import { useStore } from '../store';
import { usePIDSearch } from '../utils';
import { useEmailGenerator } from '../emailGenerator';
import { useState, useEffect } from 'react';

// 房间类型配置
const roomTypesConfig = {
  HIR: [
    { types: ['TSTS', 'TSTN', 'KPUS', 'TPUN', 'TPU'], promotion: 188 },
    { types: ['TVUN', 'TVUS', 'KLON', 'KLOS'], promotion: 188 },
    { types: ['KOTS', 'TOTS'], promotion: 388 },
    { types: ['XOTN', 'XOTS', 'XFTN', 'XFTS', 'XLOS', 'XCIS'], promotion: 888 },
    { types: ['X2ON', 'X2OS', 'XDBS'], promotion: 1888 },
    { types: ['XVUN', 'XVUS'], promotion: 2188 },
    { types: ['X2AN', 'X2AS'], promotion: 3188 }
  ],
  IC: [
    { types: ['KDXN', 'KDXS', 'TDXN', 'TDXS', 'KLON', 'KLOS', 'TLON', 'TLOS'], promotion: 188 },
    { types: ['KOTS', 'KOTN', 'TOTS', 'TOTN'], promotion: 188 },
    { types: ['KVUS', 'KVUN', 'TVUS', 'TVUN'], promotion: 388 },
    { types: ['XEXS', 'XEXN', 'XOTS', 'XOTN', 'XVUS', 'XVUN'], promotion: 3188 },
    { types: ['XFTS', 'XFTN', 'XLOS', 'XLON'], promotion: 3888 }
  ]
};

// Agent 列表
const agents = ['IM', 'A03 Tun Naing', 'A171 Pham Duc Huy', 'Le Cong Ly Thanh', 'Wang Kan', 'Chen Cheng Chia'];
const authorizers = ['Kevin Loh', 'IMHUYT', 'Nan.Hao', 'Kingz Chock', 'Jian.Xu'];

// V2.0.24: 实时预览面板
function LivePreviewPanel({ email, isVisible, onClose }: { email: string | null; isVisible: boolean; onClose: () => void }) {
  if (!isVisible || !email) return null;
  
  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 w-80 max-h-[70vh] bg-white dark:bg-slate-800 rounded-l-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 hidden lg:flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700">
        <span className="font-semibold text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <FileText size={16} />
          Live Preview
        </span>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">×</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
        {email}
      </div>
    </div>
  );
}

// V2.0.42: 移动端底部操作栏
function MobileActionBar({ onGenerate, onCopy, onSend, onBack, canCopy, canSend }: {
  onGenerate: () => void;
  onCopy: () => void;
  onSend: () => void;
  onBack: () => void;
  canCopy: boolean;
  canSend: boolean;
}) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-3 z-50 shadow-lg">
      <div className="grid grid-cols-2 gap-2">
        <button onClick={onGenerate} className="py-3 px-4 bg-violet-600 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2">
          <Send size={16} /> Generate
        </button>
        <button onClick={onCopy} disabled={!canCopy} className="py-3 px-4 bg-slate-600 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50">
          <Copy size={16} /> Copy
        </button>
        <button onClick={onSend} disabled={!canSend} className="py-3 px-4 bg-emerald-600 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50">
          <Send size={16} /> Send
        </button>
        <button onClick={onBack} className="py-3 px-4 bg-slate-400 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2">
          <Home size={16} /> Back to Home
        </button>
      </div>
    </div>
  );
}

// PID 输入组件 - 极简版，无 useEffect 搜索
function PIDInput({ oldPID, newPID, name, onOldPIDChange, onNewPIDChange, onNameChange, disabled = false, label = 'Guest', required = false }: {
  oldPID: string; newPID: string; name: string;
  onOldPIDChange: (val: string) => void; onNewPIDChange: (val: string) => void; onNameChange: (val: string) => void;
  disabled?: boolean; label?: string; required?: boolean;
}) {
  const { pidDatabase } = usePIDSearch();
  
  // 手动搜索函数，通过按钮触发
  const handleSearch = () => {
    if (!pidDatabase.loaded || (!oldPID && !newPID)) return;
    
    const old = oldPID.trim();
    const nw = newPID.trim();
    
    // 优先搜索 Old PID
    if (old) {
      const uniqueID = pidDatabase.oldPIDIndex.get(old);
      if (uniqueID) {
        const record = pidDatabase.records.get(uniqueID);
        if (record) {
          onNameChange(record.name.toUpperCase());
          if (record.newPID && !nw) onNewPIDChange(record.newPID);
          return;
        }
      }
    }
    
    // 搜索 New PID
    if (nw) {
      const uniqueID = pidDatabase.newPIDIndex.get(nw);
      if (uniqueID) {
        const record = pidDatabase.records.get(uniqueID);
        if (record) {
          onNameChange(record.name.toUpperCase());
          if (record.oldPID && !old) onOldPIDChange(record.oldPID);
        }
      }
    }
  };
  
  const getInputClass = (hasValue: boolean, isRequired = false) => {
    const base = "w-full px-3 py-2 rounded-lg border text-sm transition-colors";
    if (disabled) return base + " bg-slate-100 dark:bg-slate-800 cursor-not-allowed";
    if (isRequired && !hasValue) return base + " border-red-500 bg-red-50 dark:bg-red-900/20";
    if (hasValue) return base + " border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20";
    return base + " border-slate-300 dark:border-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-800";
  };
  
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1 text-slate-600 dark:text-slate-400">Old PID</label>
          <input type="text" inputMode="numeric" value={oldPID} onChange={(e) => onOldPIDChange(e.target.value)} disabled={disabled} className={getInputClass(!!oldPID)} placeholder="Enter Old PID" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-slate-600 dark:text-slate-400">New PID</label>
          <input type="text" inputMode="numeric" value={newPID} onChange={(e) => onNewPIDChange(e.target.value)} disabled={disabled} className={getInputClass(!!newPID)} placeholder="Enter New PID" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-xs font-medium mb-1 text-slate-600 dark:text-slate-400">{label} Name {required && <span className="text-red-500">*</span>}</label>
          <input type="text" inputMode="text" value={name} onChange={(e) => onNameChange(e.target.value.toUpperCase())} disabled={disabled}
            className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors ${required && !name ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : name ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-300 dark:border-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-800'}`} placeholder="Enter name or search from PID" />
        </div>
        <div className="flex items-end">
          <button onClick={handleSearch} disabled={!pidDatabase.loaded || (!oldPID && !newPID)} className="px-3 py-2 bg-violet-600 text-white rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed">Search</button>
        </div>
      </div>
      {!pidDatabase.loaded && (oldPID || newPID) && <div className="text-xs text-blue-600 dark:text-blue-400">⚠️ Please import PID database first</div>}
    </div>
  );
}

// V2.0.40: Sharer输入组件
function SharerInput({ sharer, onUpdate, onRemove, index }: {
  sharer: { id: number; oldPID: string; newPID: string; name: string };
  onUpdate: (data: Partial<{ oldPID: string; newPID: string; name: string }>) => void;
  onRemove: () => void;
  index: number;
}) {
  return (
    <div className="p-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-900/30">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Sharer #{index + 1}</span>
        <button onClick={onRemove} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={12} /> Remove</button>
      </div>
      <PIDInput oldPID={sharer.oldPID} newPID={sharer.newPID} name={sharer.name} onOldPIDChange={(val) => onUpdate({ oldPID: val })} onNewPIDChange={(val) => onUpdate({ newPID: val })} onNameChange={(val) => onUpdate({ name: val })} label="Sharer" />
    </div>
  );
}

// Room Booking 表单 - 简化版，避免循环
function RoomBookingForm() {
  const { booking, updateRoomBooking, addGuest, removeGuest, updateGuest, addSharer, removeSharer, updateSharer } = useStore();
  const rb = booking.roomBooking;
  if (!rb) return null;
  
  const [dateRange, setDateRange] = useState({ start: rb.checkIn, end: rb.checkOut });
  
  // 直接传递匿名函数，让子组件用 ref 缓存
  
  const handleDateChange = (field: 'start' | 'end', value: string) => {
    const newRange = { ...dateRange, [field]: value };
    setDateRange(newRange);
    if (field === 'start') updateRoomBooking({ checkIn: value }); else updateRoomBooking({ checkOut: value });
  };
  
  const nights = dateRange.start && dateRange.end ? Math.max(0, Math.round((new Date(dateRange.end).getTime() - new Date(dateRange.start).getTime()) / (1000 * 60 * 60 * 24))) : 0;
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white"><Bed size={20} className="text-violet-500" /> Room Booking Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Agent <span className="text-red-500">*</span></label>
          <input list="agentList" value={rb.agent} onChange={(e) => updateRoomBooking({ agent: e.target.value })} className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors ${rb.agent ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20'}`} placeholder="Select or type agent" />
          <datalist id="agentList">{agents.map(a => <option key={a} value={a} />)}</datalist>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Hotel <span className="text-red-500">*</span></label>
          <div className="flex gap-3">
            <button onClick={() => updateRoomBooking({ hotel: 'IC' })} className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${rb.hotel === 'IC' ? 'bg-violet-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>IC</button>
            <button onClick={() => updateRoomBooking({ hotel: 'HIR' })} className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${rb.hotel === 'HIR' ? 'bg-violet-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>HIR</button>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Check In <span className="text-red-500">*</span></label>
          <input type="date" value={dateRange.start} onChange={(e) => handleDateChange('start', e.target.value)} className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors ${dateRange.start ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20'}`} />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Check Out <span className="text-red-500">*</span></label>
          <input type="date" value={dateRange.end} onChange={(e) => handleDateChange('end', e.target.value)} className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors ${dateRange.end ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20'}`} />
          {nights > 0 && <span className="text-xs text-violet-600 dark:text-violet-400 mt-1 block">{nights} night{nights > 1 ? 's' : ''}</span>}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Authorizer</label>
          <input list="authorizerList" value={rb.authorizer} onChange={(e) => updateRoomBooking({ authorizer: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 text-sm" placeholder="Select or type authorizer" />
          <datalist id="authorizerList">{authorizers.map(a => <option key={a} value={a} />)}</datalist>
        </div>
      </div>
      
      <h3 className="text-md font-semibold mb-3 text-slate-700 dark:text-slate-300">Guest Information</h3>
      <div className="space-y-4">
          {rb.guests.map((guest, idx) => (
            <div key={guest.id} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"><User size={16} /> Guest #{idx + 1}</span>
                <button onClick={() => removeGuest(guest.id)} className="text-red-500 hover:text-red-600 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"><Trash2 size={16} /></button>
              </div>
              <PIDInput oldPID={guest.oldPID} newPID={guest.newPID} name={guest.name} onOldPIDChange={(val) => updateGuest(guest.id, { oldPID: val })} onNewPIDChange={(val) => updateGuest(guest.id, { newPID: val })} onNameChange={(val) => updateGuest(guest.id, { name: val })} required />
              
              <div className="mt-3">
                <label className="block text-xs font-medium mb-1 text-slate-600 dark:text-slate-400">Room Type <span className="text-red-500">*</span></label>
                {rb.hotel && (
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {rb.hotel === 'IC' ? (
                      <>{['KVUS', 'TVUS', 'TOTS'].map(type => <button key={type} onClick={() => updateGuest(guest.id, { roomType: type })} className={`px-3 py-1.5 text-xs rounded-md border transition-all ${guest.roomType === type ? 'bg-violet-600 text-white border-violet-600 shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-violet-400'}`}>{type}</button>)}</>
                    ) : (
                      <>{['TVUS', 'KLON', 'TSTS'].map(type => <button key={type} onClick={() => updateGuest(guest.id, { roomType: type })} className={`px-3 py-1.5 text-xs rounded-md border transition-all ${guest.roomType === type ? 'bg-violet-600 text-white border-violet-600 shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-violet-400'}`}>{type}</button>)}</>
                    )}
                  </div>
                )}
                <select value={guest.roomType || ''} onChange={(e) => updateGuest(guest.id, { roomType: e.target.value })} className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors ${guest.roomType ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20'}`}>
                  <option value="">Select Room Type</option>
                  {rb.hotel && roomTypesConfig[rb.hotel]?.map((group) => <optgroup key={group.promotion} label={`${group.promotion} pts`}>{group.types.map((type) => <option key={type} value={type}>{type} ({group.promotion} pts)</option>)}</optgroup>)}
                </select>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Sharers</span>
                  <button onClick={() => addSharer(guest.id)} className="text-xs text-violet-600 dark:text-violet-400 flex items-center gap-1 px-2 py-1 rounded hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"><Plus size={14} /> Add Sharer</button>
                </div>
                <div className="space-y-3">
                  {guest.sharers.map((sharer, sharerIdx) => <SharerInput key={sharer.id} sharer={sharer} index={sharerIdx} onUpdate={(data) => updateSharer(guest.id, sharer.id, data)} onRemove={() => removeSharer(guest.id, sharer.id)} />)}
                  {guest.sharers.length === 0 && <div className="text-xs text-slate-400 dark:text-slate-500 italic py-2">No sharers added. Click "Add Sharer" to add room sharers.</div>}
                </div>
              </div>
            </div>
          ))}
      </div>
      <button onClick={addGuest} className="mt-4 w-full py-2.5 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors flex items-center justify-center gap-2 font-medium"><Plus size={18} /> Add Guest</button>
    </div>
  );
}

export default function Booking() {
  const navigate = useNavigate();
  const { booking, resetAll, darkMode } = useStore();
  const { generateAllEmails } = useEmailGenerator();
  const [generatedEmail, setLocalGeneratedEmail] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  // 只在showPreview变化时生成邮件，避免无限循环
  useEffect(() => {
    if (showPreview) {
      const result = generateAllEmails();
      if (result) setLocalGeneratedEmail(result.email);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPreview]);
  
  const handleSaveToSheets = async () => {
    const rb = booking.roomBooking;
    if (!rb || rb.guests.filter(g => g.name).length === 0) { alert('No guest data to save!'); return; }
    setSaveStatus('saving');
    setTimeout(() => {
      const guestCount = rb.guests.filter(g => g.name).length;
      setSaveStatus('saved');
      setSuccessMessage(`✓ Successfully saved ${guestCount} guest(s) to Google Sheets`);
    }, 500);
  };
  
  const handleGenerate = () => {
    const result = generateAllEmails();
    if (result) {
      setLocalGeneratedEmail(result.email);
      // 移除 store 更新，避免循环: setGeneratedEmail(result.email, result.subject);
      setShowPreview(true);
    }
  };
  
  const handleCopy = async () => {
    if (!generatedEmail) { alert('Please generate email first!'); return; }
    try {
      await navigator.clipboard.writeText(generatedEmail);
      setSuccessMessage('✓ Copied! Paste directly into Outlook / Gmail.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch { alert('Copy failed. Please copy manually.'); }
  };
  
  const handleSend = () => {
    if (!generatedEmail) { alert('Please generate email first!'); return; }
    const subjectMatch = generatedEmail.match(/Subject:\s*(.+?)$/m);
    const subject = subjectMatch ? subjectMatch[1].trim() : 'Booking Request';
    const body = generatedEmail.replace(/^Subject:\s*.+?\n+/m, '').trim();
    const recipients = ['concierge@thegrandhotram.com', 'Front.Desk@thegrandhotram.com', 'grandservice@thegrandhotram.com', 'HIR.receptionist@thegrandhotram.com', 'IC.receptionist@thegrandhotram.com', 'Guestrelations.Management@thegrandhotram.com', 'rooms.coordinator@thegrandhotram.com'].join(',');
    const ccRecipients = ['rewards@thegrandhotram.com', 'im.gcsea@thegrandhotram.com', 'HTR@thegrandhotram.com'].join(',');
    window.location.href = `mailto:${recipients}?cc=${ccRecipients}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  
  const handleBack = () => { resetAll(); navigate('/'); };
  
  return (
    <div className={`min-h-screen transition-colors duration-300 pb-24 md:pb-0 ${darkMode ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'}`}>
      <nav className="relative z-10 w-full px-4 md:px-6 py-4 flex items-center gap-4">
        <button onClick={handleBack} className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-200 text-slate-600'}`}><ArrowLeft size={20} /></button>
        <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{booking.isOneDayTripMode ? 'ONE DAY TRIP — Patron Registration' : `Selected: ${Array.from(booking.selectedServices).join(', ')}`}</div>
      </nav>
      
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-6 space-y-6">
        {booking.selectedServices.has('room') && <RoomBookingForm />}
        
        <div className="hidden md:flex flex-wrap gap-3">
          <button onClick={handleGenerate} className="px-6 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2"><Send size={18} /> Generate Email</button>
          <button onClick={handleCopy} disabled={!generatedEmail} className="px-6 py-2.5 bg-slate-700 dark:bg-slate-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"><Copy size={18} /> Copy</button>
          <button onClick={handleSend} disabled={!generatedEmail} className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"><Send size={18} /> Send Email</button>
          {booking.selectedServices.has('room') && (
            <button onClick={handleSaveToSheets} disabled={saveStatus === 'saving' || saveStatus === 'saved'} className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${saveStatus === 'saved' ? 'bg-green-600 text-white' : 'bg-amber-500 text-white hover:shadow-lg'} ${saveStatus === 'saving' ? 'opacity-75' : ''}`}>
              {saveStatus === 'saving' ? <><span className="animate-spin">⏳</span> Saving...</> : saveStatus === 'saved' ? <><CheckCircle2 size={18} /> Saved</> : <><span>📊</span> Save to Sheets</>}
            </button>
          )}
        </div>
        
        {successMessage && <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700 rounded-lg text-emerald-800 dark:text-emerald-300">{successMessage}</div>}
        
        {showPreview && generatedEmail && (
          <div className="bg-slate-100 dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">Email Preview</h3>
            <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700 dark:text-slate-300 overflow-x-auto">{generatedEmail}</pre>
          </div>
        )}
      </main>
      
      <MobileActionBar onGenerate={handleGenerate} onCopy={handleCopy} onSend={handleSend} onBack={handleBack} canCopy={!!generatedEmail} canSend={!!generatedEmail} />
      <LivePreviewPanel email={generatedEmail} isVisible={showPreview} onClose={() => setShowPreview(false)} />
    </div>
  );
}
