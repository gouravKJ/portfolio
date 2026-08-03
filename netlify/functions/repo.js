import repoHandler from '../../api/repo.js'
import { runHandler } from './_adapter.js'

export default async (request, context) => runHandler(repoHandler, request, context)
