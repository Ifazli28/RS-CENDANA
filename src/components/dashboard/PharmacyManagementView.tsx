import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { PharmacyOrder, PharmacyOrderStatus, PharmacyPackageConfig } from '../../types';
import { LogoRSKotaBaru, LogoKotaBaruRoleplay } from '../BrandAssets';
import {
  Pill,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Printer,
  Trash2,
  Eye,
  ShieldAlert,
  ShoppingBag,
  DollarSign,
  PackageCheck,
  FileText,
  User,
  Layers,
  ArrowRight,
  ExternalLink,
  Plus,
  Edit3,
  RotateCcw,
  Tag,
  Boxes,
  Percent,
  Check,
} from 'lucide-react';

export const PharmacyManagementView: React.FC = () => {
  const {
    currentUser,
    pharmacyOrders,
    pharmacyPackages,
    updatePharmacyOrderStatus,
    deletePharmacyOrder,
    requestDelete,
    addPharmacyPackage,
    updatePharmacyPackage,
    deletePharmacyPackage,
    resetPharmacyPackagesToDefault,
  } = useApp();

  // Main Tabs: Orders or Package Management
  const [activeTab, setActiveTab] = useState<'orders' | 'packages'>('orders');

  // Order Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Semua' | PharmacyOrderStatus>('Semua');
  const [packageFilter, setPackageFilter] = useState<string>('Semua');

  // Selected Order for Status Update Modal
  const [selectedOrder, setSelectedOrder] = useState<PharmacyOrder | null>(null);
  const [editStatus, setEditStatus] = useState<PharmacyOrderStatus>('Menunggu');
  const [editNotes, setEditNotes] = useState('');

  // Selected Order for Receipt / Print Modal
  const [receiptOrder, setReceiptOrder] = useState<PharmacyOrder | null>(null);

  // Selected Image for Lightbox Preview Modal
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);

  // Package Modal State (Add or Edit)
  const [packageModal, setPackageModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    targetId?: string;
  }>({
    isOpen: false,
    mode: 'add',
  });
  const [formPkgCode, setFormPkgCode] = useState('');
  const [formPkgName, setFormPkgName] = useState('');
  const [formPkgDesc, setFormPkgDesc] = useState('');
  const [formPkgPrice, setFormPkgPrice] = useState<number>(25000);

  // Access Control: Co-Ass ke atas (minLevel: 4)
  if (!currentUser || currentUser.level < 4) {
    return (
      <div className="p-8 bg-white rounded-3xl border border-red-200 text-center space-y-4 max-w-xl mx-auto shadow-sm my-12">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#9E1B21] flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Akses Terbatas: Co-Ass ke Atas</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Menu Pengelolaan Data Loket Farmasi hanya dapat diakses oleh staf medis dengan jabatan{' '}
          <strong>Co-Ass ke atas (Level 4+)</strong>. Akun Anda saat ini ({currentUser?.role || 'Staff'}, Level{' '}
          {currentUser?.level || 1}) belum memiliki hak akses untuk memproses antrean obat dan mengelola paket farmasi.
        </p>
      </div>
    );
  }

  // Statistics calculation for Orders
  const totalOrders = pharmacyOrders.length;
  const pendingOrders = pharmacyOrders.filter((o) => o.status === 'Menunggu').length;
  const processingOrders = pharmacyOrders.filter((o) => o.status === 'Diproses').length;
  const completedOrders = pharmacyOrders.filter((o) => o.status === 'Selesai').length;
  const totalRevenue = pharmacyOrders
    .filter((o) => o.status === 'Selesai')
    .reduce((acc, o) => acc + (o.totalPrice || 0), 0);

  // Statistics calculation for Packages
  const totalPackages = pharmacyPackages.length;
  const prices = pharmacyPackages.map((p) => p.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return pharmacyOrders
      .filter((o) => {
        const matchesSearch =
          o.fullName.toLowerCase().includes(search.toLowerCase()) ||
          o.pocketNumber.toLowerCase().includes(search.toLowerCase()) ||
          o.id.toLowerCase().includes(search.toLowerCase()) ||
          o.packageType.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = statusFilter === 'Semua' || o.status === statusFilter;
        const matchesPackage = packageFilter === 'Semua' || o.packageType === packageFilter;

        return matchesSearch && matchesStatus && matchesPackage;
      })
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }, [pharmacyOrders, search, statusFilter, packageFilter]);

  const handleOpenEditModal = (order: PharmacyOrder) => {
    setSelectedOrder(order);
    setEditStatus(order.status);
    setEditNotes(order.notes || '');
  };

  const handleSaveStatus = () => {
    if (!selectedOrder) return;
    updatePharmacyOrderStatus(selectedOrder.id, editStatus, editNotes);
    setSelectedOrder(null);
  };

  const formatPrice = (val: number) => {
    return `$${val.toLocaleString('id-ID')} KBRP`;
  };

  // Open modal to add package
  const handleOpenAddPackage = () => {
    const nextCodeLetter = String.fromCharCode(97 + pharmacyPackages.length); // 'e', 'f', etc.
    setFormPkgCode(nextCodeLetter);
    setFormPkgName('');
    setFormPkgDesc('');
    setFormPkgPrice(25000);
    setPackageModal({ isOpen: true, mode: 'add' });
  };

  // Open modal to edit package
  const handleOpenEditPackage = (pkg: PharmacyPackageConfig) => {
    setFormPkgCode(pkg.code);
    setFormPkgName(pkg.name);
    setFormPkgDesc(pkg.description);
    setFormPkgPrice(pkg.price);
    setPackageModal({ isOpen: true, mode: 'edit', targetId: pkg.id });
  };

  // Submit package (Add or Edit)
  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPkgName.trim()) return;

    if (packageModal.mode === 'add') {
      addPharmacyPackage({
        code: formPkgCode || 'x',
        name: formPkgName,
        description: formPkgDesc,
        price: formPkgPrice,
      });
    } else if (packageModal.mode === 'edit' && packageModal.targetId) {
      updatePharmacyPackage(packageModal.targetId, {
        code: formPkgCode,
        name: formPkgName,
        description: formPkgDesc,
        price: formPkgPrice,
      });
    }

    setPackageModal({ isOpen: false, mode: 'add' });
  };

  const getStatusBadge = (status: PharmacyOrderStatus) => {
    switch (status) {
      case 'Menunggu':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            Menunggu
          </span>
        );
      case 'Diproses':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold border border-blue-300">
            <PackageCheck className="w-3.5 h-3.5 text-blue-700" />
            Diproses
          </span>
        );
      case 'Selesai':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            Selesai
          </span>
        );
      case 'Ditolak':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-300">
            <X className="w-3.5 h-3.5 text-rose-700" />
            Ditolak
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-red-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9E1B21] mb-1">
            <Pill className="w-4 h-4 text-[#9E1B21]" />
            <span>Instalasi Farmasi RS Kota Baru · Akses Co-Ass ke Atas</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Pengelolaan Data & Manajemen Farmasi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola katalog paket obat & perban, atur tarif harga KBRP, serta pantau dan layani permohonan pesanan warga.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-red-50 text-[#7F1D1D] text-xs font-bold border border-red-200">
            Petugas: {currentUser.name} ({currentUser.role})
          </span>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex border-b border-red-100 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2.5 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer ${
            activeTab === 'orders'
              ? 'border-[#9E1B21] text-[#9E1B21] bg-red-50/40 rounded-t-2xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Antrean Pesanan Loket</span>
          {pendingOrders > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold animate-pulse">
              {pendingOrders}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('packages')}
          className={`flex items-center gap-2.5 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer ${
            activeTab === 'packages'
              ? 'border-[#9E1B21] text-[#9E1B21] bg-red-50/40 rounded-t-2xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Manajemen Paket & Harga</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-extrabold">
            {pharmacyPackages.length}
          </span>
        </button>
      </div>

      {/* TAB 1: ANTREAN PESANAN LOKET */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="p-4 rounded-2xl bg-white border border-red-100 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Total Pesanan
              </span>
              <div className="text-2xl font-black font-mono text-slate-900">{totalOrders}</div>
              <p className="text-[10px] text-slate-400">Seluruh antrean farmasi</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-amber-200 bg-amber-50/20 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" />
                Menunggu
              </span>
              <div className="text-2xl font-black font-mono text-amber-700">{pendingOrders}</div>
              <p className="text-[10px] text-amber-600">Perlu diproses petugas</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-blue-200 bg-blue-50/20 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 block flex items-center gap-1">
                <PackageCheck className="w-3 h-3 text-blue-600" />
                Diproses
              </span>
              <div className="text-2xl font-black font-mono text-blue-700">{processingOrders}</div>
              <p className="text-[10px] text-blue-600">Sedang disiapkan obatnya</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-emerald-200 bg-emerald-50/20 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Selesai
              </span>
              <div className="text-2xl font-black font-mono text-emerald-700">{completedOrders}</div>
              <p className="text-[10px] text-emerald-600">Obat & perban diserahkan</p>
            </div>

            <div className="col-span-2 lg:col-span-1 p-4 rounded-2xl bg-gradient-to-br from-[#9E1B21] to-[#7F1D1D] text-white shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-200 block flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-red-200" />
                Total Pendapatan
              </span>
              <div className="text-xl sm:text-2xl font-black font-mono text-white truncate">
                ${totalRevenue.toLocaleString('id-ID')}
              </div>
              <p className="text-[10px] text-red-200 truncate">KBRP dari pesanan selesai</p>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="p-4 rounded-2xl bg-white border border-red-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(['Semua', 'Menunggu', 'Diproses', 'Selesai', 'Ditolak'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    statusFilter === st
                      ? 'bg-[#9E1B21] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Search & Dynamic Package Dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto">
              <select
                value={packageFilter}
                onChange={(e) => setPackageFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#9E1B21]"
              >
                <option value="Semua">Semua Paket Farmasi</option>
                {pharmacyPackages.map((pkg) => (
                  <option key={pkg.id} value={pkg.name}>
                    {pkg.name} ({pkg.priceFormatted})
                  </option>
                ))}
              </select>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama / no kantong..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#9E1B21]"
                />
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-3xl border border-red-100 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-red-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#9E1B21]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Daftar Permohonan & Antrean Loket Farmasi
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-semibold">
                {filteredOrders.length} Pesanan Ditemukan
              </span>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Pill className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-base font-bold text-slate-700">Belum Ada Pesanan Farmasi</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Tidak ada data pesanan farmasi yang cocok dengan filter atau pencarian saat ini.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-red-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">No / ID</th>
                      <th className="py-3 px-4">Waktu Pesan</th>
                      <th className="py-3 px-4">Nama Pasien</th>
                      <th className="py-3 px-4">No. Kantong</th>
                      <th className="py-3 px-4">Paket yang Dibeli</th>
                      <th className="py-3 px-4 text-center">Jumlah</th>
                      <th className="py-3 px-4 text-right">Total Biaya</th>
                      <th className="py-3 px-4 text-center">Foto Bukti</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4">Petugas</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-50 text-xs">
                    {filteredOrders.map((order, idx) => (
                      <tr key={order.id} className="hover:bg-red-50/30 transition">
                        <td className="py-3 px-4 font-mono text-slate-500">
                          <div>#{idx + 1}</div>
                          <div className="text-[10px] text-slate-400 font-mono truncate max-w-[100px]">
                            {order.id}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                          <div>{order.createdAt?.slice(0, 10)}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {order.createdAt?.slice(11, 16) || '00:00'}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{order.fullName}</div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-red-100 text-[#7F1D1D] font-mono font-extrabold text-xs border border-red-200">
                            {order.pocketNumber}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{order.packageType}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {formatPrice(order.unitPrice)} / unit
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center font-mono font-extrabold text-slate-800 text-sm">
                          {order.quantity}x
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-extrabold text-[#7F1D1D] text-sm whitespace-nowrap">
                          {formatPrice(order.totalPrice)}
                        </td>

                        {/* Foto Bukti */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {order.ktpOrCardPhotoUrl ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setLightboxImage({
                                    url: order.ktpOrCardPhotoUrl!,
                                    title: `Foto KTP/Kartu Pasien - ${order.fullName}`,
                                  })
                                }
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-100 hover:text-[#9E1B21] transition text-slate-600 cursor-pointer"
                                title="Lihat Foto KTP / Kartu Pasien"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span
                                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200"
                                title="Verifikasi fisik di loket: Wajib memperlihatkan KTP/Kartu Pasien/KTA kepada petugas farmasi"
                              >
                                Verifikasi Fisik
                              </span>
                            )}

                            {order.ktaPhotoUrl && (
                              <button
                                type="button"
                                onClick={() =>
                                  setLightboxImage({
                                    url: order.ktaPhotoUrl!,
                                    title: `Foto KTA - ${order.fullName}`,
                                  })
                                }
                                className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition cursor-pointer"
                                title="Lihat Foto KTA"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {getStatusBadge(order.status)}
                        </td>

                        {/* Petugas */}
                        <td className="py-3 px-4 text-slate-600">
                          {order.handledByStaffName ? (
                            <div>
                              <span className="font-semibold text-slate-800 block">
                                {order.handledByStaffName}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {order.handledByStaffRole || 'Staff Medis'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Belum diproses</span>
                          )}
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(order)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#9E1B21] text-white font-semibold text-[11px] hover:bg-[#7F1D1D] transition cursor-pointer"
                            >
                              Status
                            </button>
                            <button
                              type="button"
                              onClick={() => setReceiptOrder(order)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                              title="Cetak Struk / Nota Farmasi"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                requestDelete(
                                  'Hapus Pesanan Farmasi',
                                  `Apakah Anda yakin ingin menghapus data pesanan ${order.packageType} milik ${order.fullName}?`,
                                  () => deletePharmacyOrder(order.id)
                                );
                              }}
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                              title="Hapus Data"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MANAJEMEN PAKET & HARGA FARMASI */}
      {activeTab === 'packages' && (
        <div className="space-y-6">
          {/* Top Actions & Subtitle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-red-100 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Boxes className="w-5 h-5 text-[#9E1B21]" />
                Katalog Paket Obat & Perban Farmasi
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tambahkan paket baru, ubah rincian nama atau isi paket, dan atur harga satuan dalam mata uang KBRP. Perubahan langsung tersinkronisasi ke formulir pesanan publik.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  requestDelete(
                    'Reset Paket Farmasi ke Standar RSKB',
                    'Apakah Anda yakin ingin mereset seluruh paket dan harga farmasi kembali ke pengaturan standar bawaan RS Kota Baru?',
                    () => resetPharmacyPackagesToDefault()
                  );
                }}
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Kembalikan paket ke 4 paket standar RSKB"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset ke Standar</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAddPackage}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#9E1B21] to-[#7F1D1D] hover:from-[#7F1D1D] hover:to-[#5B1316] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Paket Baru</span>
              </button>
            </div>
          </div>

          {/* Pricing & Package KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-white border border-red-100 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Total Paket Aktif
              </span>
              <div className="text-2xl font-black font-mono text-slate-900">{totalPackages} Paket</div>
              <p className="text-[10px] text-slate-400">Tersedia di loket farmasi</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-emerald-100 bg-emerald-50/20 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                Paket Termurah
              </span>
              <div className="text-2xl font-black font-mono text-emerald-700">
                ${minPrice.toLocaleString('id-ID')}
              </div>
              <p className="text-[10px] text-emerald-600">Harga minimum saat ini</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-blue-100 bg-blue-50/20 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 block">
                Paket Termahal
              </span>
              <div className="text-2xl font-black font-mono text-blue-700">
                ${maxPrice.toLocaleString('id-ID')}
              </div>
              <p className="text-[10px] text-blue-600">Harga maksimum paket bundle</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-amber-100 bg-amber-50/20 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
                Rata-rata Harga
              </span>
              <div className="text-2xl font-black font-mono text-amber-700">
                ${avgPrice.toLocaleString('id-ID')}
              </div>
              <p className="text-[10px] text-amber-600">Rerata per paket KBRP</p>
            </div>
          </div>

          {/* Package Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pharmacyPackages.map((pkg, idx) => (
              <div
                key={pkg.id}
                className="bg-white rounded-3xl border border-red-100 p-5 shadow-xs hover:border-[#9E1B21]/30 transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-red-100 text-[#7F1D1D] font-mono font-black text-sm flex items-center justify-center uppercase border border-red-200">
                        {pkg.code || String.fromCharCode(97 + idx)}
                      </span>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                          {pkg.name}
                        </h3>
                        <span className="text-[11px] text-slate-400 font-mono">Kode ID: {pkg.id}</span>
                      </div>
                    </div>

                    <div className="text-right whitespace-nowrap">
                      <div className="text-lg font-black font-mono text-[#7F1D1D]">
                        {pkg.priceFormatted || formatPrice(pkg.price)}
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                        Harga Satuan
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                    <span className="font-semibold text-slate-700 block mb-0.5">Deskripsi / Isi Paket:</span>
                    <p className="leading-relaxed">{pkg.description || 'Tidak ada keterangan khusus.'}</p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Quick increment buttons for price */}
                    <button
                      type="button"
                      onClick={() =>
                        updatePharmacyPackage(pkg.id, {
                          price: Math.max(1000, pkg.price - 5000),
                        })
                      }
                      className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] font-bold transition cursor-pointer"
                      title="Turunkan harga $5.000 KBRP"
                    >
                      -$5K
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updatePharmacyPackage(pkg.id, {
                          price: pkg.price + 5000,
                        })
                      }
                      className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] font-bold transition cursor-pointer"
                      title="Naikkan harga $5.000 KBRP"
                    >
                      +$5K
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditPackage(pkg)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-[#9E1B21] text-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit & Harga</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        requestDelete(
                          'Hapus Paket Farmasi',
                          `Apakah Anda yakin ingin menghapus paket "${pkg.name}" dari katalog farmasi? Pasien tidak akan bisa lagi memilih paket ini di loket publik.`,
                          () => deletePharmacyPackage(pkg.id)
                        );
                      }}
                      className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                      title="Hapus Paket"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pharmacyPackages.length === 0 && (
            <div className="p-12 text-center bg-white rounded-3xl border border-red-100 space-y-4">
              <Boxes className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-700">Katalog Paket Masih Kosong</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Belum ada paket farmasi yang terdaftar. Anda dapat menambahkan paket baru atau klik tombol di bawah untuk mengembalikan paket standar.
              </p>
              <button
                type="button"
                onClick={() => resetPharmacyPackagesToDefault()}
                className="px-4 py-2 rounded-xl bg-[#9E1B21] text-white text-xs font-bold hover:bg-[#7F1D1D] transition cursor-pointer inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Pulihkan Paket Standar RSKB</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODAL: TAMBAH ATAU EDIT PAKET & HARGA FARMASI */}
      {packageModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-red-100 p-6 max-w-lg w-full space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-red-100 pb-3">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-[#9E1B21]" />
                <h3 className="text-base font-bold text-slate-900">
                  {packageModal.mode === 'add' ? 'Tambah Paket Farmasi Baru' : 'Edit Paket & Atur Harga'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPackageModal({ isOpen: false, mode: 'add' })}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePackage} className="space-y-4">
              {/* Kode Huruf & Nama Paket */}
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1 space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Kode/Huruf *</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="a / e"
                    value={formPkgCode}
                    onChange={(e) => setFormPkgCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono uppercase text-center focus:outline-none focus:border-[#9E1B21]"
                  />
                  <span className="text-[10px] text-slate-400 block text-center">Mis: a, b, c</span>
                </div>

                <div className="col-span-3 space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Nama Paket *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Paket Perban Ekstra (20 Pcs)"
                    value={formPkgName}
                    onChange={(e) => setFormPkgName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#9E1B21]"
                  />
                  <span className="text-[10px] text-slate-400 block">Tampil pada dropdown pilihan loket</span>
                </div>
              </div>

              {/* Deskripsi Paket */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Deskripsi / Rincian Isi Paket *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Contoh: 15 Perban Steril + 5 Obat Antidepresan Farmasi RSKB"
                  value={formPkgDesc}
                  onChange={(e) => setFormPkgDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#9E1B21]"
                />
              </div>

              {/* Atur Harga */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">Harga Paket (KBRP) *</label>
                  <span className="text-xs font-mono font-extrabold text-[#7F1D1D]">
                    {formatPrice(formPkgPrice || 0)}
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400 font-mono">$</span>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    value={formPkgPrice}
                    onChange={(e) => setFormPkgPrice(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full pl-7 pr-16 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:border-[#9E1B21]"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] font-bold text-slate-400">KBRP</span>
                </div>

                {/* Quick Price Increment Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 mr-1">Preset Cepat:</span>
                  {[20000, 25000, 40000, 45000, 50000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormPkgPrice(preset)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border transition cursor-pointer ${
                        formPkgPrice === preset
                          ? 'bg-[#9E1B21] text-white border-[#9E1B21]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      ${preset.toLocaleString('id-ID')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPackageModal({ isOpen: false, mode: 'add' })}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#9E1B21] to-[#7F1D1D] text-white text-xs font-bold hover:from-[#7F1D1D] hover:to-[#5B1316] transition cursor-pointer shadow-xs"
                >
                  {packageModal.mode === 'add' ? 'Simpan Paket Baru' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: UPDATE STATUS & CATATAN PETUGAS */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-red-100 p-6 max-w-md w-full space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-red-100 pb-3">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-[#9E1B21]" />
                <h3 className="text-base font-bold text-slate-900">Proses Pesanan Farmasi</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Order Brief */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Pemesan:</span>
                <strong className="text-slate-800">{selectedOrder.fullName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">No. Kantong:</span>
                <strong className="font-mono text-[#9E1B21]">{selectedOrder.pocketNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Paket Farmasi:</span>
                <strong className="text-slate-800">{selectedOrder.packageType}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jumlah & Total:</span>
                <strong className="font-mono text-[#7F1D1D]">
                  {selectedOrder.quantity}x — {formatPrice(selectedOrder.totalPrice)}
                </strong>
              </div>
            </div>

            {/* Status Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Status Pesanan *</label>
              <div className="grid grid-cols-2 gap-2">
                {(['Menunggu', 'Diproses', 'Selesai', 'Ditolak'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setEditStatus(st)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      editStatus === st
                        ? st === 'Selesai'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : st === 'Ditolak'
                          ? 'bg-rose-600 text-white border-rose-600'
                          : st === 'Diproses'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Petugas Notes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Catatan Petugas Medis (Opsional)
              </label>
              <textarea
                rows={3}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Contoh: Obat sudah diserahkan di Loket 2, pembayaran telah diverifikasi..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#9E1B21]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveStatus}
                className="px-5 py-2 rounded-xl bg-[#9E1B21] text-white text-xs font-bold hover:bg-[#7F1D1D] transition cursor-pointer shadow-xs"
              >
                Simpan Pembaruan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CETAK NOTA / STRUK PENGAMBILAN FARMASI */}
      {receiptOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-lg w-full space-y-6 shadow-2xl relative print:border-none print:shadow-none print:p-4">
            {/* Header Nota */}
            <div className="flex items-center justify-between border-b-2 border-red-900 pb-4">
              <div className="flex items-center gap-3">
                <LogoRSKotaBaru className="w-12 h-12" />
                <div>
                  <h2 className="text-base font-extrabold text-[#9E1B21] uppercase tracking-wide">
                    RS KOTA BARU
                  </h2>
                  <p className="text-[11px] font-semibold text-slate-600">
                    Instalasi Farmasi & Perbekalan Medis
                  </p>
                  <p className="text-[10px] text-slate-400">Pillbox Medical Center, Koordinat 201 — KotaBaru Roleplay</p>
                </div>
              </div>
              <LogoKotaBaruRoleplay className="w-10 h-10" />
            </div>

            <div className="text-center space-y-1">
              <span className="px-3 py-1 rounded-full bg-red-100 text-[#7F1D1D] text-[10px] font-black uppercase tracking-wider">
                STRUK PENGAMBILAN FARMASI
              </span>
              <p className="text-xs font-mono text-slate-500 mt-1">
                No. Order: <strong>{receiptOrder.id}</strong>
              </p>
            </div>

            {/* Rincian Pesanan */}
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Nama Pasien:</span>
                <span className="font-bold text-slate-900">{receiptOrder.fullName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">No. Kantong:</span>
                <span className="font-mono font-extrabold text-[#9E1B21]">
                  {receiptOrder.pocketNumber}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Waktu Pembelian:</span>
                <span className="text-slate-700">{receiptOrder.createdAt?.slice(0, 16)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Paket Farmasi:</span>
                <span className="font-semibold text-slate-900 text-right">
                  {receiptOrder.packageType}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Jumlah:</span>
                <span className="font-mono font-bold text-slate-800">{receiptOrder.quantity}x</span>
              </div>
              <div className="flex justify-between py-1.5 pt-2 text-sm font-bold">
                <span className="text-slate-900">Total Pembayaran:</span>
                <span className="font-mono text-[#7F1D1D]">{formatPrice(receiptOrder.totalPrice)}</span>
              </div>
              <div className="flex justify-between py-1 text-[11px]">
                <span className="text-slate-500">Status Penyerahan:</span>
                <span className="font-bold text-emerald-700">{receiptOrder.status}</span>
              </div>
            </div>

            {receiptOrder.notes && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                <span className="font-bold text-amber-900 block mb-0.5">Catatan Farmasi:</span>
                <p className="text-amber-800 text-[11px]">{receiptOrder.notes}</p>
              </div>
            )}

            {/* Tanda Tangan */}
            <div className="flex justify-between items-end pt-4 text-xs">
              <div className="text-center">
                <p className="text-slate-400 text-[10px]">Penerima Obat,</p>
                <div className="h-12" />
                <p className="font-bold text-slate-800">({receiptOrder.fullName})</p>
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-[10px]">Petugas Farmasi,</p>
                <div className="h-12" />
                <p className="font-bold text-slate-800">
                  ({receiptOrder.handledByStaffName || currentUser.name})
                </p>
              </div>
            </div>

            {/* Action buttons (hidden when printing) */}
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 print:hidden">
              <button
                type="button"
                onClick={() => setReceiptOrder(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-[#9E1B21] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-[#7F1D1D]"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Nota</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: LIGHTBOX PREVIEW FOTO */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="bg-white rounded-3xl p-5 max-w-lg w-full space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-sm font-bold text-slate-900 truncate">{lightboxImage.title}</h4>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto rounded-2xl bg-slate-50 flex items-center justify-center p-2 border border-slate-200">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-xs"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
