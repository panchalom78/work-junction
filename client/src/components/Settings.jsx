import React from 'react';
import { Globe, Bell, Shield, CreditCard, User, Mail, Phone, MapPin } from 'lucide-react';

const Settings = ({ language, onSetLanguage, languages }) => {
  const SettingSection = ({ title, icon: Icon, children, description }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );

  const LanguageOption = ({ lang, isSelected, onClick }) => (
    <button
      onClick={() => onClick(lang.code)}
      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold text-gray-900">{lang.name}</div>
          <div className="text-sm text-gray-600 mt-1">{lang.native}</div>
        </div>
        {isSelected && (
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        )}
      </div>
    </button>
  );

  const ToggleSwitch = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <label className="font-medium text-gray-900">{label}</label>
        {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          enabled ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-600 mt-1">Manage your account preferences and settings</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  defaultValue="Rajesh Kumar"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  defaultValue="rajesh.kumar@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  defaultValue="+91 98765 43210"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  defaultValue="Mumbai, Maharashtra"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <button className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
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
              <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">Change Password</div>
                <div className="text-sm text-gray-600 mt-1">Update your account password</div>
              </button>
              <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">Two-Factor Authentication</div>
                <div className="text-sm text-gray-600 mt-1">Add an extra layer of security</div>
              </button>
              <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">Login Activity</div>
                <div className="text-sm text-gray-600 mt-1">Review recent account activity</div>
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
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900">Primary Payment Method</div>
                <div className="text-sm text-gray-600 mt-1">UPI: rajesh.kumar@okicici</div>
              </div>
              <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">Add Bank Account</div>
                <div className="text-sm text-gray-600 mt-1">Link your bank account for payouts</div>
              </button>
              <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">Payout Schedule</div>
                <div className="text-sm text-gray-600 mt-1">Set how often you receive payments</div>
              </button>
            </div>
          </SettingSection>

          {/* Quick Actions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h4 className="font-semibold text-blue-900 mb-2">Need Help?</h4>
            <p className="text-blue-700 text-sm mb-4">Our support team is here to help you</p>
            <div className="space-y-2">
              <button className="w-full text-left p-3 bg-white rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                <div className="font-medium text-blue-900">Contact Support</div>
              </button>
              <button className="w-full text-left p-3 bg-white rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                <div className="font-medium text-blue-900">View Help Center</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;