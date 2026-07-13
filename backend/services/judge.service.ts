interface ProjectFile {
  path: string;
  content: string;
}

interface EvalResult {
  score: number;
  status: string;
  unlockRound3: boolean;
  passedChecks: string[];
  failedChecks: string[];
  criticalErrors: string[];
  summary: string;
  breakdown: {
    auth: number;
    attendance: number;
    leave: number;
    reports: number;
    codeQuality: number;
    uiUx: number;
  };
  failureReasons: string[];
  suggestedFixes: string[];
}

/**
 * Production-grade Automated Hackathon Judging System
 */
const evaluateSubmission = (projectFiles: ProjectFile[]): EvalResult => {
  // Initialize scores
  let authScore = 0;
  let attendanceScore = 0;
  let leaveScore = 0;
  let reportsScore = 0;
  let codeQualityScore = 0;
  let uiUxScore = 0;

  const passedChecks: string[] = [];
  const failedChecks: string[] = [];
  const criticalErrors: string[] = [];
  const failureReasons: string[] = [];
  const suggestedFixes: string[] = [];

  // 1. Project Integrity & Boilerplate detection
  if (!projectFiles || projectFiles.length === 0) {
    criticalErrors.push('No project files submitted.');
    failureReasons.push('Submission is completely empty.');
    suggestedFixes.push('Submit your codebase via the Monaco workspace.');
    return {
      score: 0,
      status: 'DISQUALIFIED',
      unlockRound3: false,
      passedChecks,
      failedChecks,
      criticalErrors,
      summary: 'Evaluation failed: Empty submission.',
      breakdown: { auth: 0, attendance: 0, leave: 0, reports: 0, codeQuality: 0, uiUx: 0 },
      failureReasons,
      suggestedFixes
    };
  }

  // Detect template-only files
  const defaultPaths = ['src/App.jsx', 'src/styles.css', 'backend/server.js', 'backend/routes.js', 'README.md'];
  const hasModifiedFiles = projectFiles.some((f) => {
    if (!defaultPaths.includes(f.path)) return true;
    // Check if default files were modified
    if (f.path === 'src/App.jsx' && !f.content.includes('LearnStack Project Workspace')) return true;
    if (f.path === 'backend/server.js' && !f.content.includes("routes = require('./routes')")) return true;
    return false;
  });

  if (!hasModifiedFiles && projectFiles.length <= 5) {
    criticalErrors.push('Boilerplate submission detected.');
    failureReasons.push('No custom codebase was implemented. Only the default template files exist without modifications.');
    suggestedFixes.push('Implement your custom full-stack attendance tracker starting from the template files.');
    return {
      score: 0,
      status: 'DISQUALIFIED',
      unlockRound3: false,
      passedChecks,
      failedChecks,
      criticalErrors,
      summary: 'Evaluation failed: Boilerplate submission only.',
      breakdown: { auth: 0, attendance: 0, leave: 0, reports: 0, codeQuality: 0, uiUx: 0 },
      failureReasons,
      suggestedFixes
    };
  }

  passedChecks.push('Project integrity verification passed');

  // Helper to find file by path suffix or substring
  const findFile = (substring: string): ProjectFile | undefined => {
    return projectFiles.find((f) => f.path.toLowerCase().includes(substring.toLowerCase()));
  };

  // Helper to check content against regex
  const checkContent = (file: ProjectFile | undefined, regex: RegExp): boolean => {
    if (!file || !file.content) return false;
    return regex.test(file.content);
  };

  // 2. Authentication Check (10 pts)
  const loginFile = findFile('login');
  const registerFile = findFile('register');
  const authController = findFile('authcontroller');
  const authModel = findFile('models/user');

  const hasAuthRoutes = projectFiles.some((f) => f.path.includes('routes') && f.content.includes('login'));
  const hasAuthMiddleware = findFile('middleware/auth');

  if (loginFile || authController || hasAuthRoutes) {
    passedChecks.push('Authentication routes/files exist');

    // Check for real database validation and password hashing
    const usesBcrypt = projectFiles.some((f) => f.content.includes('bcrypt'));
    const usesJwt = projectFiles.some((f) => f.content.includes('jwt') || f.content.includes('jsonwebtoken'));
    const queriesUserDb = projectFiles.some((f) => f.content.includes('User.findOne') || f.content.includes('User.create'));

    if (usesBcrypt && usesJwt && queriesUserDb) {
      authScore = 10;
      passedChecks.push('Robust database-backed user authentication verified');
    } else {
      // Mock detection
      authScore = 2;
      failedChecks.push('Mocked authentication detected');
      failureReasons.push('Authentication endpoints use local mock checks or hardcoded return statements instead of connecting to MongoDB and validating credentials.');
      suggestedFixes.push('Integrate User model (mongoose) inside authController, hash passwords with bcrypt, and sign JWT tokens upon successful authentication.');
    }
  } else {
    failedChecks.push('User Authentication files/logic missing');
    failureReasons.push('No login component, authentication controller or login routes were found in the project files.');
    suggestedFixes.push('Create backend routes/controllers for /login and /register, and a Login page on the frontend.');
  }

  // 3. Attendance System Check (15 pts)
  const attendanceRoute = findFile('routes/attendance');
  const attendanceController = findFile('controllers/attendance');
  const attendanceModel = findFile('models/attendance');
  const attendanceUI = findFile('dashboard') || findFile('attendancetable');

  if (attendanceRoute || attendanceController || attendanceUI) {
    passedChecks.push('Attendance system structure exists');

    const usesMongooseAttendance = projectFiles.some((f) => f.content.includes('Attendance.find') || f.content.includes('Attendance.create') || f.content.includes('Attendance.save'));
    const usesMemoryArray = projectFiles.some((f) => f.content.includes('let attendance = []') || f.content.includes('const attendance = []'));

    if (usesMongooseAttendance) {
      attendanceScore = 15;
      passedChecks.push('Database-backed Attendance Tracking system verified');
    } else if (usesMemoryArray) {
      attendanceScore = 3;
      failedChecks.push('Mocked attendance data store detected');
      failureReasons.push('Attendance marking system stores records in an in-memory array that resets whenever the server restarts.');
      suggestedFixes.push('Define a Mongoose schema for Attendance and save/retrieve records from MongoDB.');
    } else {
      attendanceScore = 1;
      failedChecks.push('Attendance system lacks data flow implementation');
      failureReasons.push('Attendance frontend components or routes exist, but they have no functional code to mark or save records.');
      suggestedFixes.push('Connect the "Present/Absent" buttons to trigger a POST request to the backend attendance endpoint.');
    }
  } else {
    failedChecks.push('Attendance tracking feature missing');
    failureReasons.push('No components or endpoints exist to mark or display daily student attendance.');
    suggestedFixes.push('Build an Attendance model, a POST endpoint to record attendance, and a frontend dashboard to view attendance.');
  }

  // 4. Leave Request System Check (10 pts)
  const leaveRoute = findFile('routes/leave');
  const leaveController = findFile('controllers/leave');
  const leaveModel = findFile('models/leave');
  const leaveUI = findFile('leaverequest');

  if (leaveRoute || leaveController || leaveUI) {
    passedChecks.push('Leave request system structure exists');

    const usesMongooseLeave = projectFiles.some((f) => f.content.includes('Leave.create') || f.content.includes('Leave.find') || f.content.includes('Leave.findByIdAndUpdate'));
    const isMockLeave = projectFiles.some((f) => f.content.includes('let leaves = []') || f.content.includes('const leaves = []'));

    if (usesMongooseLeave) {
      // Check for approval workflow (updating status to Approved / Rejected)
      const hasApprovalLogic = projectFiles.some((f) => f.content.includes('Approved') && f.content.includes('Rejected'));
      if (hasApprovalLogic) {
        leaveScore = 10;
        passedChecks.push('Full DB-backed leave request and approval workflow verified');
      } else {
        leaveScore = 5;
        failedChecks.push('Leave approval workflow missing');
        failureReasons.push('Leave requests can be submitted, but there is no endpoint or logic for teachers to approve or reject them.');
        suggestedFixes.push('Create a PUT or PATCH endpoint `/api/leave/:id/approve` to update the status of leave requests in the database.');
      }
    } else if (isMockLeave) {
      leaveScore = 2;
      failedChecks.push('Mocked leave data store detected');
      failureReasons.push('Leave request system stores requests in an in-memory array without persistence.');
      suggestedFixes.push('Implement a Mongoose Leave model with fields studentId, reason, status (Pending, Approved, Rejected), and date range.');
    } else {
      leaveScore = 1;
      failedChecks.push('Leave system lacks workflow implementation');
      failureReasons.push('Leave Request files exist but contain no code logic for submission or status transitions.');
      suggestedFixes.push('Implement the submission form on the frontend and wire it to a POST endpoint `/api/leave`.');
    }
  } else {
    failedChecks.push('Leave request system missing');
    failureReasons.push('No leave request form, leaves model, or leave routes are present.');
    suggestedFixes.push('Add a leave submission form for students, an approval table for teachers, and backend handlers to update statuses.');
  }

  // 5. Monthly Attendance Reports Check (10 pts)
  const reportRoute = findFile('routes/report') || findFile('monthlyreport') || findFile('reportcontroller');
  const reportsUI = findFile('monthlyreport');

  if (reportRoute || reportsUI) {
    passedChecks.push('Monthly reports structure exists');

    // Check if reports compile calculations from database
    const performsAggregation = projectFiles.some((f) => f.content.includes('aggregate') || f.content.includes('filter') || f.content.includes('reduce') || f.content.includes('map'));
    const isHardcodedReport = projectFiles.some((f) => f.content.includes('Attendance: 80%') || f.content.includes('Present Days: 20'));

    if (performsAggregation && !isHardcodedReport) {
      reportsScore = 10;
      passedChecks.push('Dynamic monthly report generation verified');
    } else if (isHardcodedReport) {
      reportsScore = 2;
      failedChecks.push('Hardcoded fake reports detected');
      failureReasons.push('Monthly report screen displays static hardcoded metrics (e.g., 80% attendance) instead of querying the backend to compute stats dynamically.');
      suggestedFixes.push('Implement a backend endpoint `/api/reports/monthly` that aggregates daily attendance records by student and month, and render the results dynamically.');
    } else {
      reportsScore = 1;
      failedChecks.push('Reports logic missing or incomplete');
      failureReasons.push('Reports screen exists but does not perform any data processing or display calculations.');
      suggestedFixes.push('Query daily attendance, calculate percentage = (presentDays / totalDays) * 100, and show the calculated metrics.');
    }
  } else {
    failedChecks.push('Monthly report feature missing');
    failureReasons.push('No report generator or reports page is present.');
    suggestedFixes.push('Create a reports component displaying monthly attendance rates and summaries for students.');
  }

  // 6. Code Quality (10 pts)
  let codeQualityDeductions = 0;

  // Syntax error checks - check for unclosed brackets or obvious javascript parse issues
  const containsEmptyFiles = projectFiles.some((f) => f.content.trim() === '' && !f.path.includes('.gitkeep'));
  if (containsEmptyFiles) {
    codeQualityDeductions += 4;
    criticalErrors.push('Empty files detected in submission');
    failureReasons.push('The submission includes empty source files which will cause build or execution failures.');
    suggestedFixes.push('Remove unused files or complete their implementation.');
  }

  // Check imports
  const hasBrokenReactImports = projectFiles.some((f) => f.path.endsWith('.jsx') && f.content.includes('import') && f.content.includes('from') && !f.content.includes('react') && f.content.includes('Dashboard'));
  // Note: we can do a basic check on imports vs files
  const importsMap: Record<string, string[]> = {};
  projectFiles.forEach((f) => {
    if (f.path.endsWith('.jsx') || f.path.endsWith('.js')) {
      const lines = f.content.split('\n');
      lines.forEach((l) => {
        const match = l.match(/import.*from\s+['"]([^'"]+)['"]/);
        if (match) {
          const importPath = match[1];
          if (importPath.startsWith('.') || importPath.startsWith('@/')) {
            // relative or absolute alias
            importsMap[f.path] = importsMap[f.path] || [];
            importsMap[f.path].push(importPath);
          }
        }
      });
    }
  });

  let brokenImportsCount = 0;
  for (const filePath in importsMap) {
    const imports = importsMap[filePath];
    imports.forEach((imp) => {
      // Very basic validation of import resolving
      const isOk =
        projectFiles.some((pf) => {
          const baseName = pf.path.split('/').pop()!.split('.')[0];
          const impBase = imp.split('/').pop()!.split('.')[0];
          return baseName.toLowerCase() === impBase.toLowerCase();
        }) ||
        imp.includes('react') ||
        imp.includes('framer') ||
        imp.includes('axios') ||
        imp.includes('express') ||
        imp.includes('mongoose') ||
        imp.includes('bcrypt') ||
        imp.includes('jsonwebtoken');

      if (!isOk) brokenImportsCount++;
    });
  }

  if (brokenImportsCount > 0) {
    codeQualityDeductions += 4;
    criticalErrors.push('Broken imports or missing component references');
    failureReasons.push(`${brokenImportsCount} relative import(s) failed to resolve to any file in the submitted workspace.`);
    suggestedFixes.push('Double check all import statements and folder structures to make sure file paths match casing and location.');
  }

  codeQualityScore = Math.max(0, 10 - codeQualityDeductions);
  if (codeQualityScore === 10) {
    passedChecks.push('No compilation-blocking syntax or import errors found');
  }

  // 7. UI/UX (5 pts)
  const cssFile = findFile('styles.css') || findFile('index.css');
  const usesStyles = cssFile && cssFile.content.length > 50;

  if (usesStyles && projectFiles.length > 10) {
    uiUxScore = 5;
    passedChecks.push('React component hierarchy and visual styles verified');
  } else {
    uiUxScore = 1;
    failedChecks.push('Basic or missing style layout');
    failureReasons.push('The styling is minimal or absent, leaving the visual interface layout unstyled.');
    suggestedFixes.push('Implement CSS rules or integrate Tailwind CSS to provide a clean and polished responsive user interface.');
  }

  // Total Score Calculation
  const totalScore = authScore + attendanceScore + leaveScore + reportsScore + codeQualityScore + uiUxScore;
  const status = totalScore >= 20 ? 'QUALIFIED' : 'DISQUALIFIED';
  const unlockRound3 = totalScore >= 20;

  // Build evaluation report
  const summary = `Automatic Audit Summary: Received ${totalScore}/60 points. ${status === 'QUALIFIED' ? 'Passed threshold' : 'Disqualified due to score below threshold of 20 points.'}`;

  return {
    score: totalScore,
    status,
    unlockRound3,
    passedChecks,
    failedChecks,
    criticalErrors,
    summary,
    breakdown: {
      auth: authScore,
      attendance: attendanceScore,
      leave: leaveScore,
      reports: reportsScore,
      codeQuality: codeQualityScore,
      uiUx: uiUxScore
    },
    failureReasons,
    suggestedFixes
  };
};

export { evaluateSubmission };
