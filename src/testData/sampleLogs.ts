// This file is just for testing multiple and large commits
// Will delete this file after testing

// Sample log data for testing large file processing
export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  service: string;
  message: string;
  metadata?: Record<string, any>;
}

export const sampleLogs: LogEntry[] = [
  {
    timestamp: '2025-01-15T10:30:00.000Z',
    level: 'INFO',
    service: 'auth-service',
    message: 'User login successful',
    metadata: { userId: 'user123', sessionId: 'sess456' }
  },
  {
    timestamp: '2025-01-15T10:30:15.123Z',
    level: 'WARN',
    service: 'payment-service',
    message: 'Payment processing took longer than expected',
    metadata: { transactionId: 'txn789', duration: 5240 }
  },
  {
    timestamp: '2025-01-15T10:30:22.456Z',
    level: 'ERROR',
    service: 'notification-service',
    message: 'Failed to send email notification',
    metadata: { userId: 'user123', emailAddress: 'user@example.com', errorCode: 'SMTP_TIMEOUT' }
  },
  {
    timestamp: '2025-01-15T10:30:30.789Z',
    level: 'INFO',
    service: 'user-service',
    message: 'Profile update completed',
    metadata: { userId: 'user123', fieldsUpdated: ['name', 'email', 'preferences'] }
  },
  {
    timestamp: '2025-01-15T10:30:45.012Z',
    level: 'DEBUG',
    service: 'cache-service',
    message: 'Cache miss for user preferences',
    metadata: { userId: 'user123', cacheKey: 'user:preferences:user123', ttl: 3600 }
  },
  {
    timestamp: '2025-01-15T10:31:00.345Z',
    level: 'INFO',
    service: 'api-gateway',
    message: 'Request processed successfully',
    metadata: { endpoint: '/api/v1/users/profile', method: 'PUT', responseTime: 234, statusCode: 200 }
  },
  {
    timestamp: '2025-01-15T10:31:15.678Z',
    level: 'WARN',
    service: 'database',
    message: 'Query execution time exceeded threshold',
    metadata: { query: 'SELECT * FROM users WHERE active = true', executionTime: 2100, threshold: 2000 }
  },
  {
    timestamp: '2025-01-15T10:31:30.901Z',
    level: 'ERROR',
    service: 'file-upload-service',
    message: 'File upload failed due to size limit',
    metadata: { fileName: 'document.pdf', fileSize: 52428800, maxSize: 50331648, userId: 'user456' }
  },
  {
    timestamp: '2025-01-15T10:31:45.234Z',
    level: 'INFO',
    service: 'search-service',
    message: 'Search query executed',
    metadata: { query: 'javascript tutorials', resultsCount: 1250, executionTime: 45 }
  },
  {
    timestamp: '2025-01-15T10:32:00.567Z',
    level: 'DEBUG',
    service: 'metrics-collector',
    message: 'System metrics collected',
    metadata: { 
      cpuUsage: 45.2, 
      memoryUsage: 78.5, 
      diskUsage: 23.1, 
      activeConnections: 1247,
      requestsPerSecond: 125.3
    }
  }
];

export function filterLogsByLevel(logs: LogEntry[], level: LogEntry['level']): LogEntry[] {
  return logs.filter(log => log.level === level);
}

export function getLogsInTimeRange(logs: LogEntry[], startTime: string, endTime: string): LogEntry[] {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  return logs.filter(log => {
    const logTime = new Date(log.timestamp);
    return logTime >= start && logTime <= end;
  });
}

export function groupLogsByService(logs: LogEntry[]): Record<string, LogEntry[]> {
  return logs.reduce((groups, log) => {
    const service = log.service;
    if (!groups[service]) {
      groups[service] = [];
    }
    groups[service].push(log);
    return groups;
  }, {} as Record<string, LogEntry[]>);
}

export function formatLogMessage(log: LogEntry): string {
  const metadataStr = log.metadata ? ` | ${JSON.stringify(log.metadata)}` : '';
  return `[${log.timestamp}] ${log.level} ${log.service}: ${log.message}${metadataStr}`;
}

console.log('Sample logs module loaded successfully');
console.log(`Total sample logs: ${sampleLogs.length}`);
console.log('Available services:', [...new Set(sampleLogs.map(log => log.service))]);
console.log('Log levels distribution:', 
  Object.fromEntries(
    ['INFO', 'WARN', 'ERROR', 'DEBUG'].map(level => 
      [level, sampleLogs.filter(log => log.level === level).length]
    )
  )
);