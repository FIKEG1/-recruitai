import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaPlus, FaEye, FaEdit, FaTrash, FaUsers, FaClock } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';

const JobList = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await api.get('/jobs/employer/me');
            setJobs(response.data.jobs || []);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            setError('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm('Are you sure you want to delete this job?')) return;
        try {
            await api.delete(`/jobs/${jobId}`);
            setJobs(jobs.filter(j => j._id !== jobId));
            toast.success('Job deleted successfully');
        } catch (error) {
            toast.error('Failed to delete job');
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            open: 'success',
            closed: 'danger',
            draft: 'secondary'
        };
        return statusMap[status] || 'secondary';
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading your jobs...</p>
            </Container>
        );
    }

    return (
        <section className="job-list-section py-4">
            <Container>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold mb-0">My Jobs</h2>
                        <p className="text-muted">Manage your job postings</p>
                    </div>
                    <Button as={Link} to="/employer/post-job" variant="primary">
                        <FaPlus className="me-2" /> Post New Job
                    </Button>
                </div>

                {error && (
                    <Alert variant="danger">{error}</Alert>
                )}

                {jobs.length === 0 ? (
                    <Card className="text-center py-5">
                        <Card.Body>
                            <div className="mb-3" style={{ fontSize: '4rem' }}>📋</div>
                            <h4>No jobs posted yet</h4>
                            <p className="text-muted">Start by posting your first job opening</p>
                            <Button as={Link} to="/employer/post-job" variant="primary">
                                Post a Job
                            </Button>
                        </Card.Body>
                    </Card>
                ) : (
                    <Card className="shadow-sm">
                        <Card.Body className="p-0">
                            <Table responsive hover className="mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th>Job Title</th>
                                        <th>Department</th>
                                        <th>Location</th>
                                        <th>Applications</th>
                                        <th>Status</th>
                                        <th>Deadline</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {jobs.map((job) => (
                                        <tr key={job._id}>
                                            <td className="fw-semibold">{job.title}</td>
                                            <td>{job.department}</td>
                                            <td>{job.location}</td>
                                            <td>
                                                <Badge bg="primary" pill>
                                                    {job.applications?.length || 0}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Badge bg={getStatusBadge(job.status)}>
                                                    {job.status?.toUpperCase() || 'OPEN'}
                                                </Badge>
                                            </td>
                                            <td className="text-muted small">
                                                <FaClock className="me-1" />
                                                {new Date(job.applicationDeadline).toLocaleDateString()}
                                            </td>
                                            <td>
                                                <div className="d-flex justify-content-center gap-1">
                                                    <Button
                                                        as={Link}
                                                        to={`/employer/applications/${job._id}`}
                                                        variant="outline-primary"
                                                        size="sm"
                                                        title="View Applications"
                                                    >
                                                        <FaUsers />
                                                    </Button>
                                                    <Button
                                                        as={Link}
                                                        to={`/jobs/${job._id}`}
                                                        variant="outline-info"
                                                        size="sm"
                                                        title="View Job"
                                                        target="_blank"
                                                    >
                                                        <FaEye />
                                                    </Button>
                                                    <Button
                                                        as={Link}
                                                        to={`/employer/edit-job/${job._id}`}
                                                        variant="outline-warning"
                                                        size="sm"
                                                        title="Edit Job"
                                                    >
                                                        <FaEdit />
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleDeleteJob(job._id)}
                                                        title="Delete Job"
                                                    >
                                                        <FaTrash />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                )}
            </Container>
        </section>
    );
};

export default JobList;