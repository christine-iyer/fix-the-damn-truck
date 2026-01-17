import React, { useState } from "react";
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../../contexts/AuthContext';

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jurvyppjndbokswyapqt.supabase.co'; // Replace with your Project URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1cnZ5cHBqbmRib2tzd3lhcHF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMjg1MzIsImV4cCI6MjA3ODcwNDUzMn0.-BDKj50cmdsnfqkU4lKtJoTfUhy6PfrqZf0_XaR0QnU'; // Replace with your anon key
const supabase = createClient(supabaseUrl, supabaseKey);

const API_BASE_URL = "http://localhost:5001/api";

type UploadCertificateProps = {
  onUpload?: (url: string) => void;
};

const UploadCertificate: React.FC<UploadCertificateProps> = ({ onUpload = () => {} }) => {
  const { user, token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      const allowedTypes = ['image/png', 'image/jpeg'];

      if (!allowedTypes.includes(selectedFile.type)) {
        alert('Invalid file type. Please upload a PNG or JPEG image.');
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleUpload = () => {
    if (file) {
      handleFileUpload(file);
    } else {
      alert('Please select a file first.');
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const filePath = `certificates/${file.name}`;

      // Check if the file already exists
      const { data: existingFiles, error: checkError } = await supabase.storage
        .from('certificates')
        .list('certificates', { search: file.name });

      if (checkError) {
        console.error('Error checking file existence:', checkError.message);
        return;
      }

      let uploadResponse;

      if (existingFiles && existingFiles.length > 0) {
        // Update the existing file
        const { data, error } = await supabase.storage
          .from('certificates')
          .update(filePath, file, { upsert: true });

        uploadResponse = { data, error };
      } else {
        // Upload a new file
        const { data, error } = await supabase.storage
          .from('certificates')
          .upload(filePath, file);

        uploadResponse = { data, error };
      }

      const { data, error } = uploadResponse;

      if (error) {
        console.error('Error uploading file:', error.message);
        return;
      }

      console.log('File uploaded successfully:', data);
      const publicUrl = data ? supabase.storage.from('certificates').getPublicUrl(data.path).data?.publicUrl : null;
      setFileUrl(publicUrl);
      if (publicUrl) {
        onUpload(publicUrl);

        // Update the certifications.documents field in the database
        try {
          // Ensure token is present
          if (!token) {
            console.error('Authorization token is missing.');
            alert('You are not authorized. Please log in again.');
            return;
          }

          console.log('Authorization token:', token); // Debugging log

          // Fetch the current certifications.documents array
          const response = await fetch(`${API_BASE_URL}/list/mechanics/${user?._id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const mechanicData = await response.json();

          if (!response.ok) {
            console.error('Error fetching mechanic data:', mechanicData.error);
            return;
          }

          const currentDocuments = mechanicData.certifications?.documents || [];
          const updatedDocuments = [...currentDocuments, publicUrl];

          // Send the updated array back to the database
          const updateResponse = await fetch(`${API_BASE_URL}/list/mechanics/${user?._id}`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ certifications: { documents: updatedDocuments } }),
          });

          if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            console.error('Error updating certifications:', errorData.error);
          } else {
            console.log('Certifications updated successfully');
          }
        } catch (updateError) {
          console.error('Error updating certifications in the database:', updateError);
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload Certificate</button>
      {fileUrl && (
        <div>
          <p>File uploaded successfully! URL:</p>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">{fileUrl}</a>
        </div>
      )}
    </div>
  );
};

export default UploadCertificate;