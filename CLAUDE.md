# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

This tool validates the accuracy of Claude API token usage reports by comparing the token counts returned by API endpoints against local tokenizer calculations. It helps detect potential discrepancies where API providers might be misreporting token consumption.

## Development Commands

```bash
# Install dependencies
npm install

# Run in development mode (with tsx)
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run built version
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Format code
npm run format
```

## Architecture Overview

The project follows a modular architecture with clear separation of concerns:

### Core Components

1. **Tokenizer Module** (`src/tokenizer/`)
   - Uses `@anthropic-ai/tokenizer` for accurate local token counting
   - Provides utilities to count tokens for both input prompts and completion responses
   - Handles different message formats (system, user, assistant)

2. **API Client Module** (`src/api/`)
   - Makes requests to Claude API endpoints (both official and custom base URLs)
   - Captures usage metadata from API responses
   - Supports configurable base URLs to test different providers

3. **Validator Module** (`src/validator/`)
   - **Core logic**: Compares local token counts against API-reported usage
   - Calculates discrepancy percentages
   - Generates validation reports with detailed breakdowns
   - This is where the main validation logic lives

4. **Reporter Module** (`src/reporter/`)
   - Formats validation results for human-readable output
   - Exports results to JSON/CSV for analysis
   - Highlights significant discrepancies

5. **CLI Interface** (`src/index.ts`)
   - Uses `commander` for argument parsing
   - Coordinates the validation workflow
   - Handles configuration from `.env` and command-line flags

### Key Validation Flow

1. User provides test prompts and API configuration
2. API Client sends request to configured endpoint
3. Local Tokenizer independently counts tokens in the same request/response
4. Validator compares the two counts and calculates variance
5. Reporter outputs findings with clear indicators of any discrepancies

### Configuration

The tool uses environment variables for sensitive configuration:

```bash
# .env file (not committed to git)
ANTHROPIC_API_KEY=sk-ant-...
CUSTOM_BASE_URL=https://your-custom-endpoint.com  # Optional: test alternative providers
OFFICIAL_BASE_URL=https://api.anthropic.com  # Default official endpoint
```

## Testing Strategy

Tests focus on:
- Tokenizer accuracy against known token counts
- API client error handling and response parsing
- Validator logic for detecting discrepancies
- End-to-end validation flows

Run specific test files:
```bash
npx vitest src/tokenizer/tokenizer.test.ts
npx vitest src/validator/validator.test.ts
```

## Important Implementation Notes

### Token Counting Specifics

- Claude uses a specific tokenizer. The `@anthropic-ai/tokenizer` package provides the official implementation.
- Token counts include special tokens for message formatting (role markers, etc.)
- System messages, user messages, and assistant responses each contribute to total usage
- The API returns `input_tokens` and `output_tokens` separately - both must be validated

### Validation Thresholds

The validator should flag discrepancies above certain thresholds (configurable):
- Minor: 1-5% variance (may be due to encoding differences)
- Moderate: 5-15% variance (suspicious)
- Critical: >15% variance (likely misreporting)

### Multi-Provider Testing

The architecture supports testing multiple providers in a single run by allowing an array of base URLs. This enables comparative analysis across different API endpoints claiming to provide Claude API compatibility.
