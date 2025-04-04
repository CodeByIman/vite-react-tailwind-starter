import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
import PersonIcon from '@mui/icons-material/Person';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

// Define the User interface
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const UsersList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/api/users');
        
        // Safely handle the response data
        let userData = response.data;
        
        // Check if the data is not an array, but has a data property that is an array
        if (!Array.isArray(userData) && userData.data && Array.isArray(userData.data)) {
          userData = userData.data;
        }
        
        // Ensure we have an array at this point
        if (!Array.isArray(userData)) {
          console.error('API did not return an array:', userData);
          setError('Format de données incorrect reçu du serveur');
          setUsers([]);
        } else {
          setUsers(userData);
          setError(null);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des utilisateurs:', err);
        setError('Erreur lors du chargement des utilisateurs');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await axios.delete(`http://localhost:8080/api/users/${id}`);
        // Update the users state by filtering out the deleted user
        setUsers(users.filter(user => user.id !== id));
      } catch (err) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', err);
        setError('Erreur lors de la suppression de l\'utilisateur');
      }
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
        <Typography variant="h4">Utilisateurs</Typography>
        <Button 
          variant="contained" 
          color="primary"
          component={RouterLink} 
          to="/users/add"
        >
          Ajouter un utilisateur
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rôle</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(users) && users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name || 'Non défini'}</TableCell>
                    <TableCell>{user.email || 'Non défini'}</TableCell>
                    <TableCell>{user.role || 'Non défini'}</TableCell>
                    <TableCell>
                      <IconButton 
                        aria-label="profile" 
                        component={RouterLink} 
                        to={`/profile/${user.id}`}
                      >
                        <PersonIcon />
                      </IconButton>
                      <IconButton 
                        aria-label="edit" 
                        component={RouterLink} 
                        to={`/users/edit/${user.id}`}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        aria-label="delete" 
                        onClick={() => handleDelete(user.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography>Aucun utilisateur trouvé</Typography>
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

export default UsersList;