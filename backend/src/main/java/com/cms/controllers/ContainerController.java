package com.cms.controllers;

import com.cms.services.ContainerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/containers")
@PreAuthorize("isAuthenticated()")
@CrossOrigin(origins = "http://localhost:3000")
public class ContainerController {

    private final ContainerService containerService;

    public ContainerController(ContainerService containerService) {
        this.containerService = containerService;
    }

    @GetMapping
    public ResponseEntity<List<?>> getContainers() {
        return ResponseEntity.ok(containerService.getContainers());
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createContainer(@RequestBody Map<String, Object> containerData) {
        return ResponseEntity.ok(containerService.createContainer(containerData));
    }

    @PostMapping("/{containerId}/start")
    public ResponseEntity<Void> startContainer(@PathVariable String containerId) {
        containerService.startContainer(containerId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{containerId}/stop")
    public ResponseEntity<Void> stopContainer(@PathVariable String containerId) {
        containerService.stopContainer(containerId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{containerId}")
    public ResponseEntity<Void> deleteContainer(@PathVariable String containerId) {
        containerService.deleteContainer(containerId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{containerId}/logs")
    public ResponseEntity<List<?>> getContainerLogs(@PathVariable String containerId) {
        return ResponseEntity.ok(containerService.getContainerLogs(containerId));
    }

    @GetMapping("/{containerId}/stats")
    public ResponseEntity<Map<String, Object>> getContainerStats(@PathVariable String containerId) {
        return ResponseEntity.ok(containerService.getContainerStats(containerId));
    }
} 