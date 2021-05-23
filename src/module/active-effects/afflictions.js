import { addEffect, downgradeEffect, overrideEffect } from './item-effects'

const _buildBaseAffliction = (label, icon, changes = [], flags = {}) => ({
  id: label, // TODO: Check corrections here?
  label: game.i18n.localize('DL.' + label),
  icon: icon,
  disabled: false,
  transfer: true,
  duration: {},
  flags: {
    sourceType: 'affliction',
    permanent: false,
    ...flags,
  },
  changes: changes,
})

export class DLAfflictions {
  /**
   * Checks if the actor can do the action he is trying to perform, with the relative attribute
   * @param actor                 The actor
   * @param actionType            The type of action: [action / challenge]
   * @param actionAttribute       The attribute name, lowercase
   * @returns {boolean}           True if the actor is blocked
   */
  static isActorBlocked(actor, actionType, actionAttribute) {
    actionAttribute = actionAttribute.toLowerCase()
    const isBlocked = actor.data.data.maluses.autoFail[actionType]?.[actionAttribute] > 0
    if (isBlocked) {
      const msg = actor.getEmbeddedCollection('ActiveEffect').find(effect => Boolean(effect.data.flags?.warningMessage))
        ?.data.flags.warningMessage
      ui.notifications.error(msg)
    }
    return isBlocked
  }

  static clearAfflictions(actor) {
    if (!actor) return
    const afflictions = actor
      .getEmbeddedCollection('ActiveEffect')
      .filter(e => e.data.flags?.sourceType === 'affliction')
      .map(e => e.data._id)
    actor.deleteEmbeddedDocuments('ActiveEffect', afflictions)
  }

