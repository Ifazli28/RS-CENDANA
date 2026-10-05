import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ROLE_LIST, RoleName, AccountStatus } from '../../types';
import {
  SPECIALIST_CATEGORIES,
  formatDoctorNameWithTitleAndDegree,
} from '../../utils/doctorFormatting';
import {
  Users,
  UserCheck,
  ShieldAlert,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  AlertTriangle,
  MessageSquareWarning,
  UserPlus,
} from 'lucide-react';

// 1. PENGELOLAAN STAFF & EDIT STAFF + CONFIRMATION MODAL (Sec 44, 45, 46, 47)
export const StaffManagementView: React.FC = () => {
  const { staffAccounts, currentUser, updateStaffRoleAndInfo, deactivateStaff, deleteStaffAccount } = useApp();
  const [search, setSearch] = useState('');
  const [editingStaff, setEditingStaff] = useState<typeof staffAccounts[0] | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<RoleName>('Paramedic');
  const [editSpecialty, setEditSpecialty] = useState('');

  // Role Change Confirmation Modal State (Sec 46)
  const [confirmRoleModal, setConfirmRoleModal] = useState(false);

  // Deactivate Confirmation Modal State (Sec 47)
  const [deactivateTarget, setDeactivateTarget] = useState<typeof staffAccounts[0] | null>(null);

  // Delete Staff Confirmation Modal State
  const [deleteStaffTarget, setDeleteStaffTarget] = useState<typeof staffAccounts[0] | null>(null);

  const filtered = staffAccounts.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.role.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (st: typeof staffAccounts[0]) => {
    setEditingStaff(st);
    setEditName(st.name);
    setEditRole(st.role);
    setEditSpecialty(st.specialty || '');
    setConfirmRoleModal(false);
  };

  const handleSaveStaffEdit = () => {
    if (!editingStaff) return;
    if (editingStaff.role !== editRole && !confirmRoleModal) {
      // Sec 46: Show confirmation modal when role changes
      setConfirmRoleModal(true);
      return;
    }
    updateStaffRoleAndInfo(editingStaff.id, editRole, editName, editSpecialty);
    setEditingStaff(null);
    setConfirmRoleModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-pink-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Pengelolaan Staff & Hirarki Jabatan</h2>
          <p className="text-xs text-slate-500">
            Khusus Heads of Departments ke atas · Perubahan jabatan & penghapusan anggota otomatis memperbarui Database
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, jabatan, email..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-pink-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-pink-100 text-[11px] font-bold text-slate-500 bg-[#FFF5F8]/60">
                <th className="py-3.5 px-4">Staff Medis</th>
                <th className="py-3.5 px-4">Jabatan & Level</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Tanggal Bergabung</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-50 text-xs sm:text-sm">
              {filtered.map((st) => (
                <tr key={st.id} className="hover:bg-pink-50/30 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={st.avatarUrl}
                        alt={st.name}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-xl object-cover border border-pink-100"
                      />
                      <div>
                        <p className="font-semibold text-slate-900">{st.name}</p>
                        <p className="text-[11px] text-slate-500">{st.specialty}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-[#D63384]">
                      {st.role} (Lv.{st.level})
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-xs font-bold ${
                        st.status === 'Active'
                          ? 'text-[#20C997]'
                          : st.status === 'Pending Approval'
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {st.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-600">{st.email}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-500 tabular-nums">
                    {st.joinDate}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => openEdit(st)}
                        className="px-3 py-1.5 rounded-lg bg-[#FFF5F8] hover:bg-pink-100 text-[#D63384] text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      {st.status === 'Active' && st.id !== currentUser?.id && (
                        <button
                          onClick={() => setDeactivateTarget(st)}
                          className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold cursor-pointer"
                        >
                          Deactivate
                        </button>
                      )}
                      {st.id !== currentUser?.id && (
                        <button
                          onClick={() => setDeleteStaffTarget(st)}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Staff & Role Change Modal (Sec 45 & 46) */}
      {editingStaff && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setEditingStaff(null)}
        >
          <div
            className="bg-white rounded-2xl border border-pink-100 p-6 max-w-md w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {!confirmRoleModal ? (
              <>
                <h3 className="text-base font-bold text-slate-900 border-b border-pink-100 pb-3">
                  Edit Data & Jabatan Staff
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Lengkap Staff
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Jabatan / Role (Level 1 – 10)
                    </label>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value as RoleName)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                    >
                      {ROLE_LIST.map((r, i) => (
                        <option
                          key={r}
                          value={r}
                          disabled={
                            editingStaff.id === currentUser?.id && i + 1 > (currentUser?.level || 0)
                          }
                        >
                          Level {i + 1} — {r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Spesialisasi / Divisi
                    </label>
                    <input
                      type="text"
                      value={editSpecialty}
                      onChange={(e) => setEditSpecialty(e.target.value)}
                      placeholder="Contoh: Spesialis Obgyn / Spesialis Jantung"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                    {/* Pilihan Cepat Spesialis Dokter (Obgyn, Kecantikan, Forensik, Jantung, dll) */}
                    {[
                      'Doctor',
                      'Specialist Doctor',
                      'Heads of Departments',
                      'Deputy Chief',
                      'Chief Executive Officer',
                      'Executive Board',
                    ].includes(editRole) && (
                      <div className="pt-2 space-y-1.5">
                        <p className="text-[11px] font-semibold text-slate-500">
                          Pilih Spesialis (Otomatis menambahkan gelar <code className="text-[#D63384]">dr.</code> di depan & gelar pendidikan di belakang nama):
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {SPECIALIST_CATEGORIES.map((sp) => (
                            <button
                              key={sp.id}
                              type="button"
                              onClick={() => {
                                setEditSpecialty(sp.id);
                                setEditName(
                                  formatDoctorNameWithTitleAndDegree(editName, editRole, sp.id)
                                );
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                                editSpecialty === sp.id
                                  ? 'bg-[#E83E8C] text-white border-[#E83E8C]'
                                  : 'bg-[#FFF5F8] text-[#D63384] border-pink-200 hover:bg-pink-100'
                              }`}
                            >
                              {sp.id} ({sp.degreeSuffix})
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setEditingStaff(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveStaffEdit}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-xs font-semibold cursor-pointer"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </>
            ) : (
              /* Sec 46: Exact Confirmation Modal on Role Change */
              <div className="space-y-4 text-center py-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Ubah jabatan dari {editingStaff.role} menjadi {editRole}?
                </h3>
                <p className="text-xs text-slate-600 bg-[#FFF5F8] p-3 rounded-xl border border-pink-100">
                  Perubahan jabatan akan mengubah hak akses staff.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setConfirmRoleModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveStaffEdit}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-xs font-semibold cursor-pointer"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Deactivate Confirmation Modal (Sec 47) */}
      {deactivateTarget && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setDeactivateTarget(null)}
        >
          <div
            className="bg-white rounded-2xl border border-pink-100 p-6 max-w-md w-full space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-slate-900">
              Nonaktifkan Staff {deactivateTarget.name}?
            </h3>
            <p className="text-xs text-slate-600">
              Status staff akan diubah menjadi <strong>Inactive (Soft Delete)</strong>. Seluruh data historis duty, payroll, voting, cuti, dan resign tetap terjaga dan tidak rusak.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeactivateTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deactivateStaff(deactivateTarget.id);
                  setDeactivateTarget(null);
                }}
                className="px-5 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold cursor-pointer"
              >
                Confirm Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Staff Confirmation Modal */}
      {deleteStaffTarget && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setDeleteStaffTarget(null)}
        >
          <div
            className="bg-white rounded-2xl border border-pink-100 p-6 max-w-md w-full space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-slate-900">
              Hapus Anggota Staff ({deleteStaffTarget.name})?
            </h3>
            <p className="text-xs text-slate-600">
              Anggota staff beserta akunnya akan dihapus secara permanen dari daftar Pengelolaan Staff & Database.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteStaffTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteStaffAccount(deleteStaffTarget.id);
                  setDeleteStaffTarget(null);
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold cursor-pointer"
              >
                Confirm Delete Staff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 2. APPROVAL AKUN BARU (Sec 36 & 84 — Heads+ Level 7+)
// Jika pengajuan akun sudah diproses (Approve atau Reject), maka data pengajuan langsung hilang dari daftar ini
export const AccountApprovalView: React.FC = () => {
  const { staffAccounts, approveOrRejectAccount } = useApp();

  // Hanya menampilkan akun yang masih berstatus 'Pending Approval'
  const pendingList = staffAccounts.filter((s) => s.status === 'Pending Approval');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-pink-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Approval Akun Staff Baru</h2>
          <p className="text-xs text-slate-500">
            Menampilkan pengajuan akun baru. Begitu diproses (Approve / Reject), data pengajuan langsung selesai dan hilang dari antrean ini.
          </p>
        </div>
        <div className="px-3.5 py-1.5 rounded-xl bg-[#FFF5F8] border border-pink-100 text-xs font-bold text-[#D63384]">
          Antrean Pending: {pendingList.length} Akun
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-pink-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-pink-100 text-[11px] font-bold text-slate-500 bg-[#FFF5F8]/60">
                <th className="py-3.5 px-4">Nama Lengkap</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Tanggal Register</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-50 text-xs sm:text-sm">
              {pendingList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-xs text-slate-500">
                    Tidak ada pengajuan akun baru yang menunggu persetujuan saat ini.
                  </td>
                </tr>
              ) : (
                pendingList.map((acc) => (
                  <tr key={acc.id} className="hover:bg-pink-50/30 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{acc.name}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600">{acc.email}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500 tabular-nums">
                      {acc.registeredAt}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-bold text-amber-600">{acc.status}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => approveOrRejectAccount(acc.id, 'Approve')}
                          className="px-3.5 py-1.5 rounded-lg bg-[#20C997] text-white text-xs font-semibold hover:opacity-95 cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => approveOrRejectAccount(acc.id, 'Reject')}
                          className="px-3.5 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-semibold cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 3. KELOLA AKUN & HAPUS AKUN (Sec 48, 49, 50 — Heads+ Level 7+)
export const AccountManagementView: React.FC = () => {
  const { staffAccounts, currentUser, updateAccountStatus, deleteStaffAccount } = useApp();
  const [statusFilter, setStatusFilter] = useState<'All' | AccountStatus>('All');
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<typeof staffAccounts[0] | null>(
    null
  );

  const filtered = staffAccounts.filter((s) =>
    statusFilter === 'All' ? true : s.status === statusFilter
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-pink-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Kelola Akun & Kredensial Staff</h2>
          <p className="text-xs text-slate-500">
            Kelola status Active, Pending, Rejected, Inactive serta fitur hapus akun staff
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#FFF5F8] rounded-xl border border-pink-100">
          {(['All', 'Pending Approval', 'Active', 'Rejected', 'Inactive'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                statusFilter === st ? 'bg-[#E83E8C] text-white' : 'text-slate-600'
              }`}
            >
              {st === 'Pending Approval' ? 'Pending' : st}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-pink-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-pink-100 text-[11px] font-bold text-slate-500 bg-[#FFF5F8]/60">
                <th className="py-3.5 px-4">Nama Akun</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status Akun</th>
                <th className="py-3.5 px-4 text-right">Kelola Status / Delete Akun</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-50 text-xs sm:text-sm">
              {filtered.map((acc) => (
                <tr key={acc.id} className="hover:bg-pink-50/30 transition">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{acc.name}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-600">{acc.email}</td>
                  <td className="py-3.5 px-4 text-slate-600">{acc.role}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-xs font-bold ${
                        acc.status === 'Active'
                          ? 'text-[#20C997]'
                          : acc.status === 'Pending Approval'
                          ? 'text-amber-600'
                          : acc.status === 'Inactive'
                          ? 'text-slate-500'
                          : 'text-rose-600'
                      }`}
                    >
                      {acc.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <select
                        value={acc.status}
                        onChange={(e) =>
                          updateAccountStatus(acc.id, e.target.value as AccountStatus)
                        }
                        className="px-2.5 py-1.5 rounded-lg border border-pink-200 text-xs bg-white font-semibold"
                      >
                        <option value="Pending Approval">Pending Approval</option>
                        <option value="Active">Active</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Inactive">Inactive</option>
                      </select>

                      {acc.id !== currentUser?.id && (
                        <button
                          onClick={() => setDeleteConfirmTarget(acc)}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Akun</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal Delete Account */}
      {deleteConfirmTarget && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setDeleteConfirmTarget(null)}
        >
          <div
            className="bg-white rounded-2xl border border-pink-100 p-6 max-w-md w-full space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-slate-900">
              Hapus Permanen Akun ({deleteConfirmTarget.name})?
            </h3>
            <p className="text-xs text-slate-600">
              Kredensial login akun akan dihapus secara permanen dari sistem & Database.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteStaffAccount(deleteConfirmTarget.id);
                  setDeleteConfirmTarget(null);
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold cursor-pointer"
              >
                Confirm Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 4. APPROVAL CUTI & APPROVAL RESIGN (Sec 54, 56, 86 — Heads+ Level 7+)
export const LeaveAndResignApprovalView: React.FC<{ mode: 'leave' | 'resign' }> = ({ mode }) => {
  const { leaveRequests, resignRequests, reviewLeaveRequest, reviewResignRequest } = useApp();
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  if (mode === 'leave') {
    return (
      <div className="space-y-6">
        <div className="bg-white p-5 rounded-2xl border border-pink-100">
          <h2 className="text-lg font-bold text-slate-900">Approval Cuti Staff (Heads+)</h2>
          <p className="text-xs text-slate-500">
            Setujui atau tolak permohonan cuti staff beserta alasan penolakan
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-pink-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-pink-100 text-[11px] font-bold text-slate-500 bg-[#FFF5F8]/60">
                  <th className="py-3.5 px-4">Nama & Jabatan</th>
                  <th className="py-3.5 px-4">Jenis Cuti</th>
                  <th className="py-3.5 px-4">Periode & Durasi</th>
                  <th className="py-3.5 px-4">Alasan</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50 text-xs sm:text-sm">
                {leaveRequests.map((lv) => (
                  <tr key={lv.id} className="hover:bg-pink-50/30 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{lv.staffName}</div>
                      <div className="text-[11px] text-[#E83E8C]">{lv.staffRole}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{lv.leaveType}</td>
                    <td className="py-3.5 px-4 font-mono text-xs tabular-nums">
                      {lv.startDate} s/d {lv.endDate} ({lv.durationDays} hr)
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {lv.reason}
                      {lv.rejectionReason && (
                        <div className="text-rose-600 font-semibold mt-0.5">
                          Ditolak: {lv.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs font-bold ${
                          lv.status === 'Approved'
                            ? 'text-[#20C997]'
                            : lv.status === 'Rejected'
                            ? 'text-rose-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {lv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {lv.status === 'Pending' && (
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => reviewLeaveRequest(lv.id, 'Approved')}
                            className="px-3 py-1.5 rounded-lg bg-[#20C997] text-white text-xs font-semibold cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setRejectId(lv.id);
                              setRejectionReason('');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 text-xs font-semibold cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rejection Reason Modal (Sec 54) */}
        {rejectId && (
          <div
            className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setRejectId(null)}
          >
            <div
              className="bg-white rounded-2xl border border-pink-100 p-6 max-w-md w-full space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-base font-bold text-slate-900">Alasan Penolakan Cuti</h3>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Masukkan alasan penolakan cuti..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setRejectId(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  disabled={!rejectionReason.trim()}
                  onClick={() => {
                    reviewLeaveRequest(rejectId, 'Rejected', rejectionReason.trim());
                    setRejectId(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold disabled:opacity-40 cursor-pointer"
                >
                  Simpan & Tolak Cuti
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Approval Resign Mode (Sec 56)
  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-pink-100">
        <h2 className="text-lg font-bold text-slate-900">Approval Resign Staff (Heads+)</h2>
        <p className="text-xs text-slate-500">
          Jika disetujui, status staff otomatis menjadi Inactive dengan data historis tetap aman
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-pink-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-pink-100 text-[11px] font-bold text-slate-500 bg-[#FFF5F8]/60">
                <th className="py-3.5 px-4">Nama & Jabatan</th>
                <th className="py-3.5 px-4">Tgl Pengajuan</th>
                <th className="py-3.5 px-4">Tgl Efektif</th>
                <th className="py-3.5 px-4">Alasan</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-50 text-xs sm:text-sm">
              {resignRequests.map((r) => (
                <tr key={r.id} className="hover:bg-pink-50/30 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{r.staffName}</div>
                    <div className="text-[11px] text-[#E83E8C]">{r.staffRole}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs tabular-nums">{r.submittedDate}</td>
                  <td className="py-3.5 px-4 font-mono text-xs tabular-nums">{r.effectiveDate}</td>
                  <td className="py-3.5 px-4 text-xs text-slate-600">
                    {r.reason}
                    {r.rejectionReason && (
                      <div className="text-rose-600 font-semibold mt-0.5">
                        Ditolak: {r.rejectionReason}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-xs font-bold ${
                        r.status === 'Approved'
                          ? 'text-[#20C997]'
                          : r.status === 'Rejected'
                          ? 'text-rose-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {r.status === 'Pending' && (
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => reviewResignRequest(r.id, 'Approved')}
                          className="px-3 py-1.5 rounded-lg bg-[#20C997] text-white text-xs font-semibold cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setRejectId(r.id);
                            setRejectionReason('');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 text-xs font-semibold cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {rejectId && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setRejectId(null)}
        >
          <div
            className="bg-white rounded-2xl border border-pink-100 p-6 max-w-md w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-slate-900">Alasan Penolakan Resign</h3>
            <textarea
              required
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Masukkan alasan penolakan pengajuan resign..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                disabled={!rejectionReason.trim()}
                onClick={() => {
                  reviewResignRequest(rejectId, 'Rejected', rejectionReason.trim());
                  setRejectId(null);
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold disabled:opacity-40 cursor-pointer"
              >
                Simpan & Tolak Resign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 5. RECRUITMENT MANAGEMENT & COMPLAINT MANAGEMENT (Sec 64 & 65 — Heads+ Level 7+)
export const RecruitmentAndComplaintManageView: React.FC<{
  mode: 'recruitment' | 'complaint';
}> = ({ mode }) => {
  const {
    recruitmentStatus,
    recruitmentApplicants,
    toggleRecruitmentStatus,
    updateRecruitmentApplicantStatus,
    complaints,
    updateComplaintStatus,
  } = useApp();

  const [selectedComplaint, setSelectedComplaint] = useState<typeof complaints[0] | null>(null);
  const [internalNote, setInternalNote] = useState('');

  if (mode === 'recruitment') {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-pink-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recruitment Management Paramedic</h2>
            <p className="text-xs text-slate-500">
              Status pendaftaran terhubung langsung ke tombol Recruitment pada Landing Page publik
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleRecruitmentStatus('OPEN')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                recruitmentStatus === 'OPEN'
                  ? 'bg-[#20C997] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              STATUS: OPEN
            </button>
            <button
              onClick={() => toggleRecruitmentStatus('CLOSED')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                recruitmentStatus === 'CLOSED'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              STATUS: CLOSED
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-pink-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-pink-100 text-[11px] font-bold text-slate-500 bg-[#FFF5F8]/60">
                  <th className="py-3.5 px-4">Karakter IC & Syarat</th>
                  <th className="py-3.5 px-4">CV IC & Pengalaman RP</th>
                  <th className="py-3.5 px-4">Dokumen & Info OOC</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Ubah Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50 text-xs sm:text-sm">
                {recruitmentApplicants.map((app) => (
                  <tr key={app.id} className="hover:bg-pink-50/30 transition align-top">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">
                        {app.fullName} ({app.gender})
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {app.birthDateIC ? `Lahir IC: ${app.birthDateIC}` : app.phoneOrIC}
                      </div>
                      {app.icInterviewRequirements && (
                        <div className="mt-2 space-y-0.5 text-[11px] text-slate-600">
                          <div>
                            KTP: <strong>{app.icInterviewRequirements.hasKtpIme ? 'Ya' : 'Tidak'}</strong> · SKB:{' '}
                            <strong>{app.icInterviewRequirements.hasSkb ? 'Ya' : 'Tidak'}</strong> · SIM:{' '}
                            <strong>{app.icInterviewRequirements.hasSim ? 'Ya' : 'Menyusul'}</strong>
                          </div>
                          <div>
                            SKS: <strong>{app.icInterviewRequirements.hasSuratKesehatan ? 'Ya' : 'Tidak'}</strong> · Psikolog:{' '}
                            <strong>{app.icInterviewRequirements.hasSuratPsikolog ? 'Ya' : 'Tidak'}</strong>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 max-w-md space-y-1">
                      <div>
                        <strong>Pengalaman Medis/EMS:</strong> {app.experience}
                      </div>
                      <div>
                        <strong>Motivasi CMC:</strong> {app.motivation}
                      </div>
                      {app.rpExperienceOOC && (
                        <div>
                          <strong>Pengalaman RP (OOC):</strong> {app.rpExperienceOOC}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 space-y-1">
                      {app.ktpPhotoName && (
                        <div className="font-mono text-[11px] text-[#D63384]">
                          📎 KTP: {app.ktpPhotoName} | SKB: {app.skbPhotoName}
                        </div>
                      )}
                      {app.suratKesehatanPhotoName && (
                        <div className="font-mono text-[11px] text-[#20C997]">
                          📎 SKS: {app.suratKesehatanPhotoName} | Psikolog: {app.suratPsikologPhotoName}
                        </div>
                      )}
                      {app.onlineHoursOOC ? (
                        <div className="text-[11px] text-slate-600 pt-1">
                          <div>
                            <strong>Kota Lain:</strong> {app.otherCityResponsibilityOOC}
                          </div>
                          <div>
                            <strong>Online:</strong> {app.onlineHoursOOC} ({app.onlineDaysOOC})
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-500">{app.education}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#E83E8C]">{app.status}</td>
                    <td className="py-3.5 px-4 text-right">
                      <select
                        value={app.status}
                        onChange={(e) =>
                          updateRecruitmentApplicantStatus(
                            app.id,
                            e.target.value as typeof app.status
                          )
                        }
                        className="px-2.5 py-1.5 rounded-lg border border-pink-200 text-xs bg-white font-semibold"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Interview">Interview</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Complaint Management (Sec 65)
  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-pink-100">
        <h2 className="text-lg font-bold text-slate-900">Manajemen Keluhan & Aspirasi Warga</h2>
        <p className="text-xs text-slate-500">
          Tinjau laporan warga, ubah status (Baru, Diproses, Selesai, Ditolak), dan berikan catatan internal
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {complaints.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl border border-pink-100 p-5 space-y-3 shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-[#E83E8C]">{c.type}</span>
                <h3 className="text-base font-bold text-slate-900">{c.subject}</h3>
                <p className="text-xs text-slate-500">
                  Pelapor: <strong>{c.reporterName}</strong> · Tanggal: {c.createdAt}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={c.status}
                  onChange={(e) =>
                    updateComplaintStatus(c.id, e.target.value as typeof c.status)
                  }
                  className="px-3 py-1.5 rounded-xl border border-pink-200 text-xs font-bold bg-[#FFF5F8] text-[#D63384]"
                >
                  <option value="Baru">Baru</option>
                  <option value="Diproses">Diproses</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Ditolak">Ditolak</option>
                </select>
                <button
                  onClick={() => {
                    setSelectedComplaint(c);
                    setInternalNote(c.internalNote || '');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold cursor-pointer"
                >
                  Catatan Internal
                </button>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-3.5 rounded-xl">
              {c.chronology}
            </p>
            {c.internalNote && (
              <p className="text-xs text-[#20C997] font-semibold">
                Catatan Internal Manajemen: {c.internalNote}
              </p>
            )}
          </div>
        ))}
      </div>

      {selectedComplaint && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedComplaint(null)}
        >
          <div
            className="bg-white rounded-2xl border border-pink-100 p-6 max-w-md w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-slate-900">
              Catatan Internal — {selectedComplaint.subject}
            </h3>
            <textarea
              rows={3}
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              placeholder="Tambahkan catatan tindak lanjut internal..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  updateComplaintStatus(
                    selectedComplaint.id,
                    selectedComplaint.status,
                    internalNote
                  );
                  setSelectedComplaint(null);
                }}
                className="px-5 py-2 rounded-xl bg-[#E83E8C] text-white text-xs font-semibold cursor-pointer"
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
