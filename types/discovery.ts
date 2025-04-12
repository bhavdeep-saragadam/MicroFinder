export interface Discovery {
    id: string;
    microbe_name: string;
    classification: 'bacteria' | 'virus' | 'fungi' | 'protozoa';
    image_url: string;
    analysis_results: string;
    characteristics: string[];
    created_at: string;
    confidence_score?: number;
    gpt_analysis?: any; // Type for GPT analysis results
} 