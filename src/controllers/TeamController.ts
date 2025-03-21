import type {Request, Response} from 'express'
import User from '../models/User'
import Project from '../models/Project'

export class TeamController {
    
    // Finds a Colaborator by E-mail
    static findMemberByEmail = async (req: Request, res: Response) => {
        const { email } = req.body
        
        // Find user
        const user = await User.findOne({email}).select('id email name')

        if(!user) {
            const error = new Error('User not found')
            res.status(404).json({error: error.message})
            return
        }

        res.json(user)
    }

    // Adds a Colaborator to the project
    static addMemberById = async (req: Request, res: Response) => {
        const { id } = req.body

        // Find user
        const user = await User.findById(id).select('id')

        // Validate user exists
        if(!user) {
            const error = new Error('User not found')
            res.status(404).json({error: error.message})
            return
        }

        // Validate user is added already
        if(req.project.team.some(team => team.toString() === user.id.toString())) {
            const error = new Error('User is already in the project')
            res.status(409).json({error: error.message})
            return
        }

        // Validate can't add manager
        if(req.project.manager.toString() === user.id.toString()) {
            const error = new Error('Cannot add the manager to his own project')
            res.status(409).json({error: error.message})
            return
        }

        req.project.team.push(user.id)
        await req.project.save()

        res.send('User successfully added')
    }

     // Shows all members of the project
     static getProjectTeam = async (req: Request, res: Response) => {
        const project = await Project.findById(req.project.id).populate({
            path: 'team',
            select: 'id email name'
        })

        res.json(project.team)
     }

    // Removes a Colaborator from the project
    static removeMemberById = async (req: Request, res: Response) => {
        const { userId } = req.params

         // Validate user does not exist in the project
         if(!req.project.team.some(team => team.toString() === userId)) {
            const error = new Error('User does not exist in the project')
            res.status(409).json({error: error.message})
            return
        }

        req.project.team = req.project.team.filter(teamMember => teamMember.toString() !==  userId)
        await req.project.save()

        res.send('User successfully deleted')
    }
}