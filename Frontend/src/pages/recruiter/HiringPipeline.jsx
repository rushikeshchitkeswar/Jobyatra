import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  MoreHorizontal,
  MessageSquare,
  Clock,
  Paperclip,
  Plus,
  Search,
  Filter,
  ChevronRight,
  GripVertical
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { apiService } from '../../services/apiService';
import toast from 'react-hot-toast';

const STAGE_CONFIG = {
  applied: { label: 'Applied', color: 'bg-slate-100 text-slate-800 border-slate-200', dot: 'bg-slate-400' },
  screening: { label: 'Screening', color: 'bg-purple-50 text-purple-800 border-purple-200', dot: 'bg-purple-500' },
  shortlisted: { label: 'Shortlisted', color: 'bg-indigo-50 text-indigo-800 border-indigo-200', dot: 'bg-indigo-500' },
  interview: { label: 'Interview', color: 'bg-blue-50 text-blue-800 border-blue-200', dot: 'bg-blue-500' },
  offer: { label: 'Offer', color: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
  hired: { label: 'Hired', color: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' },
  rejected: { label: 'Rejected', color: 'bg-rose-50 text-rose-800 border-rose-200', dot: 'bg-rose-500' }
};

export default function HiringPipeline() {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [columns, setColumns] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Initial Load: Fetch Jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await apiService.getMyJobs();
        if (response.success && response.data.length > 0) {
          setJobs(response.data);
          setSelectedJobId(response.data[0]._id);
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
        toast.error('Failed to load jobs');
      }
    };
    fetchJobs();
  }, []);

  // 2. Fetch Pipeline when Job changes
  useEffect(() => {
    if (!selectedJobId) return;

    const fetchPipeline = async () => {
      setIsLoading(true);
      try {
        const trimmedJobId = selectedJobId.trim();
        // console.log(`URL DEBUG: Calling pipeline for job ID: [${trimmedJobId}]`);
        const response = await apiService.getHiringPipeline(trimmedJobId);
        if (response.success) {
          const pipelineData = response.data;
          // console.log("DEBUG: Pipeline data from backend:", pipelineData);

          const mappedColumns = {};
          Object.keys(STAGE_CONFIG).forEach(stageKey => {
            // Map backend PascalCase to frontend lowercase stage key
            // e.g. pipelineData['Applied'] -> stageKey 'applied'
            const backendKey = stageKey.charAt(0).toUpperCase() + stageKey.slice(1);
            mappedColumns[stageKey] = {
              id: stageKey,
              title: STAGE_CONFIG[stageKey].label,
              candidates: pipelineData[backendKey] || []
            };
          });
          setColumns(mappedColumns);
        }
      } catch (error) {
        console.error('Error fetching pipeline:', error);
        toast.error(error.toString() || 'Failed to load candidate pipeline');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPipeline();
  }, [selectedJobId]);

  // 3. Drag and Drop Handler
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Backup current state for rollback
    const originalColumns = { ...columns };

    // 1. Identify source and destination
    const sourceCol = columns[source.droppableId];
    const destCol = columns[destination.droppableId];
    const candidate = sourceCol.candidates[source.index];

    // 2. Perform Optimistic Update
    const newColumns = { ...columns };

    // Remove from source
    const newSourceCandidates = [...sourceCol.candidates];
    newSourceCandidates.splice(source.index, 1);
    newColumns[source.droppableId] = { ...sourceCol, candidates: newSourceCandidates };

    // Add to destination
    const newDestCandidates = [...destCol.candidates];
    newDestCandidates.splice(destination.index, 0, { ...candidate, status: destination.droppableId });
    newColumns[destination.droppableId] = { ...destCol, candidates: newDestCandidates };

    setColumns(newColumns);

    // 3. Sync with Backend
    try {
      const targetStatus = destination.droppableId; // e.g. 'screening'
      const response = await apiService.updateApplicationStatus(draggableId, targetStatus);

      if (response.success) {
        toast.success(`Successfully moved ${candidate.name} to ${STAGE_CONFIG[targetStatus].label}`, {
          icon: '✅',
          style: { borderRadius: '12px', background: '#333', color: '#fff' }
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Connection failed. Reverting change...', { icon: '🔄' });
      // Rollback on failure
      setColumns(originalColumns);
    }
  };

  if (!selectedJobId && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border border-dashed border-slate-200">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
          <Plus className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">No Jobs Found</h2>
        <p className="text-slate-500 mt-2">You need to post a job before you can manage a pipeline.</p>
        <Link to="/recruiter/post-job" className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200">Create First Job</Link>
      </div>
    );
  }

  return (
    <div className="pb-10 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 pb-6 border-b border-slate-200 shrink-0">
        <div className="px-4 lg:px-0">
          <h1 className="text-2xl font-bold text-slate-800 flex flex-wrap items-center gap-3">
            Hiring Pipeline
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-wider ring-1 ring-blue-200">ATS MODE</span>
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Manage candidate flow for <span className="font-bold text-slate-700">{jobs.find(j => j._id === selectedJobId)?.title}</span></p>
        </div>

        <div className="mt-6 lg:mt-0 flex flex-col sm:flex-row gap-3 px-4 lg:px-0">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all w-full sm:w-[200px]"
            />
          </div>

          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full sm:w-[200px] px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm font-bold text-slate-700 shadow-sm cursor-pointer"
          >
            {jobs.map(job => (
              <option key={job._id} value={job._id}>{job.title}</option>
            ))}
          </select>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
          <div className="flex space-x-6 min-w-max h-full">
            {Object.values(columns).map((column) => (
              <Droppable key={column.id} droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`w-[280px] sm:w-[300px] flex-shrink-0 bg-slate-50/50 border border-slate-200 rounded-3xl flex flex-col transition-colors duration-200 ${snapshot.isDraggingOver ? 'bg-blue-50/50 border-blue-200 ring-4 ring-blue-500/5' : ''}`}
                  >
                    {/* Column Header */}
                    <div className={`px-5 py-4 border-b flex items-center justify-between rounded-t-3xl ${STAGE_CONFIG[column.id].color} border-slate-200/50`}>
                      <div className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-3 shadow-sm ${STAGE_CONFIG[column.id].dot}`}></span>
                        <h3 className="font-bold text-sm tracking-tight">{column.title}</h3>
                        <span className="ml-2.5 px-2 py-0.5 bg-white/60 rounded-lg text-[10px] font-black uppercase text-slate-600">
                          {column.candidates.length}
                        </span>
                      </div>
                      <Plus className="w-4 h-4 opacity-40 cursor-pointer hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Candidates List */}
                    <div className="p-3 flex-1 overflow-y-auto custom-scrollbar-thin space-y-3">
                      {isLoading ? (
                        <div className="space-y-3">
                          {[...Array(2)].map((_, i) => (
                            <div key={i} className="h-24 bg-white/50 rounded-2xl animate-pulse border border-slate-100"></div>
                          ))}
                        </div>
                      ) : (
                        <>
                          {column.candidates
                            .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map((candidate, index) => (
                              <Draggable key={candidate.id} draggableId={candidate.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`bg-white p-4 rounded-2xl border border-slate-200 shadow-sm transition-all duration-200 ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-blue-500 border-transparent rotate-2 scale-105' : 'hover:border-blue-300 hover:shadow-md'}`}
                                  >
                                    <div className="flex justify-between items-start mb-3">
                                      <div className="flex items-center space-x-3">
                                        <div className="relative">
                                          <img
                                            src={candidate.avatar}
                                            alt={candidate.name}
                                            className="w-10 h-10 rounded-full object-cover border-2 border-white ring-1 ring-slate-100"
                                          />
                                          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                                        </div>
                                        <div className="overflow-hidden">
                                          <Link
                                            to={`/recruiter/applicants/${candidate.id}`}
                                            className="font-bold text-slate-800 text-sm hover:text-blue-600 transition-colors block truncate max-w-[140px]"
                                          >
                                            {candidate.name}
                                          </Link>
                                          <p className="text-[10px] font-medium text-slate-400 truncate">{candidate.role}</p>
                                        </div>
                                      </div>
                                      <div {...provided.dragHandleProps} className="p-1 text-slate-300 hover:text-slate-600 cursor-grab active:cursor-grabbing">
                                        <GripVertical className="w-4 h-4" />
                                      </div>
                                    </div>

                                    <div className="flex items-center space-x-1 mb-3">
                                      {[...Array(5)].map((_, i) => (
                                        <svg key={i} className={`w-3 h-3 ${i < candidate.rating ? 'text-amber-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
                                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                      ))}
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                      <span className="flex items-center text-[10px] font-bold text-slate-400">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {candidate.applied}
                                      </span>
                                      <div className="flex space-x-2">
                                        <div className="flex items-center text-slate-400 hover:text-blue-600 transition-colors cursor-pointer">
                                          <MessageSquare className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="flex items-center text-slate-400 hover:text-blue-600 transition-colors cursor-pointer">
                                          <Paperclip className="w-3.5 h-3.5" />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                          {provided.placeholder}

                          {column.candidates.length === 0 && provided.placeholder === null && (
                            <div className="h-32 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center opacity-40 bg-white/50 group mt-2">
                              <Plus className="w-6 h-6 text-slate-400 mb-1 group-hover:scale-110 transition-transform" />
                              <span className="text-[10px] font-bold text-slate-400 italic">Drop here...</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
