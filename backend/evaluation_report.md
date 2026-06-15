# Automated Hackathon Judging Report - Round 2

## Summary
- **Total Participants Evaluated:** 7
- **Qualified for Round 3:** 1
- **Disqualified:** 6

## Leaderboard
1. **kahan** (kahan@gmail.com) - Score: **22/60** | Status: **QUALIFIED**
2. **kabir** (kabir@gmail.com) - Score: **10/60** | Status: **DISQUALIFIED**
3. **kabir** (kabir@gmail.com) - Score: **10/60** | Status: **DISQUALIFIED**
4. **om** (om@gamil.com) - Score: **0/60** | Status: **DISQUALIFIED**
5. **rahul** (rahul@gmail.com) - Score: **0/60** | Status: **DISQUALIFIED**
6. **jaydip** (jaydip@gamil.com) - Score: **0/60** | Status: **DISQUALIFIED**
7. **kabir** (kabir@gmail.com) - Score: **0/60** | Status: **DISQUALIFIED**

## Individual Audit Report

### Participant: om (om@gamil.com)
- **User ID:** `6a2fa29829a1e8c2fee934d6`
- **Score:** **0/60**
- **Status:** **DISQUALIFIED**
- **Unlock Round 3:** `false`
- **Summary:** *Evaluation failed: Empty submission.*
- **Critical Errors:**
  - ⚠️ No project files submitted.
- **Exact Failure Reasons:**
  - 🔍 Submission is completely empty.
- **Suggested Fixes:**
  - 💡 Submit your codebase via the Monaco workspace.

---

### Participant: rahul (rahul@gmail.com)
- **User ID:** `6a2fb9f4555769096134e77d`
- **Score:** **0/60**
- **Status:** **DISQUALIFIED**
- **Unlock Round 3:** `false`
- **Summary:** *Evaluation failed: Empty submission.*
- **Critical Errors:**
  - ⚠️ No project files submitted.
- **Exact Failure Reasons:**
  - 🔍 Submission is completely empty.
- **Suggested Fixes:**
  - 💡 Submit your codebase via the Monaco workspace.

---

### Participant: jaydip (jaydip@gamil.com)
- **User ID:** `6a2fa0725b2f3acadf3134a2`
- **Score:** **0/60**
- **Status:** **DISQUALIFIED**
- **Unlock Round 3:** `false`
- **Summary:** *Evaluation failed: Empty submission.*
- **Critical Errors:**
  - ⚠️ No project files submitted.
- **Exact Failure Reasons:**
  - 🔍 Submission is completely empty.
- **Suggested Fixes:**
  - 💡 Submit your codebase via the Monaco workspace.

---

### Participant: kabir (kabir@gmail.com)
- **User ID:** `6a2fbfc1bd35f556f76f758a`
- **Score:** **0/60**
- **Status:** **DISQUALIFIED**
- **Unlock Round 3:** `false`
- **Summary:** *Evaluation failed: Empty submission.*
- **Critical Errors:**
  - ⚠️ No project files submitted.
- **Exact Failure Reasons:**
  - 🔍 Submission is completely empty.
- **Suggested Fixes:**
  - 💡 Submit your codebase via the Monaco workspace.

---

### Participant: kabir (kabir@gmail.com)
- **User ID:** `6a2fbfc1bd35f556f76f758a`
- **Score:** **10/60**
- **Status:** **DISQUALIFIED**
- **Unlock Round 3:** `false`
- **Summary:** *Automatic Audit Summary: Received 10/60 points. Disqualified due to score below threshold of 20 points.*
- **Passed Checks:**
  - ✅ Project integrity verification passed
  - ✅ Authentication routes/files exist
  - ✅ Attendance system structure exists
- **Failed Checks:**
  - ❌ Mocked authentication detected
  - ❌ Attendance system lacks data flow implementation
  - ❌ Leave request system missing
  - ❌ Monthly report feature missing
  - ❌ Basic or missing style layout
- **Critical Errors:**
  - ⚠️ Empty files detected in submission
- **Exact Failure Reasons:**
  - 🔍 Authentication endpoints use local mock checks or hardcoded return statements instead of connecting to MongoDB and validating credentials.
  - 🔍 Attendance frontend components or routes exist, but they have no functional code to mark or save records.
  - 🔍 No leave request form, leaves model, or leave routes are present.
  - 🔍 No report generator or reports page is present.
  - 🔍 The submission includes empty source files which will cause build or execution failures.
  - 🔍 The styling is minimal or absent, leaving the visual interface layout unstyled.
