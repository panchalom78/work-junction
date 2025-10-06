import React, { useState, useEffect } from 'react';

// Dummy data simulating different verification states
const verificationStates = {
  unverified: {
    status: 'Unverified',
    description: 'Please upload required documents to start verification',
    icon: '⏳',
    color: 'gray',
    actions: ['upload_documents'],
    history: []
  },
  pending: {
    status: 'Pending Review',
    description: 'Your documents are under review by our verification team',
    icon: '🔍',
    color: 'purple',
    actions: ['view_details'],
    history: [
      {
        action: 'Documents Uploaded',
        timestamp: '2024-01-15T10:30:00Z',
        by: 'You',
        details: 'All required documents submitted'
      }
    ]
  },
  verified: {
    status: 'Verified',
    description: 'Your account has been successfully verified',
    icon: '✅',
    color: 'green',
    actions: ['view_certificate'],
    history: [
      {
        action: 'Documents Uploaded',
        timestamp: '2024-01-15T10:30:00Z',
        by: 'You',
        details: 'All required documents submitted'
      },
      {
        action: 'Verification Approved',
        timestamp: '2024-01-16T14:20:00Z',
        by: 'Priya Sharma (Verification Agent)',
        details: 'All documents verified successfully',
        approverId: 'agent_001',
        approvalTimestamp: '2024-01-16T14:20:00Z'
      }
    ],
    verifiedAt: '2024-01-16T14:20:00Z',
    approvedBy: 'Priya Sharma'
  },
  rejected: {
    status: 'Rejected',
    description: 'Your verification request requires additional information',
    icon: '❌',
    color: 'red',
    actions: ['resubmit'],
    history: [
      {
        action: 'Documents Uploaded',
        timestamp: '2024-01-15T10:30:00Z',
        by: 'You',
        details: 'All required documents submitted'
      },
      {
        action: 'Verification Rejected',
        timestamp: '2024-01-16T14:20:00Z',
        by: 'Priya Sharma (Verification Agent)',
        details: 'Aadhaar card image is unclear',
        rejectionReason: 'Aadhaar card image is blurry and details are not readable. Please upload a clear, high-resolution image.'
      }
    ],
    rejectedAt: '2024-01-16T14:20:00Z',
    rejectedBy: 'Priya Sharma',
    rejectionReason: 'Aadhaar card image is blurry and details are not readable. Please upload a clear, high-resolution image.'
  }
};

