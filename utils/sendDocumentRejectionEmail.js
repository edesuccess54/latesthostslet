const sendEmail = require('./sendEmail');

const sendDocumentRejectionEmail = async (user) => {
    const send_to = user.email;
    const sent_from = process.env.NO_REPLY_EMAIL; 
    const subject = 'Identity Verification Rejection'

   const htmlMessage = `
        <html>
            <head>
                <title>  ${process.env.SITE_NAME} ' Verification Email</title>
            </head>
            <body>
                <div>
                    <img src = "${process.env.SITE_LINK}/main/images/logo.png" style="height:200px; width: 400px">
                </div>

            <p> Dear ${user.firstname} </p>,


            <p>
            I hope this email finds you well. We would like to thank you for your interest in our platform and for taking the time to complete the user identity verification process.
            <br />
            <br />

            However, we regret to inform you that your identity verification has been rejected. Our team has thoroughly reviewed the provided documents, and unfortunately, they did not meet our verification standards. As a result, we cannot proceed with the verification at this time.

            Possible reasons for rejection may include, but are not limited to:
            <br />
            <br />

            <ol>
                <li>Missing or unclear information on the documents provided.</li>
                <li>Documents not being current or expired.</li>
                <li>Documents being edited or tampered with.</li>
                <li>Incomplete submission of the required identification.</li>
            </ol>

            <br />
            <br />
            

            We understand the importance of user security and privacy, and we have strict verification protocols to ensure a safe environment for all our users. Please know that this decision is not a reflection of your credibility or standing as an individual.
            <br />
            <br />

            If you believe there has been an error or if you would like to reapply for verification, we encourage you to review the rejection reasons carefully and resubmit your documents following our guidelines. You may also contact our support team at ${process.env.SUPPORT_EMAIL} for further assistance.
            <br />
            <br />

            Once again, we apologize for any inconvenience this may have caused, and we appreciate your understanding.
            <br />

            Thank you for your understanding and cooperation.  
            <br />
            <br />
            Best regards,
            ${process.env.SITE_NAME}
            Verification Team
        
            </body>
        </html>
        `;
    
    const send = await sendEmail(subject, htmlMessage, send_to, sent_from);
}

module.exports = sendDocumentRejectionEmail