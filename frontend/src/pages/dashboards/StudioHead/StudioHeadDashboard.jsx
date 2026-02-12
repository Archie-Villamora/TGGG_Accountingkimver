// StudioHeadDashboard.jsx
// Moved and refactored from App.jsx AdminDashboard
import { useState, useEffect } from 'react';
import axios from 'axios';
import StatusModal from '../../../components/StatusModal';

export default function StudioHeadDashboard({ user, onLogout }) {
  // Removed department logic
  const [pendingUsers, setPendingUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedRole, setSelectedRole] = useState('accounting');
  const [selectedPerms, setSelectedPerms] = useState([]);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');

  // Only allow these roles for assignment
  const allowedRoles = [
    { value: 'accounting', label: 'Accounting' },
    { value: 'bim_specialist', label: 'BIM Specialist' },
    { value: 'intern', label: 'Intern' },
    { value: 'junior_architect', label: 'Junior Architect' },
    { value: 'president', label: 'President' },
    { value: 'site_engineer', label: 'Site Engineer' },
    { value: 'site_coordinator', label: 'Site Coordinator' },
    { value: 'studio_head', label: 'Studio Head' },
    { value: 'admin', label: 'Admin' },
  ];

  useEffect(() => {
    fetchPendingUsers();
    fetchUsers();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/accounts/departments/');
    } catch (err) {
      setMessage('Failed to load departments');
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('No authentication token found. Please login again.');
        return;
      }
      const res = await axios.get('http://localhost:8000/api/accounts/pending/');
      setPendingUsers(res.data);
      setMessage('');
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to load pending users';
      setMessage(`Error: ${errorMsg}`);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const res = await axios.get('http://localhost:8000/api/accounts/users/');
      setUsers(res.data);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to load users';
      setUsersError(errorMsg);
    } finally {
      setUsersLoading(false);
    }
  };

  const approveUser = async (userId) => {
    setLoading(true);
    try {
      await axios.post('http://localhost:8000/api/accounts/approve/', {
        user_id: parseInt(userId),
        department_id: parseInt(selectedDept),
        role: selectedRole,
        permissions: selectedPerms
      });
      setMessage('User approved successfully');
      fetchPendingUsers();
      setSelectedDept('');
      setSelectedRole('accounting');
      setSelectedPerms([]);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to approve user';
      setMessage(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#021B2C', color: 'white', minHeight: '100vh', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px' }}>Studio Head/Admin Control Center</h1>
          <p style={{ color: '#9CA3AF', marginTop: '6px' }}>Verify users, manage accounts, and control access.</p>
        </div>
        <button onClick={onLogout} style={{ padding: '10px 20px', backgroundColor: '#FF7120', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
          Logout
        </button>
      </div>

      {message && (
        <div style={{ padding: '12px 16px', marginBottom: '16px', backgroundColor: message.includes('Failed') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', border: `1px solid ${message.includes('Failed') ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`, borderRadius: '8px', color: message.includes('Failed') ? '#EF4444' : '#10B981' }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '20px' }}>
        <div style={{ backgroundColor: '#003049', padding: '20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ margin: 0, fontSize: '20px' }}>Pending User Approvals</h2>
            <span style={{ color: '#9CA3AF', fontSize: '13px' }}>{pendingUsers.length} waiting</span>
          </div>
          {pendingUsers.length === 0 ? (
            <p style={{ color: '#9CA3AF' }}>No pending users</p>
          ) : (
            <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingUsers.map(u => (
                <div key={u.id} style={{ backgroundColor: '#002035', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,113,32,0.2)' }}>
                  <p style={{ margin: 0, fontWeight: 600 }}>{u.first_name} {u.last_name} <span style={{ color: '#9CA3AF', fontWeight: 400 }}>({u.email})</span></p>
                  <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '6px' }}>Joined: {new Date(u.created_at).toLocaleString()}</p>
                  <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} style={{ padding: '8px', backgroundColor: '#1a2332', border: '1px solid #47545E', borderRadius: '6px', color: 'white' }}>
                      {allowedRoles.map(role => (
                        <option key={role.value} value={role.value}>{role.label}</option>
                      ))}
                    </select>
                  </div>
                  <button onClick={() => approveUser(u.id)} disabled={loading} style={{ marginTop: '12px', width: '100%', padding: '10px', backgroundColor: '#FF7120', border: 'none', borderRadius: '6px', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'Approving...' : 'Approve & Send Email'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ backgroundColor: '#003049', padding: '20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>Manage Users</h2>
          <p style={{ color: '#9CA3AF', marginTop: '8px' }}>Add, edit, suspend, or remove accounts.</p>

          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <input
              type="text"
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 12px',
                backgroundColor: '#002035',
                border: '1px solid #47545E',
                borderRadius: '8px',
                color: 'white',
                outline: 'none'
              }}
            />
            <button style={{ padding: '10px 14px', backgroundColor: '#1f3b53', border: '1px solid #2c4d66', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>
              Add Account
            </button>
          </div>

          <div style={{ marginTop: '16px', display: 'grid', gap: '10px' }}>
            {usersLoading && <div style={{ color: '#9CA3AF' }}>Loading users...</div>}
            {usersError && <div style={{ color: '#FCA5A5' }}>{usersError}</div>}
            {!usersLoading && !usersError && users.length === 0 && (
              <div style={{ color: '#9CA3AF' }}>No users found</div>
            )}
            {!usersLoading && !usersError && users
              .filter((u) => {
                const name = `${u.first_name || ''} ${u.last_name || ''}`.trim().toLowerCase();
                const email = (u.email || '').toLowerCase();
                const term = searchTerm.toLowerCase();
                return name.includes(term) || email.includes(term);
              })
              .map((u) => (
                <div key={u.id} style={{ backgroundColor: '#002035', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{u.first_name} {u.last_name}</div>
                    <div style={{ color: '#9CA3AF', fontSize: '12px' }}>{u.email}</div>
                    <div style={{ color: '#9CA3AF', fontSize: '12px' }}>
                      {u.role_name || u.role || 'No role'} • {u.department_name || 'No department'} • {u.is_active ? 'Active' : 'Suspended'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ padding: '6px 10px', backgroundColor: '#1f3b53', border: '1px solid #2c4d66', color: 'white', borderRadius: '6px', cursor: 'pointer' }}>
                      Edit
                    </button>
                    <button style={{ padding: '6px 10px', backgroundColor: '#263a34', border: '1px solid #2f5c4f', color: '#d1fae5', borderRadius: '6px', cursor: 'pointer' }}>
                      Suspend
                    </button>
                    <button style={{ padding: '6px 10px', backgroundColor: '#3b1f24', border: '1px solid #5f2a33', color: '#fecaca', borderRadius: '6px', cursor: 'pointer' }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
