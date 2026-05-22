import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlowButton } from '@/components/ui/GlowButton'
import { GlowInput } from '@/components/ui/GlowInput'
import { Modal } from '@/components/ui/Modal'
import { DataTable } from '@/components/ui/DataTable'
import { Sidebar } from '@/components/layout/Sidebar'
import { useAppStore } from '@/store'
import { fadeInUp, staggerContainer, staggerItem } from '@/animations/variants'
import { Building, Plus, Edit, Trash2, Monitor, Wind, Layers } from 'lucide-react'
import { apiClient } from '@/services/api'

interface Hall {
  id: string
  name: string
  code: string
  capacity: number
  hall_type: 'lecture' | 'lab' | 'seminar' | 'amphitheater' | 'online'
  building: string
  floor: number
  has_projector: boolean
  has_ac: boolean
  has_computers: boolean
  is_active: boolean
}

const typeConfig: Record<string, { label: string, color: string }> = {
  lecture: { label: 'Lecture Hall', color: 'text-[#C8A95B] bg-[rgba(200,169,91,0.1)] border-[rgba(200,169,91,0.2)]' },
  lab: { label: 'Laboratory', color: 'text-violet-400 bg-violet-400/10 border-violet-400/20' },
  seminar: { label: 'Seminar', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  amphitheater: { label: 'Amphitheater', color: 'text-rose-400 bg-rose-400/10 border-rose-400/20' },
  online: { label: 'Online', color: 'text-teal-400 bg-teal-400/10 border-teal-400/20' }
}

export const HallManager: React.FC = () => {
  const { sidebarCollapsed } = useAppStore()
  const [halls, setHalls] = useState<Hall[]>([])
  const [showModal, setShowModal] = useState(false)
  const [selectedHall, setSelectedHall] = useState<Hall | null>(null)

  const emptyForm = {
    name: '',
    code: '',
    capacity: 50,
    hall_type: 'lecture',
    building: '',
    floor: 1,
    has_projector: true,
    has_ac: true,
    has_computers: false,
    is_active: true
  }
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    fetchHalls()
  }, [])

  const fetchHalls = async () => {
    try {
      const { data } = await apiClient.get('/academic/halls')
      setHalls(data)
    } catch (error) {
      console.error('Failed to fetch halls:', error)
    }
  }

  const handleCreateOrUpdate = async () => {
    try {
      const payload: any = { ...form }
      if (!payload.building) delete payload.building
      if (payload.floor === undefined || payload.floor === null) delete payload.floor

      if (selectedHall) {
        await apiClient.put(`/academic/halls/${selectedHall.id}`, payload)
      } else {
        await apiClient.post('/academic/halls', payload)
      }

      await fetchHalls()
      setShowModal(false)
      setForm(emptyForm)
      setSelectedHall(null)
    } catch (error: any) {
      console.error('Failed to save hall:', error)
      const errorMsg = error.response?.data?.detail || 'Failed to save hall. Code may already exist.'
      alert(`Error: ${errorMsg}`)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hall?')) return
    try {
      await apiClient.delete(`/academic/halls/${id}`)
      await fetchHalls()
    } catch (error) {
      console.error('Failed to delete hall:', error)
    }
  }

  const openEditModal = (h: Hall) => {
    setSelectedHall(h)
    setForm({
      name: h.name,
      code: h.code,
      capacity: h.capacity,
      hall_type: h.hall_type,
      building: h.building || '',
      floor: h.floor || 0,
      has_projector: h.has_projector,
      has_ac: h.has_ac,
      has_computers: h.has_computers || false,
      is_active: h.is_active || true
    })
    setShowModal(true)
  }

  const openCreateModal = () => {
    setSelectedHall(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const totalCapacity = halls.reduce((a, h) => a + h.capacity, 0)

  const columns = [
    { key: 'code', header: 'Code', render: (r: Hall) => <span className="font-mono text-[#C8A95B] font-bold text-sm">{r.code}</span> },
    { key: 'name', header: 'Name' },
    {
      key: 'hall_type', header: 'Type',
      render: (r: Hall) => {
        const cfg = typeConfig[r.hall_type] || { label: r.hall_type, color: 'text-gray-400' }
        return <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${cfg.color}`}>{cfg.label}</span>
      }
    },
    {
      key: 'capacity', header: 'Capacity',
      render: (r: Hall) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 rounded-full bg-[rgba(15,23,42,0.6)] overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-[#1B3C73] to-[#C8A95B]" style={{ width: `${Math.min((r.capacity / 130) * 100, 100)}%` }} />
          </div>
          <span className="text-sm font-semibold text-[#F8FAFC]">{r.capacity}</span>
        </div>
      )
    },
    { key: 'building', header: 'Location', render: (r: Hall) => <span className="text-[#94A3B8]">{r.building ? `Block ${r.building}` : ''} {r.floor ? `— F${r.floor}` : ''}</span> },
    {
      key: 'amenities', header: 'Amenities',
      render: (r: Hall) => (
        <div className="flex gap-1.5">
          <span className={`p-1 rounded ${r.has_projector ? 'text-emerald-400' : 'text-[#94A3B8]/30'}`} title="Projector"><Monitor className="w-3.5 h-3.5" /></span>
          <span className={`p-1 rounded ${r.has_ac ? 'text-emerald-400' : 'text-[#94A3B8]/30'}`} title="AC"><Wind className="w-3.5 h-3.5" /></span>
        </div>
      )
    },
    {
      key: 'actions', header: '',
      render: (r: Hall) => (
        <div className="flex gap-2">
          <button onClick={() => openEditModal(r)} className="p-1.5 rounded-lg text-[#C8A95B] hover:bg-[rgba(200,169,91,0.1)] transition-colors"><Edit className="w-3.5 h-3.5" /></button>
          <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      )
    },
  ]

  return (
    <div className="min-h-screen bg-[#020817] flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto transition-all duration-300" style={{ marginLeft: sidebarCollapsed ? 72 : 260 }}>
        <div className="p-6 lg:p-8">
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs text-[#94A3B8] uppercase tracking-widest mb-1 flex items-center gap-2"><Building className="w-3.5 h-3.5" /> Facility Management</p>
              <h1 className="font-sora text-3xl font-bold text-[#F8FAFC]">Hall <span className="gradient-gold">Manager</span></h1>
            </div>
            <GlowButton variant="primary" size="md" magnetic icon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>Add Hall</GlowButton>
          </motion.div>

          {/* Summary cards */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Halls', value: halls.length, color: 'text-[#C8A95B]' },
              { label: 'Total Capacity', value: totalCapacity, color: 'text-blue-400' },
              { label: 'Lecture Halls', value: halls.filter(h => h.hall_type === 'lecture').length, color: 'text-emerald-400' },
              { label: 'Labs', value: halls.filter(h => h.hall_type === 'lab').length, color: 'text-violet-400' },
            ].map((s, i) => (
              <motion.div key={i} variants={staggerItem}>
                <GlassCard className="p-5 text-center">
                  <p className={`text-3xl font-bold font-sora ${s.color} mb-1`}>{s.value}</p>
                  <p className="text-xs text-[#94A3B8]">{s.label}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <DataTable data={halls as unknown as Record<string, unknown>[]} columns={columns as any} rowKey="id" />
          </motion.div>
        </div>
      </main>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={selectedHall ? "Edit Hall" : "Add New Hall"} size="md">
        <div className="grid grid-cols-2 gap-4">
          <GlowInput label="Hall Name" placeholder="Main Lecture Hall" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <GlowInput label="Hall Code" placeholder="A-101" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
          <GlowInput label="Capacity" type="number" value={form.capacity.toString()} onChange={e => setForm({ ...form, capacity: parseInt(e.target.value) })} />
          <div>
            <label className="block text-xs text-[#94A3B8] mb-2">Hall Type</label>
            <select value={form.hall_type} onChange={e => setForm({ ...form, hall_type: e.target.value })}
              className="w-full h-10 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(200,169,91,0.15)] text-sm text-[#F8FAFC] px-3 focus:outline-none focus:border-[rgba(200,169,91,0.4)]">
              <option value="lecture">Lecture Hall</option>
              <option value="lab">Laboratory</option>
              <option value="seminar">Seminar Room</option>
              <option value="amphitheater">Amphitheater</option>
              <option value="online">Online</option>
            </select>
          </div>
          <GlowInput label="Building Block" placeholder="A" value={form.building} onChange={e => setForm({ ...form, building: e.target.value })} />
          <GlowInput label="Floor" type="number" value={form.floor.toString()} onChange={e => setForm({ ...form, floor: parseInt(e.target.value) })} />
          <div className="col-span-2 flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.has_projector} onChange={e => setForm({ ...form, has_projector: e.target.checked })} className="accent-[#C8A95B]" />
              <span className="text-sm text-[#94A3B8]">Has Projector</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.has_ac} onChange={e => setForm({ ...form, has_ac: e.target.checked })} className="accent-[#C8A95B]" />
              <span className="text-sm text-[#94A3B8]">Has A/C</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.has_computers} onChange={e => setForm({ ...form, has_computers: e.target.checked })} className="accent-[#C8A95B]" />
              <span className="text-sm text-[#94A3B8]">Has Computers</span>
            </label>
          </div>
          <div className="col-span-2 flex gap-3 pt-2">
            <GlowButton variant="ghost" fullWidth onClick={() => setShowModal(false)}>Cancel</GlowButton>
            <GlowButton variant="primary" fullWidth magnetic onClick={handleCreateOrUpdate}>{selectedHall ? 'Save Changes' : 'Add Hall'}</GlowButton>
          </div>
        </div>
      </Modal>
    </div>
  )
}
