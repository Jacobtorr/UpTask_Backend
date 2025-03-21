import { Request, Response } from "express";
import { generateToken } from "../utils/token";
import { checkPassword, hashPassword } from "../utils/auth";
import { AuthEmail } from "../emails/AuthEmail";
import User from "../models/User";
import Token from "../models/Token";
import { generateJWT } from "../utils/jwt";

export class AuthController {

      // Creates a new Account
      static createAccount = async (req: Request, res: Response) => {
        try {
            const { password, email } = req.body

            // Prevent Duplicate registries
            const userExists = await User.findOne({email})
            if(userExists) {
                const error = new Error('User email is already registered')
                 res.status(409).json({error: error.message})
                 return
            }

            // Creates an Account
            const user = new User(req.body)

            // Hash Password
            user.password = await hashPassword(password)

            // Generate Auth Token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            // Send Auth Email
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })

            // Save Account
            await Promise.allSettled([user.save(), token.save()])

            res.send('Account created successfully, check your email to confirm')
        } catch (error) {
            res.status(500).json({error: 'There was an error'})
        }
    }

    // Confirm Account
    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const { token } = req.body
            const tokenExists = await Token.findOne({token})
            if(!tokenExists) {
                const error = new Error('Invalid Token')
                res.status(404).json({error: error.message})
                return
            }

            // Search user and confirm account
            const user = await User.findById(tokenExists.user)
            user.confirmed = true

            // Save confirmed user
            await Promise.allSettled([user.save(), tokenExists.deleteOne()])
            res.send('Account confirmed successfully')
        } catch (error) {
            res.status(500).json({error: 'There was an error'})
        }
    }

    static login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body
            const user = await User.findOne({email})

            // Check if user exists
            if(!user) {
                const error = new Error('User not found')
                res.status(404).json({error: error.message})
                return
            }

            // Check if user is confirmed
            if(!user.confirmed) {
                // Generate Auth Token
                const token = new Token()
                token.user = user.id
                token.token = generateToken()
                await token.save()

                // Send Auth Email
                AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    name: user.name,
                    token: token.token
                })

                const error = new Error('Account is not confirmed, we have sent you a confirmation e-mail')
                res.status(401).json({error: error.message})
                return
            }

            // Check if password match
           const isPasswordCorrect = await checkPassword(password, user.password)

           if(!isPasswordCorrect) {
                const error = new Error('Invalid Password')
                res.status(404).json({error: error.message})
                return
           }

           const token = generateJWT({id: user._id})
           res.send(token)

        } catch (error) {
            res.status(500).json({error: 'There was an error'})
        }
    }

     // Creates a new Confirmation Code
     static requestConfirmationCode = async (req: Request, res: Response) => {
        try {
            const { email } = req.body

            // User Exists
            const user = await User.findOne({email})
            if(!user) {
                const error = new Error('User is not registered')
                 res.status(404).json({error: error.message})
                 return
            }

            // User confirmed
            if(user.confirmed) {
                const error = new Error('User is already confirmed')
                res.status(403).json({error: error.message})
                return
            }

            // Generate Auth Token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            // Send Auth Email
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })

            // Save Account
            await Promise.allSettled([user.save(), token.save()])

            res.send('A new confirmation token was sended to your e-mail')
        } catch (error) {
            res.status(500).json({error: 'There was an error'})
        }
    }

    // Creates a new Confirmation Code
    static forgotPassword = async (req: Request, res: Response) => {
        try {
            const { email } = req.body

            // User Exists
            const user = await User.findOne({email})
            if(!user) {
                const error = new Error('User is not registered')
                 res.status(404).json({error: error.message})
                 return
            }

            // Generate Auth Token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id
            await token.save()

            // Send Auth Email
            AuthEmail.senPasswordResetToken({
                email: user.email,
                name: user.name,
                token: token.token
            })

            res.send('Check your e-mail and follow the instructions to reset your password')
        } catch (error) {
            res.status(500).json({error: 'There was an error'})
        }
    }

       // Validate Token
       static validateToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.body
            const tokenExists = await Token.findOne({token})
            if(!tokenExists) {
                const error = new Error('Invalid Token')
                res.status(404).json({error: error.message})
                return
            }

            res.send('Valid Token, change your password')
        } catch (error) {
            res.status(500).json({error: 'There was an error'})
        }
    }

       // Update Password with Token
       static updatePasswordWithToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.params
            const { password } = req.body
            const tokenExists = await Token.findOne({token})
            if(!tokenExists) {
                const error = new Error('Invalid Token')
                res.status(404).json({error: error.message})
                return
            }

            // Change Password
            const user = await User.findById(tokenExists.user)
            user.password = await hashPassword(password)

            await Promise.allSettled([user.save(), tokenExists.deleteOne()])

            res.send('Password successfully changed')
        } catch (error) {
            res.status(500).json({error: 'There was an error'})
        }
    }

     // Return non logged in users to login page
     static user = async (req: Request, res: Response) => {
        res.json(req.user)
        return
    }

     // User name and email change
     static updateProfile = async (req: Request, res: Response) => {
        const { name, email } = req.body

        const userExists = await User.findOne({email})

        if(userExists && userExists.id.toString() !== req.user.id.toString()) {
            const error = new Error('Email is already registered')
            res.status(409).json({error: error.message})
            return
        }

        req.user.name = name
        req.user.email = email

        try {
            await req.user.save()
            res.send('Profile update successfully')
        } catch (error) {
            res.status(500).send('Error')
        }
    }

    // Change password
    static updateCurrentUserPassword = async (req: Request, res: Response) => {
        const { current_password, password } = req.body

        const user = await User.findById(req.user.id)

        const isPasswordCorrect = await checkPassword(current_password, user.password)
        if(!isPasswordCorrect) {
            const error = new Error('Current Password is incorrect')
                res.status(401).json({error: error.message})
                return
        }

        try {
            user.password = await hashPassword(password)
            await user.save()
            res.send('Password successfully changed')
        } catch (error) {
            res.status(500).send('Error')
        }
    }

    static checkPassword = async (req: Request, res: Response) => {
        const { password } = req.body

        const user = await User.findById(req.user.id)

        const isPasswordCorrect = await checkPassword(password, user.password)
        if(!isPasswordCorrect) {
            const error = new Error('Current Password is incorrect')
                res.status(401).json({error: error.message})
                return
        }

        res.send('Password Correcto')

    }
    
}