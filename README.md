Hello giazz my name is khushal kumar sahu , 
and i want to tell u gaizz that i am going to create 
a new kingdome named khushal-Mention"

# Summarizer App

A full-stack web application for document summarization, featuring interactive notebooks, mind maps, quizzes, and chat functionality.

## Features

- **Document Upload**: Upload PDF and text documents for summarization
- **AI-Powered Summarization**: Generate concise summaries using advanced NLP techniques
- **Interactive Notebook**: Edit and organize summarized content
- **Mind Maps**: Visualize relationships and concepts from your documents
- **Quiz Generation**: Create and take quizzes based on summarized content
- **Real-time Chat**: Discuss and collaborate on document insights
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **TipTap** - Rich text editor
- **Lucide React** - Icon library

### Backend
- **Python** - Server-side language
- **Flask** - Web framework
- **NLP Libraries** - For text processing and summarization

## Installation

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.8 or higher)
- npm or yarn

### Frontend Setup
1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Run the Flask server:
   ```bash
   python main.py
   ```

## Usage

1. Open your browser and navigate to `http://localhost:5173` (frontend)
2. Upload a document (PDF or text file)
3. Wait for the AI to generate a summary
4. Explore the summarized content in the notebook
5. Create mind maps to visualize concepts
6. Generate and take quizzes
7. Use the chat feature to discuss insights

## API Endpoints

The backend provides the following main endpoints:

- `POST /upload` - Upload documents for summarization
- `GET /summary/:id` - Retrieve document summary
- `POST /quiz/generate` - Generate quiz questions
- `GET /mindmap/:id` - Get mind map data

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── chat/          # Chat-related components
│   │   ├── mindmap/       # Mind map visualization
│   │   ├── quiz/          # Quiz components
│   │   └── upload/        # File upload components
│   ├── pages/             # Main application pages
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   └── Layouts/           # Layout components
├── backend/
│   ├── summarizer_app/
│   │   ├── routes.py      # API routes
│   │   ├── summarizer.py  # Summarization logic
│   │   └── utils.py       # Utility functions
│   └── uploads/           # Uploaded files storage
└── public/                # Static assets
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Code Quality

- ESLint for JavaScript/TypeScript linting
- TypeScript for type checking
- Prettier for code formatting (recommended)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or need help, please open an issue on GitHub or contact the development team.
