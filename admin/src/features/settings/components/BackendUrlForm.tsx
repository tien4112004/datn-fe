import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getBackendUrl, setBackendUrl } from '@/lib/backend-url';

const BackendUrlForm = () => {
  const [backendUrl, setBackendUrlState] = useState(getBackendUrl());

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBackendUrl(backendUrl);
    toast.success('Backend URL saved successfully');
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="backendUrl">Backend URL</Label>
        <div className="flex gap-2">
          <Input
            id="backendUrl"
            placeholder="https://api.example.com"
            className="w-full max-w-md"
            value={backendUrl}
            onChange={(e) => setBackendUrlState(e.target.value)}
          />
          <Button type="submit">Save</Button>
        </div>
        <p className="text-muted-foreground text-sm">
          Configure the backend API URL. Changes take effect immediately.
        </p>
      </div>
    </form>
  );
};

export default BackendUrlForm;
