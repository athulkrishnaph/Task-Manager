# Task Manager - Angular 19 Application

A comprehensive task management application built with Angular 19, featuring MobX state management, rich text editing, calendar integration, and nested comments system.

## 🚀 Features

### ✅ Core Features
- **Task Management**: Create, read, update, and delete tasks
- **Task Status Tracking**: Pending, In Progress, and Completed states
- **Rich Text Editor**: Full-featured description editing with Quill.js
- **Nested Comments**: Multi-level comment system with replies
- **Calendar Integration**: FullCalendar view with task deadlines
- **Responsive Design**: Modern UI that works on all devices

### 🎯 Technical Features
- **Angular 19**: Latest Angular with standalone components
- **MobX State Management**: Reactive state management
- **TypeScript**: Full type safety
- **Modern UI/UX**: Beautiful, intuitive interface
- **Real-time Updates**: Reactive data flow with MobX

## 📋 Task List Page
- Display all tasks with filtering by status
- Statistics dashboard showing task counts
- Add/Edit tasks with form validation
- Delete tasks with confirmation
- Status updates with dropdown
- Responsive card-based layout

## 📝 Task Details Page
- Full task information display
- Rich text editor for descriptions
- Status management
- Comments system with nested replies
- Real-time updates

## 📅 Calendar View
- Monthly, weekly, and daily views
- Color-coded tasks by status
- Click to navigate to task details
- Statistics and legend
- Quick actions

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd taskManager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200`

## 🏗️ Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── task-list/          # Task list component
│   │   ├── task-details/       # Task details component
│   │   └── calendar/           # Calendar component
│   ├── models/
│   │   ├── task.model.ts       # Task interfaces
│   │   └── comment.model.ts    # Comment interfaces
│   ├── stores/
│   │   ├── task.store.ts       # MobX task store
│   │   ├── comment.store.ts    # MobX comment store
│   │   └── root.store.ts       # Root store
│   ├── app.component.*         # Main app component
│   ├── app.config.ts           # App configuration
│   └── app.routes.ts           # Routing configuration
├── styles.css                  # Global styles
└── main.ts                     # Application entry point
```

## 🎨 Key Technologies

- **Angular 19**: Framework with standalone components
- **MobX**: State management
- **Quill.js**: Rich text editor
- **FullCalendar**: Calendar integration
- **TypeScript**: Type safety
- **CSS3**: Modern styling with flexbox/grid

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:
- Desktop computers
- Tablets
- Mobile phones
- Various screen sizes

## 🔧 Available Scripts

- `npm start`: Start development server
- `npm run build`: Build for production
- `npm run watch`: Build and watch for changes
- `npm test`: Run unit tests

## 🎯 Assignment Requirements Met

### ✅ Mandatory Features
- [x] Task List Page with CRUD operations
- [x] Task Details Page with rich text editor
- [x] Comments system with nested replies
- [x] Angular 19 with standalone components
- [x] Angular Router for navigation
- [x] Clean, well-structured code

### ✅ Bonus Features
- [x] MobX state management
- [x] Calendar integration with FullCalendar
- [x] Color-coded tasks by status
- [x] Modern, responsive UI design
- [x] Rich text editor with formatting options

## 🚀 Getting Started

1. The application will automatically redirect to `/tasks` on startup
2. Use the navigation bar to switch between Tasks and Calendar views
3. Click "Add New Task" to create your first task
4. Click on any task to view details and add comments
5. Use the calendar view to see tasks by deadline

## 📊 Sample Data

The application comes with pre-loaded sample tasks to demonstrate functionality:
- Complete Angular Assignment (In Progress)
- Review Code Quality (Pending)
- Write Documentation (Pending)
- Setup Testing Framework (Completed)

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface
- **Intuitive Navigation**: Easy-to-use navigation system
- **Visual Feedback**: Loading states, hover effects, transitions
- **Accessibility**: Proper focus management and keyboard navigation
- **Mobile-First**: Responsive design that works on all devices

## 🔮 Future Enhancements

Potential improvements for production use:
- User authentication and authorization
- Real-time collaboration
- File attachments
- Task templates
- Advanced filtering and search
- Export/import functionality
- Email notifications
- API integration

## 📄 License

This project is created for educational purposes as part of an Angular developer assignment.

---

**Built with ❤️ using Angular 19, MobX, and modern web technologies**