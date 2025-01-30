# Database Model (MySQL)
initDB.sql must be runned during initialization of new database

## User
- uID (INT, PRIMARY_KEY)
- username (VARCHAR(ENV.CHAR_MEDIUM_LENGTH))
- email (VARCHAR(ENV.CHAR_MEDIUM_LENGTH))
- password (VARCHAR(64)) #using sha-256 hash
- created_at (TIME)
- updated_at (TIME)

## Notes
- nID (INT, PRIMARY_KEY)
- title (VARCHAR(ENV.CHAR_MEDIUM_LENGTH))
- content (TEXT)
- tags (JSON ARRAY)
- is_folder (BOOL)
- parent_folder (FOREIGN_KEY, nID) NULLABLE
- owner (FOREIGN_KEY, uID)
- created_at (TIME)
- updated_at (TIME)

## Shared
- sID (INT, PRIMARY_KEY)
- nID (FOREIGN_KEY, nID)
- user_from (FOREIGN_KEY, uID)
- user_to (FOREIGN_KEY, uID)
- permission (INT)
- sharedAt (TIME)

# Pinned
- nID (FOREIGN_KEY, nID)
- sID (FOREIGN_KEY, sID)
- uID (FOREIGN_KEY, uID)

---

# Endpoints
**All endpoints will return JSON**
**On all endpoints if unexpected error happened either NO RESPONSE or RETURN (500) "Server down"**

POST /register
Register a user
ret: (200) "User registered"
err: (400) "Invalid request body" | (409) "User already registered"

{
    username: "",
    email: "",
    password: ""
}

---

POST /login
Login a user (set a session cookie)
ret: (200) UserObject (excluding password) 
err: (400) "Invalid request body" | (404) "No matching credentials"
cookie: _Host-sessionJWT (stores user data except password)

{
    email: "",
    password: ""
}

---

## THE API BELOW REQUIRES USER ALREADY SIGNED IN
## ELSE WILL RETURN 
## - (403) "No session"
## - (403) "Invalid session"

GET /user
Get current user data
ret: (200) UserObject (except password)
cookie: _Host-sessionJWT (stores user data except password)

---

POST /user
Update current user data
ret: (200) "User updated"
err: (400) "Invalid request body"
cookie: _Host-sessionJWT (stores user data except password)

{
    username: "",
    password: ""
}

---

GET /notes \[?limit=0 & lastId=0 & shared=true & notOwned=true & notFolder=true & notNotes=true & tags=a,b,c & title=aku%20bebek\]
Get notes
limit, lastId --> pagination
shared --> include shared
notOwned, notFolder, notNotes --> filter
tags --> filter tags (if supplied tags is invalid then is omitted from the query)
title --> regex

ret: (200) \[NotesObject\]

---

POST /notes
Create new notes
ret: (200) NotesObject
err: (400) "Invalid request body"

{
    title: "",
    tags: \[""\],
    content: "",
    isFolder: false, (optional)
    parentFolder: 0 \[NULLABLE\] (optional)
}

*content will be empty if isFolder is true
**tags can only contain word

---

### The endpoints below rejects if has no permission or rejects if nID is not found
### On both cases the return would be (403) You don't have permission to \[action\] this notes
### Permission is checked for notes and parent (reccursively)

GET /notes/{id}
Get notes detail
ret: (200) NotesObject
err: (403) "You don't have permission to view this notes"

---

PUT /notes/{id}
Update notes detail
ret: (200) the updated NotesObject
err: (400) "Invalid request body" | (403) "You don't have permission to update this notes"

{
    title: "",
    tags: \[""\],
    content: "",
    isFolder*: false, (optional)
    parentFolder: 0 \[NULLABLE\] (optional)
}

*this property will be ignored, you can't change notes to folder and vice versa
**tags can only contain word

---

DELETE /notes/{id}
Delete notes
ret: (200) "Notes deleted"
err: (403) "You don't have permission to delete this notes"

---

GET /notes/{id}/child
Get the child of a notes (useful if notes is a folder)
ret: (200) \[NotesObject\]

*this path doesn't check wether notes is a folder or not

---

GET /notes/shared
Get all shared notes permission to you (use this along with get /notes?shared=true)
ret: (200) \[PermissionObject\]

---

POST /notes/{id}/share
Share a note or override share permission
ret: (200) PermissionObject
err: (400) "Invalid request body" | (403) "You don't have permission to share this notes" | (404) "User not found"

{
    to: "email",
    permission: 0
}

Permission:
- 0 (read-only)
- 1 (read and edit)
- 2 (read, edit, delete)
- 3 (read, edit, delete, share)

---

GET /notes/{id}/share
Get all users that are shared this notes
ret: (200) \[PermissionObject\]

---

DELETE /notes/{id}/share/{share_id}
Delete a share
ret: (200) "Share deleted"
err: (403) "You don't have permission to share this notes"

*this route doesn't check whether share_id exist

---

GET /notes/pin
Get all pinned notes for current user
ret: (200) \[nID\]

---

GET /notes/{id}/pin
Check if a notes is pinned
ret: (200) true | false
err: (403) "You don't have permission to view this notes"

---

POST /notes/{id}/pin
Pin a note
ret: (200) "Notes pinned"
err: (403) "You don't have permission to view this notes"

---

DELETE /notes/{id}/pin
Unpin a note
ret: (200) "Notes unpinned"
err: (403) "You don't have permission to view this notes"

# .env 
Put at ROOT folder (next to jsconfig.json)

```INPUT_LENGTH_LIMIT=64
TAGS_QUANTITY_LIMIT=10
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=gdgoc_tugas_1
DB_USERNAME=root
DB_PASSWORD=root
MYSQL_DEFAULT_LIMIT=1000
JWT_SECRET_KEY="utKNgOZIO4Be6jWKjIChwixhxwlsZZ5ySUNReqAz7x8Jp9vs/4NOwyCCY1sHe0KTTZ0YEP2Bs11ZCgiGPIGoPg=="
SESSION_MINUTES_EXPIRE=300
MAXIMUM_PERMISSION=3```

Description
INPUT_LENGTH_LIMIT --> for ALL string input
**Excluding**: 
- LONG_FORM (e.g. notes content)
- ID (notesID or userID)

**Include**:
- Tags
- Title
- Username
- Email Name
- Password

For full usage see @/api/1.0/_util/jsonschema.js

MAXIMUM_PERMISSION is the highest permissino available which is 3 for now
TAGS_QUANTITY_LIMIT is the number of tags allowed for a note