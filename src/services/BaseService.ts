
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class BaseService {
  private static supabase: SupabaseClient | null = null;
  private static useSupabaseFlag: boolean = false;
  
  /**
   * Initialize Supabase client
   */
  static initSupabase(supabaseUrl: string, supabaseKey: string): void {
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase URL and key must be provided');
      return;
    }
    
    BaseService.supabase = createClient(supabaseUrl, supabaseKey);
    BaseService.useSupabaseFlag = true;
    console.log('Supabase client initialized');
  }
  
  /**
   * Check if Supabase is initialized and should be used
   */
  static useSupabase(): boolean {
    return BaseService.useSupabaseFlag && !!BaseService.supabase;
  }
  
  /**
   * Get Supabase client instance
   */
  static getSupabase(): SupabaseClient | null {
    return BaseService.supabase;
  }
  
  /**
   * Set whether to use Supabase or REST API
   */
  static setUseSupabase(useSupabase: boolean): void {
    if (useSupabase && !BaseService.supabase) {
      console.warn('Supabase client not initialized. Call initSupabase first.');
    }
    BaseService.useSupabaseFlag = useSupabase && !!BaseService.supabase;
  }
  
  /**
   * Helper method to format date
   */
  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-MA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
  
  /**
   * Helper method to format currency
   */
  static formatCurrency(amount: number, currency: string = 'MAD'): string {
    return `${amount.toLocaleString('fr-MA')} ${currency}`;
  }
  
  /**
   * Create a debounced function
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T, 
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: number | null = null;
    
    return function(...args: Parameters<T>) {
      const later = () => {
        timeout = null;
        func(...args);
      };
      
      if (timeout !== null) {
        clearTimeout(timeout);
      }
      
      timeout = window.setTimeout(later, wait) as unknown as number;
    };
  }
}
