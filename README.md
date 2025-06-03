# Msgtrik

A modern, real-time chat application built with React and TypeScript.

## Andrii Melnyk, KV-41mn

[Report Lab1](https://docs.google.com/document/d/1NfeKkkB2i3yWIBUNgWBOOm8jlvlx1AUaprMCG2DE2oI/edit?usp=sharing).
[Report Lab2](https://docs.google.com/document/d/1O61tKBbAkCLwtJm4CdnPTOoFHLV1JDz068VSJIzR2FA/edit?usp=sharing).

## Features

- Real-time messaging
- User authentication
- Message read status
- Recent chats list
- User search
- Responsive design

## Technology Stack

- React
- TypeScript
- Redux Toolkit for state management
- Vite for build tooling
- shadcn/ui components
- Tailwind CSS for styling
- Vitest for unit testing
- Cypress for end-to-end testing

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm or yarn

### Installation

```sh
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd msgtrik

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run build:dev` - Create development build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Testing

The project includes both unit tests (Vitest) and end-to-end tests (Cypress).

### Unit Tests

```sh
# Run unit tests once
npm run test

# Run unit tests in watch mode
npm run test:watch
```

### End-to-End Tests

```sh
# Open Cypress Test Runner (interactive mode)
npm run cypress:open

# Run Cypress tests in headless mode
npm run test:e2e
```

Running with coverage

```sh
CYPRESS_COVERAGE=true npm run test:e2e
# then

npx nyc report --reporter=text
```

Note: End-to-end tests require the development server to be running on port 8080. The `test:e2e` command will automatically start the server before running tests.

#### Writing Tests

- Unit tests are located in `*.test.tsx` files next to the components they test
- End-to-end tests are located in the `cypress/e2e` directory
- Use `data-testid` attributes for element selection in tests

## Project Structure

```
src/
├── app/          # Redux store setup
├── components/   # Reusable UI components
├── features/     # Feature-specific components and logic
├── hooks/        # Custom React hooks
├── pages/        # Application pages/routes
├── services/     # API services
└── utils/        # Utility functions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
