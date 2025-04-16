
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Copy, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface EmbedCodeGeneratorProps {
  formId: string;
}

export const EmbedCodeGenerator: React.FC<EmbedCodeGeneratorProps> = ({ formId }) => {
  const [copied, setCopied] = useState(false);
  
  const iframeCode = `<iframe 
  src="https://your-domain.com/form/${formId}" 
  width="100%" 
  height="600px" 
  style="border: none; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" 
  title="Form">
</iframe>`;

  const scriptCode = `<div id="form-container-${formId}"></div>
<script src="https://your-domain.com/embed.js"></script>
<script>
  FormEmbed.render({
    formId: "${formId}",
    container: "#form-container-${formId}"
  });
</script>`;

  const linkCode = `https://your-domain.com/form/${formId}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Embed Your Form</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="iframe">
          <TabsList className="mb-4">
            <TabsTrigger value="iframe">iFrame</TabsTrigger>
            <TabsTrigger value="script">Script</TabsTrigger>
            <TabsTrigger value="link">Direct Link</TabsTrigger>
          </TabsList>
          
          <TabsContent value="iframe" className="relative">
            <SyntaxHighlighter language="html" style={tomorrow} customStyle={{ borderRadius: '8px' }}>
              {iframeCode}
            </SyntaxHighlighter>
            <Button 
              variant="outline" 
              size="sm" 
              className="absolute top-2 right-2"
              onClick={() => copyToClipboard(iframeCode)}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </TabsContent>
          
          <TabsContent value="script" className="relative">
            <SyntaxHighlighter language="html" style={tomorrow} customStyle={{ borderRadius: '8px' }}>
              {scriptCode}
            </SyntaxHighlighter>
            <Button 
              variant="outline" 
              size="sm" 
              className="absolute top-2 right-2"
              onClick={() => copyToClipboard(scriptCode)}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </TabsContent>
          
          <TabsContent value="link" className="relative">
            <SyntaxHighlighter language="text" style={tomorrow} customStyle={{ borderRadius: '8px' }}>
              {linkCode}
            </SyntaxHighlighter>
            <Button 
              variant="outline" 
              size="sm" 
              className="absolute top-2 right-2"
              onClick={() => copyToClipboard(linkCode)}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 text-sm text-gray-500">
          <p>Use the code above to embed this form on your website or share the direct link.</p>
        </div>
      </CardContent>
    </Card>
  );
};