import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Alert from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';

// Define the user interface based on your model
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  // Add other properties as needed
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
          const response = await axios.get("http://localhost:8080/api/users");
      
          let userData = response.data;
          if (!Array.isArray(userData)) {
            console.error("API response is not an array:", userData);
            setError("Format de données incorrect reçu du serveur");
            return;
          }
          
          setUsers(userData);
          setError(null);
        } catch (err) {
          console.error("Erreur lors du chargement des utilisateurs:", err);
          setError("Erreur lors du chargement des utilisateurs");
        } finally {
          setLoading(false);
        }
      };
      

    fetchUsers();
  }, []);

  const handleEdit = (id: number) => {
    navigate(`/users/edit/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur?')) {
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
        <Typography variant="h4">Liste des Utilisateurs</Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => navigate('/users/new')}
        >
          Nouvel Utilisateur
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rôle</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Add safe check before mapping */}
              {Array.isArray(users) && users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleEdit(user.id)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(user.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
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