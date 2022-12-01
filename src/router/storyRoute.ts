import { Router } from 'express'
import {StoryController} from "../controller/StoryController";
import {verifyUser} from "../middleware/auth/AuthMiddleware";


const storyRouter = Router()

storyRouter.get('/all', verifyUser, StoryController.getAllStories)

storyRouter.get('/:userId', verifyUser, StoryController.getUserStories)

storyRouter.get('/get/:storyId', verifyUser, StoryController.getOneStory)

storyRouter.post('/create', verifyUser, StoryController.createStory)

storyRouter.post('/update', verifyUser, StoryController.updateStory)

storyRouter.post('/like/:storyId', verifyUser, StoryController.likeStory)

storyRouter.post('/dislike/:storyId', verifyUser, StoryController.dislikeStory)

storyRouter.post('/comment/:storyId', verifyUser, StoryController.commentStory)

storyRouter.get('/comment/:storyId', verifyUser, StoryController.getCommentsOfStory)

storyRouter.post('/deleteComment', verifyUser, StoryController.deleteCommentStory)

export default storyRouter