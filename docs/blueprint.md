# **App Name**: LinguaLift

## Core Features:

- CSV Upload and Management: Upload multiple CSV files, each containing vocabulary data (English, Japanese, etc.). Assign a unique fileId to each uploaded file and store them in the browser's localStorage.
- Randomized Quiz Generation: Generate quizzes from a selected set of CSV files. Allow users to specify the number of questions or select 'all'.
- Diverse Question Formats: Support multiple quiz formats, including English to Japanese, Japanese to English, multiple choice (4 options), and typing (input). Automatically focus on the input field for typing questions.
- Multiple Choice Options: For multiple-choice questions, present one correct answer and three incorrect answers randomly selected from the vocabulary pool, ensuring no duplicates.
- Immediate Feedback: Provide immediate feedback on answers with visual cues such as border color changes (green for correct, red for incorrect) and a checkmark icon for correct answers. Transition to the next question after 1.2 seconds.
- Answer History and Analysis: Store and analyze answer history to identify weak words, displaying the data in a pie chart for each CSV file. Allow users to generate quizzes focusing solely on these weak words.
- Adaptive Review: Use typing review focused on incorrectly answered words, Japanese to English, after each quiz. The adaptive reviews should not be saved into the user history or statistics.

## Style Guidelines:

- Background color: Dark grey (#000000) for a modern, focused learning environment.
- Primary color: Blue (#0091FF) to provide a clean and informative environment, while contrasting effectively against the dark theme.
- Accent color: Purple (#6B5DFF) to provide an encouraging environment.  Should contrast against primary, tab card and background.
- Body and headline font: 'Inter', a grotesque-style sans-serif for a clean and modern look suitable for both headlines and body text.
- Code font: 'Source Code Pro' for displaying code snippets.
- Fixed bottom tab bar for easy navigation.
- Clear and simple icons for tab bar and feedback indicators.