import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useOrganizations } from '../../context/OrganizationContext';
import { ArrowLeft, Save } from 'lucide-react';

const OrganizationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { organizations, addOrganization, updateOrganization } = useOrganizations();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    status: 1, // default Active
  });

  const [errors, setErrors] = useState({});

  // Populate form in edit mode
  useEffect(() => {
    if (isEditMode) {
      const org = organizations.find((o) => o.id === Number(id));
      if (org) {
        Promise.resolve().then(() => {
          setFormData({
            name: org.name || '',
            status: org.status ?? 1,
          });
        });
      } else {
        // Organization not found, redirect to list
        navigate('/organizations');
      }
    }
  }, [id, isEditMode, organizations, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? (checked ? 1 : 0) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Organization Name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isEditMode) {
      updateOrganization(id, formData);
    } else {
      addOrganization(formData);
    }
    navigate('/organizations');
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Back to List Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/organizations"
          className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-600 transition-colors shadow-sm cursor-pointer text-decoration-none"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isEditMode ? 'Edit Organization' : 'Create New Organization'}
          </h1>
          <p className="text-slate-500 text-sm">
            {isEditMode ? `Updating database record for organization ID #${id}` : 'Fill in the details to add a new organization to the system.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">
            Organization Details
          </h2>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Organization Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Acme Corp"
              className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white ${
                errors.name ? 'border-red-300 ring-2 ring-red-500/20' : 'border-slate-200'
              }`}
            />
            {errors.name && <p className="mt-1 text-xs text-red-650">{errors.name}</p>}
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="status"
                checked={formData.status === 1}
                onChange={handleChange}
                className="w-4.5 h-4.5 rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <div>
                <span className="text-sm font-semibold text-slate-800">Active Status</span>
                <p className="text-xs text-slate-450 leading-tight">Inactive organizations cannot log in or be assigned resources.</p>
              </div>
            </label>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Link
            to="/organizations"
            className="px-4 py-2 border border-slate-200 text-slate-755 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm text-decoration-none cursor-pointer"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors border-0 cursor-pointer"
          >
            <Save size={16} />
            Save Organization Record
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrganizationForm;
