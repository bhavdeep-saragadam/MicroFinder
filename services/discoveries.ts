import { supabase } from '../lib/supabase';
import type { MicrobeAnalysis } from './gemini';

type Classification = 'bacteria' | 'virus' | 'fungi' | 'protozoa';

export interface Discovery {
  id: string;
  user_id: string;
  microbe_name: string;
  classification: Classification;
  image_url: string;
  characteristics: string[];
  created_at: string;
  updated_at?: string;
  confidence_score: number;
  gpt_analysis: MicrobeAnalysis;
  analysis_results?: string;
}

function validateClassification(classification: string): Classification {
  const validTypes: Classification[] = ['bacteria', 'virus', 'fungi', 'protozoa'];
  const normalized = classification.toLowerCase();
  if (validTypes.includes(normalized as Classification)) {
    return normalized as Classification;
  }
  // Default to bacteria if unknown
  console.warn(`Invalid classification "${classification}", defaulting to bacteria`);
  return 'bacteria';
}

export async function saveDiscovery(
  imageUrl: string,
  analysis: MicrobeAnalysis
): Promise<Discovery> {
  // Get the current user's session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    throw new Error('User must be authenticated to save discoveries');
  }

  const validClassification = validateClassification(analysis.classification);

  const discoveryData: any = {
    user_id: session.user.id,
    image_url: imageUrl,
    microbe_name: analysis.microbeName,
    classification: validClassification,
    confidence_score: analysis.confidence || 0,
    gpt_analysis: analysis
  };

  // Handle characteristics properly as a string array
  if (Array.isArray(analysis.characteristics)) {
    discoveryData.characteristics = analysis.characteristics;
  } else {
    discoveryData.characteristics = [];
  }

  // Add analysis_results 
  if (typeof analysis.description === 'string') {
    discoveryData.analysis_results = analysis.description;
  }

  try {
    const { data, error } = await supabase
      .from('discoveries')
      .insert(discoveryData)
      .select()
      .single();

    if (error) {
      console.error('Error saving discovery:', error);
      throw new Error('Failed to save discovery: ' + error.message);
    }

    return data;
  } catch (err) {
    console.error('Error in saveDiscovery:', err);
    throw new Error(`Failed to save discovery: ${err}`);
  }
}

export async function getDiscoveries(): Promise<Discovery[]> {
  const { data, error } = await supabase
    .from('discoveries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function getDiscoveryById(id: string): Promise<Discovery> {
  const { data, error } = await supabase
    .from('discoveries')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching discovery:', error);
    throw new Error('Failed to fetch discovery: ' + error.message);
  }
  
  return data;
}

export async function updateDiscovery(id: string, data: Partial<Discovery>): Promise<Discovery> {
  // Get the current user's session to verify ownership
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    throw new Error('User must be authenticated to update discoveries');
  }

  // If classification is being updated, validate it
  if (data.classification) {
    data.classification = validateClassification(data.classification);
  }

  // Only update fields that definitely exist in the database
  const updateFields: any = {};
  if (data.microbe_name !== undefined) updateFields.microbe_name = data.microbe_name;
  if (data.classification !== undefined) updateFields.classification = data.classification;
  
  // Only try to update analysis_results if it's provided
  if (data.analysis_results !== undefined) {
    try {
      updateFields.analysis_results = data.analysis_results;
    } catch (e) {
      console.warn('Could not update analysis_results, column may not exist:', e);
    }
  }

  const { data: updatedDiscovery, error } = await supabase
    .from('discoveries')
    .update(updateFields)
    .eq('id', id)
    .eq('user_id', session.user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating discovery:', error);
    throw new Error(`Failed to update discovery: ${error.message}`);
  }

  return updatedDiscovery;
}

export async function deleteDiscovery(id: string): Promise<void> {
  // Get the current user's session to verify ownership
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    throw new Error('User must be authenticated to delete discoveries');
  }
  
  const { error } = await supabase
    .from('discoveries')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id); // Ensures users can only delete their own discoveries
  
  if (error) {
    console.error('Error deleting discovery:', error);
    throw new Error('Failed to delete discovery: ' + error.message);
  }
} 