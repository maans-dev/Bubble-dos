import {
  DosEmulator,
  GameTools,
  DropJoystick,
  GamepadController,
  AsciiMapping,
} from '../../api/api.js';
import { buttons } from './bubble-controls.js';
import { PixelListener } from '../../api/lib/PixelListener.js';
import { BUBBLE_DIGITS } from './bubble-digits.js';
import { Ocr } from '../../api/lib/Ocr.js';

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
export const runBubble = (
  dos: any,
  canvasContainer: HTMLDivElement,
  emulators: any,
  controlCanvas: HTMLCanvasElement,
  loading: HTMLElement,
  instructions: HTMLDivElement,
  window: Window
) => {

  GameTools.disableBrowserShortcuts();
  //Time ocr
  let startX = 153;
  let startY = 104;
  let charWidth = 7;
  let charHeight = 7;
  let charSpacing = 1;
  let numChars = 2;
  let thousandsSeparatorWidth = 1;

  let ocr: Ocr = new Ocr(
    startX,
    startY,
    charWidth,
    charHeight,
    charSpacing,
    numChars,
    thousandsSeparatorWidth,
    BUBBLE_DIGITS
  );

  //Score ocr
  let startXScore = 281;
  let startYScore = 72;
  let charWidthScore = 7;
  let charHeightScore = 7;
  let charSpacingScore = 1;
  let numCharsScore = 5;
  let thousandsSeparatorWidthScore = 1;

  let ocrScore: Ocr = new Ocr(
    startXScore,
    startYScore,
    charWidthScore,
    charHeightScore,
    charSpacingScore,
    numCharsScore,
    thousandsSeparatorWidthScore,
    BUBBLE_DIGITS
  );

  /*** Setup and Start DOS Game ***/
  let dosGame = new DosEmulator(dos, canvasContainer, emulators);
  instructions.addEventListener('click', () => {
    instructions.style.display = 'none';
    loading.style.display = 'none';
    //Start Game
    dosGame.start('/games/bubble/bubble.jsdos').then((_ci) => {
      //Setup Joystick
      let joystick: DropJoystick = new DropJoystick(
        window,
        controlCanvas,
        buttons,
        dosGame
      );
      //Resize Canvas
      window.addEventListener('resize', () => joystick.resize());
      //Watch Pixels
      let pixelListener: PixelListener = dosGame.getPixelListenerInstance();
      pixelListener.addWatch(142, 91);
      pixelListener.addWatch(154,108);
      pixelListener.addWatch(218,93)

      //Query for pixels
      // setInterval(() => {
      //   pixelListener.query().then((value) => {
      //     console.log('COLOUR: ', value);
      //   })
      // }, 1000)
      
      //Query Screenshots
        // setInterval(() => {
        //   dosGame.getScreenshot().then((values) => {
        //     console.log(values);
        //   });
        // },1000)

      
      enum state {
        LOADING,
        PLAYING,
        GAME_OVER,
      }

      let currentState = state.LOADING;

      let latestScore = 0;

      /*
        while playing, get score and store
        Once the end game countdown is detected -> submit the score and reload the page

      */

      //State Machine Logic
      setInterval(() => {
        pixelListener.query().then((values) => { 
        dosGame.getScreenshot().then((imageData) => {
          ocr.readDigits(imageData).then((time) => {

            if ((values[1] === '#00b600' && values[2] === '#00b600' || time == 0 )) {
              console.log('Game is Done, final score: ', latestScore);
              currentState = state.GAME_OVER;

              console.log(latestScore);
              
              //Submit Score & Reload
              window.postMessage(
                { event: 'LEVEL_END', score: latestScore, gameID: 'bubble' },
                '*'
              );
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            }
            
            else if (currentState == state.LOADING) {
              console.log('Loading');
              dosGame.pressAndReleaseKeySynch(AsciiMapping.N);
              // console.log('Pressing N');
              
              if( values[0] == '#920092') {
                dosGame.pressAndReleaseKey(AsciiMapping.ENTER)
                console.log('Pressing Enter');
                currentState = state.PLAYING
              }
              // setTimeout(() => {
              //   dosGame.pressAndReleaseKey(AsciiMapping.ENTER);
              //   console.log('Pressing Enter');

              //   currentState = state.PLAYING;
              // }, 10000);
            } 

            else if (currentState == state.PLAYING) {
              console.log('Playing');
              loading.style.display = 'none';
              dosGame.getScreenshot().then((Data) => {
                ocrScore.readDigits(Data).then((score) => {
                  console.log('Score Output: ', score);
                  latestScore = score
                })
                // console.log(
                //   'THIS IS THE IMAGE IT IS USING TO GET THE SCORE: ',
                //   imageData
                // );
                // ocrScore.readDigits(imageData).then((score) => {
                //   console.log('SCORE: ' + score);
                //   if (score != NaN) {
                //     latestScore = score;
                //   }
                // });
              });
            } 
            
            else {
              console.log('something else is happening');
            }

          });
        });
      })
      }, 1000);
    });
  });
};
