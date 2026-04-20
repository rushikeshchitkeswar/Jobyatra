import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2 } from 'lucide-react';

export default function ProfileSection({ title, children, onAdd, onEdit, isEmpty, emptyMessage, icon: Icon }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
        >
            {/* <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-3">
                    {Icon && <Icon className="w-5 h-5 text-indigo-600" />}
                    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                </div>
                <div className="flex gap-2">
                    {onAdd && (
                        <button
                            onClick={onAdd}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors group"
                            title={`Add ${title}`}
                        >
                            <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>
                    )}
                    {onEdit && !isEmpty && (
                        <button
                            onClick={onEdit}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors group"
                            title={`Edit ${title}`}
                        >
                            <Edit2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                    )}
                </div>
            </div> */}

            <div className="p-6">
                {isEmpty ? (
                    <div className="py-8 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            {Icon && <Icon className="w-8 h-8 text-slate-200" />}
                        </div>
                        <p className="text-slate-400 font-medium max-w-[200px]">{emptyMessage || `No ${title.toLowerCase()} added yet.`}</p>
                        {onAdd && (
                            <button
                                onClick={onAdd}
                                className="mt-4 text-sm font-bold text-indigo-600 hover:underline"
                            >
                                + Add {title}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {children}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
