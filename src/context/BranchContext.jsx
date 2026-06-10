/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext } from 'react';

const BranchContext = createContext();

export const BranchProvider = ({ children }) => {
  const [branches, setBranches] = useState([
    {
      id: 1,
      org_id: 1,
      name: 'Head Office (Mumbai)',
      address_line_1: '101, Maker Chambers',
      address_line_2: 'Nariman Point',
      pincode: '400021',
      country_id: 1,
      state_id: 14,
      city_id: 287,
      is_head_office: 1,
      mobile: '9820098200',
      phone: '022-22002200',
      status: 1,
      created_at: '2026-06-01 10:00:00',
      updated_at: '2026-06-01 10:00:00',
    },
    {
      id: 2,
      org_id: 1,
      name: 'Bengaluru Branch',
      address_line_1: '50, Residency Road',
      address_line_2: 'Richmond Town',
      pincode: '560025',
      country_id: 1,
      state_id: 11,
      city_id: 273,
      is_head_office: 0,
      mobile: '9845098450',
      phone: '080-41004100',
      status: 1,
      created_at: '2026-06-02 11:30:00',
      updated_at: '2026-06-02 11:30:00',
    },
    {
      id: 3,
      org_id: 2,
      name: 'Pune Branch',
      address_line_1: '88, F.C. Road',
      address_line_2: 'Shivajinagar',
      pincode: '411005',
      country_id: 1,
      state_id: 14,
      city_id: 288,
      is_head_office: 0,
      mobile: '9822098220',
      phone: '020-25002500',
      status: 1,
      created_at: '2026-06-03 14:15:00',
      updated_at: '2026-06-03 14:15:00',
    },
    {
      id: 4,
      org_id: 3,
      name: 'Delhi Branch',
      address_line_1: '12, Connaught Place',
      address_line_2: 'Outer Circle',
      pincode: '110001',
      country_id: 1,
      state_id: 32,
      city_id: 333,
      is_head_office: 0,
      mobile: '9810098100',
      phone: '011-23002300',
      status: 0,
      created_at: '2026-06-04 09:00:00',
      updated_at: '2026-06-04 09:00:00',
    },
    {
      id: 0,
      org_id: 1,
      name: 'System / None',
      address_line_1: 'System Office',
      address_line_2: '',
      pincode: '400001',
      country_id: 1,
      state_id: 14,
      city_id: 287,
      is_head_office: 0,
      mobile: '0000000000',
      phone: '',
      status: 1,
      created_at: '2026-05-29 18:01:20',
      updated_at: '2026-05-29 18:01:20',
    }
  ]);

  const addBranch = (branchData) => {
    // Exclude system branch ID (0) from auto-increment logic
    const nextId = branches.length > 0 ? Math.max(...branches.map(b => b.id)) + 1 : 1;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newBranch = {
      ...branchData,
      id: nextId,
      org_id: Number(branchData.org_id),
      country_id: Number(branchData.country_id),
      state_id: Number(branchData.state_id),
      city_id: branchData.city_id ? Number(branchData.city_id) : null,
      is_head_office: Number(branchData.is_head_office),
      status: Number(branchData.status),
      created_at: now,
      updated_at: now,
    };
    setBranches([...branches, newBranch]);
  };

  const updateBranch = (id, updatedData) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setBranches(
      branches.map((b) =>
        b.id === Number(id)
          ? {
              ...b,
              ...updatedData,
              org_id: Number(updatedData.org_id),
              country_id: Number(updatedData.country_id),
              state_id: Number(updatedData.state_id),
              city_id: updatedData.city_id ? Number(updatedData.city_id) : null,
              is_head_office: Number(updatedData.is_head_office),
              status: Number(updatedData.status),
              updated_at: now,
            }
          : b
      )
    );
  };

  const deleteBranch = (id) => {
    setBranches(branches.filter((b) => b.id !== Number(id)));
  };

  return (
    <BranchContext.Provider value={{ branches, addBranch, updateBranch, deleteBranch }}>
      {children}
    </BranchContext.Provider>
  );
};

export const useBranches = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranches must be used within a BranchProvider');
  }
  return context;
};
