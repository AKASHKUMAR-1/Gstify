import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Shield, Trash2, User } from 'lucide-react';
import type { TeamMember } from '../types';

const TEAM_STORAGE_KEY = 'gst_invoice_team';

const TeamManagement: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem(TEAM_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [{
      id: '1',
      name: 'Admin User',
      email: 'admin@company.com',
      role: 'admin',
      joinedAt: new Date().toISOString(),
      avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=0f172a&color=d4af37'
    }];
  });

  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'editor' as const });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(members));
  }, [members]);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (members.length >= 5) {
      alert("Enterprise plan limit of 5 users reached.");
      return;
    }

    const member: TeamMember = {
      id: crypto.randomUUID(),
      ...newMember,
      joinedAt: new Date().toISOString(),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newMember.name)}&background=random`
    };

    setMembers([...members, member]);
    setNewMember({ name: '', email: '', role: 'editor' });
    setShowAddForm(false);
  };

  const removeMember = (id: string) => {
    if (members.find(m => m.id === id)?.role === 'admin') {
      alert("Admin user cannot be removed.");
      return;
    }
    setMembers(members.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-[Playfair_Display]">Team Management</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage access for your organization's members.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-amber-500 text-slate-900 font-bold rounded-xl hover:bg-amber-400 transition-all shadow-lg"
        >
          <UserPlus size={18} />
          Add Member
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-amber-500 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleAddMember} className="grid md:grid-cols-4 gap-6 items-end">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700" 
                value={newMember.name}
                onChange={e => setNewMember({...newMember, name: e.target.value})}
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700" 
                value={newMember.email}
                onChange={e => setNewMember({...newMember, email: e.target.value})}
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-2">Role</label>
              <select 
                className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                value={newMember.role}
                onChange={e => setNewMember({...newMember, role: e.target.value as any})}
              >
                <option value="editor">Editor (Full Edit)</option>
                <option value="viewer">Viewer (Read Only)</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl">Add</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {members.map(member => (
          <div key={member.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-between hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full border-2 border-amber-500/20" />
              <div>
                <div className="font-bold flex items-center gap-2">
                  {member.name}
                  {member.role === 'admin' && (
                    <span className="text-[10px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full font-black uppercase">Owner</span>
                  )}
                </div>
                <div className="text-sm text-slate-500 flex items-center gap-2">
                  <Mail size={14} />
                  {member.email}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="hidden sm:flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Shield size={16} className={member.role === 'admin' ? 'text-amber-500' : 'text-slate-400'} />
                <span className="text-sm capitalize font-medium">{member.role}</span>
              </div>
              <button 
                onClick={() => removeMember(member.id)}
                disabled={member.role === 'admin'}
                className="p-2 text-slate-400 hover:text-red-500 disabled:opacity-0 transition-colors"
                title="Remove Member"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}

        {members.length === 0 && (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <User size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">No team members added yet.</p>
          </div>
        )}
      </div>

      <div className="bg-amber-500/5 rounded-xl p-4 border border-amber-500/20">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm font-semibold">
          <Shield size={16} />
          Usage: {members.length} / 5 seats used
        </div>
      </div>
    </div>
  );
};

export default TeamManagement;