  /**
   * Builds the Afflictions Active Effects for the token quick menu
   * @returns list of active effect data
   */
  static buildAll() {
    const effectsDataList = []

    // Asleep
    effectsDataList.push(_buildBaseAffliction('asleep', 'icons/svg/sleep.svg'))

    // Blinded
    effectsDataList.push(
      _buildBaseAffliction(
        'blinded',
        'icons/svg/blind.svg',
        [
          addEffect('data.bonuses.defense.boons.defense', -1),
          addEffect('data.bonuses.defense.boons.agility', -1),
          downgradeEffect('data.characteristics.speed', 2),
          // overrideEffect('data.maluses.autoFail.challenge.perception', 1)  fails only perc challenges based on SIGHT
        ],
        {
          warningMessage: game.i18n.localize('DL.DialogWarningBlindedChallengeFailer'),
        },
      ),
    )

    // Charmed
    effectsDataList.push(_buildBaseAffliction('charmed', 'systems/demonlord08/assets/icons/effects/charmed.svg'))

    // Compelled
    effectsDataList.push(_buildBaseAffliction('compelled', 'systems/demonlord08/assets/icons/effects/compelled.svg'))

    // Dazed
    effectsDataList.push(
      _buildBaseAffliction(
        'dazed',
        'icons/svg/daze.svg',
        [
          overrideEffect('data.maluses.autoFail.challenge.strength', 1),
          overrideEffect('data.maluses.autoFail.challenge.agility', 1),
          overrideEffect('data.maluses.autoFail.challenge.intellect', 1),
          overrideEffect('data.maluses.autoFail.challenge.will', 1),
          overrideEffect('data.maluses.autoFail.challenge.perception', 1),
          overrideEffect('data.maluses.autoFail.action.strength', 1),
          overrideEffect('data.maluses.autoFail.action.agility', 1),
          overrideEffect('data.maluses.autoFail.action.intellect', 1),
          overrideEffect('data.maluses.autoFail.action.will', 1),
          overrideEffect('data.maluses.autoFail.action.perception', 1),
        ],
        {
          warningMessage: game.i18n.localize('DL.DialogWarningDazedFailer'),
        },
      ),
    )

    // Deafened
    effectsDataList.push(
      _buildBaseAffliction('deafened', 'icons/svg/deaf.svg', [
        //overrideEffect('data.maluses.autoFail.challenge.perception', 1) fails only perc challenges based on HEARING
      ]),
    )

    // Defenseless
    effectsDataList.push(
      _buildBaseAffliction(
        'defenseless',
        'systems/demonlord08/assets/icons/effects/defenseless.svg',
        [
          overrideEffect('data.bonuses.armor.override', 5),
          overrideEffect('data.maluses.autoFail.challenge.strength', 1),
          overrideEffect('data.maluses.autoFail.challenge.agility', 1),
          overrideEffect('data.maluses.autoFail.challenge.intellect', 1),
          overrideEffect('data.maluses.autoFail.challenge.will', 1),
          //overrideEffect('data.maluses.autoFail.challenge.perception', 1),
          overrideEffect('data.maluses.autoFail.action.strength', 1),
          overrideEffect('data.maluses.autoFail.action.agility', 1),
          overrideEffect('data.maluses.autoFail.action.intellect', 1),
          overrideEffect('data.maluses.autoFail.action.will', 1),
          overrideEffect('data.maluses.autoFail.action.perception', 1),
        ],
        {
          warningMessage: game.i18n.localize('DL.DialogWarningDefenselessFailer'),
        },
      ),
    )

    const challengeBane = [
      addEffect('data.bonuses.challenge.boons.strength', -1),
      addEffect('data.bonuses.challenge.boons.agility', -1),
      addEffect('data.bonuses.challenge.boons.intellect', -1),
      addEffect('data.bonuses.challenge.boons.will', -1),
      addEffect('data.bonuses.challenge.boons.perception', -1),
    ]

    const attackBane = [
      addEffect('data.bonuses.attack.boons.strength', -1),
      addEffect('data.bonuses.attack.boons.agility', -1),
      addEffect('data.bonuses.attack.boons.intellect', -1),
      addEffect('data.bonuses.attack.boons.will', -1),
      addEffect('data.bonuses.attack.boons.perception', -1),
    ]

    // Defenseless
    effectsDataList.push(
      _buildBaseAffliction(
        'diseased',
        'systems/demonlord08/assets/icons/effects/diseased.svg',
        [].concat(challengeBane, attackBane),
      ),
    )

    // Fatigued
    effectsDataList.push(
      _buildBaseAffliction(
        'fatigued',
        'systems/demonlord08/assets/icons/effects/fatigued.svg',
        [].concat(challengeBane, attackBane),
      ),
    )

    // Frightened
    effectsDataList.push(
      _buildBaseAffliction(
        'frightened',
        'icons/svg/terror.svg',
        [overrideEffect('data.maluses.noFastTurn', 1)].concat(challengeBane, attackBane), //FIXME: can take fast turns?
      ),
    )

    // Grabbed
    effectsDataList.push(_buildBaseAffliction('grabbed', 'systems/demonlord08/assets/icons/effects/grabbed.svg'))

    // Horrified
    effectsDataList.push(
      _buildBaseAffliction('horrified', 'systems/demonlord08/assets/icons/effects/horrified.svg', [
        addEffect('data.bonuses.challenge.boons.strength', -3),
        addEffect('data.bonuses.challenge.boons.agility', -3),
        addEffect('data.bonuses.challenge.boons.intellect', -3),
        addEffect('data.bonuses.challenge.boons.will', -3),
        addEffect('data.bonuses.challenge.boons.perception', -3),
        addEffect('data.bonuses.attack.boons.strength', -3),
        addEffect('data.bonuses.attack.boons.agility', -3),
        addEffect('data.bonuses.attack.boons.intellect', -3),
        addEffect('data.bonuses.attack.boons.will', -3),
        addEffect('data.bonuses.attack.boons.perception', -3),
      ]),
    )

    // Immobilized
    effectsDataList.push(
      _buildBaseAffliction('immobilized', 'systems/demonlord08/assets/icons/effects/immobilized.svg', [
        downgradeEffect('data.characteristics.speed', -1),
        addEffect('data.bonuses.defense.boons.defense', -1),
        addEffect('data.bonuses.defense.boons.strength', -1),
        addEffect('data.bonuses.defense.boons.agility', -1),
        addEffect('data.bonuses.defense.boons.will', -1),
        addEffect('data.bonuses.defense.boons.intellect', -1),
        addEffect('data.bonuses.defense.boons.perception', -1),
      ]),
    )

    // Impaired
    effectsDataList.push(
      _buildBaseAffliction(
        'impaired',
        'systems/demonlord08/assets/icons/effects/impaired.svg',
        [].concat(challengeBane, attackBane),
      ),
    )

    // Poisoned
    effectsDataList.push(_buildBaseAffliction('poisoned', 'icons/svg/poison.svg', [].concat(challengeBane, attackBane)))

    // Prone
    effectsDataList.push(
      _buildBaseAffliction('prone', 'icons/svg/falling.svg', [
        addEffect('data.bonuses.attack.boons.strength', -1),
        addEffect('data.bonuses.attack.boons.agility', -1),
        addEffect('data.bonuses.challenge.boons.strength', -1),
        addEffect('data.bonuses.challenge.boons.agility', -1),
        addEffect('data.bonuses.defense.boons.defense', -1),
        // FIXME: depends if the attacker is nearby or not
        addEffect('data.bonuses.defense.boons.strength', -1),
        addEffect('data.bonuses.defense.boons.agility', -1),
        addEffect('data.bonuses.defense.boons.will', -1),
        addEffect('data.bonuses.defense.boons.intellect', -1),
        addEffect('data.bonuses.defense.boons.perception', -1),
      ]),
    )

    // Slowed
    effectsDataList.push(
      _buildBaseAffliction('slowed', 'systems/demonlord08/assets/icons/effects/slowed.svg', [
        overrideEffect('data.maluses.noFastTurn', 1),
        overrideEffect('data.maluses.halfSpeed', 1),
      ]),
    )

    // Stunned
    effectsDataList.push(
      _buildBaseAffliction(
        'stunned',
        'icons/svg/stoned.svg',
        [
          overrideEffect('data.maluses.autoFail.challenge.strength', 1),
          overrideEffect('data.maluses.autoFail.challenge.agility', 1),
          overrideEffect('data.maluses.autoFail.challenge.intellect', 1),
          overrideEffect('data.maluses.autoFail.challenge.will', 1),
          overrideEffect('data.maluses.autoFail.challenge.perception', 1),
          overrideEffect('data.maluses.autoFail.action.strength', 1),
          overrideEffect('data.maluses.autoFail.action.agility', 1),
          overrideEffect('data.maluses.autoFail.action.intellect', 1),
          overrideEffect('data.maluses.autoFail.action.will', 1),
          overrideEffect('data.maluses.autoFail.action.perception', 1),
          addEffect('data.bonuses.defense.boons.defense', -1),
          addEffect('data.bonuses.defense.boons.strength', -1),
          addEffect('data.bonuses.defense.boons.agility', -1),
          addEffect('data.bonuses.defense.boons.will', -1),
          addEffect('data.bonuses.defense.boons.intellect', -1),
          addEffect('data.bonuses.defense.boons.perception', -1),
        ],
        {
          warningMessage: game.i18n.localize('DL.DialogWarningStunnedFailer'),
        },
      ),
    )

    // Suprised
    effectsDataList.push(
      _buildBaseAffliction(
        'surprised',
        'systems/demonlord08/assets/icons/effects/surprised.svg',
        [
          overrideEffect('data.maluses.autoFail.challenge.strength', 1),
          overrideEffect('data.maluses.autoFail.challenge.agility', 1),
          overrideEffect('data.maluses.autoFail.challenge.intellect', 1),
          overrideEffect('data.maluses.autoFail.challenge.will', 1),
          overrideEffect('data.maluses.autoFail.challenge.perception', 1),
          overrideEffect('data.maluses.autoFail.action.strength', 1),
          overrideEffect('data.maluses.autoFail.action.agility', 1),
          overrideEffect('data.maluses.autoFail.action.intellect', 1),
          overrideEffect('data.maluses.autoFail.action.will', 1),
          overrideEffect('data.maluses.autoFail.action.perception', 1),
          downgradeEffect('data.characteristics.speed', -1),
        ],
        {
          warningMessage: game.i18n.localize('DL.DialogWarningSurprisedFailer'),
        },
      ),
    )

    // Unconscious
    effectsDataList.push(
      _buildBaseAffliction(
        'unconscious',
        'icons/svg/unconscious.svg',
        [
          overrideEffect('data.maluses.autoFail.challenge.strength', 1),
          overrideEffect('data.maluses.autoFail.challenge.agility', 1),
          overrideEffect('data.maluses.autoFail.challenge.intellect', 1),
          overrideEffect('data.maluses.autoFail.challenge.will', 1),
          overrideEffect('data.maluses.autoFail.challenge.perception', 1),
          overrideEffect('data.maluses.autoFail.action.strength', 1),
          overrideEffect('data.maluses.autoFail.action.agility', 1),
          overrideEffect('data.maluses.autoFail.action.intellect', 1),
          overrideEffect('data.maluses.autoFail.action.will', 1),
          overrideEffect('data.maluses.autoFail.action.perception', 1),
          downgradeEffect('data.characteristics.speed', -1),
          overrideEffect('data.bonuses.armor.override', 5),
        ],
        {
          warningMessage: game.i18n.localize('DL.DialogWarningUnconsciousFailer'),
        },
      ),
    )

    // ----------------------- ACTIONS -------------------------- //

    // Concentrate
    effectsDataList.push(
      _buildBaseAffliction('concentrate', 'systems/demonlord08/assets/icons/effects/concentrate.svg'),
    )

    // Defend
    effectsDataList.push(
      _buildBaseAffliction('defend', 'systems/demonlord08/assets/icons/effects/defend.svg', [
        addEffect('data.bonuses.defense.boons.defense', 1),
        addEffect('data.bonuses.defense.boons.strength', 1),
        addEffect('data.bonuses.defense.boons.agility', 1),
        addEffect('data.bonuses.defense.boons.will', 1),
        addEffect('data.bonuses.defense.boons.intellect', 1),
        addEffect('data.bonuses.defense.boons.perception', 1),
        // TODO: Auto disable when Dazed, Stunned or Unconscious
      ]),
    )

    // Help
    effectsDataList.push(
      _buildBaseAffliction(
        'help',
        'systems/demonlord08/assets/icons/effects/help.svg',
        [], // TODO: Add boons? Aka help should be applied to the receiver
      ),
    )

    // Prepare
    effectsDataList.push(
      _buildBaseAffliction('prepare', 'systems/demonlord08/assets/icons/effects/prepare.svg', [
        addEffect('data.bonuses.challenge.boons.strength', 1),
        addEffect('data.bonuses.challenge.boons.agility', 1),
        addEffect('data.bonuses.challenge.boons.intellect', 1),
        addEffect('data.bonuses.challenge.boons.will', 1),
        addEffect('data.bonuses.challenge.boons.perception', 1),
        addEffect('data.bonuses.attack.boons.strength', 1),
        addEffect('data.bonuses.attack.boons.agility', 1),
        addEffect('data.bonuses.attack.boons.intellect', 1),
        addEffect('data.bonuses.attack.boons.will', 1),
        addEffect('data.bonuses.attack.boons.perception', 1),
      ]),
    )

    // Reload
    effectsDataList.push(_buildBaseAffliction('reload', 'systems/demonlord08/assets/icons/effects/reload.svg'))

    // Retreat
    effectsDataList.push(_buildBaseAffliction('retreat', 'systems/demonlord08/assets/icons/effects/retreat.svg'))

    // Rush
    effectsDataList.push(_buildBaseAffliction('rush', 'systems/demonlord08/assets/icons/effects/rush.svg'))

    // Stabilize
    effectsDataList.push(_buildBaseAffliction('stabilize', 'systems/demonlord08/assets/icons/effects/stabilize.svg'))

    // ----------------------- DAMAGE EFFECTS -------------------------- //

    // Incapacitated
    effectsDataList.push(
      _buildBaseAffliction('incapacitated', 'systems/demonlord08/assets/icons/effects/incapacitated.svg'),
    )

    // Disabled
    effectsDataList.push(_buildBaseAffliction('disabled', 'systems/demonlord08/assets/icons/effects/disabled.svg'))

    // Dying
    effectsDataList.push(_buildBaseAffliction('dying', 'systems/demonlord08/assets/icons/effects/dying.svg'))

    return effectsDataList
  }
}
