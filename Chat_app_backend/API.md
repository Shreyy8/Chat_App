# ChatFlow Backend API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format
All API responses follow this format:
```json
{
  "success": boolean,
  "message": string,
  "data": any,
  "errors": any[],
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "pages": number,
    "hasNext": boolean,
    "hasPrev": boolean
  }
}
```

---

## Authentication Endpoints

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "name": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "string",
      "username": "string",
      "email": "string",
      "name": "string",
      "avatar": "string",
      "status": "offline",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

### Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "identifier": "string", // username or email
  "password": "string"
}
```

### Refresh Token
```http
POST /auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

### Get Current User
```http
GET /auth/me
```

**Headers:** `Authorization: Bearer <token>`

### Logout
```http
POST /auth/logout
```

**Headers:** `Authorization: Bearer <token>`

---

## User Endpoints

### Get All Users
```http
GET /users?page=1&limit=20&search=query&exclude=id1,id2
```

**Headers:** `Authorization: Bearer <token>`

### Get User by ID
```http
GET /users/:id
```

**Headers:** `Authorization: Bearer <token>`

### Update User Profile
```http
PUT /users/:id
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "string",
  "status": "online|away|offline",
  "statusMessage": "string",
  "description": "string",
  "banner": "string",
  "socialLinks": [
    {
      "platform": "string",
      "url": "string"
    }
  ]
}
```

### Upload Avatar
```http
POST /users/:id/avatar
```

**Headers:** `Authorization: Bearer <token>`

**Request:** Multipart form data with `avatar` file

### Update User Status
```http
PUT /users/:id/status
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "online|away|offline",
  "statusMessage": "string"
}
```

### Search Users
```http
GET /users/search?q=query&limit=10
```

**Headers:** `Authorization: Bearer <token>`

### Get Online Users
```http
GET /users/online
```

**Headers:** `Authorization: Bearer <token>`

---

## Chat Endpoints

### Get User's Chats
```http
GET /chats
```

**Headers:** `Authorization: Bearer <token>`

### Create Chat
```http
POST /chats
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "type": "dm|group",
  "name": "string", // required for group chats
  "members": ["user_id1", "user_id2"],
  "description": "string"
}
```

### Get Chat by ID
```http
GET /chats/:chatId
```

**Headers:** `Authorization: Bearer <token>`

### Update Chat
```http
PUT /chats/:chatId
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "customBackground": "string"
}
```

### Delete Chat
```http
DELETE /chats/:chatId
```

**Headers:** `Authorization: Bearer <token>`

### Add Members to Chat
```http
POST /chats/:chatId/members
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "members": ["user_id1", "user_id2"]
}
```

### Remove Member from Chat
```http
DELETE /chats/:chatId/members/:userId
```

**Headers:** `Authorization: Bearer <token>`

### Promote Member to Admin
```http
POST /chats/:chatId/members/:userId/promote
```

**Headers:** `Authorization: Bearer <token>`

### Demote Admin to Member
```http
POST /chats/:chatId/members/:userId/demote
```

**Headers:** `Authorization: Bearer <token>`

---

## Message Endpoints

### Get Chat Messages
```http
GET /messages/chats/:chatId?page=1&limit=50
```

**Headers:** `Authorization: Bearer <token>`

### Send Message
```http
POST /messages/chats/:chatId
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "string",
  "type": "text|image|document",
  "mediaUrl": "string",
  "replyTo": "message_id"
}
```

### Edit Message
```http
PUT /messages/:messageId
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "string"
}
```

### Delete Message
```http
DELETE /messages/:messageId
```

**Headers:** `Authorization: Bearer <token>`

### React to Message
```http
POST /messages/:messageId/react
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "emoji": "string"
}
```

### Remove Reaction from Message
```http
DELETE /messages/:messageId/react
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "emoji": "string"
}
```

### Search Messages in Chat
```http
GET /messages/chats/:chatId/search?q=query&page=1&limit=20
```

**Headers:** `Authorization: Bearer <token>`

---

## File Upload Endpoints

### Upload File
```http
POST /files/upload
```

**Headers:** `Authorization: Bearer <token>`

**Request:** Multipart form data with `file` field

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "filename": "string",
    "originalName": "string",
    "size": 12345,
    "mimetype": "image/jpeg",
    "url": "/api/files/filename"
  }
}
```

### Get File
```http
GET /files/:filename
```

---

## WebSocket Events

### Client to Server Events

#### Join Chat
```javascript
socket.emit('join_chat', chatId);
```

#### Leave Chat
```javascript
socket.emit('leave_chat', chatId);
```

#### Send Message
```javascript
socket.emit('send_message', {
  chatId: 'string',
  content: 'string',
  type: 'text|image|document',
  mediaUrl: 'string',
  replyTo: 'message_id'
});
```

#### Start Typing
```javascript
socket.emit('typing_start', chatId);
```

#### Stop Typing
```javascript
socket.emit('typing_stop', chatId);
```

#### Change User Status
```javascript
socket.emit('user_status_change', 'online|away|offline');
```

### Server to Client Events

#### Message Received
```javascript
socket.on('message_received', (message) => {
  // Handle new message
});
```

#### Message Updated
```javascript
socket.on('message_updated', (message) => {
  // Handle message update
});
```

#### Message Deleted
```javascript
socket.on('message_deleted', (messageId) => {
  // Handle message deletion
});
```

#### User Typing
```javascript
socket.on('user_typing', (data) => {
  // data: { userId, userName, chatId }
});
```

#### User Stopped Typing
```javascript
socket.on('user_stopped_typing', (data) => {
  // data: { userId, chatId }
});
```

#### User Status Changed
```javascript
socket.on('user_status_changed', (data) => {
  // data: { userId, status }
});
```

#### Chat Updated
```javascript
socket.on('chat_updated', (chat) => {
  // Handle chat update
});
```

#### User Joined Chat
```javascript
socket.on('user_joined_chat', (data) => {
  // data: { userId, chatId }
});
```

#### User Left Chat
```javascript
socket.on('user_left_chat', (data) => {
  // data: { userId, chatId }
});
```

#### Error
```javascript
socket.on('error', (error) => {
  // error: { message, code? }
});
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

---

## Rate Limiting

- **Window:** 15 minutes
- **Limit:** 100 requests per IP
- **Headers:** Rate limit information is included in response headers

---

## File Upload Limits

- **Max file size:** 10MB
- **Allowed types:** 
  - Images: JPEG, PNG, GIF, WebP
  - Documents: PDF, TXT
- **Storage:** Files are stored in the `uploads/` directory

---

## WebSocket Connection

Connect to WebSocket with authentication:
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

---

## Examples

### Complete Authentication Flow
```javascript
// 1. Register
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'johndoe',
    email: 'john@example.com',
    password: 'password123',
    name: 'John Doe'
  })
});

const { data } = await registerResponse.json();
const { accessToken, refreshToken } = data;

// 2. Use token for authenticated requests
const usersResponse = await fetch('/api/users', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
```

### Send Message via WebSocket
```javascript
socket.emit('send_message', {
  chatId: 'chat_id_here',
  content: 'Hello, world!',
  type: 'text'
});

socket.on('message_received', (message) => {
  console.log('New message:', message);
});
```
