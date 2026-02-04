import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Layout,
    BookOpen,
    Video,
    DollarSign,
    Image as ImageIcon,
    Plus,
    Trash2,
    Save,
    ChevronRight,
    CheckCircle,
    ArrowLeft,
    Upload,
    Clock,
    FileText,
    Loader2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { UploadButton } from '../utils/uploadthing';

const CreateCourse = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(1);
    const [isSaving, setIsSaving] = useState(false);

    // Pre-fill UPI ID from profile
    React.useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch('http://localhost:5000/api/auth/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.upiId) {
                    setFormData(prev => ({ ...prev, upiId: data.upiId }));
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };
        fetchProfile();
    }, []);

    // Token needed for uploads
    const token = localStorage.getItem('accessToken');

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        description: '',
        category: 'Programming',
        level: 'Beginner',
        language: 'English',
        isFree: true,
        price: '',
        currency: 'INR',
        thumbnail: null,
        upiId: '',
        sections: [
            {
                id: 1,
                title: 'Introduction',
                lectures: [
                    { id: 1, title: 'Introduction to the Course', video: '', duration: '0:00', transcript: '', transcriptionStatus: 'pending' }
                ]
            }
        ],
        learningObjectives: [''],
        requirements: [''],
        targetAudience: ['']
    });

    const steps = [
        { id: 1, title: 'Basic Info', icon: Layout },
        { id: 2, title: 'Curriculum', icon: Video },
        { id: 3, title: 'Media & Price', icon: DollarSign },
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Curriculum Handlers
    const addSection = () => {
        const newSection = {
            id: Date.now(),
            title: 'New Section',
            lectures: []
        };
        setFormData(prev => ({ ...prev, sections: [...prev.sections, newSection] }));
    };

    const deleteSection = (sectionId) => {
        setFormData(prev => ({ ...prev, sections: prev.sections.filter(s => s.id !== sectionId) }));
    };

    const updateSectionTitle = (id, title) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map(s => s.id === id ? { ...s, title } : s)
        }));
    };

    const addLecture = (sectionId) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map(s => {
                if (s.id === sectionId) {
                    return {
                        ...s,
                        lectures: [...s.lectures, { id: Date.now(), title: 'New Lecture', video: '', duration: '0:00', transcript: '', transcriptionStatus: 'pending' }]
                    };
                }
                return s;
            })
        }));
    };

    const updateLecture = (sectionId, lectureId, field, value) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map(s => {
                if (s.id === sectionId) {
                    return {
                        ...s,
                        lectures: s.lectures.map(l => l.id === lectureId ? { ...l, [field]: value } : l)
                    };
                }
                return s;
            })
        }));
    };

    const handleListChange = (e, index, field) => {
        const { value } = e.target;
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => i === index ? value : item)
        }));
    };

    const addListItem = (field) => {
        setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
    };

    const removeListItem = (index, field) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    // Transcription handler
    const handleTranscribe = async (sectionId, lectureId, courseId = null) => {
        const token = localStorage.getItem('accessToken');

        // Update status to processing
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map(s => {
                if (String(s.id) === String(sectionId) || String(s._id) === String(sectionId)) {
                    return {
                        ...s,
                        lectures: s.lectures.map(l => {
                            const lId = String(l.id || l._id);
                            return lId === String(lectureId) ? { ...l, transcriptionStatus: 'processing' } : l;
                        })
                    };
                }
                return s;
            })
        }));

        try {
            // For saved courses, use the actual course ID from the route
            const actualCourseId = courseId || 'temp';

            if (actualCourseId === 'temp') {
                alert('Please save the course first before transcribing lectures.');
                // Reset status
                setFormData(prev => ({
                    ...prev,
                    sections: prev.sections.map(s => {
                        if (String(s.id) === String(sectionId) || String(s._id) === String(sectionId)) {
                            return {
                                ...s,
                                lectures: s.lectures.map(l => {
                                    const lId = String(l.id || l._id);
                                    return lId === String(lectureId) ? { ...l, transcriptionStatus: 'pending' } : l;
                                })
                            };
                        }
                        return s;
                    })
                }));
                return;
            }

            const response = await fetch(
                `http://localhost:5000/api/courses/${actualCourseId}/lectures/${lectureId}/transcribe`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Transcription failed');
            }

            // Update with transcript
            setFormData(prev => ({
                ...prev,
                sections: prev.sections.map(s => {
                    if (String(s.id) === String(sectionId) || String(s._id) === String(sectionId)) {
                        return {
                            ...s,
                            lectures: s.lectures.map(l => {
                                const lId = String(l.id || l._id);
                                return lId === String(lectureId) ? {
                                    ...l,
                                    transcript: data.transcript,
                                    transcriptionStatus: 'completed'
                                } : l;
                            })
                        };
                    }
                    return s;
                })
            }));

            alert('✅ Transcription completed successfully!');

        } catch (error) {
            console.error('Transcription error:', error);
            alert(`❌ Transcription failed: ${error.message}`);

            // Update status to failed
            setFormData(prev => ({
                ...prev,
                sections: prev.sections.map(s => {
                    if (String(s.id) === String(sectionId) || String(s._id) === String(sectionId)) {
                        return {
                            ...s,
                            lectures: s.lectures.map(l => {
                                const lId = String(l.id || l._id);
                                return lId === String(lectureId) ? { ...l, transcriptionStatus: 'failed' } : l;
                            })
                        };
                    }
                    return s;
                })
            }));
        }
    };

    // handleFileUpload removed in favor of UploadThing

    const getVideoDuration = (url) => {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            const timeout = setTimeout(() => {
                console.warn('Duration extraction timed out for:', url);
                resolve('10:00');
            }, 5000);

            video.onloadedmetadata = () => {
                clearTimeout(timeout);
                const duration = video.duration;
                if (!duration || isNaN(duration)) {
                    resolve('0:00');
                    return;
                }
                const minutes = Math.floor(duration / 60);
                const seconds = Math.floor(duration % 60);
                resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`);
            };
            video.onerror = () => {
                clearTimeout(timeout);
                console.error('Video error during duration extraction');
                resolve('0:00');
            };
            video.src = url;
        });
    };

    const handleVideoUploadComplete = async (sectionId, lectureId, res) => {
        console.log('Video upload complete:', res);
        const videoUrl = res[0].ufsUrl || res[0].url;
        let duration = '0:00';
        try {
            duration = await getVideoDuration(videoUrl);
        } catch (err) {
            console.error('Duration extraction failed:', err);
        }

        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map(s => {
                if (String(s.id) === String(sectionId)) {
                    return {
                        ...s,
                        lectures: s.lectures.map(l => String(l.id) === String(lectureId) ? { ...l, video: videoUrl, duration: duration } : l)
                    };
                }
                return s;
            })
        }));
    };

    const calculateTotalDuration = (sections) => {
        let totalSeconds = 0;
        sections.forEach(s => {
            s.lectures.forEach(l => {
                if (l.duration && l.duration.includes(':')) {
                    const [m, s_val] = l.duration.split(':').map(Number);
                    totalSeconds += (m * 60) + (s_val || 0);
                }
            });
        });
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.ceil((totalSeconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('accessToken');
            if (!formData.title || formData.title.trim() === '') {
                alert('Strategic failure: Mission Identifier (Course Title) is mandatory.');
                setIsSaving(false);
                return;
            }

            if (!formData.category) {
                alert('Strategic failure: Security Sector (Category) must be designated.');
                setIsSaving(false);
                return;
            }

            console.log('Publishing course with data:', formData);
            const payload = {
                ...formData,
                price: Number(formData.price) || 0,
                duration: calculateTotalDuration(formData.sections)
            };

            const response = await fetch('http://localhost:5000/api/courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create course');
            }

            navigate('/teacher/dashboard');
        } catch (error) {
            console.error('Error creating course:', error);
            alert(`Strategic Failure: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-bg font-jakarta text-brand-text pb-20 selection:bg-brand-primary selection:text-white relative transition-colors">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-primary/5 dark:bg-blue-600/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-secondary/5 dark:bg-blue-900/5 rounded-full blur-[120px]" />
            </div>

            {/* Header */}
            <header className="sticky top-0 bg-brand-surface/60 backdrop-blur-2xl z-50 border-b border-brand-border px-10 h-24 flex items-center justify-between transition-colors">
                <div className="flex items-center gap-6">
                    <Link to="/teacher/dashboard" className="p-3 bg-brand-surface border border-brand-border rounded-xl hover:text-brand-primary hover:border-brand-primary/50 transition-all text-brand-muted">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-brand-text italic tracking-tighter uppercase transition-colors">STRATEGIC ASSET DEPLOYMENT</h1>
                        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest transition-colors">Operator: {formData.author || 'Imperial Tutor'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="hidden md:block text-right">
                        <p className="text-[10px] font-black text-brand-muted/60 uppercase tracking-widest">Draft Status</p>
                        <p className="text-xs font-black text-brand-primary uppercase italic tracking-tighter">Secured & Encrypted</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`flex items-center px-8 py-3.5 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-premium hover:bg-brand-primary/90 transition-all ${isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
                    >
                        {isSaving ? 'UPLOADING...' : 'PUBLISH SECTOR'}
                    </button>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-6 py-16 relative z-10">
                {/* Tactical Steps */}
                <div className="flex items-center justify-between mb-24 px-10 sm:px-32">
                    {steps.map((step, idx) => (
                        <div key={step.id} className="flex flex-col items-center relative z-10">
                            <button
                                onClick={() => setActiveStep(step.id)}
                                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${activeStep === step.id
                                    ? 'bg-brand-primary border-brand-primary/50 text-white scale-110 shadow-premium dark:shadow-premium-dark'
                                    : activeStep > step.id
                                        ? 'bg-brand-surface border-brand-primary/50 text-brand-primary'
                                        : 'bg-brand-bg border-brand-border text-brand-muted'
                                    }`}
                            >
                                {activeStep > step.id ? <CheckCircle className="w-6 h-6" /> : <step.icon className="w-6 h-6" />}
                            </button>
                            <span className={`mt-4 text-[10px] font-black uppercase tracking-widest transition-colors ${activeStep === step.id ? 'text-brand-primary' : 'text-brand-muted'}`}>{step.title}</span>

                            {idx !== steps.length - 1 && (
                                <div className="absolute top-7 left-[calc(100%+0.5rem)] w-[calc(100%-1rem)] sm:w-40 h-[2px] bg-brand-border transition-colors">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: activeStep > step.id ? '100%' : '0%' }}
                                        className="h-full bg-brand-primary shadow-[0_0_10px_var(--color-primary)]"
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeStep}
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -10 }}
                        transition={{ duration: 0.4 }}
                        className="bg-brand-surface rounded-[3.5rem] border border-brand-border shadow-premium dark:shadow-premium-dark overflow-hidden glimmer transition-all"
                    >
                        {/* Step 1: Basic Information */}
                        {activeStep === 1 && (
                            <div className="p-10 sm:p-16 space-y-12">
                                <div className="space-y-10">
                                    <div className="relative group">
                                        <label className="block text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-4 transition-colors">Course Title</label>
                                        <input
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            type="text"
                                            placeholder="COMMAND_IDENTIFIER"
                                            className="w-full bg-brand-bg border border-brand-border px-8 py-5 rounded-2xl focus:border-brand-primary/50 outline-none transition-all font-black text-xl text-brand-text uppercase tracking-tight placeholder:text-brand-muted/20 italic"
                                        />
                                    </div>

                                    <div className="relative group">
                                        <label className="block text-[10px] font-black text-brand-muted uppercase tracking-[0.4em] mb-4 transition-colors">Course Subtitle</label>
                                        <input
                                            name="subtitle"
                                            value={formData.subtitle}
                                            onChange={handleInputChange}
                                            type="text"
                                            placeholder="MISSION_OBJECTIVE_SUMMARY"
                                            className="w-full bg-brand-bg border border-brand-border px-8 py-5 rounded-2xl focus:border-brand-primary/50 outline-none transition-all font-bold text-brand-text placeholder:text-brand-muted/20"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="block text-[10px] font-black text-brand-muted uppercase tracking-[0.4em] mb-4 transition-colors">Security Sector (Category)</label>
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                                className="w-full bg-brand-bg border border-brand-border px-8 py-5 rounded-2xl focus:border-brand-primary/50 outline-none transition-all text-brand-text font-black uppercase tracking-widest appearance-none"
                                            >
                                                {['Programming', 'Design', 'Business', 'Marketing', 'Data Science', 'DevOps', 'Cloud', 'Other'].map(cat => (
                                                    <option key={cat} value={cat} className="bg-brand-surface">{cat}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-brand-muted uppercase tracking-[0.4em] mb-4 transition-colors">Clearance Level</label>
                                            <select
                                                name="level"
                                                value={formData.level}
                                                onChange={handleInputChange}
                                                className="w-full bg-brand-bg border border-brand-border px-8 py-5 rounded-2xl focus:border-brand-primary/50 outline-none transition-all text-brand-text font-black uppercase tracking-widest appearance-none"
                                            >
                                                {['Beginner', 'Intermediate', 'Advanced', 'All Levels'].map(lvl => (
                                                    <option key={lvl} value={lvl} className="bg-brand-surface">{lvl}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-brand-muted uppercase tracking-[0.4em] mb-4 transition-colors">Intel Briefing (Description)</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows="6"
                                            placeholder="ESTABLISH_MISSION_PARAMETERS..."
                                            className="w-full bg-brand-bg border border-brand-border px-8 py-5 rounded-2xl focus:border-brand-primary/50 outline-none transition-all text-brand-text font-bold resize-none placeholder:text-brand-muted/20"
                                        ></textarea>
                                    </div>

                                    {/* Lists */}
                                    {['learningObjectives', 'requirements', 'targetAudience'].map((field) => (
                                        <div key={field} className="space-y-6">
                                            <label className="block text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] transition-colors">
                                                {field === 'learningObjectives' ? 'STRATEGIC OUTCOMES' : field === 'requirements' ? 'TECHNICAL PREREQUISITES' : 'DESIGNATED OPERATORS'}
                                            </label>
                                            <div className="space-y-4">
                                                {formData[field].map((obj, idx) => (
                                                    <div key={idx} className="flex gap-4 group">
                                                        <input
                                                            value={obj}
                                                            onChange={(e) => handleListChange(e, idx, field)}
                                                            className="flex-grow bg-brand-bg border border-brand-border px-6 py-4 rounded-xl focus:border-brand-primary/30 outline-none text-brand-text font-bold placeholder:text-brand-muted/10 tracking-tight transition-all"
                                                            placeholder={`INTEL_POINT_${idx + 1}`}
                                                        />
                                                        <button onClick={() => removeListItem(idx, field)} className="p-3 text-brand-muted hover:text-red-500 transition-colors">
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <button onClick={() => addListItem(field)} className="flex items-center gap-2 text-[10px] font-black text-brand-primary uppercase tracking-widest hover:text-brand-secondary transition-colors">
                                                <Plus className="w-4 h-4" /> Expand Intel Stack
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Curriculum */}
                        {activeStep === 2 && (
                            <div className="p-10 sm:p-16 space-y-10 bg-brand-bg/50">
                                {formData.sections.map((section, sIndex) => (
                                    <div key={section.id} className="bg-brand-surface border border-brand-border rounded-[2.5rem] overflow-hidden group/sec hover:border-brand-primary/30 transition-all shadow-premium dark:shadow-premium-dark">
                                        <div className="bg-brand-surface/50 p-6 flex items-center gap-6 border-b border-brand-border">
                                            <div className="px-4 py-2 bg-brand-primary/10 border border-brand-primary/20 rounded-xl text-brand-primary text-[10px] font-black uppercase tracking-widest">
                                                SECTION {sIndex + 1}
                                            </div>
                                            <input
                                                type="text"
                                                value={section.title}
                                                onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                                                className="bg-transparent font-black text-brand-text italic uppercase tracking-tighter outline-none flex-grow text-lg transition-colors"
                                            />
                                            <button onClick={() => deleteSection(section.id)} className="text-brand-muted hover:text-red-500 transition-colors">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <div className="p-8 space-y-4">
                                            {section.lectures.map((lecture, lIndex) => (
                                                <div key={lecture.id} className="flex items-center gap-6 p-5 rounded-[1.5rem] bg-brand-bg border border-brand-border hover:border-brand-primary/20 transition-all">
                                                    <div className="w-8 h-8 rounded-lg bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary font-black text-xs">
                                                        {lIndex + 1}
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={lecture.title}
                                                        onChange={(e) => updateLecture(section.id, lecture.id, 'title', e.target.value)}
                                                        placeholder="UNNAMED_INTEL_STREAM"
                                                        className="flex-grow bg-transparent outline-none text-brand-text font-bold placeholder:text-brand-muted/20 uppercase text-sm tracking-tight transition-colors"
                                                    />
                                                    <div className="flex items-center">
                                                        {lecture.video ? (
                                                            <div className="flex items-center gap-3 bg-brand-primary/10 px-4 py-2 rounded-xl border border-brand-primary/30">
                                                                <CheckCircle className="w-4 h-4 text-brand-primary" />
                                                                <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">ENCRYPTED</span>
                                                                <button onClick={() => updateLecture(section.id, lecture.id, 'video', '')} className="text-brand-muted hover:text-red-500 transition-colors">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="scale-75 origin-right">
                                                                <UploadButton
                                                                    endpoint="courseVideo"
                                                                    headers={{ Authorization: `Bearer ${token}` }}
                                                                    content={{
                                                                        button({ ready }) {
                                                                            if (ready) return "Choose Video";
                                                                            return "Initializing...";
                                                                        },
                                                                    }}
                                                                    appearance={{
                                                                        button: "bg-brand-primary font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-brand-primary/90 transition-all shadow-premium dark:shadow-premium-dark px-6 py-3 border-none",
                                                                        allowedContent: "text-brand-muted text-[9px] font-black uppercase tracking-widest mt-1"
                                                                    }}
                                                                    onClientUploadComplete={(res) => handleVideoUploadComplete(section.id, lecture.id, res)}
                                                                    onUploadError={(error) => {
                                                                        console.error('Upload Error:', error);
                                                                        alert(`Strategic Failure: ${error.message}`);
                                                                    }}
                                                                    onUploadBegin={(name) => {
                                                                        console.log('Initiating upload for:', name);
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                        {lecture.duration && lecture.duration !== '0:00' && (
                                                            <div className="flex items-center gap-2 px-3 py-1 bg-brand-bg/50 border border-brand-primary/20 rounded-lg ml-3 transition-colors">
                                                                <Clock className="w-3.5 h-3.5 text-brand-primary" />
                                                                <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{lecture.duration}</span>
                                                            </div>
                                                        )}
                                                        {lecture.video && (
                                                            <button
                                                                onClick={() => handleTranscribe(section.id, lecture.id)}
                                                                disabled={lecture.transcriptionStatus === 'processing'}
                                                                className={`flex items-center gap-2 px-3 py-1 rounded-lg ml-3 text-[10px] font-black uppercase tracking-widest transition-all ${lecture.transcriptionStatus === 'completed'
                                                                    ? 'bg-green-600/20 border border-green-500/30 text-green-400 hover:bg-green-600/30'
                                                                    : lecture.transcriptionStatus === 'processing'
                                                                        ? 'bg-yellow-600/20 border border-yellow-500/30 text-yellow-400 cursor-not-allowed'
                                                                        : lecture.transcriptionStatus === 'failed'
                                                                            ? 'bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30'
                                                                            : 'bg-purple-600/20 border border-purple-500/30 text-purple-400 hover:bg-purple-600/30'
                                                                    }`}
                                                            >
                                                                {lecture.transcriptionStatus === 'processing' ? (
                                                                    <>
                                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                        <span>Processing...</span>
                                                                    </>
                                                                ) : lecture.transcriptionStatus === 'completed' ? (
                                                                    <>
                                                                        <CheckCircle className="w-3.5 h-3.5" />
                                                                        <span>Transcribed</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <FileText className="w-3.5 h-3.5" />
                                                                        <span>Transcribe</span>
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => addLecture(section.id)}
                                                className="w-full py-5 border-2 border-dashed border-brand-border rounded-[1.5rem] text-brand-muted font-black text-[10px] uppercase tracking-[0.3em] hover:border-brand-primary/40 hover:text-brand-primary transition-all flex items-center justify-center gap-3"
                                            >
                                                <Plus className="w-4 h-4" /> Inject Intelligence Node
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={addSection}
                                    className="w-full py-6 bg-brand-surface border border-brand-border rounded-[2.5rem] text-brand-text font-black uppercase tracking-[0.4em] text-[10px] hover:border-brand-primary/50 hover:bg-brand-surface-hover transition-all flex items-center justify-center gap-4 shadow-premium dark:shadow-premium-dark"
                                >
                                    <Plus className="w-5 h-5 text-brand-primary" /> Partition New Sector
                                </button>
                            </div>
                        )}

                        {/* Step 3: Media & Pricing */}
                        {activeStep === 3 && (
                            <div className="p-10 sm:p-16 space-y-16">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                    <div className="space-y-10">
                                        <h3 className="text-xl font-black text-brand-text italic tracking-tighter uppercase underline decoration-brand-primary decoration-4 underline-offset-4 transition-colors">Visual Clearance</h3>

                                        <div className="aspect-video rounded-[2.5rem] border-2 border-dashed border-brand-border bg-brand-bg flex flex-col items-center justify-center relative overflow-hidden group shadow-inner transition-colors">
                                            {formData.thumbnail ? (
                                                <div className="relative w-full h-full group">
                                                    <img src={formData.thumbnail} alt="Thumbnail" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                    <div className="absolute inset-0 bg-brand-bg/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                                                        <button onClick={() => setFormData(prev => ({ ...prev, thumbnail: null }))} className="bg-red-600 text-white p-5 rounded-3xl shadow-2xl transform scale-75 group-hover:scale-100 transition-transform">
                                                            <Trash2 className="w-6 h-6" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center p-10">
                                                    <div className="mb-8 scale-125">
                                                        <UploadButton
                                                            endpoint="courseThumbnail"
                                                            headers={{ Authorization: `Bearer ${token}` }}
                                                            content={{
                                                                button({ ready }) {
                                                                    if (ready) return "Select Identification";
                                                                    return "Initializing...";
                                                                },
                                                            }}
                                                            appearance={{
                                                                button: "bg-brand-primary font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-brand-primary/90 transition-all shadow-premium dark:shadow-premium-dark px-8 py-4 border-none",
                                                                allowedContent: "text-brand-muted text-[9px] font-black uppercase tracking-widest mt-2"
                                                            }}
                                                            onClientUploadComplete={(res) => setFormData(prev => ({ ...prev, thumbnail: res[0].ufsUrl || res[0].url }))}
                                                        />
                                                    </div>
                                                    <p className="font-black text-brand-muted uppercase tracking-[0.3em] text-[10px] transition-colors">Upload Sector Identification</p>
                                                    <p className="text-[9px] text-brand-muted/40 mt-2 uppercase font-black transition-colors">1280x720 // High Res Preferred</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-8 rounded-[2rem] bg-brand-primary/5 border border-brand-primary/10 shadow-premium transition-all">
                                            <h4 className="font-black text-brand-primary text-xs uppercase tracking-[0.2em] mb-3 transition-colors">Transmission Brief</h4>
                                            <p className="text-[10px] text-brand-muted uppercase font-bold leading-relaxed mb-6 transition-colors">Encrypted promotional downlink for operator review.</p>
                                            <button className="text-[10px] font-black bg-brand-surface text-brand-text px-8 py-3 rounded-xl border border-brand-border uppercase tracking-widest hover:border-brand-primary/50 transition-all">
                                                Initiate Link
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-10">
                                        <h3 className="text-xl font-black text-brand-text italic tracking-tighter uppercase underline decoration-brand-primary decoration-4 underline-offset-4 transition-colors">Capitalization</h3>

                                        <div className="space-y-6">
                                            <label className="block text-[10px] font-black text-brand-muted uppercase tracking-[0.4em] transition-colors">Resource Allocation</label>
                                            <div className="flex gap-4 p-2 bg-brand-bg border border-brand-border rounded-2xl transition-all">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, isFree: true, price: 0 }))}
                                                    className={`flex-1 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${formData.isFree ? 'bg-brand-primary text-white shadow-premium' : 'text-brand-muted hover:text-brand-text'}`}
                                                >
                                                    Public Grid
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, isFree: false }))}
                                                    className={`flex-1 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${!formData.isFree ? 'bg-brand-primary text-white shadow-premium' : 'text-brand-muted hover:text-brand-text'}`}
                                                >
                                                    Premium Uplink
                                                </button>
                                            </div>
                                        </div>

                                        {!formData.isFree && (
                                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                                <div className="grid grid-cols-3 gap-6">
                                                    <div className="col-span-1">
                                                        <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3 transition-colors">Currency</label>
                                                        <select
                                                            name="currency"
                                                            value={formData.currency}
                                                            onChange={handleInputChange}
                                                            className="w-full bg-brand-bg border border-brand-border px-6 py-4.5 rounded-xl font-black text-brand-text uppercase outline-none focus:border-brand-primary/30 transition-all"
                                                        >
                                                            <option value="INR" className="bg-brand-surface">INR</option>
                                                            <option value="USD" className="bg-brand-surface">USD</option>
                                                        </select>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3 transition-colors">Asset Value</label>
                                                        <div className="relative">
                                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-brand-primary transition-colors">{formData.currency === 'INR' ? '₹' : '$'}</span>
                                                            <input
                                                                name="price"
                                                                value={formData.price}
                                                                onChange={handleInputChange}
                                                                type="number"
                                                                placeholder="0.00"
                                                                className="w-full bg-brand-bg border border-brand-border pl-12 pr-6 py-4.5 rounded-xl text-brand-text font-black text-xl outline-none focus:border-brand-primary/50 transition-all placeholder:text-brand-muted/20"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest mb-4 transition-colors">Command Receiving ID (UPI)</label>
                                                    <div className="relative group">
                                                        <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-primary w-5 h-5 transition-colors" />
                                                        <input
                                                            name="upiId"
                                                            value={formData.upiId}
                                                            onChange={handleInputChange}
                                                            type="text"
                                                            placeholder="OPERATOR@CORE"
                                                            className="w-full bg-brand-bg border border-brand-border pl-16 pr-6 py-5 rounded-2xl text-brand-text font-black text-lg outline-none focus:border-brand-primary/50 transition-all placeholder:text-brand-muted/20"
                                                        />
                                                    </div>
                                                    <p className="text-[10px] text-brand-muted/40 font-black uppercase tracking-widest mt-4 italic transition-colors">// Direct resource extraction protocol initialized.</p>
                                                </div>
                                            </motion.div>
                                        )}

                                        {formData.isFree && (
                                            <div className="p-8 rounded-[2rem] bg-blue-600/5 border border-blue-500/10 shadow-inner">
                                                <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.3em] leading-relaxed">
                                                    // Sector cleared for public distribution. Mission designated for global visibility.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Footer */}
                        <div className="px-10 sm:px-16 py-10 border-t border-[#1F1F1F] flex justify-between items-center bg-[#050505]">
                            <button
                                onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                                disabled={activeStep === 1}
                                className={`font-black uppercase text-[10px] tracking-[0.3em] text-zinc-600 hover:text-white transition-all ${activeStep === 1 ? 'opacity-0 pointer-events-none' : ''}`}
                            >
                                Revert Phase
                            </button>

                            <div className="flex gap-6">
                                {activeStep < 3 ? (
                                    <button
                                        onClick={() => setActiveStep(prev => Math.min(3, prev + 1))}
                                        className="flex items-center gap-3 px-12 py-5 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-blue-600 hover:text-white transition-all shadow-xl"
                                    >
                                        Advancement Core <ChevronRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="flex items-center gap-3 px-12 py-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-[0_0_40px_rgba(37,99,235,0.5)] hover:bg-blue-500 transition-all"
                                    >
                                        <Save className="w-4 h-4" /> Final Deployment
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CreateCourse;
