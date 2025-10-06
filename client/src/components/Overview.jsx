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
    <div className="space-y-8 p-6" style={{ backgroundColor: 'var(--bg-light)', color: 'var(--text-color)' }}>
      {/* Welcome Section */}
      <div className="dashboard-header" style={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', padding: '2rem', marginBottom: '1.5rem' }}>
        <h1 className="dashboard-title" style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-color)', margin: '0 0 0.25rem 0', lineHeight: '1.2' }}>Welcome back, {workerData.name}</h1>
        <p className="dashboard-subtitle" style={{ fontSize: 'var(--font-size-lg)', color: 'var(--text-muted)', fontWeight: 'var(--font-weight-regular)', margin: '0' }}>Here's your work overview for today.</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
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
          <div className="stat-card" style={{ backgroundColor: 'var(--surface-primary)', padding: '1.75rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)', transition: 'all var(--transition-normal)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-muted)' }}>Status</p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-2 h-2 bg-success-color rounded-full"></div>
                  <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--primary-color)' }}>Available for work</span>
                </div>
              </div>
              <div className="text-right">
                <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-muted)' }}>Upcoming Jobs</p>
                <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--primary-color)' }}>{workerData.upcomingJobs}</p>
              </div>
            </div>
          </div>

          {/* Earnings Chart */}
          <div className="chart-container" style={{ backgroundColor: 'var(--surface-primary)', padding: '2rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
            <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 className="chart-title" style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-color)', margin: '0' }}>Earnings Overview</h3>
              <TrendingUp className="w-5 h-5 text-success-color" />
            </div>
            
            <div className="flex items-end justify-between h-48 mt-8">
              {earningsData.map((item, index) => {
                const height = (item.amount / maxEarning) * 100;
                return (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div className="text-center mb-2">
                      <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-muted)' }}>₹{(item.amount / 1000).toFixed(0)}k</span>
                    </div>
                    <div
                      className="w-8 bg-primary-color rounded-t-lg transition-all duration-300 hover:bg-primary-hover cursor-pointer"
                      style={{ height: `${height}%` }}
                    ></div>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{item.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="card" style={{ backgroundColor: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
            <div className="card-header" style={{ padding: '1rem' }}>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--primary-color)', margin: '0' }}>Quick Actions</h3>
            </div>
            <div className="card-body" style={{ padding: '1rem' }}>
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
          </div>

          {/* Recent Bookings */}
          <div className="card" style={{ backgroundColor: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
            <div className="card-header" style={{ padding: '1rem' }}>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--primary-color)', margin: '0' }}>Recent Bookings</h3>
            </div>
            <div className="card-body" style={{ padding: '1rem' }}>
              <div className="space-y-4">
                {bookings.slice(0, 3).map((booking) => (
                  <div key={booking.id} className="flex items-start space-x-3 p-3 border border-border-color rounded-lg hover:bg-surface-secondary transition-colors" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--surface-secondary)' }}>
                    <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--primary-light)' }}>
                      <User className="w-5 h-5 text-primary-color" style={{ color: 'var(--primary-color)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--primary-color)' }}>{booking.customer}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${booking.status === 'confirmed' ? 'bg-success-light text-success-color' : 'bg-warning-light text-warning-color'}`} style={{ backgroundColor: booking.status === 'confirmed' ? 'var(--success-light)' : 'var(--warning-light)', color: booking.status === 'confirmed' ? 'var(--success-color)' : 'var(--warning-color)' }}>
                          {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                        </span>
                      </div>
                      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{booking.service}</p>
                      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-light)', marginTop: '0.25rem' }}>{booking.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;