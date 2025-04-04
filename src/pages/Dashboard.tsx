import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Grid, Typography, List, ListItem, ListItemText, Button, Card, CardContent, 
  CardActions, Paper, Box, Avatar, Chip, Divider, LinearProgress, IconButton,
  useTheme, AppBar, Toolbar, Container, Badge
} from '@mui/material';
import { 
  PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, 
  Cell, ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';
import axios from 'axios';
import { 
  Dashboard as DashboardIcon, Person as PersonIcon, Group as GroupIcon,
  CalendarToday as CalendarIcon, TrendingUp as TrendingUpIcon,
  Add as AddIcon, Refresh as RefreshIcon, Assessment as AssessmentIcon,
  People as PeopleIcon, Notifications as NotificationsIcon, 
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';

const Dashboard = () => {
  const theme = useTheme();
  const [mentors, setMentors] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [relationStats, setRelationStats] = useState({
    active: 0,
    pending: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  
  // Données dérivées pour les graphiques
  const [relationsByMonth, setRelationsByMonth] = useState([]);
  const [sessionsByStatus, setSessionsByStatus] = useState([]);
  const [usersBySkill, setUsersBySkill] = useState([]);

  // Custom color scheme
  const colorPalette = {
    primary: '#3f51b5',
    secondary: '#f50057',
    info: '#03a9f4',
    success: '#4caf50',
    warning: '#ff9800',
    dark: '#1e1e2d',
    lightBg: '#f8f9fa',
    cardBg: '#ffffff',
    textPrimary: '#2d3748',
    textSecondary: '#718096'
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Obtenir les mentors
      const mentorsResponse = await axios.get('http://localhost:8080/api/users/role/MENTOR');
      setMentors(mentorsResponse.data);
      
      // Obtenir les mentorés
      const menteesResponse = await axios.get('http://localhost:8080/api/users/role/MENTEE');
      setMentees(menteesResponse.data);
      
      // Obtenir toutes les sessions
      const sessionsResponse = await axios.get('http://localhost:8080/api/sessions');
      const allSessions = sessionsResponse.data;
      const now = new Date();
      const upcoming = allSessions
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
      
      // Préparer les données pour les graphiques
      prepareRelationsByMonth(relations);
      prepareSessionsByStatus(allSessions);
      prepareUsersBySkill([...mentorsResponse.data, ...menteesResponse.data]);
      
    } catch (error) {
      console.error("Erreur lors du chargement des données du tableau de bord:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Préparation des données pour les graphiques
  const prepareRelationsByMonth = (relations) => {
    const monthsData = {};
    const lastSixMonths = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleString('fr-FR', { month: 'short' });
      const yearMonth = `${date.getFullYear()}-${date.getMonth()+1}`;
      monthsData[yearMonth] = { name: monthName, count: 0 };
      lastSixMonths.push(yearMonth);
    }
    
    relations.forEach(relation => {
      const createdAt = new Date(relation.createdAt || relation.startDate || new Date());
      const yearMonth = `${createdAt.getFullYear()}-${createdAt.getMonth()+1}`;
      if (monthsData[yearMonth]) {
        monthsData[yearMonth].count++;
      }
    });
    
    setRelationsByMonth(lastSixMonths.map(ym => monthsData[ym]));
  };
  
  const prepareSessionsByStatus = (sessions) => {
    const now = new Date();
    const completed = sessions.filter(s => new Date(s.date) < now).length;
    const upcoming = sessions.filter(s => new Date(s.date) >= now).length;
    
    setSessionsByStatus([
      { name: 'Terminées', value: completed, color: colorPalette.success },
      { name: 'À venir', value: upcoming, color: colorPalette.info }
    ]);
  };
  
  const prepareUsersBySkill = (users) => {
    const skillsCount = {};
    
    users.forEach(user => {
      const skills = user.skills || [];
      skills.forEach(skill => {
        if (!skillsCount[skill]) skillsCount[skill] = 0;
        skillsCount[skill]++;
      });
    });
    
    const skillsData = Object.entries(skillsCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
      
    setUsersBySkill(skillsData);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const COLORS = [
    colorPalette.primary,
    colorPalette.secondary,
    colorPalette.success,
    colorPalette.warning,
    colorPalette.info,
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', { 
      day: '2-digit', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: colorPalette.lightBg }}>
      {/* Top AppBar */}
      <AppBar position="static" sx={{ bgcolor: colorPalette.dark, boxShadow: 3 }}>
        <Toolbar>
          <Typography variant="h5" fontWeight="bold" sx={{ flexGrow: 0, mr: 4 }}>
            MentorMatch
          </Typography>
          <Box sx={{ flexGrow: 1, display: 'flex' }}>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/dashboard" 
              startIcon={<DashboardIcon />}
              sx={{ 
                mr: 1, 
                bgcolor: 'rgba(255,255,255,0.15)', 
                borderRadius: 1,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
              }}
            >
              Tableau de bord
            </Button>
            <Button color="inherit" component={RouterLink} to="/users" startIcon={<PeopleIcon />} sx={{ mx: 1 }}>
              Utilisateurs
            </Button>
            <Button color="inherit" component={RouterLink} to="/mentorships" startIcon={<TrendingUpIcon />} sx={{ mx: 1 }}>
              Mentorat
            </Button>
            <Button color="inherit" component={RouterLink} to="/sessions" startIcon={<CalendarIcon />} sx={{ mx: 1 }}>
              Sessions
            </Button>
            
          </Box>
          
        </Toolbar>
      </AppBar>
      
      {/* Main Content */}
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Box sx={{ py: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DashboardIcon sx={{ mr: 1, color: colorPalette.primary }} />
                <Typography variant="h4" fontWeight="bold" color="primary">
                  Tableau de bord
                </Typography>
              </Box>
              <IconButton onClick={fetchDashboardData} sx={{ bgcolor: colorPalette.primary, color: 'white', '&:hover': { bgcolor: colorPalette.primary } }}>
                <RefreshIcon />
              </IconButton>
            </Grid>

            {/* Actions rapides */}
      <Grid item xs={12}>
              <Paper elevation={4} sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(to right, #f5f7fa, #e4e7eb)' }}>
                <Typography variant="h6" gutterBottom fontWeight="bold" color={colorPalette.textPrimary}>
                  Actions rapides
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                  <Button
                    variant="contained"
                    component={RouterLink}
                    to="/users/add"
                    startIcon={<AddIcon />}
                    sx={{ 
                      bgcolor: colorPalette.primary, 
                      borderRadius: 2,
                      px: 3,
                      py: 1,
                      boxShadow: 3,
                      '&:hover': { bgcolor: colorPalette.primary }
                    }}
                  >
                    Ajouter un utilisateur
                  </Button>
                  <Button
                    variant="contained"
                    component={RouterLink}
                    to="/mentorships/add"
                    startIcon={<AddIcon />}
                    sx={{ 
                      bgcolor: colorPalette.secondary, 
                      borderRadius: 2,
                      px: 3,
                      py: 1,
                      boxShadow: 3,
                      '&:hover': { bgcolor: colorPalette.secondary }
                    }}
                  >
                    Créer une relation de mentorat
                  </Button>
                  <Button
                    variant="contained"
                    component={RouterLink}
                    to="/sessions/add"
                    startIcon={<AddIcon />}
                    sx={{ 
                      bgcolor: colorPalette.info, 
                      borderRadius: 2,
                      px: 3,
                      py: 1,
                      boxShadow: 3,
                      '&:hover': { bgcolor: colorPalette.info }
                    }}
                  >
                    Planifier une session
                  </Button>
                </Box>
              </Paper>
            </Grid>
            
            {loading && (
              <Grid item xs={12}>
                <LinearProgress sx={{ height: 6, borderRadius: 3 }} />
              </Grid>
            )}
            
            {/* Cartes statistiques */}
            <Grid item xs={12} md={4}>
              <Card elevation={4} sx={{ 
                height: '100%',
                borderRadius: 3,
                transition: 'all 0.3s',
                background: `linear-gradient(135deg, ${colorPalette.primary}, ${colorPalette.primary}cc)`,
                color: 'white',
                '&:hover': { transform: 'translateY(-5px)', boxShadow: 8 }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', color: 'white', mr: 2 }}>
                      <GroupIcon />
                    </Avatar>
                    <Typography variant="h6">
                      Relations de mentorat
                    </Typography>
                  </Box>
                  <Typography variant="h3" component="div" fontWeight="bold">
                    {relationStats.total}
                  </Typography>
                  <Box sx={{ display: 'flex', mt: 2, gap: 1 }}>
                    <Chip 
                      label={`Actives: ${relationStats.active}`} 
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                      size="small" 
                    />
                    <Chip 
                      label={`En attente: ${relationStats.pending}`} 
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                      size="small" 
                    />
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <Button 
                    size="small" 
                    component={RouterLink} 
                    to="/mentorships"
                    startIcon={<TrendingUpIcon />}
                    sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                  >
                    Voir toutes
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card elevation={4} sx={{ 
                height: '100%',
                borderRadius: 3,
                transition: 'all 0.3s',
                background: `linear-gradient(135deg, ${colorPalette.secondary}, ${colorPalette.secondary}cc)`,
                color: 'white',
                '&:hover': { transform: 'translateY(-5px)', boxShadow: 8 }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', color: 'white', mr: 2 }}>
                      <PersonIcon />
                    </Avatar>
                    <Typography variant="h6">
                      Mentors
                    </Typography>
                  </Box>
                  <Typography variant="h3" component="div" fontWeight="bold">
                    {mentors.length}
                  </Typography>
                  <Typography sx={{ mt: 2, opacity: 0.8 }}>
                    Experts disponibles
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <Button 
                    size="small" 
                    component={RouterLink} 
                    to="/users"
                    startIcon={<PersonIcon />}
                    sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                  >
                    Voir tous
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card elevation={4} sx={{ 
                height: '100%',
                borderRadius: 3,
                transition: 'all 0.3s',
                background: `linear-gradient(135deg, ${colorPalette.info}, ${colorPalette.info}cc)`,
                color: 'white',
                '&:hover': { transform: 'translateY(-5px)', boxShadow: 8 }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', color: 'white', mr: 2 }}>
                      <PersonIcon />
                    </Avatar>
                    <Typography variant="h6">
                      Mentorés
                    </Typography>
                  </Box>
                  <Typography variant="h3" component="div" fontWeight="bold">
                    {mentees.length}
                  </Typography>
                  <Typography sx={{ mt: 2, opacity: 0.8 }}>
                    Apprenants inscrits
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <Button 
                    size="small" 
                    component={RouterLink} 
                    to="/users"
                    startIcon={<PersonIcon />}
                    sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                  >
                    Voir tous
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            
            {/* Graphique des relations par mois */}
            <Grid item xs={12} md={6}>
              <Paper elevation={4} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom fontWeight="bold" color={colorPalette.textPrimary}>
                  Évolution des relations de mentorat
                </Typography>
                <Box sx={{ mt: 3 }}>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={relationsByMonth} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis dataKey="name" stroke={colorPalette.textSecondary} />
                      <YAxis stroke={colorPalette.textSecondary} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white',
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 8,
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        name="Nouvelles relations"
                        stroke={colorPalette.primary} 
                        strokeWidth={3}
                        dot={{ r: 6, fill: colorPalette.primary, strokeWidth: 2, stroke: 'white' }}
                        activeDot={{ r: 8, fill: colorPalette.primary, strokeWidth: 2, stroke: 'white' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
            
            {/* Graphique des sessions par statut */}
            <Grid item xs={12} md={6}>
              <Paper elevation={4} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom fontWeight="bold" color={colorPalette.textPrimary}>
                  Répartition des sessions
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250, mt: 3 }}>
                  <ResponsiveContainer width="60%" height="100%">
                    <PieChart>
                      <Pie
                        data={sessionsByStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {sessionsByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value} sessions`, '']}
                        contentStyle={{ 
                          backgroundColor: 'white',
                          border: 'none',
                          borderRadius: 8,
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ width: '40%' }}>
                    {sessionsByStatus.map((entry, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            backgroundColor: entry.color,
                            mr: 2,
                            borderRadius: '50%'
                          }}
                        />
                        <Typography variant="body1" fontWeight="medium" color={colorPalette.textPrimary}>
                          {entry.name}: {entry.value} sessions
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            {/* Graphique des compétences */}
            <Grid item xs={12} md={6}>
              <Paper elevation={4} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold" color={colorPalette.textPrimary}>
                  Top 5 des compétences
                </Typography>
                <Box sx={{ mt: 3 }}>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={usersBySkill} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis dataKey="name" stroke={colorPalette.textSecondary} angle={-45} textAnchor="end" height={60} />
                      <YAxis stroke={colorPalette.textSecondary} />
                      <Tooltip 
                        formatter={(value) => [`${value} utilisateurs`, 'Nombre']}
                        contentStyle={{ 
                          backgroundColor: 'white',
                          border: 'none',
                          borderRadius: 8,
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Bar dataKey="value" name="Utilisateurs" radius={[8, 8, 0, 0]}>
                        {usersBySkill.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
            
            {/* Sessions à venir */}
            <Grid item xs={12} md={6}>
              <Paper elevation={4} sx={{ p: 3, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: colorPalette.primary, mr: 2 }}>
                      <CalendarIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold" color={colorPalette.textPrimary}>
                      Sessions à venir
                    </Typography>
                  </Box>
                  <Button 
                    size="small" 
                    variant="contained"
                    component={RouterLink} 
                    to="/sessions/add"
                    startIcon={<AddIcon />}
                    sx={{ 
                      bgcolor: colorPalette.primary,
                      borderRadius: 2,
                      boxShadow: 2,
                      '&:hover': { bgcolor: colorPalette.primary }
                    }}
                  >
                    Nouvelle session
                  </Button>
                </Box>
                <Divider sx={{ mb: 3 }} />
                {upcomingSessions.length > 0 ? (
                  <List sx={{ 
                    '& .MuiListItem-root': { 
                      borderRadius: 2,
                      mb: 2,
                      bgcolor: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      transition: 'all 0.2s',
                      '&:hover': { 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        transform: 'translateY(-2px)'
                      }
                    } 
                  }}>
                    {upcomingSessions.map((session) => (
                      <ListItem key={session.id} sx={{ flexDirection: 'column', alignItems: 'flex-start', p: 2 }}>
                        <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1" fontWeight="bold" color={colorPalette.textPrimary}>
                            {session.subject}
                          </Typography>
                          <Chip 
                            size="small" 
                            sx={{ 
                              bgcolor: colorPalette.info, 
                              color: 'white',
                              fontWeight: 'bold'
                            }} 
                            label={formatDate(session.date)} 
                          />
                        </Box>
                        <Divider sx={{ width: '100%', my: 1 }} />
                        <ListItemText
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                              <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: colorPalette.secondary }}>
                                {session.mentor.name.charAt(0).toUpperCase()}
                              </Avatar>
                              <Typography variant="body2" sx={{ mr: 1, fontWeight: 'medium' }}>
                                {session.mentor.name}
                              </Typography>
                              <Typography variant="body2" sx={{ mx: 1, color: colorPalette.textSecondary }}>avec</Typography>
                              <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: colorPalette.info }}>
                                {session.mentee.name.charAt(0).toUpperCase()}
                              </Avatar>
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                {session.mentee.name}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                    <Typography variant="body1" color={colorPalette.textSecondary}>
                      Aucune session à venir
                    </Typography>
                  </Box>
                )}
                {upcomingSessions.length > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button 
                      component={RouterLink} 
                      to="/sessions"
                      sx={{ color: colorPalette.primary }}
                    >
                      Voir toutes les sessions
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>
            
            
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;