
// MCP Client for communicating with Sei MCP Server
export interface MCPRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: any;
}

export interface MCPResponse {
  jsonrpc: "2.0";
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export class SeiMCPClient {
  private mcpServerUrl: string;
  private requestId: number = 1;
  private initialized: boolean = false;

  constructor(mcpServerUrl?: string) {
    // Use environment variable or fallback to default
    this.mcpServerUrl = mcpServerUrl || 
      Deno.env.get('SEI_MCP_SERVER_URL') || 
      'http://localhost:3001/mcp';
  }

  private async sendRequest(method: string, params?: any): Promise<MCPResponse> {
    const request: MCPRequest = {
      jsonrpc: "2.0",
      id: this.requestId++,
      method,
      params
    };

    console.log(`Sending MCP request to ${this.mcpServerUrl}:`, JSON.stringify(request, null, 2));

    try {
      const response = await fetch(this.mcpServerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      if (!response.ok) {
        throw new Error(`MCP Server HTTP error: ${response.status} ${response.statusText}`);
      }

      const mcpResponse: MCPResponse = await response.json();
      console.log(`MCP response for ${method}:`, JSON.stringify(mcpResponse, null, 2));
      
      if (mcpResponse.error) {
        throw new Error(`MCP Error [${mcpResponse.error.code}]: ${mcpResponse.error.message}`);
      }

      return mcpResponse;
    } catch (error) {
      console.error(`MCP request failed for ${method}:`, error);
      throw error;
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      console.log(`Initializing MCP client with server: ${this.mcpServerUrl}`);
      const response = await this.sendRequest('initialize', {
        protocolVersion: "2024-11-05",
        capabilities: {
          tools: {}
        },
        clientInfo: {
          name: "sei-portfolio-client",
          version: "1.0.0"
        }
      });
      
      console.log('MCP Client initialized successfully:', response.result);
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize MCP client:', error);
      throw new Error(`MCP initialization failed: ${error.message}`);
    }
  }

  async listTools(): Promise<MCPTool[]> {
    try {
      const response = await this.sendRequest('tools/list');
      const tools = response.result?.tools || [];
      console.log(`Available MCP tools: ${tools.map((t: MCPTool) => t.name).join(', ')}`);
      return tools;
    } catch (error) {
      console.error('Failed to list MCP tools:', error);
      throw error;
    }
  }

  async callTool(name: string, arguments_: Record<string, any>): Promise<any> {
    try {
      console.log(`Calling MCP tool ${name} with args:`, arguments_);
      const response = await this.sendRequest('tools/call', {
        name,
        arguments: arguments_
      });
      return response.result;
    } catch (error) {
      console.error(`Failed to call MCP tool ${name}:`, error);
      throw error;
    }
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      await this.sendRequest('ping');
      return true;
    } catch (error) {
      console.warn('MCP server health check failed:', error.message);
      return false;
    }
  }

  // Sei-specific methods using MCP tools
  async getAccountBalance(address: string, network: string = 'mainnet'): Promise<any> {
    return await this.callTool('get_account_balance', {
      address,
      network
    });
  }

  async getTransactionHistory(address: string, network: string = 'mainnet', limit: number = 50): Promise<any> {
    return await this.callTool('get_transaction_history', {
      address,
      network,
      limit
    });
  }

  async getAccountInfo(address: string, network: string = 'mainnet'): Promise<any> {
    return await this.callTool('get_account_info', {
      address,
      network
    });
  }

  async getStakingInfo(address: string, network: string = 'mainnet'): Promise<any> {
    return await this.callTool('get_staking_info', {
      address,
      network
    });
  }

  async getTokenBalances(address: string, network: string = 'mainnet'): Promise<any> {
    return await this.callTool('get_token_balances', {
      address,
      network
    });
  }

  async getDelegations(address: string, network: string = 'mainnet'): Promise<any> {
    return await this.callTool('get_delegations', {
      address,
      network
    });
  }

  async getRewards(address: string, network: string = 'mainnet'): Promise<any> {
    return await this.callTool('get_rewards', {
      address,
      network
    });
  }
}
