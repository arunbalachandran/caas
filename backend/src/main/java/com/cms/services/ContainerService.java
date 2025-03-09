package com.cms.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class ContainerService {

    @Value("${python.service.url}")
    private String pythonServiceUrl;

    private final RestTemplate restTemplate;

    public ContainerService() {
        this.restTemplate = new RestTemplate();
    }

    public List<?> getContainers() {
        ResponseEntity<List> response = restTemplate.getForEntity(
            pythonServiceUrl + "/containers",
            List.class
        );
        return response.getBody();
    }

    public Map<String, Object> createContainer(Map<String, Object> containerData) {
        ResponseEntity<Map> response = restTemplate.postForEntity(
            pythonServiceUrl + "/containers",
            containerData,
            Map.class
        );
        return response.getBody();
    }

    public void startContainer(String containerId) {
        restTemplate.postForEntity(
            pythonServiceUrl + "/containers/" + containerId + "/start",
            null,
            Void.class
        );
    }

    public void stopContainer(String containerId) {
        restTemplate.postForEntity(
            pythonServiceUrl + "/containers/" + containerId + "/stop",
            null,
            Void.class
        );
    }

    public void deleteContainer(String containerId) {
        restTemplate.delete(pythonServiceUrl + "/containers/" + containerId);
    }

    public List<?> getContainerLogs(String containerId) {
        ResponseEntity<List> response = restTemplate.getForEntity(
            pythonServiceUrl + "/containers/" + containerId + "/logs",
            List.class
        );
        return response.getBody();
    }

    public Map<String, Object> getContainerStats(String containerId) {
        ResponseEntity<Map> response = restTemplate.getForEntity(
            pythonServiceUrl + "/containers/" + containerId + "/stats",
            Map.class
        );
        return response.getBody();
    }
} 