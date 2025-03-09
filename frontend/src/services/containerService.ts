import axios from 'axios';
import { authService } from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export interface ContainerStats {
    cpu_usage: number;
    memory_usage: number;
    network_rx: number;
    network_tx: number;
}

export interface Container {
    id: string;
    name: string;
    image: string;
    status: string;
    created: string;
    cpuLimit: number;
    memoryLimit: number;
    memoryUsage: number;
    ports: Record<string, number>;
}

export interface ContainerLog {
    timestamp: string;
    type: 'info' | 'error';
    message: string;
}

export interface CreateContainerRequest {
    containerName: string;
    imageName: string;
    cpuLimit?: number;
    memoryLimit?: number;
    environmentVars?: Record<string, string>;
    ports?: Record<string, number>;
}

export const containerService = {
    async getContainers(): Promise<Container[]> {
        const headers = authService.getAuthHeader();
        const response = await axios.get(`${API_URL}/containers`, { headers });
        return response.data;
    },

    async createContainer(containerData: CreateContainerRequest): Promise<Container> {
        const headers = authService.getAuthHeader();
        const response = await axios.post(`${API_URL}/containers`, containerData, { headers });
        return response.data;
    },

    async startContainer(containerId: string): Promise<void> {
        const headers = authService.getAuthHeader();
        await axios.post(`${API_URL}/containers/${containerId}/start`, {}, { headers });
    },

    async stopContainer(containerId: string): Promise<void> {
        const headers = authService.getAuthHeader();
        await axios.post(`${API_URL}/containers/${containerId}/stop`, {}, { headers });
    },

    async deleteContainer(containerId: string): Promise<void> {
        const headers = authService.getAuthHeader();
        await axios.delete(`${API_URL}/containers/${containerId}`, { headers });
    },

    async getContainerLogs(containerId: string): Promise<ContainerLog[]> {
        const headers = authService.getAuthHeader();
        const response = await axios.get(`${API_URL}/containers/${containerId}/logs`, { headers });
        return response.data;
    },

    async getContainerStats(containerId: string): Promise<ContainerStats> {
        const headers = authService.getAuthHeader();
        try {
            const response = await axios.get<ContainerStats>(
                `${API_URL}/containers/${containerId}/stats`,
                { headers }
            );
            return {
                cpu_usage: Number(response.data.cpu_usage) || 0,
                memory_usage: Number(response.data.memory_usage) || 0,
                network_rx: Number(response.data.network_rx) || 0,
                network_tx: Number(response.data.network_tx) || 0
            };
        } catch (error) {
            console.error('Error fetching container stats:', error);
            throw error;
        }
    }
};