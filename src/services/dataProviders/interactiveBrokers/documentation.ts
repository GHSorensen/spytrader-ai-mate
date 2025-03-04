
/**
 * Documentation helper for Interactive Brokers integration
 */
export const ibkrDocumentation = {
  /**
   * Open the IBKR user guide in a new window
   */
  openUserGuide: (): void => {
    window.open('https://www.interactivebrokers.com/en/software/api/api.htm', '_blank');
  },

  /**
   * Download the IBKR user guide PDF
   */
  downloadUserGuide: (): void => {
    const link = document.createElement('a');
    link.href = 'https://www.interactivebrokers.com/en/software/api/apiguide.pdf';
    link.download = 'ibkr-api-guide.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Open the IBKR client portal API documentation
   */
  openClientPortalDocs: (): void => {
    window.open('https://www.interactivebrokers.com/api/doc.html', '_blank');
  }
};
