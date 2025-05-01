
export class BaseService {
  private static useBackendFlag: boolean = true;
  
  /**
   * Check if backend integration should be used
   */
  static useBackend(): boolean {
    return BaseService.useBackendFlag;
  }
  
  /**
   * Set whether to use backend API
   */
  static setUseBackend(useBackend: boolean): void {
    BaseService.useBackendFlag = useBackend;
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
