import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';

// Components
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import UsersList from './pages/users/UsersList';
import UserForm from './pages/users/UserForm';
import MentorshipList from './pages/mentorship/MentorshipList';
import MentorshipForm from './pages/mentorship/MentorshipForm';
import SessionsList from './pages/sessions/SessionsList';
import SessionForm from './pages/sessions/SessionForm';
import ProfileForm from './pages/profile/ProfileForm';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<UsersList />} />
            <Route path="/users/add" element={<UserForm />} />
            <Route path="/users/edit/:id" element={<UserForm />} />
            <Route path="/mentorships" element={<MentorshipList />} />
            <Route path="/mentorships/add" element={<MentorshipForm />} />
            <Route path="/sessions" element={<SessionsList />} />
            <Route path="/sessions/add" element={<SessionForm />} />
            <Route path="/sessions/edit/:id" element={<SessionForm />} />
            <Route path="/profile/:userId" element={<ProfileForm />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;