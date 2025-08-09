import { randomUUID } from "crypto";

export class MemStorage {
  constructor() {
    this.users = new Map();
    this.projects = new Map();
  }

  async getUser(id) {
    return this.users.get(id);
  }

  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser) {
    const id = randomUUID();
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getProject(id) {
    return this.projects.get(id);
  }

  async createProject(insertProject) {
    const id = randomUUID();
    const project = {
      ...insertProject,
      id,
      uploadedAt: new Date(),
      status: insertProject.status || 'processing',
      analysisData: insertProject.analysisData || null,
      fileCount: insertProject.fileCount || 0,
      controllerCount: insertProject.controllerCount || 0,
      serviceCount: insertProject.serviceCount || 0,
      repositoryCount: insertProject.repositoryCount || 0,
      entityCount: insertProject.entityCount || 0,
      originalFileName: insertProject.originalFileName || null,
      githubUrl: insertProject.githubUrl || null,
      githubRepo: insertProject.githubRepo || null,
      githubBranch: insertProject.githubBranch || null,
      sourceType: insertProject.sourceType || 'upload',
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id, updates) {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject = { ...project, ...updates };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async listProjects() {
    return Array.from(this.projects.values()).sort(
      (a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime()
    );
  }
}

export const storage = new MemStorage();