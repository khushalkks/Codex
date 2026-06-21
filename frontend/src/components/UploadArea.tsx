import React from 'react';
import { UploadCloud } from 'lucide-react';

interface UploadAreaProps {
  onUpload: (file: File) => void;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onUpload }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div style={{
      border: '2px dashed #4f46e5',
      borderRadius: '12px',
      padding: '40px',
      textAlign: 'center',
      cursor: 'pointer',
      background: 'rgba(79, 70, 229, 0.05)',
      transition: 'all 0.3s'
    }}>
      <input
        type="file"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id="file-upload"
      />
      <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
        <UploadCloud size={48} color="#4f46e5" style={{ marginBottom: '16px' }} />
        <h3 style={{ color: '#e6edf3', marginBottom: '8px' }}>Drop your resume here</h3>
        <p style={{ color: '#8b949e' }}>Support PDF, DOCX and TXT (Max 10MB)</p>
      </label>
    </div>
  );
};
