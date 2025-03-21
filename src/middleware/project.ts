import type { Request, Response, NextFunction } from "express";
import Project, { IProject } from "../models/Project";

// Modificando el Request de Express
declare global {
    namespace Express {
        interface Request {
            project: IProject
        }
    }
}

export async function projectExists (req: Request, res: Response, next: NextFunction) {
    try {
        // Obtains the project ID
        const { projectId } = req.params;
        const project = await Project.findById(projectId)
        
        // Validate that project id exists
        if(!project) {
            const error = new Error('Project Not Found')
            res.status(404).json({error: error.message})
            return
        }
        req.project = project
        next()
    } catch (error) {
        res.status(500).json({error: 'Error'})
    }
}