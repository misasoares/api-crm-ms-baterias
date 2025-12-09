# CRM API

Simple CRM for customer and order management, featuring automated message sending.

## Available Scripts

### Development

- `npm run start`: Starts the application.
- `npm run start:dev`: Starts the application in development mode (watch mode).
- `npm run start:debug`: Starts the application in debug mode.

### Code Quality

- `npm run lint`: Runs ESLint to check for code issues.
- `npm run format`: Formats code using Prettier.
- `npm run pr-check`: Runs a full check (format, lint, build, and tests) before opening a PR.

### Tests

- `npm run test`: Runs unit tests.
- `npm run test:e2e`: Runs end-to-end tests.
- `npm run test:cov`: Generates test coverage report.

### Build

- `npm run build`: Compiles the application for production.

## Message Handling

The API is responsible for providing clear feedback on operation results.

### Success

In case of success, the API returns an object containing:

- `success`: `true`
- `code`: HTTP Code (e.g., 200, 201)
- `data`: Response data (if any)
- `message`: Descriptive message (e.g., "Order created successfully")

### Error

In case of error, the API returns an object containing:

- `success`: `false`
- `code`: HTTP Error Code (e.g., 400, 404, 409)
- `message`: Descriptive error message (e.g., "This phone number is already linked to another customer.")
- `invalidFields`: List of invalid fields (in case of validation error)
