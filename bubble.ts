import {DosEmulator, GameTools, DropJoystick, GamepadController, AsciiMapping} from '../../api/api.js'
import {buttons} from "./bubble-controls.js";
import {PixelListener} from "../../api/lib/PixelListener.js";
import {BUBBLE_DIGITS} from "./bubble-digits.js";
import {Ocr} from "../../api/lib/Ocr.js";

/**
 * ### BUBBLE ###
 * ---------------------
 *
 * Pass through global variables (from other script tags) and/or required DOM elements that the game needs to run
 * @param dos the JsDos "dos" element
 * @param canvasContainer the container in which JsDos can pop all it's elements (i.e. the DOS game canvas)
 * @param emulators a required DOSBox global variable
 * @param controlCanvas the canvas (overlay) that we created in order to display the DropJoystick over the game canvas
 * @param instructions the instructions "screen". Think DIV
 * @param loading the loading "screen". Think DIV
 * @param window the DOM window object
 */
export const runBubble = (dos:any, canvasContainer:HTMLDivElement, emulators:any, controlCanvas:HTMLCanvasElement, loading:HTMLElement, instructions:HTMLDivElement, window:Window) => {

    /*** Setup ***/
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
    let ocrScore:Ocr = new Ocr(startX, startY, charWidth, charHeight, charSpacing, numChars, thousandsSeparatorWidth, BUBBLE_DIGITS);


    /*** Setup and Start DOS Game ***/
    let dosGame = new DosEmulator(dos, canvasContainer, emulators);

    instructions.addEventListener('click', () => {
      instructions.style.display = 'none'
      loading.style.display = 'none'
//Start Game
        dosGame.start('/games/bubble/bubble.jsdos').then((_ci) => {
//Setup Joystick
            let joystick:DropJoystick = new DropJoystick(window, controlCanvas, buttons, dosGame);
//Resize Cnvas
            window.addEventListener("resize", () => joystick.resize());
//Watch Pixels
            let pixelListener: PixelListener = dosGame.getPixelListenerInstance();
            pixelListener.addWatch(153, 104);
//Query Screenshots 
      setInterval(() => {
        dosGame.getScreenshot().then((values) => {
          console.log(values);
        });
      },1000)
     

            // enum state {
            //   LOADING, 
            //   PLAYING,
            //   GAME_OVER,
            // }
            // let currentState = state.LOADING
      
            // setInterval(()=>{
            //   pixelListener.query().then((values) => {
            //     dosGame.getScreenshot().then((imageData) => {
            //       ocr.readDigits(imageData).then((time) => {
            //         if ( time == 0 ) {
            //           console.log('Game should be over');
            //           currentState = state.GAME_OVER
            //           window.parent.postMessage({ event: 'LEVEL-END'})
            //           //Submit Score & Reload
            //           dosGame.getScreenshot().then((imageData) => {
                        
            //           })
            //         } else {  
            //           console.log('play');
                      
            //         }
            //       })
            //     })
            //   })
            // },1000)
        });
    });
}
