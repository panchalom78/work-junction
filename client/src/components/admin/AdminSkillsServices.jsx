import React, { useEffect, useMemo, useState } from 'react'
import { Plus, Save, Edit3, Trash2, Search, RefreshCw, Settings, Layers } from 'lucide-react'
import axiosInstance from '../../utils/axiosInstance'
import toast from 'react-hot-toast'

const SkillRow = ({ skill, onSelect, isActive }) => {
  return (
    <button
      onClick={() => onSelect(skill)}
      className={`w-full text-left p-3 border rounded-lg transition-colors ${isActive ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-900">{skill.name}</span>
        </div>
        <span className="text-xs text-gray-500">{(skill.services || []).length} services</span>
      </div>
    </button>
  )
}

const ServicesList = ({ services, onRename, onDelete }) => {
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')

  const startEdit = (service) => {
    setEditingId(service.serviceId)
    setEditName(service.name)
  }

  const commitEdit = async () => {
    if (!editName.trim()) {
      toast.error('Service name is required')
      return
    }
    await onRename(editingId, editName.trim())
    setEditingId(null)
    setEditName('')
  }

  return (
    <div className="space-y-2">
      {services.map((s) => (
        <div key={s.serviceId} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-gray-500" />
            {editingId === s.serviceId ? (
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              />
            ) : (
              <span className="font-medium text-gray-900">{s.name}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {editingId === s.serviceId ? (
              <button onClick={commitEdit} className="px-3 py-1 bg-blue-600 text-white rounded text-sm flex items-center gap-1">
                <Save className="w-4 h-4" />
                Save
              </button>
            ) : (
              <button onClick={() => startEdit(s)} className="px-3 py-1 border border-gray-300 rounded text-sm flex items-center gap-1">
                <Edit3 className="w-4 h-4" />
                Rename
              </button>
            )}
            <button onClick={() => onDelete(s.serviceId)} className="px-3 py-1 border border-red-300 text-red-600 rounded text-sm flex items-center gap-1">
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      ))}
      {services.length === 0 && (
        <div className="p-4 text-center text-gray-500 border border-dashed rounded-lg">No services found</div>
      )}
    </div>
  )
}

const AdminSkillsServices = () => {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedSkill, setSelectedSkill] = useState(null)
  const [newSkillName, setNewSkillName] = useState('')
  const [newServiceName, setNewServiceName] = useState('')
  const [creatingSkill, setCreatingSkill] = useState(false)
  const [addingService, setAddingService] = useState(false)

  const filteredSkills = useMemo(() => {
    return skills.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
  }, [skills, search])

  const fetchSkills = async () => {
    try {
      setLoading(true)
      const res = await axiosInstance.get('/api/skills')
      if (res.data?.success) {
        setSkills(res.data.data)
        if (selectedSkill) {
          const updated = res.data.data.find((s) => s._id === selectedSkill._id)
          setSelectedSkill(updated || null)
        }
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load skills')
    } finally {
      setLoading(false)
    }
  }

  const createSkill = async () => {
    if (!newSkillName.trim()) {
      toast.error('Skill name is required')
      return
    }
    try {
      setCreatingSkill(true)
      const res = await axiosInstance.post('/api/skills', { name: newSkillName.trim(), services: [] })
      if (res.data?.success) {
        toast.success('Skill created')
        setNewSkillName('')
        fetchSkills()
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create skill')
    } finally {
      setCreatingSkill(false)
    }
  }

  const addService = async () => {
    if (!selectedSkill?._id) {
      toast.error('Select a skill first')
      return
    }
    if (!newServiceName.trim()) {
      toast.error('Service name is required')
      return
    }
    try {
      setAddingService(true)
      const res = await axiosInstance.post(`/api/skills/${selectedSkill._id}/services`, { name: newServiceName.trim() })
      if (res.data?.success) {
        toast.success('Service added')
        setNewServiceName('')
        fetchSkills()
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to add service')
    } finally {
      setAddingService(false)
    }
  }

  const renameService = async (serviceId, newName) => {
    try {
      const res = await axiosInstance.put(`/api/skills/${selectedSkill._id}/services/${serviceId}`, { name: newName })
      if (res.data?.success) {
        toast.success('Service updated')
        fetchSkills()
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update service')
    }
  }

  const deleteService = async (serviceId) => {
    try {
      const res = await axiosInstance.delete(`/api/skills/${selectedSkill._id}/services/${serviceId}`)
      if (res.data?.success) {
        toast.success('Service deleted')
        fetchSkills()
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete service')
    }
  }

  useEffect(() => {
    fetchSkills()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Skills</h2>
            </div>
            <button onClick={fetchSkills} className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search skills"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading...</div>
            ) : (
              filteredSkills.map((skill) => (
                <SkillRow
                  key={skill._id}
                  skill={skill}
                  onSelect={setSelectedSkill}
                  isActive={selectedSkill?._id === skill._id}
                />
              ))
            )}
            {filteredSkills.length === 0 && !loading && (
              <div className="p-6 text-center text-gray-500 border border-dashed rounded-lg">No skills found</div>
            )}
          </div>
          <div className="mt-4 border-t pt-4">
            <div className="flex items-center gap-2">
              <input
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="New skill name"
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
              />
              <button
                onClick={createSkill}
                disabled={creatingSkill}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-2 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Add Skill
              </button>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Services</h2>
            </div>
            {selectedSkill && (
              <div className="text-sm text-gray-600">Selected skill: <span className="font-medium">{selectedSkill.name}</span></div>
            )}
          </div>

          {selectedSkill ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <input
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="New service name"
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                />
                <button
                  onClick={addService}
                  disabled={addingService}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-2 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  Add Service
                </button>
              </div>
              <ServicesList
                services={selectedSkill.services || []}
                onRename={renameService}
                onDelete={deleteService}
              />
            </>
          ) : (
            <div className="p-6 text-center text-gray-500">Select a skill to manage services</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminSkillsServices
