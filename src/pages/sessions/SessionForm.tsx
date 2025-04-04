import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';

// Schéma de validation
const SessionSchema = Yup.object().shape({
  subject: Yup.string()
    .required('Sujet requis'),
  date: Yup.date()
    .required('Date requise'),
  duration: Yup.number()
    .min(15, 'Minimum 15 minutes')
    .required('Durée requise'),
  mentorId: Yup.number()
    .required('Mentor requis'),
  menteeId: Yup.number()
    .required('Mentoré requis'),
  notes: Yup.string()
});

const SessionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [session, setSession] = useState({
    subject: '',
    date: '',
    duration: 60,
    mentorId: '',
    menteeId: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAddMode = !id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Charger les mentors et mentorés
        const mentorsResponse = await axios.get('http://localhost:8080/api/users/role/MENTOR');
        setMentors(mentorsResponse.data);
        
        const menteesResponse = await axios.get('http://localhost:8080/api/users/role/MENTEE');
        setMentees(menteesResponse.data);
        
        // En mode édition, charger la session existante
        if (!isAddMode) {
          const sessionResponse = await axios.get(`http://localhost:8080/api/sessions/${id}`);
          const sessionData = sessionResponse.data;
          
          // Formatage de la date pour le champ datetime-local
          const dateObj = new Date(sessionData.date);
          const formattedDate = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
            
          setSession({
            subject: sessionData.subject,
            date: formattedDate,
            duration: sessionData.duration,
            mentorId: sessionData.mentor.id,
            menteeId: sessionData.mentee.id,
            notes: sessionData.notes || ''
          });
        } else {
          // En mode ajout, définir une date/heure par défaut (maintenant + 1 heure)
          const now = new Date();
          now.setHours(now.getHours() + 1);
          const defaultDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
            
          setSession(prev => ({
            ...prev,
            date: defaultDate
          }));
        }
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Erreur lors du chargement des données');
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isAddMode]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isAddMode) {
        await axios.post('http://localhost:8080/api/sessions', values);
      } else {
        await axios.put(`http://localhost:8080/api/sessions/${id}`, values);
      }
      navigate('/sessions');
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement de la session:', err);
      setError('Erreur lors de l\'enregistrement de la session');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Typography>Chargement...</Typography>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isAddMode ? 'Planifier une session' : 'Modifier une session'}
      </Typography>

      <Paper sx={{ p: 3 }}>
        {error && <Typography color="error">{error}</Typography>}

        <Formik
          initialValues={session}
          validationSchema={SessionSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ errors, touched, isSubmitting, handleChange, handleBlur, values }) => (
            <Form>
              <TextField
                fullWidth
                margin="normal"
                name="subject"
                label="Sujet"
                value={values.subject}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.subject && Boolean(errors.subject)}
                helperText={touched.subject && errors.subject}
              />

              <TextField
                fullWidth
                margin="normal"
                name="date"
                label="Date et heure"
                type="datetime-local"
                value={values.date}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.date && Boolean(errors.date)}
                helperText={touched.date && errors.date}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                margin="normal"
                name="duration"
                label="Durée (minutes)"
                type="number"
                value={values.duration}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.duration && Boolean(errors.duration)}
                helperText={touched.duration && errors.duration}
              />

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
                name="notes"
                label="Notes"
                multiline
                rows={4}
                value={values.notes}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.notes && Boolean(errors.notes)}
                helperText={touched.notes && errors.notes}
              />

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
                  onClick={() => navigate('/sessions')}
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

export default SessionForm;