// Dependencies
import { Router } from "express";
import { body, param } from "express-validator";
// Controllers
import { ProjectController } from "../controllers/ProjectController";
import { TaskController } from "../controllers/TaskController";
import { TeamController } from "../controllers/TeamController";
// Middlewares
import { handleInputErrors } from "../middleware/validation";
import { projectExists } from "../middleware/project";
import { hasAuthorization, taskBelongsToProject, taskExists } from "../middleware/task";
import { authenticate } from "../middleware/auth";
import { NoteController } from "../controllers/NoteController";

const router = Router()

router.use(authenticate)

// Create Project Route
router.post('/', 
    body('projectName')
        .notEmpty().withMessage('Project Name is Required'),
    body('clientName')
        .notEmpty().withMessage('Client Name is Required'),
    body('description')
        .notEmpty().withMessage('Project Description is Required'),
    handleInputErrors,    
    ProjectController.createProject
)

// Get all Projects Route
router.get('/', ProjectController.getAllProjects)

// Get Project by ID Route
router.get('/:id', 
    param('id').isMongoId().withMessage('Invalid ID'),
    handleInputErrors,
    ProjectController.getProjectById)

// Middleware to validate that project exists
router.param('projectId', projectExists)


// Updates a Project Route
router.put('/:projectId', 
    param('projectId').isMongoId().withMessage('Invalid ID'),
    body('projectName')
        .notEmpty().withMessage('Project Name is Required'),
    body('clientName')
        .notEmpty().withMessage('Client Name is Required'),
    body('description')
        .notEmpty().withMessage('Project Description is Required'),
    handleInputErrors,  
    hasAuthorization,
    ProjectController.updateProject)

// Deletes a Project Route
router.delete('/:projectId', 
    param('projectId').isMongoId().withMessage('Invalid ID'),
    handleInputErrors,
    hasAuthorization,
    ProjectController.deleteProject)

// -------------------- ROUTES FOR TASKS ---------------------- //

// Creates a Task Route
router.post('/:projectId/tasks', 
    hasAuthorization,
    param('projectId').isMongoId().withMessage('Invalid ID'),
    body('name')
        .notEmpty().withMessage('Task Name is Required'),
    body('description')
        .notEmpty().withMessage('Task Description is Required'),
    handleInputErrors,
    TaskController.createTask
)

// Gets all Tasks Route
router.get('/:projectId/tasks', 
    param('projectId').isMongoId().withMessage('Invalid ID'),
    handleInputErrors,
    TaskController.getProjectTasks
)

// Middlewares to validate that tasks exists and belongs to project
router.param('taskId', taskExists)
router.param('taskId', taskBelongsToProject)

// Gets a task by ID route
router.get('/:projectId/tasks/:taskId', 
    param('taskId').isMongoId().withMessage('Invalid ID'),
    handleInputErrors,
    TaskController.getTaskById
)

// Updates a Task Route
router.put('/:projectId/tasks/:taskId', 
    hasAuthorization,
    param('taskId').isMongoId().withMessage('Invalid ID'),
    body('name')
        .notEmpty().withMessage('Task Name is Required'),
    body('description')
        .notEmpty().withMessage('Task Description is Required'),
    handleInputErrors,
    TaskController.updateTask
)

// Deletes a Task Route
router.delete('/:projectId/tasks/:taskId', 
    hasAuthorization,
    param('taskId').isMongoId().withMessage('Invalid ID'),
    handleInputErrors,
    TaskController.deleteTask
)

// Changes the Status of a Task
router.post('/:projectId/tasks/:taskId/status',
    param('taskId').isMongoId().withMessage('Invalid ID'),
    body('status')
        .notEmpty().withMessage('Status is required'),
    handleInputErrors,
    TaskController.updateStatus
)

// -------------------- ROUTES FOR TEAMS ---------------------- //
// 
router.post('/:projectId/team/find',
    body('email')
        .isEmail().toLowerCase().withMessage('Invalid E-mail'),
    handleInputErrors,
    TeamController.findMemberByEmail
)

router.post('/:projectId/team',
    body('id')
        .isMongoId().withMessage('Invalid ID'),
    handleInputErrors,
    TeamController.addMemberById
)

router.get('/:projectId/team',
    TeamController.getProjectTeam
)

router.delete('/:projectId/team/:userId',
    param('userId')
        .isMongoId().withMessage('Invalid ID'),
    handleInputErrors,
    TeamController.removeMemberById
)

// -------------------- ROUTES FOR NOTES ---------------------- //
//
router.post('/:projectId/tasks/:taskId/notes',
    body('content')
        .notEmpty().withMessage('Note content is required'),
        handleInputErrors,
        NoteController.createNote
)

//
router.get('/:projectId/tasks/:taskId/notes',
        handleInputErrors,
        NoteController.getTaskNotes
)

//
router.delete('/:projectId/tasks/:taskId/notes/:noteId',
    param('noteId').isMongoId().withMessage('Invalid ID'),
    handleInputErrors,
    NoteController.deleteNote
)


export default router