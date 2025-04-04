import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Chip from '@mui/material/Chip';

const SessionsList = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/sessions');
        setSessions(response.data);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des sessions');
        setLoading(false);
        console.error(err);
      }
    };

    fetchSessions();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette session ?')) {
      try {
        await axios.delete(`http://localhost:8080/api/sessions/${id}`);
        setSessions(sessions.filter(session => session.id !== id));
      } catch (err) {
        console.error('Erreur lors de la suppression de la session:', err);
      }
    }
  };

  const getStatusChip = (date) => {
    const sessionDate = new Date(date);
    const now = new Date();
    
    if (sessionDate > now) {
      return <Chip label="À venir" color="primary" size="small" />;
    } else {
      return <Chip label="Passée" color="default" size="small" />;
    }
  };

  if (loading) return <Typography>Chargement...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Sessions</Typography>
        <Button 
          variant="contained" 
          component={RouterLink} 
          to="/sessions/add"
        >
          Planifier une session
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Sujet</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Mentor</TableCell>
              <TableCell>Mentoré</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.id}>
                <TableCell>{session.id}</TableCell>
                <TableCell>{session.subject}</TableCell>
                <TableCell>{new Date(session.date).toLocaleString()}</TableCell>
                <TableCell>{session.mentor ? session.mentor.name : "Non assigné"}</TableCell>
<TableCell>{session.mentee ? session.mentee.name : "Non assigné"}</TableCell>

                <TableCell>
                  {getStatusChip(session.date)}
                </TableCell>
                <TableCell>
                  <IconButton 
                    aria-label="edit" 
                    component={RouterLink} 
                    to={`/sessions/edit/${session.id}`}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    aria-label="delete" 
                    onClick={() => handleDelete(session.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default SessionsList;