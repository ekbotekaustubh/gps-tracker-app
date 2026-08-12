import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useRoles } from '../../context/RoleContext';
import { ArrowLeft, Save, ShieldAlert } from 'lucide-react';

const PermissionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { permissions, addPermission, updatePermission } = useRoles();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    module: '',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Get unique modules currently defined in system permissions to suggest in datalist
  const existingModules = Array.from(new Set(permissions.map(p => p.module)));

  useEffect(() => {
    if (isEditMode) {
      const perm = permissions.find(p => p.id === Number(id));
      if (perm) {
        if (perm.isSystem) {
          // System permissions cannot be modified
          navigate('/permissions');
          return;
        }
        setFormData({
          name: perm.name || '',
          code: perm.code || '',
          module: perm.module || '',
          description: perm.description || '',
        });
      } else {
        navigate('/permissions');
      }
    }
  }, [id, isEditMode, permissions, navigate]);

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Permission Name is required';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Permission Code is required';
    } else {
      // Basic format validation: e.g. 'users.view'
      if (!/^[a-z0-9_]+\.[a-z0-9_]+$/.test(formData.code.trim())) {
        newErrors.code = 'Code must be in lowercase namespace format, e.g., "billing.read"';
      }

      // Unique code check (excluding current editing permission)
      const duplicate = permissions.find(
        p => p.code.toLowerCase() === formData.code.trim().toLowerCase() && p.id !== Number(id)
      );
      if (duplicate) {
        newErrors.code = 'This Permission Code already exists';
      }
    }

    if (!formData.module.trim()) {
      newErrors.module = 'Module/Group categorization is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = {
      name: formData.name.trim(),
      code: formData.code.trim().toLowerCase(),
      module: formData.module.trim(),
      description: formData.description.trim(),
    };

    setSubmitError('');
    setSubmitting(true);
    try {
      if (isEditMode) {
        await updatePermission(id, data);
      } else {
        await addPermission(data);
      }
      navigate('/permissions');
    } catch (err) {
      setSubmitError(err.message || 'Failed to save permission.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link 
          to="/permissions"
          className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-600 transition-colors shadow-sm cursor-pointer"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isEditMode ? 'Edit Permission' : 'Create New Permission'}
          </h1>
          <p className="text-slate-500 text-sm">
            {isEditMode ? `Updating customization parameters for permission ID #${id}` : 'Add a new capability namespace to map into administrator roles.'}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
          <ShieldAlert className="text-indigo-600" size={20} />
          Permission Parameters
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Permission Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. View Billing Reports"
              className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white ${
                errors.name ? 'border-red-300 ring-2 ring-red-500/20' : 'border-slate-200'
              }`}
            />
            {errors.name && <p className="mt-1 text-xs text-red-650">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Permission Code *</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="e.g. billing.read"
              className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white ${
                errors.code ? 'border-red-300 ring-2 ring-red-500/20' : 'border-slate-200'
              }`}
            />
            <p className="mt-1.5 text-xs text-slate-400">
              Use namespace format (lowercase letters, dots, and underscores). Example: `billing.view` or `reports.generate`.
            </p>
            {errors.code && <p className="mt-1 text-xs text-red-650">{errors.code}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Module / Group *</label>
            <input
              type="text"
              name="module"
              list="module-suggestions"
              value={formData.module}
              onChange={handleChange}
              placeholder="e.g. Billing, GPS Devices, Users"
              className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white ${
                errors.module ? 'border-red-300 ring-2 ring-red-500/20' : 'border-slate-200'
              }`}
            />
            <datalist id="module-suggestions">
              {existingModules.map((m, idx) => (
                <option key={idx} value={m} />
              ))}
            </datalist>
            <p className="mt-1 text-xs text-slate-400">
              Categories permissions under a common group in the role permission checklist. Note: the group actually shown is derived from the code prefix (e.g. `billing.*` groups under "Billing").
            </p>
            {errors.module && <p className="mt-1 text-xs text-red-650">{errors.module}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what this permission allows system operators to do..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          {submitError && (
            <p className="text-sm text-red-650 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{submitError}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Link
            to="/permissions"
            className="px-4 py-2 border border-slate-200 text-slate-750 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm text-decoration-none cursor-pointer bg-white"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors border-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            {submitting ? 'Saving...' : 'Save Permission'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PermissionForm;
