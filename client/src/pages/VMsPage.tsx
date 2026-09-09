import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import {
  Code2, ArrowLeft, Plus, Play, Square, RotateCw, Pause, Trash2,
  Monitor, Cpu, HardDrive, Wifi, Clock, X, Check
} from 'lucide-react'

export default function VMsPage() {
  const [vms, setVms] = useState<any[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [newVM, setNewVM] = useState({ name: '', os: 'ubuntu', cpu: 2, ram: 4, disk: 20 })
  const navigate = useNavigate()

  const load = () => api.getVMs().then(setVms).catch(() => {})
  useEffect(() => { load() }, [])

  const create = async () => {
    if (!newVM.name) return
    await api.createVM(newVM)
    setShowCreate(false)
    setNewVM({ name: '', os: 'ubuntu', cpu: 2, ram: 4, disk: 20 })
    load()
  }

  const action = async (id: string, act: string) => {
    await api.updateVM(id, act)
    load()
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this VM?')) return
    await api.deleteVM(id)
    load()
  }

  const osOptions = ['Ubuntu', 'Debian', 'Fedora', 'Arch Linux', 'Windows', 'Alpine']

  const statusColor: Record<string, string> = {
    running: 'text-green-500 bg-green-500/10',
    stopped: 'text-2 bg-3',
    paused: 'text-yellow-500 bg-yellow-500/10',
  }

  return (
    <div className="min-h-screen bg-app">
      <header className="h-14 bg-2 border-b border-app flex items-center px-4 gap-4">
        <button onClick={() => navigate('/dashboard')} className="btn-ghost"><ArrowLeft className="w-4 h-4" /> Back</button>
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-brand-500" />
          <span className="font-semibold text-main">Virtual Machines</span>
        </div>
        <div className="flex-1" />
        <button onClick={() => setShowCreate(true)} className="btn-primary"><Plus className="w-4 h-4" /> New VM</button>
      </header>

      <div className="max-w-5xl mx-auto p-6">
        {vms.length === 0 ? (
          <div className="card p-12 text-center">
            <Monitor className="w-16 h-16 text-3 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-main mb-2">No Virtual Machines</h3>
            <p className="text-2 text-sm mb-6">Create an isolated development environment to run your projects.</p>
            <button onClick={() => setShowCreate(true)} className="btn-primary"><Plus className="w-4 h-4" /> Create VM</button>
          </div>
        ) : (
          <div className="space-y-3">
            {vms.map(vm => (
              <div key={vm.id} className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-600/20 flex items-center justify-center">
                      <Monitor className="w-5 h-5 text-brand-500" />
                    </div>
                    <div>
                      <div className="text-main font-medium">{vm.name}</div>
                      <div className="text-xs text-3">{vm.os} · Created {new Date(vm.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColor[vm.status] || 'text-2'}`}>
                    {vm.status}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-3" />
                    <div><div className="text-xs text-3">CPU</div><div className="text-sm text-main">{vm.cpu} cores</div></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-3" />
                    <div><div className="text-xs text-3">RAM</div><div className="text-sm text-main">{vm.ram} GB</div></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-3" />
                    <div><div className="text-xs text-3">Disk</div><div className="text-sm text-main">{vm.disk} GB</div></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-3" />
                    <div><div className="text-xs text-3">Network</div><div className="text-sm text-main capitalize">{vm.network}</div></div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {vm.status === 'running' ? (
                    <>
                      <button onClick={() => action(vm.id, 'stop')} className="btn-outline text-xs"><Square className="w-3.5 h-3.5" /> Stop</button>
                      <button onClick={() => action(vm.id, 'restart')} className="btn-outline text-xs"><RotateCw className="w-3.5 h-3.5" /> Restart</button>
                      <button onClick={() => action(vm.id, 'pause')} className="btn-outline text-xs"><Pause className="w-3.5 h-3.5" /> Pause</button>
                    </>
                  ) : (
                    <button onClick={() => action(vm.id, 'start')} className="btn-primary text-xs"><Play className="w-3.5 h-3.5" /> Start</button>
                  )}
                  <button className="btn-ghost text-xs">Open</button>
                  <div className="flex-1" />
                  <button onClick={() => remove(vm.id)} className="btn-ghost text-red-500 text-xs"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" onClick={() => setShowCreate(false)}>
          <div className="card p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-main">Create Virtual Machine</h3>
              <button onClick={() => setShowCreate(false)} className="text-2 hover:text-main"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-2 mb-1.5 block">VM Name</label>
                <input className="input" placeholder="AI Development VM" value={newVM.name} onChange={e => setNewVM({ ...newVM, name: e.target.value })} autoFocus />
              </div>
              <div>
                <label className="text-xs text-2 mb-1.5 block">Operating System</label>
                <div className="grid grid-cols-3 gap-2">
                  {osOptions.map(os => (
                    <button
                      key={os}
                      onClick={() => setNewVM({ ...newVM, os: os.toLowerCase() })}
                      className={`px-3 py-2 rounded-lg text-sm border transition-colors ${newVM.os === os.toLowerCase() ? 'border-brand-500 bg-brand-600/10 text-brand-500' : 'border-app text-2 hover:text-main'}`}
                    >{os}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-2 mb-1 block">CPU Cores</label>
                  <input type="number" className="input" value={newVM.cpu} onChange={e => setNewVM({ ...newVM, cpu: +e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-2 mb-1 block">RAM (GB)</label>
                  <input type="number" className="input" value={newVM.ram} onChange={e => setNewVM({ ...newVM, ram: +e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-2 mb-1 block">Disk (GB)</label>
                  <input type="number" className="input" value={newVM.disk} onChange={e => setNewVM({ ...newVM, disk: +e.target.value })} />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowCreate(false)} className="btn-ghost">Cancel</button>
                <button onClick={create} className="btn-primary"><Check className="w-4 h-4" /> Create VM</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
