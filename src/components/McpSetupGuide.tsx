
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Code, ExternalLink, Server, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const McpSetupGuide = () => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const setupSteps = [
    {
      title: "Install Sei MCP Server",
      description: "Clone and install the official Sei MCP server",
      commands: [
        "git clone https://github.com/sei-protocol/sei-mcp-server.git",
        "cd sei-mcp-server",
        "npm install"
      ]
    },
    {
      title: "Configure Environment",
      description: "Set up your environment variables",
      commands: [
        "cp .env.example .env",
        "# Edit .env with your configuration",
        "SEI_MAINNET_RPC=https://sei-mainnet-rpc.example.com",
        "SEI_TESTNET_RPC=https://sei-testnet-rpc.example.com"
      ]
    },
    {
      title: "Start MCP Server",
      description: "Run the MCP server on port 3001",
      commands: [
        "npm run build",
        "npm start -- --port 3001"
      ]
    },
    {
      title: "Configure Supabase",
      description: "Set the MCP server URL in your Supabase secrets",
      commands: [
        "# Add this secret in your Supabase project:",
        "SEI_MCP_SERVER_URL=http://your-mcp-server:3001/mcp"
      ]
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <Card className="bg-white/90 backdrop-blur-sm border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl text-slate-800">
            <Server className="w-6 h-6 text-blue-600" />
            Sei MCP Server Setup Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              To use real Sei blockchain data via MCP, you need to deploy the Sei MCP server. 
              Follow these steps to get started.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {setupSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      {step.title}
                    </CardTitle>
                    <p className="text-slate-600 text-sm">{step.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-green-400 text-sm">
                        {step.commands.map((cmd, cmdIndex) => (
                          <div key={cmdIndex} className="mb-1">
                            <span className="text-slate-400">$ </span>
                            {cmd}
                          </div>
                        ))}
                      </pre>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => copyToClipboard(step.commands.join('\n'))}
                    >
                      <Code className="w-4 h-4 mr-2" />
                      Copy Commands
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Production Deployment:</strong> For production use, deploy the MCP server to a cloud provider 
              (AWS, GCP, DigitalOcean, etc.) and update the SEI_MCP_SERVER_URL environment variable accordingly.
            </AlertDescription>
          </Alert>

          <div className="flex gap-4">
            <Button asChild>
              <a 
                href="https://github.com/sei-protocol/sei-mcp-server" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Sei MCP Server Repository
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a 
                href="https://modelcontextprotocol.io/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Learn about MCP
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default McpSetupGuide;
