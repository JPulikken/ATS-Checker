/**
 * FileUploader — Drag & drop resume upload component.
 * Uses react-dropzone for accessible, intuitive file handling.
 */

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { formatFileSize, truncateFilename } from '../utils/helpers';

const ACCEPTED_FILES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
  'text/plain': ['.txt'],
};

export default function FileUploader({ file, onFileChange, disabled = false }) {
  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      if (disabled) return;
      if (rejectedFiles.length > 0) {
        const err = rejectedFiles[0].errors[0];
        alert(err.code === 'file-too-large'
          ? 'File too large. Maximum size is 5MB.'
          : `Invalid file: ${err.message}`
        );
        return;
      }
      if (acceptedFiles.length > 0) {
        onFileChange(acceptedFiles[0]);
      }
    },
    [onFileChange, disabled]
  );

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILES,
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled,
  });

  const getDropzoneClass = () => {
    if (isDragReject) return 'dropzone rejected';
    if (isDragAccept || isDragActive) return 'dropzone active';
    if (file) return 'dropzone accepted';
    return 'dropzone';
  };

  const getFileIcon = (filename) => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📄';
    if (ext === 'docx' || ext === 'doc') return '📝';
    return '📎';
  };

  return (
    <div>
      <div
        {...getRootProps()}
        className={getDropzoneClass()}
        style={{ padding: '40px 24px', textAlign: 'center' }}
      >
        <input {...getInputProps()} />

        {file ? (
          /* File selected state */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 64, height: 64,
              background: 'rgba(16, 185, 129, 0.15)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '28px',
            }}>
              {getFileIcon(file.name)}
            </div>
            <div>
              <p style={{ color: '#34d399', fontWeight: 600, fontSize: '0.95rem', margin: 0 }}>
                {truncateFilename(file.name, 35)}
              </p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: 4 }}>
                {formatFileSize(file.size)} • Click or drag to replace
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFileChange(null);
              }}
              style={{
                marginTop: 4, padding: '6px 16px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 8, color: '#f87171',
                cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500,
              }}
            >
              Remove File
            </button>
          </div>
        ) : (
          /* Empty state */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            {/* Upload icon */}
            <div
              className={isDragActive ? 'animate-pulse-glow' : ''}
              style={{
                width: 80, height: 80,
                background: isDragActive
                  ? 'rgba(99, 102, 241, 0.2)'
                  : 'rgba(99, 102, 241, 0.08)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '36px',
                transition: 'all 0.3s ease',
                border: '2px solid rgba(99, 102, 241, 0.3)',
              }}
            >
              {isDragActive ? '🎯' : '📤'}
            </div>

            <div>
              <p style={{
                color: isDragActive ? 'var(--color-accent-primary)' : 'var(--color-text-primary)',
                fontWeight: 600, fontSize: '1.05rem', margin: '0 0 6px',
                transition: 'color 0.2s',
              }}>
                {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
              </p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: 0 }}>
                or{' '}
                <span style={{ color: 'var(--color-accent-primary)', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}>
                  browse to choose a file
                </span>
              </p>
            </div>

            {/* Accepted formats */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {['PDF', 'DOCX', 'DOC', 'TXT'].map(fmt => (
                <span key={fmt} className="stat-badge">{fmt}</span>
              ))}
              <span className="stat-badge">Max 5MB</span>
            </div>
          </div>
        )}
      </div>

      {isDragReject && (
        <p style={{
          color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: 8,
          textAlign: 'center',
        }}>
          ❌ Invalid file type. Please upload a PDF, DOCX, or TXT file.
        </p>
      )}
    </div>
  );
}
