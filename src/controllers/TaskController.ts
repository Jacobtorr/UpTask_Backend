import type { Request, Response } from "express";
import Task from "../models/Task";

export class TaskController {

    // Creates a new Task for a Project
    static createTask = async (req: Request, res: Response) => {

        try {
            const task = new Task(req.body)

            // Project and Task Relationship
            task.project = req.project.id
            req.project.tasks.push(task.id)

            // Creates a New Task for the Selected Project
            await Promise.allSettled([task.save(), req.project.save()])
            res.send('Task created successfully')
        } catch (error) {
            res.status(500).json({error: 'Error'})
        }
    }

    // Gets all Task of a Project
    static getProjectTasks = async (req: Request, res: Response) => {
        
        try {
            // Get all tasks for a project and all the information with the "populate function"
            const tasks = await Task.find({project: req.project.id}).populate('project')
            res.json(tasks)
        } catch (error) {
            res.status(500).json({error: 'Error'})
        }
    }

     // Gets a task by ID
     static getTaskById = async (req: Request, res: Response) => {
        
        try {
            const task = await Task.findById(req.task.id)
                                    .populate({path:'completedBy.user', select: 'id name email'})
                                    .populate({path: 'notes', populate: {path: 'createdBy', select: 'id name email'}})

            // Validate that the task belongs to that project
            if(req.task.project.toString() !== req.project.id) {
                const error = new Error('Invalid Action')
                res.status(400).json({error: error.message})
                return
            }

            res.json(task)
        } catch (error) {
            res.status(500).json({error: 'Error'})
        }
    }

    // Updates a Task from a Project
    static updateTask = async (req: Request, res: Response) => {
        
        try {
            // Validate that the task belongs to that project
            if(req.task.project.toString() !== req.project.id) {
                const error = new Error('Invalid Action')
                res.status(400).json({error: error.message})
                return
            }

             // Read Form Inputs and Saves updated task
             req.task.name = req.body.name
             req.task.description = req.body.description

             await req.task.save()
             res.send('Task updated successfully')
        } catch (error) {
            res.status(500).json({error: 'Error'})
        }
    }

    // Deletes a Task from a Project
    static deleteTask = async (req: Request, res: Response) => {
        
        try {
            // Validate that the task belongs to that project
            if(req.task.project.toString() !== req.project.id) {
                const error = new Error('Accion no válida')
                res.status(400).json({error: error.message})
                return
            }

             // Saves updated task
             req.project.tasks = req.project.tasks.filter(task => task.toString() !== req.task.id.toString())
             await Promise.allSettled([req.task.deleteOne(), req.project.save()]);
             res.send('Task deleted successfully')
        } catch (error) {
            res.status(500).json({error: 'Error'})
        }
    }

    static updateStatus = async (req: Request, res: Response) => {

        try {
            // Read the new Input status and saves updated task
            const { status } = req.body
            req.task.status = status
            
            const data = {
                user: req.user.id,
                status
            }

            req.task.completedBy.push(data)
            await req.task.save()
            res.send('Task status updated successfully')
        } catch (error) {
            res.status(500).json({error: 'Error'})
        }
    }


}