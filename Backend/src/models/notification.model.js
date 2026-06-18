import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'success', 'emergency'], default: 'info' },
  isRead: { type: Boolean, default: false },
  link: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const notificationModel =  mongoose.model('Notification', notificationSchema)
export default notificationModel;
