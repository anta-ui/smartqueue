# SmartQueue GraphQL API Documentation

## Overview
This document describes the GraphQL API endpoints available for the SmartQueue Analytics service.

## Authentication
All GraphQL queries require JWT authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_token>
```

## Queries

### Queue Metrics
Get a list of queue metrics:
```graphql
query {
  queueMetrics {
    edges {
      node {
        id
        queue {
          id
          name
        }
        date
        averageWaitTime
        totalCustomers
        peakHours
        abandonmentRate
        satisfactionScore
        createdAt
      }
    }
  }
}
```

### Queue Metrics Aggregate
Get aggregated queue metrics over a specified period:
```graphql
query {
  queueMetricsAggregate(days: 30) {
    date
    totalCustomers
    averageWaitTime
    averageAbandonmentRate
    averageSatisfactionScore
  }
}
```

### Compare Queues (Supervisor Only)
Compare performance metrics across different queues:
```graphql
query {
  compareQueues(days: 30) {
    queueId
    queueName
    totalCustomers
    averageWaitTime
    abandonmentRate
    satisfactionScore
  }
}
```

### Agent Performance
Get a list of agent performance metrics:
```graphql
query {
  agentPerformances {
    edges {
      node {
        id
        agent {
          id
          username
          firstName
          lastName
        }
        date
        customersServed
        averageServiceTime
        satisfactionScore
        createdAt
      }
    }
  }
}
```

### Agent Performance Aggregate
Get aggregated agent performance metrics over a specified period:
```graphql
query {
  agentPerformanceAggregate(days: 30) {
    date
    totalCustomersServed
    averageServiceTime
    averageSatisfactionScore
  }
}
```

### Compare Agents (Supervisor Only)
Compare performance metrics across different agents:
```graphql
query {
  compareAgents(days: 30) {
    agentId
    agentName
    customersServed
    averageServiceTime
    satisfactionScore
  }
}
```

## Real-time Updates (WebSocket)

### Queue Metrics Updates
Connect to WebSocket endpoint:
```
ws://localhost:8000/ws/analytics/queue_<queue_id>/
```

Message format for receiving updates:
```json
{
  "type": "queue.metrics.update",
  "queue_id": 123,
  "metrics": {
    "total_customers": 150,
    "average_wait_time": 300,
    "abandonment_rate": 0.06,
    "satisfaction_score": 4.6
  }
}
```

### Agent Performance Updates
Connect to WebSocket endpoint:
```
ws://localhost:8000/ws/analytics/agent_<agent_id>/
```

Message format for receiving updates:
```json
{
  "type": "agent.performance.update",
  "agent_id": 456,
  "performance": {
    "customers_served": 60,
    "average_service_time": 240,
    "satisfaction_score": 4.7
  }
}
```

## Error Handling

GraphQL errors will be returned in the following format:
```json
{
  "errors": [
    {
      "message": "Error message",
      "locations": [{"line": 1, "column": 1}],
      "path": ["fieldName"]
    }
  ]
}
```

Common error scenarios:
- Authentication errors (401): Token is missing or invalid
- Authorization errors (403): User doesn't have required permissions
- Validation errors (400): Invalid input data
- Not found errors (404): Requested resource doesn't exist
