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
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom';

// Define interfaces for type safety
interface User {
  id: number;
  name: string;
  email?: string;
}

interface Relation {
  id: number;
  mentor: User;
  mentee: User;
  startDate: string;
  endDate?: string;
  status: 'ACTIVE' | 'PENDING' | 'COMPLETED' | 'CANCELED';
}

const MentorshipList = () => {
  const [relations, setRelations] = useState<Relation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRelations = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/api/relations');
        
        // Safely handle the response data
        let relationData = response.data;
        
        // Check if the data is not an array, but has a data property that is an array
        if (!Array.isArray(relationData) && relationData.data && Array.isArray(relationData.data)) {
          relationData = relationData.data;
        }
        
        // Ensure we have an array at this point
        if (!Array.isArray(relationData)) {
          console.error('API did not return an array:', relationData);
          setError('Format de données incorrect reçu du serveur');
          setRelations([]); // Set to empty array to prevent mapping errors
        } else {
          setRelations(relationData);
          setError(null);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des relations de mentorat:', err);
        setError('Erreur lors du chargement des relations de mentorat');
        setRelations([]); // Set to empty array to prevent mapping errors
      } finally {
        setLoading(false);
      }
    };

    fetchRelations();
  }, []);

  const handleEdit = (id: number) => {
    navigate(`/mentorships/edit/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette relation de mentorat ?')) {
      try {
        await axios.delete(`http://localhost:8080/api/relations/${id}`);
        // Update the relations state by filtering out the deleted relation
        setRelations(relations.filter(relation => relation.id !== id));
      } catch (err) {
        console.error('Erreur lors de la suppression de la relation:', err);
        setError('Erreur lors de la suppression de la relation');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'PENDING': return 'warning';
      case 'COMPLETED': return 'info';
      case 'CANCELED': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Relations de mentorat</Typography>
        <Button 
          variant="contained" 
          color="primary"
          component={RouterLink} 
          to="/mentorships/add"
        >
          Créer une relation
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Mentor</TableCell>
                <TableCell>Mentoré</TableCell>
                <TableCell>Date de début</TableCell>
                <TableCell>Date de fin</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(relations) && relations.length > 0 ? (
                relations.map((relation) => (
                  <TableRow key={relation.id}>
                    <TableCell>{relation.id}</TableCell>
                    <TableCell>{relation.mentor?.name || 'Non défini'}</TableCell>
                    <TableCell>{relation.mentee?.name || 'Non défini'}</TableCell>
                    <TableCell>
                      {relation.startDate ? new Date(relation.startDate).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      {relation.endDate ? new Date(relation.endDate).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={relation.status} 
                        color={getStatusColor(relation.status)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleEdit(relation.id)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(relation.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography>Aucune relation de mentorat trouvée</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default MentorshipList;