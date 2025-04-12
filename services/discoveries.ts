import { supabase } from '../lib/supabase';
import type { MicrobeAnalysis } from './gemini';

type Classification = 'bacteria' | 'virus' | 'fungi' | 'protozoa';

export interface Discovery {
  id: string;
  user_id: string;
  microbe_name: string;
  classification: Classification;
  image_url: string;
  analysis_results: string;
  characteristics: string[];
  created_at: string;
  confidence_score: number;
  gpt_analysis: MicrobeAnalysis;
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

  const { data, error } = await supabase
    .from('discoveries')
    .insert({
      user_id: session.user.id,
      image_url: imageUrl,
      microbe_name: analysis.microbeName,
      classification: validClassification,
      confidence_score: analysis.confidence,
      characteristics: analysis.characteristics,
      analysis_results: analysis.description,
      gpt_analysis: analysis
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving discovery:', error);
    throw new Error('Failed to save discovery: ' + error.message);
  }

  return data;
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

export async function updateDiscovery(
  id: string,
  updates: Partial<Omit<Discovery, 'id' | 'user_id' | 'created_at'>>
): Promise<Discovery> {
  // Get the current user's session to verify ownership
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    throw new Error('User must be authenticated to update discoveries');
  }
  
  // If classification is being updated, validate it
  if (updates.classification) {
    updates.classification = validateClassification(updates.classification);
  }
  
  const { data, error } = await supabase
    .from('discoveries')
    .update(updates)
    .eq('id', id)
    .eq('user_id', session.user.id) // Ensures users can only update their own discoveries
    .select()
    .single();
  
  if (error) {
    console.error('Error updating discovery:', error);
    throw new Error('Failed to update discovery: ' + error.message);
  }
  
  return data;
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