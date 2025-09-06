# Implementation Plan

- [ ] 1. Set up core mathematical utilities for trade-up calculations
  - Create pure functions for float averaging, outcome estimation, and wear tag classification
  - Implement input validation for exactly 10 weapons with valid float ranges (0-1)
  - Add comprehensive unit tests for all mathematical operations
  - _Requirements: 1.1, 3.1, 3.2, 3.3, 3.4_

- [ ] 2. Implement economic analysis utilities
  - Create functions for Expected Value (EV) calculation using probability × outcome_price formula
  - Implement ROI calculation as (EV - total_cost) / total_cost
  - Add contract ranking algorithm (ROI desc, EV desc, variance asc)
  - Write unit tests for all economic calculations
  - _Requirements: 5.1, 5.2, 5.3, 6.1, 6.2, 6.3_

- [ ] 3. Extend API layer for trade-up specific data fetching
  - Enhance existing listings API functions to support trade-up weapon selection
  - Add market price fetching for outcome weapons
  - Implement proper error handling with exponential backoff for 429/5xx errors
  - Create unit tests with mocked API responses
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 4. Create CSFloat permalink utility functions
  - Implement buildCsfloatPermalink function with /item/<ID> preference
  - Add fallback to /checker?inspect=<inspect_link> when ID unavailable
  - Handle edge cases gracefully without breaking UI
  - Write unit tests for all permalink scenarios
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 5. Implement core trade-up engine hook
  - Create useTradeupEngine hook that orchestrates weapon selection to profitability analysis
  - Integrate with React Query for remote state management
  - Implement proper loading states and error handling
  - Add memoization for expensive calculations
  - Write integration tests for the complete hook workflow
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 6. Build WeaponSelector component
  - Create component for selecting exactly 10 weapons from CSFloat listings
  - Implement validation for weapon count, float values, and prices
  - Integrate with existing ListingCard components for consistent UI
  - Add selection progress indicators and validation feedback
  - Write component tests for selection logic and validation
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 7.1, 7.2, 7.3_

- [ ] 7. Create ContractOutcomes display component
  - Build component to display all possible contract outcomes with probabilities
  - Show estimated floats, wear tags, and market prices for each outcome
  - Implement sorting and filtering capabilities for outcomes
  - Add visual indicators for profitability and risk assessment
  - Write component tests for rendering and interaction logic
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 7.1, 7.3, 7.4_

- [ ] 8. Implement ProfitabilityAnalysis component
  - Create component displaying EV, ROI, return multiple, and break-even analysis
  - Add visual charts and metrics for profit distribution
  - Implement risk assessment indicators and confidence displays
  - Ensure consistent styling with existing dashboard design system
  - Write component tests for metric calculations and visual representations
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 7.1, 7.3, 7.4_

- [ ] 9. Build main TradeupAnalyzer page component
  - Create main container component orchestrating the complete trade-up workflow
  - Implement proper layout using existing dashboard design patterns
  - Add error boundaries and loading states for the entire feature
  - Integrate all sub-components (WeaponSelector, ContractOutcomes, ProfitabilityAnalysis)
  - Write integration tests for the complete page workflow
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 8.1_

- [ ] 10. Integrate trade-up analyzer into dashboard navigation and routing
  - Add /tradeups route to existing dashboard routing system
  - Create navigation menu item in existing toolbar/sidebar
  - Ensure consistent styling and user experience with current dashboard
  - Test navigation flow and route handling
  - _Requirements: 7.1, 7.4_

- [ ] 11. Add comprehensive error handling and user feedback
  - Implement validation error messages for weapon selection and input data
  - Add user-friendly error messages for API failures with actionable guidance
  - Create fallback states for missing market data or calculation errors
  - Integrate with existing dashboard error handling patterns
  - Write tests for all error scenarios and recovery strategies
  - _Requirements: 1.4, 2.4, 2.5, 7.3_

- [ ] 12. Create Zustand store for trade-up state management
  - Implement store for managing selected weapons, analysis results, and UI state
  - Add actions for weapon selection, analysis triggering, and state reset
  - Integrate with existing dashboard state management patterns
  - Write tests for store actions and state transitions
  - _Requirements: 8.2, 8.3, 8.4_

- [ ] 13. Implement performance optimizations
  - Add React Query caching for market price data and weapon listings
  - Implement debounced searches to prevent excessive API calls
  - Add memoization for expensive calculations (EV, ROI, float estimations)
  - Optimize component re-renders with React.memo and useMemo
  - Write performance tests to verify optimization effectiveness
  - _Requirements: 8.4_

- [ ] 14. Add comprehensive test coverage for all components and utilities
  - Write unit tests for all pure functions in /lib/tradeups/
  - Create component tests for all React components
  - Add integration tests for the complete trade-up analysis workflow
  - Implement API mocking for reliable test execution
  - Ensure test coverage meets project standards (≥70%)
  - _Requirements: 8.4_