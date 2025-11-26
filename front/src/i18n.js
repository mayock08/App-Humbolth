import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            "welcome": "Welcome",
            "login": "Login",
            "dashboard": "Dashboard",
            "teacher_panel": "Teacher Panel",
            "attendance": "Attendance",
            "students": "Students",
            "subjects": "Subjects",
            "settings": "Settings",
            "logout": "Logout",
            "search_student": "Search student...",
            "clear": "Clear",
            "export_csv": "Export CSV",
            "mark_all": "Mark all as",
            "actions": "Actions",
            "notify_parent": "Notify Parent",
            "whatsapp": "WhatsApp",
            "email_supervisor": "Email Supervisor",
            "attended": "Attended",
            "absent": "Absent",
            "late": "Late",
            "upload_evidence": "Upload evidence (optional)",
            "upload": "Upload",
            "summary_today": "Today's Summary",
            "group": "Group",
            "subject": "Subject"
        }
    },
    es: {
        translation: {
            "welcome": "Bienvenido",
            "login": "Iniciar Sesión",
            "dashboard": "Panel",
            "teacher_panel": "Panel del Docente",
            "attendance": "Asistencia",
            "students": "Alumnos",
            "subjects": "Materias",
            "settings": "Ajustes",
            "logout": "Cerrar Sesión",
            "search_student": "Buscar alumno...",
            "clear": "Limpiar",
            "export_csv": "Exportar CSV",
            "mark_all": "Marcar todos como",
            "actions": "Acciones",
            "notify_parent": "Notificar Padre",
            "whatsapp": "WhatsApp",
            "email_supervisor": "Correo Supervisor",
            "attended": "Asistió",
            "absent": "Falta",
            "late": "Retardo",
            "upload_evidence": "Sube evidencia (opcional)",
            "upload": "Subir",
            "summary_today": "Resumen de hoy",
            "group": "Grupo",
            "subject": "Materia"
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "es", // default language
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
