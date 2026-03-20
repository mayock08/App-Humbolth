import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, FileText, UploadCloud, MessageSquare, ExternalLink, Video, CheckSquare } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import TaskSubmissionForm from './TaskSubmissionForm';

const submissionTypes = {
    FileUpload: { label: 'Subida de Archivo', icon: <UploadCloud size={18} /> },
    OnlineText: { label: 'Texto en Línea', icon: <MessageSquare size={18} /> },
    ExternalLink: { label: 'Enlace Web', icon: <ExternalLink size={18} /> },
    Multimedia: { label: 'Multimedia', icon: <Video size={18} /> },
    Discussion: { label: 'Participación en Foro', icon: <MessageSquare size={18} /> },
    Checklist: { label: 'Lista de Verificación', icon: <CheckSquare size={18} /> }
};

const StudentTasks = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [selectedTask, setSelectedTask] = useState(null);
    const [submissionData, setSubmissionData] = useState(null); // specific student submission

    const studentIdStr = localStorage.getItem('userId');
    const studentId = studentIdStr ? parseInt(studentIdStr) : 0;

    useEffect(() => {
        if (studentId) {
            fetchTasksAndSubmissions();
        }
    }, [courseId, studentId]);

    const fetchTasksAndSubmissions = async () => {
        try {
            setLoading(true);
            // Get all tasks for course
            const tasksRes = await fetch(`${API_BASE_URL}/CourseTasks/course/${courseId}`);
            let tasksList = [];
            if (tasksRes.ok) {
                tasksList = await tasksRes.json();
            }

            // Get submissions for student for these tasks
            // We have to iterate, or fetch all if endpoint exists.
            // Since we don't have a bulk endpoint, we will fetch individual submissions for each task
            const tasksWithSubmissions = await Promise.all(tasksList.map(async (task) => {
                const subRes = await fetch(`${API_BASE_URL}/TaskSubmissions/task/${task.id}/student/${studentId}`);
                let submission = null;
                if (subRes.ok) {
                    submission = await subRes.json();
                } else if (subRes.status === 404) {
                    // It might not be assigned yet. Let's create an ASSIGNED record instantly so student can see it.
                    const createRes = await fetch(`${API_BASE_URL}/TaskSubmissions`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            courseTaskId: task.id,
                            studentId: studentId
                        })
                    });
                    if (createRes.ok) {
                        submission = await createRes.json();
                    }
                }
                return { ...task, submission };
            }));

            setTasks(tasksWithSubmissions);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenTask = (task) => {
        setSelectedTask(task);
        setSubmissionData(task.submission);
    };

    const handleCloseModal = (refresh = false) => {
        setSelectedTask(null);
        setSubmissionData(null);
        if (refresh) fetchTasksAndSubmissions();
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando tus tareas...</div>;

    return (
        <div className="flex flex-col h-full space-y-6 max-w-5xl mx-auto w-full">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/student-courses')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ArrowLeft className="text-gray-600" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Mis Tareas</h2>
                    <p className="text-gray-500 text-sm">Gestiona tus asignaciones pendientes y entregadas.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.map(task => {
                    const typeInfo = submissionTypes[task.submissionType] || { label: task.submissionType, icon: <FileText size={18} /> };
                    const status = task.submission?.status || 'ASSIGNED';
                    const isGraded = status === 'GRADED';
                    const isSubmitted = status === 'SUBMITTED';

                    return (
                        <div key={task.id} className="bg-white border text-left border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${isGraded ? 'bg-green-50 text-green-600' : isSubmitted ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'}`}>
                                    {typeInfo.icon}
                                </div>
                                <div className="flex flex-col items-end">
                                    {isGraded && <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle size={12} /> Calificada</span>}
                                    {isSubmitted && <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-full">Entregada</span>}
                                    {!isGraded && !isSubmitted && <span className="text-xs font-bold text-orange-700 bg-orange-100 px-2 py-1 rounded-full flex items-center gap-1"><Clock size={12} /> Pendiente</span>}
                                </div>
                            </div>

                            <h3 className="font-bold text-gray-800 text-lg mb-1 leading-tight">{task.title}</h3>
                            <p className="text-xs text-gray-500 mb-4 line-clamp-2">{task.description}</p>

                            <div className="mt-auto pt-4 border-t border-gray-100 space-y-2">
                                <div className="flex justify-between text-xs font-medium text-gray-500">
                                    <span>Vence: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Sin fecha'}</span>
                                    <span>Puntos: {task.maxScore}</span>
                                </div>
                                {isGraded && (
                                    <div className="flex justify-between text-sm font-bold text-green-700 bg-green-50 p-2 rounded-lg mt-2">
                                        <span>Calificación:</span>
                                        <span>{task.submission.grade} / {task.maxScore}</span>
                                    </div>
                                )}
                                <button
                                    onClick={() => handleOpenTask(task)}
                                    className={`w-full py-2.5 rounded-xl text-sm font-bold transition-colors mt-2 ${isGraded ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' :
                                            isSubmitted ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' :
                                                'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                                        }`}
                                >
                                    {isGraded ? 'Ver Retroalimentación' : isSubmitted ? 'Ver Entrega' : 'Comenzar Tarea'}
                                </button>
                            </div>
                        </div>
                    );
                })}
                {tasks.length === 0 && (
                    <div className="col-span-full p-12 text-center text-gray-400 bg-white border border-dashed rounded-2xl">
                        Aún no tienes tareas asignadas en este curso.
                    </div>
                )}
            </div>

            {selectedTask && (
                <TaskSubmissionForm
                    task={selectedTask}
                    submission={submissionData}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default StudentTasks;
