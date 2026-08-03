import githubHandler from '../../api/github.js'
import { runHandler } from './_adapter.js'

export default async (request, context) => runHandler(githubHandler, request, context)
