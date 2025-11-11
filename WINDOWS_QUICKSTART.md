# Windows Quick Start Guide

## Simple 3-Step Setup

### Step 1: Install Node.js
Download and install from: https://nodejs.org/ (v18 or higher)

### Step 2: Install Dependencies
Open Command Prompt or PowerShell in the project folder:
```bash
npm install
```

### Step 3: Start the Application

**Using Command Prompt:**
```bash
start-windows.bat
```

**Using PowerShell:**
```powershell
.\start-windows.ps1
```

### Step 4: Open Your Browser
Go to: http://localhost:5000

### Login Credentials
- Username: **amex**
- Password: **zensar**

---

## Troubleshooting

### Error: "cannot be loaded because running scripts is disabled"
If you see this error in PowerShell, run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Error: "PORT 5000 already in use"
Another application is using port 5000. Close it or change the port in `server/index.ts`

### Application not starting
Make sure you installed Node.js and ran `npm install` first.

---

That's it! Enjoy using Code Lens v2 🚀
