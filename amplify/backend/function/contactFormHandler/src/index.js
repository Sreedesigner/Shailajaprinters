const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const sesClient = new SESClient({ region: 'eu-west-1' });

exports.handler = async (event) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Handle OPTIONS request for CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        const body = JSON.parse(event.body);
        
        // Validate required fields
        if (!body.name || !body.email || !body.message) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    success: false, 
                    message: 'Missing required fields' 
                })
            };
        }

        // Honeypot check (spam prevention)
        if (body.website) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    success: true, 
                    message: 'Thank you for your message!' 
                })
            };
        }

        // Email parameters
        const params = {
            Source: 'shailajaprinters@gmail.com', // Must be verified in SES
            Destination: {
                ToAddresses: ['shailajaprinters@gmail.com'] // Your Outlook email
            },
            Message: {
                Subject: {
                    Data: `New Contact Form: ${body.subject || 'General Enquiry'} - ${body.name}`,
                    Charset: 'UTF-8'
                },
                Body: {
                    Html: {
                        Data: `
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <style>
                                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                    .header { background: #0d6efd; color: white; padding: 20px; text-align: center; }
                                    .content { background: #f8f9fa; padding: 20px; margin: 20px 0; }
                                    .field { margin-bottom: 15px; }
                                    .label { font-weight: bold; color: #0d6efd; }
                                    .footer { text-align: center; color: #6c757d; font-size: 12px; margin-top: 20px; }
                                </style>
                            </head>
                            <body>
                                <div class="container">
                                    <div class="header">
                                        <h2>New Contact Form Submission</h2>
                                        <p>ShailajaPrinters Website</p>
                                    </div>
                                    <div class="content">
                                        <div class="field">
                                            <span class="label">Name:</span> ${body.name}
                                        </div>
                                        <div class="field">
                                            <span class="label">Email:</span> <a href="mailto:${body.email}">${body.email}</a>
                                        </div>
                                        ${body.phone ? `<div class="field"><span class="label">Phone:</span> ${body.phone}</div>` : ''}
                                        ${body.company ? `<div class="field"><span class="label">Company:</span> ${body.company}</div>` : ''}
                                        <div class="field">
                                            <span class="label">Subject:</span> ${body.subject || 'Not specified'}
                                        </div>
                                        <div class="field">
                                            <span class="label">Message:</span>
                                            <p style="background: white; padding: 15px; border-left: 3px solid #0d6efd; margin: 10px 0;">
                                                ${body.message.replace(/\n/g, '<br>')}
                                            </p>
                                        </div>
                                    </div>
                                    <div class="footer">
                                        <p>This message was sent from the ShailajaPrinters contact form at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                                    </div>
                                </div>
                            </body>
                            </html>
                        `,
                        Charset: 'UTF-8'
                    },
                    Text: {
                        Data: `
New Contact Form Submission - ShailajaPrinters

Name: ${body.name}
Email: ${body.email}
${body.phone ? `Phone: ${body.phone}` : ''}
${body.company ? `Company: ${body.company}` : ''}
Subject: ${body.subject || 'Not specified'}

Message:
${body.message}

---
Sent from ShailajaPrinters website contact form
${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                        `,
                        Charset: 'UTF-8'
                    }
                }
            },
            ReplyToAddresses: [body.email] // Allows you to reply directly from Outlook
        };

        // Send email via SES
        const command = new SendEmailCommand(params);
        await sesClient.send(command);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                success: true, 
                message: 'Thank you! Your message has been sent successfully.' 
            })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                success: false, 
                message: 'Sorry, there was an error sending your message. Please try again or email us directly.' 
            })
        };
    }
};
