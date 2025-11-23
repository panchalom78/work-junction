import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'; // Add this
import VerificationTab from './tabs/VerificationTab';

const CreateWorkerProfile = () => {
  const navigate = useNavigate(); // Add this

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    address: {
      houseNo: '',
      street: '',
      area: '',
      city: '',
      state: '',
      pincode: '',
    },
    workType: '',
    selectedSkills: [],
    selectedServices: [],
    bankDetails: {
      accountNumber: '',
      accountHolderName: '',
      IFSCCode: '',
      bankName: '',
    },
    verification: {
      documents: {
        selfie: null,
        aadhar: null,
        policeVerification: null,
      },
    },
  });

  const [loading, setLoading] = useState(false);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [imagePreview, setImagePreview] = useState(null);
  const [skillsList, setSkillsList] = useState([]);
  const [selectedSkillServices, setSelectedSkillServices] = useState([]);
  const [createdWorkerId, setCreatedWorkerId] = useState(null);
  const [workerCreated, setWorkerCreated] = useState(false);
  const [serviceDetails, setServiceDetails] = useState({});
  const [activeView, setActiveView] = useState('workers');

  // Fetch skills
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const { data } = await axiosInstance.get('/api/skills');
        if (data.success) setSkillsList(data.data);
      } catch {
        toast.error('Failed to fetch skills');
      }
    };
    fetchSkills();
  }, []);

  // Update services on skill change
  useEffect(() => {
    if (formData.selectedSkills.length > 0) {
      const services = [];
      formData.selectedSkills.forEach(skillId => {
        const skill = skillsList.find(s => s._id === skillId);
        if (skill?.services) {
          skill.services.forEach(service => {
            services.push({ ...service, skillId: skill._id, skillName: skill.name });
          });
        }
      });
      setSelectedSkillServices(services);
    } else {
      setSelectedSkillServices([]);
    }
  }, [formData.selectedSkills, skillsList]);

  // Handlers (unchanged logic)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const keys = name.split('.');
    if (keys.length === 2) {
      setFormData(prev => ({
        ...prev,
        [keys[0]]: { ...prev[keys[0]], [keys[1]]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleServiceDetailsChange = (serviceId, field, value) => {
    setServiceDetails(prev => ({
      ...prev,
      [serviceId]: { ...prev[serviceId], [field]: value }
    }));
  };

  const handleSkillChange = (skillId) => {
    setFormData(prev => {
      const isSelected = prev.selectedSkills.includes(skillId);
      if (isSelected) {
        const updatedSkills = prev.selectedSkills.filter(id => id !== skillId);
        const updatedServices = prev.selectedServices.filter(s => s.skillId !== skillId);
        const updatedDetails = { ...serviceDetails };
        selectedSkillServices
          .filter(s => s.skillId === skillId)
          .forEach(s => delete updatedDetails[s.serviceId]);
        setServiceDetails(updatedDetails);
        return { ...prev, selectedSkills: updatedSkills, selectedServices: updatedServices };
      } else {
        return { ...prev, selectedSkills: [...prev.selectedSkills, skillId] };
      }
    });
  };

  // In your handleServiceChange function, modify the service object:
  const handleServiceChange = (service) => {
    setFormData(prev => {
      const isSelected = prev.selectedServices.some(s => s.serviceId === service.serviceId);
      if (isSelected) {
        const updatedDetails = { ...serviceDetails };
        delete updatedDetails[service.serviceId];
        setServiceDetails(updatedDetails);
        return {
          ...prev,
          selectedServices: prev.selectedServices.filter(s => s.serviceId !== service.serviceId)
        };
      } else {
        setServiceDetails(prev => ({
          ...prev,
          [service.serviceId]: { details: '', pricingType: 'fixed', price: '' }
        }));
        return {
          ...prev,
          selectedServices: [...prev.selectedServices, {
            serviceId: service.serviceId, // Ensure this is the service ID
            skillId: service.skillId
          }]
        };
      }
    });
  };

  const selectAllServicesForSkill = (skillId) => {
    const skillServices = selectedSkillServices.filter(s => s.skillId === skillId);
    setFormData(prev => ({
      ...prev,
      selectedServices: [
        ...prev.selectedServices.filter(s => s.skillId !== skillId),
        ...skillServices
      ]
    }));
    const newDetails = { ...serviceDetails };
    skillServices.forEach(s => {
      if (!newDetails[s.serviceId]) {
        newDetails[s.serviceId] = { details: '', pricingType: 'fixed', price: '' };
      }
    });
    setServiceDetails(newDetails);
  };

  const deselectAllServicesForSkill = (skillId) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.filter(s => s.skillId !== skillId)
    }));
    const updated = { ...serviceDetails };
    selectedSkillServices
      .filter(s => s.skillId === skillId)
      .forEach(s => delete updated[s.serviceId]);
    setServiceDetails(updated);
  };

  const handleFileUpload = (file, field) => {
    setFormData(prev => ({
      ...prev,
      verification: {
        ...prev.verification,
        documents: { ...prev.verification.documents, [field]: file }
      }
    }));
    if (field === 'selfie') setImagePreview(URL.createObjectURL(file));
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Name required';
      if (!formData.phone.match(/^[0-9]{10}$/)) newErrors.phone = 'Valid 10-digit phone';
      if (!formData.password || formData.password.length < 6) newErrors.password = 'Min 6 chars';
      if (!formData.address.city) newErrors['address.city'] = 'City required';
      if (!formData.address.pincode) newErrors['address.pincode'] = 'Pincode required';
    }
    if (step === 2) {
      if (formData.selectedSkills.length === 0) newErrors.skills = 'Select at least one skill';
      if (formData.selectedServices.length === 0) newErrors.services = 'Select at least one service';
    }
    if (step === 3) {
      if (!formData.bankDetails.accountNumber) newErrors.accountNumber = 'Required';
      if (!formData.bankDetails.accountHolderName) newErrors.accountHolderName = 'Required';
      if (!formData.bankDetails.IFSCCode) newErrors.IFSCCode = 'Required';
      if (!formData.bankDetails.bankName) newErrors.bankName = 'Required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateDocumentForm = () => {
    const newErrors = {};
    if (!formData.verification.documents.selfie) newErrors.selfie = 'Selfie required';
    if (!formData.verification.documents.aadhar) newErrors.aadhar = 'Aadhaar required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveBasicInformation = async () => {
    if (!validateStep(1)) return;
    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/api/service-agent/create-worker', {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        password: formData.password,
        address: formData.address,
        selectedSkills: formData.selectedSkills, // ✅ Correct field name
        selectedServices: formData.selectedServices.map(s => s.serviceId), // Send service IDs only
        bankDetails: formData.bankDetails,
        createdByAgent: true,
      });
      console.log('Create Worker Response:', data);
      if (!data.success) throw new Error(data.message);
      setCreatedWorkerId(data.data.workerId || data.data._id);
      toast.success('Basic info saved');
      setCurrentStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed');
      console.error('Error creating worker:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSkillsAndServices = async () => {
    if (!validateStep(2) || !createdWorkerId) return;
    setLoading(true);
    try {
      // In your saveSkillsAndServices function
      const servicesData = formData.selectedServices.map(s => {
        const detail = serviceDetails[s.serviceId] || {};
        return {
          skillId: s.skillId,
          serviceId: s.serviceId,
          details: detail.details || '',
          pricingType: (detail.pricingType || 'fixed').toUpperCase(),
          price: parseFloat(detail.price) || 0,
          estimatedDuration: detail.estimatedDuration || 60, // Default to 60 mins if not provided
        };
      });

      const { data } = await axiosInstance.post(
        `/api/service-agent/addSkillService/${createdWorkerId}`,
        {
          services: servicesData,
          workType: formData.workType,
          dailyAvailability: formData.dailyAvailability
        }
      );

      if (!data.success) throw new Error(data.message);
      toast.success('Skills & services saved');
      setCurrentStep(3);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed');
      console.error('Error saving skills and services:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveBankDetails = async () => {
    if (!validateStep(3) || !createdWorkerId) return;
    setLoading(true);
    try {
      const { data } = await axiosInstance.post(
        `/api/service-agent/workers/${createdWorkerId}/bank-details`,
        formData.bankDetails
      );
      if (!data.success) throw new Error(data.message);
      setWorkerCreated(true);
      toast.success('Bank details saved');
      setCurrentStep(4);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  const uploadDocuments = async () => {
    if (!validateDocumentForm() || !createdWorkerId) return;
    setDocumentLoading(true);
    const form = new FormData();
    Object.entries(formData.verification.documents).forEach(([key, file]) => {
      if (file) form.append(key, file);
    });

    try {
      const { data } = await axiosInstance.post(
        `/api/service-agent/upload-documents/${createdWorkerId}`,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      if (!data.success) throw new Error(data.message);
      toast.success('Documents uploaded!');
      navigate(-1); // Go back to previous page
    } catch (error) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setDocumentLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Basic' },
    { number: 2, title: 'Skills' },
    { number: 3, title: 'Bank' },
    { number: 4, title: 'Docs' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
     

      <div className="max-w-3xl mx-auto p-4 pb-20">
        {/* TITLE */}
      

        {/* PROGRESS BAR */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, i) => (
            <div key={step.number} className="flex items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${currentStep >= step.number
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-500'
                  }`}
              >
                {step.number}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 transition-all ${currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 space-y-5">
          {/* STEP 1 */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-800">Basic Info</h3>
              <div className="grid grid-cols-1 gap-3 text-sm">
                {[
                  { label: 'Name *', name: 'name', type: 'text' },
                  { label: 'Phone *', name: 'phone', type: 'tel' },
                  { label: 'Email', name: 'email', type: 'email' },
                  { label: 'Password *', name: 'password', type: 'password' },
                  { label: 'City *', name: 'address.city', type: 'text' },
                  { label: 'House No/Building *', name: 'address.houseNo', type: 'text' },
                  { label: 'Street', name: 'address.street', type: 'text' },
                  { label: 'Area/Locality *', name: 'address.area', type: 'text' },
                  { label: 'State *', name: 'address.state', type: 'text' },

                  { label: 'Pincode *', name: 'address.pincode', type: 'text' },
                ].map(field => (
                  <div key={field.name}>
                    <label className="block text-xs font-medium text-gray-700 mb-1">{field.label}</label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={field.name.includes('.')
                        ? formData[field.name.split('.')[0]][field.name.split('.')[1]]
                        : formData[field.name]
                      }
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors[field.name] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder={field.label}
                    />
                    {errors[field.name] && <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-800">Skills & Services</h3>

              {/* Skills */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">Select Skills *</label>
                {errors.skills && <p className="text-red-500 text-xs">{errors.skills}</p>}
                <div className="grid grid-cols-1 gap-2">
                  {skillsList.map(skill => (
                    <label
                      key={skill._id}
                      className={`flex items-center p-2 rounded-lg border cursor-pointer text-sm ${formData.selectedSkills.includes(skill._id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedSkills.includes(skill._id)}
                        onChange={() => handleSkillChange(skill._id)}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <span className="ml-2 flex-1">{skill.name}</span>
                      <span className="text-xs text-gray-500">{skill.services?.length || 0} services</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Services */}
              {formData.selectedSkills.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-medium text-gray-700">Select Services *</label>
                    <div className="flex gap-1">
                      <button onClick={() => setFormData(prev => ({ ...prev, selectedServices: selectedSkillServices }))} className="text-xs text-green-600">All</button>
                      <span className="text-gray-400">|</span>
                      <button onClick={() => setFormData(prev => ({ ...prev, selectedServices: [] }))} className="text-xs text-red-600">None</button>
                    </div>
                  </div>
                  {errors.services && <p className="text-red-500 text-xs">{errors.services}</p>}
                  {skillsList
                    .filter(s => formData.selectedSkills.includes(s._id))
                    .map(skill => {
                      const services = selectedSkillServices.filter(s => s.skillId === skill._id);
                      return (
                        <div key={skill._id} className="border rounded-lg p-3 bg-gray-50">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-sm">{skill.name}</h4>
                            <div className="flex gap-1 text-xs">
                              <button onClick={() => selectAllServicesForSkill(skill._id)} className="text-green-600">All</button>
                              <span>|</span>
                              <button onClick={() => deselectAllServicesForSkill(skill._id)} className="text-red-600">None</button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {services.map(service => {
                              const isSelected = formData.selectedServices.some(s => s.serviceId === service.serviceId);
                              const detail = serviceDetails[service.serviceId] || {};
                              return (
                                <div key={service.serviceId}>
                                  <label className={`flex items-center p-2 rounded border text-xs cursor-pointer ${isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200'
                                    }`}>
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => handleServiceChange(service)}
                                      className="h-3.5 w-3.5 text-green-600 rounded"
                                    />
                                    <span className="ml-2 flex-1">{service.name}</span>
                                  </label>
                                  {isSelected && (
                                    <div className="mt-2 p-2 bg-white rounded border text-xs space-y-2">
                                      <textarea
                                        placeholder="Details"
                                        value={detail.details || ''}
                                        onChange={e => handleServiceDetailsChange(service.serviceId, 'details', e.target.value)}
                                        className="w-full p-2 border rounded text-xs"
                                        rows="2"
                                      />
                                      <div className="grid grid-cols-2 gap-2">
                                        <select
                                          value={detail.pricingType || 'fixed'}
                                          onChange={e => handleServiceDetailsChange(service.serviceId, 'pricingType', e.target.value)}
                                          className="p-2 border rounded text-xs"
                                        >
                                          <option value="fixed">Fixed</option>
                                          <option value="hourly">Hourly</option>
                                          <option value="squarefeet">Per Sq Ft</option>
                                          <option value="negotiable">Negotiable</option>
                                        </select>
                                        <input
                                          type="number"
                                          placeholder="Price"
                                          value={detail.price || ''}
                                          onChange={e => handleServiceDetailsChange(service.serviceId, 'price', e.target.value)}
                                          className="p-2 border rounded text-xs"
                                        />
                                        <input
                                          type="number"
                                          placeholder="Est. Duration (mins)"
                                          value={detail.estimatedDuration || ''}
                                          onChange={e => handleServiceDetailsChange(service.serviceId, 'estimatedDuration', e.target.value)}
                                          className="p-2 border rounded text-xs"
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-800">Bank Details</h3>
              <div className="grid grid-cols-1 gap-3 text-sm">
                {[
                  { label: 'Holder Name *', name: 'bankDetails.accountHolderName' },
                  { label: 'Account No *', name: 'bankDetails.accountNumber' },
                  { label: 'IFSC Code *', name: 'bankDetails.IFSCCode' },
                  { label: 'Bank Name *', name: 'bankDetails.bankName' },
                ].map(field => (
                  <div key={field.name}>
                    <label className="block text-xs font-medium text-gray-700 mb-1">{field.label}</label>
                    <input
                      type="text"
                      name={field.name}
                      value={formData.bankDetails[field.name.split('.')[1]]}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors[field.name.split('.')[1]] ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors[field.name.split('.')[1]] && <p className="text-red-500 text-xs mt-1">{errors[field.name.split('.')[1]]}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-800">Upload Documents</h3>
              {workerCreated && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-800">
                  Profile created! Upload documents to activate.
                </div>
              )}
              <div className="grid grid-cols-1 gap-4">
                {[
                  { label: 'Selfie *', field: 'selfie', icon: 'camera' },
                  { label: 'Aadhaar *', field: 'aadhar', icon: 'id-card' },
                  { label: 'Police Verification', field: 'policeVerification', icon: 'shield' },
                ].map(doc => (
                  <div key={doc.field} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <div className="mb-3">
                      {doc.field === 'selfie' && imagePreview ? (
                        <img src={imagePreview} alt="Selfie" className="mx-auto w-20 h-20 rounded-full object-cover" />
                      ) : (
                        <div className="mx-auto w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">
                          {doc.icon}
                        </div>
                      )}
                    </div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">{doc.label}</label>
                    <input
                      type="file"
                      accept={doc.field === 'selfie' ? 'image/*' : 'image/*,.pdf'}
                      onChange={e => handleFileUpload(e.target.files[0], doc.field)}
                      className="hidden"
                      id={doc.field}
                    />
                    <label
                      htmlFor={doc.field}
                      className="cursor-pointer inline-block px-4 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
                    >
                      Upload
                    </label>
                    {errors[doc.field] && <p className="text-red-500 text-xs mt-1">{errors[doc.field]}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NAVIGATION */}
          <div className="flex justify-between items-center pt-4 border-t">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1 || loading}
              className={`text-sm font-medium ${currentStep === 1 || loading ? 'text-gray-400' : 'text-blue-600'}`}
            >
              Previous
            </button>

            <div>
              {currentStep === 1 && (
                <button
                  onClick={saveBasicInformation}
                  disabled={loading}
                  className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-60"
                >
                  {loading ? 'Saving...' : 'Next'}
                </button>
              )}
              {currentStep === 2 && (
                <button
                  onClick={saveSkillsAndServices}
                  disabled={loading}
                  className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-60"
                >
                  {loading ? 'Saving...' : 'Next'}
                </button>
              )}
              {currentStep === 3 && (
                <button
                  onClick={saveBankDetails}
                  disabled={loading}
                  className="px-5 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-60"
                >
                  {loading ? 'Saving...' : 'Complete'}
                </button>
              )}
              {currentStep === 4 && (
                <button
                  onClick={uploadDocuments}
                  disabled={documentLoading}
                  className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-60"
                >
                  {documentLoading ? 'Uploading...' : 'Submit'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkerProfile;