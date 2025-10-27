import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';

const CreateWorkerProfile = () => {
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
    selectedSkills: [], // Array of skill IDs
    selectedServices: [], // Array of service IDs
    dailyAvailability: {
      Monday: [{ start: '', end: '' }],
      Tuesday: [{ start: '', end: '' }],
      Wednesday: [{ start: '', end: '' }],
      Thursday: [{ start: '', end: '' }],
      Friday: [{ start: '', end: '' }],
      Saturday: [{ start: '', end: '' }],
      Sunday: [{ start: '', end: '' }],
    },
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
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [imagePreview, setImagePreview] = useState(null);
  const [skillsList, setSkillsList] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);

  // Fetch skills and services on component mount
  useEffect(() => {
    const fetchSkillsAndServices = async () => {
      try {
        // Fetch skills
        const skillsResponse = await axiosInstance.get('/api/skills/');
        if (skillsResponse.data.success) {
          setSkillsList(skillsResponse.data.data);
        }

        // Fetch all services
        const servicesResponse = await axiosInstance.get('/api/services');
        if (servicesResponse.data.success) {
          setServicesList(servicesResponse.data.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrors(prev => ({ 
          ...prev, 
          skills: 'Failed to fetch skills and services' 
        }));
      }
    };
    
    fetchSkillsAndServices();
  }, []);

  // Filter services based on selected skills
  useEffect(() => {
    if (formData.selectedSkills.length > 0) {
      const filtered = servicesList.filter(service => 
        formData.selectedSkills.includes(service.skillId)
      );
      setFilteredServices(filtered);
    } else {
      setFilteredServices([]);
    }
  }, [formData.selectedSkills, servicesList]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData(prev => ({
        ...prev,
        [keys[0]]: {
          ...prev[keys[0]],
          [keys[1]]: value,
        },
      }));
    } else if (name.includes('address.')) {
      const keys = name.split('.');
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [keys[1]]: value,
        },
      }));
    } else if (name.includes('bankDetails.')) {
      const keys = name.split('.');
      setFormData(prev => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          [keys[1]]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle skill selection
  const handleSkillChange = (skillId) => {
    setFormData(prev => {
      const isSelected = prev.selectedSkills.includes(skillId);
      if (isSelected) {
        // Remove skill and its services
        const updatedSkills = prev.selectedSkills.filter(id => id !== skillId);
        const updatedServices = prev.selectedServices.filter(serviceId => {
          const service = servicesList.find(s => s._id === serviceId);
          return service && service.skillId !== skillId;
        });
        
        return {
          ...prev,
          selectedSkills: updatedSkills,
          selectedServices: updatedServices
        };
      } else {
        // Add skill
        return {
          ...prev,
          selectedSkills: [...prev.selectedSkills, skillId]
        };
      }
    });
  };

  // Handle service selection
  const handleServiceChange = (serviceId) => {
    setFormData(prev => {
      const isSelected = prev.selectedServices.includes(serviceId);
      if (isSelected) {
        return {
          ...prev,
          selectedServices: prev.selectedServices.filter(id => id !== serviceId)
        };
      } else {
        return {
          ...prev,
          selectedServices: [...prev.selectedServices, serviceId]
        };
      }
    });
  };

  // Select all services for a specific skill
  const selectAllServicesForSkill = (skillId) => {
    const skillServices = servicesList.filter(service => service.skillId === skillId);
    const serviceIds = skillServices.map(service => service._id);
    
    setFormData(prev => ({
      ...prev,
      selectedServices: [...new Set([...prev.selectedServices, ...serviceIds])]
    }));
  };

  // Deselect all services for a specific skill
  const deselectAllServicesForSkill = (skillId) => {
    const skillServices = servicesList.filter(service => service.skillId === skillId);
    const serviceIds = skillServices.map(service => service._id);
    
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.filter(id => !serviceIds.includes(id))
    }));
  };

  // Select all services for all selected skills
  const selectAllServices = () => {
    const allServiceIds = filteredServices.map(service => service._id);
    setFormData(prev => ({
      ...prev,
      selectedServices: [...new Set([...prev.selectedServices, ...allServiceIds])]
    }));
  };

  // Deselect all services
  const deselectAllServices = () => {
    setFormData(prev => ({
      ...prev,
      selectedServices: []
    }));
  };

  // Handle availability time changes
  const handleAvailabilityChange = (day, timeIndex, field, value) => {
    const updatedAvailability = { ...formData.dailyAvailability };
    updatedAvailability[day][timeIndex][field] = value;
    setFormData(prev => ({ ...prev, dailyAvailability: updatedAvailability }));
  };

  // Add time slot for a day
  const addTimeSlot = (day) => {
    const updatedAvailability = { ...formData.dailyAvailability };
    updatedAvailability[day].push({ start: '', end: '' });
    setFormData(prev => ({ ...prev, dailyAvailability: updatedAvailability }));
  };

  // Remove time slot
  const removeTimeSlot = (day, index) => {
    const updatedAvailability = { ...formData.dailyAvailability };
    updatedAvailability[day] = updatedAvailability[day].filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, dailyAvailability: updatedAvailability }));
  };

  // Handle file upload
  const handleFileUpload = (file, field) => {
    setFormData(prev => ({
      ...prev,
      verification: {
        ...prev.verification,
        documents: {
          ...prev.verification.documents,
          [field]: file,
        },
      },
    }));

    if (field === 'selfie') {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Form validation
  const validateForm = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.phone.match(/^[0-9]{10}$/)) newErrors.phone = 'Valid 10-digit phone number is required';
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      if (!formData.address.city) newErrors['address.city'] = 'City is required';
      if (!formData.address.pincode) newErrors['address.pincode'] = 'Pincode is required';
    }

    if (step === 2) {
      if (!formData.workType) newErrors.workType = 'Work type is required';
      if (formData.selectedSkills.length === 0) newErrors.skills = 'At least one skill is required';
      if (formData.selectedServices.length === 0) newErrors.services = 'At least one service is required';
    }

    if (step === 3) {
      if (!formData.bankDetails.accountNumber) newErrors.accountNumber = 'Account number is required';
      if (!formData.bankDetails.accountHolderName) newErrors.accountHolderName = 'Account holder name is required';
      if (!formData.bankDetails.IFSCCode) newErrors.IFSCCode = 'IFSC code is required';
      if (!formData.bankDetails.bankName) newErrors.bankName = 'Bank name is required';
    }

    if (step === 4) {
      if (!formData.verification.documents.selfie) newErrors.selfie = 'Selfie is required';
      if (!formData.verification.documents.aadhar) newErrors.aadhar = 'Aadhaar document is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm(currentStep)) return;

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      return;
    }

    setLoading(true);
    try {
      // Prepare data for submission
      const submissionData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        password: formData.password,
        address: formData.address,
        workType: formData.workType,
        skills: formData.selectedSkills,
        services: formData.selectedServices,
        dailyAvailability: formData.dailyAvailability,
        bankDetails: formData.bankDetails,
      };

      // Create worker with all data
      const workerResponse = await axiosInstance.post('/api/service-agent/create-worker', submissionData);
      if (!workerResponse.data.success) {
        throw new Error(workerResponse.data.message || 'Failed to create worker');
      }
      const workerId = workerResponse.data.data._id;

      // Upload documents if any
      const formDataToUpload = new FormData();
      if (formData.verification.documents.selfie) {
        formDataToUpload.append('selfie', formData.verification.documents.selfie);
      }
      if (formData.verification.documents.aadhar) {
        formDataToUpload.append('aadhar', formData.verification.documents.aadhar);
      }
      if (formData.verification.documents.policeVerification) {
        formDataToUpload.append('policeVerification', formData.verification.documents.policeVerification);
      }

      if ([...formDataToUpload.entries()].length > 0) {
        const uploadResponse = await axiosInstance.post(
          `/api/service-agent//upload-documents/${workerId}`,
          formDataToUpload,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        if (!uploadResponse.data.success) {
          throw new Error(uploadResponse.data.message || 'Failed to upload documents');
        }
      }

      alert('Worker profile created successfully!');
      
      // Reset form
      setFormData({
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
        dailyAvailability: {
          Monday: [{ start: '', end: '' }],
          Tuesday: [{ start: '', end: '' }],
          Wednesday: [{ start: '', end: '' }],
          Thursday: [{ start: '', end: '' }],
          Friday: [{ start: '', end: '' }],
          Saturday: [{ start: '', end: '' }],
          Sunday: [{ start: '', end: '' }],
        },
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
      setCurrentStep(1);
      setImagePreview(null);
      setErrors({});
      
    } catch (error) {
      console.error('Error creating worker profile:', error);
      setErrors({ submit: error.message || 'Failed to create worker profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Basic Information
  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter worker's full name"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="10-digit phone number"
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email (Optional)
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="worker@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password *
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Minimum 6 characters"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City *
          </label>
          <input
            type="text"
            name="address.city"
            value={formData.address.city}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
              errors['address.city'] ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="City"
          />
          {errors['address.city'] && <p className="text-red-500 text-xs mt-1">{errors['address.city']}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pincode *
          </label>
          <input
            type="text"
            name="address.pincode"
            value={formData.address.pincode}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
              errors['address.pincode'] ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="6-digit pincode"
          />
          {errors['address.pincode'] && <p className="text-red-500 text-xs mt-1">{errors['address.pincode']}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            House No.
          </label>
          <input
            type="text"
            name="address.houseNo"
            value={formData.address.houseNo}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="House/Building number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Street
          </label>
          <input
            type="text"
            name="address.street"
            value={formData.address.street}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Street name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Area
          </label>
          <input
            type="text"
            name="address.area"
            value={formData.address.area}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Area/Locality"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State
          </label>
          <input
            type="text"
            name="address.state"
            value={formData.address.state}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="State"
          />
        </div>
      </div>
    </div>
  );

  // Step 2: Professional Information
   const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">Professional Information</h3>
      
      <div className="grid grid-cols-1 gap-6">

        {/* Skills Selection */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <label className="block text-lg font-semibold text-gray-800 mb-4">
            Select Your Skills *
          </label>
          {errors.skills && <p className="text-red-500 text-sm mb-3">{errors.skills}</p>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skillsList.map(skill => (
              <div 
                key={skill._id} 
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  formData.selectedSkills.includes(skill._id)
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleSkillChange(skill._id)}
              >
                <input
                  type="checkbox"
                  id={`skill-${skill._id}`}
                  checked={formData.selectedSkills.includes(skill._id)}
                  onChange={() => handleSkillChange(skill._id)}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor={`skill-${skill._id}`}
                  className="ml-3 text-sm font-medium text-gray-700 cursor-pointer flex-1"
                >
                  {skill.name}
                </label>
              </div>
            ))}
          </div>
          
          {formData.selectedSkills.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 text-sm">
                <strong>Selected Skills:</strong> {formData.selectedSkills.length} skill(s) selected
              </p>
            </div>
          )}
        </div>

        {/* Services Selection - Only show when skills are selected */}
        {formData.selectedSkills.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-lg font-semibold text-gray-800">
                Select Services for Your Skills *
              </label>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={selectAllServices}
                  className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={deselectAllServices}
                  className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Deselect All
                </button>
              </div>
            </div>
            
            {errors.services && <p className="text-red-500 text-sm mb-3">{errors.services}</p>}
            
            {filteredServices.length === 0 ? (
              <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-gray-400 text-4xl mb-3">🔧</div>
                <p className="text-gray-500">No services available for the selected skills</p>
                <p className="text-gray-400 text-sm mt-1">Please select different skills</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Group services by skill */}
                {skillsList
                  .filter(skill => formData.selectedSkills.includes(skill._id))
                  .map(skill => {
                    const skillServices = filteredServices.filter(service => service.skillId === skill._id);
                    if (skillServices.length === 0) return null;
                    
                    const allServicesSelected = skillServices.every(service => 
                      formData.selectedServices.includes(service._id)
                    );
                    const someServicesSelected = skillServices.some(service => 
                      formData.selectedServices.includes(service._id)
                    );

                    return (
                      <div key={skill._id} className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center">
                            <h4 className="font-semibold text-gray-800 text-lg">{skill.name}</h4>
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {skillServices.length} service(s)
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => selectAllServicesForSkill(skill._id)}
                              className={`px-3 py-1 text-xs rounded transition-colors ${
                                allServicesSelected 
                                  ? 'bg-green-100 text-green-800 cursor-not-allowed' 
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                              disabled={allServicesSelected}
                            >
                              {allServicesSelected ? 'All Selected' : 'Select All'}
                            </button>
                            <button
                              type="button"
                              onClick={() => deselectAllServicesForSkill(skill._id)}
                              className={`px-3 py-1 text-xs rounded transition-colors ${
                                !someServicesSelected 
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                  : 'bg-red-600 text-white hover:bg-red-700'
                              }`}
                              disabled={!someServicesSelected}
                            >
                              Deselect All
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {skillServices.map(service => (
                            <div 
                              key={service._id} 
                              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                                formData.selectedServices.includes(service._id)
                                  ? 'border-green-500 bg-green-50 shadow-sm'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-white'
                              }`}
                              onClick={() => handleServiceChange(service._id)}
                            >
                              <input
                                type="checkbox"
                                id={`service-${service._id}`}
                                checked={formData.selectedServices.includes(service._id)}
                                onChange={() => handleServiceChange(service._id)}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                              />
                              <label
                                htmlFor={`service-${service._id}`}
                                className="ml-3 text-sm text-gray-700 cursor-pointer flex-1"
                              >
                                <div className="font-medium">{service.name}</div>
                                {service.description && (
                                  <div className="text-xs text-gray-500 mt-1">{service.description}</div>
                                )}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Selected Services Summary */}
        {formData.selectedServices.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-lg font-semibold text-green-800">
                Selected Services Summary
              </h4>
              <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {formData.selectedServices.length} service(s) selected
              </span>
            </div>
            
            <div className="space-y-3">
              {skillsList
                .filter(skill => formData.selectedSkills.includes(skill._id))
                .map(skill => {
                  const selectedSkillServices = filteredServices.filter(service => 
                    service.skillId === skill._id && formData.selectedServices.includes(service._id)
                  );
                  
                  if (selectedSkillServices.length === 0) return null;
                  
                  return (
                    <div key={skill._id} className="bg-white rounded-lg p-4 border">
                      <h5 className="font-medium text-gray-800 mb-2 flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        {skill.name}
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {selectedSkillServices.length} service(s)
                        </span>
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedSkillServices.map(service => (
                          <span 
                            key={service._id} 
                            className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full border border-green-200"
                          >
                            {service.name}
                            <button
                              type="button"
                              onClick={() => handleServiceChange(service._id)}
                              className="ml-2 text-green-600 hover:text-green-800 text-xs"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Work Type Selection */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Work Type *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Full Time', 'Part Time', 'Contract'].map(type => (
              <div 
                key={type}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  formData.workType === type
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, workType: type }))}
              >
                <input
                  type="radio"
                  name="workType"
                  value={type}
                  checked={formData.workType === type}
                  onChange={(e) => setFormData(prev => ({ ...prev, workType: e.target.value }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label className="ml-3 text-sm font-medium text-gray-700 cursor-pointer">
                  {type}
                </label>
              </div>
            ))}
          </div>
          {errors.workType && <p className="text-red-500 text-xs mt-2">{errors.workType}</p>}
        </div>

      </div>

      {/* Weekly Availability Section (keep this part the same) */}
      <div className="border-t pt-6 mt-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Weekly Availability</h4>
        <div className="space-y-4">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
            <div key={day} className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex justify-between items-center mb-3">
                <label className="font-medium text-gray-700 text-sm">{day}</label>
                <button
                  type="button"
                  onClick={() => addTimeSlot(day)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                >
                  <span className="mr-1">+</span> Add Time Slot
                </button>
              </div>
              
              {formData.dailyAvailability[day].map((timeSlot, timeIndex) => (
                <div key={timeIndex} className="flex items-center space-x-3 mb-3">
                  <div className="flex items-center space-x-2 flex-1">
                    <input
                      type="time"
                      value={timeSlot.start}
                      onChange={(e) => handleAvailabilityChange(day, timeIndex, 'start', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-32"
                    />
                    <span className="text-gray-500 text-sm">to</span>
                    <input
                      type="time"
                      value={timeSlot.end}
                      onChange={(e) => handleAvailabilityChange(day, timeIndex, 'end', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-32"
                    />
                  </div>
                  
                  {formData.dailyAvailability[day].length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTimeSlot(day, timeIndex)}
                      className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors"
                      title="Remove time slot"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  // Step 3: Bank Details (same as before)
  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">Bank Account Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account Holder Name *
          </label>
          <input
            type="text"
            name="bankDetails.accountHolderName"
            value={formData.bankDetails.accountHolderName}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
              errors.accountHolderName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="As per bank records"
          />
          {errors.accountHolderName && <p className="text-red-500 text-xs mt-1">{errors.accountHolderName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account Number *
          </label>
          <input
            type="text"
            name="bankDetails.accountNumber"
            value={formData.bankDetails.accountNumber}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
              errors.accountNumber ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Bank account number"
          />
          {errors.accountNumber && <p className="text-red-500 text-xs mt-1">{errors.accountNumber}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            IFSC Code *
          </label>
          <input
            type="text"
            name="bankDetails.IFSCCode"
            value={formData.bankDetails.IFSCCode}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
              errors.IFSCCode ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="11-character IFSC code"
            style={{ textTransform: 'uppercase' }}
          />
          {errors.IFSCCode && <p className="text-red-500 text-xs mt-1">{errors.IFSCCode}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bank Name *
          </label>
          <input
            type="text"
            name="bankDetails.bankName"
            value={formData.bankDetails.bankName}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
              errors.bankName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Name of the bank"
          />
          {errors.bankName && <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>}
        </div>
      </div>
    </div>
  );

  // Step 4: Document Upload (same as before)
  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">Document Verification</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div className="mb-4">
            {imagePreview ? (
              <img 
                src={imagePreview} 
                alt="Selfie preview" 
                className="mx-auto h-32 w-32 rounded-full object-cover"
              />
            ) : (
              <div className="mx-auto h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">📸</span>
              </div>
            )}
          </div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Worker Selfie *
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e.target.files[0], 'selfie')}
            className="hidden"
            id="selfie-upload"
          />
          <label
            htmlFor="selfie-upload"
            className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-block"
          >
            Upload Selfie
          </label>
          <p className="text-xs text-gray-500 mt-2">Clear face photo for identification</p>
          {errors.selfie && <p className="text-red-500 text-xs mt-1">{errors.selfie}</p>}
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div className="mx-auto h-32 w-32 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
            <span className="text-gray-500">🆔</span>
          </div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Aadhaar Card *
          </label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => handleFileUpload(e.target.files[0], 'aadhar')}
            className="hidden"
            id="aadhaar-upload"
          />
          <label
            htmlFor="aadhaar-upload"
            className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-block"
          >
            Upload Aadhaar
          </label>
          <p className="text-xs text-gray-500 mt-2">Front/Back photo or PDF</p>
          {errors.aadhar && <p className="text-red-500 text-xs mt-1">{errors.aadhar}</p>}
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div className="mx-auto h-32 w-32 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
            <span className="text-gray-500">👮</span>
          </div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Police Verification
          </label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => handleFileUpload(e.target.files[0], 'policeVerification')}
            className="hidden"
            id="police-upload"
          />
          <label
            htmlFor="police-upload"
            className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-block"
          >
            Upload Document
          </label>
          <p className="text-xs text-gray-500 mt-2">Police verification certificate</p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-yellow-800 mb-2">Verification Note</h4>
        <p className="text-sm text-yellow-700">
          All documents will be verified by the admin. Worker profile will be activated only after successful verification.
          Ensure all uploaded documents are clear and valid.
        </p>
      </div>
    </div>
  );

  // Progress Steps
  const steps = [
    { number: 1, title: 'Basic Info' },
    { number: 2, title: 'Professional' },
    { number: 3, title: 'Bank Details' },
    { number: 4, title: 'Documents' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Worker Profile</h1>
          <p className="text-gray-600 mt-2">
            Register a new non-smartphone worker to your service network
          </p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.number
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-300 text-gray-500'
                  }`}
                >
                  {step.number}
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-4 ${
                      currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

            <div className="flex justify-between mt-8 pt-6 border-t">
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={currentStep === 1}
                className={`px-6 py-2 rounded-md ${
                  currentStep === 1
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                Previous
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : currentStep === 4 ? (
                  'Create Worker Profile'
                ) : (
                  'Next'
                )}
              </button>
            </div>

            {errors.submit && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkerProfile;