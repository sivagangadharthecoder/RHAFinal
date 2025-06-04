import { useState, useEffect } from 'react';
import axios from 'axios';
import { useContext } from "react";
import { AppContent } from "../context/AppContext";
import { useToast } from '../context/ToastContext';


const UserId = () => {
  const { addToast } = useToast();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0
  });

  const { userData } = useContext(AppContent);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { page, limit } = pagination;
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/id-requests`,
        {
          params: {
            page,
            limit,
            search,
          }
        }
      );

      const filteredRequests = response.data.requests.filter(
        request => request.rollNumber === userData.rollNumber
      );

      setRequests(filteredRequests);

      setPagination(prev => ({
        ...prev,
        totalPages: response.data.totalPages,
        totalItems: response.data.totalItems
      }));
    } catch (error) {
      console.error('Error Fetching Requests:', error);
      addToast(
        {
          title: 'Error',
          body: "Failed To Fetch !"
        },
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [pagination.page, pagination.limit, search]);

  const handleDelete = async (id) => {
    if (window.confirm('Are You Sure ?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/id-requests/${id}`);
        addToast(
          { title: 'Success', body: 'Application Deletion Success !' },
          'success'
        );
        fetchRequests();
      } catch (error) {
        console.error('Error Deleting Request:', error);
        addToast(
          {
            title: 'Error',
            body: "Application Deletion Failed !"
          },
          'error'
        );
      }
    }
  };

  const downloadPdf = (id) => {
    window.open(`${import.meta.env.VITE_API_URL}/api/id-requests/pdf/${id}`, '_blank');
    addToast(
      { title: 'Info', body: 'File Downloading.. !' },
      'info'
    );
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleLimitChange = (newLimit) => {
    setPagination(prev => ({
      ...prev,
      limit: parseInt(newLimit),
      page: 1
    }));
  };

  return (
    <div className="dashboard-content-container">
      <div className="dashboard-table-header">
        <h2>Your ID Card Requests</h2>
        <div className="dashboard-table-controls">
          <div className="dashboard-search-wrapper">
            <input
              type="text"
              placeholder="Search requests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="dashboard-search-input"
            />
          </div>

          <div className="dashboard-rows-selector">
            <select
              value={pagination.limit}
              onChange={(e) => handleLimitChange(e.target.value)}
              className="dashboard-rows-select"
            >
              <option value="5">5 rows</option>
              <option value="10">10 rows</option>
              <option value="20">20 rows</option>
              <option value="50">50 rows</option>
            </select>
          </div>
        </div>
      </div>

      <div className="dashboard-table-wrapper">
        {loading ? (
          <div className="dashboard-loading-state">
            <div className="dashboard-loading-spinner"></div>
            <span>Loading requests...</span>
          </div>
        ) : requests.length === 0 ? (
          <div className="dashboard-no-results">
            No ID card requests found
          </div>
        ) : (
          <div className="dashboard-table-responsive">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Roll No.</th>
                  <th>Department</th>
                  <th>College</th>
                  <th>Reason</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(request => (
                  <tr key={request._id}>
                    <td>{request.studentName}</td>
                    <td>{request.rollNumber}</td>
                    <td>{request.department}</td>
                    <td>{request.college}</td>
                    <td className="dashboard-table-reason">{request.reason}</td>
                    <td>{new Date(request.requestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td>
                      <span className={`dashboard-status-badge ${request.status || 'pending'}`}>
                        {request.status ? request.status.charAt(0).toUpperCase() + request.status.slice(1) : 'Pending'}
                      </span>
                    </td>
                    <td className="dashboard-table-actions">
                      <button
                        onClick={() => downloadPdf(request._id)}
                        className="dashboard-action-btn download"
                        title="Download"
                      >
                        <i>⬇️</i>
                      </button>
                      <button
                        onClick={() => handleDelete(request._id)}
                        className="dashboard-action-btn delete"
                        title="Delete"
                      >
                        <i>🗑️</i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {requests.length > 0 && (
        <div className="dashboard-pagination">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="dashboard-pagination-btn"
          >
            Previous
          </button>
          <span className="dashboard-page-indicator">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="dashboard-pagination-btn"
          >
            Next
          </button>
        </div>
      )}

      <style jsx>{`
                .dashboard-content-container {
                    width: 100%;
                    padding: 0;
                }
                
                .dashboard-table-header {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }
                
                .dashboard-table-header h2 {
                    font-size: 1.5rem;
                    font-weight: 500;
                    color: #333;
                    margin: 0;
                }
                
                .dashboard-table-controls {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 1rem;
                    flex-wrap: wrap;
                }
                
                .dashboard-search-wrapper {
                    flex: 1;
                    min-width: 200px;
                }
                
                .dashboard-search-input {
                    width: 100%;
                    padding: 0.5rem 0.75rem;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 0.875rem;
                }
                
                .dashboard-rows-selector select {
                    padding: 0.5rem 0.75rem;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 0.875rem;
                }
                
                .dashboard-table-wrapper {
                    width: 100%;
                    overflow-x: auto;
                    margin-bottom: 1.5rem;
                    border: 1px solid #e5e5e5;
                    border-radius: 4px;
                }
                
                .dashboard-table-responsive {
                    min-width: 800px;
                    width: 100%;
                }
                
                .dashboard-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.875rem;
                }
                
                .dashboard-table th {
                    padding: 0.75rem 1rem;
                    text-align: left;
                    background-color: #f8f9fa;
                    border-bottom: 1px solid #e5e5e5;
                    font-weight: 500;
                }
                
                .dashboard-table td {
                    padding: 0.75rem 1rem;
                    border-bottom: 1px solid #e5e5e5;
                    vertical-align: middle;
                }
                
                .dashboard-table tr:last-child td {
                    border-bottom: none;
                }
                
                .dashboard-table tr:hover {
                    background-color: #f8f9fa;
                }
                
                .dashboard-table-reason {
                    max-width: 200px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .dashboard-status-badge {
                    display: inline-block;
                    padding: 0.25rem 0.5rem;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 500;
                }
                
                .dashboard-status-badge.pending {
                    background-color: #fff3cd;
                    color: #856404;
                }
                
                .dashboard-status-badge.approved {
                    background-color: #d4edda;
                    color: #155724;
                }
                
                .dashboard-status-badge.rejected {
                    background-color: #f8d7da;
                    color: #721c24;
                }
                
                .dashboard-table-actions {
                    display: flex;
                    gap: 0.5rem;
                }
                
                .dashboard-action-btn {
                    width: 30px;
                    height: 30px;
                    border: none;
                    border-radius: 4px;
                    background: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.875rem;
                    transition: all 0.2s;
                }
                
                .dashboard-action-btn:hover {
                    opacity: 0.8;
                }
                
                .dashboard-action-btn.download {
                    border : 1px solid blue;
                }
                
                .dashboard-action-btn.delete {
                    border : 1px solid red;
                }
                
                .dashboard-pagination {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 1rem;
                    margin-top: 1rem;
                }
                
                .dashboard-pagination-btn {
                    padding: 0.5rem 1rem;
                    border: 1px solid #ddd;
                    background-color: white;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .dashboard-pagination-btn:hover:not(:disabled) {
                    background-color: #f8f9fa;
                }
                
                .dashboard-pagination-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                .dashboard-page-indicator {
                    font-size: 0.875rem;
                    color: #6c757d;
                }
                
                .dashboard-loading-state {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    gap: 0.75rem;
                    color: #6c757d;
                }
                
                .dashboard-loading-spinner {
                    width: 1.25rem;
                    height: 1.25rem;
                    border: 2px solid #ddd;
                    border-top-color: #6c757d;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                
                .dashboard-no-results {
                    padding: 2rem;
                    text-align: center;
                    color: #6c757d;
                    font-size: 0.9375rem;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
    </div>
  );
};

export default UserId;