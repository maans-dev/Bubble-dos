import {GamepadControls, DropJoystickControls} from "../../api/lib/ControlTypes.js";
import {AsciiMapping} from "../../api/lib/AsciiMapping.js";
import {DosEmulatorImpl} from "../../api/lib/DosEmulatorImpl.js";
import {GamepadMapping} from "../../api/lib/GamepadMapping.js";

/**
 * ### BUBBLE-BOBBLE [CONTROLS] ###
 * --------------------------
 **
 * BUBBLE game controls (DropJoystick and ScreenControls)
 */
export const buttons:GamepadControls[] & DropJoystickControls[] = [
    {
        'name': 'Fire',
        'iconPath': './icons/fire.svg',
        'hexColour' : 0xff0000,
        'pressFunction': (dosGame) => dosGame.pressKey(AsciiMapping.ENTER, true),
        'releaseFunction': (dosGame) => dosGame.pressKey(AsciiMapping.ENTER, false),
        'gamepadButton': GamepadMapping.A
    },
    {
        'name': 'Left',
        'pressFunction': (dosGame:DosEmulatorImpl) => dosGame.pressKey(AsciiMapping.ARROW_LEFT, true),
        'releaseFunction': (dosGame:DosEmulatorImpl) => dosGame.pressKey(AsciiMapping.ARROW_LEFT, false),
        'gamepadButton': GamepadMapping.DPAD_LEFT
    },
    {
        'name': 'Right',
        'pressFunction': (dosGame:DosEmulatorImpl) => dosGame.pressKey(AsciiMapping.ARROW_RIGHT, true),
        'releaseFunction': (dosGame:DosEmulatorImpl) => dosGame.pressKey(AsciiMapping.ARROW_RIGHT, false),
        'gamepadButton': GamepadMapping.DPAD_RIGHT
    },
    {
        'name': 'Up',
        'pressFunction': (dosGame:DosEmulatorImpl) => dosGame.pressKey(AsciiMapping.ARROW_UP, true),
        'releaseFunction': (dosGame:DosEmulatorImpl) => dosGame.pressKey(AsciiMapping.ARROW_UP, false),
        'gamepadButton': GamepadMapping.DPAD_UP
    }, 
]
