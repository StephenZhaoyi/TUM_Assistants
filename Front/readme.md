# TUM Administrative Document Generator

A modern web application for generating high-quality administrative documents using AI assistance. Built with React, Tailwind CSS, and Vite.

## Features

- **Multi-language Support**: English and German interface with easy language switching
- **Structured Input Generation**: Generate documents by filling out forms with specific fields
- **Free Text Generation**: Create documents using natural language prompts
- **Draft Editor**: Edit and refine generated documents
- **History Management**: View and manage all generated drafts
- **TUM Branding**: Complete TUM color scheme and logo integration
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Language Support

The application supports two languages:
- **English** (default)
- **German** (Deutsch)

Users can switch between languages using the language switcher in the header. The language preference is saved in localStorage and persists across sessions.

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd TUM_Assistants
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Dashboard
- View recent drafts and quick statistics
- Access different generation methods
- Navigate to history and other features

### Structured Input
- Select document type (Announcement, Student Notice, Meeting Minutes, Formal Letter)
- Choose target audience
- Enter key content points
- Select tone (Neutral, Friendly, Polite but Firm)
- Generate professional documents

### Free Text Generation
- Use natural language to describe your document requirements
- Generate documents with AI assistance

### Draft Editor
- Edit generated documents
- Save changes
- Export or share documents

### History
- View all generated drafts
- Search and filter documents
- Copy, edit, or delete drafts

## Technology Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router
- **State Management**: React Context API
- **Internationalization**: Custom translation system

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.jsx      # Main layout with navigation
│   ├── ToneSelector.jsx # Tone selection component
│   └── LanguageSwitcher.jsx # Language switching component
├── pages/              # Page components
│   ├── Dashboard.jsx   # Main dashboard
│   ├── StructuredInput.jsx # Structured input form
│   ├── FreePromptInput.jsx # Free text input
│   ├── DraftEditor.jsx # Document editor
│   └── DraftHistory.jsx # History page
├── contexts/           # React contexts
│   └── LanguageContext.jsx # Language management
├── translations/       # Translation files
│   ├── en.js          # English translations
│   ├── de.js          # German translations
│   └── index.js       # Translation utilities
└── main.jsx           # Application entry point
```

## Customization

### Adding New Languages

1. Create a new translation file in `src/translations/` (e.g., `fr.js`)
2. Add the language to the `LanguageSwitcher` component
3. Update the `LanguageContext` to include the new language code

### Modifying TUM Branding

The application uses TUM brand colors defined in `tailwind.config.js`:
- TUM Blue: `#0066B3`
- TUM Orange: `#E37222`
- TUM Gray: `#425563`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or support, please contact the development team or create an issue in the repository.
