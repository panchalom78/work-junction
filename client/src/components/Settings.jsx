import React from 'react';
import { Globe, Bell, Shield, CreditCard, User, Mail, Phone, MapPin } from 'lucide-react';

const Settings = ({ language, onSetLanguage, languages }) => {
  const SettingSection = ({ title, icon: Icon, children, description }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100" style={{ backgroundColor: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg" style={{ backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-md)' }}>
          <Icon className="w-5 h-5 text-blue-600" style={{ color: 'var(--primary-color)' }} />
        </div>
        <div>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-color)', margin: '0' }}>{title}</h3>
          {description && <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );

  const LanguageOption = ({ lang, isSelected, onClick }) => (
    <button
      onClick={() => onClick(lang.code)}
      style={{
        width: '100%',
        padding: '1rem',
        borderRadius: 'var(--radius-md)',
        border: '2px solid',
        borderColor: isSelected ? 'var(--primary-color)' : 'var(--border-color)',
        backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--surface-primary)',
        textAlign: 'left',
        transition: 'all var(--transition-normal)'
      }}
      onMouseOver={e => { if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--surface-secondary)'; }}
      onMouseOut={e => { if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--surface-primary)'; }}
    >
      <div className="flex items-center justify-between">
        <div>
          <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-color)' }}>{lang.name}</div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{lang.native}</div>
        </div>
        {isSelected && (
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--primary-color)' }}>
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        )}
      </div>
    </button>
  );

  const ToggleSwitch = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between py-3" style={{ padding: '0.75rem 0' }}>
      <div className="flex-1">
        <label style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-color)' }}>{label}</label>
        {description && <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        style={{
          position: 'relative',
          display: 'inline-flex',
          height: '1.5rem',
          width: '2.75rem',
          flexShrink: '0',
          cursor: 'pointer',
          borderRadius: '9999px',
          border: '2px solid transparent',
          transition: 'background-color var(--transition-normal)',
          backgroundColor: enabled ? 'var(--primary-color)' : 'var(--border-color)'
        }}
        onMouseOver={e => { if (!enabled) e.currentTarget.style.backgroundColor = 'var(--surface-secondary)'; }}
        onMouseOut={e => { if (!enabled) e.currentTarget.style.backgroundColor = 'var(--border-color)'; }}
      >
        <span
          style={{
            pointerEvents: 'none',
            display: 'inline-block',
            height: '1.25rem',
            width: '1.25rem',
            transform: enabled ? 'translateX(1.25rem)' : 'translateX(0)',
            borderRadius: '9999px',
            backgroundColor: 'white',
            boxShadow: 'var(--shadow-sm)',
            transition: 'transform var(--transition-normal)'
          }}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-6" style={{ backgroundColor: 'var(--bg-light)', color: 'var(--text-color)' }}>
      <div style={{ padding: '1rem' }}>
        <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-color)', margin: '0 0 0.25rem 0' }}>Settings</h2>
        <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-muted)', margin: '0' }}>Manage your account preferences and settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Language Preferences */}
          <SettingSection
            title="Language Preferences"
            icon={Globe}
            description="Choose your preferred language for the interface"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {languages.map(lang => (
                <LanguageOption
                  key={lang.code}
                  lang={lang}
                  isSelected={language === lang.code}
                  onClick={onSetLanguage}
                />
              ))}
            </div>
          </SettingSection>

          {/* Notification Settings */}
          <SettingSection
            title="Notification Preferences"
            icon={Bell}
            description="Control how and when you receive notifications"
          >
            <div className="space-y-1">
              <ToggleSwitch
                enabled={true}
                onChange={() => {}}
                label="Booking Requests"
                description="Get notified when new booking requests arrive"
              />
              <ToggleSwitch
                enabled={true}
                onChange={() => {}}
                label="Booking Reminders"
                description="Receive reminders for upcoming appointments"
              />
              <ToggleSwitch
                enabled={false}
                onChange={() => {}}
                label="Marketing Emails"
                description="Receive updates about new features and promotions"
              />
              <ToggleSwitch
                enabled={true}
                onChange={() => {}}
                label="SMS Notifications"
                description="Get important updates via SMS"
              />
            </div>
          </SettingSection>

          {/* Profile Information */}
          <SettingSection
            title="Profile Information"
            icon={User}
            description="Update your personal and professional details"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-color)', marginBottom: '0.5rem', display: 'block' }}>Full Name</label>
                <input
                  type="text"
                  defaultValue="Rajesh Kumar"
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', outline: 'none', transition: 'border-color var(--transition-normal)' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                />
              </div>
              <div>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-color)', marginBottom: '0.5rem', display: 'block' }}>Email</label>
                <input
                  type="email"
                  defaultValue="rajesh.kumar@example.com"
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', outline: 'none', transition: 'border-color var(--transition-normal)' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                />
              </div>
              <div>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-color)', marginBottom: '0.5rem', display: 'block' }}>Phone</label>
                <input
                  type="tel"
                  defaultValue="+91 98765 43210"
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', outline: 'none', transition: 'border-color var(--transition-normal)' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                />
              </div>
              <div>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-color)', marginBottom: '0.5rem', display: 'block' }}>Location</label>
                <input
                  type="text"
                  defaultValue="Mumbai, Maharashtra"
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', outline: 'none', transition: 'border-color var(--transition-normal)' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                />
              </div>
            </div>
            <button style={{ background: 'var(--primary-gradient)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 'var(--font-weight-medium)', marginTop: '1rem', transition: 'all var(--transition-normal)' }}
              onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(135deg, #6D28D9 0%, #A855F7 100%)'}
              onMouseOut={e => e.currentTarget.style.background = 'var(--primary-gradient)'}
            >
              Update Profile
            </button>
          </SettingSection>
        </div>

        <div className="space-y-6">
          {/* Account Security */}
          <SettingSection
            title="Account Security"
            icon={Shield}
            description="Manage your account security settings"
          >
            <div className="space-y-3">
              <button style={{ width: '100%', textAlign: 'left', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface-primary)', transition: 'background-color var(--transition-normal)' }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--surface-secondary)'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--surface-primary)'}
              >
                <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-color)' }}>Change Password</div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Update your account password</div>
              </button>
              <button style={{ width: '100%', textAlign: 'left', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface-primary)', transition: 'background-color var(--transition-normal)' }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--surface-secondary)'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--surface-primary)'}
              >
                <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-color)' }}>Two-Factor Authentication</div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Add an extra layer of security</div>
              </button>
              <button style={{ width: '100%', textAlign: 'left', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface-primary)', transition: 'background-color var(--transition-normal)' }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--surface-secondary)'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--surface-primary)'}
              >
                <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-color)' }}>Login Activity</div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Review recent account activity</div>
              </button>
            </div>
          </SettingSection>

          {/* Payment Settings */}
          <SettingSection
            title="Payment & Payouts"
            icon={CreditCard}
            description="Manage how you receive payments"
          >
            <div className="space-y-3">
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-color)' }}>Primary Payment Method</div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>UPI: rajesh.kumar@okicici</div>
              </div>
              <button style={{ width: '100%', textAlign: 'left', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface-primary)', transition: 'background-color var(--transition-normal)' }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--surface-secondary)'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--surface-primary)'}
              >
                <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-color)' }}>Add Bank Account</div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Link your bank account for payouts</div>
              </button>
              <button style={{ width: '100%', textAlign: 'left', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface-primary)', transition: 'background-color var(--transition-normal)' }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--surface-secondary)'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--surface-primary)'}
              >
                <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-color)' }}>Payout Schedule</div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Set how often you receive payments</div>
              </button>
            </div>
          </SettingSection>

          {/* Quick Actions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6" style={{ backgroundColor: 'var(--primary-light)', border: '1px solid var(--primary-200)', borderRadius: 'var(--radius-xl)', padding: '1.5rem' }}>
            <h4 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>Need Help?</h4>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--primary-color)', marginBottom: '1rem' }}>Our support team is here to help you</p>
            <div className="space-y-2">
              <button style={{ width: '100%', textAlign: 'left', padding: '0.75rem', backgroundColor: 'var(--surface-primary)', border: '1px solid var(--primary-200)', borderRadius: 'var(--radius-md)', transition: 'background-color var(--transition-normal)' }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--primary-light)'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--surface-primary)'}
              >
                <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--primary-color)' }}>Contact Support</div>
              </button>
              <button style={{ width: '100%', textAlign: 'left', padding: '0.75rem', backgroundColor: 'var(--surface-primary)', border: '1px solid var(--primary-200)', borderRadius: 'var(--radius-md)', transition: 'background-color var(--transition-normal)' }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--primary-light)'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--surface-primary)'}
              >
                <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--primary-color)' }}>View Help Center</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;