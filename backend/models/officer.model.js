const mongoose = require('mongoose');

const officerSchema = new mongoose.Schema({
    officerName: {
        type: String,
        required: true,
        trim: true
    },
    employeeId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    ward: {
        type: String,
        trim: true
    },
    availabilityStatus: {
        type: String,
        enum: ['Available', 'Busy', 'On Leave'],
        default: 'Available'
    },
    busyUntil: {
        type: Date
    },
    currentAssignment: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'assignmentModel'
    },
    assignmentModel: {
        type: String,
        required: function() {
            return !!this.currentAssignment;
        },
        enum: ['Alert', 'BulkyRequest']
    },
    assignedTasksCount: {
        type: Number,
        default: 0
    },
    password: {
        type: String,
        default: 'bmc123' // Temporary default for newly created officers
    }
}, { timestamps: true });

module.exports = mongoose.model('Officer', officerSchema);
