import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createPublicClient, http, formatUnits } from 'viem';
import { sepolia, baseSepolia } from 'viem/chains';
import { SETU_VAULT_ADDRESSES, SETU_VAULT_ABI } from '@/lib/contracts';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Use OpenAI or Gemini API - add your preferred API key
const AI_API_KEY = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || '';
const AI_PROVIDER = process.env.AI_PROVIDER || 'openai'; // 'openai' or 'gemini'

// Create viem clients for reading contract data
const sepoliaClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

const baseSepoliaClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 AI Analysis API called');
    
    // 1. Fetch last rebalance data from Supabase
    console.log('📡 Fetching last rebalance from Supabase...');
    const { data: lastRebalance, error: rebalanceError } = await supabase
      .from('rebalance_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (rebalanceError && rebalanceError.code !== 'PGRST116') {
      console.warn('⚠️ Supabase rebalance query error:', rebalanceError);
    }

    // 2. Get REAL current balances from contracts
    console.log('💰 Reading contract balances...');
    let chainABalanceFormatted = 0;
    let chainBBalanceFormatted = 0;
    
    try {
      const [chainABalance, chainBBalance] = await Promise.all([
        sepoliaClient.readContract({
          address: SETU_VAULT_ADDRESSES[11155111],
          abi: SETU_VAULT_ABI,
          functionName: 'totalAssets',
        }),
        baseSepoliaClient.readContract({
          address: SETU_VAULT_ADDRESSES[84532],
          abi: SETU_VAULT_ABI,
          functionName: 'totalAssets',
        }),
      ]);

      chainABalanceFormatted = parseFloat(formatUnits(chainABalance as bigint, 6));
      chainBBalanceFormatted = parseFloat(formatUnits(chainBBalance as bigint, 6));
      console.log(`✅ Chain A: ${chainABalanceFormatted}, Chain B: ${chainBBalanceFormatted}`);
    } catch (contractError: any) {
      console.error('❌ Contract read error:', contractError.message);
      throw new Error(`Failed to read contract balances: ${contractError.message}`);
    }
    
    // 3. Get upcoming unlocks in next 24 hours from Supabase
    console.log('📅 Fetching upcoming unlocks...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const { data: upcomingUnlocks, error: unlocksError } = await supabase
      .from('lp_unlocks')
      .select('*')
      .lte('unlock_timestamp', tomorrow.toISOString())
      .gte('unlock_timestamp', new Date().toISOString())
      .eq('is_processed', false);

    if (unlocksError) {
      console.warn('⚠️ Supabase unlocks query error:', unlocksError);
    }

    // Calculate total upcoming free USDC
    const totalUpcomingChainA = upcomingUnlocks?.reduce((sum, u) => sum + parseFloat(u.amount_chain_a || '0'), 0) || 0;
    const totalUpcomingChainB = upcomingUnlocks?.reduce((sum, u) => sum + parseFloat(u.amount_chain_b || '0'), 0) || 0;

    // Prepare data for AI
    const analysisData = {
      lastRebalance: {
        timestamp: lastRebalance?.timestamp || new Date(0).toISOString(),
        chainAAfterRebalance: lastRebalance ? parseFloat(lastRebalance.assets_transferred || '0') : 0,
        chainBAfterRebalance: lastRebalance ? parseFloat(lastRebalance.assets_transferred || '0') : 0,
      },
      currentBalances: {
        chainA: chainABalanceFormatted,
        chainB: chainBBalanceFormatted,
        imbalance: Math.abs(chainABalanceFormatted - chainBBalanceFormatted),
      },
      upcomingUnlocks: {
        chainA: totalUpcomingChainA,
        chainB: totalUpcomingChainB,
        count: upcomingUnlocks?.length || 0,
        details: upcomingUnlocks || [],
      },
    };

    console.log('📊 Analysis data prepared:', JSON.stringify(analysisData, null, 2));

    // 4. Send to AI for analysis (only if API key exists)
    let aiResponse;
    
    if (!AI_API_KEY) {
      console.warn('⚠️ No AI API key found, using rule-based analysis');
      // Fallback: Simple rule-based analysis
      const totalAssets = chainABalanceFormatted + chainBBalanceFormatted;
      const imbalancePercent = totalAssets > 0 ? (analysisData.currentBalances.imbalance / (totalAssets / 2)) * 100 : 0;
      const needsRebalance = imbalancePercent > 10 && analysisData.currentBalances.imbalance > 1; // More than 10% AND more than $1
      
      // Calculate confidence based on imbalance severity and upcoming unlocks
      let confidence = needsRebalance ? 85 : 95;
      if (imbalancePercent > 50) confidence = 95;
      else if (imbalancePercent > 30) confidence = 92;
      else if (imbalancePercent > 20) confidence = 88;
      
      aiResponse = {
        needsRebalance,
        confidence,
        reasoning: [
          `Analyzed current balances: Chain A has $${chainABalanceFormatted.toLocaleString()}, Chain B has $${chainBBalanceFormatted.toLocaleString()}`,
          `Imbalance is ${imbalancePercent.toFixed(2)}% of average balance`,
          needsRebalance 
            ? `Imbalance exceeds 10% threshold - rebalancing recommended`
            : `System is balanced - no action needed`,
          `Upcoming unlocks: $${(totalUpcomingChainA + totalUpcomingChainB).toLocaleString()} in next 24h`,
        ],
        suggestedAmount: needsRebalance ? (chainABalanceFormatted - chainBBalanceFormatted) / 2 : 0,
        urgency: imbalancePercent > 50 ? 'high' : imbalancePercent > 20 ? 'medium' : 'low',
        riskFactors: needsRebalance 
          ? ['Significant liquidity imbalance detected', 'May impact withdrawal capacity on lower-balance chain']
          : [],
      };
    } else {
      const aiPrompt = `You are Setu-Agent, a DeFi rebalancing AI. Analyze this cross-chain liquidity data and provide a JSON response.

Data:
- Last Rebalance: ${lastRebalance ? new Date(lastRebalance.timestamp).toLocaleString() : 'Never'}
- Current Chain A (Sepolia) Balance: $${analysisData.currentBalances.chainA.toLocaleString()} USDC
- Current Chain B (Base Sepolia) Balance: $${analysisData.currentBalances.chainB.toLocaleString()} USDC
- Current Imbalance: $${analysisData.currentBalances.imbalance.toLocaleString()}
- Upcoming unlocks (24h) Chain A: $${analysisData.upcomingUnlocks.chainA.toLocaleString()}
- Upcoming unlocks (24h) Chain B: $${analysisData.upcomingUnlocks.chainB.toLocaleString()}

Analyze if rebalancing is needed. Consider:
1. Current imbalance severity (>10% of total assets should trigger rebalance)
2. Upcoming liquidity demands (ensure sufficient liquidity for withdrawals)
3. Cost efficiency (typical bridge cost ~$2-5, should be worth it)
4. Risk of insufficient liquidity on either chain

Respond ONLY with valid JSON in this exact format:
{
  "needsRebalance": true/false,
  "confidence": 0-100,
  "reasoning": ["step 1", "step 2", "step 3"],
  "suggestedAmount": number (positive = A to B, negative = B to A, 0 = no rebalance),
  "urgency": "low"/"medium"/"high",
  "riskFactors": ["factor 1", "factor 2"]
}`;

      console.log('🤖 Calling AI API...');
      
      try {
        if (AI_PROVIDER === 'openai') {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${AI_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: 'You are a DeFi rebalancing AI. Always respond with valid JSON only.' },
                { role: 'user', content: aiPrompt }
              ],
              temperature: 0.3,
            }),
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenAI API error:', errorText);
            throw new Error(`OpenAI API error: ${response.status}`);
          }
          
          const data = await response.json();
          const content = data.choices[0].message.content;
          console.log('🤖 AI Response:', content);
          
          // Extract JSON from markdown code blocks if present
          const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
          aiResponse = JSON.parse(jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content);
        } else if (AI_PROVIDER === 'gemini') {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${AI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: aiPrompt }] }],
              generationConfig: { temperature: 0.3 },
            }),
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API error:', errorText);
            throw new Error(`Gemini API error: ${response.status}`);
          }
          
          const data = await response.json();
          const content = data.candidates[0].content.parts[0].text;
          console.log('🤖 AI Response:', content);
          
          // Extract JSON from markdown code blocks if present
          const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
          aiResponse = JSON.parse(jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content);
        }
      } catch (aiError: any) {
        console.error('AI API call failed, using fallback:', aiError.message);
        // Fallback if AI fails
        const totalAssets = chainABalanceFormatted + chainBBalanceFormatted;
        const imbalancePercent = totalAssets > 0 ? (analysisData.currentBalances.imbalance / (totalAssets / 2)) * 100 : 0;
        const needsRebalance = imbalancePercent > 10;
        
        aiResponse = {
          needsRebalance,
          confidence: needsRebalance ? 95 : 85,
          reasoning: [
            `AI unavailable - using rule-based analysis`,
            `Imbalance is ${imbalancePercent.toFixed(2)}% of average balance`,
            needsRebalance ? `Rebalancing recommended` : `System is balanced`,
          ],
          suggestedAmount: needsRebalance ? (chainABalanceFormatted - chainBBalanceFormatted) / 2 : 0,
          urgency: imbalancePercent > 20 ? 'high' : imbalancePercent > 10 ? 'medium' : 'low',
          riskFactors: [],
        };
      }
    }

    console.log('✅ Analysis complete');

    // Return comprehensive analysis
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: analysisData,
      aiAnalysis: aiResponse,
    });

  } catch (error: any) {
    console.error('❌ AI Analysis error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
