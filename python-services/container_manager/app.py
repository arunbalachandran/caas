from flask import Flask, jsonify, request
import docker
from datetime import datetime
import json

app = Flask(__name__)
client = docker.from_env()

@app.route('/containers', methods=['GET'])
def list_containers():
    containers = []
    for container in client.containers.list(all=True):
        stats = container.stats(stream=False)
        
        # TODO: This is a hack to fix the issue where the system_cpu_usage is not present in the stats
        if 'system_cpu_usage' not in stats['cpu_stats'].keys():
            print('Container: ' , container.name, 'has no system_cpu_usage')
            continue
        cpu_delta = stats['cpu_stats']['cpu_usage']['total_usage'] - stats['precpu_stats']['cpu_usage']['total_usage']
        system_delta = stats['cpu_stats']['system_cpu_usage'] - stats['precpu_stats']['system_cpu_usage']
        cpu_usage = (cpu_delta / system_delta) * 100.0 if system_delta > 0 else 0.0

        # Calculate memory usage
        memory_usage = stats['memory_stats'].get('usage', 0)
        memory_limit = stats['memory_stats'].get('limit', 0)

        containers.append({
            'id': container.id,
            'containerName': container.name,
            'imageName': container.image.tags[0] if container.image.tags else 'none',
            'status': container.status,
            'cpuLimit': round(cpu_usage, 2),
            'memoryLimit': round(memory_limit / (1024 * 1024), 2),  # Convert to MB
            'memoryUsage': round(memory_usage / (1024 * 1024), 2),  # Convert to MB
            'createdAt': container.attrs['Created'],
            'ports': container.attrs['NetworkSettings']['Ports']
        })
    
    return jsonify(containers)

@app.route('/containers', methods=['POST'])
def create_container():
    data = request.get_json()
    
    try:
        container = client.containers.run(
            image=data['imageName'],
            name=data['containerName'],
            detach=True,
            cpu_quota=int(data.get('cpuLimit', 100000)),  # 100000 = 100% of CPU
            mem_limit=f"{data.get('memoryLimit', 512)}m",  # Default to 512MB
            environment=data.get('environmentVars', {}),
            ports=data.get('ports', {}),
        )
        
        return jsonify({
            'id': container.id,
            'containerName': container.name,
            'imageName': container.image.tags[0] if container.image.tags else 'none',
            'status': container.status,
            'cpuLimit': data.get('cpuLimit', 100),
            'memoryLimit': data.get('memoryLimit', 512),
            'createdAt': container.attrs['Created']
        })
    except docker.errors.APIError as e:
        return jsonify({'error': str(e)}), 400

@app.route('/containers/<container_id>/start', methods=['POST'])
def start_container(container_id):
    try:
        container = client.containers.get(container_id)
        container.start()
        return jsonify({'status': 'started'})
    except docker.errors.APIError as e:
        return jsonify({'error': str(e)}), 400

@app.route('/containers/<container_id>/stop', methods=['POST'])
def stop_container(container_id):
    try:
        container = client.containers.get(container_id)
        container.stop()
        return jsonify({'status': 'stopped'})
    except docker.errors.APIError as e:
        return jsonify({'error': str(e)}), 400

@app.route('/containers/<container_id>', methods=['DELETE'])
def delete_container(container_id):
    try:
        container = client.containers.get(container_id)
        container.remove(force=True)
        return jsonify({'status': 'deleted'})
    except docker.errors.APIError as e:
        return jsonify({'error': str(e)}), 400

@app.route('/containers/<container_id>/logs', methods=['GET'])
def get_container_logs(container_id):
    try:
        container = client.containers.get(container_id)
        logs = container.logs(tail=100, timestamps=True).decode('utf-8').split('\n')
        
        formatted_logs = []
        for log in logs:
            if log:
                # Split timestamp and message
                parts = log.split(' ', 1)
                if len(parts) == 2:
                    timestamp, message = parts
                    formatted_logs.append({
                        'timestamp': timestamp,
                        'type': 'error' if message.startswith('ERROR') else 'info',
                        'message': message
                    })
        
        return jsonify(formatted_logs)
    except docker.errors.APIError as e:
        return jsonify({'error': str(e)}), 400

@app.route('/containers/<container_id>/stats', methods=['GET'])
def get_container_stats(container_id):
    try:
        container = client.containers.get(container_id)
        stats = container.stats(stream=False)
        
        # Calculate CPU usage
        cpu_delta = stats['cpu_stats']['cpu_usage']['total_usage'] - stats['precpu_stats']['cpu_usage']['total_usage']
        system_delta = stats['cpu_stats']['system_cpu_usage'] - stats['precpu_stats']['system_cpu_usage']
        cpu_usage = (cpu_delta / system_delta) * 100.0 if system_delta > 0 else 0.0
        
        # Memory stats
        memory_usage = stats['memory_stats'].get('usage', 0)
        memory_limit = stats['memory_stats'].get('limit', 0)
        
        # Network stats
        networks = stats['networks'] if 'networks' in stats else {}
        rx_bytes = sum(net['rx_bytes'] for net in networks.values()) if networks else 0
        tx_bytes = sum(net['tx_bytes'] for net in networks.values()) if networks else 0
        
        # Block I/O stats
        io_stats = stats['blkio_stats']['io_service_bytes_recursive']
        read_bytes = sum(stat['value'] for stat in io_stats if stat['op'] == 'Read') if io_stats else 0
        write_bytes = sum(stat['value'] for stat in io_stats if stat['op'] == 'Write') if io_stats else 0
        
        return jsonify({
            'cpuUsage': round(cpu_usage, 2),
            'memoryUsage': memory_usage,
            'memoryLimit': memory_limit,
            'networkReceived': rx_bytes,
            'networkSent': tx_bytes,
            'blockRead': read_bytes,
            'blockWrite': write_bytes,
            'pids': stats['pids_stats'].get('current', 0),
            'threads': len(stats['pids_stats']) if 'pids_stats' in stats else 0
        })
    except docker.errors.APIError as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000) 