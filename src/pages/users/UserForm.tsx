import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

// Schéma de validation
const UserSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Trop court!')
    .max(50, 'Trop long!')
    .required('Requis'),
  email: Yup.string()
    .email('Email invalide')
    .required('Requis'),
  role: Yup.string()
    .required('Requis')
});

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: '',
    email: '',
    role: 'MENTEE'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAddMode = !id;

  useEffect(() => {
    if (!isAddMode) {
      setLoading(true);
      axios.get(`http://localhost:8080/api/users/${id}`)
        .then(response => {
          const userData = response.data;
          setUser(userData);
          setLoading(false);
        })
        .catch(err => {
          console.error('Erreur lors du chargement de l\'utilisateur:', err);
          setError('Erreur lors du chargement de l\'utilisateur');
          setLoading(false);
        });
    }
  }, [id, isAddMode]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isAddMode) {
        await axios.post('http://localhost:8080/api/users', values);
      } else {
        await axios.put(`http://localhost:8080/api/users/${id}`, values);
      }
      navigate('/users');
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement de l\'utilisateur:', err);
      setError('Erreur lors de l\'enregistrement de l\'utilisateur');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Typography>Chargement...</Typography>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isAddMode ? 'Ajouter un utilisateur' : 'Modifier un utilisateur'}
      </Typography>

      <Paper sx={{ p: 3 }}>
        {error && <Typography color="error">{error}</Typography>}

        <Formik
          initialValues={user}
          validationSchema={UserSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <Field
                as={TextField}
                fullWidth
                margin="normal"
                name="name"
                label="Nom"
                variant="outlined"
                error={touched.name && Boolean(errors.name)}
                helperText={touched.name && errors.name}
              />

              <Field
                as={TextField}
                fullWidth
                margin="normal"
                name="email"
                label="Email"
                variant="outlined"
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
              />

              <Field
                as={TextField}
                select
                fullWidth
                margin="normal"
                name="role"
                label="Rôle"
                variant="outlined"
                error={touched.role && Boolean(errors.role)}
                helperText={touched.role && errors.role}
              >
                <MenuItem value="MENTOR">Mentor</MenuItem>
                <MenuItem value="MENTEE">Mentoré</MenuItem>
              </Field>

              <Box sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => navigate('/users')}
                  sx={{ ml: 2 }}
                >
                  Annuler
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default UserForm;