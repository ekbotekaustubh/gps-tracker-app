import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrganizations } from '../../context/OrganizationContext';
import { useBranches } from '../../context/BranchContext';
import { ArrowLeft, Edit, Trash2, Phone, Plus, AlertTriangle } from 'lucide-react';

const OrganizationDetail = () => {
  const { id } = useParams();
  const { organizations, loading: orgsLoading } = useOrganizations();
  const { branches, deleteBranch } = useBranches();
  const [branchToDelete, setBranchToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const org = organizations.find((o) => o.id === Number(id));

  if (!org && orgsLoading) {
    return (
      <div className="text-center text-slate-400 mt-12 text-sm">Loading organization...</div>
    );
  }

  if (!org) {
    return (
      <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-center space-y-4 max-w-xl mx-auto mt-12">
        <h2 className="text-lg font-bold text-red-800">Organization Not Found</h2>
        <p className="text-red-650 text-sm">The organization ID #{id} does not exist in the database.</p>
        <Link
          to="/organizations"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-sm font-semibold transition-colors"
        >
          <ArrowLeft size={16} /> Back to Organizations
        </Link>
      </div>
    );
  }

  // Get branches for this organization
  // Exclude system branch (id: 0) if it is shown
  const orgBranches = branches.filter((b) => b.org_id === org.id && b.id !== 0);

  const handleDeleteClick = (branchId, branchName) => {
    setDeleteError('');
    setBranchToDelete({ id: branchId, name: branchName });
  };

  const confirmDelete = async () => {
    if (branchToDelete) {
      try {
        await deleteBranch(branchToDelete.id);
        setBranchToDelete(null);
      } catch (err) {
        setDeleteError(err.message || 'Failed to delete branch.');
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/organizations"
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-600 transition-colors shadow-sm cursor-pointer text-decoration-none"
            title="Back to Organizations"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{org.name}</h1>
            <p className="text-slate-500 text-sm">Organization Details and Branch Management</p>
          </div>
        </div>

        <Link
          to={`/organizations/edit/${org.id}`}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer text-decoration-none"
        >
          <Edit size={16} />
          Edit Organization
        </Link>
      </div>

      {/* Org Details Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider block mb-1">Status</span>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
            org.status === 1
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${org.status === 1 ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
            {org.status === 1 ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider block mb-1">Created At</span>
          <span className="text-sm font-medium text-slate-700">{org.created_at}</span>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider block mb-1">Last Updated</span>
          <span className="text-sm font-medium text-slate-700">{org.updated_at}</span>
        </div>
      </div>

      {/* Branches Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Branches ({orgBranches.length})</h2>
            <p className="text-slate-500 text-xs">Physical office and hub locations under this organization.</p>
          </div>
          <Link
            to={`/branches/new?orgId=${org.id}`}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer border-0 text-decoration-none"
          >
            <Plus size={16} />
            Add Branch
          </Link>
        </div>

        {/* Branches Table / List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {orgBranches.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-55 border-b border-slate-200 text-slate-600 font-semibold uppercase text-xs">
                    <th className="px-6 py-4">Branch</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Address</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {orgBranches.map((branch) => (
                    <tr key={branch.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Name & Head Office Badge */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800">{branch.name}</span>
                            {branch.is_head_office === 1 && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
                                Head Office
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-450">ID: #{branch.id}</div>
                        </div>
                      </td>

                      {/* Contact numbers */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <Phone size={12} className="text-slate-400" />
                            <span>{branch.mobile}</span>
                          </div>
                          {branch.phone && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-450">
                              <Phone size={12} className="text-slate-300" />
                              <span>{branch.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Location address */}
                      <td className="px-6 py-4 text-xs">
                        <div className="text-slate-700">
                          {branch.address_line_1}
                          {branch.address_line_2 && `, ${branch.address_line_2}`}
                        </div>
                        <div className="text-slate-450 mt-0.5">
                          {branch.city_name || branch.city}, {branch.state_name} - {branch.pincode}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          branch.status === 1
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          <span className={`w-1.2 h-1.2 rounded-full ${branch.status === 1 ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          {branch.status === 1 ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/branches/edit/${branch.id}`}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
                            title="Edit Branch"
                          >
                            <Edit size={15} />
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(branch.id, branch.name)}
                            className="p-1.5 text-slate-500 hover:text-red-650 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
                            title="Delete Branch"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <p className="text-sm font-medium">No branches configured for this organization.</p>
              <p className="text-xs">Click the "Add Branch" button to create one.</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {branchToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setBranchToDelete(null)}
          ></div>

          <div className="relative bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 overflow-hidden z-10 mx-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center font-bold text-red-600 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-lg font-bold text-slate-900">Delete Branch</h3>
                <p className="text-sm text-slate-500">
                  Are you sure you want to delete branch <strong className="text-slate-800 font-semibold">"{branchToDelete.name}"</strong>? This action cannot be undone and will delete all dependent data.
                </p>
                {deleteError && <p className="text-xs text-red-650 font-semibold">{deleteError}</p>}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setBranchToDelete(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm cursor-pointer bg-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer border-0"
              >
                Delete Branch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationDetail;
