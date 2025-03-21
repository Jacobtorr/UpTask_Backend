import { Request, Response } from "express";
import Note, { INote } from "../models/Note";
import { Types } from "mongoose";

type NoteParams = {
      noteId: Types.ObjectId
}

export class NoteController {

      // Creates a new Note
      static createNote = async (req: Request<{}, {}, INote>, res: Response) => {

        // req.body returns what we get from a form
       const { content } = req.body
       
       // Add new Note
       const note = new Note()
       note.content = content
       note.createdBy = req.user.id
       note.task = req.task.id

       // Add note id to Task
       req.task.notes.push(note.id)

       try {
        // Saves the Task and the Note changes
        await Promise.allSettled([req.task.save(), note.save()])
        res.send('Note successfully created')
       } catch (error) {
        res.status(500).json({error: 'Error'})
       }
      }

       // Gets all notes
       static getTaskNotes = async (req: Request, res: Response) => {
            try {
                  const notes = await Note.find({task: req.task.id})
                  res.json(notes)
            } catch (error) {
                  res.status(500).json({error: 'Error'}) 
            }
       }

        // Gets all notes
        static deleteNote = async (req: Request<NoteParams>, res: Response) => {
           const { noteId } = req.params
           const note = await Note.findById(noteId)

           if(!note) {
            const error = new Error('Note not found')
            res.status(404).json({error: error.message})
            return
           }

           if(note.createdBy.toString() !== req.user.id.toString()) {
            const error = new Error('Invalid Action')
            res.status(404).json({error: error.message})
            return
           }

           // Deletes the reference of notes from Task table
           req.task.notes = req.task.notes.filter(note => note.toString() !== noteId.toString())

           // Deletes the note
           try {
            await Promise.allSettled([req.task.save(), note.deleteOne()])
            res.send('Note successfully deleted')
           } catch (error) {
             res.status(500).json({error: 'Error'}) 
           }
       }
}