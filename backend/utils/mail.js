const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

/**
 * @desc    Send a professional HTML email to the assigned officer
 * @param   {Object} data - Contains officer, task, shopkeeper, and dustbin details
 */
const sendOfficerAssignmentEmail = async (data) => {
    const { officer, task, shopkeeper, dustbin } = data;

    const mailOptions = {
        from: `Municipal Management System <${process.env.EMAIL_USER}>`,
        to: officer.email,
        subject: 'New Municipal Assignment',
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #2c3e50; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
                <div style="background-color: #2E7D32; color: #ffffff; padding: 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">New Task Assignment</h1>
                </div>
                <div style="padding: 20px;">
                    <p>Hello <strong>${officer.officerName}</strong>,</p>
                    <p>A new municipal task has been assigned to you in <strong>Ward ${officer.ward}</strong>. Please find the deployment details below:</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 4px solid #2E7D32; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #2E7D32;">Task Summary</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; width: 40%;">Assignment ID:</td>
                                <td style="padding: 8px 0;">${task.alert_id || task.request_id}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold;">Category:</td>
                                <td style="padding: 8px 0;">${task.taskType === 'BulkyRequest' ? 'Bulky Waste Pickup' : 'Priority Alert'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold;">Issue Description:</td>
                                <td style="padding: 8px 0;">${task.comments || 'Manual Inspection Required'}</td>
                            </tr>
                        </table>
                    </div>

                    <h3 style="color: #2E7D32;">Location Details</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Establishment:</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${shopkeeper.shop_name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Address:</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">
                                ${shopkeeper.location} ${shopkeeper.marketArea ? `(${shopkeeper.marketArea})` : ''}
                                <br>
                                <a href="${
                                    task.taskType === 'Alert' && dustbin?.lat && dustbin?.lng
                                        ? `https://www.google.com/maps/search/?api=1&query=${dustbin.lat},${dustbin.lng}`
                                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shopkeeper.location + ' ' + (shopkeeper.marketArea || ''))}`
                                }" 
                                   style="display: inline-block; margin-top: 8px; color: #1a73e8; font-weight: bold; text-decoration: none; font-size: 13px;">
                                   📍 Open in Google Maps
                                </a>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Asset (Dustbin):</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${dustbin?.dustbin_id || 'Global Zone Access'}</td>
                        </tr>
                    </table>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="http://localhost:3000/officer/login" 
                           style="background-color: #263238; color: #ffffff; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; display: inline-block; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                           View Task in Portal
                        </a>
                    </div>

                    <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; border: 1px solid #ffe0b2; text-align: center;">
                        <p style="margin: 0; font-weight: bold; color: #e65100;">Service Level Agreement (ETA): ${task.estimatedCompletionTime} Hours</p>
                    </div>

                    <p style="margin-top: 30px; font-size: 12px; color: #7f8c8d; text-align: center; border-top: 1px solid #eee; pt-20;">
                        Assigned on ${new Date(task.assignedAt).toLocaleString()}<br>
                        Security Tip: Never share your employee credentials with others.
                    </p>
                </div>
                <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #95a5a6;">
                    &copy; 2026 Municipal Corporation Waste Management System
                </div>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};

module.exports = { sendOfficerAssignmentEmail };
