import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Plus, Trash2, CheckCircle2, Copy, Send, 
  User, Bed 
} from 'lucide-react';
import { useStore } from '../store';
import { usePIDSearch } from '../utils';
import { useEmailGenerator } from '../emailGenerator';
import { useState, useEffect, useCallback, useRef } from 'react';

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

// PID 输入组件
function PIDInput({ 
  oldPID, 
  newPID, 
  name, 
  onOldPIDChange, 
  onNewPIDChange, 
  onNameChange,
  disabled = false,
  label = 'Guest'
}: {
  oldPID: string;
  newPID: string;
  name: string;
  onOldPIDChange: (val: string) => void;
  onNewPIDChange: (val: string) => void;
  onNameChange: (val: string) => void;
  disabled?: boolean;
  label?: string;
}) {
  const { searchPID, pidDatabase } = usePIDSearch();
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching' | 'found' | 'notfound'>('idle');
  const [foundName, setFoundName] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const handleSearch = useCallback(() => {
    if (!oldPID && !newPID) {
      setSearchStatus('idle');
      onNameChange('');
      return;
    }
    
    setSearchStatus('searching');
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      searchPID(oldPID, newPID, (record, searchedBy) => {
        if (record) {
          setSearchStatus('found');
          setFoundName(record.name);
          onNameChange(record.name.toUpperCase());
          // 自动填充另一个 PID
          if (searchedBy === 'old' && record.newPID && !newPID) {
            onNewPIDChange(record.newPID);
          } else if (searchedBy === 'new' && record.oldPID && !oldPID) {
            onOldPIDChange(record.oldPID);
          }
        } else {
          setSearchStatus('notfound');
          setFoundName('');
        }
      });
    }, 300);
  }, [oldPID, newPID, searchPID, onNameChange, onOldPIDChange, onNewPIDChange]);
  
  useEffect(() => {
    handleSearch();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [handleSearch]);
  
  const getInputClass = (isNew: boolean) => {
    const base = "w-full px-3 py-2 rounded-lg border text-sm transition-colors";
    if (disabled) return base + " bg-slate-100 dark:bg-slate-800 cursor-not-allowed";
    
    const pid = isNew ? newPID : oldPID;
    if (!pid) return base + " border-slate-300 dark:border-slate-600";
    
    if (searchStatus === 'found') return base + " border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20";
    if (searchStatus === 'notfound') return base + " border-amber-500 bg-amber-50 dark:bg-amber-900/20";
    if (searchStatus === 'searching') return base + " border-blue-500";
    return base + " border-slate-300 dark:border-slate-600";
  };
  
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1 text-slate-600 dark:text-slate-400">
            Old PID
          </label>
          <input
            type="text"
            value={oldPID}
            onChange={(e) => onOldPIDChange(e.target.value)}
            disabled={disabled}
            className={getInputClass(false)}
            placeholder="Enter Old PID"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-slate-600 dark:text-slate-400">
            New PID
          </label>
          <input
            type="text"
            value={newPID}
            onChange={(e) => onNewPIDChange(e.target.value)}
            disabled={disabled}
            className={getInputClass(true)}
            placeholder="Enter New PID"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-medium mb-1 text-slate-600 dark:text-slate-400">
          {label} Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value.toUpperCase())}
          disabled={disabled}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm dark:bg-slate-800"
          placeholder="Auto-filled from PID"
        />
      </div>
      
      {searchStatus === 'found' && (
        <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <CheckCircle2 size={12} />
          Found: {foundName}
        </div>
      )}
      
      {searchStatus === 'notfound' && pidDatabase.loaded && (
        <div className="text-xs text-amber-600 dark:text-amber-400">
          ⚠️ PID not found - Please enter name manually
        </div>
      )}
      
      {!pidDatabase.loaded && (oldPID || newPID) && (
        <div className="text-xs text-blue-600 dark:text-blue-400">
          ⚠️ Please import PID database first
        </div>
      )}
    </div>
  );
}

