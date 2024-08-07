import { handleTelegramUpdate, processGetGroupIdCommand, processGetUserIdCommand, processPingCommand } from './core'
import { processLLM } from './llm'
import { processSyncXLogCommand } from './xlog'
import twitter from './twitter'
import { processChannel } from './channel'

import { Env as LLMEnv } from './llm'
import { Env as XLogEnv } from './xlog'
import { Env as TwitterEnv } from './twitter'
import { Env as RandomEnv } from './random'
import { Update } from 'grammy/types'
import { processRandom } from './random'

export type Env = LLMEnv & XLogEnv & TwitterEnv & RandomEnv

async function handler(update: Update, env: Env): Promise<string | undefined> {
    const content = update.message?.text || update.message?.caption || ''

    if (content.startsWith('/getchatid')) {
        return await processGetGroupIdCommand(update, env)

    } else if (content.startsWith('/getuserid')) {
        return await processGetUserIdCommand(update, env)

    } else if (content.startsWith('/ping')) {
        return await processPingCommand(update, env)

    } else if (content.startsWith('/sync_twitter')) {
        return await twitter.processSyncTwitterCommand(update, env)

    } else if (content.startsWith('/search')) {
        return await processChannel(update, env)

    } else if (content.startsWith('/sync_xlog')) {
        return await processSyncXLogCommand(update, env)

    } else if (update.message?.reply_to_message?.text?.includes('#random_todolist')) {
        return await processRandom(update, env)
        
    } else {
        return await processLLM(update, env)
    }
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        if (request.method === 'POST') {
            try {
                const update = await request.json() as Update
                await handleTelegramUpdate(update, env, async () => {
                    return await handler(update, env)
                })
            } catch (e) {
                console.log(e)
            }
            return new Response('Update processed')
        }
        return new Response('Expecting POST request')
    },
}
