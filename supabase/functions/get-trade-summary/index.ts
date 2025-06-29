
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TradeData {
  totalTrades: number;
  volumeUSD: number;
  netGainLossPercent: number;
  bestToken: string;
  worstToken: string;
  tradingBehavior: string;
}

interface RequestBody {
  tradeData: TradeData;
  type: 'summary' | 'mood';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY not found in environment variables');
    }

    const { tradeData, type }: RequestBody = await req.json();

    let prompt = '';
    let model = 'llama3-8b-8192';
    let maxTokens = 300;

    if (type === 'summary') {
      prompt = `Analyze this trading data and provide a 4-5 sentence natural language summary:
        - Total trades: ${tradeData.totalTrades}
        - Volume: $${tradeData.volumeUSD.toLocaleString()}
        - Net gain/loss: ${tradeData.netGainLossPercent}%
        - Best performing token: ${tradeData.bestToken}
        - Worst performing token: ${tradeData.worstToken}
        - Trading behavior: ${tradeData.tradingBehavior}
        
        Provide insights about their trading performance, patterns, and suggestions.`;
    } else if (type === 'mood') {
      prompt = `Based on this trading performance data, return ONLY a JSON object with mood/theme information:
        - Net gain/loss: ${tradeData.netGainLossPercent}%
        - Total trades: ${tradeData.totalTrades}
        - Volume: $${tradeData.volumeUSD.toLocaleString()}
        
        Return JSON format:
        {
          "theme_name": "string",
          "emoji": "single emoji",
          "color_theme": "green|red|blue|purple|orange|gray",
          "description": "short description",
          "sound_effect": "celebration|sad_violin|neutral|excitement|warning"
        }`;
      maxTokens = 150;
    }

    console.log(`Making Groq API request for ${type} analysis`);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: type === 'summary' 
              ? 'You are an expert cryptocurrency trading analyst. Provide clear, actionable insights.'
              : 'You are a mood analyzer. Return ONLY valid JSON. No additional text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: type === 'summary' ? 0.7 : 0.3,
        max_tokens: maxTokens
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', errorText);
      throw new Error(`Groq API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from Groq API');
    }

    console.log(`${type} analysis completed successfully`);

    // For mood type, try to parse as JSON
    if (type === 'mood') {
      try {
        const parsedContent = JSON.parse(content);
        return new Response(JSON.stringify({ content: parsedContent }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (parseError) {
        console.error('Failed to parse mood JSON:', parseError);
        // Return a fallback mood if parsing fails
        const fallbackMood = {
          theme_name: "Analysis Complete",
          emoji: "📊",
          color_theme: "blue",
          description: "Trading data analyzed",
          sound_effect: "neutral"
        };
        return new Response(JSON.stringify({ content: fallbackMood }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in get-trade-summary function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
