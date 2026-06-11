import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRoles } from '../../context/RoleContext';
import { Search, Plus, Edit, Trash2, Shield, Lock, AlertTriangle, ShieldCheck } from 'lucide-react';

const RoleList = () => {
  const { roles, deleteRole } = useRoles();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Filter roles
  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (role) => {
    setRoleToDelete(role);
    setErrorMsg('');
  };

  const confirmDelete = () => {
    if (roleToDelete) {
      const success = deleteRole(roleToDelete.id);
      if (success) {
        setRoleToDelete(null);
      } else {
        setErrorMsg('Failed to delete role. System-defined roles cannot be deleted.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="text-indigo-600" size={24} />
            Role Management
          </h1>
          <p className="text-slate-500 text-sm">Create and assign access levels to organize your operations team.</p>
        </div>
        <Link 
          to="/roles/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer border-0 text-decoration-none"
        >
          <Plus size={16} />
          Add Role
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
            placeholder="Search by role name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>
        <div className="text-sm text-slate-500">
          Showing {filteredRoles.length} of {roles.length} roles
        </div>
      </div>

      {/* Roles Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-xs">
                <th className="px-6 py-4">Role Name</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Permissions Mapped</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRoles.length > 0 ? (
                filteredRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Role Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-semibold text-slate-800">
                        <Shield className="text-indigo-500" size={16} />
                        {role.name}
                      </div>
                    </td>
                    {/* Description */}
                    <td className="px-6 py-4 text-slate-500 max-w-xs md:max-w-md truncate" title={role.description}>
                      {role.description}
                    </td>
                    {/* Permissions tags */}
                    <td className="px-6 py-4 max-w-sm">
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">No permissions assigned</span>
                        ) : (
                          <>
                            {role.permissions.slice(0, 3).map((permCode) => (
                              <code 
                                key={permCode} 
                                className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[10px] font-mono border border-indigo-100"
                              >
                                {permCode}
                              </code>
                            ))}
                            {role.permissions.length > 3 && (
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                +{role.permissions.length - 3} more
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    {/* Type Badge */}
                    <td className="px-6 py-4">
                      {role.isSystem ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-755 border border-indigo-200">
                          <Lock size={10} />
                          System
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ShieldCheck size={10} />
                          Custom
                        </span>
                      )}
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          to={`/roles/edit/${role.id}`}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
                          title="Edit Role Permissions"
                        >
                          <Edit size={16} />
                        </Link>
                        {role.isSystem ? (
                          <span className="text-slate-400 p-1.5" title="System roles cannot be deleted">
                            <Lock size={16} />
                          </span>
                        ) : (
                          <button 
                            onClick={() => handleDeleteClick(role)}
                            className="p-1.5 text-slate-500 hover:text-red-650 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
                            title="Delete Role"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    No roles found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {roleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setRoleToDelete(null)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 overflow-hidden z-10 mx-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center font-bold text-red-600 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-lg font-bold text-slate-900">Delete Role</h3>
                <p className="text-sm text-slate-500">
                  Are you sure you want to delete role <strong className="text-slate-800 font-semibold">"{roleToDelete.name}"</strong>? This action cannot be undone.
                </p>
                {errorMsg && <p className="text-xs text-red-650 font-semibold">{errorMsg}</p>}
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRoleToDelete(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm cursor-pointer bg-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer border-0"
              >
                Delete Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleList;
