const mongoose = require('mongoose');

const SettlementSchema = new mongoose.Schema({
  group_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  from_user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to_user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  is_settled: {
    type: Boolean,
    default: false
  },
  settled_on: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Settlement', SettlementSchema);
