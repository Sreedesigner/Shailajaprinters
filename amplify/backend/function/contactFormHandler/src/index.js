const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const sesClient = new SESClient({ region: 'ap-south-1' });

exports.handler = async (event) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Handle OPTIONS request for CORS preflight (HTTP API v2 format)
    if (event.requestContext.http.method === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        // Parse body - handle both string and object formats
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
        
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
            Source: 'ShailajaPrinters <shailajaprinters@gmail.com>', // Must be verified in SES
            Destination: {
                ToAddresses: ['shailajaprinters@gmail.com']
            },
            Message: {
                Subject: {
                    Data: `🖨️ ShailajaPrinters - ${body.subject || 'General Enquiry'} from ${body.name}`,
                    Charset: 'UTF-8'
                },
                Body: {
                    Html: {
                        Data: `
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <style>
                                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                                    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; }
                                    .header { background: #0d6efd; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                                    .content { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px; }
                                    .field { margin-bottom: 15px; }
                                    .label { font-weight: bold; color: #0d6efd; display: block; margin-bottom: 5px; }
                                    .value { color: #333; }
                                    .footer { text-align: center; color: #6c757d; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6; }
                                    .message-box { background: white; padding: 15px; border-left: 4px solid #0d6efd; margin: 10px 0; border-radius: 3px; }
                                </style>
                            </head>
                            <body>
                                <div class="container">
                                    <div class="header">
                                        <h2 style="margin: 0;">New Contact Form Submission</h2>
                                        <p style="margin: 5px 0 0 0;">shailajaprinters.com</p>
                                    </div>
                                    <div class="content">
                                        <div class="field">
                                            <span class="label">Customer Name:</span>
                                            <span class="value">${body.name}</span>
                                        </div>
                                        <div class="field">
                                            <span class="label">Email Address:</span>
                                            <span class="value"><a href="mailto:${body.email}" style="color: #0d6efd; text-decoration: none;">${body.email}</a></span>
                                        </div>
                                        ${body.phone ? `<div class="field"><span class="label">Phone Number:</span><span class="value"><a href="tel:${body.phone}" style="color: #0d6efd; text-decoration: none;">${body.phone}</a></span></div>` : ''}
                                        ${body.company ? `<div class="field"><span class="label">Company:</span><span class="value">${body.company}</span></div>` : ''}
                                        <div class="field">
                                            <span class="label">Enquiry Type:</span>
                                            <span class="value">${body.subject || 'General Enquiry'}</span>
                                        </div>
                                        <div class="field">
                                            <span class="label">Message:</span>
                                            <div class="message-box">
                                                ${body.message.replace(/\n/g, '<br>')}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="footer">
                                        <p style="margin: 5px 0;">📅 Received: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short' })}</p>
                                        <p style="margin: 5px 0;">🌐 Source: ShailajaPrinters Contact Form</p>
                                        <p style="margin: 5px 0; font-size: 11px;">This is an automated message from your website contact form.</p>
                                    </div>
                                </div>
                            </body>
                            </html>
                        `,
                        Charset: 'UTF-8'
                    },
                    Text: {
                        Data: `
NEW ENQUIRY - ShailajaPrinters.com
${'='.repeat(50)}

CUSTOMER DETAILS:
Name: ${body.name}
Email: ${body.email}
${body.phone ? `Phone: ${body.phone}` : ''}
${body.company ? `Company: ${body.company}` : ''}

ENQUIRY TYPE:
${body.subject || 'General Enquiry'}

MESSAGE:
${body.message}

${'='.repeat(50)}
Received: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short' })}
Source: ShailajaPrinters Contact Form (shailajaprinters.com)
                        `,
                        Charset: 'UTF-8'
                    }
                }
            },
            ReplyToAddresses: [`${body.name} <${body.email}>`] // Allows you to reply directly from Outlook
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
