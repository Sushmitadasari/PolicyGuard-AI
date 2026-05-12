# PolicyGuard AI

**Professional Desktop Application for Privacy Protection and App Analysis**

PolicyGuard AI is a high-precision, commercial-grade desktop application scanner built with Electron and React. It is designed to provide users with deep insights into installed applications, intelligent privacy risk assessments, and a robust filtering engine to eliminate system noise. 

## Key Features

- **Advanced Application Scanner**: High-precision discovery of installed applications across the system.
- **Rule-Based Filtering Engine**: Intelligently eliminates system noise, background services, and development artifacts to present only relevant user-facing applications.
- **Dynamic Privacy Risk Assessment**: Intelligent analysis of application permissions and behaviors to assign privacy risk scores.
- **Native Icon Extraction**: Seamless extraction and rendering of native application icons for a polished UI experience.
- **High-Performance UI**: A modern, responsive, and dynamic user interface built with React, ensuring a premium user experience.

## Tech Stack

- **Framework**: [Electron](https://www.electronjs.org/) (v30)
- **Frontend**: [React](https://reactjs.org/) (v18)
- **Styling**: Modern, responsive CSS
- **Build Tooling**: Electron Builder, React Scripts, Concurrently

## Prerequisites

- Node.js (>= 22.11.0)
- npm (>= 10.0.0)

## Getting Started

### Installation

1. Clone the repository or navigate to the project directory:
   ```bash
   cd PolicyGuardAI
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

To start the application in development mode (running both the React development server and the Electron wrapper concurrently):

```bash
npm run dev
```

### Available Scripts

- `npm run dev`: Starts the React app and Electron app simultaneously for development.
- `npm run start`: Starts the compiled Electron application.
- `npm run react-start`: Starts only the React development server.
- `npm run build`: Builds the React app and creates the executable for Windows using `electron-builder`.
- `npm run react-build`: Builds the React app for production.
- `npm run test`: Runs the Jest test suite.
- `npm run lint`: Runs ESLint to check for code quality issues.

## Building for Production

To create a distributable Windows executable (NSIS Installer or Portable version), run:

```bash
npm run build
```

The output files will be generated in the `dist` or configured build directory, ready for distribution.

## License

This project is licensed under the MIT License.
