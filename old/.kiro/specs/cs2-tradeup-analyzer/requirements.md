# Requirements Document

## Introduction

The CS2 Trade-up Analyzer is a feature that integrates into the existing dashboard to automatically analyze weapon combinations and calculate the profitability of CS2 trade-up contracts. The system will select 10 weapons from CSFloat listings, evaluate potential outcomes, and identify the most profitable contracts based on ROI calculations.

## Requirements

### Requirement 1

**User Story:** As a CS2 trader, I want to automatically analyze weapon combinations for trade-up contracts, so that I can identify profitable trading opportunities without manual calculation.

#### Acceptance Criteria

1. WHEN the system receives 10 weapon inputs THEN it SHALL validate that exactly 10 weapons are provided with valid float values (0-1) and prices ≥ 0
2. WHEN processing weapon data THEN the system SHALL convert price_cents to USD by dividing by 100
3. WHEN calculating average float THEN the system SHALL compute the mean of all 10 input weapon floats
4. IF any weapon data is invalid THEN the system SHALL return appropriate error messages

### Requirement 2

**User Story:** As a trader, I want the system to fetch weapon listings from CSFloat API, so that I can work with real market data for accurate profitability analysis.

#### Acceptance Criteria

1. WHEN fetching listings THEN the system SHALL use the proxy endpoint /proxy/listings with proper filters
2. WHEN API returns data THEN the system SHALL handle pagination using cursor-based navigation
3. WHEN rate limits are encountered (429) THEN the system SHALL implement exponential backoff with Retry-After header respect
4. IF API errors occur (5xx) THEN the system SHALL retry with exponential backoff
5. IF client errors occur (4xx) THEN the system SHALL NOT retry and propagate error to UI

### Requirement 3

**User Story:** As a trader, I want the system to calculate estimated outcome floats for trade-up contracts, so that I can predict the quality of resulting weapons.

#### Acceptance Criteria

1. WHEN calculating outcome floats THEN the system SHALL use the formula: avg_float * (max_float - min_float) + min_float
2. WHEN float is calculated THEN the system SHALL clamp the result between 0 and 1
3. WHEN displaying floats THEN the system SHALL round to 6 decimal places
4. WHEN categorizing wear THEN the system SHALL assign appropriate wear tags (FN, MW, FT, WW, BS) based on float thresholds

### Requirement 4

**User Story:** As a trader, I want the system to evaluate all possible contract outcomes with their probabilities, so that I can understand the risk and reward of each contract.

#### Acceptance Criteria

1. WHEN processing contract outcomes THEN the system SHALL calculate probabilities for each possible result weapon
2. WHEN outcomes are provided THEN the system SHALL use the specified probabilities, otherwise assume uniform distribution
3. WHEN fetching outcome prices THEN the system SHALL get current market prices from CSFloat API
4. WHEN outcomes include multiple weapons THEN the system SHALL handle collections, grades, and rarity classifications

### Requirement 5

**User Story:** As a trader, I want the system to calculate Expected Value (EV) and Return on Investment (ROI) for contracts, so that I can make informed trading decisions.

#### Acceptance Criteria

1. WHEN calculating EV THEN the system SHALL compute: Σ(probability_i * outcome_price_i)
2. WHEN calculating ROI THEN the system SHALL compute: (EV - total_cost) / total_cost
3. WHEN calculating total cost THEN the system SHALL sum all 10 input weapon prices in USD
4. WHEN displaying results THEN the system SHALL show ROI as percentage and return multiplier

### Requirement 6

**User Story:** As a trader, I want contracts ranked by profitability, so that I can quickly identify the best trading opportunities.

#### Acceptance Criteria

1. WHEN ranking contracts THEN the system SHALL sort by ROI (descending) as primary criteria
2. WHEN ROI values are equal THEN the system SHALL sort by EV (descending) as secondary criteria
3. WHEN EV values are equal THEN the system SHALL sort by price variance (ascending) as tertiary criteria
4. WHEN displaying rankings THEN the system SHALL show top profitable contracts first

### Requirement 7

**User Story:** As a user, I want the trade-up analyzer integrated into the existing dashboard UI, so that I can access it seamlessly within my current workflow.

#### Acceptance Criteria

1. WHEN accessing the analyzer THEN the system SHALL provide React components that integrate with existing dashboard design
2. WHEN loading data THEN the system SHALL show appropriate loading states and progress indicators
3. WHEN errors occur THEN the system SHALL display user-friendly error messages with actionable guidance
4. WHEN results are ready THEN the system SHALL provide interactive elements for exploring contract details

### Requirement 8

**User Story:** As a developer, I want the trade-up logic implemented as reusable hooks and utilities, so that the functionality can be easily maintained and extended.

#### Acceptance Criteria

1. WHEN implementing core logic THEN the system SHALL separate pure functions from React-specific code
2. WHEN creating data fetching THEN the system SHALL use React Query for remote state management
3. WHEN managing local state THEN the system SHALL use appropriate state management (Zustand if needed)
4. WHEN building utilities THEN the system SHALL create testable, pure functions in /lib directories

### Requirement 9

**User Story:** As a trader, I want to generate CSFloat permalinks for weapons, so that I can easily access detailed information about specific items.

#### Acceptance Criteria

1. WHEN generating permalinks THEN the system SHALL prefer /item/<ID> format when item ID is available
2. WHEN item ID is unavailable THEN the system SHALL fallback to /checker?inspect=<inspect_link>
3. WHEN permalinks are displayed THEN the system SHALL provide clickable links to CSFloat
4. WHEN links are invalid THEN the system SHALL handle gracefully without breaking the UI