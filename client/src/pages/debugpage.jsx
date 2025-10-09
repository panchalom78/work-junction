// Add this to your CustomerDashboard or create a separate debug component
// to test the API endpoints

import React, { useState } from 'react';

const DebugAPITest = () => {
  const [result, setResult] = useState(null);

  const testAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setResult({ endpoint: '/api/auth/me', status: response.status, data });
      } else {
        const text = await response.text();
        setResult({ endpoint: '/api/auth/me', status: response.status, contentType, text: text.substring(0, 200) });
      }
    } catch (error) {
      setResult({ endpoint: '/api/auth/me', error: error.message });
    }
  };

  const testSearch = async () => {
    try {
      const response = await fetch('/api/customer/search', {
        credentials: 'include',
      });
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setResult({ endpoint: '/api/customer/search', status: response.status, data });
      } else {
        const text = await response.text();
        setResult({ endpoint: '/api/customer/search', status: response.status, contentType, text: text.substring(0, 200) });
      }
    } catch (error) {
      setResult({ endpoint: '/api/customer/search', error: error.message });
    }
  };

  const testWorkers = async () => {
    try {
      const response = await fetch('/api/customer/workers', {
        credentials: 'include',
      });
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setResult({ endpoint: '/api/customer/workers', status: response.status, data });
      } else {
        const text = await response.text();
        setResult({ endpoint: '/api/customer/workers', status: response.status, contentType, text: text.substring(0, 200) });
      }
    } catch (error) {
      setResult({ endpoint: '/api/customer/workers', error: error.message });
    }
  };

  const checkCookies = () => {
    const cookies = document.cookie;
    setResult({ 
      type: 'cookies',
      cookies: cookies || 'No cookies found',
      parsed: cookies.split(';').map(c => c.trim())
    });
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-md z-50 max-h-96 overflow-auto">
      <h3 className="font-bold mb-2 text-sm">API Debug Panel</h3>
      <div className="flex flex-col gap-2 mb-3">
        <button
          onClick={checkCookies}
          className="px-3 py-2 bg-gray-500 text-white rounded text-xs"
        >
          Check Cookies
        </button>
        <button
          onClick={testAuth}
          className="px-3 py-2 bg-blue-500 text-white rounded text-xs"
        >
          Test Auth (/api/auth/me)
        </button>
        <button
          onClick={testSearch}
          className="px-3 py-2 bg-green-500 text-white rounded text-xs"
        >
          Test Search (/api/customer/search)
        </button>
        <button
          onClick={testWorkers}
          className="px-3 py-2 bg-purple-500 text-white rounded text-xs"
        >
          Test Workers (/api/customer/workers)
        </button>
      </div>
      {result && (
        <div className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-48">
          <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default DebugAPITest;