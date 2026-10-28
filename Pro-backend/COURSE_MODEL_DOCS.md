# Course Model Documentation

## Overview

The Course model has been designed with a hierarchical structure to support organized learning content through nested chapters and subchapters. This structure allows for comprehensive course management with rich content organization.

## Model Structure

### Course → Chapters → Subchapters

```
Course
├── Basic Information (title, description, etc.)
├── Chapters[]
│   ├── Chapter 1
│   │   ├── Subchapter 1.1
│   │   ├── Subchapter 1.2
│   │   └── Subchapter 1.3
│   └── Chapter 2
│       ├── Subchapter 2.1
│       └── Subchapter 2.2
└── Course Metadata (stats, settings, etc.)
```

## Schema Details

### Course Schema

- **Basic Info**: title, description, category, level, price
- **Tutor**: Reference to Tutor model
- **Chapters**: Array of chapter subdocuments
- **Metadata**: tags, prerequisites, learning outcomes
- **Statistics**: duration, enrollment count, ratings
- **Settings**: publishing status, certificate options

### Chapter Schema

- **Basic Info**: title, description, thumbnail
- **Subchapters**: Array of subchapter subdocuments
- **Order**: For organizing chapter sequence
- **Status**: Published/unpublished state

### Subchapter Schema

- **Content**: title, description, content, video URL
- **Resources**: Downloadable files and links
- **Assessments**: Quizzes and assignments
- **Progress**: Completion status
- **Duration**: Estimated time to complete

## API Endpoints

### Course Management

```
POST   /api/V1/courses                    # Create course
GET    /api/V1/courses                    # Get all courses (with filters)
GET    /api/V1/courses/:id               # Get specific course
PUT    /api/V1/courses/:id               # Update course
DELETE /api/V1/courses/:id               # Delete course
GET    /api/V1/courses/:courseId/stats   # Get course statistics
```

### Publishing

```
PATCH  /api/V1/courses/:courseId/publish    # Publish course
PATCH  /api/V1/courses/:courseId/unpublish  # Unpublish course
```

### Chapter Management

```
POST   /api/V1/courses/:courseId/chapters                    # Add chapter
PUT    /api/V1/courses/:courseId/chapters/:chapterId        # Update chapter
DELETE /api/V1/courses/:courseId/chapters/:chapterId        # Delete chapter
PATCH  /api/V1/courses/:courseId/chapters/reorder           # Reorder chapters
```

### Subchapter Management

```
POST   /api/V1/courses/:courseId/chapters/:chapterId/subchapters                    # Add subchapter
GET    /api/V1/courses/:courseId/chapters/:chapterId/subchapters/:subchapterId     # Get subchapter
PUT    /api/V1/courses/:courseId/chapters/:chapterId/subchapters/:subchapterId     # Update subchapter
DELETE /api/V1/courses/:courseId/chapters/:chapterId/subchapters/:subchapterId     # Delete subchapter
```

## Usage Examples

### 1. Creating a Course

```javascript
POST /api/V1/courses
{
  "title": "Complete Web Development",
  "description": "Learn full-stack web development from scratch",
  "shortDescription": "Master web development",
  "category": "Technology",
  "level": "Beginner",
  "price": 99.99,
  "tutorId": "60d5ecf74f6f6d001f647b8a"
}
```

### 2. Adding a Chapter

```javascript
POST /api/V1/courses/:courseId/chapters
{
  "title": "HTML Fundamentals",
  "description": "Learn the basics of HTML",
  "order": 1
}
```

### 3. Adding a Subchapter

```javascript
POST /api/V1/courses/:courseId/chapters/:chapterId/subchapters
{
  "title": "HTML Elements",
  "description": "Understanding HTML elements and tags",
  "content": "HTML elements are the building blocks...",
  "videoUrl": "https://example.com/video1.mp4",
  "duration": 30,
  "resources": [
    {
      "title": "HTML Cheat Sheet",
      "url": "https://example.com/cheatsheet.pdf",
      "type": "pdf"
    }
  ],
  "quiz": {
    "questions": [
      {
        "question": "What does HTML stand for?",
        "options": ["HyperText Markup Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language"],
        "correctAnswer": 0,
        "explanation": "HTML stands for HyperText Markup Language"
      }
    ]
  },
  "order": 1
}
```

### 4. Getting Course with Full Structure

```javascript
GET /api/V1/courses/:courseId
// Returns complete course with all chapters and subchapters
```

### 5. Reordering Chapters

```javascript
PATCH /api/V1/courses/:courseId/chapters/reorder
{
  "chapterIds": ["chapterId1", "chapterId3", "chapterId2"]
}
```

## Model Features

### Automatic Calculations

- **Total Duration**: Automatically calculated from all subchapter durations
- **Chapter Count**: Auto-updated when chapters are added/removed
- **Subchapter Count**: Auto-updated when subchapters are added/removed

### Virtual Properties

- `chapterCount`: Returns total number of chapters
- `subchapterCount`: Returns total number of subchapters

### Instance Methods

- `addChapter(chapterData)`: Add a new chapter
- `addSubchapter(chapterId, subchapterData)`: Add subchapter to specific chapter
- `reorderChapters(chapterIds)`: Reorder chapters by ID array
- `publish()`: Publish the course

### Pre-save Middleware

Automatically updates course statistics before saving:

- Total chapters count
- Total subchapters count
- Total duration calculation

## Content Types Supported

### Subchapter Content

- Text content (HTML supported)
- Video lessons
- Downloadable resources (PDFs, documents, etc.)
- Interactive quizzes
- Assignments with due dates

### Resource Types

- `pdf`: PDF documents
- `video`: Video files
- `audio`: Audio files
- `document`: Word documents, presentations
- `link`: External links

## Progress Tracking

Each subchapter includes:

- `isCompleted`: Boolean flag for completion status
- Individual progress can be tracked per student
- Duration estimates for time planning

## Publishing Workflow

1. Create course (starts as draft)
2. Add chapters and subchapters
3. Review content
4. Publish course (makes it available to students)
5. Can unpublish to make changes

## Best Practices

### Content Organization

1. Keep chapters focused on specific topics
2. Break down complex topics into multiple subchapters
3. Include quizzes after important concepts
4. Provide downloadable resources for reference

### Duration Management

1. Set realistic duration estimates
2. Include time for quizzes and assignments
3. Consider review time in duration calculations

### Publishing Strategy

1. Complete at least one full chapter before publishing
2. Test all video links and resources
3. Review quiz questions and answers
4. Set appropriate course metadata (tags, prerequisites)

This nested structure provides maximum flexibility for creating comprehensive, well-organized courses while maintaining clear hierarchical relationships between content elements.
