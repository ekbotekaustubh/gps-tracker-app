import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUsers } from '../../context/UserContext';
import { Search, UserPlus, Edit, Trash2, Shield, MapPin, AlertTriangle } from 'lucide-react';

const UserList = () => {
  const { users, loading, error, deleteUser } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.mobile.includes(searchTerm)
  );

  const handleDeleteClick = (id, name) => {
    setDeleteError('');
    setUserToDelete({ id, name });
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete.id);
        setUserToDelete(null);
      } catch (err) {
        setDeleteError(err.message || 'Failed to delete user.');
      }
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

      {error && (
        <div className="p-3 bg-red-50 text-red-650 text-sm rounded-lg border border-red-100">
          Failed to load users: {error}
        </div>
      )}

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
                        <span>{user.role_name || `Role #${user.role_id}`}</span>
                      </div>
                    </td>
                    {/* Branch */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-800">
                        <MapPin size={14} className="text-slate-400" />
                        <span>{user.branch_name || `Branch #${user.branch_id}`}</span>
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
                          onClick={() => handleDeleteClick(user.id, user.name)}
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
                    {loading ? 'Loading users...' : 'No users found matching your search.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setUserToDelete(null)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 overflow-hidden z-10 mx-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center font-bold text-red-600 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-lg font-bold text-slate-900">Delete User</h3>
                <p className="text-sm text-slate-500">
                  Are you sure you want to delete user <strong className="text-slate-800 font-semibold">"{userToDelete.name}"</strong>? This action cannot be undone and will remove all associated database records.
                </p>
                {deleteError && <p className="text-xs text-red-650 font-semibold">{deleteError}</p>}
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm cursor-pointer bg-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer border-0"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
