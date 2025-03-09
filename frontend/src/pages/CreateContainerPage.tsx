import React, { useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Grid,
    IconButton,
    Alert,
    CircularProgress,
    Chip,
    FormControl,
    InputLabel,
    Select,
    SelectChangeEvent,
    MenuItem,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { containerService } from '../services/containerService';

const AVAILABLE_IMAGES = [
    'nginx:latest',
    'ubuntu:latest',
    'postgres:latest',
    'mysql:latest',
    'redis:latest',
    'mongodb:latest',
    'node:latest',
    'python:latest'
];

export const CreateContainerPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        containerName: '',
        imageName: '',
        cpuLimit: '100',
        memoryLimit: '512',
        environmentVars: '',
        ports: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.containerName || !formData.imageName) {
            setError('Container name and image are required');
            return;
        }

        try {
            setError('');
            setLoading(true);

            const containerData = {
                ...formData,
                cpuLimit: parseInt(formData.cpuLimit),
                memoryLimit: parseInt(formData.memoryLimit),
                environmentVars: formData.environmentVars ? 
                    JSON.parse(formData.environmentVars) : {},
                ports: formData.ports ? 
                    JSON.parse(formData.ports) : {}
            };

            await containerService.createContainer(containerData);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.toString());
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string) => (
        e: React.ChangeEvent<HTMLInputElement | { value: unknown }> | SelectChangeEvent
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value
        }));
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <IconButton 
                        onClick={() => navigate('/dashboard')}
                        sx={{ mr: 2 }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4">Create Container</Typography>
                </Box>

                <Paper sx={{ p: 4 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Container Name"
                                    required
                                    value={formData.containerName}
                                    onChange={handleInputChange('containerName')}
                                    disabled={loading}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Image Name</InputLabel>
                                    <Select
                                        value={formData.imageName}
                                        onChange={handleInputChange('imageName')}
                                        label="Image Name"
                                        disabled={loading}
                                    >
                                        {AVAILABLE_IMAGES.map(image => (
                                            <MenuItem key={image} value={image}>
                                                {image}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {AVAILABLE_IMAGES.map(image => (
                                        <Chip
                                            key={image}
                                            label={image}
                                            onClick={() => setFormData(prev => ({
                                                ...prev,
                                                imageName: image
                                            }))}
                                            color={formData.imageName === image ? "primary" : "default"}
                                        />
                                    ))}
                                </Box>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="CPU Limit (%)"
                                    type="number"
                                    value={formData.cpuLimit}
                                    onChange={handleInputChange('cpuLimit')}
                                    disabled={loading}
                                    InputProps={{ inputProps: { min: 0, max: 100 } }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Memory Limit (MB)"
                                    type="number"
                                    value={formData.memoryLimit}
                                    onChange={handleInputChange('memoryLimit')}
                                    disabled={loading}
                                    InputProps={{ inputProps: { min: 32 } }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Environment Variables (JSON)"
                                    multiline
                                    rows={4}
                                    value={formData.environmentVars}
                                    onChange={handleInputChange('environmentVars')}
                                    disabled={loading}
                                    placeholder='{"KEY": "VALUE"}'
                                    helperText="Enter environment variables in JSON format"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Port Mappings (JSON)"
                                    multiline
                                    rows={4}
                                    value={formData.ports}
                                    onChange={handleInputChange('ports')}
                                    disabled={loading}
                                    placeholder='{"80/tcp": 8080}'
                                    helperText="Enter port mappings in JSON format"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <CircularProgress size={24} />
                                    ) : (
                                        'Create Container'
                                    )}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
}; 