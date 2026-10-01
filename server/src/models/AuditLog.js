import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  actor: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    role: { type: String, required: true }
  },
  action: { type: String, required: true }, // e.g., 'REPORT_SUBMITTED', 'CASE_OPENED', 'VERIFICATION_ASSIGNED', 'STATUS_CHANGED', 'NOTE_ADDED'
  targetId: { type: String, required: true }, // caseId or eventId
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export default mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
