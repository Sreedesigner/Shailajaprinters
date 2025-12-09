# AWS SES + Lambda Setup Instructions for ShailajaPrinters Contact Form

## Prerequisites
- AWS Account
- AWS CLI installed and configured
- Access to your Amplify project

## Step 1: Verify Email in AWS SES

1. Go to AWS SES Console (https://console.aws.amazon.com/ses/)
2. Choose your region (e.g., ap-south-1 for Mumbai)
3. Click on "Verified identities" in the left sidebar
4. Click "Create identity"
5. Choose "Email address"
6. Enter: `shailajaprinters@gmail.com`
7. Click "Create identity"
8. Check your Outlook inbox for verification email and click the link

**Important:** If you want to send emails to ANY email address (not just verified ones), you need to request production access:
- In SES Console, go to "Account dashboard"
- Click "Request production access"
- Fill out the form explaining your use case

## Step 2: Create IAM Role for Lambda

1. Go to IAM Console (https://console.aws.amazon.com/iam/)
2. Click "Roles" → "Create role"
3. Choose "AWS service" → "Lambda"
4. Attach these policies:
   - `AWSLambdaBasicExecutionRole`
   - `AmazonSESFullAccess` (or create a custom policy with only `ses:SendEmail` permission)
5. Name the role: `LambdaContactFormSESRole`
6. Create the role

## Step 3: Create Lambda Function

1. Go to Lambda Console (https://console.aws.amazon.com/lambda/)
2. Click "Create function"
3. Choose "Author from scratch"
4. Function name: `ShailajaPrinters-contact-form`
5. Runtime: Node.js 18.x or later
6. Architecture: x86_64
7. Execution role: Use existing role → Select `LambdaContactFormSESRole`
8. Click "Create function"

## Step 4: Upload Lambda Code

1. In the Lambda function page, scroll to "Code source"
2. Copy the content from `amplify/backend/function/contactFormHandler/src/index.js`
3. Paste it into the `index.js` file in the Lambda console
4. Update the `region` in the code if needed (line 2):
   ```javascript
   const ses = new AWS.SES({ region: 'ap-south-1' }); // Mumbai region
   ```
5. Click "Deploy" to save changes

## Step 5: Create API Gateway

1. Go to API Gateway Console (https://console.aws.amazon.com/apigateway/)
2. Click "Create API"
3. Choose "REST API" (not private) → Click "Build"
4. Choose "New API"
5. API name: `ShailajaPrinters-contact-api`
6. Description: "Contact form API for ShailajaPrinters website"
7. Endpoint Type: Regional
8. Click "Create API"

## Step 6: Configure API Gateway

### Create Resource:
1. Click "Actions" → "Create Resource"
2. Resource Name: `contact`
3. Resource Path: `/contact`
4. Enable CORS: Check the box
5. Click "Create Resource"

### Create POST Method:
1. With `/contact` selected, click "Actions" → "Create Method"
2. Choose "POST" from dropdown
3. Click the checkmark
4. Integration type: Lambda Function
5. Use Lambda Proxy integration: Check the box
6. Lambda Region: Choose your region
7. Lambda Function: `ShailajaPrinters-contact-form`
8. Click "Save"
9. Click "OK" on the permission popup

### Enable CORS:
1. With `/contact` selected, click "Actions" → "Enable CORS"
2. Leave defaults (GET, POST, OPTIONS enabled)
3. Click "Enable CORS and replace existing CORS headers"
4. Confirm by clicking "Yes, replace existing values"

### Deploy API:
1. Click "Actions" → "Deploy API"
2. Deployment stage: [New Stage]
3. Stage name: `prod`
4. Click "Deploy"
5. **IMPORTANT:** Copy the "Invoke URL" - it will look like:
   `https://xxxxxxxxxx.execute-api.ap-south-1.amazonaws.com/prod`

## Step 7: Update Frontend Code

1. Open `assets/js/contact-form.js`
2. Replace `YOUR_API_GATEWAY_ENDPOINT_HERE` with your API endpoint:
   ```javascript
   const API_ENDPOINT = 'https://xxxxxxxxxx.execute-api.ap-south-1.amazonaws.com/prod/contact';
   ```
   (Note: Add `/contact` to the end of your invoke URL)

## Step 8: Update contact.html

Add the script before the closing `</body>` tag:

```html
<script src="assets/js/contact-form.js"></script>
```

## Step 9: Test the Form

1. Deploy your changes to Amplify
2. Visit your contact page
3. Fill out the form and submit
4. Check your Outlook inbox for the email

## Step 10: Monitor and Troubleshoot

### Check Lambda Logs:
1. Go to Lambda Console
2. Select your function
3. Click "Monitor" tab
4. Click "View logs in CloudWatch"

### Check SES Sending Statistics:
1. Go to SES Console
2. Click "Account dashboard"
3. View sending statistics

### Common Issues:

**"Email address is not verified"**
- Make sure you verified `shailajaprinters@gmail.com` in SES
- If still in sandbox, also verify your Outlook email

**CORS Errors:**
- Make sure CORS is enabled in API Gateway
- Redeploy the API after enabling CORS

**403 Forbidden:**
- Check Lambda execution role has SES permissions
- Verify API Gateway is properly configured

## Cost Estimate

- **SES**: First 62,000 emails/month are FREE
- **Lambda**: First 1 million requests/month are FREE
- **API Gateway**: First 1 million calls/month are FREE

For a typical contact form, this will cost **$0/month** unless you have very high traffic.

## Security Best Practices

1. **Rate Limiting:** Add rate limiting in API Gateway to prevent spam
2. **Update CORS:** In production, change `Access-Control-Allow-Origin` from `*` to your domain
3. **Add reCAPTCHA:** Consider adding Google reCAPTCHA for additional spam protection
4. **Monitor Usage:** Set up CloudWatch alarms for unusual activity

## Next Steps (Optional Enhancements)

1. Add auto-reply email to customers
2. Set up SNS notifications for new form submissions
3. Store submissions in DynamoDB for backup
4. Add email templates with your branding
5. Integrate with CRM system

## Support

If you encounter issues:
- Check CloudWatch logs for Lambda errors
- Verify SES sending limits and quotas
- Ensure all AWS regions match across services
- Test the API endpoint directly using Postman or curl
