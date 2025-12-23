import { useState } from 'react';
import { Copy, Check, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@ui/alert';
import { Button } from '@ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card';
import { Input } from '@ui/input';
import { Label } from '@ui/label';

export interface CredentialsDisplayProps {
  username: string;
  password: string;
  email: string;
  studentName: string;
}

/**
 * Component to display generated student credentials after creation
 *
 * Features:
 * - Shows username, password, and email
 * - Copy-to-clipboard functionality
 * - Warning message to save credentials
 * - Print option for easy distribution
 */
export function CredentialsDisplay({ username, password, email, studentName }: CredentialsDisplayProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Student Credentials - ${studentName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              max-width: 600px;
              margin: 0 auto;
            }
            h1 {
              color: #333;
              border-bottom: 2px solid #ddd;
              padding-bottom: 10px;
            }
            .credential-item {
              margin: 20px 0;
              padding: 15px;
              background: #f5f5f5;
              border-radius: 4px;
            }
            .credential-label {
              font-weight: bold;
              color: #666;
              display: block;
              margin-bottom: 5px;
            }
            .credential-value {
              font-size: 18px;
              color: #000;
              font-family: monospace;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
            }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <h1>Student Login Credentials</h1>
          <p><strong>Student Name:</strong> ${studentName}</p>

          <div class="credential-item">
            <span class="credential-label">Username:</span>
            <span class="credential-value">${username}</span>
          </div>

          <div class="credential-item">
            <span class="credential-label">Email:</span>
            <span class="credential-value">${email}</span>
          </div>

          <div class="credential-item">
            <span class="credential-label">Temporary Password:</span>
            <span class="credential-value">${password}</span>
          </div>

          <div class="warning">
            <strong>Important:</strong> Please save these credentials securely. The password will not be shown again. Students should change their password after first login.
          </div>

          <p style="margin-top: 40px; color: #999; font-size: 12px;">
            Generated on: ${new Date().toLocaleString()}
          </p>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Credentials Created</CardTitle>
        <CardDescription>Credentials for {studentName}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Warning Alert */}
        <Alert variant="default" className="border-amber-500 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Save these credentials now! The password will not be shown again. Students should change their
            password after first login.
          </AlertDescription>
        </Alert>

        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="credential-username">Username</Label>
          <div className="flex gap-2">
            <Input id="credential-username" value={username} readOnly className="font-mono" />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopy(username, 'username')}
              title="Copy to clipboard"
            >
              {copiedField === 'username' ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="credential-email">Email</Label>
          <div className="flex gap-2">
            <Input id="credential-email" value={email} readOnly className="font-mono" />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopy(email, 'email')}
              title="Copy to clipboard"
            >
              {copiedField === 'email' ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="credential-password">Temporary Password</Label>
          <div className="flex gap-2">
            <Input id="credential-password" value={password} readOnly className="font-mono" />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopy(password, 'password')}
              title="Copy to clipboard"
            >
              {copiedField === 'password' ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handlePrint}>
            Print Credentials
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
