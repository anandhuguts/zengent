import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Brain, Cloud, Server, Settings } from "lucide-react";

interface AIModelSelectorProps {
  onModelSelect: (config: AIModelConfig) => void;
  currentConfig?: AIModelConfig;
}

export interface AIModelConfig {
  type: 'openai' | 'claude' | 'gemini' | 'local';
  openaiApiKey?: string;
  claudeApiKey?: string;
  geminiApiKey?: string;
  localEndpoint?: string;
  modelName?: string;
}

export default function AIModelSelector({ onModelSelect, currentConfig }: AIModelSelectorProps) {
  const [modelType, setModelType] = useState<'openai' | 'claude' | 'gemini' | 'local'>(currentConfig?.type || 'openai');
  const [openaiApiKey, setOpenaiApiKey] = useState(currentConfig?.openaiApiKey || '');
  const [claudeApiKey, setClaudeApiKey] = useState(currentConfig?.claudeApiKey || '');
  const [geminiApiKey, setGeminiApiKey] = useState(currentConfig?.geminiApiKey || '');
  const [localEndpoint, setLocalEndpoint] = useState(currentConfig?.localEndpoint || 'http://localhost:11434');
  const [modelName, setModelName] = useState(currentConfig?.modelName || 'llama2');

  const handleSaveConfig = () => {
    const config: AIModelConfig = {
      type: modelType,
      ...(modelType === 'openai' && { openaiApiKey }),
      ...(modelType === 'claude' && { claudeApiKey }),
      ...(modelType === 'gemini' && { geminiApiKey }),
      ...(modelType === 'local' && { localEndpoint, modelName })
    };
    onModelSelect(config);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-purple-600" />
          <span>AI Model Configuration</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose between major online LLM providers or configure a local LLM for AI analysis
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <RadioGroup value={modelType} onValueChange={(value) => setModelType(value as 'openai' | 'claude' | 'gemini' | 'local')}>
          {/* OpenAI Option */}
          <div className="flex items-start space-x-3 p-4 border rounded-lg">
            <RadioGroupItem value="openai" id="openai" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="openai" className="flex items-center space-x-2 cursor-pointer">
                <Cloud className="w-4 h-4 text-blue-600" />
                <span className="font-medium">OpenAI GPT-4o</span>
                <Badge variant="secondary" className="text-xs">Recommended</Badge>
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Use OpenAI GPT-4o for high-quality analysis and insights
              </p>
              
              {modelType === 'openai' && (
                <div className="mt-3 space-y-2">
                  <Label htmlFor="openai-key" className="text-xs font-medium">OpenAI API Key</Label>
                  <Input
                    id="openai-key"
                    type="password"
                    placeholder="sk-..."
                    value={openaiApiKey}
                    onChange={(e) => setOpenaiApiKey(e.target.value)}
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Get your API key from <a href="https://platform.openai.com/account/api-keys" target="_blank" className="text-blue-600 hover:underline">OpenAI Platform</a>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* AWS Claude Option */}
          <div className="flex items-start space-x-3 p-4 border rounded-lg">
            <RadioGroupItem value="claude" id="claude" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="claude" className="flex items-center space-x-2 cursor-pointer">
                <Cloud className="w-4 h-4 text-orange-600" />
                <span className="font-medium">AWS Claude 3.5</span>
                <Badge variant="outline" className="text-xs">Advanced</Badge>
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Use Anthropic's Claude 3.5 Sonnet for sophisticated reasoning and analysis
              </p>
              
              {modelType === 'claude' && (
                <div className="mt-3 space-y-2">
                  <Label htmlFor="claude-key" className="text-xs font-medium">Claude API Key</Label>
                  <Input
                    id="claude-key"
                    type="password"
                    placeholder="sk-ant-..."
                    value={claudeApiKey}
                    onChange={(e) => setClaudeApiKey(e.target.value)}
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Get your API key from <a href="https://console.anthropic.com/" target="_blank" className="text-orange-600 hover:underline">Anthropic Console</a>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Google Gemini Option */}
          <div className="flex items-start space-x-3 p-4 border rounded-lg">
            <RadioGroupItem value="gemini" id="gemini" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="gemini" className="flex items-center space-x-2 cursor-pointer">
                <Cloud className="w-4 h-4 text-purple-600" />
                <span className="font-medium">Google Gemini Pro</span>
                <Badge variant="outline" className="text-xs">Multimodal</Badge>
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Use Google's Gemini Pro for comprehensive code analysis and insights
              </p>
              
              {modelType === 'gemini' && (
                <div className="mt-3 space-y-2">
                  <Label htmlFor="gemini-key" className="text-xs font-medium">Gemini API Key</Label>
                  <Input
                    id="gemini-key"
                    type="password"
                    placeholder="AIza..."
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Get your API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" className="text-purple-600 hover:underline">Google AI Studio</a>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Local LLM Option */}
          <div className="flex items-start space-x-3 p-4 border rounded-lg">
            <RadioGroupItem value="local" id="local" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="local" className="flex items-center space-x-2 cursor-pointer">
                <Server className="w-4 h-4 text-green-600" />
                <span className="font-medium">Local LLM (Ollama)</span>
                <Badge variant="outline" className="text-xs">Privacy First</Badge>
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Use Ollama or other local LLM for offline, privacy-focused analysis
              </p>
              
              {modelType === 'local' && (
                <div className="mt-3 space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="local-endpoint" className="text-xs font-medium">Local Endpoint</Label>
                    <Input
                      id="local-endpoint"
                      type="url"
                      placeholder="http://localhost:11434"
                      value={localEndpoint}
                      onChange={(e) => setLocalEndpoint(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="model-name" className="text-xs font-medium">Model Name</Label>
                    <Input
                      id="model-name"
                      type="text"
                      placeholder="llama2, codellama, deepseek-coder, etc."
                      value={modelName}
                      onChange={(e) => setModelName(e.target.value)}
                      className="text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Available models: Code Llama, Deepseek Coder, StarCoder, Llama 2, Mistral
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </RadioGroup>

        <div className="pt-4 border-t">
          <Button onClick={handleSaveConfig} className="w-full">
            <Settings className="w-4 h-4 mr-2" />
            Save AI Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}