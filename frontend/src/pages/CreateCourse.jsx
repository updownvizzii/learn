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
    Upload
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

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
                    { id: 1, title: 'Introduction to the Course', video: '' }
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
                        lectures: [...s.lectures, { id: Date.now(), title: 'New Lecture', video: '' }]
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

    const handleFileUpload = async (e, sectionId, lectureId, type = 'video') => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadFormData = new FormData();
        uploadFormData.append(type, file);

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('http://localhost:5000/api/courses/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: uploadFormData
            });

            const data = await response.json();
            if (response.ok) {
                if (type === 'video') {
                    updateLecture(sectionId, lectureId, 'video', data.videoUrl);
                } else if (type === 'thumbnail') {
                    setFormData(prev => ({ ...prev, thumbnail: data.thumbnailUrl }));
                }
            } else {
                alert(data.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading file');
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('accessToken');
            if (!formData.category) {
                alert('Please select a category');
                setIsSaving(false);
                return;
            }

            console.log('Publishing course with data:', formData);
            const response = await fetch('http://localhost:5000/api/courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to create course');
            }

            navigate('/teacher/dashboard');
        } catch (error) {
            console.error('Error creating course:', error);
            alert('Failed to create course');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans text-gray-900 pb-20">
            {/* Background Blobs */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-[120px]" />
            </div>

            {/* Header */}
            <header className="sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100 px-8 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/teacher/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900">Create New Course</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 hidden sm:inline">Draft saved</span>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSaving ? 'Saving...' : 'Publish Course'}
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">

                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-12 px-4 sm:px-16">
                    {steps.map((step, idx) => (
                        <div key={step.id} className="flex flex-col items-center relative z-10">
                            <button
                                onClick={() => setActiveStep(step.id)}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 font-bold text-lg mb-3 shadow-lg ${activeStep === step.id
                                    ? 'bg-indigo-600 text-white scale-110 shadow-indigo-200'
                                    : activeStep > step.id
                                        ? 'bg-green-500 text-white'
                                        : 'bg-white text-gray-400 border border-gray-200'
                                    }`}
                            >
                                {activeStep > step.id ? <CheckCircle className="w-6 h-6" /> : <step.icon className="w-5 h-5" />}
                            </button>
                            <span className={`text-sm font-bold ${activeStep === step.id ? 'text-indigo-900' : 'text-gray-400'}`}>{step.title}</span>
                            {idx !== steps.length - 1 && (
                                <div className="absolute top-6 left-full w-[calc(100vw/5)] sm:w-32 h-0.5 -translate-y-1/2 -z-10 bg-gray-200">
                                    <div
                                        className="h-full bg-indigo-600 transition-all duration-500"
                                        style={{ width: activeStep > step.id ? '100%' : '0%' }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Form Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden"
                    >
                        {/* Step 1: Basic Information */}
                        {activeStep === 1 && (
                            <div className="p-8 sm:p-12 space-y-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Course Title</label>
                                        <input
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            type="text"
                                            placeholder="e.g. The Complete React Developer Course 2024"
                                            className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-medium text-lg"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Course Subtitle</label>
                                        <input
                                            name="subtitle"
                                            value={formData.subtitle}
                                            onChange={handleInputChange}
                                            type="text"
                                            placeholder="e.g. Master React, Redux, Hooks and more..."
                                            className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                                className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all bg-white"
                                            >
                                                <option value="Programming">Programming</option>
                                                <option value="Design">Design</option>
                                                <option value="Business">Business</option>
                                                <option value="Marketing">Marketing</option>
                                                <option value="Data Science">Data Science</option>
                                                <option value="DevOps">DevOps</option>
                                                <option value="Cloud">Cloud</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Level</label>
                                            <select
                                                name="level"
                                                value={formData.level}
                                                onChange={handleInputChange}
                                                className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all bg-white"
                                            >
                                                <option>Beginner</option>
                                                <option>Intermediate</option>
                                                <option>Advanced</option>
                                                <option>All Levels</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows="4"
                                            placeholder="Tell students what they will learn..."
                                            className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none"
                                        ></textarea>
                                    </div>

                                    {/* Learning Objectives */}
                                    <div className="space-y-4">
                                        <label className="block text-sm font-bold text-gray-700">What will students learn in this course?</label>
                                        <div className="grid grid-cols-1 gap-3">
                                            {formData.learningObjectives.map((obj, idx) => (
                                                <div key={idx} className="flex gap-2">
                                                    <input
                                                        value={obj}
                                                        onChange={(e) => handleListChange(e, idx, 'learningObjectives')}
                                                        placeholder="e.g. Build real-world React apps"
                                                        className="flex-grow px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none"
                                                    />
                                                    <button onClick={() => removeListItem(idx, 'learningObjectives')} className="p-2 text-gray-400 hover:text-red-500">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <button onClick={() => addListItem('learningObjectives')} className="text-sm font-bold text-indigo-600 flex items-center gap-1 hover:text-indigo-700">
                                            <Plus className="w-4 h-4" /> Add objective
                                        </button>
                                    </div>

                                    {/* Requirements */}
                                    <div className="space-y-4">
                                        <label className="block text-sm font-bold text-gray-700">Are there any course requirements or prerequisites?</label>
                                        <div className="grid grid-cols-1 gap-3">
                                            {formData.requirements.map((req, idx) => (
                                                <div key={idx} className="flex gap-2">
                                                    <input
                                                        value={req}
                                                        onChange={(e) => handleListChange(e, idx, 'requirements')}
                                                        placeholder="e.g. Basic JavaScript knowledge"
                                                        className="flex-grow px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none"
                                                    />
                                                    <button onClick={() => removeListItem(idx, 'requirements')} className="p-2 text-gray-400 hover:text-red-500">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <button onClick={() => addListItem('requirements')} className="text-sm font-bold text-indigo-600 flex items-center gap-1 hover:text-indigo-700">
                                            <Plus className="w-4 h-4" /> Add requirement
                                        </button>
                                    </div>

                                    {/* Target Audience */}
                                    <div className="space-y-4">
                                        <label className="block text-sm font-bold text-gray-700">Who is this course for?</label>
                                        <div className="grid grid-cols-1 gap-3">
                                            {formData.targetAudience.map((audience, idx) => (
                                                <div key={idx} className="flex gap-2">
                                                    <input
                                                        value={audience}
                                                        onChange={(e) => handleListChange(e, idx, 'targetAudience')}
                                                        placeholder="e.g. Aspiring web developers"
                                                        className="flex-grow px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none"
                                                    />
                                                    <button onClick={() => removeListItem(idx, 'targetAudience')} className="p-2 text-gray-400 hover:text-red-500">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <button onClick={() => addListItem('targetAudience')} className="text-sm font-bold text-indigo-600 flex items-center gap-1 hover:text-indigo-700">
                                            <Plus className="w-4 h-4" /> Add target audience
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Curriculum */}
                        {activeStep === 2 && (
                            <div className="p-8 sm:p-12 space-y-8 bg-gray-50/50 min-h-[500px]">
                                {formData.sections.map((section, sIndex) => (
                                    <div key={section.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                        <div className="bg-gray-50 p-4 flex items-center gap-4 border-b border-gray-100">
                                            <span className="font-bold text-gray-400">Section {sIndex + 1}:</span>
                                            <input
                                                type="text"
                                                value={section.title}
                                                onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                                                className="bg-transparent font-bold text-gray-900 outline-none flex-grow"
                                            />
                                            <button onClick={() => deleteSection(section.id)} className="text-gray-400 hover:text-red-500">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="p-4 space-y-3">
                                            {section.lectures.map((lecture, lIndex) => (
                                                <div key={lecture.id} className="flex items-center gap-4 p-3 rounded-xl bg-white border border-gray-100 text-sm">
                                                    <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs flex-shrink-0">
                                                        {lIndex + 1}
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={lecture.title}
                                                        onChange={(e) => updateLecture(section.id, lecture.id, 'title', e.target.value)}
                                                        placeholder="Lecture Title"
                                                        className="flex-grow outline-none text-gray-700 font-medium"
                                                    />
                                                    <label className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer">
                                                        <Video className="w-3 h-3" />
                                                        {lecture.video ? 'Change Video' : 'Add Content'}
                                                        <input
                                                            type="file"
                                                            accept="video/*"
                                                            className="hidden"
                                                            onChange={(e) => handleFileUpload(e, section.id, lecture.id, 'video')}
                                                        />
                                                    </label>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => addLecture(section.id)}
                                                className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-bold text-sm hover:border-indigo-300 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Plus className="w-4 h-4" /> Add Lecture
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={addSection}
                                    className="w-full py-4 bg-white border border-gray-200 rounded-2xl text-gray-900 font-bold hover:bg-gray-50 hover:shadow-md transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-5 h-5" /> Add New Section
                                </button>
                            </div>
                        )}

                        {/* Step 3: Media & Pricing */}
                        {activeStep === 3 && (
                            <div className="p-8 sm:p-12 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold text-gray-900">Course Media</h3>

                                        <label className="aspect-video rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-500 hover:border-indigo-500 hover:bg-indigo-50/10 transition-all cursor-pointer group relative overflow-hidden">
                                            {formData.thumbnail ? (
                                                <img
                                                    src={formData.thumbnail.startsWith('http') ? formData.thumbnail : `http://localhost:5000${formData.thumbnail}`}
                                                    alt="Thumbnail"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <>
                                                    <div className="w-16 h-16 rounded-full bg-white mb-4 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                        <ImageIcon className="w-8 h-8 text-indigo-500" />
                                                    </div>
                                                    <p className="font-bold text-gray-700">Upload Course Thumbnail</p>
                                                    <p className="text-xs mt-2">1280x720 (High Quality)</p>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => handleFileUpload(e, null, null, 'thumbnail')}
                                            />
                                        </label>

                                        <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                                            <h4 className="font-bold text-indigo-900 text-sm mb-1">Promotional Video</h4>
                                            <p className="text-xs text-indigo-700 mb-3">Upload a short video to showcase your course.</p>
                                            <button className="text-xs font-bold bg-white text-indigo-600 px-3 py-2 rounded-lg border border-indigo-200 shadow-sm hover:shadow">
                                                Upload Video
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold text-gray-900">Pricing</h3>

                                        {/* Free/Paid Toggle */}
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-3">Course Type</label>
                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, isFree: true, price: 0 }))}
                                                    className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all ${formData.isFree
                                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    Free Course
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, isFree: false }))}
                                                    className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all ${!formData.isFree
                                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    Paid Course
                                                </button>
                                            </div>
                                        </div>

                                        {!formData.isFree && (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">Currency</label>
                                                    <select
                                                        name="currency"
                                                        value={formData.currency}
                                                        onChange={handleInputChange}
                                                        className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none bg-white"
                                                    >
                                                        <option value="INR">INR (₹)</option>
                                                        <option value="USD">USD ($)</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">Course Price</label>
                                                    <div className="relative">
                                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-gray-500">{formData.currency === 'INR' ? '₹' : '$'}</span>
                                                        <input
                                                            name="price"
                                                            value={formData.price}
                                                            onChange={handleInputChange}
                                                            type="number"
                                                            placeholder="0.00"
                                                            className="w-full pl-10 pr-5 py-4 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-bold text-lg"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">Teacher UPI ID (for receiving payments)</label>
                                                    <div className="relative">
                                                        <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-gray-400 w-5 h-5" />
                                                        <input
                                                            name="upiId"
                                                            value={formData.upiId}
                                                            onChange={handleInputChange}
                                                            type="text"
                                                            placeholder="yourname@upi"
                                                            className="w-full pl-12 pr-5 py-4 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-bold text-lg"
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-2">Students will use this to pay for your course.</p>
                                                </div>
                                            </>
                                        )}

                                        {formData.isFree && (
                                            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                                                <p className="text-sm text-emerald-700 font-medium">✨ This course will be available to all students for free!</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Footer */}
                        <div className="px-8 sm:px-12 py-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <button
                                onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                                disabled={activeStep === 1}
                                className={`font-bold text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg transition-colors ${activeStep === 1 ? 'opacity-0 pointer-events-none' : ''}`}
                            >
                                Previous Step
                            </button>
                            <button
                                onClick={() => setActiveStep(prev => Math.min(3, prev + 1))}
                                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${activeStep === 3
                                    ? 'hidden'
                                    : 'bg-gray-900 text-white hover:bg-gray-800'
                                    }`}
                            >
                                Next Step <ChevronRight className="w-4 h-4" />
                            </button>
                            {activeStep === 3 && (
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                                >
                                    <Save className="w-4 h-4" /> Publish Course
                                </button>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>

            </div>
        </div>
    );
};

export default CreateCourse;
