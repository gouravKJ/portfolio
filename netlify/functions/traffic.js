import trafficHandler from '../../api/traffic.js'
import { runHandler } from './_adapter.js'

export default async (request, context) => runHandler(trafficHandler, request, context)
