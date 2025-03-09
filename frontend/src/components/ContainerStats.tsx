import React, { useEffect, useState } from 'react';
import {
    Paper,
    Typography,
    Grid,
    Box,
    CircularProgress,
    Alert,
    LinearProgress,
} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { containerService } from '../services/containerService';

interface ContainerStatsProps {
    containerId: string;
}

interface Stats {
    cpuUsage: number;
    memoryUsage: number;
    networkRx: number;
    networkTx: number;
    timestamp: number;
}

interface ContainerStatsResponse {
    cpu_usage: number;
    memory_usage: number;
    network_rx: number;
    network_tx: number;
}

const POLLING_INTERVAL = 2000; // 2 seconds
const MAX_DATA_POINTS = 30; // Show last 30 data points

export const ContainerStats: React.FC<ContainerStatsProps> = ({ containerId }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState<Stats[]>([]);

    useEffect(() => {
        let mounted = true;
        let intervalId: NodeJS.Timeout;

        const fetchStats = async () => {
            try {
                const response = await containerService.getContainerStats(containerId);
                if (!mounted) return;

                const newStat: Stats = {
                    cpuUsage: Math.min(response.cpu_usage, 100),
                    memoryUsage: response.memory_usage,
                    networkRx: response.network_rx,
                    networkTx: response.network_tx,
                    timestamp: Date.now(),
                };

                setStats(prevStats => {
                    const updatedStats = [...prevStats, newStat];
                    return updatedStats.slice(-MAX_DATA_POINTS);
                });

                setLoading(false);
                setError('');
            } catch (err: any) {
                if (!mounted) return;
                console.error('Error fetching stats:', err);
                setError(err.message || 'Failed to fetch container stats');
                setLoading(false);
            }
        };

        fetchStats();
        intervalId = setInterval(fetchStats, POLLING_INTERVAL);

        return () => {
            mounted = false;
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [containerId]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error}
            </Alert>
        );
    }

    const formatBytes = (bytes: number) => {
        if (typeof bytes !== 'number' || isNaN(bytes)) return '0 B';
        const sizes = ['B', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 B';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
    };

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString();
    };

    const latestStats = stats[stats.length - 1] || {
        cpuUsage: 0,
        memoryUsage: 0,
        networkRx: 0,
        networkTx: 0,
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Container Statistics
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle1">CPU Usage</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={latestStats.cpuUsage} 
                                    sx={{ height: 10, borderRadius: 5 }}
                                />
                            </Box>
                            <Box sx={{ minWidth: 35 }}>
                                <Typography variant="body2" color="text.secondary">
                                    {`${Math.round(latestStats.cpuUsage)}%`}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle1">Memory Usage</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={(latestStats.memoryUsage / 100)} 
                                    sx={{ height: 10, borderRadius: 5 }}
                                />
                            </Box>
                            <Box sx={{ minWidth: 35 }}>
                                <Typography variant="body2" color="text.secondary">
                                    {formatBytes(latestStats.memoryUsage)}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            CPU Usage Over Time
                        </Typography>
                        <Box sx={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="timestamp" 
                                        tickFormatter={formatTime}
                                    />
                                    <YAxis />
                                    <Tooltip 
                                        labelFormatter={formatTime}
                                        formatter={(value: any) => [`${value}%`, 'CPU Usage']}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="cpuUsage" 
                                        stroke="#8884d8" 
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Memory Usage Over Time
                        </Typography>
                        <Box sx={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="timestamp" 
                                        tickFormatter={formatTime}
                                    />
                                    <YAxis 
                                        tickFormatter={formatBytes}
                                    />
                                    <Tooltip 
                                        labelFormatter={formatTime}
                                        formatter={(value: any) => [formatBytes(value), 'Memory Usage']}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="memoryUsage" 
                                        stroke="#82ca9d" 
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Network I/O
                        </Typography>
                        <Box sx={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="timestamp" 
                                        tickFormatter={formatTime}
                                    />
                                    <YAxis 
                                        tickFormatter={formatBytes}
                                    />
                                    <Tooltip 
                                        labelFormatter={formatTime}
                                        formatter={(value: any) => [formatBytes(value), 'Network I/O']}
                                    />
                                    <Line 
                                        type="monotone" 
                                        name="RX" 
                                        dataKey="networkRx" 
                                        stroke="#8884d8" 
                                        dot={false}
                                    />
                                    <Line 
                                        type="monotone" 
                                        name="TX" 
                                        dataKey="networkTx" 
                                        stroke="#82ca9d" 
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Paper>
    );
}; 