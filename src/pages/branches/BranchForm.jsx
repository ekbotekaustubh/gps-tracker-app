import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { useOrganizations } from '../../context/OrganizationContext';
import { useBranches } from '../../context/BranchContext';
import { useCountries } from '../../hooks/useCountries';
import { useStates } from '../../hooks/useStates';
import { useCities } from '../../hooks/useCities';
import { ArrowLeft, Save } from 'lucide-react';

const BranchForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = !!id;

  const { organizations } = useOrganizations();
  const { branches, loading: branchesLoading, addBranch, updateBranch } = useBranches();

  // Get orgId query parameter for new branch pre-selection
  const queryParams = new URLSearchParams(location.search);
  const orgIdParam = queryParams.get('orgId');

  const [formData, setFormData] = useState({
    org_id: '',
    name: '',
    address_line_1: '',
    address_line_2: '',
    pincode: '',
    country_id: '',
    state_id: '',
    city_id: '',
    is_head_office: 0,
    mobile: '',
    phone: '',
    status: 1, // Active by default
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Dynamic geography hooks
  const { countries, loading: loadingCountries } = useCountries();
  const { states, loading: loadingStates } = useStates(formData.country_id);
  const { cities, loading: loadingCities } = useCities(formData.state_id);

  // Pre-fill organization from query parameter on creation
  useEffect(() => {
    if (!isEditMode && orgIdParam) {
      Promise.resolve().then(() => {
        setFormData((prev) => ({
          ...prev,
          org_id: Number(orgIdParam),
        }));
      });
    }
  }, [orgIdParam, isEditMode]);

  // Populate form in edit mode
  useEffect(() => {
    if (isEditMode) {
      const branch = branches.find((b) => b.id === Number(id));
      if (branch) {
        Promise.resolve().then(() => {
          setFormData({
            org_id: branch.org_id || '',
            name: branch.name || '',
            address_line_1: branch.address_line_1 || '',
            address_line_2: branch.address_line_2 || '',
            pincode: branch.pincode || '',
            country_id: branch.country_id || '',
            state_id: branch.state_id || '',
            city_id: branch.city_id || '',
            is_head_office: branch.is_head_office ?? 0,
            mobile: branch.mobile || '',
            phone: branch.phone || '',
            status: branch.status ?? 1,
          });
        });
      } else if (!branchesLoading) {
        navigate('/organizations');
      }
    }
  }, [id, isEditMode, branches, branchesLoading, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? (checked ? 1 : 0) : value;

    // Reset downstream locations if country or state changes
    if (name === 'country_id') {
      setFormData((prev) => ({
        ...prev,
        country_id: value,
        state_id: '',
        city_id: '',
      }));
    } else if (name === 'state_id') {
      setFormData((prev) => ({
        ...prev,
        state_id: value,
        city_id: '',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: newValue,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.org_id) newErrors.org_id = 'Organization selection is required';
    if (!formData.name.trim()) newErrors.name = 'Branch Name is required';
    if (!formData.mobile.trim()) newErrors.mobile = 'Mobile Number is required';
    if (!formData.address_line_1.trim()) newErrors.address_line_1 = 'Address Line 1 is required';
    if (!formData.country_id) newErrors.country_id = 'Country is required';
    if (!formData.state_id) newErrors.state_id = 'State is required';
    if (!formData.city_id) newErrors.city_id = 'City is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const selectedCity = cities.find((c) => c.id === Number(formData.city_id));
    const payload = { ...formData, city: selectedCity?.name || '' };

    setSubmitError('');
    setSubmitting(true);
    try {
      if (isEditMode) {
        await updateBranch(id, payload);
      } else {
        await addBranch(payload);
      }
      // Redirect back to organization details page
      navigate(`/organizations/view/${formData.org_id}`);
    } catch (err) {
      setSubmitError(err.message || 'Failed to save branch.');
    } finally {
      setSubmitting(false);
    }
  };

  // Determine cancel link path
  const cancelPath = formData.org_id ? `/organizations/view/${formData.org_id}` : '/organizations';

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to={cancelPath}
          className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-600 transition-colors shadow-sm cursor-pointer text-decoration-none"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isEditMode ? 'Edit Branch' : 'Create New Branch'}
          </h1>
          <p className="text-slate-500 text-sm">
            {isEditMode ? `Updating database record for branch ID #${id}` : 'Configure physical branch office details.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">
            Branch Configuration
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Organization Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Organization *</label>
              <select
                name="org_id"
                value={formData.org_id}
                onChange={handleChange}
                disabled={!!orgIdParam || isEditMode}
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white disabled:bg-slate-100 disabled:text-slate-450 ${
                  errors.org_id ? 'border-red-300 ring-2 ring-red-500/20' : 'border-slate-200'
                }`}
              >
                <option value="">Select Organization</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
              {errors.org_id && <p className="mt-1 text-xs text-red-650">{errors.org_id}</p>}
            </div>

            {/* Branch Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Branch Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Bengaluru Hub"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white ${
                  errors.name ? 'border-red-300 ring-2 ring-red-500/20' : 'border-slate-200'
                }`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-650">{errors.name}</p>}
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Mobile Number *</label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="e.g. 9845001234"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white ${
                  errors.mobile ? 'border-red-300 ring-2 ring-red-500/20' : 'border-slate-200'
                }`}
              />
              {errors.mobile && <p className="mt-1 text-xs text-red-650">{errors.mobile}</p>}
            </div>

            {/* Landline Phone */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Phone (Optional)</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 080-41234567"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          <h3 className="text-md font-bold text-slate-700 border-b border-slate-100 pt-2 pb-1.5">
            Physical Address
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Address Line 1 */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Address Line 1 *</label>
              <input
                type="text"
                name="address_line_1"
                value={formData.address_line_1}
                onChange={handleChange}
                placeholder="Street address, P.O. box"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white ${
                  errors.address_line_1 ? 'border-red-300 ring-2 ring-red-500/20' : 'border-slate-200'
                }`}
              />
              {errors.address_line_1 && <p className="mt-1 text-xs text-red-650">{errors.address_line_1}</p>}
            </div>

            {/* Address Line 2 */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Address Line 2 (Optional)</label>
              <input
                type="text"
                name="address_line_2"
                value={formData.address_line_2}
                onChange={handleChange}
                placeholder="Apartment, suite, unit, building, floor"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            {/* Country Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Country *</label>
              <select
                name="country_id"
                value={formData.country_id}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white ${
                  errors.country_id ? 'border-red-300 ring-2 ring-red-500/20' : 'border-slate-200'
                }`}
              >
                <option value="">Select Country</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {loadingCountries && <p className="mt-1 text-xs text-slate-400">Loading countries...</p>}
              {errors.country_id && <p className="mt-1 text-xs text-red-650">{errors.country_id}</p>}
            </div>

            {/* State Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">State *</label>
              <select
                name="state_id"
                value={formData.state_id}
                onChange={handleChange}
                disabled={!formData.country_id}
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white disabled:bg-slate-100 disabled:text-slate-450 ${
                  errors.state_id ? 'border-red-300 ring-2 ring-red-500/20' : 'border-slate-200'
                }`}
              >
                <option value="">Select State</option>
                {states.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {loadingStates && <p className="mt-1 text-xs text-slate-400">Loading states...</p>}
              {errors.state_id && <p className="mt-1 text-xs text-red-650">{errors.state_id}</p>}
            </div>

            {/* City Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">City *</label>
              <select
                name="city_id"
                value={formData.city_id}
                onChange={handleChange}
                disabled={!formData.state_id}
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white disabled:bg-slate-100 disabled:text-slate-450 ${
                  errors.city_id ? 'border-red-300 ring-2 ring-red-500/20' : 'border-slate-200'
                }`}
              >
                <option value="">Select City</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {loadingCities && <p className="mt-1 text-xs text-slate-400">Loading cities...</p>}
              {errors.city_id && <p className="mt-1 text-xs text-red-650">{errors.city_id}</p>}
            </div>

            {/* Pincode */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Pincode *</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="e.g. 400001"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white ${
                  errors.pincode ? 'border-red-300 ring-2 ring-red-500/20' : 'border-slate-200'
                }`}
              />
              {errors.pincode && <p className="mt-1 text-xs text-red-650">{errors.pincode}</p>}
            </div>
          </div>

          <h3 className="text-md font-bold text-slate-700 border-b border-slate-100 pt-2 pb-1.5">
            Settings & Status
          </h3>

          <div className="flex flex-col sm:flex-row gap-6 pt-1">
            {/* Is Head Office Checkbox */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_head_office"
                checked={formData.is_head_office === 1}
                onChange={handleChange}
                className="w-4.5 h-4.5 rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <div>
                <span className="text-sm font-semibold text-slate-800">Is Head Office</span>
                <p className="text-xs text-slate-450 leading-tight">Flags this branch as the primary corporate office.</p>
              </div>
            </label>

            {/* Active Status Checkbox */}
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
                <p className="text-xs text-slate-450 leading-tight">Inactive branches cannot have new users assigned to them.</p>
              </div>
            </label>
          </div>
        </div>

        {submitError && (
          <p className="text-sm text-red-650 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{submitError}</p>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Link
            to={cancelPath}
            className="px-4 py-2 border border-slate-200 text-slate-750 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm text-decoration-none cursor-pointer"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors border-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            {submitting ? 'Saving...' : 'Save Branch Record'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BranchForm;
