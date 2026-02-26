import React from 'react';

export const CreateGroupModal = ({ show, onClose, onCreate, groupName, setGroupName, groupDesc, setGroupDesc }) => {
  if (!show) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem', animation: 'fadeIn 0.2s ease-out' }}>
        <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: '#002035', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '400px', border: '1px solid rgba(255, 113, 32, 0.3)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', position: 'relative', animation: 'slideUp 0.3s ease-out' }}>

          <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255, 255, 255, 0.1)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease', color: 'white', fontSize: '18px', lineHeight: 1 }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'; e.currentTarget.style.transform = 'scale(1.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}>✕</button>

          <h3 style={{ margin: '0 0 1.5rem 0', color: '#e8eaed', fontSize: '1.25rem', fontWeight: '600' }}>Create New Group</h3>
          <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Group name..." style={{ width: '100%', padding: '0.75rem', background: 'rgba(0, 39, 60, 0.5)', color: '#e8eaed', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1rem', boxSizing: 'border-box' }} />
          <textarea value={groupDesc} onChange={(e) => setGroupDesc(e.target.value)} placeholder="Description (optional)..." rows={3} style={{ width: '100%', padding: '0.75rem', background: 'rgba(0, 39, 60, 0.5)', color: '#e8eaed', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1.5rem', resize: 'vertical', boxSizing: 'border-box' }} />

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={onCreate} style={{ flex: 1, padding: '0.75rem', background: '#FF7120', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', transition: 'all 0.2s ease', boxShadow: '0 4px 12px rgba(255, 113, 32, 0.3)' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(255, 113, 32, 0.4)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 113, 32, 0.3)'; }}>Create</button>
            <button onClick={onClose} style={{ flex: 1, padding: '0.75rem', background: 'rgba(255, 255, 255, 0.1)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '12px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', transition: 'all 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>Cancel</button>
          </div>
        </div>
      </div>
    </>
  );
};

export const ManageGroupsModal = ({ show, onClose, groups, isCoordinator, userProfile, availableUsers, onDeleteGroup, onRemoveMember, onAddMember, Icon }) => {
  if (!show) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem', animation: 'fadeIn 0.2s ease-out' }}>
        <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: '#002035', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '600px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255, 113, 32, 0.3)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', position: 'relative', animation: 'slideUp 0.3s ease-out' }}>

          <button onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255, 255, 255, 0.1)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease', color: 'white', fontSize: '18px', lineHeight: 1 }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'; e.currentTarget.style.transform = 'scale(1.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}>✕</button>

          <h3 style={{ margin: '0 0 1.5rem 0', color: '#e8eaed', fontSize: '1.25rem', fontWeight: '600' }}>Manage Groups</h3>

          <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
            {groups.map(group => (
              <div key={group.id} style={{ background: 'rgba(0, 39, 60, 0.5)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ margin: 0, color: '#e8eaed', fontSize: '1.1rem' }}>{group.name}</h4>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#9ca3af', fontSize: '0.85rem' }}>Leader: <span style={{ color: '#FF7120' }}>{group.leader?.full_name || 'None'}</span></p>
                  </div>
                  {(isCoordinator || group.leader_id == userProfile?.id) && (
                    <button onClick={() => onDeleteGroup(group.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '0.5rem 0.75rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><Icon name="trash" size={14} color="#ef4444" strokeWidth={2} />Delete Group</span>
                    </button>
                  )}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '0.75rem' }}>Members ({group.members?.length || 0}):</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {group.members?.map(member => (
                      <span key={member.user?.id} style={{ background: 'rgba(255, 113, 32, 0.1)', border: '1px solid rgba(255, 113, 32, 0.2)', padding: '0.35rem 0.75rem', borderRadius: '16px', fontSize: '0.85rem', color: '#e8eaed', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {member.user?.full_name}
                        {(isCoordinator || group.leader_id == userProfile?.id) && (
                          <button type="button" onClick={(e) => { e.preventDefault(); onRemoveMember(group.id, member.user?.id); }} style={{ background: 'rgba(239, 68, 68, 0.2)', border: 'none', color: '#ff6b6b', cursor: 'pointer', padding: 0, fontSize: '0.9rem', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '0.25rem', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.4)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}>×</button>
                        )}
                      </span>
                    ))}
                    {(!group.members || group.members.length === 0) && <span style={{ color: '#6b7280', fontSize: '0.85rem', fontStyle: 'italic' }}>No members yet</span>}
                  </div>
                </div>
                {(isCoordinator || String(group.leader_id) === String(userProfile?.id)) && availableUsers.some(u => String(u.id) !== String(group.leader_id) && String(u.id) !== String(group.leader?.id) && String(u.id) !== String(userProfile?.id)) && (
                  <select onChange={(e) => { if (e.target.value) { onAddMember(group.id, e.target.value); e.target.value = ''; } }} style={{ width: '100%', padding: '0.75rem', background: '#001824', color: '#e8eaed', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', fontSize: '0.9rem', colorScheme: 'dark', cursor: 'pointer' }}>
                    <option value="">+ Add member...</option>
                    {availableUsers.filter(u => String(u.id) !== String(group.leader_id) && String(u.id) !== String(group.leader?.id) && String(u.id) !== String(userProfile?.id)).map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                  </select>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <button onClick={onClose} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.1)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '12px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', transition: 'all 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>Close</button>
          </div>

        </div>
      </div>
    </>
  );
};

export const ManageLeadersModal = ({ show, onClose, interns, onToggleLeader, Icon }) => {
  if (!show) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem', animation: 'fadeIn 0.2s ease-out' }}>
        <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: '#002035', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '500px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255, 113, 32, 0.3)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', position: 'relative', animation: 'slideUp 0.3s ease-out' }}>

          <button onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255, 255, 255, 0.1)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease', color: 'white', fontSize: '18px', lineHeight: 1 }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'; e.currentTarget.style.transform = 'scale(1.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}>✕</button>

          <h3 style={{ margin: '0 0 0.5rem 0', color: '#e8eaed', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.25rem', fontWeight: '600' }}><Icon name="crown" size={20} color="#ffc107" strokeWidth={2} />Manage Leaders</h3>
          <p style={{ color: '#9ca3af', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: '1.5' }}>Assign or remove leader status from interns. Leaders can create groups and assign tasks.</p>

          <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
            {interns.map(intern => (
              <div key={intern.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: intern.is_leader ? 'rgba(255, 193, 7, 0.05)' : 'rgba(0, 39, 60, 0.5)', borderRadius: '12px', marginBottom: '0.75rem', border: `1px solid ${intern.is_leader ? 'rgba(255, 193, 7, 0.3)' : 'rgba(255, 255, 255, 0.05)'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {intern.is_leader ? (
                    <div style={{ background: 'rgba(255, 193, 7, 0.2)', padding: '0.4rem', borderRadius: '50%', display: 'flex' }}><Icon name="crown" size={16} color="#ffc107" strokeWidth={2} /></div>
                  ) : (
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)' }}></div>
                  )}
                  <span style={{ color: '#e8eaed', fontWeight: intern.is_leader ? '600' : '400' }}>{intern.full_name}</span>
                </div>
                <button onClick={() => onToggleLeader(intern.id, intern.is_leader)} style={{ padding: '0.5rem 1rem', background: intern.is_leader ? 'rgba(239, 68, 68, 0.1)' : '#FF7120', color: intern.is_leader ? '#ef4444' : 'white', border: intern.is_leader ? '1px solid rgba(239, 68, 68, 0.3)' : 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', transition: 'all 0.2s', boxShadow: intern.is_leader ? 'none' : '0 2px 8px rgba(255, 113, 32, 0.3)' }} onMouseEnter={e => { if (!intern.is_leader) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 113, 32, 0.4)' } else { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)' } }} onMouseLeave={e => { if (!intern.is_leader) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 113, 32, 0.3)' } else { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)' } }}>
                  {intern.is_leader ? 'Remove Leader' : 'Make Leader'}
                </button>
              </div>
            ))}
            {interns.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>No interns found.</p>}
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <button onClick={onClose} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.1)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '12px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', transition: 'all 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>Close</button>
          </div>
        </div>
      </div>
    </>
  );
};

export const DeleteConfirmModal = ({ show, onClose, onConfirm, message = 'Are you sure you want to delete this?', title = 'Confirm Delete' }) => {
  if (!show) return null;
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        {/* Modal */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: '#002035',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '480px',
            width: '90%',
            border: '2px solid #FF7120',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            position: 'relative',
            animation: 'slideUp 0.3s ease-out'
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              color: 'white',
              fontSize: '18px',
              lineHeight: 1
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ✕
          </button>

          {/* Icon */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '24px'
          }}>
            <div style={{
              backgroundColor: 'rgba(255, 113, 32, 0.1)',
              borderRadius: '50%',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'bounce 0.5s ease-out'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FF7120" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h3 style={{
            color: '#FF7120',
            fontSize: '24px',
            fontWeight: '600',
            textAlign: 'center',
            marginBottom: '12px',
            letterSpacing: '-0.5px'
          }}>
            {title}
          </h3>

          {/* Message */}
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '16px',
            textAlign: 'center',
            lineHeight: '1.6',
            marginBottom: '32px'
          }}>
            {message}
          </p>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onConfirm}
              style={{
                flex: 1,
                padding: '14px 24px',
                backgroundColor: '#FF7120',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(255, 113, 32, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(255, 113, 32, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 113, 32, 0.3)';
              }}
            >
              Delete
            </button>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '14px 24px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </>
  );
};

export const ConfirmTaskModal = ({ show, onClose, onConfirm, todo, task, setTask, description, setDescription, startDate, setStartDate, deadline, setDeadline, assignee, setAssignee, members, Icon }) => {
  if (!show || !todo) return null;

  const handleConfirm = () => {
    if (deadline && startDate && deadline < startDate) {
      alert('Deadline cannot be earlier than start date.');
      return;
    }
    onConfirm();
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem', animation: 'fadeIn 0.2s ease-out' }}>
        <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: '#002035', borderRadius: '20px', padding: '32px', maxWidth: '500px', width: '100%', border: '1px solid rgba(255, 113, 32, 0.3)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', position: 'relative', animation: 'slideUp 0.3s ease-out', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          <button onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255, 255, 255, 0.1)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease', color: 'white', fontSize: '18px', lineHeight: 1 }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'; e.currentTarget.style.transform = 'scale(1.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}>✕</button>

          <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#e8eaed', fontSize: '1.25rem', fontWeight: '600' }}>
            <div style={{ background: 'rgba(40, 167, 69, 0.2)', padding: '0.4rem', borderRadius: '50%', display: 'flex' }}><Icon name="check" size={20} color="#28a745" strokeWidth={3} /></div>
            Confirm Task
          </h3>

          {todo.suggester && <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Suggested by: <span style={{ color: '#FF7120', fontWeight: '600' }}>{todo.suggester.full_name}</span></p>}

          <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem', marginBottom: '1.5rem' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Task Title</label>
              <textarea value={task} onChange={(e) => setTask(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: 'rgba(0, 39, 60, 0.5)', color: '#e8eaed', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', fontSize: '0.9rem', minHeight: '60px', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description (Optional)</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add task description..." style={{ width: '100%', padding: '0.75rem', background: 'rgba(0, 39, 60, 0.5)', color: '#e8eaed', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', fontSize: '0.9rem', minHeight: '80px', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: 'rgba(0, 39, 60, 0.5)', color: '#e8eaed', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', fontSize: '0.9rem', colorScheme: 'dark', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deadline</label>
                <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: 'rgba(0, 39, 60, 0.5)', color: '#e8eaed', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', fontSize: '0.9rem', colorScheme: 'dark', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assign To</label>
              <select value={assignee} onChange={(e) => setAssignee(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: 'rgba(0, 39, 60, 0.5)', color: '#e8eaed', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box', cursor: 'pointer' }}>
                <option value="">-- Select Assignee (Optional) --</option>
                {members.map(member => <option key={member.id} value={member.id}>{member.full_name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
            <button onClick={handleConfirm} style={{ flex: 1, padding: '0.75rem', background: '#28a745', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', transition: 'all 0.2s ease', boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(40, 167, 69, 0.4)'; e.currentTarget.style.background = '#2fc24f'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.3)'; e.currentTarget.style.background = '#28a745'; }}>Confirm & Assign</button>
            <button onClick={onClose} style={{ flex: 1, padding: '0.75rem', background: 'rgba(255, 255, 255, 0.1)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '12px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', transition: 'all 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>Cancel</button>
          </div>
        </div>
      </div>
    </>
  );
};
