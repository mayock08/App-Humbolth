import React from 'react';
import { useTranslation } from 'react-i18next';
import { Upload } from 'lucide-react';

const StatsSection = () => {
    const { t } = useTranslation();

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Group Info */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
                <span className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">{t('group')}</span>
                <h2 className="text-2xl font-bold text-gray-800">1° Secundaria · B</h2>
                <span className="text-gray-500 text-sm mt-1">{t('subject')}: Matemáticas</span>
            </div>

            {/* Today's Summary */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                <span className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-4 w-full text-left">{t('summary_today')}</span>
                <div className="flex justify-around w-full">
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-bold text-gray-800">25</span>
                        <span className="text-xs text-gray-500 mt-1">{t('attended')}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-bold text-gray-800">0</span>
                        <span className="text-xs text-gray-500 mt-1">{t('absent')}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-bold text-gray-800">0</span>
                        <span className="text-xs text-gray-500 mt-1">{t('late')}</span>
                    </div>
                </div>
            </div>

            {/* Photo of the Day */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                <div>
                    <span className="text-gray-400 text-xs font-medium uppercase tracking-wider block mb-1">Foto del día</span>
                    <span className="text-gray-500 text-sm">{t('upload_evidence')}</span>
                </div>
                <div className="flex justify-end mt-4">
                    <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors flex items-center gap-2">
                        {t('upload')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StatsSection;
