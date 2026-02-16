import React, { useState, useEffect } from 'react';
import {
    Users,
    Plus,
    Search,
    Edit,
    Trash2,
    Layers,
    X,
    Check
} from 'lucide-react';

const CoordinatorAdmin = () => {
    const [coordinators, setCoordinators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list', 'form', 'assign'
    const [currentUser, setCurrentUser] = useState(null);

    // Assignment Data
    const [allGroups, setAllGroups] = useState([]);
    const [selectedGroupIds, setSelectedGroupIds] = useState([]);

    // Form Data
    const [formData, setFormData] = useState({ fullName: '', email: '' });

    useEffect(() => {
        fetchCoordinators();
    }, []);

    const fetchCoordinators = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://institutohumboldt.mx:8080/api/Coordinators');
            if (response.ok) {
                const data = await response.json();
                setCoordinators(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCoordinator = async (e) => {
        e.preventDefault();
        try {
            const url = currentUser
                ? `http://institutohumboldt.mx:8080/api/Coordinators/${currentUser.id}`
                : 'http://institutohumboldt.mx:8080/api/Coordinators';
            const method = currentUser ? 'PUT' : 'POST';
            const payload = currentUser ? { ...formData, id: currentUser.id } : formData;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                fetchCoordinators();
                setViewMode('list');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const openAssignModal = async (coordinator) => {
        setCurrentUser(coordinator);

        // Load avail groups if not loaded
        if (allGroups.length === 0) {
            const resp = await fetch('http://institutohumboldt.mx:8080/api/Coordinators/groups');
            if (resp.ok) {
                const groups = await resp.json();
                setAllGroups(groups);
            }
        }

        // Pre-select existing assignments
        const currentIds = coordinator.assignments?.map(a => a.groupId) || [];
        setSelectedGroupIds(currentIds);

        setViewMode('assign');
    };

    const handleSaveAssignments = async () => {
        try {
            const response = await fetch(`http://institutohumboldt.mx:8080/api/Coordinators/${currentUser.id}/assignments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedGroupIds)
            });

            if (response.ok) {
                fetchCoordinators();
                setViewMode('list');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const toggleGroupSelection = (groupId) => {
        if (selectedGroupIds.includes(groupId)) {
            setSelectedGroupIds(selectedGroupIds.filter(id => id !== groupId));
        } else {
            setSelectedGroupIds([...selectedGroupIds, groupId]);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Users className="text-indigo-600" />
                    Coordinadores de Materia
                </h1>
                <button
                    onClick={() => {
                        setCurrentUser(null);
                        setFormData({ fullName: '', email: '' });
                        setViewMode('form');
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
                >
                    <Plus size={20} /> Nuevo Coordinador
                </button>
            </div>

            {/* List View */}
            {viewMode === 'list' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grupos Asignados</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {coordinators.map((c) => (
                                <tr key={c.id}>
                                    <td className="px-6 py-4 font-medium text-gray-900">{c.fullName}</td>
                                    <td className="px-6 py-4 text-gray-500">{c.email}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-xs font-semibold">
                                            {c.assignments?.length || 0} Grupos
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => openAssignModal(c)}
                                            className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg"
                                            title="Asignar Grupos"
                                        >
                                            <Layers size={18} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setCurrentUser(c);
                                                setFormData({ fullName: c.fullName, email: c.email });
                                                setViewMode('form');
                                            }}
                                            className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg"
                                        >
                                            <Edit size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create/Edit Form Modal */}
            {viewMode === 'form' && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4">{currentUser ? 'Editar' : 'Nuevo'} Coordinador</h2>
                        <form onSubmit={handleSaveCoordinator} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                                <input type="text" required className="w-full border rounded-lg p-2" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email (Usuario)</label>
                                <input type="email" required className="w-full border rounded-lg p-2" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setViewMode('list')} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assignment Modal */}
            {viewMode === 'assign' && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center mb-4 border-b pb-4">
                            <div>
                                <h2 className="text-xl font-bold">Asignar Grupos</h2>
                                <p className="text-sm text-gray-500">Coordinador: {currentUser.fullName}</p>
                            </div>
                            <button onClick={() => setViewMode('list')}><X size={20} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {allGroups.map(group => (
                                    <div
                                        key={group.id}
                                        onClick={() => toggleGroupSelection(group.id)}
                                        className={`p-3 rounded-lg border cursor-pointer flex justify-between items-center transition-all ${selectedGroupIds.includes(group.id)
                                            ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                                            : 'border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div>
                                            <p className="font-semibold text-gray-800">{group.displayName}</p>
                                        </div>
                                        {selectedGroupIds.includes(group.id) && <Check size={18} className="text-indigo-600" />}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border-t pt-4 mt-4 flex justify-end gap-2">
                            <button onClick={() => setViewMode('list')} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                            <button onClick={handleSaveAssignments} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                Guardar Asignaciones ({selectedGroupIds.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoordinatorAdmin;
