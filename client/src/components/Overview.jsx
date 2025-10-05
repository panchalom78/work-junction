import React from 'react';
import { TrendingUp } from 'lucide-react';
import StatsCard from './StatsCard';
import QuickAction from './QuickAction';
import { DollarSign, CheckCircle, Star, Clock, User, Plus } from 'lucide-react';

const Overview = ({ 
  workerData, 
  earningsData, 
  bookings, 
  onShowServiceModal, 
  onSetActiveTab 
}) => {
  const maxEarning = Math.max(...earningsData.map(item => item.amount));

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {workerData.name}</h1>
        <p className="text-gray-600 mt-1">Here's your work overview for today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard 
          icon={DollarSign} 
          label="Total Earnings" 
          value={`₹${workerData.earnings}`}
          color="green"
        />
        <StatsCard 
          icon={CheckCircle} 
          label="Completed Jobs" 
          value={workerData.completedJobs}
          color="blue"
        />
        <StatsCard 
          icon={Star} 
          label="Average Rating" 
          value={workerData.rating}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Status Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-lg font-semibold text-gray-900">Available for work</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">Upcoming Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{workerData.upcomingJobs}</p>
              </div>
            </div>
          </div>

          {/* Earnings Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Earnings Overview</h3>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            
            <div className="flex items-end justify-between h-48 mt-8">
              {earningsData.map((item, index) => {
                const height = (item.amount / maxEarning) * 100;
                return (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div className="text-center mb-2">
                      <span className="text-sm font-medium text-gray-600">₹{(item.amount / 1000).toFixed(0)}k</span>
                    </div>
                    <div
                      className="w-8 bg-blue-500 rounded-t-lg transition-all duration-300 hover:bg-blue-600"
                      style={{ height: `${height}%` }}
                    ></div>
                    <span className="text-xs text-gray-500 mt-2">{item.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <QuickAction 
                icon={Clock} 
                label="Create Emergency Slot" 
                onClick={() => onSetActiveTab('availability')}
                color="orange"
              />
              <QuickAction 
                icon={User} 
                label="Update Work Profile" 
                onClick={() => onSetActiveTab('services')}
                color="blue"
              />
              <QuickAction 
                icon={Plus} 
                label="Add New Service" 
                onClick={onShowServiceModal}
                color="green"
              />
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h3>
            <div className="space-y-4">
              {bookings.slice(0, 3).map((booking) => (
                <div key={booking.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900">{booking.customer}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        booking.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{booking.service}</p>
                    <p className="text-xs text-gray-500 mt-1">{booking.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;