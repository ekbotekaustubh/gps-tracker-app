import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUsers, ROLES, BRANCHES } from '../../context/UserContext';
import { Search, UserPlus, Edit, Trash2, Shield, MapPin } from 'lucide-react';

const UserList = () => {
  const { users, deleteUser } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');

  const getRoleName = (roleId) => {
    return ROLES.find(r => r.id === roleId)?.name || `Role #${roleId}`;
  };

  const getBranchName = (branchId) => {
    return BRANCHES.find(b => b.id === branchId)?.name || `Branch #${branchId}`;
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.mobile.includes(searchTerm)
  );

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete user "${name}"?`)) {
      deleteUser(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
          <p className="text-slate-500 text-sm">Manage systems operators, administrators, and end users.</p>
        </div>
        <Link 
          to="/users/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer border-0"
        >
          <UserPlus size={16} />
          Add User
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search by name, username, email, or mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>
        <div className="text-sm text-slate-500">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-slate-55 border-b border-slate-200 text-slate-600 font-semibold uppercase text-xs">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Branch</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* User Identity */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">{user.name}</div>
                          <div className="text-xs text-slate-450">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    {/* Contact details */}
                    <td className="px-6 py-4">
                      <div className="text-slate-800 font-medium">{user.email}</div>
                      <div className="text-xs text-slate-500">{user.mobile}</div>
                    </td>
                    {/* Role */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                        <Shield size={14} className="text-indigo-500" />
                        <span>{getRoleName(user.role_id)}</span>
                      </div>
                    </td>
                    {/* Branch */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-800">
                        <MapPin size={14} className="text-slate-400" />
                        <span>{getBranchName(user.branch_id)}</span>
                      </div>
                    </td>
                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        user.status === 1 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === 1 ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        {user.status === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          to={`/users/edit/${user.id}`}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
                          title="Edit User"
                        >
                          <Edit size={16} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(user.id, user.name)}
                          className="p-1.5 text-slate-500 hover:text-red-650 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserList;
