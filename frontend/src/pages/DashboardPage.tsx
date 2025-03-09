import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    IconButton,
    AppBar,
    Toolbar,
    Button,
    Grid,
    Card,
    CardContent,
    CardActions,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    Add as AddIcon,
    Logout as LogoutIcon,
    PlayArrow as PlayIcon,
    Stop as StopIcon,
    Delete as DeleteIcon,
    Assessment as StatsIcon,
    Article as LogsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { containerService, Container as ContainerType } from '../services/containerService';

export const DashboardPage: React.FC = () => {
    const [containers, setContainers] = useState<ContainerType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedContainer, setSelectedContainer] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const fetchContainers = async () => {
        try {
            setLoading(true);
            const data = await containerService.getContainers();
            setContainers(data);
            setError('');
        } catch (err: any) {
            setError(err.toString());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContainers();
        const interval = setInterval(fetchContainers, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleStart = async (containerId: string) => {
        try {
            await containerService.startContainer(containerId);
            await fetchContainers();
        } catch (err: any) {
            setError(err.toString());
        }
    };

    const handleStop = async (containerId: string) => {
        try {
            await containerService.stopContainer(containerId);
            await fetchContainers();
        } catch (err: any) {
            setError(err.toString());
        }
    };

    const handleDelete = async () => {
        if (!selectedContainer) return;
        try {
            await containerService.deleteContainer(selectedContainer);
            setContainers(prev => prev.filter(c => c.id !== selectedContainer));
            setDeleteDialogOpen(false);
            setSelectedContainer(null);
        } catch (err: any) {
            setError(err.toString());
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Container Management System
                    </Typography>
                    <Typography variant="subtitle1" sx={{ mr: 2 }}>
                        Welcome, {user?.username}
                    </Typography>
                    <IconButton color="inherit" onClick={() => navigate('/create')}>
                        <AddIcon />
                    </IconButton>
                    <IconButton color="inherit" onClick={handleLogout}>
                        <LogoutIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Container sx={{ mt: 4 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {containers.map((container) => (
                            <Grid item xs={12} sm={6} md={4} key={container.id}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            {container.name}
                                        </Typography>
                                        <Chip
                                            label={container.status}
                                            color={container.status === 'running' ? 'success' : 'error'}
                                            size="small"
                                            sx={{ mb: 2 }}
                                        />
                                        <Typography variant="body2" color="text.secondary">
                                            Image: {container.image}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            CPU Limit: {container.cpuLimit}%
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Memory Limit: {container.memoryLimit}MB
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        {container.status === 'running' ? (
                                            <IconButton
                                                onClick={() => handleStop(container.id)}
                                                color="error"
                                            >
                                                <StopIcon />
                                            </IconButton>
                                        ) : (
                                            <IconButton
                                                onClick={() => handleStart(container.id)}
                                                color="success"
                                            >
                                                <PlayIcon />
                                            </IconButton>
                                        )}
                                        <IconButton
                                            onClick={() => navigate(`/logs/${container.id}`)}
                                            color="info"
                                        >
                                            <LogsIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => navigate(`/stats/${container.id}`)}
                                            color="info"
                                        >
                                            <StatsIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => {
                                                setSelectedContainer(container.id);
                                                setDeleteDialogOpen(true);
                                            }}
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Delete Container</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this container?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDelete} color="error">Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};