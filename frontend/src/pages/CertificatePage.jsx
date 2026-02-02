import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Certificate from '../components/Certificate';
import { PageLoader } from '../components/SkeletonLoaders';
import axios from 'axios';

const CertificatePage = () => {
    const { courseId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [courseData, setCoursData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCertificateData = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

                // Fetch course details
                const courseRes = await axios.get(`${baseUrl}/courses/${courseId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const course = courseRes.data;

                // Check if user has completed the course
                const enrollment = user.enrolledCourses?.find(
                    e => e.courseId === courseId && e.isCompleted
                );

                if (!enrollment) {
                    setError('You must complete this course to view the certificate.');
                    setLoading(false);
                    return;
                }

                setCoursData({
                    courseName: course.title,
                    instructorName: course.instructor?.username || 'Instructor',
                    completionDate: enrollment.completionDate || new Date(),
                    courseId: course._id,
                    // Calculate hours from course duration
                    hours: course.sections?.reduce((total, section) => {
                        return total + (section.lectures?.length || 0);
                    }, 0) * 2 || 40, // Estimate 2 hours per lecture
                    grade: 'A+' // You can calculate this based on quiz scores
                });

                setLoading(false);
            } catch (error) {
                console.error('Error fetching certificate data:', error);
                setError('Failed to load certificate data.');
                setLoading(false);
            }
        };

        if (user && courseId) {
            fetchCertificateData();
        }
    }, [courseId, user]);

    if (loading) {
        return <PageLoader />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-6">
                <div className="bg-[#0D0D0D] rounded-3xl border border-red-500/20 p-12 text-center max-w-2xl">
                    <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                        <span className="text-4xl">⚠️</span>
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase italic mb-4">
                        Access Denied
                    </h2>
                    <p className="text-zinc-500 font-bold mb-8">
                        {error}
                    </p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase text-sm tracking-wider transition-all"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!courseData) {
        return null;
    }

    return (
        <Certificate
            studentName={user.username}
            courseName={courseData.courseName}
            completionDate={courseData.completionDate}
            instructorName={courseData.instructorName}
            courseId={courseData.courseId}
            hours={courseData.hours}
            grade={courseData.grade}
        />
    );
};

export default CertificatePage;