// Room Booking 表单
function RoomBookingForm() {
  const { booking, updateRoomBooking, addGuest, removeGuest, updateGuest, toggleSharer, updateSharer, removeSharer } = useStore();
  const rb = booking.roomBooking;
  if (!rb) return null;
  
  const [dateRange, setDateRange] = useState({
    start: rb.checkIn,
    end: rb.checkOut
  });
  
  const handleDateChange = (field: 'start' | 'end', value: string) => {
    const newRange = { ...dateRange, [field]: value };
    setDateRange(newRange);
    
    if (field === 'start') {
      updateRoomBooking({ checkIn: value });
    } else {
      updateRoomBooking({ checkOut: value });
    }
  };
  
  // 计算住宿天数
  const nights = dateRange.start && dateRange.end 
    ? Math.max(0, Math.round((new Date(dateRange.end).getTime() - new Date(dateRange.start).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
        <Bed size={20} className="text-violet-500" />
        Room Booking Information
      </h2>
      
      {/* 基本信息 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Agent</label>
          <input
            list="agentList"
            value={rb.agent}
            onChange={(e) => updateRoomBooking({ agent: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800"
            placeholder="Select or type agent"
          />
          <datalist id="agentList">
            {agents.map(a => <option key={a} value={a} />)}
          </datalist>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Hotel</label>
          <select
            value={rb.hotel}
            onChange={(e) => updateRoomBooking({ hotel: e.target.value as 'HIR' | 'IC' | '' })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800"
          >
            <option value="">Select Hotel</option>
            <option value="HIR">HIR</option>
            <option value="IC">IC</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Check In</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => handleDateChange('start', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Check Out</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => handleDateChange('end', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800"
          />
          {nights > 0 && (
            <span className="text-xs text-violet-600 dark:text-violet-400 mt-1 block">
              {nights} night{nights > 1 ? 's' : ''}
            </span>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Authorizer</label>
          <input
            list="authorizerList"
            value={rb.authorizer}
            onChange={(e) => updateRoomBooking({ authorizer: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800"
            placeholder="Select or type authorizer"
          />
          <datalist id="authorizerList">
            {authorizers.map(a => <option key={a} value={a} />)}
          </datalist>
        </div>
      </div>
      
      {/* 客人信息 */}
      <h3 className="text-md font-semibold mb-3 text-slate-700 dark:text-slate-300">Guest Information</h3>
      
      <div className="space-y-4">
        {rb.guests.map((guest, idx) => (
          <div key={guest.id} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <User size={16} />
                Guest #{idx + 1}
              </span>
              <button
                onClick={() => removeGuest(guest.id)}
                className="text-red-500 hover:text-red-600 p-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            <PIDInput
              oldPID={guest.oldPID}
              newPID={guest.newPID}
              name={guest.name}
              onOldPIDChange={(val) => updateGuest(guest.id, { oldPID: val })}
              onNewPIDChange={(val) => updateGuest(guest.id, { newPID: val })}
              onNameChange={(val) => updateGuest(guest.id, { name: val })}
            />
            
            <div className="mt-3">
              <label className="block text-xs font-medium mb-1 text-slate-600 dark:text-slate-400">
                Room Type *
              </label>
              <select
                value={guest.roomType || ''}
                onChange={(e) => updateGuest(guest.id, { roomType: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 text-sm"
              >
                <option value="">Select Room Type</option>
                {rb.hotel && roomTypesConfig[rb.hotel]?.map((group) => (
                  <optgroup key={group.promotion} label={`${group.promotion} pts`}>
                    {group.types.map((type) => (
                      <option key={type} value={type}>
                        {type} ({group.promotion} pts)
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            
            {/* Sharer */}
            <div className="mt-3">
              {!guest.sharer ? (
                <button
                  onClick={() => toggleSharer(guest.id)}
                  className="text-sm text-violet-600 dark:text-violet-400 flex items-center gap-1 hover:underline"
                >
                  <Plus size={14} />
                  Add Sharer
                </button>
              ) : (
                <div className="p-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-600">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Sharer</span>
                    <button
                      onClick={() => removeSharer(guest.id)}
                      className="text-xs text-red-500 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                  <PIDInput
                    oldPID={guest.sharer.oldPID}
                    newPID={guest.sharer.newPID}
                    name={guest.sharer.name}
                    onOldPIDChange={(val) => updateSharer(guest.id, { oldPID: val })}
                    onNewPIDChange={(val) => updateSharer(guest.id, { newPID: val })}
                    onNameChange={(val) => updateSharer(guest.id, { name: val })}
                    label="Sharer"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <button
        onClick={addGuest}
        className="mt-4 w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:border-violet-400 hover:text-violet-600 transition-colors flex items-center justify-center gap-2"
      >
        <Plus size={18} />
        Add Guest
      </button>
    </div>
  );
}

export default function Booking() {
  const navigate = useNavigate();
  const { 
    booking, 
    resetAll, 
    darkMode 
  } = useStore();
  
  const { generateAllEmails } = useEmailGenerator();
  const [generatedEmail, setGeneratedEmail] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // 生成邮件
  const handleGenerate = () => {
    const result = generateAllEmails();
    if (result) {
      setGeneratedEmail(result.email);
      setShowPreview(true);
    }
  };
  
  // 复制邮件
  const handleCopy = async () => {
    if (!generatedEmail) {
      alert('Please generate email first!');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(generatedEmail);
      setSuccessMessage('✓ Copied! Paste directly into Outlook / Gmail.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch {
      alert('Copy failed. Please copy manually.');
    }
  };
  
  // 发送邮件
  const handleSend = () => {
    if (!generatedEmail) {
      alert('Please generate email first!');
      return;
    }
    
    const subjectMatch = generatedEmail.match(/Subject:\s*(.+?)$/m);
    const subject = subjectMatch ? subjectMatch[1].trim() : 'Booking Request';
    const body = generatedEmail.replace(/^Subject:\s*.+?\n+/m, '').trim();
    
    const recipients = [
      'concierge@thegrandhotram.com',
      'Front.Desk@thegrandhotram.com',
      'grandservice@thegrandhotram.com',
      'HIR.receptionist@thegrandhotram.com',
      'IC.receptionist@thegrandhotram.com',
      'Guestrelations.Management@thegrandhotram.com',
      'rooms.coordinator@thegrandhotram.com'
    ].join(',');
    
    const ccRecipients = [
      'rewards@thegrandhotram.com',
      'im.gcsea@thegrandhotram.com',
      'HTR@thegrandhotram.com'
    ].join(',');
    
    window.location.href = `mailto:${recipients}?cc=${ccRecipients}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  
  // 返回首页
  const handleBack = () => {
    resetAll();
    navigate('/');
  };
  
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'
    }`}>
      {/* 顶部栏 */}
      <nav className="relative z-10 w-full px-4 md:px-6 py-4 flex items-center gap-4">
        <button
          onClick={handleBack}
          className={`p-2 rounded-lg transition-colors ${
            darkMode 
              ? 'hover:bg-slate-700 text-slate-300' 
              : 'hover:bg-slate-200 text-slate-600'
          }`}
        >
          <ArrowLeft size={20} />
        </button>
        
        <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          {booking.isOneDayTripMode 
            ? 'ONE DAY TRIP — Patron Registration' 
            : `Selected: ${Array.from(booking.selectedServices).join(', ')}`}
        </div>
      </nav>
      
      {/* 主内容 */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Room Booking */}
        {booking.selectedServices.has('room') && <RoomBookingForm />}
        
        {/* 操作按钮 */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleGenerate}
            className="px-6 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Send size={18} />
            Generate Email
          </button>
          
          <button
            onClick={handleCopy}
            disabled={!generatedEmail}
            className="px-6 py-2.5 bg-slate-700 dark:bg-slate-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Copy size={18} />
            Copy
          </button>
          
          <button
            onClick={handleSend}
            disabled={!generatedEmail}
            className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send size={18} />
            Send Email
          </button>
        </div>
        
        {/* 成功消息 */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700 rounded-lg text-emerald-800 dark:text-emerald-300"
          >
            {successMessage}
          </motion.div>
        )}
        
        {/* 邮件预览 */}
        {showPreview && generatedEmail && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-100 dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
          >
            <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">Email Preview</h3>
            <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700 dark:text-slate-300 overflow-x-auto">
              {generatedEmail}
            </pre>
          </motion.div>
        )}
      </main>
    </div>
  );
}
