# Bizora — API Documentation

## Base URL

```
Development:  http://localhost:5000/api
Production:   https://api.bizora.io/api
```

## Response Format

### Success
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### Error
```json
{
  "success": false,
  "message": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

### Error Codes
| Code | HTTP Status | Description |
|---|---|---|
| `BAD_REQUEST` | 400 | Malformed request |
| `UNAUTHORIZED` | 401 | Missing or invalid auth token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Duplicate resource |
| `VALIDATION_ERROR` | 422 | Input validation failure |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Phase 1 Endpoints

### Health Check

```
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "message": "Bizora API is running",
  "environment": "development",
  "timestamp": "2026-10-03T12:58:59.588Z",
  "database": "connected",
  "uptime": "120s"
}
```

No authentication required. Safe to call publicly for monitoring.

---

## Phase 2+ Planned Endpoints

### Authentication (`/api/auth`)
| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Register organization + owner |
| POST | `/auth/login` | Login, returns token pair |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Invalidate refresh token |
| GET | `/auth/me` | Get current user + org |
| POST | `/auth/accept-invite/:token` | Accept team invite |

### Team (`/api/team`)
| Method | Path | Description |
|---|---|---|
| GET | `/team` | List members |
| POST | `/team/invite` | Send invite |
| PATCH | `/team/:id/role` | Change role |
| DELETE | `/team/:id` | Deactivate member |

### Customers (`/api/customers`)
| Method | Path | Description |
|---|---|---|
| GET | `/customers` | List (paginated, searchable) |
| GET | `/customers/:id` | Customer detail |
| POST | `/customers` | Create |
| PUT | `/customers/:id` | Update |
| DELETE | `/customers/:id` | Soft delete |

> Additional endpoint groups for Projects, Tasks, Invoices, Expenses, Reports, and Settings will be documented as each phase is implemented.

---

## Conventions

### Pagination
```
GET /api/customers?page=1&limit=20&sort=createdAt&order=desc
```

Response includes:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 142,
    "totalPages": 8
  }
}
```

### Filtering
```
GET /api/invoices?status=pending&from=2026-01-01&to=2026-12-31
```

### Authentication Header (Phase 2)
```
Authorization: Bearer <access_token>
```
