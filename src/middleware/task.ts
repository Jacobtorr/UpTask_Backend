import type { Request, Response, NextFunction } from "express";
import Task, { ITask } from "../models/Task";

// Modificando el Request de Express
declare global {
    namespace Express {
        interface Request {
            task: ITask
        }
    }
}

export async function taskExists(req: Request, res: Response, next: NextFunction) {
    try {
        // Obtains the project ID
        const { taskId } = req.params;
        const task = await Task.findById(taskId)
        
        // Validate that project id exists
        if(!task) {
            const error = new Error('Task Not Found')
            res.status(404).json({error: error.message})
            return
        }
        req.task = task
        next()
    } catch (error) {
        res.status(500).json({error: 'Error'})
    }
}

export function taskBelongsToProject(req: Request, res: Response, next: NextFunction) {

    // Validate that the task belongs to that project
    if(req.task.project.toString() !== req.project.id.toString()) {
        const error = new Error('Invalid Action')
        res.status(400).json({error: error.message})
        return
    }
    next()
}

export function hasAuthorization(req: Request, res: Response, next: NextFunction) {

    // Validate that the task belongs to that project
    if(req.user.id.toString() !== req.project.manager.toString()) {
        const error = new Error('Invalid Action')
        res.status(400).json({error: error.message})
        return
    }
    next()
}