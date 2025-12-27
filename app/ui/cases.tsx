'use client';
import { unstable_noStore } from 'next/cache';

import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useRef, useEffect, useState } from 'react';

import { cases, skins, blue, purple, pink, red, gold } from '@/public/data/revolution.js';

const BACKEND_SERVER_URL = process.env.NEXT_PUBLIC_CASES_API_SERVER_URL || 'http://localhost:3000/api/cases';

const SlotWindow = styled('div')({
  height: '288px',
  overflow: 'hidden',
  width: '100vw',
  display: 'flex'
});

const imagePixelHeight = 288;
const imagePixelWidth = 384;
const viewWidth = imagePixelWidth * 2;

const memoSine = {};
const sine = (x: number) => {
  if (x in memoSine) {
    return memoSine[x];
  } else {
    let sinVal = (Math.sin(3.3 * x + 4.6) + 0.999) / 1.99;
    memoSine[x] = sinVal;
    return sinVal;
  }
};

export default function Cases({ userBalance }) {
  unstable_noStore();

  const canvasRef = useRef(null);
  const lineCanvasRef = useRef(null);

  const [animationState, setAnimationState] = useState(0);

  const [caseWinner, setCaseWinner] = useState(null);
  console.log('starting user balance', userBalance);
  const [accountBalance, setAccountBalance] = useState(userBalance);
  const [globalAccountBalance, setGlobalAccountBalance] = useState(userBalance);
  const [newCaseWinner, setNewCaseWinner] = useState(null);
  const [isBlinking, setIsBlinking] = useState(0);

  const [spinsHistory, setSpinsHistory] = useState([]);

  let animationFrameId;

  let image1Position = 0;
  let image2Position = 384;
  let image3Position = 768;

  let image1DisplayImage = 0;
  let image2DisplayImage = 1;
  let image3DisplayImage = 2;

  const draw = (ctx, images, step, displacement, positionValues) => {
    // console.log('step', step);
    // console.log('displacement', displacement);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    image1Position = image1Position - step;
    image2Position = image2Position - step;
    image3Position = image3Position - step;

    // console.log(positionValues);

    if (step > 0) {
      if (image1Position < -imagePixelWidth) {
        let diff = -imagePixelWidth - image1Position; // How much further is it from the edge?
        image1Position = 768 - diff;
        image1DisplayImage = image1DisplayImage + 3;
      } else if (image2Position < -imagePixelWidth) {
        let diff = -imagePixelWidth - image2Position;
        image2Position = 768 - diff;
        image2DisplayImage = image2DisplayImage + 3;
      } else if (image3Position < -imagePixelWidth) {
        let diff = -imagePixelWidth - image3Position;
        image3Position = 768 - diff;
        image3DisplayImage = image3DisplayImage + 3;
      }
    } else {
      if (image1Position > viewWidth) {
        let diff = image1Position - viewWidth;
        image1Position = -imagePixelWidth + diff;
        image1DisplayImage = image1DisplayImage - 3;
      } else if (image2Position > viewWidth) {
        let diff = image2Position - viewWidth;
        image2Position = -imagePixelWidth + diff;
        image2DisplayImage = image2DisplayImage - 3;
      } else if (image3Position > viewWidth) {
        let diff = image3Position - viewWidth;
        image3Position = -imagePixelWidth + diff;
        image3DisplayImage = image3DisplayImage - 3;
      }
    }

    // This is where to start drawing
    let image1Image =
      images[
        positionValues[image1DisplayImage < 0 || image1DisplayImage >= positionValues.length ? 0 : image1DisplayImage]
      ]['canvasImage'];
    let image1FillStyle =
      images[
        positionValues[image1DisplayImage < 0 || image1DisplayImage >= positionValues.length ? 0 : image1DisplayImage]
      ]['fillStyle'];

    ctx.fillStyle = image1FillStyle;
    ctx.fillRect(image1Position, 0, imagePixelWidth, imagePixelHeight);
    ctx.strokeRect(image1Position, 0, imagePixelWidth, imagePixelHeight);
    ctx.drawImage(image1Image, image1Position, 0);

    let image2Image =
      images[
        positionValues[image2DisplayImage < 0 || image2DisplayImage >= positionValues.length ? 0 : image2DisplayImage]
      ]['canvasImage'];
    let image2FillStyle =
      images[
        positionValues[image2DisplayImage < 0 || image2DisplayImage >= positionValues.length ? 0 : image2DisplayImage]
      ]['fillStyle'];

    ctx.fillStyle = image2FillStyle;
    ctx.fillRect(image2Position, 0, imagePixelWidth, imagePixelHeight);
    ctx.strokeRect(image2Position, 0, imagePixelWidth, imagePixelHeight);
    ctx.drawImage(image2Image, image2Position, 0);

    let image3Image =
      images[
        positionValues[image3DisplayImage < 0 || image3DisplayImage >= positionValues.length ? 0 : image3DisplayImage]
      ]['canvasImage'];
    let image3FillStyle =
      images[
        positionValues[image3DisplayImage < 0 || image3DisplayImage >= positionValues.length ? 0 : image3DisplayImage]
      ]['fillStyle'];
    ctx.fillStyle = image3FillStyle;
    ctx.fillRect(image3Position, 0, imagePixelWidth, imagePixelHeight);
    ctx.strokeRect(image3Position, 0, imagePixelWidth, imagePixelHeight);
    ctx.drawImage(image3Image, image3Position, 0);
  };

  const lineDraw = ctx => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = 'black';
    const centerX = viewWidth / 2;
    // Start a new path
    ctx.beginPath();
    // Move to the starting point (top of the center)
    ctx.moveTo(centerX, 0);
    // Draw a line to the bottom of the canvas (same x, different y)
    ctx.lineTo(centerX, 288);
    // Draw the line
    ctx.stroke();
  };

  const animate = (ctx, frameCount, images, durationCounter, positionValues) => {
    if (frameCount > durationCounter) {
      setAnimationState(0);
      console.log('finished drawing');
      // update the winner values
      //   setNewAccountBalance(accountBalance);
      setGlobalAccountBalance(accountBalance);
      setNewCaseWinner(caseWinner);
      console.log('spinsHistory', spinsHistory);

      // Dont love modifying an object
      //   .slice(-1)[0]
      spinsHistory[spinsHistory.length - 1]['currentBalance'] = accountBalance;

      // skinsToAmount[caseWinner]
      spinsHistory[spinsHistory.length - 1]['winnings'] = 0 * 100;

      spinsHistory[spinsHistory.length - 1]['skin'] = caseWinner;

      setSpinsHistory(spinsHistory);

      setIsBlinking(0);
      return;
    }

    const displacement = (sine(frameCount / durationCounter) - sine(0)) * (36 * durationCounter);
    let step =
      frameCount !== 0
        ? displacement - (sine((frameCount - 1) / durationCounter) - sine(0)) * (36 * durationCounter)
        : displacement;

    draw(ctx, images, step, displacement, positionValues);

    animationFrameId = requestAnimationFrame(() => {
      animate(ctx, frameCount + 1, images, durationCounter, positionValues);
    });
  };

  useEffect(() => {
    const canvas = lineCanvasRef?.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    lineDraw(context);
  }, []);

  // setting up specific case on load
  useEffect(() => {
    const canvas = canvasRef?.current;
    if (!canvas) return;
    if (caseWinner == null) return;
    const context = canvas.getContext('2d');
    let frameCount = 0;

    //////////////////////

    let images = {};

    skins.forEach((skin, index) => {
      const skinImage = new Image();
      skinImage.src = skin.image.src;
      images[skin.name] = { canvasImage: skinImage, ...skin };
    });

    const durationCounter = 500;
    const durationCounterOffset = Math.floor(Math.random() * 100) * (Math.round(Math.random()) ? -1 : 1);

    if (animationState == 1) {
      let totalAnimateRefreshes = durationCounter + durationCounterOffset;
      let totalPixelsMoved = (sine(1) - sine(0)) * (36 * totalAnimateRefreshes);
      let winnerPosition = Math.floor(totalPixelsMoved / imagePixelWidth) + 1;
      let maximumImageMoved = winnerPosition + 3; // maximum

      let positionValues = Array(maximumImageMoved).fill(undefined);

      // skinsRandomizer
      const weights = x => {
        if (x < 0.75) {
          return 'blue';
        } else if (x >= 0.75 && x < 0.8) {
          return 'purple';
        } else if (x >= 0.8 && x < 0.82) {
          return 'pink';
        } else if (x >= 0.82 && x < 0.84) {
          return 'red';
        } else if (x >= 0.84 && x < 1) {
          return 'gold';
        }
      };
      positionValues = positionValues.map(() => {
        const color = weights(Math.random());
        if (color === 'blue') {
          return blue[Math.floor(Math.random() * blue.length)].name;
        }
        if (color === 'purple') {
          return purple[Math.floor(Math.random() * purple.length)].name;
        }
        if (color === 'pink') {
          return pink[Math.floor(Math.random() * pink.length)].name;
        }
        if (color === 'red') {
          return red[Math.floor(Math.random() * red.length)].name;
        } else if (color === 'gold') {
          return gold[Math.floor(Math.random() * gold.length)].name;
        }
      });

      positionValues[winnerPosition] = caseWinner;

      console.log('You won: ', caseWinner);
      // make API call to get winner?

      animate(context, frameCount, images, totalAnimateRefreshes, positionValues);
    } else if (animationState == 0) {
      console.log('calling animationState for 0');
    }

    return () => {
      console.log('unmounting or state update');
      cancelAnimationFrame(animationFrameId);
    };
  }, [animationState]);

  console.log(spinsHistory);

  return (
    <div>
      <style jsx>
        {`
          @keyframes blink {
            0% {
              opacity: 1;
            }
            50% {
              opacity: 0;
            }
            100% {
              opacity: 1;
            }
          }
        `}
      </style>
      <div style={{ display: 'flex' }}>
        <SlotWindow>
          <div
            id="reel1"
            // ref={yourRef}
            style={{
              width: `${viewWidth}px`,
              borderStyle: 'solid'
            }}
          >
            <canvas ref={canvasRef} width={imagePixelWidth * 2} height={288} style={{ position: 'absolute' }}></canvas>
            <canvas
              ref={lineCanvasRef}
              width={imagePixelWidth * 2}
              height={288}
              style={{ position: 'absolute' }}
            ></canvas>
          </div>
        </SlotWindow>
        <Box>
          <button
            onClick={() => {
              if (animationState == 1) {
                setAnimationState(0);
              }
              if (animationState == 0) {
                if (canvasRef == undefined || lineCanvasRef == undefined) {
                  return;
                }
                // reset states
                const costPerKey = 250; // cents

                setGlobalAccountBalance(accountBalance - costPerKey);

                setIsBlinking(1);

                spinsHistory.push({
                  previousBalance: accountBalance,
                  currentBalance: null,
                  spinCost: 500, // dollars
                  winnings: null, // cents
                  skin: null
                });
                setSpinsHistory(spinsHistory);

                // make network call
                fetch(BACKEND_SERVER_URL)
                  .then(response => response.json())
                  .then(json => {
                    console.log(json);
                    setCaseWinner(json['result']['name']);
                    setAccountBalance(json['accountBalance']);
                    // setPreviousAccountBalance(accountBalance);
                    setAnimationState(1);
                  })
                  .catch(e => console.error(e));
              }
            }}
          >
            Open case!
          </button>
          <p>Cost per key: $2.50</p>
        </Box>
      </div>
      <div>
        {globalAccountBalance ? (
          <div>
            Account balance:{' '}
            <span style={isBlinking ? { opacity: 1, animation: 'blink 1s ease-in-out infinite' } : { opacity: 1 }}>
              ${globalAccountBalance / 100}
            </span>
          </div>
        ) : (
          <></>
        )}
        <hr></hr>
        {spinsHistory
          .slice()
          .reverse()
          .map((spin, idx) => (
            <div key={`result_${idx}`}>
              <div>
                You won:{' '}
                <span
                  style={
                    isBlinking && idx == 0 ? { opacity: 1, animation: 'blink 1s ease-in-out infinite' } : { opacity: 1 }
                  }
                >
                  {spin['skin'] ? spin['skin'] : 'pending'}
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
