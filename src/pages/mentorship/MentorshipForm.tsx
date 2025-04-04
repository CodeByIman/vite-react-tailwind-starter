import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import FormHelperText from '@mui/material/FormHelperText';

// Schéma de validation
const MentorshipSchema = Yup.object().shape({
  mentorId: Yup.number()
    .required('Un mentor est requis'),
  menteeId: Yup.number()
    .required('Un mentoré est requis'),
  startDate: Yup.date()
    .required('Date de début requise'),
  endDate: Yup.date()
    .min(Yup.ref('startDate'), 'La date de fin doit être après la date de début')
    .nullable(),
  status: Yup.string()
    .required('Statut requis'),
  objectives: Yup.string()
    .required('Les objectifs sont requis')
});

const MentorshipForm = () => {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const mentorsResponse = await axios.get('http://localhost:8080/api/users/role/MENTOR');
        setMentors(mentorsResponse.data);
        
        const menteesResponse = await axios.get('http://localhost:8080/api/users/role/MENTEE');
        setMentees(menteesResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des utilisateurs:', err);
        setError('Erreur lors du chargement des utilisateurs');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const initialValues = {
    mentorId: '',
    menteeId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'PENDING',
    objectives: ''
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await axios.post('http://localhost:8080/api/relations', values);
      navigate('/mentorships');
    } catch (err) {
      console.error('Erreur lors de la création de la relation:', err);
      setError('Erreur lors de la création de la relation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Typography>Chargement...</Typography>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Créer une relation de mentorat
      </Typography>

      <Paper sx={{ p: 3 }}>
        {error && <Typography color="error">{error}</Typography>}

        <Formik
          initialValues={initialValues}
          validationSchema={MentorshipSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting, handleChange, handleBlur, values }) => (
            <Form>
              <FormControl 
                fullWidth 
                margin="normal"
                error={touched.mentorId && Boolean(errors.mentorId)}
              >
                <InputLabel id="mentor-label">Mentor</InputLabel>
                <Select
                  labelId="mentor-label"
                  name="mentorId"
                  value={values.mentorId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  label="Mentor"
                >
                  {mentors.map((mentor) => (
                    <MenuItem key={mentor.id} value={mentor.id}>{mentor.name}</MenuItem>
                  ))}
                </Select>
                {touched.mentorId && errors.mentorId && (
                  <FormHelperText>{errors.mentorId}</FormHelperText>
                )}
              </FormControl>

              <FormControl 
                fullWidth 
                margin="normal"
                error={touched.menteeId && Boolean(errors.menteeId)}
              >
                <InputLabel id="mentee-label">Mentoré</InputLabel>
                <Select
                  labelId="mentee-label"
                  name="menteeId"
                  value={values.menteeId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  label="Mentoré"
                >
                  {mentees.map((mentee) => (
                    <MenuItem key={mentee.id} value={mentee.id}>{mentee.name}</MenuItem>
                  ))}
                </Select>
                {touched.menteeId && errors.menteeId && (
                  <FormHelperText>{errors.menteeId}</FormHelperText>
                )}
              </FormControl>

              <TextField
                fullWidth
                margin="normal"
                name="startDate"
                label="Date de début"
                type="date"
                value={values.startDate}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.startDate && Boolean(errors.startDate)}
                helperText={touched.startDate && errors.startDate}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                margin="normal"
                name="endDate"
                label="Date de fin (optionnelle)"
                type="date"
                value={values.endDate}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.endDate && Boolean(errors.endDate)}
                helperText={touched.endDate && errors.endDate}
                InputLabelProps={{ shrink: true }}
              />

              <FormControl 
                fullWidth 
                margin="normal"
                error={touched.status && Boolean(errors.status)}
              >
                <InputLabel id="status-label">Statut</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  value={values.status}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  label="Statut"
                >
                  <MenuItem value="PENDING">En attente</MenuItem>
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="COMPLETED">Terminée</MenuItem>
                  <MenuItem value="CANCELED">Annulée</MenuItem>
                </Select>
                {touched.status && errors.status && (
                  <FormHelperText>{errors.status}</FormHelperText>
                )}
              </FormControl>

              <TextField
                fullWidth
                margin="normal"
                name="objectives"
                label="Objectifs"
                multiline
                rows={4}
                value={values.objectives}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.objectives && Boolean(errors.objectives)}
                helperText={touched.objectives && errors.objectives}
              />

              <Box sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Création...' : 'Créer'}
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => navigate('/mentorships')}
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

export default MentorshipForm;