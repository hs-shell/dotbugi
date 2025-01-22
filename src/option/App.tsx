import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, Save } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

interface Mapping {
  github: string;
  jira: string;
}

const Options: React.FC = () => {
  const [email, setEmail] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [mappings, setMappings] = useState<Mapping[]>([{ github: '', jira: '' }]);
  const { toast } = useToast();

  useEffect(() => {
    chrome.storage.sync.get(['email', 'apiToken', 'mappings'], (data) => {
      setEmail(data.email || '');
      setApiToken(data.apiToken || '');
      setMappings(data.mappings && data.mappings.length > 0 ? data.mappings : [{ github: '', jira: '' }]);
    });
  }, []);

  const handleSave = () => {
    if (!email.trim() || !apiToken.trim()) {
      toast({
        title: 'Error',
        description: '이메일과 API 토큰을 입력해 주세요.',
        variant: 'destructive',
      });
      return;
    }
    for (let mapping of mappings) {
      if (!mapping.github.trim() || !mapping.jira.trim()) {
        toast({
          title: 'Error',
          description: '모든 매핑의 GitHub, Jira 도메인을 입력해 주세요.',
          variant: 'destructive',
        });
        return;
      }
    }
    chrome.storage.sync.set({ email, apiToken, mappings }, () => {
      toast({
        title: 'Success',
        description: 'Settings saved successfully!',
      });
    });
  };

  const handleMappingChange = (index: number, field: keyof Mapping, value: string) => {
    const newMappings = [...mappings];
    newMappings[index] = { ...newMappings[index], [field]: value };
    setMappings(newMappings);
  };

  const handleAddMapping = () => {
    setMappings([...mappings, { github: '', jira: '' }]);
  };

  const handleDeleteMapping = (index: number) => {
    if (mappings.length > 1) {
      const newMappings = mappings.filter((_, i) => i !== index);
      setMappings(newMappings);
    } else {
      toast({
        title: 'Info',
        description: '최소 하나의 매핑이 필요합니다.',
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-100">
      <div className="container mx-auto p-4 max-w-5xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Extension Options</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="h-full shadow-none">
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your-email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiToken">API Token</Label>
                <Input
                  id="apiToken"
                  type="password"
                  placeholder="your-api-token"
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          <Card className="h-full flex flex-col shadow-none">
            <CardHeader>
              <CardTitle>Domain Mapping</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col shadow-none">
              <ScrollArea className="flex-grow pr-4 mb-4 h-[calc(5*6rem)]">
                <div className="space-y-4">
                  {mappings.map((mapping, index) => (
                    <Card key={index} className="relative shadow-none">
                      <CardContent className="pt-4 pb-2 shadow-none">
                        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 pb-2">
                          <div className="space-y-2">
                            <Label htmlFor={`github-${index}`}>GitHub Domain</Label>
                            <Input
                              id={`github-${index}`}
                              placeholder="github.com/owner/repo"
                              value={mapping.github}
                              onChange={(e) => handleMappingChange(index, 'github', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`jira-${index}`}>Jira Domain</Label>
                            <Input
                              id={`jira-${index}`}
                              placeholder="example.atlassian.net"
                              value={mapping.jira}
                              onChange={(e) => handleMappingChange(index, 'jira', e.target.value)}
                            />
                          </div>
                        </div>
                        <Button
                          onClick={() => handleDeleteMapping(index)}
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
              <Button onClick={handleAddMapping} variant="outline" className="w-full mt-4">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Mapping
              </Button>
            </CardContent>
          </Card>
        </div>
        <div className="mt-6">
          <Button onClick={handleSave} className="w-full">
            <Save className="mr-2 h-4 w-4" /> Save Settings
          </Button>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default Options;
