import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    IconButton,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { ContainerStats } from '../components/ContainerStats';

export const ContainerStatsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    if (!id) {
        return <Typography>Container ID not found</Typography>;
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <IconButton 
                        onClick={() => navigate('/dashboard')}
                        sx={{ mr: 2 }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4">Container Statistics</Typography>
                </Box>

                <ContainerStats containerId={id} />
            </Box>
        </Container>
    );
}; 