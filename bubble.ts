

import {DosEmulator, GameTools, DropJoystick, GamepadController, AsciiMapping} from '../../api/api.js'
import {buttons} from "./bubble-controls.js";
import {PixelListener} from "../../api/lib/PixelListener.js";
import {BUBBLE_DIGITS} from "./bubble-digits.js";
import {Ocr} from "../../api/lib/Ocr.js";

/* 
Bubble Logic
------------
End State
if( time = 0) {gameover}

Playing State
do nothing

Loading State
press N then press Enter
*/

/** 
 * ### BUBBLE-BOBBLE ###
 * Pass through global variables (from other script tags) and/or required DOM elements that the game needs to run
 * @param dos the JsDos "dos" element
 * @param canvasContainer the container in which JsDos can pop all it's elements (i.e. the DOS game canvas)
 * @param emulators a required DOSBox global variable
 * @param controlCanvas the canvas (overlay) that we created in order to display the DropJoystick over the game canvas
 * @param instructions the instructions "screen". Think DIV
 * @param loading the loading "screen". Think DIV
 * @param window the DOM window object
 */
//Setup
export const runBubble = (dos:any, canvasContainer:HTMLDivElement, emulators:any, controlCanvas:HTMLCanvasElement, loading:HTMLElement, instructions:HTMLDivElement, window:Window) => {
    GameTools.disableBrowserShortcuts();
//Time ocr
    let startX = 153;
    let startY = 104;
    let charWidth = 7; 
    let charHeight = 7; 
    let charSpacing = 1;
    let numChars = 2; 
    let thousandsSeparatorWidth = 2;
    let ocr:Ocr = new Ocr(startX, startY, charWidth, charHeight, charSpacing, numChars, thousandsSeparatorWidth, BUBBLE_DIGITS);
//Score ocr
    let startX2 = 281;
    let startY2 = 72;
    let charWidth2 = 7; 
    let charHeight2 = 7; 
    let charSpacing2= 1;
    let numChars2 = 5; 
    let thousandsSeparatorWidth2 = 2;
    let ocrScore:Ocr = new Ocr(startX2, startY2, charWidth2, charHeight2, charSpacing2, numChars2, thousandsSeparatorWidth2, BUBBLE_DIGITS);

    /*** Setup and Start DOS Game ***/
    let dosGame = new DosEmulator(dos, canvasContainer, emulators);
    instructions.addEventListener('click', () => {
      instructions.style.display = 'none'
      loading.style.display = 'none'
//Start Game
        dosGame.start('/games/bubble/bubble.jsdos').then((_ci) => {
//Setup Joystick
            let joystick:DropJoystick = new DropJoystick(window, controlCanvas, buttons, dosGame);
//Resize Canvas
            window.addEventListener("resize", () => joystick.resize());
//Watch Pixels
            let pixelListener: PixelListener = dosGame.getPixelListenerInstance();
            pixelListener.addWatch(153, 104);
//Query Screenshots 
    //   setInterval(() => {
    //     dosGame.getScreenshot().then((values) => {
    //       console.log(values);
    //     });
    //   },1000)
//State Machine Logic
            enum state {
              LOADING, 
              PLAYING,
              GAME_OVER,
            }
            let currentState = state.LOADING
      
            setInterval(()=>{
              pixelListener.query().then((values) => {
                dosGame.getScreenshot().then((imageData) => {
                  ocr.readDigits(imageData).then((time) => {

                    if ( time == 0 ) {
                      console.log('Game is Done');
                      currentState = state.GAME_OVER
                   
                      //Submit Score & Reload
                      dosGame.getScreenshot().then((imageData) => {
                        ocrScore.readDigits(imageData).then((score) => {
                            console.log('GAME OVER: ' + score);
                            window.postMessage( {event: 'LEVEL_END', score: score, gameID: 'bubble'}, '*')
                        })
                        setTimeout(() => {
                            window.location.reload()
                        }, 500)
                      })
                      window.location.reload()
                    } 
                    
                    else if (currentState == state.LOADING) {  
                      console.log('Loading');
                      dosGame.pressAndReleaseKeySynch(AsciiMapping.N);
                      console.log('Pressing N');
                      
                      setTimeout(() => {
                        dosGame.pressAndReleaseKey(AsciiMapping.ENTER);
                        console.log('Pressing Enter');
                        
                        currentState = state.PLAYING;
                      }, 1000)
                    }

                    else {
                        console.log('Playing');
                        loading.style.display = 'none'
                    }
                  })
                })
              })
            },1000)
        });
    });
}
