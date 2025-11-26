import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ChevronDown } from 'lucide-react';

const FiltersSection = () => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder={t('search_student')}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>
                <button className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    {t('clear')}
                </button>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{t('mark_all')}</span>
                    <div className="relative">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors">
                            Selecciona...
                            <ChevronDown size={16} />
                        </button>
                    </div>
                </div>
                <button className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    {t('export_csv')}
                </button>
            </div>
        </div>
    );
};

export default FiltersSection;
