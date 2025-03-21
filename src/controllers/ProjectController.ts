import type {Request, Response} from 'express'
import Project from '../models/Project'

export class ProjectController {
    
    // Creates a new Project
    static createProject = async (req: Request, res: Response) => {
        const project = new Project(req.body)

        // Asign to manager rol
        project.manager = req.user.id
        
        try {
            await project.save()
            res.send('Project created successfully')
        } catch (error) {
            console.log(error)
        }
    }

    // Gets all the projects
    static getAllProjects = async (req: Request, res: Response) => {
        try {
            const projects = await Project.find({
                $or: [
                    {manager: {$in: req.user.id}},
                    {team: {$in: req.user.id}}
                ]
            })
            res.json(projects)
        } catch (error) {
            
        }
    }

    // Gets a project by ID
    static getProjectById = async (req: Request, res: Response) => {
        const { id } = req.params

        try {
            // Gets a Project by id and all its tasks information with "Populate function"
            const project = await Project.findById(id).populate('tasks')

            // Validate that project id exists
            if(!project) {
                const error = new Error('Project not found')
                res.status(404).json({error: error.message})
                return
            }

            // Avoid user getting projects different he belongs to
            if(project.manager.toString() !== req.user.id.toString() && !project.team.includes(req.user.id)) {
                const error = new Error('Invalid Action')
                res.status(404).json({error: error.message})
                return
            }

            res.json(project)
        } catch (error) {
            console.log(error)
        }
    }

    // Updates a Project
    static updateProject = async (req: Request, res: Response) => {

        try {
            // gets the parameters from de inputs
            req.project.projectName = req.body.projectName
            req.project.clientName = req.body.clientName
            req.project.description = req.body.description
            // Saves updated project
            await req.project.save()
            res.send('Project updated successfully')
        } catch (error) {
            console.log(error)
        }
    }

    // Deletes a Project
    static deleteProject = async (req: Request, res: Response) => {
        
        try {
            // Deletes a Project
            await req.project.deleteOne()
            res.send('Project deleted successfully')
        } catch (error) {
            console.log(error)
        }
    }
}