const WorkerVerificationPage = () => {
  const [currentStatus, setCurrentStatus] = useState('unverified');
  const [showRejectionDetails, setShowRejectionDetails] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState({
    aadhaar: null,
    selfie: null,
    policeVerification: null
  });

  const statusData = verificationStates[currentStatus];

  const getStatusColor = (color) => {
    const colors = {
      green: 'bg-green-100 text-green-800 border-green-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[color] || colors.gray;
  };

  const getStatusSteps = () => {
    const steps = [
      { id: 1, name: 'Document Upload', status: 'complete' },
      { id: 2, name: 'Under Review', status: currentStatus === 'unverified' ? 'pending' : 
                                        ['pending', 'verified', 'rejected'].includes(currentStatus) ? 'complete' : 'current' },
      { id: 3, name: 'Verification Complete', status: currentStatus === 'verified' ? 'complete' : 
                                                currentStatus === 'rejected' ? 'error' : 'pending' }
    ];
    
    // Adjust steps based on current status
    if (currentStatus === 'unverified') {
      steps[0].status = 'current';
      steps[1].status = 'pending';
      steps[2].status = 'pending';
    } else if (currentStatus === 'pending') {
      steps[0].status = 'complete';
      steps[1].status = 'current';
      steps[2].status = 'pending';
    } else if (currentStatus === 'verified') {
      steps[0].status = 'complete';
      steps[1].status = 'complete';
      steps[2].status = 'complete';
    } else if (currentStatus === 'rejected') {
      steps[0].status = 'complete';
      steps[1].status = 'complete';
      steps[2].status = 'error';
    }
    
    return steps;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDocumentUpload = (documentType, file) => {
    setUploadedDocuments(prev => ({
      ...prev,
      [documentType]: file
    }));
  };

  const handleSubmitDocuments = () => {
    // Simulate document submission
    const allDocumentsUploaded = uploadedDocuments.aadhaar && uploadedDocuments.selfie;
    
    if (allDocumentsUploaded) {
      setCurrentStatus('pending');
      setShowUploadModal(false);
      // Here you would typically make an API call to submit the documents
    } else {
      alert('Please upload both Aadhaar Card and Live Selfie documents');
    }
  };

  const StatusStep = ({ step, isLast }) => {
    const getStepColor = (status) => {
      switch (status) {
        case 'complete': return 'bg-purple-500';
        case 'current': return 'bg-purple-300';
        case 'error': return 'bg-red-500';
        default: return 'bg-gray-300';
      }
    };

    const getTextColor = (status) => {
      switch (status) {
        case 'complete': return 'text-purple-600';
        case 'current': return 'text-purple-700';
        case 'error': return 'text-red-600';
        default: return 'text-gray-500';
      }
    };

    return (
      <div className="flex items-center flex-1">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStepColor(step.status)} text-white font-semibold`}>
          {step.status === 'complete' ? '✓' : step.status === 'error' ? '✕' : step.id}
        </div>
        <div className="ml-3 flex-1 min-w-0">
          <div className={`text-sm font-medium ${getTextColor(step.status)}`}>
            {step.name}
          </div>
        </div>
        {!isLast && (
          <div className={`flex-1 h-1 mx-4 ${
            step.status === 'complete' ? 'bg-purple-500' : 'bg-gray-200'
          }`} />
        )}
      </div>
    );
  };

  const DocumentUploadModal = () => {
    const DocumentUploadField = ({ title, description, required, documentType, accept = "image/*,.pdf" }) => (
      <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300 hover:border-purple-400 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h4 className="font-semibold text-gray-900">{title} {required && <span className="text-red-500">*</span>}</h4>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
          {uploadedDocuments[documentType] && (
            <span className="text-green-600 text-sm font-medium">✓ Uploaded</span>
          )}
        </div>
        <input
          type="file"
          accept={accept}
          onChange={(e) => handleDocumentUpload(documentType, e.target.files[0])}
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
        />
        {uploadedDocuments[documentType] && (
          <p className="text-sm text-gray-600 mt-2">
            Selected: {uploadedDocuments[documentType].name}
          </p>
        )}
      </div>
    );

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Upload Verification Documents</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <p className="text-gray-600 mt-2">Please upload the required documents for identity verification</p>
          </div>

          <div className="p-6 space-y-6">
            <DocumentUploadField
              title="Aadhaar Card"
              description="Front and back copy of your Aadhaar card"
              required={true}
              documentType="aadhaar"
            />

            <DocumentUploadField
              title="Live Selfie"
              description="Recent photo of yourself for identity matching"
              required={true}
              documentType="selfie"
              accept="image/*"
            />

            <DocumentUploadField
              title="Police Verification Certificate (Optional)"
              description="Police verification certificate if available"
              required={false}
              documentType="policeVerification"
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <span className="text-blue-600 text-lg">ℹ️</span>
                <div>
                  <h4 className="font-semibold text-blue-900">Document Requirements</h4>
                  <ul className="text-sm text-blue-800 mt-2 space-y-1">
                    <li>• All documents must be clear and readable</li>
                    <li>• File size should not exceed 5MB per document</li>
                    <li>• Accepted formats: JPG, PNG, PDF</li>
                    <li>• Aadhaar card should show full details clearly</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <div className="flex space-x-4">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 bg-white text-gray-700 border-2 border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitDocuments}
                className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-transform"
              >
                Submit for Verification
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-purple-600">🔒</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Identity Verification</h1>
          <p className="text-lg text-purple-600 font-medium">Track your verification status</p>
        </div>

        {/* Main Status Card */}
        <div className="bg-white rounded-2xl shadow-lg border-0 p-8 mb-8 transform hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                currentStatus === 'verified' ? 'bg-green-100' :
                currentStatus === 'pending' ? 'bg-purple-100' :
                currentStatus === 'rejected' ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                <span className="text-2xl">{statusData.icon}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Verification Status</h2>
                <p className="text-gray-600 mt-1">{statusData.description}</p>
              </div>
            </div>
            <span className={`px-6 py-3 rounded-full font-semibold border-2 ${getStatusColor(statusData.color)}`}>
              {statusData.status.toUpperCase()}
            </span>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Verification Progress</h3>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusSteps().map((step, index) => (
                <StatusStep key={step.id} step={step} isLast={index === getStatusSteps().length - 1} />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            {statusData.actions.includes('upload_documents') && (
              <button 
                onClick={() => setShowUploadModal(true)}
                className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-transform"
              >
                📁 Upload Documents
              </button>
            )}
            {statusData.actions.includes('resubmit') && (
              <button 
                onClick={() => setShowUploadModal(true)}
                className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-transform"
              >
                🔄 Resubmit Documents
              </button>
            )}
            {statusData.actions.includes('view_details') && (
              <button className="bg-white text-purple-600 border-2 border-purple-200 px-8 py-3 rounded-lg hover:bg-purple-50 transition-colors font-semibold">
                👁️ View Details
              </button>
            )}
            {statusData.actions.includes('view_certificate') && (
              <button className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-transform">
                📄 Download Certificate
              </button>
            )}
          </div>
        </div>

        {/* Status-specific Cards */}
        {currentStatus === 'verified' && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-100 border border-green-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl text-green-600">🎉</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-900">Verification Successful!</h3>
                <p className="text-green-700">Your account is now fully verified and active</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <span className="font-semibold text-green-800">Verified On:</span>
                <p className="text-green-700">{formatDate(statusData.verifiedAt)}</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <span className="font-semibold text-green-800">Approved By:</span>
                <p className="text-green-700">{statusData.approvedBy}</p>
              </div>
            </div>
          </div>
        )}

        {currentStatus === 'pending' && (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-100 border border-purple-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl text-purple-600">⏳</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-purple-900">Under Review</h3>
                <p className="text-purple-700">Your documents are being verified by our team</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-purple-800 font-medium">
                Estimated completion: <span className="text-purple-600">24-48 hours</span>
              </p>
            </div>
          </div>
        )}

        {currentStatus === 'rejected' && (
          <div className="bg-gradient-to-r from-red-50 to-pink-100 border border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl text-red-600">⚠️</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-900">Verification Required</h3>
                  <p className="text-red-700">Additional information needed</p>
                </div>
              </div>
              <button 
                onClick={() => setShowRejectionDetails(!showRejectionDetails)}
                className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors font-medium"
              >
                {showRejectionDetails ? 'Hide Details' : 'View Details'}
              </button>
            </div>
            
            {showRejectionDetails && (
              <div className="space-y-4 bg-white rounded-lg p-4 shadow-sm">
                <div>
                  <span className="font-semibold text-red-800">Rejection Reason:</span>
                  <p className="text-red-700 mt-2 p-3 bg-red-50 rounded-lg">{statusData.rejectionReason}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-red-50 rounded-lg p-3">
                    <span className="font-semibold text-red-800">Rejected On:</span>
                    <p className="text-red-700">{formatDate(statusData.rejectedAt)}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3">
                    <span className="font-semibold text-red-800">Reviewed By:</span>
                    <p className="text-red-700">{statusData.rejectedBy}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Activity Timeline */}
        <div className="bg-white rounded-2xl shadow-lg border-0 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600">📋</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Verification Timeline</h3>
          </div>
          
          <div className="space-y-6">
            {statusData.history.length > 0 ? (
              statusData.history.map((event, index) => (
                <div key={index} className="flex space-x-4 relative">
                  <div className="flex flex-col items-center">
                    <div className={`w-4 h-4 rounded-full ${
                      event.action.includes('Rejected') ? 'bg-red-500' :
                      event.action.includes('Approved') ? 'bg-green-500' : 'bg-purple-500'
                    }`}></div>
                    {index < statusData.history.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 mt-2 absolute top-4 left-2"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-gray-900 text-lg">{event.action}</span>
                      <span className="text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                        {formatDate(event.timestamp)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">By: {event.by}</p>
                    {event.details && (
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{event.details}</p>
                    )}
                    {event.rejectionReason && (
                      <p className="text-red-600 bg-red-50 p-3 rounded-lg mt-2">{event.rejectionReason}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-gray-400">📝</span>
                </div>
                <p className="text-gray-500">No verification activity yet</p>
                <p className="text-gray-400 text-sm mt-1">Start by uploading your documents</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document Upload Modal */}
      {showUploadModal && <DocumentUploadModal />}
    </div>
  );
};

export default WorkerVerificationPage;