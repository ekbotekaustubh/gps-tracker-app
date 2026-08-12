import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useRoles } from '../../context/RoleContext';
import { ArrowLeft, Save, Shield, ShieldCheck, CheckSquare, Square } from 'lucide-react';

const RoleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { roles, permissions, addRole, updateRole } = useRoles();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [],
  });

  const [errors, setErrors] = useState({});
  const [isSystemRole, setIsSystemRole] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Group permissions by module
  const permissionsByModule = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) {
      acc[perm.module] = [];
    }
    acc[perm.module].push(perm);
    return acc;
  }, {});

  // Populate data on Edit Mode
  useEffect(() => {
    if (isEditMode) {
      const role = roles.find(r => r.id === Number(id));
      if (role) {
        setFormData({
          name: role.name || '',
          description: role.description || '',
          permissions: role.permissions || [],
        });
        setIsSystemRole(!!role.isSystem);
      } else {
        navigate('/roles');
      }
    }
  }, [id, isEditMode, roles, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Toggle single permission code
  const handlePermissionToggle = (code) => {
    setFormData(prev => {
      const currentPerms = [...prev.permissions];
      const index = currentPerms.indexOf(code);
      if (index > -1) {
        currentPerms.splice(index, 1); // remove
      } else {
        currentPerms.push(code); // add
      }
      return { ...prev, permissions: currentPerms };
    });
  };

  // Toggle all permissions inside a specific module
  const handleModuleSelectAll = (moduleName, isSelectAll) => {
    const modulePermCodes = permissionsByModule[moduleName].map(p => p.code);
    setFormData(prev => {
      let currentPerms = [...prev.permissions];
      if (isSelectAll) {
        // Add all missing permissions for this module
        modulePermCodes.forEach(code => {
          if (!currentPerms.includes(code)) {
            currentPerms.push(code);
          }
        });
      } else {
        // Remove all permissions belonging to this module
        currentPerms = currentPerms.filter(code => !modulePermCodes.includes(code));
      }
      return { ...prev, permissions: currentPerms };
    });
  };

  // Toggle all permissions across all modules
  const handleGlobalSelectAll = (isSelectAll) => {
    setFormData(prev => ({
      ...prev,
      permissions: isSelectAll ? permissions.map(p => p.code) : []
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Role Name is required';
    } else {
      // Duplicate check (ignore case and exclude current edit role)
      const duplicate = roles.find(
        r => r.name.toLowerCase() === formData.name.trim().toLowerCase() && r.id !== Number(id)
      );
      if (duplicate) {
        newErrors.name = 'This Role Name already exists';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      permissions: formData.permissions,
    };

    setSubmitError('');
    setSubmitting(true);
    try {
      if (isEditMode) {
        await updateRole(id, data);
      } else {
        await addRole(data);
      }
      navigate('/roles');
    } catch (err) {
      setSubmitError(err.message || 'Failed to save role.');
    } finally {
      setSubmitting(false);
    }
  };

  // Check if all permissions in the system are selected
  const allSystemPermissionsSelected = permissions.length > 0 && formData.permissions.length === permissions.length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link 
          to="/roles"
          className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-600 transition-colors shadow-sm cursor-pointer"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isEditMode ? 'Edit Role Details' : 'Create New Role'}
          </h1>
          <p className="text-slate-500 text-sm">
            {isEditMode ? `Modifying capability mappings for role ID #${id}` : 'Create custom capability sets and map permissions for operators.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core details Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Shield className="text-indigo-600" size={20} />
            Role Parameters
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Role Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={isSystemRole}
                placeholder="e.g. Dispatcher"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white disabled:opacity-60 disabled:cursor-not-allowed ${
                  errors.name ? 'border-red-300 ring-2 ring-red-500/20' : 'border-slate-200'
                }`}
              />
              {isSystemRole && (
                <p className="mt-1 text-xs text-amber-600">
                  System-defined role names cannot be renamed.
                </p>
              )}
              {errors.name && <p className="mt-1 text-xs text-red-650">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Role Description</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="e.g. Handles vehicle dispatch operations and monitors map tracking"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Permissions Grid Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="text-indigo-600" size={20} />
                Capability Mapping Matrix
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Toggle checkboxes to define what actions this role can perform.</p>
            </div>
            {/* Global Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleGlobalSelectAll(!allSystemPermissionsSelected)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer bg-white"
              >
                {allSystemPermissionsSelected ? <Square size={14} /> : <CheckSquare size={14} />}
                {allSystemPermissionsSelected ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>

          {/* Module-wise Permissions Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.keys(permissionsByModule).map((moduleName) => {
              const modulePerms = permissionsByModule[moduleName];
              const moduleCodes = modulePerms.map(p => p.code);
              const selectedInModule = moduleCodes.filter(c => formData.permissions.includes(c));
              const allSelected = selectedInModule.length === moduleCodes.length;
              const someSelected = selectedInModule.length > 0 && !allSelected;

              return (
                <div key={moduleName} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                  {/* Module Header */}
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-700">{moduleName}</span>
                    <button
                      type="button"
                      onClick={() => handleModuleSelectAll(moduleName, !allSelected)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 border-0 bg-transparent cursor-pointer p-0"
                    >
                      {allSelected ? 'Clear Group' : 'Select Group'}
                    </button>
                  </div>

                  {/* Module Body list */}
                  <div className="p-4 space-y-3 flex-1 bg-white">
                    {modulePerms.map((perm) => {
                      const isChecked = formData.permissions.includes(perm.code);
                      return (
                        <label 
                          key={perm.id} 
                          onClick={() => handlePermissionToggle(perm.code)}
                          className={`flex items-start gap-3 p-2.5 rounded-lg border transition-colors cursor-pointer ${
                            isChecked 
                              ? 'border-indigo-200 bg-indigo-50/30' 
                              : 'border-slate-100 hover:bg-slate-50/50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // handled by parent click handler
                            className="mt-0.5 w-4 h-4 text-indigo-650 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                          />
                          <div className="text-left">
                            <span className="block text-sm font-semibold text-slate-800 leading-tight">
                              {perm.name}
                            </span>
                            <code className="text-[10px] font-mono text-slate-400 select-all block mt-0.5">
                              {perm.code}
                            </code>
                            {perm.description && (
                              <p className="text-xs text-slate-450 mt-1 leading-tight">
                                {perm.description}
                              </p>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {submitError && (
          <p className="text-sm text-red-650 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{submitError}</p>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Link
            to="/roles"
            className="px-4 py-2 border border-slate-200 text-slate-755 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm text-decoration-none cursor-pointer bg-white"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors border-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            {submitting ? 'Saving...' : 'Save Role Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoleForm;
