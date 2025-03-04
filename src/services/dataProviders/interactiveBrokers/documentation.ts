
/**
 * Documentation helper for Interactive Brokers integration
 */
export const ibkrDocumentation = {
  /**
   * Open the IBKR user guide in a new window
   */
  openUserGuide: (): void => {
    window.open('https://www.interactivebrokers.com/campus/ibkr-api-page/web-api/', '_blank');
  },

  /**
   * Download the IBKR user guide PDF
   */
  downloadUserGuide: (): void => {
    const link = document.createElement('a');
    link.href = 'https://www.interactivebrokers.com/campus/ibkr-api-page/web-api/docs/web-api-guide.pdf';
    link.download = 'ibkr-web-api-guide.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Open the IBKR client portal API documentation
   */
  openClientPortalDocs: (): void => {
    window.open('https://www.interactivebrokers.com/campus/ibkr-api-page/web-api/reference/trading/', '_blank');
  },
  
  /**
   * Open the IBKR API settings page where users can create Client IDs
   */
  openAPISettings: (): void => {
    window.open('https://www.interactivebrokers.com/secure/settings/client-portal', '_blank');
  },
  
  /**
   * Open documentation explaining what a Client ID is and how to create one
   */
  openClientIDHelp: (): void => {
    window.open('https://interactivebrokers.github.io/cpwebapi/oauth/', '_blank');
  }
};
