import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Zod schema for form validation
const profileFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email({ message: "Please enter a valid email address" }),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  bio: z.string().max(500, "Bio must not exceed 500 characters").optional(),
  phoneNumber: z.string().optional(),
  specialization: z.array(z.string()).min(1, "Please select at least one specialization"),
  pricing: z.object({
    hourlyRate: z.number().min(0, "Hourly rate must be at least 0"),
    minimumCharge: z.number().min(0, "Minimum charge must be at least 0"),
    travelFee: z.number().min(0, "Travel fee must be at least 0"),
    acceptsInsurance: z.boolean(),
  }),
  certifications: z.array(
    z.object({
      documents: z.array(z.string()).optional(),
      name: z.string().min(1, "Certification name is required"),
      issuingBody: z.string().min(1, "Issuing body is required"),
      issueDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid issue date"),
      expiryDate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), "Invalid expiry date"),
      certificateNumber: z.string().optional(),
    })
  ).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
const API_BASE_URL = "http://localhost:5001/api";

export default function MechanicProfile() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: user?.username || '',
      email: user?.email || '',
      bio: '',
      phoneNumber: '',
      specialization: [],
      pricing: {
        hourlyRate: 0,
        minimumCharge: 0,
        travelFee: 0,
        acceptsInsurance: false,
      },
      certifications: [],
    },
  });

  // Determine edit mode by checking for mechanic-specific fields in user (fallback to true if user exists)
  const isEditMode = !!user;

  useEffect(() => {
    async function fetchProfile() {
      if (!user?._id || !token) return;
      setProfileLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/list/mechanics/${user._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (res.ok) {
          const data = await res.json();
          // Only set form fields that exist in the schema
          Object.keys(profileFormSchema.shape).forEach((key) => {
            if (data[key] !== undefined) {
              setValue(key as keyof ProfileFormValues, data[key]);
            }
          });
        }
      } catch { }
      setProfileLoading(false);
    }
    fetchProfile();
  }, [user?._id, token, setValue]);

  // Set form title and button text based on mode
  const formTitle = isEditMode ? "Edit Mechanic Profile" : "Create Mechanic Profile";
  const formSubtitle = isEditMode
    ? "Update your professional and business information."
    : "Fill out your details to create your mechanic profile.";
  const buttonText = isEditMode ? "Update Profile" : "Create Profile";

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/list/mechanics/${user?._id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        Alert.alert('Success', 'Profile updated successfully!');
      } else {
        const errorData = await res.json();
        Alert.alert('Error', errorData.error || 'Failed to update profile');
      }
    } catch {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const specialization = [
    'Engine Repair',
    'Brake Systems',
    'Electrical Systems',
    'Transmission',
    'Air Conditioning',
    'General Maintenance',
    'Other',
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{formTitle}</Text>
        <Text style={styles.subtitle}>{formSubtitle}</Text>
      </View>
      {profileLoading ? (
        <View style={{ padding: 40 }}>
          <Text>Loading profile...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          {/* Basic Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name *</Text>
              <Controller
                control={control}
                name="firstName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.firstName && styles.inputError]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Enter your first name"
                  />
                )}
              />
              {errors.firstName && (
                <Text style={styles.errorText}>{errors.firstName.message}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name *</Text>
              <Controller
                control={control}
                name="lastName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.lastName && styles.inputError]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Enter your last name"
                  />
                )}
              />
              {errors.lastName && (
                <Text style={styles.errorText}>{errors.lastName.message}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username *</Text>
              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, styles.inputDisabled]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    editable={false}
                  />
                )}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, styles.inputDisabled]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    editable={false}
                    keyboardType="email-address"
                  />
                )}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone</Text>
              <Controller
                control={control}
                name="phoneNumber"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Enter your phone number"
                    keyboardType="phone-pad"
                  />
                )}
              />
            </View>
          </View>

          {/* Professional Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Specialization *</Text>
              <Controller
                control={control}
                name="specialization"
                render={({ field: { onChange, value } }) => (
                  <View>
                    {specialization.map((spec) => {
                      const isSelected = value.includes(spec);
                      return (
                        <TouchableOpacity
                          key={spec}
                          style={[
                            styles.checkboxOption,
                            isSelected && styles.checkboxOptionSelected,
                          ]}
                          onPress={() => {
                            if (isSelected) {
                              // Remove from selection
                              onChange(value.filter((item: string) => item !== spec));
                            } else {
                              // Add to selection
                              onChange([...value, spec]);
                            }
                          }}
                        >
                          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                            {isSelected && <Text style={styles.checkmark}>✓</Text>}
                          </View>
                          <Text
                            style={[
                              styles.checkboxText,
                              isSelected && styles.checkboxTextSelected,
                            ]}
                          >
                            {spec}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              />
              {errors.specialization && (
                <Text style={styles.errorText}>{errors.specialization.message}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Hourly Rate ($)</Text>
              <Controller
                control={control}
                name="pricing.hourlyRate"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    onBlur={onBlur}
                    onChangeText={(text) => onChange(parseFloat(text) || 0)}
                    value={value?.toString() || ''}
                    placeholder="Enter your hourly rate"
                    keyboardType="numeric"
                  />
                )}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Minimum Charge ($)</Text>
              <Controller
                control={control}
                name="pricing.minimumCharge"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    onBlur={onBlur}
                    onChangeText={(text) => onChange(parseFloat(text) || 0)}
                    value={value?.toString() || ''}
                    placeholder="Enter your minimum charge"
                    keyboardType="numeric"
                  />
                )}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Travel Fee ($)</Text>
              <Controller
                control={control}
                name="pricing.travelFee"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    onBlur={onBlur}
                    onChangeText={(text) => onChange(parseFloat(text) || 0)}
                    value={value?.toString() || ''}
                    placeholder="Enter your travel fee"
                    keyboardType="numeric"
                  />
                )}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.switchContainer}>
                <Text style={styles.label}>Accepts Insurance</Text>
                <Controller
                  control={control}
                  name="pricing.acceptsInsurance"
                  render={({ field: { onChange, value } }) => (
                    <Switch
                      value={value}
                      onValueChange={onChange}
                      trackColor={{ false: '#767577', true: '#81b0ff' }}
                      thumbColor={value ? '#f5dd4b' : '#f4f3f4'}
                    />
                  )}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <Controller
                control={control}
                name="bio"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.textArea]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Tell customers about your experience and expertise"
                    multiline
                    numberOfLines={4}
                  />
                )}
              />
              {errors.bio && (
                <Text style={styles.errorText}>{errors.bio.message}</Text>
              )}
            </View>
          </View>

          {/* Certifications Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            <Controller
              control={control}
              name="certifications"
              render={({ field: { onChange, value } }) => (
                <View>
                  {value?.map((cert, index) => (
                    <View key={index} style={styles.certificationGroup}>
                      <Text style={styles.label}>Certification Name *</Text>
                      <TextInput
                        style={styles.input}
                        value={cert.name}
                        onChangeText={(text) => {
                          const updatedCerts = [...value];
                          updatedCerts[index].name = text;
                          onChange(updatedCerts);
                        }}
                        placeholder="Enter certification name"
                      />
                      <Text style={styles.label}>Issuing Body *</Text>
                      <TextInput
                        style={styles.input}
                        value={cert.issuingBody}
                        onChangeText={(text) => {
                          const updatedCerts = [...value];
                          updatedCerts[index].issuingBody = text;
                          onChange(updatedCerts);
                        }}
                        placeholder="Enter issuing body"
                      />
                      <Text style={styles.label}>Issue Date *</Text>
                      <TextInput
                        style={styles.input}
                        value={cert.issueDate}
                        onChangeText={(text) => {
                          const updatedCerts = [...value];
                          updatedCerts[index].issueDate = text;
                          onChange(updatedCerts);
                        }}
                        placeholder="YYYY-MM-DD"
                      />
                      <Text style={styles.label}>Expiry Date</Text>
                      <TextInput
                        style={styles.input}
                        value={cert.expiryDate}
                        onChangeText={(text) => {
                          const updatedCerts = [...value];
                          updatedCerts[index].expiryDate = text;
                          onChange(updatedCerts);
                        }}
                        placeholder="YYYY-MM-DD"
                      />
                      <Text style={styles.label}>Certificate Number</Text>
                      <TextInput
                        style={styles.input}
                        value={cert.certificateNumber}
                        onChangeText={(text) => {
                          const updatedCerts = [...value];
                          updatedCerts[index].certificateNumber = text;
                          onChange(updatedCerts);
                        }}
                        placeholder="Enter certificate number"
                      />
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => {
                          const updatedCerts = value.filter((_, i) => i !== index);
                          onChange(updatedCerts);
                        }}
                      >
                        <Text style={styles.removeButtonText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                      const updatedCerts = value ? [...value, { documents: [], name: '', issuingBody: '', issueDate: '', expiryDate: '', certificateNumber: '' }] : [{ documents: [], name: '', issuingBody: '', issueDate: '', expiryDate: '', certificateNumber: '' }];
                      onChange(updatedCerts);
                    }}
                  >
                    <Text style={styles.addButtonText}>Add Certification</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? (isEditMode ? 'Updating...' : 'Creating...') : buttonText}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginTop: 4,
    marginBottom: 10,
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputDisabled: {
    backgroundColor: '#f8f8f8',
    color: '#666',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 5,
  },
  radioOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  radioOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  radioText: {
    fontSize: 16,
    color: '#333',
  },
  radioTextSelected: {
    color: '#007AFF',
    fontWeight: '500',
  },
  // Checkbox styles for multiple selection specialization
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  checkboxOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  checkboxTextSelected: {
    color: '#007AFF',
    fontWeight: '500',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  certificationGroup: {
    marginBottom: 15,
  },
  removeButton: {
    backgroundColor: '#ff4444',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
});