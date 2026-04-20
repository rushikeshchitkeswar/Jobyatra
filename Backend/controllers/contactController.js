const asyncHandler = require('express-async-handler');
const Contact = require('../models/Contact');
const { Resend } = require('resend');

/**
 * @desc    Submit contact form
 * @route   POST /api/contact
 * @access  Public
 */
const submitContactForm = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  // 1. Basic Validation
  if (!name || !email || !subject || !message) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // 2. Save to Database
  const contact = await Contact.create({
    name,
    email,
    subject,
    message,
  });

  // 3. Send Email Notification to Admin via Resend
  const resendApiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (resendApiKey && adminEmail) {
    try {
      const resend = new Resend(resendApiKey);

      await resend.emails.send({
        from: 'JobYatra Support <onboarding@resend.dev>', // Use verified domain in production
        to: adminEmail,
        subject: `New Contact Message: ${subject}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333; line-height: 1.6;">
            <h2 style="color: #2563eb;">New Contact Message from JobYatra</h2>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-top: 20px; border: 1px solid #e2e8f0;">
              <p><strong>Message:</strong></p>
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
            <p style="font-size: 12px; color: #64748b; margin-top: 30px;">This message was submitted via the JobYatra contact form.</p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Resend Email Error:', error);
      // We don't throw an error here because the message is already saved to DB
      // and we don't want to fail the user's request just because of email issues.
    }
  } else {
    console.warn('RESEND_API_KEY or ADMIN_EMAIL missing in .env. Skipping email notification.');
  }

  res.status(201).json({
    success: true,
    data: contact,
    message: 'Message sent successfully. We will get back to you soon!',
  });
});

module.exports = {
  submitContactForm,
};
