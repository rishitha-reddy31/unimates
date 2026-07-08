// Minimal email service to get the app running
const sendVerificationEmail = async (email, token) => {
    console.log(`📧 Verification email would be sent to ${email} with token: ${token}`);
    console.log(`🔗 Verification link: ${process.env.CLIENT_URL}/verify-email/${token}`);
    return { success: true };
};

const sendWelcomeEmail = async (email, name) => {
    console.log(`📧 Welcome email would be sent to ${email} for user: ${name}`);
    return { success: true };
};

const sendPasswordResetEmail = async (email, token) => {
    console.log(`📧 Password reset email would be sent to ${email} with token: ${token}`);
    return { success: true };
};

module.exports = {
    sendVerificationEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail
};