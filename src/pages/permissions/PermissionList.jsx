import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRoles } from '../../context/RoleContext';
import { Search, Plus, Edit, Trash2, Key, Lock, AlertTriangle, ShieldCheck } from 'lucide-react';

const PermissionList = () => {
  const { permissions, loading, error, deletePermission } = useRoles();
  const [searchTerm, setSearchTerm] = useState('');
  const [permissionToDelete, setPermissionToDelete] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Filter permissions
  const filteredPermissions = permissions.filter(perm =>
    perm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    perm.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    perm.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (perm.description && perm.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteClick = (perm) => {
    setPermissionToDelete(perm);
    setErrorMsg('');
  };

  const confirmDelete = async () => {
    if (permissionToDelete) {
      try {
        await deletePermission(permissionToDelete.id);
        setPermissionToDelete(null);
      } catch (err) {
        setErrorMsg(err.message || 'Failed to delete permission.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Key className="text-indigo-600" size={24} />
            Permission Management
          </h1>
          <p className="text-slate-500 text-sm">Define and organize fine-grained capabilities across system modules.</p>
        </div>
        <Link 
          to="/permissions/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer border-0 text-decoration-none"
        >
          <Plus size={16} />
          Add Permission
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
            placeholder="Search by name, code, description, or module..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>
        <div className="text-sm text-slate-500">
          Showing {filteredPermissions.length} of {permissions.length} permissions
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-650 text-sm rounded-lg border border-red-100">
          Failed to load permissions: {error}
        </div>
      )}

      {/* Permissions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-xs">
                <th className="px-6 py-4">Permission Name</th>
                <th className="px-6 py-4">Unique Code</th>
                <th className="px-6 py-4">Module / Group</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPermissions.length > 0 ? (
                filteredPermissions.map((perm) => (
                  <tr key={perm.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Permission Name */}
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {perm.name}
                    </td>
                    {/* Unique Code */}
                    <td className="px-6 py-4">
                      <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono text-indigo-750 font-bold border border-slate-200">
                        {perm.code}
                      </code>
                    </td>
                    {/* Module Badge */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                        {perm.module}
                      </span>
                    </td>
                    {/* Description */}
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate" title={perm.description}>
                      {perm.description || <span className="text-slate-300 italic">No description provided</span>}
                    </td>
                    {/* Type Badge */}
                    <td className="px-6 py-4">
                      {perm.isSystem ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-750 border border-indigo-200">
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
                        {perm.isSystem ? (
                          <span className="text-slate-400 p-1.5" title="System permissions cannot be modified">
                            <Lock size={16} />
                          </span>
                        ) : (
                          <>
                            <Link 
                              to={`/permissions/edit/${perm.id}`}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
                              title="Edit Permission"
                            >
                              <Edit size={16} />
                            </Link>
                            <button 
                              onClick={() => handleDeleteClick(perm)}
                              className="p-1.5 text-slate-500 hover:text-red-650 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
                              title="Delete Permission"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    {loading ? 'Loading permissions...' : 'No permissions found matching your search.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {permissionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setPermissionToDelete(null)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 overflow-hidden z-10 mx-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center font-bold text-red-600 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-lg font-bold text-slate-900">Delete Permission</h3>
                <p className="text-sm text-slate-500">
                  Are you sure you want to delete permission <strong className="text-slate-800 font-semibold">"{permissionToDelete.name}"</strong> (`{permissionToDelete.code}`)?
                </p>
                <p className="text-xs text-red-650 font-medium bg-red-50 p-2 rounded border border-red-100">
                  Warning: This will also automatically strip this permission from any Roles that currently contain it.
                </p>
                {errorMsg && <p className="text-xs text-red-650 font-semibold">{errorMsg}</p>}
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPermissionToDelete(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm cursor-pointer bg-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer border-0"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionList;
