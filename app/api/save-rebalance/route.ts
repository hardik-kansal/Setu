import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const rebalanceData = await request.json();

    console.log('💾 Saving rebalance to Supabase:', rebalanceData);

    // Insert into rebalance_logs table
    const { data, error } = await supabase
      .from('rebalance_logs')
      .insert([rebalanceData])
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase insert error:', error);
      throw error;
    }

    console.log('✅ Rebalance saved successfully:', data.id);

    return NextResponse.json({
      success: true,
      data,
    });

  } catch (error: any) {
    console.error('❌ Save rebalance error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to save rebalance',
      },
      { status: 500 }
    );
  }
}
