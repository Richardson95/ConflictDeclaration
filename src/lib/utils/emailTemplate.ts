// InfraCredit branded email template
// Image URLs - update these if hosting changes
const LOGO_URL = 'https://infracredit.ng/wp-content/uploads/2020/01/InfraCredit-Logo.png';
const BANNER_URL = 'https://infracredit.ng/wp-content/uploads/2020/01/infracredit-banner.jpg';

interface EmailTemplateParams {
  title: string;
  subtitle?: string;
  recipientName?: string;
  bodyContent: string;
}

export function wrapInEmailTemplate({
  title,
  subtitle,
  recipientName,
  bodyContent,
}: EmailTemplateParams): string {
  const greeting = recipientName ? `<p style="font-size:15px;color:#333333;margin:0 0 16px;">Dear ${recipientName},</p>` : '';
  const subtitleHtml = subtitle ? `<p style="font-size:14px;color:#666666;margin:4px 0 0;text-align:center;">${subtitle}</p>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;">
<tr><td align="center" style="padding:24px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

  <!-- Logo Header -->
  <tr>
    <td align="center" style="padding:24px 24px 16px;background-color:#ffffff;">
      <img src="${LOGO_URL}" alt="InfraCredit" width="180" style="display:block;max-width:180px;height:auto;" />
    </td>
  </tr>

  <!-- Banner -->
  <tr>
    <td style="padding:0;">
      <img src="${BANNER_URL}" alt="" width="600" style="display:block;width:100%;height:auto;" />
    </td>
  </tr>

  <!-- Title Section -->
  <tr>
    <td style="padding:28px 32px 8px;text-align:center;">
      <h1 style="font-size:20px;font-weight:700;color:#2C3E50;margin:0;">${title}</h1>
      ${subtitleHtml}
    </td>
  </tr>

  <!-- Body Content -->
  <tr>
    <td style="padding:16px 32px 28px;">
      ${greeting}
      <div style="font-size:14px;color:#333333;line-height:1.6;">
        ${bodyContent}
      </div>
    </td>
  </tr>

  <!-- Divider -->
  <tr>
    <td style="padding:0 32px;">
      <hr style="border:none;border-top:1px solid #E6E7EC;margin:0;" />
    </td>
  </tr>

  <!-- Footer Contact Info -->
  <tr>
    <td style="padding:24px 32px 8px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:12px;color:#666666;">
        <tr>
          <td style="padding:4px 0;"><strong>A:</strong> 12A, Catholic Mission Street, Lagos Island, Lagos, Nigeria</td>
        </tr>
        <tr>
          <td style="padding:4px 0;"><strong>E:</strong> no reply</td>
        </tr>
        <tr>
          <td style="padding:4px 0;"><strong>M:</strong> +234 (0) 1 700 4783</td>
        </tr>
        <tr>
          <td style="padding:4px 0;"><strong>W:</strong> <a href="https://infracredit.ng" style="color:#227CBF;text-decoration:none;">www.infracredit.ng</a></td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Social Icons -->
  <tr>
    <td align="center" style="padding:16px 32px;">
      <a href="https://www.linkedin.com/company/aborogroup/" style="display:inline-block;margin:0 6px;text-decoration:none;color:#227CBF;font-size:13px;">LinkedIn</a>
      <span style="color:#ccc;">|</span>
      <a href="https://twitter.com/InfraCredit_" style="display:inline-block;margin:0 6px;text-decoration:none;color:#227CBF;font-size:13px;">Twitter</a>
      <span style="color:#ccc;">|</span>
      <a href="https://www.instagram.com/infracredit/" style="display:inline-block;margin:0 6px;text-decoration:none;color:#227CBF;font-size:13px;">Instagram</a>
    </td>
  </tr>

  <!-- Legal Disclaimer -->
  <tr>
    <td style="padding:12px 32px 24px;">
      <p style="font-size:10px;color:#999999;line-height:1.5;margin:0;text-align:center;">
        This email and any files transmitted with it are confidential and intended solely for the use of the individual or entity to whom they are addressed. If you have received this email in error, please notify the sender immediately and delete it from your system. Any unauthorized dissemination, distribution, or copying of this communication is strictly prohibited.
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