- **Suggested Fixes:**
  - 💡 Integrate User model (mongoose) inside authController, hash passwords with bcrypt, and sign JWT tokens upon successful authentication.
  - 💡 Connect the "Present/Absent" buttons to trigger a POST request to the backend attendance endpoint.
  - 💡 Add a leave submission form for students, an approval table for teachers, and backend handlers to update statuses.
  - 💡 Create a reports component displaying monthly attendance rates and summaries for students.
  - 💡 Remove unused files or complete their implementation.
  - 💡 Implement CSS rules or integrate Tailwind CSS to provide a clean and polished responsive user interface.

---

### Participant: kabir (kabir@gmail.com)
- **User ID:** `6a2fbfc1bd35f556f76f758a`
- **Score:** **10/60**
- **Status:** **DISQUALIFIED**
- **Unlock Round 3:** `false`
- **Summary:** *Automatic Audit Summary: Received 10/60 points. Disqualified due to score below threshold of 20 points.*
- **Passed Checks:**
  - ✅ Project integrity verification passed
  - ✅ Authentication routes/files exist
  - ✅ Attendance system structure exists
- **Failed Checks:**
  - ❌ Mocked authentication detected
  - ❌ Attendance system lacks data flow implementation
  - ❌ Leave request system missing
  - ❌ Monthly report feature missing
  - ❌ Basic or missing style layout
- **Critical Errors:**
  - ⚠️ Empty files detected in submission
- **Exact Failure Reasons:**
  - 🔍 Authentication endpoints use local mock checks or hardcoded return statements instead of connecting to MongoDB and validating credentials.
  - 🔍 Attendance frontend components or routes exist, but they have no functional code to mark or save records.
  - 🔍 No leave request form, leaves model, or leave routes are present.
  - 🔍 No report generator or reports page is present.
  - 🔍 The submission includes empty source files which will cause build or execution failures.
  - 🔍 The styling is minimal or absent, leaving the visual interface layout unstyled.
- **Suggested Fixes:**
  - 💡 Integrate User model (mongoose) inside authController, hash passwords with bcrypt, and sign JWT tokens upon successful authentication.
  - 💡 Connect the "Present/Absent" buttons to trigger a POST request to the backend attendance endpoint.
  - 💡 Add a leave submission form for students, an approval table for teachers, and backend handlers to update statuses.
  - 💡 Create a reports component displaying monthly attendance rates and summaries for students.
  - 💡 Remove unused files or complete their implementation.
  - 💡 Implement CSS rules or integrate Tailwind CSS to provide a clean and polished responsive user interface.

---

### Participant: kahan (kahan@gmail.com)
- **User ID:** `6a2fd39e0b262f49ca90fb4d`
- **Score:** **22/60**
- **Status:** **QUALIFIED**
- **Unlock Round 3:** `true`
- **Summary:** *Automatic Audit Summary: Received 22/60 points. Passed threshold*
- **Passed Checks:**
  - ✅ Project integrity verification passed
  - ✅ Authentication routes/files exist
  - ✅ Attendance system structure exists
  - ✅ Leave request system structure exists
  - ✅ No compilation-blocking syntax or import errors found
  - ✅ React component hierarchy and visual styles verified
- **Failed Checks:**
  - ❌ Mocked authentication detected
  - ❌ Mocked attendance data store detected
  - ❌ Mocked leave data store detected
  - ❌ Monthly report feature missing
- **Exact Failure Reasons:**
  - 🔍 Authentication endpoints use local mock checks or hardcoded return statements instead of connecting to MongoDB and validating credentials.
  - 🔍 Attendance marking system stores records in an in-memory array that resets whenever the server restarts.
  - 🔍 Leave request system stores requests in an in-memory array without persistence.
  - 🔍 No report generator or reports page is present.
- **Suggested Fixes:**
  - 💡 Integrate User model (mongoose) inside authController, hash passwords with bcrypt, and sign JWT tokens upon successful authentication.
  - 💡 Define a Mongoose schema for Attendance and save/retrieve records from MongoDB.
  - 💡 Implement a Mongoose Leave model with fields studentId, reason, status (Pending, Approved, Rejected), and date range.
  - 💡 Create a reports component displaying monthly attendance rates and summaries for students.

---

