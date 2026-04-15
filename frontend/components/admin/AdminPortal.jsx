import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  FaUsers, FaUserShield, FaUserGraduate, FaSearch, FaEdit, 
  FaTrash, FaCheck, FaTimes, FaChartLine, FaBook, 
  FaQuestionCircle, FaCog, FaPlus, FaFilter, FaSync, FaBars, FaChevronRight, FaSave, FaExclamationTriangle, FaInfoCircle
} from 'react-icons/fa';

const AdminPortal = () => {
  const { 
    adminGetUsers, adminUpdateUser, adminDeleteUser, 
    adminGetCourses, adminUpdateCourse, adminDeleteCourse,
    adminGetInquiries, adminUpdateInquiry, adminDeleteInquiry,
    adminGetStats, adminGetSettings, adminUpdateSettings, BASE_URL 
  } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [settings, setSettings] = useState({});
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setRoleFilter] = useState('all');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Modal States
  const [editingUser, setEditingUser] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const statsRes = await adminGetStats();
      if (statsRes.success) setStats(statsRes.data);

      if (activeTab === 'users') {
        const res = await adminGetUsers(searchTerm, filterRole);
        if (res.success) setUsers(res.data);
      } else if (activeTab === 'courses') {
        const res = await adminGetCourses();
        if (res.success) setCourses(res.data);
      } else if (activeTab === 'inquiries') {
        const res = await adminGetInquiries();
        if (res.success) setInquiries(res.data);
      } else if (activeTab === 'settings') {
        const res = await adminGetSettings();
        if (res.success) setSettings(res.data);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to fetch data' });
    }
    setLoading(false);
  }, [activeTab, searchTerm, filterRole, adminGetUsers, adminGetCourses, adminGetInquiries, adminGetStats, adminGetSettings]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    
    let res;
    if (type === 'user') res = await adminDeleteUser(id);
    else if (type === 'course') res = await adminDeleteCourse(id);
    else if (type === 'inquiry') res = await adminDeleteInquiry(id);

    if (res?.success) {
      setMessage({ type: 'success', text: `${type} deleted successfully` });
      fetchData();
    }
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    const res = await adminUpdateCourse(editingCourse.id, editingCourse);
    if (res.success) {
      setMessage({ type: 'success', text: editingCourse.id ? 'Course updated' : 'Course created' });
      setEditingCourse(null);
      fetchData();
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    const res = await adminUpdateSettings(settings);
    if (res.success) {
      setMessage({ type: 'success', text: 'Website settings updated successfully' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row relative">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b p-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
        <h2 className="text-xl font-bold text-primary-600">Admin Portal</h2>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          {isSidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-full w-72 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b hidden md:block">
          <h2 className="text-2xl font-black text-primary-600 tracking-tight">AY DIGITAL</h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Management Console</p>
        </div>
        
        <nav className="p-4 space-y-1">
          <SidebarLink icon={<FaChartLine />} label="Dashboard Overview" active={activeTab === 'overview'} onClick={() => handleTabChange('overview')} />
          <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Database Management</div>
          <SidebarLink icon={<FaUsers />} label="Student Records" active={activeTab === 'users'} onClick={() => handleTabChange('users')} />
          <SidebarLink icon={<FaBook />} label="Course Catalog" active={activeTab === 'courses'} onClick={() => handleTabChange('courses')} />
          <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Communications</div>
          <SidebarLink icon={<FaQuestionCircle />} label="Student Inquiries" active={activeTab === 'inquiries'} onClick={() => handleTabChange('inquiries')} badge={stats?.newInquiries} />
          <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">System</div>
          <SidebarLink icon={<FaCog />} label="Website Settings" active={activeTab === 'settings'} onClick={() => handleTabChange('settings')} />
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow min-h-screen overflow-x-hidden">
        <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900 capitalize tracking-tight">
                {activeTab.replace('-', ' ')}
              </h1>
              <p className="text-gray-500 mt-1">Manage and monitor your institute's resources.</p>
            </div>
            <button 
              onClick={fetchData} 
              className="flex items-center justify-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:text-primary-600 hover:border-primary-200 transition-all shadow-sm"
            >
              <FaSync className={loading ? 'animate-spin' : ''} /> {loading ? 'Syncing...' : 'Refresh Data'}
            </button>
          </div>

          {message.text && (
            <div className={`mb-8 p-4 rounded-xl flex justify-between items-center animate-fade-in shadow-sm border ${
              message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-center gap-3">
                {message.type === 'success' ? <FaCheck /> : <FaExclamationTriangle />}
                <span className="font-medium">{message.text}</span>
              </div>
              <button onClick={() => setMessage({ type: '', text: '' })} className="hover:opacity-70 transition-opacity"><FaTimes /></button>
            </div>
          )}

          <div className="animate-fade-in">
            {activeTab === 'overview' && <OverviewTab stats={stats} />}
            {activeTab === 'users' && (
              <UserTab 
                users={users} 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm}
                filterRole={filterRole}
                setRoleFilter={setRoleFilter}
                onEdit={setEditingUser}
                onDelete={(id) => handleDelete('user', id)}
                BASE_URL={BASE_URL}
              />
            )}
            {activeTab === 'courses' && (
              <CourseTab 
                courses={courses} 
                onEdit={setEditingCourse} 
                onAdd={() => setEditingCourse({ title: '', category: '', duration: '', level: '', topics: [], icon: 'FaLaptop', isActive: true })}
                onDelete={(id) => handleDelete('course', id)}
              />
            )}
            {activeTab === 'inquiries' && (
              <InquiryTab 
                inquiries={inquiries} 
                onUpdateStatus={async (id, s) => {
                  await adminUpdateInquiry(id, { status: s });
                  fetchData();
                }}
                onDelete={(id) => handleDelete('inquiry', id)}
              />
            )}
            {activeTab === 'settings' && (
              <SettingsTab 
                settings={settings} 
                setSettings={setSettings} 
                onSave={handleUpdateSettings} 
              />
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {editingUser && (
        <UserModal user={editingUser} setUser={setEditingUser} onSave={async (e) => {
          e.preventDefault();
          const res = await adminUpdateUser(editingUser.id, editingUser);
          if (res.success) {
            setMessage({ type: 'success', text: 'User updated' });
            setEditingUser(null);
            fetchData();
          }
        }} />
      )}
      
      {editingCourse && (
        <CourseModal 
          course={editingCourse} 
          setCourse={setEditingCourse} 
          onSave={handleSaveCourse} 
        />
      )}
    </div>
  );
};

// --- SUB-COMPONENTS ---

const SidebarLink = ({ icon, label, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all group ${
      active 
        ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 translate-x-1' 
        : 'text-gray-500 hover:bg-gray-50 hover:text-primary-600 hover:translate-x-1'
    }`}
  >
    <div className="flex items-center gap-3">
      <span className={`transition-colors ${active ? 'text-white' : 'text-gray-400 group-hover:text-primary-600'}`}>{icon}</span>
      <span className="text-sm">{label}</span>
    </div>
    {badge > 0 && (
      <span className={`px-2 py-0.5 rounded-full text-[10px] ${active ? 'bg-white text-primary-600' : 'bg-primary-600 text-white'}`}>
        {badge}
      </span>
    )}
    {!active && <FaChevronRight size={10} className="opacity-0 group-hover:opacity-100 transition-all text-gray-300" />}
  </button>
);

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
    <div className={`${color} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-${color.split('-')[1]}-100 group-hover:scale-110 transition-transform`}>
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
    <p className="text-4xl font-black text-gray-900 mt-1">{value}</p>
  </div>
);

const OverviewTab = ({ stats }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    <StatCard icon={<FaUsers />} label="Total Students" value={stats?.totalStudents || 0} color="bg-blue-600" />
    <StatCard icon={<FaUserShield />} label="Staff Admins" value={stats?.totalAdmins || 0} color="bg-purple-600" />
    <StatCard icon={<FaBook />} label="Active Courses" value={stats?.totalCourses || 0} color="bg-emerald-600" />
    <StatCard icon={<FaQuestionCircle />} label="Pending Inquiries" value={stats?.newInquiries || 0} color="bg-amber-600" />
  </div>
);

const UserTab = ({ users, searchTerm, setSearchTerm, filterRole, setRoleFilter, onEdit, onDelete, BASE_URL }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4 bg-gray-50/50">
      <div className="relative flex-grow max-w-md">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Filter by name, email or username..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex gap-3">
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm">
          <FaFilter className="text-gray-400 text-xs" />
          <select className="bg-transparent outline-none text-sm font-bold text-gray-600 min-w-[120px]" value={filterRole} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b">
          <tr>
            <th className="px-8 py-5">Profile</th>
            <th className="px-8 py-5">Contact Details</th>
            <th className="px-8 py-5">Access Level</th>
            <th className="px-8 py-5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map(u => (
            <tr key={u.id} className="hover:bg-gray-50/80 transition-colors group">
              <td className="px-8 py-5">
                <div className="flex items-center gap-4">
                  <img src={u.profilePic ? `${BASE_URL}/${u.profilePic}` : `https://ui-avatars.com/api/?name=${u.name}&background=random`} className="w-12 h-12 rounded-2xl object-cover shadow-sm border-2 border-white" alt="" />
                  <div>
                    <p className="font-black text-gray-900 text-sm leading-none">{u.name}</p>
                    <p className="text-xs text-gray-400 font-bold mt-1.5 flex items-center gap-1"><FaAt size={10} className="text-primary-400" /> {u.username}</p>
                  </div>
                </div>
              </td>
              <td className="px-8 py-5">
                <p className="text-sm font-bold text-gray-700">{u.email}</p>
                <p className="text-[10px] text-gray-400 font-black uppercase mt-1">{u.phone || 'No Contact Number'}</p>
              </td>
              <td className="px-8 py-5">
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{u.role}</span>
              </td>
              <td className="px-8 py-5 text-right">
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onEdit(u)} className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"><FaEdit size={14} /></button>
                  <button onClick={() => onDelete(u.id)} className="p-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm"><FaTrash size={14} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const CourseTab = ({ courses, onEdit, onAdd, onDelete }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
      <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs">Course Catalog</h3>
      <button onClick={onAdd} className="btn-primary flex items-center gap-2 py-3 px-6 rounded-xl shadow-lg shadow-primary-100 text-sm"><FaPlus /> Create Course</button>
    </div>
    <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map(c => (
        <div key={c.id} className="border border-gray-100 rounded-2xl p-6 hover:border-primary-200 transition-all hover:shadow-md group">
          <div className="flex justify-between items-start mb-4">
            <span className="p-3 bg-primary-50 text-primary-600 rounded-xl group-hover:bg-primary-600 group-hover:text-white transition-colors"><FaBook size={20} /></span>
            <div className="flex gap-1">
              <button onClick={() => onEdit(c)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><FaEdit size={14} /></button>
              <button onClick={() => onDelete(c.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors"><FaTrash size={14} /></button>
            </div>
          </div>
          <h4 className="font-black text-gray-900 mb-1">{c.title}</h4>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{c.category}</p>
          <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-50">
            <span className="text-xs font-black text-primary-600">{c.duration}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {c.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const InquiryTab = ({ inquiries, onUpdateStatus, onDelete }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b">
          <tr>
            <th className="px-8 py-5">Sender</th>
            <th className="px-8 py-5">Course Interest</th>
            <th className="px-8 py-5">Management Status</th>
            <th className="px-8 py-5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {inquiries.map(i => (
            <tr key={i.id} className="hover:bg-gray-50/80 transition-colors">
              <td className="px-8 py-5">
                <p className="font-black text-gray-900 text-sm">{i.name}</p>
                <p className="text-xs text-primary-600 font-bold mt-1">{i.phone}</p>
              </td>
              <td className="px-8 py-5">
                <p className="text-sm font-bold text-gray-700">{i.course}</p>
                <p className="text-[10px] text-gray-400 truncate max-w-xs mt-1 italic">"{i.message}"</p>
              </td>
              <td className="px-8 py-5">
                <select 
                  className={`text-[10px] font-black uppercase tracking-widest rounded-lg px-3 py-2 outline-none border-2 transition-all ${
                    i.status === 'new' ? 'bg-orange-50 border-orange-200 text-orange-700' : 
                    i.status === 'contacted' ? 'bg-blue-50 border-blue-200 text-blue-700' : 
                    'bg-green-50 border-green-200 text-green-700'
                  }`}
                  value={i.status}
                  onChange={(e) => onUpdateStatus(i.id, e.target.value)}
                >
                  <option value="new">New Lead</option>
                  <option value="contacted">Contacted</option>
                  <option value="resolved">Resolved</option>
                </select>
              </td>
              <td className="px-8 py-5 text-right">
                <button onClick={() => onDelete(i.id)} className="p-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm"><FaTrash size={14} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const SettingsTab = ({ settings, setSettings, onSave }) => (
  <form onSubmit={onSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
    <div className="flex items-center gap-3 mb-8">
      <div className="p-3 bg-gray-100 rounded-xl text-gray-600"><FaCog /></div>
      <div>
        <h3 className="text-xl font-black text-gray-900 tracking-tight">Website Configurations</h3>
        <p className="text-sm text-gray-500">Update contact information and site details.</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <SettingInput label="Contact Phone" value={settings.contact_phone} onChange={v => setSettings({...settings, contact_phone: v})} />
      <SettingInput label="Contact Email" value={settings.contact_email} onChange={v => setSettings({...settings, contact_email: v})} />
      <SettingInput label="WhatsApp Number" value={settings.whatsapp_number} onChange={v => setSettings({...settings, whatsapp_number: v})} />
      <SettingInput label="Opening Hours" value={settings.opening_hours} onChange={v => setSettings({...settings, opening_hours: v})} />
      <div className="md:col-span-2">
        <SettingInput label="Institute Address" value={settings.contact_address} onChange={v => setSettings({...settings, contact_address: v})} isTextArea />
      </div>
    </div>

    <div className="mt-10 pt-8 border-t border-gray-100 flex justify-end">
      <button type="submit" className="btn-primary flex items-center gap-2 py-3 px-10 rounded-xl shadow-lg shadow-primary-100"><FaSave /> Save Site Settings</button>
    </div>
  </form>
);

const SettingInput = ({ label, value, onChange, isTextArea }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    {isTextArea ? (
      <textarea 
        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700 shadow-sm"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        rows={3}
      />
    ) : (
      <input 
        type="text"
        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700 shadow-sm"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
      />
    )}
  </div>
);

const UserModal = ({ user, setUser, onSave }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden">
      <div className="p-8 border-b bg-gray-50 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Edit Student Record</h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">ID: #{user.id}</p>
        </div>
        <button onClick={() => setUser(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><FaTimes size={20} className="text-gray-400" /></button>
      </div>
      <form onSubmit={onSave} className="p-8 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
            <input type="text" className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700 shadow-sm" value={user.name} onChange={e => setUser({...user, name: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Username</label>
            <input type="text" className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700 shadow-sm" value={user.username || ''} onChange={e => setUser({...user, username: e.target.value})} />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Access Role</label>
          <select className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700 shadow-sm" value={user.role} onChange={e => setUser({...user, role: e.target.value})}>
            <option value="student">Student Account</option>
            <option value="admin">Administrative Staff</option>
          </select>
        </div>
        <div className="flex gap-4 pt-4">
          <button type="button" onClick={() => setUser(null)} className="flex-1 py-4 font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors">Dismiss</button>
          <button type="submit" className="flex-[2] py-4 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary-100 hover:bg-primary-700 transition-all active:scale-95">Save Update</button>
        </div>
      </form>
    </div>
  </div>
);

const CourseModal = ({ course, setCourse, onSave }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
      <div className="p-8 border-b bg-gray-50 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">{course.id ? 'Modify Course' : 'Create New Course'}</h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Update information in the catalog</p>
        </div>
        <button onClick={() => setCourse(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><FaTimes size={20} className="text-gray-400" /></button>
      </div>
      <form onSubmit={onSave} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Course Title</label>
            <input type="text" required className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700" value={course.title} onChange={e => setCourse({...course, title: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
            <input type="text" required className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700" value={course.category} onChange={e => setCourse({...course, category: e.target.value})} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Duration</label>
            <input type="text" required className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700" value={course.duration} onChange={e => setCourse({...course, duration: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Difficulty Level</label>
            <select className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700" value={course.level} onChange={e => setCourse({...course, level: e.target.value})}>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Topics (One per line)</label>
          <textarea 
            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700" 
            value={course.topics?.join('\n')} 
            onChange={e => setCourse({...course, topics: e.target.value.split('\n')})}
            rows={4}
          />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="isActive" checked={course.isActive} onChange={e => setCourse({...course, isActive: e.target.checked})} />
          <label htmlFor="isActive" className="text-sm font-bold text-gray-700">Display this course on website</label>
        </div>
        <div className="flex gap-4 pt-4 sticky bottom-0 bg-white border-t border-gray-100 py-4">
          <button type="button" onClick={() => setCourse(null)} className="flex-1 py-4 font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors">Discard</button>
          <button type="submit" className="flex-[2] py-4 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary-100 hover:bg-primary-700 transition-all active:scale-95">Update Catalog</button>
        </div>
      </form>
    </div>
  </div>
);

export default AdminPortal;
