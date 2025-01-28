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
ret: (200) "User registered"
err: (400) "Invalid request body" | (409) "User already registered"

{
    username: "",
    email: "",
    password: ""
}

---

POST /login
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

POST /user
ret: (200) "User updated"
err: (400) "Invalid request body"

{
    username: "",
    password: ""
}

---

GET /notes \[?limit=0 & lastId=0 & shared=true & owned=false\]
ret: (200) \[NotesObject\]

---

POST /notes
ret: (200) NotesObject
err: (400) "Invalid request body"

{
    title: "",
    tags: "",
    content: "",
    isFolder: false, (optional)
    parentFolder: 0 \[NULLABLE\] (optional)
}

---

GET /notes/{id}
ret: (200) NotesObject || null
err: (403) "You don't have permission to view this notes" | (404) "Notes not found"

---

PUT /notes/{id}
ret: (200) the updated NotesObject
err: (400) "Invalid request body" | (403) "You don't have permission to update this notes" | (404) "Notes not found"

{
    title: "",
    tags: "",
    content: "",
    isFolder*: false, (optional)
    parentFolder: 0 \[NULLABLE\] (optional)
}

*this property will be ignored, you can't change notes to folder and vice versa

---

DELETE /notes/{id}
ret: (200) "Notes deleted"
err: (403) "You don't have permission to delete this notes" | (404) "Notes not found"

---

GET /notes/shared
ret: (200) \[PermissionObject\]

---

POST /notes/{id}/share
ret: (200) PermissionObject
err: (400) "Invalid request body" | (403) "You don't have permission to share this notes" |
     (404) "Notes not found" | (404) "User not found"

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
ret: (200) \[PermissionObject\]

---

DELETE /notes/{id}/share/{share_id}
ret: (200) "Share deleted"
err: (403) "You don't have permission to share this notes"

*this route doesn't check whether share_id or id exist

---

GET /notes/pin
ret: (200) \[nID\]

---

GET /notes/{id}/pin
ret: (200) true | false
err: (403) "You don't have permission to view this notes"

If notes not found then the error above is returned

---

POST /notes/{id}/pin
ret: (200) "Notes pinned"
err: (403) "You don't have permission to view this notes"

If notes not found then the error above is returned

---

DELETE /notes/{id}/pin
ret: (200) "Notes unpinned"
err: (403) "You don't have permission to view this notes"

If notes not found then the error above is returned

# .env 
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