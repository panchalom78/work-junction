// components/CreateCustomerRequest.js
import React, { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-hot-toast';

const CreateCustomerRequest = ({ onSuccess }) => {
  const [form, setForm] = useState({
    name: '', phone: '', houseNo: '', street: '', area: '', city: '', state: '', pincode: '',
    serviceId: '', skillId: '', price: 0, date: '', time: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axiosInstance.post('/api/service-agent/customer-request', form);
      if (data.success) {
        toast.success('Request created');
        onSuccess?.();
      }
    } catch (error) {
      toast.error('Failed');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Customer Request</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full p-3 border rounded-lg" required />
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="House No" value={form.houseNo} onChange={e => setForm({ ...form, houseNo: e.target.value })} className="p-3 border rounded-lg" />
          <input placeholder="Street" value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} className="p-3 border rounded-lg" />
          <input placeholder="Area" value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} className="p-3 border rounded-lg" />
          <input placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="p-3 border rounded-lg" />
          <input placeholder="State" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className="p-3 border rounded-lg" />
          <input placeholder="Pincode" value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} className="p-3 border rounded-lg" />
        </div>
        <input placeholder="Service ID" value={form.serviceId} onChange={e => setForm({ ...form, serviceId: e.target.value })} className="w-full p-3 border rounded-lg" />
        <input placeholder="Skill ID" value={form.skillId} onChange={e => setForm({ ...form, skillId: e.target.value })} className="w-full p-3 border rounded-lg" />
        <input type="number" placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: +e.target.value })} className="w-full p-3 border rounded-lg" />
        <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full p-3 border rounded-lg" />
        <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className="w-full p-3 border rounded-lg" />
        <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create Request</button>
      </form>
    </div>
  );
};

export default CreateCustomerRequest;