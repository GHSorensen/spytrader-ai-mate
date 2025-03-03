
/**
 * Provides utilities for accessing Schwab-related documentation
 */
export const schwabDocumentation = {
  /**
   * Get the URL to the Schwab user guide
   */
  getUserGuideUrl(): string {
    return '/src/assets/documents/schwab-user-guide.html';
  },
  
  /**
   * Open the Schwab user guide in a new window
   */
  openUserGuide(): void {
    window.open(this.getUserGuideUrl(), '_blank');
  },
  
  /**
   * Download the Schwab user guide as HTML
   */
  downloadUserGuide(): void {
    const link = document.createElement('a');
    link.href = this.getUserGuideUrl();
    link.download = 'schwab-user-guide.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
