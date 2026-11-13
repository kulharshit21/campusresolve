import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { COMPLAINT_CATEGORIES, ComplaintCategory, Complaint } from '@/types';
import { createComplaint } from '@/services/complaintService';
import { uploadComplaintEvidence } from '@/services/storageService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Modal } from '@/components/ui/Modal';
import {
  PlusCircle,
  Upload,
  X,
  CheckCircle2,
  MapPin,
  ArrowRight,
} from 'lucide-react';

export const CreateComplaintPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Wi-Fi / Network');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Success modal state
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please upload a valid image (JPEG, PNG, or WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file exceeds the 5MB size limit.');
      return;
    }

    setError(null);
    setSelectedFile(file);

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to file a complaint.');
      return;
    }

    if (!title.trim() || !location.trim() || !description.trim()) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    let imageUrl: string | null = null;

    // 1. Upload evidence file if selected
    if (selectedFile) {
      setUploadStatus('Uploading photographic evidence...');
      const uploadRes = await uploadComplaintEvidence(selectedFile, user.id);
      if (uploadRes.error) {
        setError(`Evidence Upload Failed: ${uploadRes.error}`);
        setIsSubmitting(false);
        setUploadStatus(null);
        return;
      }
      imageUrl = uploadRes.url;
    }

    // 2. Submit Complaint Record
    setUploadStatus('Recording complaint in database...');
    const { data, error: createError } = await createComplaint({
      title: title.trim(),
      category,
      campus_location: location.trim(),
      description: description.trim(),
      image_url: imageUrl,
      student_id: user.id,
      student_name: user.full_name,
      student_email: user.email,
    });

    setIsSubmitting(false);
    setUploadStatus(null);

    if (createError || !data) {
      setError(createError || 'Failed to submit complaint.');
      return;
    }

    // Show success confirmation modal
    setSubmittedComplaint(data);
    setIsSuccessModalOpen(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          to="/student/dashboard"
          className="text-xs text-blue-600 hover:text-blue-700 font-semibold mb-2 inline-block"
        >
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Submit Campus Maintenance Complaint
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Provide accurate location and details to ensure campus maintenance staff can locate and resolve
          the problem swiftly.
        </p>
      </div>

      <Card className="shadow-md border-slate-200">
        <CardHeader>
          <CardTitle>Complaint Registration Form</CardTitle>
          <CardDescription>
            All submitted reports receive a unique tracking ID and are routed to campus administrators.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <Input
              label="Complaint Title / Subject"
              placeholder="e.g. Wi-Fi dropping constantly in Computer Lab 3"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              helperText="Brief summary of the issue"
            />

            {/* Category & Location grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Complaint Category"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
              >
                {COMPLAINT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>

              <Input
                label="Campus Location"
                placeholder="e.g. Academic Block B, 3rd Floor, Room 304"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                leftIcon={<MapPin className="w-4 h-4" />}
                helperText="Specify building, floor, wing, or room"
              />
            </div>

            {/* Description */}
            <Textarea
              label="Detailed Problem Description"
              placeholder="Describe what is broken, when the issue started, and any specific symptoms or equipment IDs..."
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              helperText="Be as specific as possible to assist technicians"
            />

            {/* Photographic Evidence File Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Photographic Evidence <span className="text-slate-400 font-normal">(Optional)</span>
              </label>

              {previewUrl ? (
                <div className="relative rounded-xl border border-slate-200 p-2 bg-slate-50 flex items-center gap-4">
                  <img
                    src={previewUrl}
                    alt="Evidence preview"
                    className="h-24 w-32 object-cover rounded-lg border border-slate-300"
                  />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-800">{selectedFile?.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {(selectedFile?.size || 0) / 1024 < 1000
                        ? `${Math.round((selectedFile?.size || 0) / 1024)} KB`
                        : `${((selectedFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB`}
                    </p>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="mt-2 text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      Remove photo
                    </button>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/20">
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-xs font-semibold text-slate-700">
                    Click to upload photo evidence
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1">
                    Supports JPEG, PNG, or WebP (Max 5MB)
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>

            {uploadStatus && (
              <p className="text-xs text-blue-600 font-semibold animate-pulse">{uploadStatus}</p>
            )}

            {/* Submit button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/student/dashboard')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                leftIcon={<PlusCircle className="w-4 h-4" />}
              >
                Submit Complaint
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Success Confirmation Modal */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => navigate('/student/dashboard')}
        title="Complaint Submitted Successfully"
        maxWidth="md"
      >
        <div className="text-center py-4 space-y-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h4 className="text-lg font-bold text-slate-900">Ticket Generated</h4>
            <p className="text-xs text-slate-500 mt-1">
              Your issue has been logged into the campus system. Use this tracking code to monitor
              resolution progress.
            </p>
          </div>

          <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 inline-block w-full">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 block mb-1">
              Tracking Identifier
            </span>
            <span className="font-mono text-xl font-black text-blue-700 tracking-wider">
              {submittedComplaint?.tracking_code}
            </span>
          </div>

          <div className="text-xs text-slate-600 text-left bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
            <p>
              <strong>Subject:</strong> {submittedComplaint?.title}
            </p>
            <p>
              <strong>Category:</strong> {submittedComplaint?.category}
            </p>
            <p>
              <strong>Location:</strong> {submittedComplaint?.campus_location}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate('/student/dashboard')}
            >
              Back to Dashboard
            </Button>
            {submittedComplaint && (
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => navigate(`/student/complaints/${submittedComplaint.id}`)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                View Status & Timeline
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
