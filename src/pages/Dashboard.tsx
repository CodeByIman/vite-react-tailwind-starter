import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import axios from 'axios';

const Dashboard = () => {
  const [mentors, setMentors] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [relationStats, setRelationStats] = useState({
    active: 0,
    pending: 0,
    total: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Obtenir les mentors
        const mentorsResponse = await axios.get('http://localhost:8080/api/users/role/MENTOR');
        setMentors(mentorsResponse.data);
        
        // Obtenir les mentorés
        const menteesResponse = await axios.get('http://localhost:8080/api/users/role/MENTEE');
        setMentees(menteesResponse.data);
        
        // Obtenir toutes les sessions
        const sessionsResponse = await axios.get('http://localhost:8080/api/sessions');
        const now = new Date();
        const upcoming = sessionsResponse.data
          .filter(session => new Date(session.date) > now)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 5);
        setUpcomingSessions(upcoming);
        
        // Obtenir les statistiques des relations
        const relationsResponse = await axios.get('http://localhost:8080/api/relations');
        const relations = relationsResponse.data;
        const stats = {
          active: relations.filter(rel => rel.status === 'ACTIVE').length,
          pending: relations.filter(rel => rel.status === 'PENDING').length,
          total: relations.length
        };
        setRelationStats(stats);
      } catch (error) {
        console.error("Erreur lors du chargement des données du tableau de bord:", error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Tableau de bord
        </Typography>
      </Grid>
      
      {/* Statistiques */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Relations de mentorat
            </Typography>
            <Typography variant="h3" component="div">
              {relationStats.total}
            </Typography>
            <Typography color="text.secondary">
              Actives: {relationStats.active} | En attente: {relationStats.pending}
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small" component={RouterLink} to="/mentorships">
              Voir toutes
            </Button>
          </CardActions>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Mentors
            </Typography>
            <Typography variant="h3" component="div">
              {mentors.length}
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small" component={RouterLink} to="/users">
              Voir tous
            </Button>
          </CardActions>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Mentorés
            </Typography>
            <Typography variant="h3" component="div">
              {mentees.length}
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small" component={RouterLink} to="/users">
              Voir tous
            </Button>
          </CardActions>
        </Card>
      </Grid>
      
      {/* Sessions à venir */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Sessions à venir
          </Typography>
          {upcomingSessions.length > 0 ? (
            <List>
              {upcomingSessions.map((session) => (
                <ListItem key={session.id}>
                  <ListItemText
                    primary={session.subject}
                    secondary={`${new Date(session.date).toLocaleString()} - ${session.mentor.name} & ${session.mentee.name}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Aucune session à venir
            </Typography>
          )}
          <Button size="small" component={RouterLink} to="/sessions/add">
            Planifier une nouvelle session
          </Button>
        </Paper>
      </Grid>
      
      {/* Actions rapides */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Actions rapides
          </Typography>
          <Button
            variant="contained"
            component={RouterLink}
            to="/users/add"
            sx={{ mr: 2, mb: 2 }}
          >
            Ajouter un utilisateur
          </Button>
          <Button
            variant="contained"
            component={RouterLink}
            to="/mentorships/add"
            sx={{ mr: 2, mb: 2 }}
          >
            Créer une relation de mentorat
          </Button>
          <Button
            variant="contained"
            component={RouterLink}
            to="/sessions/add"
            sx={{ mb: 2 }}
          >
            Planifier une session
          </Button>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Dashboard;