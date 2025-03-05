
import { IBKROptionsService } from "../IBKROptionsService";
import { DataProviderConfig } from "@/lib/types/spy/dataProvider";
import { logError } from "@/lib/errorMonitoring/core/logger";

// Mock dependencies
jest.mock("@/lib/errorMonitoring/core/logger", () => ({
  logError: jest.fn(),
}));

describe("IBKROptionsService", () => {
  let mockTwsDataService: any;
  let mockWebApiDataService: any;
  let mockConfig: DataProviderConfig;
  let optionsService: IBKROptionsService;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock dependencies
    mockTwsDataService = {
      getOptions: jest.fn(),
      getOptionChain: jest.fn(),
    };
    
    mockWebApiDataService = {
      getOptions: jest.fn(),
      getOptionChain: jest.fn(),
    };
    
    mockConfig = {
      type: "interactive-brokers",
      connectionMethod: "webapi",
    };
    
    // Create service instance
    optionsService = new IBKROptionsService(
      mockConfig,
      mockTwsDataService,
      mockWebApiDataService
    );
  });

  describe("getOptions", () => {
    it("should return options from WebAPI when connection method is webapi", async () => {
      // Arrange
      const mockOptions = [{ id: "1", type: "CALL" }];
      mockWebApiDataService.getOptions.mockResolvedValue(mockOptions);
      
      // Act
      const result = await optionsService.getOptions();
      
      // Assert
      expect(result).toEqual(mockOptions);
      expect(mockWebApiDataService.getOptions).toHaveBeenCalled();
      expect(mockTwsDataService.getOptions).not.toHaveBeenCalled();
    });
    
    it("should return options from TWS when connection method is tws", async () => {
      // Arrange
      const mockOptions = [{ id: "1", type: "CALL" }];
      optionsService = new IBKROptionsService(
        { ...mockConfig, connectionMethod: "tws" },
        mockTwsDataService,
        mockWebApiDataService
      );
      mockTwsDataService.getOptions.mockResolvedValue(mockOptions);
      
      // Act
      const result = await optionsService.getOptions();
      
      // Assert
      expect(result).toEqual(mockOptions);
      expect(mockTwsDataService.getOptions).toHaveBeenCalled();
      expect(mockWebApiDataService.getOptions).not.toHaveBeenCalled();
    });
    
    it("should return empty array and log error when WebAPI throws an error", async () => {
      // Arrange
      const mockError = new Error("API error");
      mockWebApiDataService.getOptions.mockRejectedValue(mockError);
      
      // Act
      const result = await optionsService.getOptions();
      
      // Assert
      expect(result).toEqual([]);
      expect(logError).toHaveBeenCalledWith(mockError, {
        service: 'IBKROptionsService',
        method: 'getOptions',
        connectionMethod: 'webapi'
      });
    });
  });

  describe("getOptionChain", () => {
    it("should return option chain from WebAPI when connection method is webapi", async () => {
      // Arrange
      const mockOptions = [{ id: "1", type: "CALL" }];
      mockWebApiDataService.getOptionChain.mockResolvedValue(mockOptions);
      
      // Act
      const result = await optionsService.getOptionChain("SPY");
      
      // Assert
      expect(result).toEqual(mockOptions);
      expect(mockWebApiDataService.getOptionChain).toHaveBeenCalledWith("SPY");
      expect(mockTwsDataService.getOptionChain).not.toHaveBeenCalled();
    });
    
    it("should return option chain from TWS when connection method is tws", async () => {
      // Arrange
      const mockOptions = [{ id: "1", type: "CALL" }];
      optionsService = new IBKROptionsService(
        { ...mockConfig, connectionMethod: "tws" },
        mockTwsDataService,
        mockWebApiDataService
      );
      mockTwsDataService.getOptionChain.mockResolvedValue(mockOptions);
      
      // Act
      const result = await optionsService.getOptionChain("SPY");
      
      // Assert
      expect(result).toEqual(mockOptions);
      expect(mockTwsDataService.getOptionChain).toHaveBeenCalledWith("SPY");
      expect(mockWebApiDataService.getOptionChain).not.toHaveBeenCalled();
    });
    
    it("should return empty array and log error when WebAPI throws an error", async () => {
      // Arrange
      const mockError = new Error("API error");
      mockWebApiDataService.getOptionChain.mockRejectedValue(mockError);
      
      // Act
      const result = await optionsService.getOptionChain("SPY");
      
      // Assert
      expect(result).toEqual([]);
      expect(logError).toHaveBeenCalledWith(mockError, {
        service: 'IBKROptionsService',
        method: 'getOptionChain',
        symbol: 'SPY',
        connectionMethod: 'webapi'
      });
    });
  });

  describe("getDiagnostics", () => {
    it("should return diagnostic information", () => {
      // Act
      const diagnostics = optionsService.getDiagnostics();
      
      // Assert
      expect(diagnostics).toHaveProperty("connectionMethod", "webapi");
      expect(diagnostics).toHaveProperty("lastFetchTime");
      expect(diagnostics).toHaveProperty("lastErrorMessage");
    });
    
    it("should include error message when an error occurred", async () => {
      // Arrange
      const mockError = new Error("Test error");
      mockWebApiDataService.getOptions.mockRejectedValue(mockError);
      
      // Act
      await optionsService.getOptions();
      const diagnostics = optionsService.getDiagnostics();
      
      // Assert
      expect(diagnostics.lastErrorMessage).toBe("Test error");
    });
  });
});
