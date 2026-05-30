import type { StringId } from '../i18n/dictionary'
import type { WorkshopBotId } from '../data/workshopBots'

export const WORKSHOP_BOT_SPECIAL_TITLE: Record<WorkshopBotId, StringId> = {
  flame: 'ws_bot_special_burningGround',
  thunder: 'ws_bot_special_titanShock',
  golden: 'ws_bot_special_bonusCells',
  amplify: 'ws_bot_special_echoingShot',
  botBot: 'ws_bot_special_maximumPower',
}
