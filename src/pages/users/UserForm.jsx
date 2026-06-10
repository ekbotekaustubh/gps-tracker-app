import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useUsers, ROLES } from '../../context/UserContext';
import { useBranches } from '../../context/BranchContext';
import { ArrowLeft, Save } from 'lucide-react';
import { useCountries } from '../../hooks/useCountries';
import { useStates } from '../../hooks/useStates';
import { useCities } from '../../hooks/useCities';

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users, addUser, updateUser } = useUsers();
  const { branches } = useBranches();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    branch_id: 0,
    role_id: 4, // default End User
    address_line_1: '',
    address_line_2: '',
    pincode: '',
    country_id: 1, // default India
    state_id: '',
    city_id: '',
    username: '',
    password: '',
    status: 1, // default Active
  });

  const [errors, setErrors] = useState({});

  // Populate form in edit mode
  useEffect(() => {
    if (isEditMode) {
      const user = users.find((u) => u.id === Number(id));
      if (user) {
        Promise.resolve().then(() => {
          setFormData({
            name: user.name || '',
            email: user.email || '',
            mobile: user.mobile || '',
            branch_id: user.branch_id ?? 0,
            role_id: user.role_id ?? 4,
            address_line_1: user.address_line_1 || '',
            address_line_2: user.address_line_2 || '',
            pincode: user.pincode || '',
            country_id: user.country_id ?? 1,
            state_id: user.state_id || '',
            city_id: user.city_id || '',
            username: user.username || '',
            password: '', // blank by default for edit mode (keep current unless typed)
            status: user.status ?? 1,
          });
        });
      } else {
        // User not found, redirect to list
        navigate('/users');
      }
    }
  }, [id, isEditMode, users, navigate]);

  // Dynamic API calls for geography dropdowns
  const { countries, loading: countriesLoading } = useCountries();
  const { states: availableStates, loading: statesLoading } = useStates(formData.country_id);
  const { cities: availableCities, loading: citiesLoading } = useCities(formData.state_id);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? (checked ? 1 : 0) : value;

    // Handle field updates
    setFormData((prev) => {
      const updated = { ...prev, [name]: newValue };
      
      // If country changed, reset state & city
      if (name === 'country_id') {
        updated.state_id = '';
        updated.city_id = '';
      }
      // If state changed, reset city
      if (name === 'state_id') {
        updated.city_id = '';
      }
      return updated;
    });

    // Clear error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Full Name is required';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10,15}$/.test(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid mobile number (10-15 digits)';
    }

    if (!formData.username.trim()) newErrors.username = 'Username is required';
    
    if (!isEditMode && !formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    if (!formData.state_id) newErrors.state_id = 'State is required';
    if (!formData.city_id) newErrors.city_id = 'City is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isEditMode) {
      // If edit mode and password is blank, remove password key to prevent overwriting with empty
      const submissionData = { ...formData };
      if (!submissionData.password.trim()) {
        delete submissionData.password;
      }
      updateUser(id, submissionData);
    } else {
      addUser(formData);
    }
    navigate('/users');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back to List Header */}
      <div className="flex items-center gap-4">
        <Link 
          to="/users"
          className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-600 transition-colors shadow-sm cursor-pointer"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isEditMode ? 'Edit User details' : 'Create New User'}
          </h1>
          <p className="text-slate-500 text-sm">
            {isEditMode ? `Updating database record for user ID #${id}` : 'Fill in the details to add a new user to the system.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Account Information */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
              Account Credentials & Role
            </h2>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Username *</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white ${
                  errors.username ? 'border-red-300 ring-2 ring-red-500/20' : 'border-slate-200'
                }`}
              />
              {errors.username && <p className="mt-1 text-xs text-red-650">{errors.username}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Password {isEditMode ? '(Leave blank to keep current)' : '*'}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={isEditMode ? '••••••••' : ''}
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white ${
                  errors.password ? 'border-red-300 ring-2 ring-red-500/20' : 'border-slate-200'
                }`}
              />
              {errors.password && <p className="mt-1 text-xs text-red-650">{errors.password}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Role *</label>
                <select
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                >
                  {ROLES.map((role) => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Branch *</label>
                <select
                  name="branch_id"
                  value={formData.branch_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                >
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              </div>
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
                  <span className="text-sm font-semibold text-slate-800">Active Operator Status</span>
                  <p className="text-xs text-slate-450 leading-tight">Inactive users cannot log into the system.</p>
                </div>
              </label>
            </div>
          </div>

          {/* Card 2: Contact & Address Information */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
              Personal & Address Details
            </h2>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white ${
                  errors.name ? 'border-red-300 ring-2 ring-red-500/20' : 'border-slate-200'
                }`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-650">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white ${
                    errors.email ? 'border-red-300 ring-2 ring-red-500/20' : 'border-slate-200'
                  }`}
                />
                {errors.email && <p className="mt-1 text-xs text-red-650">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Mobile *</label>
                <input
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white ${
                    errors.mobile ? 'border-red-300 ring-2 ring-red-500/20' : 'border-slate-200'
                  }`}
                />
                {errors.mobile && <p className="mt-1 text-xs text-red-650">{errors.mobile}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Address Line 1</label>
                <input
                  type="text"
                  name="address_line_1"
                  value={formData.address_line_1}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Address Line 2</label>
                <input
                  type="text"
                  name="address_line_2"
                  value={formData.address_line_2}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Country</label>
                <select
                  name="country_id"
                  value={formData.country_id}
                  onChange={handleChange}
                  disabled={countriesLoading}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white disabled:opacity-50"
                >
                  <option value="">{countriesLoading ? 'Loading countries...' : 'Select Country'}</option>
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">State *</label>
                <select
                  name="state_id"
                  value={formData.state_id}
                  onChange={handleChange}
                  disabled={statesLoading || !formData.country_id}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.state_id ? 'border-red-300 ring-2 ring-red-500/20' : 'border-slate-200'
                  }`}
                >
                  <option value="">{statesLoading ? 'Loading states...' : 'Select State'}</option>
                  {availableStates.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                {errors.state_id && <p className="mt-1 text-xs text-red-650">{errors.state_id}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">City *</label>
                <select
                  name="city_id"
                  value={formData.city_id}
                  onChange={handleChange}
                  disabled={citiesLoading || !formData.state_id}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.city_id ? 'border-red-300 ring-2 ring-red-500/20' : 'border-slate-200'
                  }`}
                >
                  <option value="">{citiesLoading ? 'Loading cities...' : 'Select City'}</option>
                  {availableCities.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.city_id && <p className="mt-1 text-xs text-red-650">{errors.city_id}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Pincode</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Link
            to="/users"
            className="px-4 py-2 border border-slate-200 text-slate-750 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm text-decoration-none cursor-pointer"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors border-0 cursor-pointer"
          >
            <Save size={16} />
            Save User Record
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
